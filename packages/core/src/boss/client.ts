import { request, type Dispatcher } from "undici";

export const BOSS_HOME_URL = "https://boss.gouv.fr/portail/accueil.html";
export const BOSS_ORIGIN = "https://boss.gouv.fr";
export const BOSS_USER_AGENT = "HaciendaSourcesOfficielles/0.1 (+https://boss.gouv.fr)";

const BOSS_ACCEPT_HEADER = "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5";
const BOSS_COMPAT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

export class BossUrlError extends Error {
  constructor(input: string) {
    super(`URL BOSS invalide: ${input}`);
    this.name = "BossUrlError";
  }
}

export class BossRobotsUnavailableError extends Error {
  constructor() {
    super("robots.txt BOSS indisponible");
    this.name = "BossRobotsUnavailableError";
  }
}

export class BossRobotsBlockedError extends Error {
  constructor(url: string) {
    super(`robots.txt BOSS bloque la lecture de ${url}`);
    this.name = "BossRobotsBlockedError";
  }
}

type RobotsRule = {
  kind: "allow" | "disallow";
  path: string;
};

type RobotsGroup = {
  userAgents: string[];
  rules: RobotsRule[];
};

export type BossRobotsGate = {
  canFetch(url: string): boolean;
};

export type BossTextResponse = {
  url: string;
  statusCode: number;
  contentType: string | undefined;
  text: string;
};

export type BossRequestOptions = {
  method?: "GET" | "POST";
  body?: string;
  contentType?: string;
};

export function assertBossUrl(input: string): URL {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new BossUrlError(input);
  }

  if (url.protocol !== "https:" || url.hostname !== "boss.gouv.fr") {
    throw new BossUrlError(input);
  }

  return url;
}

export function createBossRobotsGate(robotsUrl: string, body: string): BossRobotsGate {
  assertBossUrl(robotsUrl);

  if (body.trim().length === 0) {
    throw new BossRobotsUnavailableError();
  }

  const rules = selectBossRobotsRules(parseRobotsGroups(body));

  return {
    canFetch(urlInput: string): boolean {
      const url = assertBossUrl(urlInput);
      const path = url.pathname || "/";

      if (!rules) {
        return false;
      }

      if (rules.some((rule) => hasUnsupportedRobotsPattern(rule.path))) {
        return false;
      }

      const matchingRules = rules.filter((rule) => path.startsWith(rule.path));

      if (matchingRules.length === 0) {
        return true;
      }

      const bestRule = [...matchingRules].sort((a: RobotsRule, b: RobotsRule) => {
        const pathDelta = b.path.length - a.path.length;

        if (pathDelta !== 0) {
          return pathDelta;
        }

        return a.kind === "allow" ? -1 : 1;
      })[0]!;

      return bestRule.kind === "allow";
    },
  };
}

export async function fetchBossText(urlInput: string, options: BossRequestOptions = {}): Promise<BossTextResponse> {
  const url = assertBossUrl(urlInput);
  try {
    return await fetchBossTextWithDispatcher(url, options);
  } catch (error) {
    if (!isBossTransportFailure(error)) {
      throw error;
    }

    // boss.gouv.fr coupe la connexion (ECONNRESET) selon le User-Agent, pas pour une raison
    // de certificat : le nouvel essai change le User-Agent et garde la vérification TLS.
    return fetchBossTextWithDispatcher(url, options, undefined, BOSS_COMPAT_USER_AGENT);
  }
}

async function fetchBossTextWithDispatcher(
  url: URL,
  options: BossRequestOptions,
  dispatcher?: Dispatcher,
  userAgent = BOSS_USER_AGENT,
): Promise<BossTextResponse> {
  const response = await requestBossUrlWithDispatcher(url, options, dispatcher, userAgent);
  const text = await response.body.text();
  const contentType = headerToString(response.headers["content-type"]);

  return {
    url: url.href,
    statusCode: response.statusCode,
    contentType,
    text,
  };
}

export async function fetchBossDocumentWithRobots(urlInput: string, robotsBody: string): Promise<BossTextResponse> {
  const url = assertBossUrl(urlInput);
  const gate = createBossRobotsGate(`${BOSS_ORIGIN}/robots.txt`, robotsBody);

  if (!gate.canFetch(url.href)) {
    throw new BossRobotsBlockedError(url.href);
  }

  return fetchBossText(url.href);
}

function parseRobotsGroups(body: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let currentGroup: RobotsGroup | undefined;

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      currentGroup = undefined;
      continue;
    }

    if (trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const field = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const value = trimmed
      .slice(separatorIndex + 1)
      .split("#", 1)[0]!
      .trim();

    if (field === "user-agent") {
      if (!currentGroup || currentGroup.rules.length > 0) {
        currentGroup = { userAgents: [], rules: [] };
        groups.push(currentGroup);
      }

      currentGroup.userAgents.push(value);
      continue;
    }

    if (!currentGroup || value.length === 0) {
      continue;
    }

    if (field === "allow") {
      currentGroup.rules.push({ kind: "allow", path: value });
    }

    if (field === "disallow") {
      currentGroup.rules.push({ kind: "disallow", path: value });
    }
  }

  return groups;
}

function selectBossRobotsRules(groups: RobotsGroup[]): RobotsRule[] | undefined {
  const specificGroups = groups.filter((group) => group.userAgents.some(isBossUserAgentMatch));

  if (specificGroups.length > 0) {
    return specificGroups.flatMap((group) => group.rules);
  }

  const wildcardGroups = groups.filter((group) => group.userAgents.some((userAgent) => userAgent === "*"));

  if (wildcardGroups.length > 0) {
    return wildcardGroups.flatMap((group) => group.rules);
  }

  return undefined;
}

function isBossUserAgentMatch(userAgent: string): boolean {
  const expectedUserAgent = BOSS_USER_AGENT.toLowerCase();
  const expectedToken = expectedUserAgent.split(/[\/\s;]/)[0] ?? expectedUserAgent;
  const candidate = userAgent.toLowerCase();

  return candidate !== "*" && (expectedUserAgent.includes(candidate) || candidate.includes(expectedToken));
}

function hasUnsupportedRobotsPattern(path: string): boolean {
  return /[*$]/.test(path);
}

function requestBossUrlWithDispatcher(
  url: URL,
  options: BossRequestOptions,
  dispatcher?: Dispatcher,
  userAgent = BOSS_USER_AGENT,
) {
  const headers: Record<string, string> = {
    accept: BOSS_ACCEPT_HEADER,
    "accept-language": "fr-FR,fr;q=0.9",
    "user-agent": userAgent,
  };

  if (options.contentType) {
    headers["content-type"] = options.contentType;
  }

  return request(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body,
    bodyTimeout: 30_000,
    headersTimeout: 30_000,
    dispatcher,
  });
}

function isBossTransportFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  return /fetch failed|ECONNRESET|socket|TLS|certificate|CERT|self signed|expired/i.test(`${code} ${message}`);
}

function headerToString(header: string | string[] | undefined): string | undefined {
  if (Array.isArray(header)) {
    return header.join(", ");
  }

  return header;
}
