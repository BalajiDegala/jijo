import {
  cpSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { gunzipSync } from "node:zlib";
mkdirSync("public/monaco", { recursive: true });
if (existsSync("node_modules/monaco-editor/min/vs"))
  cpSync("node_modules/monaco-editor/min/vs", "public/monaco/vs", {
    recursive: true,
  });
mkdirSync("public/hcl", { recursive: true });
const hcl = "node_modules/@cdktf/hcl2json";
if (existsSync(hcl + "/main.wasm.gz")) {
  writeFileSync(
    "public/hcl/main.wasm",
    gunzipSync(readFileSync(hcl + "/main.wasm.gz")),
  );
  cpSync(hcl + "/wasm/bridge_wasm_exec.js", "public/hcl/bridge_wasm_exec.js");
  if (existsSync(hcl + "/LICENSE"))
    cpSync(hcl + "/LICENSE", "public/hcl/LICENSE");
}
mkdirSync("public/dagre", { recursive: true });
if (existsSync("node_modules/@dagrejs/dagre/dist/dagre.min.js"))
  cpSync(
    "node_modules/@dagrejs/dagre/dist/dagre.min.js",
    "public/dagre/dagre.min.js",
  );
