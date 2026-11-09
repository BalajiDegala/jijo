import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createFixture } from "../../lib/visual-lab/fixtures.js";
import { headId, resolve } from "../../lib/git-engine.js";
const state = createFixture("merged");
const seek = (page, value) =>
  page.getByRole("slider", { name: "Lesson timeline" }).fill(String(value));
const canvas = (page) => page.locator(".graph-surface");
const camera = (page) =>
  canvas(page).evaluate((element) => ({
    x: Number(element.dataset.cameraX),
    y: Number(element.dataset.cameraY),
    zoom: Number(element.dataset.cameraZoom),
  }));

test("HEAD parent commands select and trace different paths while actual HEAD remains fixed", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/branches#V08");
  await seek(page, 3);
  await expect(canvas(page)).toHaveAttribute(
    "data-focus-targets",
    resolve(state, "HEAD~2"),
  );
  await expect(canvas(page)).toHaveAttribute("data-actual-head", headId(state));
  await expect(page.locator(".guided-parent-edge")).toHaveCount(2);
  await expect(
    page.locator('.guided-parent-edge[data-parent="1"]'),
  ).toHaveCount(2);
  await expect(page.locator(".vl-focus-caption")).toContainText("2 hops");
  await expect(
    page.locator(`.history-node[data-commit="${resolve(state, "HEAD~2")}"]`),
  ).toBeInViewport();
  await seek(page, 4);
  await expect(canvas(page)).toHaveAttribute(
    "data-focus-targets",
    resolve(state, "HEAD^2"),
  );
  await expect(page.locator(".guided-parent-edge")).toHaveCount(1);
  await expect(page.locator(".guided-parent-edge")).toHaveAttribute(
    "data-parent",
    "2",
  );
  await expect(canvas(page)).toHaveAttribute("data-actual-head", headId(state));
  await expect(page.locator(".vl-focus-caption")).toContainText(
    "1 hop via parent 2",
  );
});

test("revision ranges highlight membership and diff highlights endpoint trees", async ({
  page,
}) => {
  await page.goto("/branches#V08");
  await seek(page, 5);
  await expect(canvas(page)).toHaveAttribute("data-focus-kind", "range");
  await expect(page.locator('.history-node[data-selected="true"]')).toHaveCount(
    3,
  );
  await expect(
    page.locator(`.history-node[data-commit="${state.branches.main}"]`),
  ).toHaveAttribute("data-selected", "false");
  await expect(page.locator(".vl-focus-caption")).toContainText(
    "Shared ancestry is excluded",
  );
  await seek(page, 6);
  await expect(page.locator('.history-node[data-selected="true"]')).toHaveCount(
    2,
  );
  await expect(page.getByLabel("Selected tree comparison")).toContainText(
    "login.js",
  );
  await expect(page.getByLabel("Selected tree comparison")).toContainText(
    "(absent)",
  );
  await expect(page.getByLabel("Selected tree comparison")).toContainText(
    "Login form with validation",
  );
  await expect(canvas(page)).toHaveAttribute("data-actual-head", headId(state));
});

test("explanatory hops pause, resume and replay without rerunning Git or racing later commands", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/branches#V08");
  await seek(page, 3);
  await page.getByRole("button", { name: "Replay step", exact: true }).click();
  await expect(canvas(page)).toHaveAttribute("data-beat", "0");
  await expect(page.locator(".guided-parent-edge")).toHaveCount(0);
  await page.clock.runFor(900);
  await expect(canvas(page)).toHaveAttribute("data-beat", "1");
  await expect(page.locator(".guided-parent-edge")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  const paused = await camera(page);
  await page.clock.fastForward(6000);
  await expect(canvas(page)).toHaveAttribute("data-beat", "1");
  expect(await camera(page)).toEqual(paused);
  await page
    .getByRole("button", { name: "Resume animation", exact: true })
    .click();
  await page.clock.runFor(900);
  await expect(page.locator(".guided-parent-edge")).toHaveCount(2);
  await seek(page, 4);
  await page.clock.fastForward(10000);
  await expect(page.locator(".guided-parent-edge")).toHaveCount(1);
  await expect(canvas(page)).toHaveAttribute(
    "data-focus-targets",
    resolve(state, "HEAD^2"),
  );
  await expect(page.locator(".history-node")).toHaveCount(state.commits.length);
});

