import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { deflateRawSync } from "node:zlib";
import { dirname, parse, relative, resolve } from "node:path";
import { loadRegistry } from "./registry.js";
import { marketplacePath, pluginsRoot, repoRoot } from "./paths.js";
import type { PluginRegistry, PluginRegistryEntry } from "./types.js";

type CoworkPackageOptions = {
  root: string;
  outputDir: string;
  plugins?: string[];
};

type PackageResult = {
  outputDir: string;
  plugins: Array<{
    name: string;
    folder: string;
    zip: string;
    files: number;
  }>;
};

type ZipFile = {
  name: string;
  data: Buffer;
};

const defaultOutputDir = resolve(repoRoot, "dist-pkg/cowork-marketplace");

const distributionDirectories = new Set([
  ".claude-plugin",
  "agents",
  "commands",
  "hooks",
  "references",
  "skills"
]);

const distributionFiles = new Set([
  ".gitignore",
  ".mcp.json",
  "CHANGELOG.md",
  "CLAUDE.md",
  "README.md",
  "version.json"
]);

const excludedFileNames = new Set(["manifest.json", ".mcpbignore"]);

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

function usage(): string {
  return [
    "Usage: package-plugin [--root <repo>] [--out <dir>] [--plugin hacienda-...]",
    "",
    "Generates a clean Claude/Cowork marketplace folder and one installable ZIP per plugin."
  ].join("\n");
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function readRepeatedOption(args: string[], name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== name) continue;
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${name}`);
    }
    values.push(value);
  }
  return values;
}

export function parseCoworkPackageArgs(args: string[]): CoworkPackageOptions {
  if (args.includes("--help") || args.includes("-h")) {
    throw new Error(usage());
  }

  return {
    root: resolve(readOption(args, "--root") ?? repoRoot),
    outputDir: resolve(readOption(args, "--out") ?? defaultOutputDir),
    plugins: readRepeatedOption(args, "--plugin")
  };
}

function toPosixPath(path: string): string {
  return path.replace(/\\/gu, "/");
}

function assertSafeOutputDir(outputDir: string, root: string): string {
  const resolved = resolve(outputDir);
  const parsed = parse(resolved);
  const forbidden = new Set([
    resolve(root),
    resolve(root, "plugins"),
    resolve(root, ".claude-plugin"),
    parsed.root
  ]);

  if (forbidden.has(resolved)) {
    throw new Error(`Refusing to replace unsafe output directory: ${resolved}`);
  }

  return resolved;
}

function listFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root)) {
    const absolutePath = resolve(root, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...listFiles(absolutePath));
      continue;
    }

    if (stats.isFile()) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function isBundledMcpServerFile(relativePath: string): boolean {
  return (
    relativePath === "mcp-server/package.json" ||
    relativePath === "mcp-server/dist/mcpb-index.cjs"
  );
}

function usesBundledMcpServer(plugin: PluginRegistryEntry, pluginDir: string): boolean {
  if (plugin.mcp.mode === "own-stdio-server") {
    return true;
  }

  const mcpPath = resolve(pluginDir, ".mcp.json");
  return existsSync(mcpPath) && readFileSync(mcpPath, "utf8").includes("${CLAUDE_PLUGIN_ROOT}");
}

function shouldIncludeFile(
  plugin: PluginRegistryEntry,
  pluginDir: string,
  absolutePath: string
): boolean {
  const relativePath = toPosixPath(relative(pluginDir, absolutePath));
  const firstSegment = relativePath.split("/")[0] ?? "";
  const fileName = relativePath.split("/").at(-1) ?? "";

  if (
    excludedFileNames.has(relativePath) ||
    excludedFileNames.has(fileName) ||
    relativePath.endsWith(".bak") ||
    relativePath.endsWith(".zip") ||
    relativePath.endsWith(".rar") ||
    relativePath.endsWith(".mcpb") ||
    relativePath.endsWith(".log") ||
    relativePath.startsWith("logs/") ||
    relativePath.startsWith(".cache/") ||
    relativePath.startsWith("mcp-server/node_modules/") ||
    relativePath.startsWith("mcp-server/src/")
  ) {
    return false;
  }

  if (relativePath.startsWith("mcp-server/")) {
    return usesBundledMcpServer(plugin, pluginDir) && isBundledMcpServerFile(relativePath);
  }

  return distributionFiles.has(relativePath) || distributionDirectories.has(firstSegment);
}

function copyIncludedFiles(plugin: PluginRegistryEntry, sourceDir: string, destinationDir: string): string[] {
  const included = listFiles(sourceDir).filter((file) => shouldIncludeFile(plugin, sourceDir, file));

  for (const source of included) {
    const relativePath = toPosixPath(relative(sourceDir, source));
    const destination = resolve(destinationDir, relativePath);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }

  return included.map((file) => toPosixPath(relative(sourceDir, file)));
}

function buildMarketplace(registry: PluginRegistry): unknown {
  return {
    $schema: "https://anthropic.com/claude-code/marketplace.schema.json",
    name: "hacienda-juridique",
    description:
      "marketplace de plugins juridiques francais Hacienda pour workflows avocats, juristes et equipes legal ops.",
    owner: {
      name: "Hacienda",
      url: "https://hacienda.diy"
    },
    plugins: registry.plugins.map((plugin) => ({
      name: plugin.name,
      source: `./plugins/${plugin.name}`,
      description: plugin.description,
      author: {
        name: "Hacienda",
        url: "https://hacienda.diy"
      }
    }))
  };
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crcTable[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()): { time: number; date: number } {
  const year = Math.max(date.getFullYear(), 1980);
  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

function uint16(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

export function writeZip(zipPath: string, files: ZipFile[]): void {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const timestamp = dosDateTime();
  let offset = 0;

  for (const file of files) {
    const fileName = Buffer.from(file.name, "utf8");
    const compressed = deflateRawSync(file.data);
    const checksum = crc32(file.data);
    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0x0800),
      uint16(8),
      uint16(timestamp.time),
      uint16(timestamp.date),
      uint32(checksum),
      uint32(compressed.length),
      uint32(file.data.length),
      uint16(fileName.length),
      uint16(0),
      fileName
    ]);

    localParts.push(localHeader, compressed);
    centralParts.push(
      Buffer.concat([
        uint32(0x02014b50),
        uint16(20),
        uint16(20),
        uint16(0x0800),
        uint16(8),
        uint16(timestamp.time),
        uint16(timestamp.date),
        uint32(checksum),
        uint32(compressed.length),
        uint32(file.data.length),
        uint16(fileName.length),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(0),
        uint32(offset),
        fileName
      ])
    );
    offset += localHeader.length + compressed.length;
  }

  const central = Buffer.concat(centralParts);
  const local = Buffer.concat(localParts);
  const end = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(central.length),
    uint32(local.length),
    uint16(0)
  ]);

  mkdirSync(dirname(zipPath), { recursive: true });
  writeFileSync(zipPath, Buffer.concat([local, central, end]));
}

export function readZipEntryNames(zipPath: string): string[] {
  const archive = readFileSync(zipPath);
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;

  for (let offset = archive.length - 22; offset >= 0; offset -= 1) {
    if (archive.readUInt32LE(offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error(`Invalid ZIP archive: ${zipPath}`);
  }

  const totalEntries = archive.readUInt16LE(eocdOffset + 10);
  let cursor = archive.readUInt32LE(eocdOffset + 16);
  const entries: string[] = [];

  for (let index = 0; index < totalEntries; index += 1) {
    if (archive.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central directory: ${zipPath}`);
    }
    const nameLength = archive.readUInt16LE(cursor + 28);
    const extraLength = archive.readUInt16LE(cursor + 30);
    const commentLength = archive.readUInt16LE(cursor + 32);
    const name = archive.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    entries.push(name);
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function selectPlugins(registry: PluginRegistry, names: string[] | undefined): PluginRegistry {
  if (!names || names.length === 0) {
    return registry;
  }

  const selected = new Set(names);
  const plugins = registry.plugins.filter((plugin) => selected.has(plugin.name));
  const missing = [...selected].filter((name) => !plugins.some((plugin) => plugin.name === name));
  if (missing.length > 0) {
    throw new Error(`Unknown plugin(s): ${missing.join(", ")}`);
  }

  return { plugins };
}

