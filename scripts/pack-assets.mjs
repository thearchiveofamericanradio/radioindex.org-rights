#!/usr/bin/env node
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "rights");
const output = path.join(root, "addon", ".assets", "bundles");

rmSync(path.join(root, "addon", ".assets"), { recursive: true, force: true });
mkdirSync(output, { recursive: true });
copyFileSync(path.join(root, "manifest.json"), path.join(root, "addon", ".assets", "manifest.json"));

const bundles = new Map();
let files = 0;

for (const type of readdirSync(source).sort()) {
  const directory = path.join(source, type);
  if (!statSync(directory).isDirectory()) continue;
  for (const name of readdirSync(directory).filter((v) => v.endsWith(".json")).sort()) {
    const id = name.slice(0, -5).toLowerCase();
    const bundle = id.replaceAll("-", "").padEnd(3, "_").slice(0, 3);
    const key = `${type}/${bundle}`;
    const records = bundles.get(key) || [];
    records.push([id, JSON.parse(readFileSync(path.join(directory, name), "utf8"))]);
    bundles.set(key, records);
    files += 1;
  }
}

for (const [key, records] of [...bundles].sort()) {
  const target = path.join(output, `${key}.json`);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(Object.fromEntries(records)));
}

writeFileSync(
  path.join(root, "addon", ".assets", ".health.json"),
  JSON.stringify({ ok: true, slice: "rights", files, bundles: bundles.size, generated: new Date().toISOString() }, null, 2)
);

console.log(`Packed ${files} rights files into ${bundles.size} bundles.`);
