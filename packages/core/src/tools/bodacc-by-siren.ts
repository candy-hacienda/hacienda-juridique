import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BodaccClient } from "../sources/bodacc.js";
import { parseSirenInput, sirenInputErrorResult, SIREN_DESCRIPTION } from "./siren-input.js";
import { bodaccUnavailableResult } from "./bodacc-error.js";

export function registerBodaccBySiren(server: McpServer): void {
  server.registerTool(
    "bodacc_by_siren",
    {
      title: "Annonces BODACC par SIREN",
      description:
        "Récupère les annonces BODACC publiées pour un SIREN. Couvre immatriculations, modifications, radiations, procédures collectives. Source publique BODACC OpenDataSoft sans authentification.",
      inputSchema: {
        siren: z.string().describe(SIREN_DESCRIPTION),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Nombre max d'annonces à retourner (défaut 20, max 100)"),
      },
    },
    async (args) => {
      const siren = parseSirenInput(args.siren);
      if (siren.kind !== "siren") return sirenInputErrorResult(siren);
      const client = new BodaccClient();
      let annonces: Awaited<ReturnType<typeof client.searchBySiren>>;
      try {
        annonces = await client.searchBySiren(siren.siren, args.limit ?? 20);
      } catch (err) {
        return bodaccUnavailableResult(err);
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(annonces, null, 2),
          },
        ],
      };
    },
  );
}
