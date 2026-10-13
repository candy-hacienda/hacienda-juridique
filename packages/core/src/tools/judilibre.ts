import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JudilibreClient } from "../judilibre/client.js";
import type { JudilibreConfig } from "../judilibre/config.js";
import { formatJudilibreDecision, formatJudilibreSearch } from "../judilibre/format.js";
import { ISO_DATE_OR_TOKEN, pseudonymizedDateResult } from "./date-input.js";

export interface JudilibreRechercheArgs {
  query: string;
  pageSize?: number;
  page?: number;
  chamber?: string;
  jurisdiction?: string;
  publication?: string;
  dateStart?: string;
  dateEnd?: string;
}

/** Valeurs réelles de la taxonomie Judilibre (`/taxonomy`), relevées le 2026-10-06. */
const CHAMBERS = ["pl", "mi", "civ1", "civ2", "civ3", "comm", "soc", "cr", "creun", "ordo", "allciv", "other"] as const;
const JURISDICTIONS = ["cc", "ca", "tj", "tcom"] as const;
const PUBLICATIONS = ["b", "r", "l", "c", "n"] as const;
const isoDate = z.string().regex(ISO_DATE_OR_TOKEN, "Date au format AAAA-MM-JJ");

export interface JudilibreGetDecisionArgs {
  id: string;
}

function textResult(text: string, isError?: true) {
  return {
    ...(isError ? { isError } : {}),
    content: [{ type: "text" as const, text }],
  };
}

function errorMessage(prefix: string, error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  return `${prefix} : ${detail.slice(0, 500)}`;
}

export function callJudilibreStatus(config: JudilibreConfig) {
  const result = {
    env: config.env,
    baseUrl: config.baseUrl,
    hasKeyId: Boolean(config.keyId),
    keySource: config.keySource,
    diagnostic: config.keyId
      ? "Configuration Judilibre présente. Utilisez judilibre_recherche pour tester un appel API."
      : "Credentials Judilibre manquants. Définissez JUDILIBRE_KEY_ID ou PISTE_KEY_ID.",
  };

  return textResult(JSON.stringify(result, null, 2));
}

export async function callJudilibreRecherche(client: JudilibreClient, args: JudilibreRechercheArgs) {
  try {
    const response = await client.search({
      query: args.query,
      pageSize: args.pageSize,
      page: args.page,
      chamber: args.chamber,
      jurisdiction: args.jurisdiction,
      publication: args.publication,
      dateStart: args.dateStart,
      dateEnd: args.dateEnd,
    });
    return textResult(formatJudilibreSearch(response, args.query));
  } catch (error) {
    return textResult(errorMessage("Erreur Judilibre pendant la recherche", error), true);
  }
}

export async function callJudilibreGetDecision(client: JudilibreClient, args: JudilibreGetDecisionArgs) {
  try {
    const decision = await client.getDecision(args.id);
    return textResult(formatJudilibreDecision(decision, args.id));
  } catch (error) {
    return textResult(errorMessage("Erreur Judilibre pendant la consultation de décision", error), true);
  }
}

export function registerJudilibreTools(
  server: McpServer,
  config: JudilibreConfig,
  client = new JudilibreClient(config),
) {
  server.registerTool(
    "judilibre_status",
    {
      title: "État de la connexion Judilibre",
      description:
        "Diagnostic local de la configuration Judilibre/PISTE pour la jurisprudence judiciaire. Ne révèle jamais la clé complète.",
      inputSchema: z.object({}).shape,
    },
    () => callJudilibreStatus(config),
  );

  server.registerTool(
    "judilibre_recherche",
    {
      title: "Recherche Judilibre",
      description:
        "Recherche des décisions judiciaires dans Judilibre (Cour de cassation) et retourne des résultats Markdown avec date, chambre, numéro, solution et liens officiels. Filtres optionnels : chambre (ex. `comm` = chambre commerciale), juridiction, publication, période (`dateStart`/`dateEnd`, date de décision).",
      inputSchema: {
        query: z.string().min(1).describe("Termes à rechercher dans Judilibre."),
        pageSize: z.number().int().min(1).max(50).default(10).describe("Nombre de résultats (max 50)."),
        page: z.number().int().min(0).optional().describe("Page de résultats Judilibre."),
        chamber: z
          .enum(CHAMBERS)
          .optional()
          .describe(
            "Chambre : comm (commerciale), civ1/civ2/civ3 (civiles), soc (sociale), cr (criminelle), mi (mixte), pl (assemblée plénière).",
          ),
        jurisdiction: z.enum(JURISDICTIONS).optional().describe("Juridiction : cc (Cour de cassation, défaut de l'API), ca, tj, tcom."),
        publication: z
          .enum(PUBLICATIONS)
          .optional()
          .describe("Niveau de publication : b (Bulletin), r (Rapport), l (Lettre de chambre), c (communiqué), n (non publié)."),
        dateStart: isoDate.optional().describe("Décisions rendues à partir de cette date (AAAA-MM-JJ)."),
        dateEnd: isoDate.optional().describe("Décisions rendues jusqu'à cette date (AAAA-MM-JJ)."),
      },
    },
    async (args) => pseudonymizedDateResult(args, { dateStart: "filtre", dateEnd: "filtre" }) ?? callJudilibreRecherche(client, args),
  );

  server.registerTool(
    "judilibre_get_decision",
    {
      title: "Consulter une décision Judilibre",
      description:
        "Récupère une décision Judilibre par identifiant et retourne un document Markdown lisible avec lien Cour de cassation.",
      inputSchema: {
        id: z.string().min(1).describe("Identifiant Judilibre de la décision."),
      },
    },
    (args) => callJudilibreGetDecision(client, args),
  );
}