export function packageCoworkMarketplace(options: CoworkPackageOptions): PackageResult {
  const root = resolve(options.root);
  const outputDir = assertSafeOutputDir(options.outputDir, root);
  const registry = selectPlugins(
    loadRegistry(resolve(root, "plugins/registry.json")),
    options.plugins
  );

  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(resolve(outputDir, ".claude-plugin"), { recursive: true });
  mkdirSync(resolve(outputDir, "plugins"), { recursive: true });
  mkdirSync(resolve(outputDir, "zips"), { recursive: true });

  writeJson(resolve(outputDir, ".claude-plugin/marketplace.json"), buildMarketplace(registry));
  writeJson(resolve(outputDir, "plugins/registry.json"), {
    plugins: registry.plugins.map((plugin) => ({
      ...plugin,
      source: `./plugins/${plugin.name}`
    }))
  });

  const results: PackageResult["plugins"] = [];
  for (const plugin of registry.plugins) {
    const sourceDir = resolve(root, plugin.source);
    if (!existsSync(resolve(sourceDir, ".claude-plugin/plugin.json"))) {
      throw new Error(`Plugin is missing .claude-plugin/plugin.json: ${plugin.name}`);
    }

    const destinationDir = resolve(outputDir, "plugins", plugin.name);
    const included = copyIncludedFiles(plugin, sourceDir, destinationDir);
    const zipPath = resolve(outputDir, "zips", `${plugin.name}.zip`);
    writeZip(
      zipPath,
      included.map((relativePath) => ({
        name: relativePath,
        data: readFileSync(resolve(destinationDir, relativePath))
      }))
    );
    results.push({
      name: plugin.name,
      folder: destinationDir,
      zip: zipPath,
      files: included.length
    });
  }

  return { outputDir, plugins: results };
}

function main(): number {
  try {
    const result = packageCoworkMarketplace(parseCoworkPackageArgs(process.argv.slice(2)));
    console.log(`Generated Cowork marketplace distribution at ${result.outputDir}`);
    for (const plugin of result.plugins) {
      console.log(`${plugin.name}: ${plugin.files} files -> ${plugin.zip}`);
    }
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1]?.endsWith("package-plugin.js")) {
  process.exitCode = main();
}
