/**
 * Dates pseudonymisées reçues par les outils de sources (Légifrance, Judilibre, EUR-Lex, BOFiP).
 *
 * En espace pseudonymisé (Hacienda Cowork, mode Safe), le modèle peut ne voir qu'un jeton
 * (`[DATE_1]`, `[DATE_D+30]`…) à la place d'une date du dossier. L'API le refuserait par une
 * erreur de format générique ; le modèle risquerait alors de relancer sans la date et de
 * présenter la version du jour comme celle applicable aux faits. On nomme le jeton pour ce
 * qu'il est, sans appel réseau (même logique que `siren-input.ts`).
 */

/** `version` : choisit la version d'un texte ; `filtre` : borne une période de recherche. */
export type DateRole = "version" | "filtre";

// Jetons basemind `[LABEL_N]`, anonymizer-legal `[DATE_N]` et dates relativisées `[DATE_D+N]`.
const TOKEN = /\[[A-Z][A-Z0-9_]*_(?:\d+|D[+-]\d+)\]/;

/** Schéma des dates strictes (Judilibre, EUR-Lex) : AAAA-MM-JJ, ou un jeton traité par le gestionnaire. */
export const ISO_DATE_OR_TOKEN = new RegExp(`^(?:\\d{4}-\\d{2}-\\d{2}|${TOKEN.source})$`, "u");

/** Résultat d'erreur si un champ de date contient un jeton ; `undefined` sinon. */
export function pseudonymizedDateResult(args: Record<string, unknown>, fields: Readonly<Record<string, DateRole>>) {
  for (const [field, role] of Object.entries(fields)) {
    const value = args[field];
    const token = typeof value === "string" ? TOKEN.exec(value)?.[0] : undefined;
    if (!token) continue;
    const text =
      role === "version"
        ? `Date pseudonymisée reçue (« ${token} ») pour « ${field} » : la version du texte applicable à cette date ` +
          "ne peut pas être demandée sans la date réelle, que seule la réhydratation par l'application peut fournir. " +
          `Aucun appel n'a été fait. Ne pas présenter la version en vigueur aujourd'hui comme celle applicable à la date du dossier : ` +
          `pour la consulter, relancer sans « ${field} », la désigner comme la version en vigueur à la date du jour et marquer ` +
          "`[à vérifier]` la version applicable à la date des faits ; ou demander la date à l'utilisateur."
        : `Date pseudonymisée reçue (« ${token} ») pour le filtre « ${field} » : la période ne peut pas être appliquée ` +
          "sans la date réelle. Aucun appel n'a été fait. Relancer sans ce filtre ou avec une période explicite (AAAA-MM-JJ) ; " +
          "ne pas présenter les résultats comme limités à la période du dossier, ni conclure à l'absence de résultat sur cette période.";
    return { isError: true as const, content: [{ type: "text" as const, text }] };
  }
  return undefined;
}