test("manual camera survives a new command; following, overview and fullscreen stay controllable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/branches#V08");
  await seek(page, 3);
  const surface = await canvas(page).boundingBox();
  await page.mouse.move(surface.x + 25, surface.y + surface.height - 25);
  await page.mouse.down();
  await page.mouse.move(surface.x + 90, surface.y + surface.height - 65, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Follow the action", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  const manual = await camera(page);
  await seek(page, 4);
  expect(await camera(page)).toEqual(manual);
  await page
    .getByRole("button", { name: "Follow the action", exact: true })
    .click();
  await expect.poll(() => camera(page)).not.toEqual(manual);
  await page
    .getByRole("button", { name: "Fullscreen graph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Commit graph fullscreen" }),
  ).toBeVisible();
  await expect(page.locator(".guided-fullscreen-caption")).toContainText(
    "Inspecting HEAD^2",
  );
  await expect(canvas(page)).toHaveAttribute(
    "data-focus-targets",
    resolve(state, "HEAD^2"),
  );
  await page.keyboard.press("Escape");
  await expect(canvas(page)).toHaveAttribute(
    "data-focus-targets",
    resolve(state, "HEAD^2"),
  );
});

test("branch attachment and detached checkout are visibly different from inspection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/branches#V07");
  await seek(page, 1);
  const original = await canvas(page).getAttribute("data-actual-head");
  await seek(page, 2);
  await expect(canvas(page)).toHaveAttribute("data-actual-head", original);
  await expect(
    page.locator('.guided-ref[data-reference="feature/login"]'),
  ).toHaveAttribute("data-active", "true");
  await expect(page.locator(".vl-focus-caption")).toContainText("same commit");
  await seek(page, 7);
  await expect(page.locator(".vl-head-attachment")).toContainText(
    "HEAD → main",
  );
  const inspected = await canvas(page).getAttribute("data-focus-targets");
  await seek(page, 8);
  await expect(canvas(page)).toHaveAttribute("data-actual-head", inspected);
  await expect(page.locator(".vl-head-attachment")).toContainText("(detached)");
  await expect(page.locator('.guided-ref[data-active="true"]')).toHaveCount(0);
  await seek(page, 9);
  await expect(page.locator(".vl-head-attachment")).toContainText(
    "HEAD → main",
  );
});

test("manual inspection preserves the checkout and command focus can be restored", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/branches#V08");
  await seek(page, 5);
  const selected = page.locator(".vl-focus-commits button").first();
  const id = await selected.getAttribute("data-selected-commit");
  await selected.click();
  await expect(canvas(page)).toHaveAttribute("data-focus-kind", "manual");
  await expect(canvas(page)).toHaveAttribute("data-focus-targets", id);
  await expect(canvas(page)).toHaveAttribute("data-actual-head", headId(state));
  await page.getByText("Inspect selected snapshot", { exact: true }).click();
  await expect(page.locator(".vl-selected-snapshot")).toContainText("Parents:");
  await page.getByRole("button", { name: "Return to command focus" }).click();
  await expect(canvas(page)).toHaveAttribute("data-focus-kind", "range");
  await expect(page.locator('.history-node[data-selected="true"]')).toHaveCount(
    3,
  );
  await seek(page, 4);
  await page
    .locator(`.history-node[data-commit="${resolve(state, "HEAD^2")}"]`)
    .click();
  await expect(canvas(page)).toHaveAttribute("data-focus-kind", "manual");
  await expect(canvas(page)).toHaveAttribute("data-actual-head", headId(state));
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(canvas(page)).toHaveAttribute("data-focus-kind", "range");
});

test("file steps reveal their contents and later commits do not appear early", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/branches#V07");
  const initial = createFixture("history").commits.length;
  await expect(page.locator(".history-node")).toHaveCount(initial);
  await seek(page, 3);
  await expect(
    page
      .locator('[data-area="working"] .vl-file')
      .filter({ hasText: "login.js" }),
  ).toBeVisible();
  await expect(page.locator(".history-node")).toHaveCount(initial);
  await seek(page, 4);
  await expect(
    page
      .locator('[data-area="index"] .vl-file')
      .filter({ hasText: "login.js" }),
  ).toBeVisible();
  await seek(page, 5);
  await expect(canvas(page)).toBeVisible();
  await expect(page.locator(".history-node")).toHaveCount(initial + 1);
});

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`guided focus fits ${viewport.width} and has accessible persistent highlights`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/branches#V08");
    await seek(page, 4);
    await expect(
      page.getByRole("button", { name: "Next step", exact: true }),
    ).toBeInViewport();
    await expect(
      page.locator(`.history-node[data-commit="${resolve(state, "HEAD^2")}"]`),
    ).toBeInViewport();
    expect((await camera(page)).zoom).toBeGreaterThan(0.7);
    const geometry = await page
      .locator(".vl-player")
      .evaluate((element) => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        internal: element.scrollHeight - element.clientHeight,
      }));
    expect(geometry).toEqual({
      width: viewport.width,
      height: viewport.height,
      internal: 0,
    });
    const audit = await new AxeBuilder({ page }).analyze();
    expect(
      audit.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `.local/visual-focus-${viewport.width}.png`,
    });
  });
}
