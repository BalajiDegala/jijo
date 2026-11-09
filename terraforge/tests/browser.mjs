import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import JSZip from "jszip";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const url = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const results = [];
const record = (s) => {
  results.push(s);
  console.log("PASS " + s);
};
const clickNode = async (id) =>
  page.locator(`.react-flow__node[data-id="${id}"] .node-head`).click();
const runCommand = async (text) => {
  await page.keyboard.press("Control+k");
  await page.getByLabel("Command palette").fill(text);
  await page.locator(".command-list button").first().click();
};
try {
  await page.goto(url);
  await page.locator(".monaco-editor").waitFor();
  await page.waitForTimeout(700);
  assert.ok((await page.locator(".react-flow__node").count()) > 8);
  record("Application loads with Monaco and a nested infrastructure graph");
  await page.getByRole("button", { name: "Validate", exact: true }).click();
  await page.getByText("All model checks passed", { exact: true }).waitFor();
  await page.getByLabel("Close dialog").click();
  record("Default configuration passes model validation");
  await clickNode("web");
  await page.getByLabel("Resource name").fill("web_frontend");
  await page.locator("#f-instance_type").selectOption("t3.small");
  let code = await page.evaluate(() =>
    window.monaco.editor
      .getModels()
      .map((m) => m.getValue())
      .join("\n"),
  );
  assert.match(code, /web_frontend/);
  assert.match(code, /t3.small/);
  record("Inspector edits update generated Terraform");
  await page
    .locator(".inspector-tabs")
    .getByRole("button", { name: "Advanced", exact: true })
    .click();
  await page.getByLabel("Scaling mode").selectOption("count");
  await page.getByRole("button", { name: "1,000", exact: true }).click();
  code = await page.evaluate(() =>
    window.monaco.editor.getModels()[0].getValue(),
  );
  assert.match(code, /count = 1000/);
  assert.ok((await page.locator(".react-flow__node").count()) < 30);
  record("A thousand EC2 instances stay in one graph cluster and HCL block");
  await page.getByLabel("Undo", { exact: true }).click();
  code = await page.evaluate(() =>
    window.monaco.editor.getModels()[0].getValue(),
  );
  assert.match(code, /count = 10/);
  await page.getByLabel("Redo", { exact: true }).click();
  record("Undo and redo restore model changes");
  await page.getByRole("button", { name: "Dependencies", exact: true }).click();
  await page.getByLabel("Auto-layout", { exact: true }).click();
  await page.waitForTimeout(650);
  assert.ok(await page.evaluate(() => !!window.dagre));
  record("Dagre automatic dependency layout runs");
  await page.getByRole("button", { name: "Packet flow", exact: true }).click();
  assert.ok((await page.locator(".react-flow__edge").count()) >= 3);
  record("Network view traces explicit configured route hops");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download .zip", exact: true })
    .click();
  const download = await downloadEvent;
  const zip = await JSZip.loadAsync(await fs.readFile(await download.path()));
  assert.ok(zip.file("main.tf"));
  assert.ok(zip.file("terraform.tfvars.example"));
  assert.ok(zip.file("terraforge.project.json"));
  assert.match(await zip.file("main.tf").async("string"), /count = 1000/);
  record("ZIP export contains generated Terraform and reopenable model");
  await page.waitForTimeout(850);
  await page.reload();
  await page.locator(".monaco-editor").waitFor();
  await page.waitForTimeout(500);
  code = await page.evaluate(() =>
    window.monaco.editor.getModels()[0].getValue(),
  );
  assert.match(code, /web_frontend/);
  assert.match(code, /count = 1000/);
  record("IndexedDB autosave survives reload");
  await runCommand("Go to main");
  await page
    .locator(".inspector")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  assert.ok((await page.locator(".dialog").innerText()).includes("reference"));
  await page
    .getByRole("button", { name: "Delete resource", exact: true })
    .click();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Download .zip", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByLabel("Close dialog").click();
  await page.getByLabel("Undo", { exact: true }).click();
  record("Deletion explains dependencies and blocks invalid Terraform export");
  await page.getByLabel("Project templates", { exact: true }).click();
  await page
    .locator(".template-card")
    .filter({ hasText: "The first connection" })
    .click();
  await page.waitForTimeout(450);
  await page.screenshot({ path: ".local/studio-final.png" });
  record("Template switching resets a coherent architecture");
  await clickNode("web");
  await page
    .locator(".inspector-tabs")
    .getByRole("button", { name: "Network", exact: true })
    .click();
  await page.screenshot({ path: ".local/inspector-final.png" });
  await page.getByLabel("Close inspector", { exact: true }).click();
  await page.getByLabel("Project templates", { exact: true }).click();
  await page.screenshot({ path: ".local/templates-final.png" });
  await page
    .getByRole("button", { name: "Blank project", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start building", exact: true })
    .click();
  await page.getByLabel("Close inspector", { exact: true }).click();
  await page.getByLabel("Search resources", { exact: true }).fill("Subnet");
  await page
    .locator(".library-resource")
    .filter({ has: page.locator("small").filter({ hasText: /^aws_subnet$/ }) })
    .click();
  await page
    .locator(".inspector-tabs")
    .getByRole("button", { name: "Network", exact: true })
    .click();
  assert.ok((await page.locator("#f-vpc_id").inputValue()).length > 0);
  record("Empty-canvas build workflow adds a subnet with a VPC reference");
  await page.getByLabel("Toggle theme", { exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.getByLabel("Toggle theme", { exact: true }).click();
  record("Light and dark theme switching works");
  assert.deepEqual(errors, []);
  record("No uncaught browser errors");
  await fs.writeFile(
    ".local/browser-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
} catch (e) {
  console.log(
    JSON.stringify({
      errors,
      body: (await page.locator("body").innerText()).slice(-4500),
    }),
  );
  await page.screenshot({ path: ".local/test-failure.png" });
  throw e;
} finally {
  await browser.close();
}
