import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { request } from "undici";
import { z } from "zod";
import { EurlexClient, SPARQL_ENDPOINT } from "../eurlex/client.js";
import { formatEurlexRelations, type EurlexRelationsQueryArgs } from "../eurlex/citations.js";
import { findNearestConsolidatedVersion, formatEurlexConsolidatedVersions } from "../eurlex/consolidated.js";
import { formatEurlexEurovocConcepts, type EurlexEurovocQueryArgs } from "../eurlex/eurovoc.js";
import { formatEurlexDocument, formatEurlexMetadata, formatEurlexSearchResults } from "../eurlex/format.js";
import { buildEurlexFormatCandidates, filterEurlexFormats, formatEurlexAvailableFormats } from "../eurlex/formats.js";
import { defaultEurlexStatusUnavailable, probeEurlexStatusFromResponses, type EurlexStatus } from "../eurlex/status.js";
import { formatEurlexLifecycle, mergeEurlexLifecycle } from "../eurlex/versions.js";
import type { EurlexLanguage } from "../eurlex/celex.js";
import type {
  EurlexConsolidatedVersion,
  EurlexDocumentFormat,
  EurlexEurovocConcept,
  EurlexMetadata,
  EurlexRelation,
  EurlexRelationKind,
  EurlexResourceType,
  EurlexSearchArgs,
  EurlexSearchResponse,
} from "../eurlex/types.js";
import { ISO_DATE_OR_TOKEN, pseudonymizedDateResult } from "./date-input.js";

export interface EurlexRechercheArgs {
  query: string;
  resource_type?: EurlexResourceType;
  language?: EurlexLanguage;
  limit?: number;
  date_from?: string;
  date_to?: string;
}

export interface EurlexConsulterArgs {
  celex_id: string;
  language?: EurlexLanguage;
  format?: "plain" | "xhtml";
  max_chars?: number;
}

export interface EurlexMetadataArgs {
  celex_id: string;
  language?: EurlexLanguage;
}

export interface EurlexConsolidatedArgs {
  celex_id: string;
  language?: EurlexLanguage;
  date?: string;
  mode?: "list" | "nearest" | "fetch";
  max_chars?: number;
}

export interface EurlexCitationsArgs {
  celex_id: string;
  relation?: EurlexRelationKind;
  direction?: "incoming" | "outgoing" | "both";
  language?: EurlexLanguage;
  limit?: number;
}

export interface EurlexEurovocArgs {
  celex_id?: string;
  concept_uri?: string;
  query?: string;
  language?: EurlexLanguage;
  limit?: number;
}

export interface EurlexVersionsArgs {
  celex_id: string;
  language?: EurlexLanguage;
  include_preparatory?: boolean;
}

export interface EurlexFormatsArgs {
  celex_id: string;
  language?: EurlexLanguage;
  format?: EurlexDocumentFormat;
}

export interface EurlexClientLike {
  search(args: EurlexSearchArgs): Promise<EurlexSearchResponse>;
  fetchDocument(celexId: string, language?: EurlexLanguage): Promise<string>;
  metadata(celexId: string, language?: EurlexLanguage): Promise<EurlexMetadata>;
  consolidatedVersions?(celexId: string, language?: EurlexLanguage): Promise<EurlexConsolidatedVersion[]>;
  relations?(args: EurlexRelationsQueryArgs): Promise<EurlexRelation[]>;
  eurovoc?(args: EurlexEurovocQueryArgs): Promise<EurlexEurovocConcept[]>;
}

export type EurlexProbe = () => Promise<EurlexStatus>;

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

export async function callEurlexStatus(probe: EurlexProbe) {
  try {
    return textResult(JSON.stringify(await probe(), null, 2));
  } catch (error) {
    return textResult(JSON.stringify(defaultEurlexStatusUnavailable(error), null, 2));
  }
}

export async function callEurlexRecherche(client: EurlexClientLike, args: EurlexRechercheArgs) {
  try {
    const response = await client.search({
      query: args.query,
      resourceType: args.resource_type ?? "any",
      language: args.language ?? "FRA",
      limit: args.limit ?? 10,
      dateFrom: args.date_from,
      dateTo: args.date_to,
    });

    return textResult(formatEurlexSearchResults(response.results, response.query, response.retrievedAt));
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la recherche", error), true);
  }
}

