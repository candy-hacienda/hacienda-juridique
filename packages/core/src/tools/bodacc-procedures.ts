import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BodaccClient, type BodaccAnnonce } from "../sources/bodacc.js";
import { parseSirenInput, sirenInputErrorResult, SIREN_DESCRIPTION } from "./siren-input.js";
import { bodaccUnavailableResult } from "./bodacc-error.js";

const isOuverture = (a: BodaccAnnonce) => /^jugement d.ouverture/i.test(a.jugement?.famille ?? "");
const isAvisInitial = (a: BodaccAnnonce) => !/annulation|rectificatif/i.test(a.typeavis);

/**
 * Désigne l'avis d'ouverture parmi les annonces de la famille « Procédures
 * collectives ». L'avis le plus récent est souvent une clôture, un plan ou un
 * dépôt de l'état des créances : sa date de parution n'est PAS le point de
 * départ du délai de déclaration des créances.
 */
export function formatProceduresResult(annonces: BodaccAnnonce[]): string {
  // Tri explicite : le point de départ de la forclusion ne doit pas dépendre de l'ordre reçu.
  const ouvertures = annonces
    .filter((a) => isOuverture(a) && isAvisInitial(a))
    .sort((a, b) => b.dateparution.localeCompare(a.dateparution));
  const ouverture = ouvertures[0];
  const rectificatifs = annonces.filter((a) => isOuverture(a) && /rectificatif/i.test(a.typeavis));

  const avisOuverture = ouverture
    ? {
        id: ouverture.id,
        dateparution: ouverture.dateparution,
        nature: ouverture.jugement?.nature,
        date_jugement: ouverture.jugement?.date,
        tribunal: ouverture.tribunal,
        complement: ouverture.jugement?.complement,
      }
    : null;

  const notes: string[] = [];
  if (ouverture) {
    notes.push(
      `Avis d'ouverture : publié au BODACC le ${ouverture.dateparution} — c'est sa date de parution, et non celle de l'avis le plus récent, qui sert de point de départ du délai de déclaration des créances.`,
      "Le mandataire ou liquidateur désigné figure dans « complement » (texte du jugement).",
    );
    if (ouvertures.length > 1) {
      notes.push(
        `${ouvertures.length} avis d'ouverture publiés pour ce SIREN (nouvelle procédure ou conversion) : le plus récent est retenu, vérifier qu'il s'agit bien de la procédure visée [à vérifier].`,
      );
    }
    if (rectificatifs.length > 0) {
      notes.push(`${rectificatifs.length} avis rectificatif(s) d'un jugement d'ouverture : point de départ du délai [à vérifier].`);
    }
  } else if (annonces.length === 0) {
    notes.push("Aucune annonce de procédure collective publiée au BODACC pour ce SIREN.");
  } else {
    notes.push(
      "Aucun avis d'ouverture parmi les annonces publiées : point de départ du délai de déclaration [à vérifier] sur l'annonce BODACC du jugement d'ouverture. Ne pas utiliser la date d'un autre avis (clôture, plan, état des créances).",
    );
  }
  notes.push("Le champ « typeavis » (« Avis initial », « Avis rectificatif »…) ne donne PAS la nature de la procédure : lire « jugement.nature ».");

  const body = {
    avis_ouverture: avisOuverture,
    annonces: annonces.map(({ raw: _raw, ...annonce }) => annonce),
  };
  return `${notes.join("\n")}\n\n${JSON.stringify(body, null, 2)}`;
}

export function registerBodaccProcedures(server: McpServer): void {
  server.registerTool(
    "bodacc_procedures",
    {
      title: "Procédures collectives BODACC par SIREN",
      description:
        "Récupère uniquement les procédures collectives BODACC publiées pour un SIREN : sauvegarde, redressement judiciaire, liquidation, plans, jugements d'ouverture. Désigne l'avis d'ouverture (`avis_ouverture` : date de parution, nature, date du jugement, tribunal, mandataire dans `complement`). Pour chaque annonce, la nature de la procédure est dans `jugement.nature` (pas dans `typeavis`). Source publique BODACC OpenDataSoft sans authentification.",
      inputSchema: {
        siren: z.string().describe(SIREN_DESCRIPTION),
      },
    },
    async (args) => {
      const siren = parseSirenInput(args.siren);
      if (siren.kind !== "siren") return sirenInputErrorResult(siren);
      const client = new BodaccClient();
      let procedures: Awaited<ReturnType<typeof client.searchProcedures>>;
      try {
        procedures = await client.searchProcedures(siren.siren);
      } catch (err) {
        return bodaccUnavailableResult(err);
      }
      return {
        content: [
          {
            type: "text" as const,
            text: formatProceduresResult(procedures),
          },
        ],
      };
    },
  );
}
