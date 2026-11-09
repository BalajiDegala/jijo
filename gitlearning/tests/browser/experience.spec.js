import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { scenarios } from "../../lib/scenario-engine.js";
async function run(page, cmd) {
  await page
    .getByRole("textbox", { name: "Git command", exact: true })
    .fill(cmd);
  await page.getByRole("button", { name: "Run command", exact: true }).click();
}
const camera = (page) =>
  page.locator(".graph-surface").evaluate((e) => ({
    x: Number(e.dataset.cameraX),
    y: Number(e.dataset.cameraY),
    z: Number(e.dataset.cameraZoom),
  }));
test("raga-git has useful paths and preserves existing progress", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "gitquest-progress-v1",
      JSON.stringify({
        scenarios: ["first-commit"],
        verified: ["first-commit"],
        lastScenario: "first-commit",
      }),
    ),
  );
  await page.goto("/");
  await expect(page).toHaveTitle(/raga-git/);
  await expect(
    page.getByRole("link", { name: "raga-git", exact: true }),
  ).toBeAttached();
  await expect(page.locator(".path-grid .learning-path")).toHaveCount(3);
  await expect(page.locator(".learning-path").first()).toHaveAttribute(
    "href",
    "/scenarios/staging",
  );
  await expect(page.locator(".featured-copy")).toContainText("Stage one file");
});
test("familiar help forms and a misspelled reflog are useful in the terminal", async ({
  page,
}) => {
  await page.goto("/playground");
  for (const cmd of [
    "git --help",
    "git help reflog",
    "git cherry-pick --help",
    "git refrog",
  ])
    await run(page, cmd);
  const out = page.getByRole("log");
  await expect(out).toContainText("Browser simulator help");
  await expect(out).toContainText("local record of reference movements");
  await expect(out).toContainText("source branch does not move");
  await expect(out).toContainText("Did you mean git reflog?");
  await expect(out).toContainText("Nothing was executed");
  await run(page, "git reflog");
  await expect(page.locator(".terminal-entry").last()).not.toHaveClass(/error/);
});
test("hotfix teaches and executes cherry-pick with a next exercise", async ({
  page,
}) => {
  await page.goto("/scenarios/hotfix");
  await expect(page.locator(".objective-concept")).toContainText(
    "Cherry-pick copies the change",
  );
  await page.getByRole("button", { name: "Understand this topic" }).click();
  await expect(
    page.getByRole("dialog", { name: "Scenario guide" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reveal what changes" }).click();
  await expect(page.locator(".concept-comparison")).toContainText(
    "v1.0.1 stays free",
  );
  await expect(page.locator(".cherry-picture")).toHaveAccessibleName(
    /original release fix stays/,
  );
  await page.getByRole("button", { name: "Close panel", exact: true }).click();
  for (const step of scenarios.find((s) => s.id === "hotfix").steps)
    await run(page, step.command);
  await expect(
    page.getByText("All steps verified.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Next lab" })).toHaveAttribute(
    "href",
    "/scenarios/revert",
  );
  await expect(page.locator(".lab-step-progress")).toHaveAttribute(
    "aria-valuenow",
    "7",
  );
});
test("graph fullscreen, free panning, focal zoom, fit, inspection and Escape work", async ({
  page,
}) => {
  await page.goto("/scenarios/hotfix");
  await page
    .getByRole("button", { name: "Fullscreen graph", exact: true })
    .click();
  const fullscreen = page.getByRole("dialog", {
    name: "Commit graph fullscreen",
  });
  await expect(fullscreen).toBeVisible();
  const box = await fullscreen.boundingBox();
  expect(box).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
  const before = await camera(page);
  const surface = page.locator(".graph-surface");
  const rect = await surface.boundingBox();
  await page.mouse.move(rect.x + 75, rect.y + rect.height - 50);
  await page.mouse.down();
  await page.mouse.move(rect.x + 175, rect.y + rect.height - 115, { steps: 8 });
  await page.mouse.up();
  const panned = await camera(page);
  expect(panned.x - before.x).toBeCloseTo(100);
  expect(panned.y - before.y).toBeCloseTo(-65);
  await surface.focus();
  await page.keyboard.press("ArrowLeft");
  expect((await camera(page)).x - panned.x).toBeCloseTo(40);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  expect((await camera(page)).z).toBeGreaterThan(before.z);
  await page.getByRole("button", { name: "Fit graph", exact: true }).click();
  const fitted = await camera(page);
  expect(fitted.x).toBeCloseTo(before.x);
  expect(fitted.y).toBeCloseTo(before.y);
  await page.locator(".history-node").first().click();
  await expect(page.locator(".commit-inspector")).toBeVisible();
  await page.getByRole("button", { name: "Close commit details" }).click();
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(fullscreen).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fullscreen graph", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Interactive terminal" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Fullscreen graph", exact: true })
    .click();
  await page.getByRole("button", { name: "Exit fullscreen graph" }).click();
  await expect(fullscreen).not.toBeVisible();
});
test("dragging a commit pans without opening inspection, wheel and fit remain usable", async ({
  page,
}) => {
  await page.goto("/playground");
  const node = page.locator(".history-node").first();
  await expect(node).toBeVisible();
  const rect = await node.boundingBox();
  await page.mouse.move(rect.x + 40, rect.y + 40);
  await page.mouse.down();
  await page.mouse.move(rect.x + 120, rect.y + 70, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator(".commit-inspector")).toHaveCount(0);
  const before = await camera(page);
  await page.mouse.wheel(40, 60);
  await expect
    .poll(async () => (await camera(page)).y)
    .toBeCloseTo(before.y - 60);
  await page.getByRole("button", { name: "Focus HEAD" }).click();
  expect((await camera(page)).z).toBe(1);
});
test("mobile graph can be panned with touch and exited from fullscreen", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/scenarios/hotfix");
  await page.getByRole("tab", { name: "Commit graph", exact: true }).click();
  await page
    .getByRole("button", { name: "Fullscreen graph", exact: true })
    .click();
  const session = await context.newCDPSession(page);
  const before = await camera(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 90, y: 650 }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 160, y: 590 }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => (await camera(page)).x)
    .toBeCloseTo(before.x + 70);
  await expect
    .poll(async () => (await camera(page)).y)
    .toBeCloseTo(before.y - 60);
  await page.getByRole("button", { name: "Exit fullscreen graph" }).click();
  await expect(
    page.getByRole("tab", { name: "Terminal", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await context.close();
});
test("narrow panels keep all graph controls visible and short histories readable", async ({
  page,
}) => {
  await page.goto("/scenarios/hotfix");
  expect((await camera(page)).z).toBeGreaterThan(0.8);
  await page.getByRole("button", { name: "Expand navigation" }).click();
  await page.getByRole("slider", { name: "Graph width" }).fill("30");
  const toolbar = page.locator(".graph-toolbar");
  const box = await toolbar.boundingBox();
  for (const button of await toolbar.getByRole("button").all()) {
    const r = await button.boundingBox();
    expect(r.x).toBeGreaterThanOrEqual(box.x);
    expect(r.x + r.width).toBeLessThanOrEqual(box.x + box.width);
  }
  await page
    .getByRole("button", { name: "Fullscreen graph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Commit graph fullscreen" }),
  ).toBeVisible();
});
test("both branch visualizer graphs use the same functioning fullscreen controls", async ({
  page,
}) => {
  await page.goto("/branches");
  await page
    .getByRole("button", { name: "Compare operations", exact: true })
    .click();
  for (const label of [
    "Merge and rebase comparison graph",
    "Reset and revert comparison graph",
  ]) {
    const graph = page.getByRole("region", { name: label });
    await graph
      .getByRole("button", { name: "Fullscreen graph", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Commit graph fullscreen" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      graph.getByRole("button", { name: "Fullscreen graph", exact: true }),
    ).toBeFocused();
  }
});