export async function callEurlexConsulter(client: EurlexClientLike, args: EurlexConsulterArgs) {
  try {
    const language = args.language ?? "FRA";
    const [body, metadata] = await Promise.all([
      client.fetchDocument(args.celex_id, language),
      client.metadata(args.celex_id, language).catch(() => undefined),
    ]);

    return textResult(
      formatEurlexDocument({
        celexId: args.celex_id,
        language,
        title: metadata?.title,
        body,
        retrievedAt: metadata?.retrievedAt ?? new Date().toISOString(),
        maxChars: args.max_chars ?? 20_000,
      }),
    );
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la consultation du document", error), true);
  }
}

export async function callEurlexMetadata(client: EurlexClientLike, args: EurlexMetadataArgs) {
  try {
    const metadata = await client.metadata(args.celex_id, args.language ?? "FRA");
    return textResult(formatEurlexMetadata(metadata));
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la lecture des métadonnées", error), true);
  }
}

export async function callEurlexConsolidated(client: EurlexClientLike, args: EurlexConsolidatedArgs) {
  try {
    const language = args.language ?? "FRA";
    const consolidatedVersions = requireClientMethod(client.consolidatedVersions, "consolidatedVersions");
    const versions = await consolidatedVersions.call(client, args.celex_id, language);
    const mode = args.mode ?? "list";

    if (mode === "fetch") {
      const selected = args.date ? findNearestConsolidatedVersion(versions, args.date) : versions.at(-1);
      if (!selected) {
        return textResult(formatEurlexConsolidatedVersions([], args.celex_id));
      }

      const body = await client.fetchDocument(selected.celexId, language);
      return textResult(
        formatEurlexDocument({
          celexId: selected.celexId,
          language,
          title: selected.title,
          body,
          retrievedAt: new Date().toISOString(),
          maxChars: args.max_chars ?? 20_000,
        }),
      );
    }

    if (mode === "nearest" && args.date) {
      const nearest = findNearestConsolidatedVersion(versions, args.date);
      return textResult(formatEurlexConsolidatedVersions(nearest ? [nearest] : [], args.celex_id));
    }

    return textResult(formatEurlexConsolidatedVersions(versions, args.celex_id));
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la lecture des consolidations", error), true);
  }
}

export async function callEurlexCitations(client: EurlexClientLike, args: EurlexCitationsArgs) {
  try {
    const relations = requireClientMethod(client.relations, "relations");
    const queryArgs: EurlexRelationsQueryArgs = {
      celexId: args.celex_id,
      direction: args.direction ?? "both",
      language: args.language ?? "FRA",
      limit: args.limit ?? 25,
      ...(args.relation ? { relation: args.relation } : {}),
    };

    return textResult(formatEurlexRelations(await relations.call(client, queryArgs), args.celex_id));
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la lecture des citations", error), true);
  }
}

export async function callEurlexEurovoc(client: EurlexClientLike, args: EurlexEurovocArgs) {
  try {
    const eurovoc = requireClientMethod(client.eurovoc, "eurovoc");
    const queryArgs: EurlexEurovocQueryArgs = {
      language: args.language ?? "FRA",
      limit: args.limit ?? 20,
      ...(args.celex_id ? { celexId: args.celex_id } : {}),
      ...(args.concept_uri ? { conceptUri: args.concept_uri } : {}),
      ...(args.query ? { query: args.query } : {}),
    };
    const subject = args.celex_id ?? args.concept_uri ?? args.query ?? "recherche";

    return textResult(formatEurlexEurovocConcepts(await eurovoc.call(client, queryArgs), subject));
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la lecture EuroVoc", error), true);
  }
}

