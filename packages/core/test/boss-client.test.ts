import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MockAgent, setGlobalDispatcher } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  BOSS_HOME_URL,
  BOSS_USER_AGENT,
  BossRobotsBlockedError,
  BossRobotsUnavailableError,
  BossUrlError,
  assertBossUrl,
  createBossRobotsGate,
  fetchBossDocumentWithRobots,
  fetchBossText,
} from "../src/boss/client.js";

const fixturesDir = join(import.meta.dirname, "fixtures", "boss");
const robotsAllow = readFileSync(join(fixturesDir, "robots-allow.txt"), "utf8");
const robotsDisallow = readFileSync(join(fixturesDir, "robots-disallow.txt"), "utf8");

let mockAgent: MockAgent;

beforeEach(() => {
  mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
});

afterEach(async () => {
  await mockAgent.close();
});

describe("assertBossUrl", () => {
  it("accepts only https URLs on boss.gouv.fr", () => {
    expect(assertBossUrl(BOSS_HOME_URL).hostname).toBe("boss.gouv.fr");
    expect(() => assertBossUrl("http://boss.gouv.fr/portail/accueil.html")).toThrow(BossUrlError);
    expect(() => assertBossUrl("https://example.com/portail/accueil.html")).toThrow(BossUrlError);
    expect(() => assertBossUrl("https://www.boss.gouv.fr/portail/accueil.html")).toThrow(BossUrlError);
  });
});

describe("createBossRobotsGate", () => {
  it("allows BOSS documents when robots allows root", () => {
    const gate = createBossRobotsGate("https://boss.gouv.fr/robots.txt", robotsAllow);

    expect(gate.canFetch(BOSS_HOME_URL)).toBe(true);
  });

  it("blocks BOSS documents when robots disallows root", () => {
    const gate = createBossRobotsGate("https://boss.gouv.fr/robots.txt", robotsDisallow);

    expect(gate.canFetch(BOSS_HOME_URL)).toBe(false);
  });

  it("prefers BOSS user-agent rules over wildcard rules", () => {
    const gate = createBossRobotsGate(
      "https://boss.gouv.fr/robots.txt",
      ["User-agent: HaciendaSourcesOfficielles", "Disallow: /", "", "User-agent: *", "Allow: /"].join("\n"),
    );

    expect(gate.canFetch(BOSS_HOME_URL)).toBe(false);
  });

  it("merges matching user-agent groups conservatively", () => {
    const gate = createBossRobotsGate(
      "https://boss.gouv.fr/robots.txt",
      ["User-agent: HaciendaSourcesOfficielles", "Allow: /", "", "User-agent: HaciendaSourcesOfficielles", "Disallow: /portail"].join("\n"),
    );

    expect(gate.canFetch(BOSS_HOME_URL)).toBe(false);
  });

  it("fails closed for unsupported robots wildcards", () => {
    const gate = createBossRobotsGate("https://boss.gouv.fr/robots.txt", "User-agent: *\nDisallow: /portail/*/secret\n");

    expect(gate.canFetch(BOSS_HOME_URL)).toBe(false);
  });

  it("strips inline robots comments before matching rules", () => {
    const gate = createBossRobotsGate("https://boss.gouv.fr/robots.txt", "User-agent: *\nDisallow: /portail # blocked\n");

    expect(gate.canFetch(BOSS_HOME_URL)).toBe(false);
  });

  it("throws when robots body is blank", () => {
    expect(() => createBossRobotsGate("https://boss.gouv.fr/robots.txt", "  \n")).toThrow(BossRobotsUnavailableError);
  });
});

describe("fetchBossText", () => {
  it("fetches BOSS text with explicit headers", async () => {
    const pool = mockAgent.get("https://boss.gouv.fr");
    pool
      .intercept({
        method: "GET",
        path: "/portail/accueil.html",
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
          "user-agent": BOSS_USER_AGENT,
        },
      })
      .reply(200, "<html>BOSS</html>", { headers: { "content-type": "text/html; charset=utf-8" } });

    const response = await fetchBossText(BOSS_HOME_URL);

    expect(response).toEqual({
      url: BOSS_HOME_URL,
      statusCode: 200,
      contentType: "text/html; charset=utf-8",
      text: "<html>BOSS</html>",
    });
  });

  it("can submit the official BOSS search form as POST", async () => {
    const pool = mockAgent.get("https://boss.gouv.fr");
    pool
      .intercept({
        method: "POST",
        path: "/portail/accueil/resultats-de-votre-recherche.html",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": BOSS_USER_AGENT,
        },
        body: "src_terms%5B0%5D.term=avantages+en+nature",
      })
      .reply(200, "<html>Résultats</html>", { headers: { "content-type": "text/html; charset=utf-8" } });

    const response = await fetchBossText("https://boss.gouv.fr/portail/accueil/resultats-de-votre-recherche.html", {
      method: "POST",
      body: "src_terms%5B0%5D.term=avantages+en+nature",
      contentType: "application/x-www-form-urlencoded",
    });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Résultats");
  });
});

describe("fetchBossText : connexion coupée par boss.gouv.fr", () => {
  it("réessaie avec un User-Agent de navigateur, par le même client et sans couper la vérification TLS", async () => {
    // boss.gouv.fr coupe la connexion (ECONNRESET) selon le User-Agent ; le certificat est valide.
    // Le nouvel essai passe donc par le client par défaut (vérification du certificat incluse).
    const pool = mockAgent.get("https://boss.gouv.fr");
    pool
      .intercept({ method: "GET", path: "/portail/accueil.html", headers: { "user-agent": BOSS_USER_AGENT } })
      .replyWithError(Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" }));
    pool
      .intercept({
        method: "GET",
        path: "/portail/accueil.html",
        headers: { "user-agent": (ua: string) => ua.startsWith("Mozilla/5.0") },
      })
      .reply(200, "<html>BOSS</html>", { headers: { "content-type": "text/html; charset=utf-8" } });

    const response = await fetchBossText(BOSS_HOME_URL);

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("<html>BOSS</html>");
  });
});

describe("fetchBossDocumentWithRobots", () => {
  it("throws before fetching when robots blocks the document", async () => {
    await expect(fetchBossDocumentWithRobots(BOSS_HOME_URL, robotsDisallow)).rejects.toBeInstanceOf(BossRobotsBlockedError);
  });
});
