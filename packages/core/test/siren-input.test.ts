import { afterEach, describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { parseSirenInput } from "../src/tools/siren-input.js";
import { registerBodaccProcedures } from "../src/tools/bodacc-procedures.js";
import { registerBodaccBySiren } from "../src/tools/bodacc-by-siren.js";
import { registerCompanyFullProfile } from "../src/tools/company-full-profile.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseSirenInput", () => {
  it("accepte 9 chiffres, avec ou sans espaces ou points", () => {
    expect(parseSirenInput("883536971")).toEqual({ kind: "siren", siren: "883536971" });
    expect(parseSirenInput("883 536 971")).toEqual({ kind: "siren", siren: "883536971" });
    expect(parseSirenInput(" 883.536.971 ")).toEqual({ kind: "siren", siren: "883536971" });
    expect(parseSirenInput("883 536 971")).toEqual({ kind: "siren", siren: "883536971" });
  });

  it("reconnaît un jeton de pseudonymisation", () => {
    expect(parseSirenInput("[TAX_ID_1]")).toMatchObject({ kind: "pseudonymized", token: "[TAX_ID_1]" });
    expect(parseSirenInput("[PHONE_NUMBER_0]")).toMatchObject({ kind: "pseudonymized" });
    expect(parseSirenInput("[ID_REG_2]")).toMatchObject({ kind: "pseudonymized" });
    expect(parseSirenInput("SIREN [TAX_ID_3]")).toMatchObject({ kind: "pseudonymized", token: "[TAX_ID_3]" });
  });

  it("refuse le reste en le disant", () => {
    expect(parseSirenInput("12345678")).toMatchObject({ kind: "invalid" });
    expect(parseSirenInput("88353697100015")).toMatchObject({ kind: "invalid" });
    expect(parseSirenInput("Company Alpha")).toMatchObject({ kind: "invalid" });
  });
});

function capture(register: (s: McpServer) => void) {
  let handler: ((args: Record<string, unknown>) => Promise<any>) | undefined;
  register({
    registerTool: (_n: string, _c: unknown, cb: typeof handler) => {
      handler = cb;
    },
  } as unknown as McpServer);
  return handler!;
}

describe("outils BODACC — identifiant pseudonymisé ou mal formé", () => {
  const tools = [
    ["bodacc_procedures", registerBodaccProcedures],
    ["bodacc_by_siren", registerBodaccBySiren],
    ["company_full_profile", registerCompanyFullProfile],
  ] as const;

  for (const [name, register] of tools) {
    it(`${name} : un jeton n'est jamais présenté comme une absence de procédure, sans appel réseau`, async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);
      const out = await capture(register)({ siren: "[TAX_ID_1]", limit: 5 });
      expect(out.isError).toBe(true);
      const text: string = out.content[0].text;
      expect(text).toMatch(/pseudonymis/i);
      expect(text).toContain("[TAX_ID_1]");
      expect(text).toMatch(/pas une absence de procédure/i);
      expect(text).toContain("[à vérifier]");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it(`${name} : un SIRET reçoit une consigne claire`, async () => {
      vi.stubGlobal("fetch", vi.fn());
      const out = await capture(register)({ siren: "88353697100015" });
      expect(out.isError).toBe(true);
      expect(out.content[0].text).toMatch(/9 premiers chiffres/);
    });
  }

  it("bodacc_procedures : un SIREN avec espaces est interrogé sous sa forme compacte", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      urls.push(url);
      return { ok: true, status: 200, json: async () => ({ results: [] }) };
    });
    const out = await capture(registerBodaccProcedures)({ siren: "883 536 971" });
    expect(out.isError).toBeUndefined();
    expect(new URL(urls[0]!).searchParams.get("where")).toContain("%883536971%");
  });
});
