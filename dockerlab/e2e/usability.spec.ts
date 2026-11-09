import { test, expect } from '@playwright/test';

test('long output leaves the prompt available and expanded canvas remains inspectable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore a sample environment' }).click();
  const input = page.getByRole('textbox', { name: 'Docker command', exact: true });
  await input.fill('help');
  await input.press('Enter');
  await page.locator('.terminal-scroll').evaluate(element => { element.scrollTop = 0; });
  const terminal = await page.getByRole('region', { name: 'Virtual terminal' }).boundingBox();
  const prompt = await input.boundingBox();
  expect(prompt!.y).toBeGreaterThan(terminal!.y);
  expect(prompt!.y + prompt!.height).toBeLessThan(terminal!.y + terminal!.height);
  await input.fill('docker ps');
  await input.press('Enter');
  await expect(page.locator('.terminal-entry').last()).toContainText('database');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('docker ps');
  await input.fill('docker inspect ');
  await input.press('Tab');
  await expect(input).toHaveValue('docker inspect ');

  const canvas = page.getByRole('region', { name: 'Visual Docker environment' });
  const before = await canvas.boundingBox();
  await page.getByRole('button', { name: 'Expand environment', exact: true }).click();
  const expanded = await canvas.boundingBox();
  expect(expanded!.width).toBeGreaterThan(before!.width * 1.5);
  await page.locator('.resource-node.container').filter({ hasText: 'database' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.inspector-resource h3')).toHaveText('database');
  await expect(page.getByRole('button', { name: 'Expand environment', exact: true })).toBeVisible();
  const restored = await canvas.boundingBox();
  expect(restored!.width).toBeCloseTo(before!.width, 0);
});

test('selecting a Compose service brings its YAML into view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Docker Compose Lab', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'docker-compose.yml editor', exact: true });
  await editor.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await page.locator('.plan-label.container').filter({ hasText: 'database' }).click();
  await expect(page.locator('.compose-service-inspector h3')).toHaveText('database');
  await expect(page.locator('.line-numbers .highlight-line')).toHaveCount(1);
  const visible = await page.locator('.line-numbers .highlight-line').evaluate(element => {
    const line = element.getBoundingClientRect();
    const parent = element.parentElement!.getBoundingClientRect();
    return line.top >= parent.top && line.bottom <= parent.bottom;
  });
  expect(visible).toBe(true);
});
