import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import axe from 'axe-core';

async function predict(page: Page) {
  await page.getByLabel('The connection fails').check();
  await page.getByRole('button', { name: 'Record prediction & test' }).click();
  await expect(page.getByRole('heading', { name: 'Connect the missing port' })).toBeVisible();
}

test('repairs both services, retries an explanation, resumes and exports the verified project', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Record prediction & test' })).toBeDisabled();
  await page.getByRole('button', { name: 'Dockerfile', exact: true }).click();
  await expect(page.getByText('EXPOSE 5000', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Request path' }).click();
  await page.screenshot({ path: 'test-results/jijo-desktop.png', fullPage: true });
  await predict(page);
  await page.getByRole('button', { name: 'Read logs' }).click();
  await expect(page.getByText(/Started python app.py/).first()).toBeVisible();
  await page.getByLabel('Container port', { exact: true }).fill('4000');
  await page.getByRole('button', { name: 'Apply mapping' }).click();
  await page.getByRole('button', { name: 'Verify connection' }).click();
  await expect(page.getByRole('status')).toContainText('no service listening on 4000');
  await page.getByLabel('Container port', { exact: true }).fill('5000');
  await page.getByRole('button', { name: 'Apply mapping' }).click();
  await page.getByRole('button', { name: 'Verify connection' }).click();
  await page.getByLabel('EXPOSE makes the app available on every host port.').check();
  await page.getByRole('button', { name: 'Check explanation' }).click();
  await expect(page.getByRole('status')).toContainText('EXPOSE records');
  await page.getByLabel('Publishing forwards a host port to the port where the app listens.').check();
  await page.getByRole('button', { name: 'Check explanation' }).click();
  await expect(page.getByRole('heading', { name: 'Repair the weather API' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Repair the weather API' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get a hint' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  for (const cmd of ['docker rm -f weather-api', 'docker run -d --name weather-api -p 9090:7000 jijo/weather-api:v1']) {
    await page.getByLabel('Docker command').fill(cmd);
    await page.getByRole('button', { name: 'Run command' }).click();
  }
  await page.getByRole('button', { name: 'Verify connection' }).click();
  await expect(page.getByRole('heading', { name: 'Both routes verified' })).toBeVisible();
  await page.getByRole('button', { name: 'Open project files' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Flask project (.zip)' }).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe('jijo-weather-api.zip');
  const entries = unzipSync(await readFile((await file.path())!));
  expect(strFromU8(entries['compose.yaml'])).toContain('9090:7000');
  expect(errors).toEqual([]);
});

test('mobile navigation, backup import, reset, and invalid-file recovery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await page.screenshot({ path: 'test-results/jijo-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await predict(page);
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'Project files' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save backup' }).click();
  const backup = await (await pending).path();
  await page.getByLabel('Choose project backup').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.getByRole('alert')).toContainText('Import failed');
  await page.getByRole('button', { name: 'Dismiss message' }).click();
  await page.getByRole('button', { name: 'Start again' }).click();
  await page.getByRole('button', { name: 'Confirm replacement' }).click();
  await expect(page.getByRole('heading', { name: 'What will the browser receive?' })).toBeVisible();
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'Project files' }).click();
  await page.getByLabel('Choose project backup').setInputFiles(backup!);
  await page.getByRole('button', { name: 'Confirm replacement' }).click();
  await expect(page.getByRole('heading', { name: 'Connect the missing port' })).toBeVisible();
});

test('competing tabs recover from stale revisions', async ({ page, context }) => {
  const other = await context.newPage();
  await Promise.all([page.goto('/'), other.goto('/')]);
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await expect(other.getByText('Saved on this device')).toBeVisible();
  await predict(page);
  await predict(other);
  await expect(other.getByRole('alert')).toContainText('Another tab saved first');
  await other.getByRole('link', { name: 'Field notes', exact: true }).click();
  await expect(other.locator('.journal li')).toHaveCount(1);
});

test('keyboard prediction and WCAG checks on the prediction and repair screens', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await page.addScriptTag({ content: axe.source });
  async function checkAccessibility() {
    const issues = await page.evaluate(async () => {
      const results = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] });
      return results.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }));
    });
    expect(issues).toEqual([]);
  }
  await checkAccessibility();
  await page.getByLabel('The app responds').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('The connection fails')).toBeChecked();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Connect the missing port' })).toBeVisible();
  await checkAccessibility();
});

test('denied browser storage keeps the journey usable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } }));
  await page.goto('/');
  await expect(page.getByText('Session only', { exact: true })).toBeVisible();
  await predict(page);
  await expect(page.getByRole('alert')).toContainText('download a backup');
});

test('damaged progress is preserved until the learner confirms replacement', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('jijo-studio', 1);
    request.onsuccess = () => {
      const tx = request.result.transaction('projects', 'readwrite');
      tx.objectStore('projects').put({ revision: 7, project: { version: 99 } }, 'container-path');
      tx.oncomplete = () => { request.result.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  }));
  await page.reload();
  await expect(page.getByText('Recovery needed', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Project files' }).click();
  await page.getByRole('button', { name: 'Start again' }).click();
  await page.getByRole('button', { name: 'Confirm replacement' }).click();
  await expect(page).toHaveURL(/#lab$/);
  await page.reload();
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What will the browser receive?' })).toBeVisible();
});
