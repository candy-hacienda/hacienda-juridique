import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const LEVELS = ["debug", "info", "warn", "error"] as const;

describe("logger", () => {
  const originalLogLevel = process.env.LOG_LEVEL;
  beforeEach(() => {
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalLogLevel === undefined) delete process.env.LOG_LEVEL;
    else process.env.LOG_LEVEL = originalLogLevel;
  });
  // minLevel est lu à l'import : recharger le module après changement d'env.
  async function loadLogger(level?: string) {
    if (level === undefined) delete process.env.LOG_LEVEL;
    else process.env.LOG_LEVEL = level;
    vi.resetModules();
    return await import("../src/logger.js");
  }
  const lines = () => vi.mocked(process.stderr.write).mock.calls.map((c) => String(c[0]));

  it("LOG_LEVEL=debug : les 4 niveaux écrivent une ligne JSON sur stderr", async () => {
    const { log } = await loadLogger("debug");
    for (const level of LEVELS) log[level]("msg");
    const out = lines();
    expect(out).toHaveLength(4);
    out.forEach((line, i) => {
      const p = JSON.parse(line);
      expect([line.endsWith("\n"), p.level, p.msg, new Date(p.ts).toISOString()]).toEqual([true, LEVELS[i], "msg", p.ts]);
    });
  });
  it("les champs supplémentaires apparaissent dans le JSON", async () => {
    const { log } = await loadLogger("debug");
    log.info("requête", { siren: "000000000", ms: 12 });
    const p = JSON.parse(lines()[0]);
    expect(p.siren).toBe("000000000");
    expect(p.ms).toBe(12);
  });
  it("LOG_LEVEL=warn : debug et info silencieux, warn et error écrits", async () => {
    const { log } = await loadLogger("warn");
    log.debug("d");
    log.info("i");
    expect(lines()).toHaveLength(0);
    log.warn("w");
    log.error("e");
    expect(lines().map((l) => JSON.parse(l).level)).toEqual(["warn", "error"]);
  });
  it("LOG_LEVEL=error : seul error écrit", async () => {
    const { log } = await loadLogger("error");
    for (const lvl of ["debug", "info", "warn"] as const) log[lvl]("x");
    log.error("e");
    expect(lines()).toHaveLength(1);
    expect(JSON.parse(lines()[0]).level).toBe("error");
  });
  it("LOG_LEVEL absent : le défaut est info", async () => {
    const { log } = await loadLogger();
    log.debug("d");
    expect(lines()).toHaveLength(0);
    log.info("i");
    expect(lines()).toHaveLength(1);
  });
  it("LOG_LEVEL invalide : repli sur info", async () => {
    const { log } = await loadLogger("verbose");
    log.debug("d");
    expect(lines()).toHaveLength(0);
    log.info("i");
    expect(lines()).toHaveLength(1);
  });
  it("n'écrit jamais sur stdout", async () => {
    const { log } = await loadLogger("debug");
    log.error("e");
    expect(process.stdout.write).not.toHaveBeenCalled();
  });
});
