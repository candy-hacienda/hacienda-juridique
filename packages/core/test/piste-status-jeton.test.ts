import { MockAgent, setGlobalDispatcher } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Config } from "../src/config.js";
import { registerStatus } from "../src/tools/status.js";

const OAUTH_URL = "https://oauth.piste.test/api/oauth/token";
const JETON = "eyJhbGciOiJSUzI1NiJ9.JETON-SECRET-A-NE-JAMAIS-AFFICHER";

let mockAgent: MockAgent;

beforeEach(() => {
  mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
});

afterEach(async () => {
  await mockAgent.close();
});

async function appelerPisteStatus(): Promise<string> {
  let handler: (() => Promise<{ content: { text: string }[] }>) | undefined;
  const config = {
    env: "sandbox",
    oauthTokenUrl: OAUTH_URL,
    apiBaseUrl: "https://api.piste.test",
    cacheDir: "/tmp/cache",
    clientId: "client-id-123456",
    clientSecret: "secret",
    credentialsSource: "env",
  } as unknown as Config;
  registerStatus({ registerTool: (_n: string, _c: unknown, cb: typeof handler) => { handler = cb; } } as never, config);
  const result = await handler!();
  return result.content[0]!.text;
}

describe("piste_status : jeton OAuth", () => {
  it("n'affiche jamais le jeton d'accès quand l'OAuth réussit", async () => {
    mockAgent
      .get("https://oauth.piste.test")
      .intercept({ method: "POST", path: "/api/oauth/token" })
      .reply(200, JSON.stringify({ access_token: JETON, token_type: "Bearer", expires_in: 3600, scope: "openid" }));

    const texte = await appelerPisteStatus();

    expect(texte).not.toContain(JETON);
    expect(texte).not.toContain("JETON-SECRET");
    expect(JSON.parse(texte).oauth).toMatchObject({ status: 200, ok: true });
  });

  it("garde le début de la réponse d'erreur, utile au diagnostic", async () => {
    mockAgent
      .get("https://oauth.piste.test")
      .intercept({ method: "POST", path: "/api/oauth/token" })
      .reply(400, JSON.stringify({ error: "invalid_client" }));

    const texte = await appelerPisteStatus();

    expect(JSON.parse(texte).oauth.bodyPreview).toContain("invalid_client");
  });
});