export async function callEurlexVersions(client: EurlexClientLike, args: EurlexVersionsArgs) {
  try {
    const language = args.language ?? "FRA";
    const consolidatedVersions = requireClientMethod(client.consolidatedVersions, "consolidatedVersions");
    const relations = requireClientMethod(client.relations, "relations");
    const [consolidations, related] = await Promise.all([
      consolidatedVersions.call(client, args.celex_id, language),
      relations.call(client, { celexId: args.celex_id, direction: "both", language, limit: 50 }),
    ]);

    return textResult(
      formatEurlexLifecycle(
        mergeEurlexLifecycle({
          celexId: args.celex_id,
          language,
          consolidations,
          relations: related,
        }),
      ),
    );
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la lecture du cycle de vie", error), true);
  }
}

export async function callEurlexFormats(args: EurlexFormatsArgs) {
  try {
    const language = args.language ?? "FRA";
    const formats = filterEurlexFormats(buildEurlexFormatCandidates(args.celex_id, language), {
      language,
      ...(args.format ? { format: args.format } : {}),
    });

    return textResult(formatEurlexAvailableFormats(formats, args.celex_id));
  } catch (error) {
    return textResult(errorMessage("Erreur EUR-Lex pendant la lecture des formats", error), true);
  }
}

export function registerEurlexTools(server: McpServer, client: EurlexClientLike = new EurlexClient()) {
  server.registerTool(
    "eurlex_status",
    {
      title: "État de la connexion EUR-Lex",
      description: "Diagnostic de disponibilité EUR-Lex / Publications Office, incluant SPARQL et consultation CELEX.",
      inputSchema: z.object({}).shape,
    },
    () => callEurlexStatus(liveEurlexProbe),
  );

  server.registerTool(
    "eurlex_recherche",
    {
      title: "Recherche EUR-Lex",
      description: "Recherche dans EUR-Lex via le SPARQL endpoint du Publications Office et retourne les documents CELEX pertinents.",
      inputSchema: {
        query: z.string().min(3).max(500).describe("Termes à rechercher dans EUR-Lex."),
        resource_type: z.enum(["any", "regulation", "directive", "decision", "case-law"]).default("any"),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
        limit: z.number().int().min(1).max(50).default(10),
        date_from: z.string().regex(ISO_DATE_OR_TOKEN).optional(),
        date_to: z.string().regex(ISO_DATE_OR_TOKEN).optional(),
      },
    },
    async (args) => pseudonymizedDateResult(args, { date_from: "filtre", date_to: "filtre" }) ?? callEurlexRecherche(client, args),
  );

  server.registerTool(
    "eurlex_consulter",
    {
      title: "Consulter un document EUR-Lex",
      description: "Récupère un document EUR-Lex par identifiant CELEX et retourne un document Markdown lisible.",
      inputSchema: {
        celex_id: z.string().min(5).describe("Identifiant CELEX, par exemple 32016R0679."),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
        format: z.enum(["plain", "xhtml"]).default("plain"),
        max_chars: z.number().int().min(1000).max(50_000).default(20_000),
      },
    },
    (args) => callEurlexConsulter(client, args),
  );

  server.registerTool(
    "eurlex_metadata",
    {
      title: "Métadonnées EUR-Lex",
      description: "Récupère les métadonnées d'un document EUR-Lex par identifiant CELEX.",
      inputSchema: {
        celex_id: z.string().min(5).describe("Identifiant CELEX, par exemple 32016R0679."),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
      },
    },
    (args) => callEurlexMetadata(client, args),
  );

  server.registerTool(
    "eurlex_consolidated",
    {
      title: "Versions consolidées EUR-Lex",
      description: "Liste, sélectionne ou consulte les versions consolidées d'un acte EUR-Lex par CELEX.",
      inputSchema: {
        celex_id: z.string().min(5).describe("Identifiant CELEX de l'acte initial, par exemple 32016R0679."),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
        date: z.string().regex(ISO_DATE_OR_TOKEN).optional(),
        mode: z.enum(["list", "nearest", "fetch"]).default("list"),
        max_chars: z.number().int().min(1000).max(50_000).default(20_000),
      },
    },
    async (args) => pseudonymizedDateResult(args, { date: "version" }) ?? callEurlexConsolidated(client, args),
  );

  server.registerTool(
    "eurlex_citations",
    {
      title: "Relations et citations EUR-Lex",
      description: "Recherche les relations juridiques EUR-Lex: modifie, modifié par, cite, cité par, abroge, base juridique.",
      inputSchema: {
        celex_id: z.string().min(5).describe("Identifiant CELEX pivot, par exemple 32016R0679."),
        relation: z.enum(["amends", "amended_by", "cites", "cited_by", "repeals", "repealed_by", "basis"]).optional(),
        direction: z.enum(["incoming", "outgoing", "both"]).default("both"),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
        limit: z.number().int().min(1).max(100).default(25),
      },
    },
    (args) => callEurlexCitations(client, args),
  );

  server.registerTool(
    "eurlex_eurovoc",
    {
      title: "Concepts EuroVoc EUR-Lex",
      description: "Retourne les concepts EuroVoc liés à un CELEX, une URI EuroVoc ou une requête libellé.",
      inputSchema: {
        celex_id: z.string().min(5).optional(),
        concept_uri: z.string().url().optional(),
        query: z.string().min(2).max(200).optional(),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
        limit: z.number().int().min(1).max(50).default(20),
      },
    },
    (args) => callEurlexEurovoc(client, args),
  );

  server.registerTool(
    "eurlex_versions",
    {
      title: "Cycle de vie EUR-Lex",
      description: "Construit une vue de cycle de vie d'un acte EUR-Lex avec acte initial, consolidations et relations.",
      inputSchema: {
        celex_id: z.string().min(5).describe("Identifiant CELEX, par exemple 32016R0679."),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
        include_preparatory: z.boolean().default(false),
      },
    },
    (args) => callEurlexVersions(client, args),
  );

  server.registerTool(
    "eurlex_formats",
    {
      title: "Formats disponibles EUR-Lex",
      description: "Retourne les URL candidates pour les formats HTML, XHTML, XML, PDF, RDF et texte d'un document EUR-Lex.",
      inputSchema: {
        celex_id: z.string().min(5).describe("Identifiant CELEX, par exemple 32016R0679."),
        language: z.enum(["FRA", "ENG", "DEU"]).default("FRA"),
        format: z.enum(["html", "xhtml", "xml", "pdf", "rdf", "txt"]).optional(),
      },
    },
    (args) => callEurlexFormats(args),
  );
}

