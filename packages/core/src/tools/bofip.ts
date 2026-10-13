import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PisteHttpClient } from "../http.js";
import { ConsultCirculaireResponseSchema, SearchResponseSchema } from "../schemas.js";
import { formatSearchResultsAsMarkdown, normalizeLegiDate, summarizeSearchResponse } from "../format.js";
import { log } from "../logger.js";
import { buildSearchRequest } from "../search-builder.js";
import { pseudonymizedDateResult } from "./date-input.js";

export interface BofipRechercherArgs {
  query: string;
  pageSize?: number;
  pageNumber?: number;
  typeRecherche?: "UN_DES_MOTS" | "EXACTE" | "TOUS_LES_MOTS_DANS_UN_CHAMP";
  dateDebut?: string;
  dateFin?: string;
}

export interface BofipConsulterArgs {
  id: string;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Le fonds CIRC de Légifrance contient les circulaires et instructions ministérielles,
 * PAS la base BOFiP-Impôts (relevé en réel le 2026-10-06 : 0 fiche « BOI-… » sur 508
 * résultats). Les résultats ne doivent donc jamais être présentés comme du BOFiP.
 */
export const BOFIP_CAVEAT =
  "⚠️ Source : circulaires et instructions (fonds CIRC de Légifrance). Ce n'est pas la base BOFiP-Impôts : une fiche « BOI-… » n'y figure pas. " +
  "Toute doctrine fiscale citée comme BOFiP est `[à vérifier]` sur https://bofip.impots.gouv.fr — ne pas apposer le tag [BOFiP].";

export async function callBofipRechercher(http: PisteHttpClient, args: BofipRechercherArgs) {
  const body = buildSearchRequest({
    query: args.query,
    fond: "CIRC",
    pageNumber: args.pageNumber,
    pageSize: args.pageSize,
    typeRecherche: args.typeRecherche,
    dateDebut: args.dateDebut,
    dateFin: args.dateFin,
  });

  const raw = await http.post("/search", body);
  const parsed = SearchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    log.warn("bofip-rechercher: response shape unexpected", { issues: parsed.error.issues.slice(0, 5) });
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `Réponse Légifrance/BOFiP inattendue. Détail : ${parsed.error.message.slice(0, 300)}`,
        },
      ],
    };
  }

  const { total, hits } = summarizeSearchResponse(parsed.data);
  const markdown = formatSearchResultsAsMarkdown(total, hits, "BOFiP", args.query);
  return { content: [{ type: "text" as const, text: `${BOFIP_CAVEAT}\n\n${markdown}` }] };
}

export async function callBofipConsulter(http: PisteHttpClient, args: BofipConsulterArgs) {
  const raw = await http.post("/consult/circulaire", { id: args.id });
  const parsed = ConsultCirculaireResponseSchema.safeParse(raw);
  if (!parsed.success) {
    log.warn("bofip-consulter: response shape unexpected", { issues: parsed.error.issues.slice(0, 3) });
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `Réponse Légifrance/BOFiP inattendue : ${parsed.error.message.slice(0, 300)}`,
        },
      ],
    };
  }

  const c = parsed.data.circulaire;
  if (!c) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `Document CIRC/BOFiP introuvable (id "${args.id}"). Utilisez l'identifiant numérique retourné par bofip_rechercher.`,
        },
      ],
    };
  }

  const lines: string[] = [];
  lines.push(`# BOFiP — ${c.titre ?? "(sans titre)"}`);
  const meta: string[] = [];
  if (c.etat) meta.push(`État : ${c.etat}`);
  const dateOpp = normalizeLegiDate(c.dateOpposabilite);
  const dateSign = normalizeLegiDate(c.dateSignature ?? c.dateTexte);
  if (dateOpp) meta.push(`Opposable depuis ${dateOpp}`);
  if (dateSign) meta.push(`Date du document : ${dateSign}`);
  if (c.nor) meta.push(`NOR : ${c.nor}`);
  if (c.ministeresDeposants?.length) meta.push(`Ministère(s) : ${c.ministeresDeposants.join(", ")}`);
  if (meta.length) lines.push(`_${meta.join(" · ")}_\n`);

  if (c.motsCles?.length) lines.push(`**Mots-clés :** ${c.motsCles.join(", ")}\n`);
  if (c.resume) lines.push(`## Résumé\n${c.resume}\n`);
  if (c.texteHtml) {
    const text = htmlToText(c.texteHtml);
    lines.push("## Texte");
    lines.push(
      text.length > 6000
        ? `${text.slice(0, 6000)}\n...(tronqué - utilisez le lien Légifrance pour le texte intégral)`
        : text,
    );
    lines.push("");
  }
  lines.push(`Identifiant BOFiP : \`${args.id}\` · [Légifrance](https://www.legifrance.gouv.fr/circulaire/id/${args.id})`);

  return { content: [{ type: "text" as const, text: `${BOFIP_CAVEAT}\n\n${lines.join("\n")}` }] };
}

export function registerBofipAliases(server: McpServer, http: PisteHttpClient) {
  server.registerTool(
    "bofip_rechercher",
    {
      title: "Recherche BOFiP",
      description:
        "Recherche dans les circulaires et instructions (fonds CIRC de Légifrance). ATTENTION : ce n'est PAS la base BOFiP-Impôts (aucune fiche BOI-… n'y figure) ; toute doctrine fiscale reste `[à vérifier]` sur bofip.impots.gouv.fr.",
      inputSchema: {
        query: z.string().min(1).describe("Termes à rechercher dans la doctrine BOFiP."),
        pageSize: z.number().int().min(1).max(50).default(10).describe("Nombre de résultats (max 50)."),
        pageNumber: z.number().int().min(1).default(1),
        typeRecherche: z
          .enum(["UN_DES_MOTS", "EXACTE", "TOUS_LES_MOTS_DANS_UN_CHAMP"])
          .default("UN_DES_MOTS")
          .describe("Mode de match — UN_DES_MOTS (OR), TOUS_LES_MOTS_DANS_UN_CHAMP (AND), EXACTE (expression)."),
        dateDebut: z.string().optional().describe("Date de début (yyyy-mm-dd) pour filtrer par date de signature."),
        dateFin: z.string().optional().describe("Date de fin (yyyy-mm-dd)."),
      },
    },
    async (args) => pseudonymizedDateResult(args, { dateDebut: "filtre", dateFin: "filtre" }) ?? callBofipRechercher(http, args),
  );

  server.registerTool(
    "bofip_consulter",
    {
      title: "Consulter BOFiP",
      description:
        "Récupère une circulaire (fonds CIRC de Légifrance) par identifiant numérique retourné par `bofip_rechercher`. Ce n'est pas la base BOFiP-Impôts : doctrine fiscale à vérifier sur bofip.impots.gouv.fr.",
      inputSchema: {
        id: z.string().min(1).describe("Identifiant numérique retourné par `bofip_rechercher`."),
      },
    },
    (args) => callBofipConsulter(http, args),
  );
}
