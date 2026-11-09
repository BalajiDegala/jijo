import test from "node:test";
import assert from "node:assert/strict";
import { readProjectFile } from "../src/lib/project-file";
import { createTemplate } from "../src/lib/templates";
test("Portable project roundtrip preserves the canonical resource model", () => {
  const p = createTemplate();
  assert.deepEqual(readProjectFile(JSON.stringify(p)).resources, p.resources);
});
test("Malformed resource and duplicate IDs are rejected before loading", () => {
  const p = createTemplate();
  p.resources[1].id = p.resources[0].id;
  assert.throws(() => readProjectFile(JSON.stringify(p)), /unique/);
  p.resources[1].id = "subnet";
  (p.resources[1] as any).args = null;
  assert.throws(() => readProjectFile(JSON.stringify(p)), /malformed/);
});
test("Private key material is rejected before entering persistent storage", () => {
  const p = createTemplate();
  p.resources[0].args.secret = "-----BEGIN OPENSSH PRIVATE KEY-----";
  assert.throws(() => readProjectFile(JSON.stringify(p)), /Private key/);
});