function requireClientMethod<T>(method: T | undefined, name: string): T {
  if (!method) {
    throw new Error(`Client EUR-Lex incomplet: méthode ${name} indisponible.`);
  }

  return method;
}

async function liveEurlexProbe(): Promise<EurlexStatus> {
  try {
    const [sparql, cellar] = await Promise.allSettled([
      request(`${SPARQL_ENDPOINT}?query=${encodeURIComponent("ASK {}")}&format=application/sparql-results+json`, {
        method: "GET",
        headersTimeout: 10_000,
        bodyTimeout: 10_000,
      }),
      request("https://publications.europa.eu/resource/celex/32016R0679", {
        method: "GET",
        headersTimeout: 10_000,
        bodyTimeout: 10_000,
      }),
    ]);

    const sparqlProbe =
      sparql.status === "fulfilled"
        ? { statusCode: sparql.value.statusCode }
        : { error: sparql.reason instanceof Error ? sparql.reason.message : String(sparql.reason) };
    const cellarProbe =
      cellar.status === "fulfilled"
        ? { statusCode: cellar.value.statusCode, contentType: headerToString(cellar.value.headers["content-type"]) }
        : { error: cellar.reason instanceof Error ? cellar.reason.message : String(cellar.reason) };

    if (sparql.status === "fulfilled") {
      await sparql.value.body.text();
    }
    if (cellar.status === "fulfilled") {
      await cellar.value.body.text();
    }

    return probeEurlexStatusFromResponses({ sparql: sparqlProbe, cellar: cellarProbe });
  } catch (error) {
    return defaultEurlexStatusUnavailable(error);
  }
}

function headerToString(header: string | string[] | undefined): string | undefined {
  return Array.isArray(header) ? header.join(", ") : header;
}
