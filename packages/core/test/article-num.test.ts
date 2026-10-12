import { describe, it, expect } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PisteHttpClient, RequestOptions } from "../src/http.js";
import { normalizeArticleNum } from "../src/codes-legitext.js";
import { registerGetArticle } from "../src/tools/get-article.js";

function makeServerAndHttp(response: unknown) {
  let handler: ((args: Record<string, string>) => Promise<unknown>) | undefined;
  const server = {
    registerTool: (_name: string, _config: unknown, cb: typeof handler) => {
      handler = cb;
    },
  } as unknown as McpServer;
  const bodies: unknown[] = [];
  const optsSeen: (RequestOptions | undefined)[] = [];
  const http = {
    post: async (_path: string, body: unknown, opts?: RequestOptions) => {
      bodies.push(body);
      optsSeen.push(opts);
      return response;
    },
  } as unknown as PisteHttpClient;
  return { server, http, bodies, optsSeen, getHandler: () => handler! };
}

describe("legifrance_get_article", () => {
  it("envoie à Légifrance le numéro normalisé", async () => {
    // `{}` (sans `article`) déclenche le repli /search — voir
    // get-article-abroge-diff-fallback.test.ts pour ce repli. Ici on ne
    // vérifie que le premier appel (normalisation du numéro).
    const { server, http, bodies, getHandler } = makeServerAndHttp({});
    registerGetArticle(server, http);
    await getHandler()({ code: "code de commerce", num: "L. 611-3" });

    expect(bodies[0]).toEqual({ id: "LEGITEXT000005634379", num: "L611-3" });
  });

  it("envoie L441-10 (Code de commerce) inchangé — déjà au format attendu", async () => {
    const { server, http, bodies, getHandler } = makeServerAndHttp({});
    registerGetArticle(server, http);
    await getHandler()({ code: "Code de commerce", num: "L441-10" });

    expect(bodies[0]).toEqual({ id: "LEGITEXT000005634379", num: "L441-10" });
  });

  it("ne met pas en cache une réponse `article: null` (évite de figer un faux négatif)", async () => {
    const { server, http, optsSeen, getHandler } = makeServerAndHttp({ article: null });
    registerGetArticle(server, http);
    await getHandler()({ code: "Code de commerce", num: "L441-10" });

    const opts = optsSeen[0];
    expect(opts?.cacheable).toBeDefined();
    expect(opts!.cacheable!({ article: null })).toBe(false);
    expect(opts!.cacheable!({ article: { id: "LEGIARTI1" } })).toBe(true);
  });
});

describe("normalizeArticleNum", () => {
  it("laisse intact le format attendu par Légifrance", () => {
    expect(normalizeArticleNum("L611-3")).toBe("L611-3");
    expect(normalizeArticleNum("1240")).toBe("1240");
    expect(normalizeArticleNum("1231-5")).toBe("1231-5");
    expect(normalizeArticleNum("R631-1")).toBe("R631-1");
    // L441-10 (Code de commerce) : déjà au format canonique, ne doit pas être
    // altéré. « Article introuvable » sur ce numéro n'est donc pas causé par
    // normalizeArticleNum (voir interne/docs/handoff/latest.md, défaut serveur (b)).
    expect(normalizeArticleNum("L441-10")).toBe("L441-10");
    expect(normalizeArticleNum("L. 441-10")).toBe("L441-10");
  });

  it("retire point et espace après la lettre de partie (L. 611-3, L.611-3, L 611-3)", () => {
    expect(normalizeArticleNum("L. 611-3")).toBe("L611-3");
    expect(normalizeArticleNum("L.611-3")).toBe("L611-3");
    expect(normalizeArticleNum("L 611-3")).toBe("L611-3");
    expect(normalizeArticleNum("R. 631-1")).toBe("R631-1");
    expect(normalizeArticleNum("D. 123-4")).toBe("D123-4");
  });

  it("met la lettre de partie en majuscule et tolère les espaces autour", () => {
    expect(normalizeArticleNum("  l. 622-24 ")).toBe("L622-24");
  });

  it("gère les préfixes composés (LO, L.O.) et l'astérisque (R*)", () => {
    expect(normalizeArticleNum("LO. 141")).toBe("LO141");
    expect(normalizeArticleNum("L.O. 141")).toBe("LO141");
    expect(normalizeArticleNum("R* 123-1")).toBe("R*123-1");
  });

  it("retire un préfixe « article » / « art. »", () => {
    expect(normalizeArticleNum("article 1240")).toBe("1240");
    expect(normalizeArticleNum("Art. L. 442-1")).toBe("L442-1");
    expect(normalizeArticleNum("art L631-4")).toBe("L631-4");
  });
});
