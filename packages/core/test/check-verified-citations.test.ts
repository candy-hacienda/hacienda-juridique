import { describe, expect, it } from "vitest";

// @ts-expect-error — script d'éval en JavaScript pur, sans déclarations de types
import { findSuspects } from "../../../plugins/hacienda-droit-affaires/evals/check-verified-citations.mjs";

// Lignes réelles des traces de la relance A du 2026-10-14. Les articles listés
// comme non lus ou à vérifier ne doivent pas être signalés ; une étiquette
// « vérifié » posée sur un article non lu doit l'être.
const suspects = (line: string, lus: string[]) =>
  (findSuspects(line, new Set(lus)) as { num: string }[]).map((s) => s.num);

describe("check-verified-citations — faux positifs connus", () => {
  it("ignore les articles déclarés « non lus » après la mention de vérification", () => {
    const line =
      "Citations vérifiées : partiel (10 articles lus ; R.622-24, R.624-13, L.622-17, L.632-2, D.441-5 et art. 642 CPC non lus)";
    expect(suspects(line, [])).toEqual([]);
  });

  it("ignore les articles listés après « non lus, donc [à vérifier] : »", () => {
    const line =
      "> - **Sources :** BODACC ✓. Légifrance ✓. Pappers ✗, Judilibre ✗ (non interrogés). Articles lus dans cette session : L.622-24, L.622-26 et L.622-28 C.com. Articles cités non lus, donc `[à vérifier]` : L.631-14, L.622-17 et L.441-10 C.com. ; R.622-24 C.com. ; art. 642 CPC.";
    expect(suspects(line, ["L622-24", "L622-26", "L622-28"])).toEqual([]);
  });

  it("ignore les articles placés après « Tout le reste est [à vérifier] : »", () => {
    const line =
      "> - **Sources :** Légifrance ✓ (PISTE opérationnel). Articles lus dans cette session : C. civ. 1163, 1304 ; C. trav. L.2312-8. Tout le reste est `[à vérifier]` : C. civ. 1104 et 1130, C. trav. L.2312-37 et délais de consultation du CSE.";
    expect(suspects(line, ["1163", "1304", "L2312-8"])).toEqual([]);
  });

  it("ignore un article précédé de [connaissance modèle — à vérifier]", () => {
    const line =
      "Sources consultées : [Légifrance] (CPI L.111-1, L.131-3 ; C.civ. 1104, 1112-1), [connaissance modèle — à vérifier] (références Code de commerce, CPI L.113-9)";
    expect(suspects(line, ["L111-1", "L131-3", "1104", "1112-1"])).toEqual([]);
  });

  it("ignore un article déclaré introuvable", () => {
    const line =
      "> - **Fraîcheur :** **L.23-10-7 C. com. a changé** : la version lue, en vigueur depuis le 28 mai 2026, vise la consultation du CSE. L.23-10-8 est introuvable sous cette référence.";
    expect(suspects(line, ["L23-10-7"])).toEqual([]);
  });

  it("ignore la borne haute d'une plage d'articles", () => {
    const line =
      "**Fondement :** le régime de déclaration des créances (L.622-24 à L.622-33) s'y applique par renvoi de l'art. L.631-14 `[Légifrance]`.";
    expect(suspects(line, ["L622-24", "L631-14"])).toEqual([]);
  });

  it("ignore la borne basse d'une plage d'articles", () => {
    const line = "par renvoi de **L.631-14** `[Légifrance]`. L.631-14 renvoie à L.622-13 à L.622-33.";
    expect(suspects(line, ["L631-14"])).toEqual([]);
  });

  it("ignore les numéros de facture (F-1142, F-2025-1198)", () => {
    const line =
      "| Intérêts (art. 8 CGV) | Taux légal (arrêté `[Légifrance]`) : F-1142 : 43 j ; F-2025-1198 : 43 j | 502 € |";
    expect(suspects(line, [])).toEqual([]);
  });

  it("ignore un article dont la cellule voisine d'un tableau dit [à vérifier]", () => {
    const line = "| Légifrance ✓ | L.441-10 C.com. | [à vérifier] |";
    expect(suspects(line, [])).toEqual([]);
  });
});

describe("check-verified-citations — vrais défauts", () => {
  it("signale une étiquette [Légifrance] sur un article non lu (coquille L.626-26)", () => {
    const line = "Requête possible en relevé de forclusion (L.626-26 `[Légifrance]`) dans les six mois.";
    expect(suspects(line, ["L622-24", "L622-26"])).toEqual(["L626-26"]);
  });

  it("signale un article vérifié non lu même après une dénégation sur un autre article", () => {
    const line = "L.622-17 `[à vérifier]` ; L.622-21 `[Légifrance]` interdit les poursuites.";
    expect(suspects(line, [])).toEqual(["L622-21"]);
  });

  it("signale dans un tableau l'article étiqueté [Légifrance] malgré une autre ligne à vérifier", () => {
    const line = "| L.622-17 | [à vérifier] | L.622-21 | [Légifrance] |";
    expect(suspects(line, [])).toEqual(["L622-21"]);
  });

  it("signale un article listé comme lu qui ne l'a pas été", () => {
    const line = "Articles lus dans cette session (Légifrance ✓) : L.622-24, L.622-28.";
    expect(suspects(line, ["L622-24"])).toEqual(["L622-28"]);
  });
});
