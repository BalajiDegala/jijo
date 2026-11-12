import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import { parse } from 'yaml';

async function addNode(page: Page, name: string) {
  await page.getByRole('button', { name: /Add node/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Add ' + name, exact: true }).click();
}
function node(page: Page, name: string) {
  return page.locator('.react-flow__node').filter({ has: page.getByText(name, { exact: true }) });
}
async function wire(page: Page, source: string, target: string, touch = false) {
  if (touch) await page.getByRole('button', { name: 'Actions for ' + source, exact: true }).click();
  else await node(page,source).click({ button: 'right' });
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await node(page,target).click();
}

test('the resource canvas validates edits, connects resources and exports the matching stack', async ({ page }) => {
  await page.goto('/#graph');
  await expect(page.getByRole('heading', { name: 'Ready to export' })).toBeVisible();
  await expect(page.locator('.react-flow__node')).toHaveCount(4);
  await page.screenshot({ path: 'test-results/resource-playground.png', fullPage: true });
  await addNode(page,'Redis');
  await expect(page.getByLabel('Resource name')).toHaveValue('redis');
  await page.getByLabel('Resource name').fill('cache');
  await page.getByLabel('Host port', { exact: true }).fill('8080');
  await expect(page.getByText(/Host port 8080 is published/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compose file', exact: true })).toBeDisabled();
  await page.getByLabel('Host port', { exact: true }).fill('');
  await wire(page,'cache','backend');
  await wire(page,'api','cache');
  await expect(page.locator('.react-flow__edge')).toHaveCount(6);
  await page.getByRole('button', { name: 'Compose YAML' }).click();
  const generated = await page.getByLabel('Generated Compose YAML').textContent();
  const cfg = parse(generated!);
  expect(cfg.services.api.depends_on).toEqual(['database', 'cache']);
  expect(cfg.services.cache.networks).toEqual(['backend']);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Compose file', exact: true }).click();
  const yaml = await download;
  expect(yaml.suggestedFilename()).toBe('compose.yaml');
  expect(await readFile((await yaml.path())!, 'utf8')).toBe(generated);
  await page.reload();
  await expect(page.locator('.react-flow__edge')).toHaveCount(6);
});

test('a repaired Dockerfile becomes an editable service and its exact source is exported', async ({ page }) => {
  await page.goto('/#dockerfile');
  await page.getByRole('button', { name: /Express.*Node.js/ }).click();
  const editor = page.getByLabel('Dockerfile editor');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  const original = await editor.inputValue();
  await page.getByRole('button', { name: 'Load broken recipe' }).click();
  await expect(page.getByRole('button', { name: 'Simulate build' })).toBeDisabled();
  await page.getByLabel('Fails a check').check();
  await page.getByRole('button', { name: 'Simulate build' }).click();
  await expect(page.getByRole('heading', { name: 'Build check failed' })).toBeVisible();
  await expect(page.getByText(/RUN npm ci needs package-lock.json/)).toBeVisible();
  const custom = '# catalog service\n' + original;
  await editor.fill(custom);
  await page.getByLabel('Passes the checks').check();
  await page.getByRole('button', { name: 'Simulate build' }).click();
  await expect(page.getByRole('heading', { name: 'Build checks passed' })).toBeVisible();
  await page.screenshot({ path: 'test-results/dockerfile-playground.png', fullPage: true });
  await page.getByRole('button', { name: 'Add service to graph' }).click();
  await expect(page.getByLabel('Resource name')).toHaveValue('express');
  await page.getByLabel('Resource name').fill('catalog');
  const incoming = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Project ZIP' }).click();
  const zip = unzipSync(await readFile((await (await incoming).path())!));
  expect(parse(strFromU8(zip['compose.yaml'])).services.catalog.build).toBe('./apps/catalog');
  expect(strFromU8(zip['apps/catalog/Dockerfile'])).toBe(custom);
  expect(zip['apps/catalog/package-lock.json']).toBeDefined();
  await page.getByRole('button', { name: 'Edit service Dockerfile' }).click();
  await expect(editor).toHaveValue(custom);
  await editor.fill(original);
  await page.getByLabel('Passes the checks').check();
  await page.getByRole('button', { name: 'Simulate build' }).click();
  await page.getByRole('button', { name: 'Apply to catalog' }).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(5);
});

test('mobile controls add, wire, disconnect and remove a volume', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#graph');
  await addNode(page,'Volume');
  await wire(page,'api','volume',true);
  await page.getByLabel('Mount path').fill('/srv/data');
  await page.getByRole('button', { name: 'Compose YAML' }).click();
  await expect(page.getByLabel('Generated Compose YAML')).toContainText('volume:/srv/data');
  await page.getByRole('button', { name: 'Disconnect volume' }).click();
  await page.getByLabel('Selected resource').selectOption({ label: 'volume · Volume' });
  await page.getByRole('button', { name: 'Remove resource' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Canvas', exact: true }).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(4);
});

test('dragging a wire on the canvas creates a Compose mount', async ({ page }) => {
  await page.goto('/#graph');
  await addNode(page,'Nginx');
  await addNode(page,'Volume');
  const start = page.getByLabel('Connect from nginx', { exact: true });
  const end = page.getByLabel('Connect to volume', { exact: true });
  await start.dragTo(end, { steps: 16 });
  await expect(page.getByRole('group', { name: 'nginx mounts volume' })).toBeVisible();
  await page.getByRole('button', { name: 'Compose YAML' }).click();
  await expect(page.getByLabel('Generated Compose YAML')).toContainText('volume:/data');
});

test('Tab adds to the fullscreen resource graph and invalid targets keep connect mode active', async ({ page }) => {
  await page.goto('/#graph');
  const surface = page.locator('.pg-canvas');
  await surface.focus();
  await page.keyboard.press('f');
  await expect(page.getByRole('button', { name: 'Exit full screen' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.getByLabel('Find a node').fill('volume');
  await page.getByRole('button', { name: 'Add Volume' }).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(5);
  await node(page,'api').click({ button: 'right' });
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(node(page,'api').locator('.wire-source')).toBeVisible();
  await node(page,'database').click();
  await expect(page.locator('.react-flow__edge')).toHaveCount(4);
  await expect(node(page,'volume').locator('.wire-target')).toBeVisible();
  await node(page,'volume').click();
  await expect(page.getByRole('group', { name: 'api mounts volume' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Node properties' }).getByRole('button', { name: 'Connect', exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Full screen', exact: true })).toBeVisible();
  await node(page,'database').focus();
  await page.keyboard.press('Shift+F10');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await node(page,'api').click();
  await expect(page.locator('.react-flow__edge')).toHaveCount(5);
  await page.keyboard.press('Escape');
  await expect(page.locator('.wire-source')).toHaveCount(0);
});

test('Dockerfile nodes edit the same recipe as Source and share the fullscreen and picker controls', async ({ page }) => {
  await page.goto('/#dockerfile');
  await expect(page.locator('.react-flow__node')).toHaveCount(8);
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await page.locator('.pg-canvas').focus();
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Add ENV' }).click();
  await expect(page.getByLabel('Instruction arguments')).toHaveValue('APP_ENV=development');
  await page.getByLabel('Instruction arguments').fill('APP_ENV=staging');
  await node(page,'FROM').click({ button: 'right' });
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await node(page,'ENV').click();
  await expect(node(page,'FROM').locator('.wire-source')).toBeVisible();
  await node(page,'WORKDIR').click();
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.getByLabel('Dockerfile editor')).toHaveValue(/^FROM [^\n]+\nWORKDIR \/app\nENV APP_ENV=staging/);
  await page.keyboard.press('Escape');
  await page.getByLabel('Dockerfile editor').focus();
  await page.keyboard.press('End');
  await page.keyboard.type('f');
  await expect(page.getByRole('button', { name: 'Full screen', exact: true })).toBeVisible();
});
