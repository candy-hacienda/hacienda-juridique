/**
 * Lecture du SIREN passé aux outils BODACC / profil entreprise.
 *
 * En espace pseudonymisé (Hacienda Cowork, mode Safe), le modèle peut ne voir
 * qu'un jeton comme `[TAX_ID_1]` à la place du SIREN. Le refuser comme « SIREN
 * invalide » laisserait croire à une erreur de saisie, voire à l'absence de
 * procédure : on le nomme pour ce qu'il est. Le SIREN est aussi accepté sous
 * la forme où le BODACC l'affiche (« 883 536 971 »).
 */
export type SirenInput =
  | { kind: "siren"; siren: string }
  | { kind: "pseudonymized"; token: string }
  | { kind: "invalid"; value: string };

// Jetons des moteurs de pseudonymisation : basemind `[LABEL_N]`, anonymizer-legal `[ID_REG_N]`.
const TOKEN = /\[[A-Z][A-Z0-9_]*_\d+\]/;

export function parseSirenInput(raw: string): SirenInput {
  const token = TOKEN.exec(raw);
  if (token) return { kind: "pseudonymized", token: token[0] };
  const compact = raw.replace(/[\s.  ]/g, "");
  if (/^\d{9}$/.test(compact)) return { kind: "siren", siren: compact };
  return { kind: "invalid", value: raw.trim() };
}

/** Résultat d'outil quand l'entrée n'est pas un SIREN exploitable. */
export function sirenInputErrorResult(input: Exclude<SirenInput, { kind: "siren" }>) {
  const text =
    input.kind === "pseudonymized"
      ? `Identifiant pseudonymisé reçu (« ${input.token} ») au lieu d'un numéro SIREN : la consultation du BODACC ` +
        "exige le SIREN réel, que seule la réhydratation par l'application peut fournir. " +
        "Ce n'est pas une absence de procédure : ne pas conclure qu'aucune procédure collective n'est ouverte ; " +
        "marquer l'information `[à vérifier]` et demander le SIREN à l'utilisateur, ou vérifier sur bodacc.fr."
      : `SIREN invalide (« ${input.value} ») : 9 chiffres attendus (espaces tolérés). ` +
        "Un SIRET (14 chiffres) commence par le SIREN : utiliser ses 9 premiers chiffres.";
  return { isError: true as const, content: [{ type: "text" as const, text }] };
}

/** Schéma d'entrée commun : la validation fine est faite par `parseSirenInput`. */
export const SIREN_DESCRIPTION = "Numéro SIREN à 9 chiffres (espaces tolérés, ex. « 883 536 971 »)";
