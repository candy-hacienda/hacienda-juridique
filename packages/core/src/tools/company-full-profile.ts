import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BodaccClient } from "../sources/bodacc.js";
import { parseSirenInput, sirenInputErrorResult, SIREN_DESCRIPTION } from "./siren-input.js";
import { bodaccUnavailableResult } from "./bodacc-error.js";
import { loadPappersCredentials } from "../config.js";

type PappersOutcome =
  | { status: "ok"; data: unknown }
  | { status: "not_configured" }
  | { status: "error"; reason: string };

/**
 * « Non configuré » (pas de clé) et « a échoué » (clé refusée, 5xx, réseau, délai) sont
 * deux situations différentes : ne jamais présenter la seconde comme la première.
 * La clé voyage dans l'URL : elle n'apparaît jamais dans la raison renvoyée.
 */
async function tryPappers(siren: string): Promise<PappersOutcome> {
  const creds = loadPappersCredentials();
  if (!creds) return { status: "not_configured" };
  try {
    const url = `https://api.pappers.fr/v2/entreprise?siren=${siren}&api_token=${creds.apiKey}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return { status: "error", reason: `HTTP ${res.status}` };
    return { status: "ok", data: await res.json() };
  } catch (err) {
    const reason = (err instanceof Error ? err.message : String(err)).split(creds.apiKey).join("***");
    return { status: "error", reason: reason.slice(0, 200) };
  }
}

export function registerCompanyFullProfile(server: McpServer): void {
  server.registerTool(
    "company_full_profile",
    {
      title: "Profil entreprise FR (Pappers + fallback BODACC)",
      description:
        "Récupère le profil complet d'une entreprise FR par SIREN. Essaie Pappers d'abord (riche : bilans, dirigeants, bénéficiaires effectifs) si la clé API est configurée, sinon fallback gratuit sur BODACC public (annonces uniquement). Indique la source dans la réponse.",
      inputSchema: {
        siren: z.string().describe(SIREN_DESCRIPTION),
      },
    },
    async (args) => {
      const siren = parseSirenInput(args.siren);
      if (siren.kind !== "siren") return sirenInputErrorResult(siren);
      const pappers = await tryPappers(siren.siren);
      if (pappers.status === "ok") {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { source: "pappers", data: pappers.data },
                null,
                2,
              ),
            },
          ],
        };
      }

      const bodaccClient = new BodaccClient();
      let annonces: Awaited<ReturnType<typeof bodaccClient.searchBySiren>>;
      try {
        annonces = await bodaccClient.searchBySiren(siren.siren);
      } catch (err) {
        return bodaccUnavailableResult(err);
      }
      if (annonces.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  source: "none",
                  message:
                    pappers.status === "error"
                      ? `Pappers a échoué (${pappers.reason}) et BODACC est sans résultat pour ce SIREN : l'absence de données n'est pas une absence d'informations [à vérifier].`
                      : "Aucune source disponible — Pappers non configuré et BODACC sans résultat pour ce SIREN.",
                  ...(pappers.status === "error" ? { pappers_erreur: pappers.reason } : {}),
                  siren: siren.siren,
                },
                null,
                2,
              ),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                source: "bodacc-public",
                message:
                  pappers.status === "error"
                    ? `Pappers a échoué (${pappers.reason}) — données via BODACC public uniquement (annonces, sans bilans ni dirigeants enrichis). Réessayer ou vérifier la clé Pappers [à vérifier].`
                    : "Pappers non configuré — données via BODACC public uniquement (annonces, sans bilans ni dirigeants enrichis).",
                ...(pappers.status === "error" ? { pappers_erreur: pappers.reason } : {}),
                siren: siren.siren,
                annonces,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
