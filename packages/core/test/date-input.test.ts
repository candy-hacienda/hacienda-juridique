import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { pseudonymizedDateResult } from "../src/tools/date-input.js";
import { registerRecherche } from "../src/tools/recherche.js";
import { registerGetCode } from "../src/tools/get-code.js";
import { registerGetLoda } from "../src/tools/get-loda.js";
import { registerJudilibreTools } from "../src/tools/judilibre.js";
import { registerEurlexTools } from "../src/tools/eurlex.js";
import { registerBofipAliases } from "../src/tools/bofip.js";
import { registerEspacenetSearch } from "../src/tools/espacenet-search.js";
import { registerInpiMarquesPublicationsRecentes } from "../src/tools/inpi-marques-publications-recentes.js";

type Handler = (args: Record<string, unknown>) => Promise<any>;
type Registered = { config: { inputSchema?: Record<string, z.ZodTypeAny> }; handler: Handler };

function captureAll(register: (s: McpServer) => void) {
  const tools = new Map<string, Registered>();
  register({
    registerTool: (name: string, config: Registered["config"], handler: Handler) => {
      tools.set(name, { config, handler });
    },
    // Ancienne forme `server.tool(nom, schéma, gestionnaire)` (outils PI).
    tool: (name: string, inputSchema: Record<string, z.ZodTypeAny>, handler: Handler) => {
      tools.set(name, { config: { inputSchema }, handler });
    },
  } as unknown as McpServer);
  return tools;
}

// Tout appel réseau ferait échouer le test : un jeton ne doit jamais partir vers une API.
const interdit = () => {
  throw new Error("appel réseau interdit");
};
const httpInterdit = { get: interdit, post: interdit } as never;
const clientInterdit = new Proxy({}, { get: () => interdit }) as never;

describe("pseudonymizedDateResult", () => {
  it("reconnaît les jetons basemind et anonymizer-legal, absolus et relatifs", () => {
    for (const token of ["[DATE_1]", "[DOCUMENT_DATE_2]", "[DATE_D+0]", "[DATE_D+30]", "[DATE_D-45]"]) {
      const result = pseudonymizedDateResult({ dateVersion: token }, { dateVersion: "version" });
      expect(result?.isError, token).toBe(true);
      expect(result?.content[0].text, token).toContain(token);
    }
  });

  it("laisse passer les vraies dates et les champs absents", () => {
    expect(pseudonymizedDateResult({ dateVersion: "2021-10-01" }, { dateVersion: "version" })).toBeUndefined();
    expect(pseudonymizedDateResult({}, { dateVersion: "version" })).toBeUndefined();
    expect(pseudonymizedDateResult({ query: "[ORG_1]" }, { dateVersion: "version" })).toBeUndefined();
  });

  it("date de version : interdit de présenter la version du jour comme applicable", () => {
    const text = pseudonymizedDateResult({ date: "[DATE_D+0]" }, { date: "version" })!.content[0].text;
    expect(text).toContain("version");
    expect(text).toContain("[à vérifier]");
    expect(text).toMatch(/aucun appel/i);
  });

  it("filtre de période : interdit de conclure à l'absence de résultat", () => {
    const text = pseudonymizedDateResult({ dateStart: "[DATE_2]" }, { dateStart: "filtre" })!.content[0].text;
    expect(text).toContain("dateStart");
    expect(text).toMatch(/absence de r[ée]sultat/);
    expect(text).toMatch(/aucun appel/i);
  });
});

describe("outils à date : un jeton reçoit un message clair, sans appel réseau", () => {
  const cas: Array<[string, () => Map<string, Registered>, Record<string, unknown>]> = [
    ["legifrance_recherche", () => captureAll((s) => registerRecherche(s, httpInterdit)), { query: "caution", fond: "CODE_DATE", code: "Code de commerce", dateVersion: "[DATE_D+0]" }],
    ["legifrance_rechercher", () => captureAll((s) => registerRecherche(s, httpInterdit)), { query: "caution", fond: "LODA_DATE", dateDebut: "[DATE_1]" }],
    ["legifrance_get_code", () => captureAll((s) => registerGetCode(s, httpInterdit)), { code: "Code de commerce", date: "[DATE_1]" }],
    ["legifrance_get_loda", () => captureAll((s) => registerGetLoda(s, httpInterdit)), { textId: "LEGITEXT000043794500", date: "[DATE_D+0]" }],
    ["judilibre_recherche", () => captureAll((s) => registerJudilibreTools(s, {} as never, clientInterdit)), { query: "caution", dateEnd: "[DATE_D+30]" }],
    ["eurlex_recherche", () => captureAll((s) => registerEurlexTools(s, clientInterdit)), { query: "insolvency", date_from: "[DATE_1]" }],
    ["eurlex_consolidated", () => captureAll((s) => registerEurlexTools(s, clientInterdit)), { celex_id: "32015R0848", date: "[DATE_D+0]", mode: "nearest" }],
    ["bofip_rechercher", () => captureAll((s) => registerBofipAliases(s, httpInterdit)), { query: "plus-value", dateFin: "[DATE_2]" }],
    ["espacenet_search", () => captureAll((s) => registerEspacenetSearch(s, clientInterdit)), { query: "batterie", datePublicationMin: "[DATE_1]" }],
    ["inpi_marques_publications_recentes", () => captureAll((s) => registerInpiMarquesPublicationsRecentes(s, clientInterdit)), { since: "[DATE_D-30]" }],
  ];

  for (const [name, register, args] of cas) {
    it(name, async () => {
      const tool = register().get(name)!;
      expect(tool, name).toBeDefined();
      // Le schéma d'entrée laisse passer le jeton jusqu'au gestionnaire…
      if (tool.config.inputSchema) expect(z.object(tool.config.inputSchema).safeParse(args).success).toBe(true);
      // …qui répond explicitement, sans appeler l'API.
      const result = await tool.handler(args);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/Date pseudonymisée reçue/);
    });
  }

  it("Judilibre, EUR-Lex et INPI refusent toujours une date mal formée", () => {
    const judilibre = captureAll((s) => registerJudilibreTools(s, {} as never, clientInterdit)).get("judilibre_recherche")!;
    const eurlex = captureAll((s) => registerEurlexTools(s, clientInterdit)).get("eurlex_recherche")!;
    expect(z.object(judilibre.config.inputSchema!).safeParse({ query: "x", dateStart: "15/03/2024" }).success).toBe(false);
    expect(z.object(eurlex.config.inputSchema!).safeParse({ query: "xyz", date_from: "2024" }).success).toBe(false);
    const inpi = captureAll((s) => registerInpiMarquesPublicationsRecentes(s, clientInterdit)).get("inpi_marques_publications_recentes")!;
    expect(z.object(inpi.config.inputSchema!).safeParse({ since: "15/03/2024" }).success).toBe(false);
  });
});
