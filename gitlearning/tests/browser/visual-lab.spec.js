import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { visualLessons } from "../../lib/visual-lab/curriculum.js";

const timeline = (page) =>
  page.getByRole("slider", { name: "Lesson timeline" });
const seek = (page, cursor) => timeline(page).fill(String(cursor));
const area = (page, name) => page.locator(`.vl-area[data-area="${name}"]`);
const progress = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("gitquest-progress-v1")));

test("lifecycle shows independent snapshots and commits once across seek, back and replay", async ({
  page,
}) => {
  await page.goto("/branches");
  await expect(
    page.getByRole("heading", { name: "Git Visual Lab", exact: true }),
  ).toBeVisible();
  await expect(timeline(page)).toHaveValue("0");
  await seek(page, 4);
  await expect(area(page, "working")).toContainText("Version B");
  await expect(area(page, "index")).toContainText("Version A");
  await expect(area(page, "local")).toContainText("No saved snapshot");
  await expect(
    page.getByText("PAUSE & PREDICT", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Version A — the staged snapshot",
      exact: true,
    })
    .click();
  await expect
    .poll(async () => (await progress(page)).visualLab.records.L01.passed)
    .toBe(true);
  await seek(page, 7);
  await expect(area(page, "local")).toContainText("Version A");
  await expect(area(page, "working")).toContainText("Version B");
  await expect(page.locator(".history-node")).toHaveCount(1);
  await page.getByRole("button", { name: "Replay step", exact: true }).click();
  await expect(page.locator(".history-node")).toHaveCount(1);
  await page.getByRole("button", { name: "Previous step" }).click();
  await expect(page.locator(".history-node")).toHaveCount(0);
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.locator(".history-node")).toHaveCount(1);
  await page
    .getByTitle("Inspect README.md in Local commit", { exact: true })
    .click();
  const inspector = page.getByRole("dialog", {
    name: "File snapshots: README.md",
  });
  await expect(inspector).toBeVisible();
  await expect(inspector).toContainText("Version A");
  await expect(inspector).toContainText("Version B");
  await page.keyboard.press("Escape");
  await expect(inspector).not.toBeVisible();
  await seek(page, 10);
  await expect(area(page, "remote")).toContainText("Nothing published here");
  await seek(page, 11);
  await expect(area(page, "remote")).toContainText("Version B");
  await expect(page.locator(".history-node")).toHaveCount(2);
  await expect(page.locator(".vl-history")).toContainText("origin/main");
  await expect(page.locator(".vl-history")).toContainText("remote/main");
  await seek(page, 12);
  await expect(
    page.getByRole("button", { name: "Play lesson", exact: true }),
  ).toBeDisabled();
  await expect
    .poll(async () => (await progress(page)).visualLab.records.L01.viewed)
    .toBe(true);
  expect((await progress(page)).verified).toEqual([]);
  expect((await progress(page)).lessons).toEqual([]);
  await page.reload();
  await expect(timeline(page)).toHaveValue("12");
  await expect(
    page.getByRole("button", { name: "Play lesson", exact: true }),
  ).toBeDisabled();
});

test("one playback clock stops at checkpoints, inspections, topic selection and hidden tabs", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/branches");
  await seek(page, 3);
  await page.getByRole("button", { name: "Play lesson", exact: true }).click();
  await page.clock.fastForward(4700);
  await expect(timeline(page)).toHaveValue("4");
  await expect(
    page.getByRole("button", { name: "Play lesson", exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(20000);
  await expect(timeline(page)).toHaveValue("4");
  await page.getByRole("button", { name: "Play lesson", exact: true }).click();
  await page
    .getByTitle("Inspect README.md in Working files", { exact: true })
    .click();
  await page.clock.fastForward(10000);
  await expect(timeline(page)).toHaveValue("4");
  await page.keyboard.press("Escape");
  await page
    .getByRole("combobox", { name: "Playback speed" })
    .selectOption("2");
  await page.getByRole("button", { name: "Play lesson", exact: true }).click();
  await page.getByRole("button", { name: "Choose topic", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("combobox", { name: "Playback speed" }),
  ).toHaveValue("2");
  await page.clock.fastForward(10000);
  await expect(timeline(page)).toHaveValue("4");
  await page.getByRole("button", { name: "Play lesson", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.fastForward(10000);
  await expect(timeline(page)).toHaveValue("4");
});

test("all topics render, searchable selection preserves progress, and transcript can seek", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/branches");
  for (const lesson of visualLessons) {
    await page
      .getByRole("button", { name: "Choose topic", exact: true })
      .click();
    const picker = page.getByRole("dialog", { name: "Choose a visual lesson" });
    await picker
      .getByRole("searchbox", { name: "Search visual lessons" })
      .fill(lesson.title);
    await picker
      .getByRole("button", {
        name: new RegExp(lesson.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .click();
    await expect(
      page.getByRole("heading", { name: lesson.title, exact: true }),
    ).toBeVisible();
    await seek(page, lesson.steps.length);
    await expect(
      page.getByText("CHECK YOUR UNDERSTANDING", { exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Read transcript", exact: true })
    .click();
  const transcript = page.getByLabel("Lesson transcript");
  await expect(transcript).toContainText(
    "Ignore patterns apply to untracked files.",
  );
  await transcript.getByRole("button", { name: /Step 1/ }).click();
  await expect(timeline(page)).toHaveValue("1");
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Ignore generated files correctly",
      exact: true,
    }),
  ).toBeVisible();
  await expect(timeline(page)).toHaveValue("1");
  expect(errors).toEqual([]);
});

test("lesson links switch an open tab and browser history restores saved checkpoints", async ({
  page,
}) => {
  await page.goto("/branches#V08");
  await seek(page, 3);
  await page.goto("/branches#V07");
  await expect(
    page.getByRole("heading", { name: "Create, switch & build a branch", exact: true }),
  ).toBeVisible();
  await expect(timeline(page)).toHaveAttribute("max", "9");
  await seek(page, 8);
  await expect(page.locator(".vl-head-attachment")).toContainText("(detached)");

  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "HEAD, parents & revision ranges", exact: true }),
  ).toBeVisible();
  await expect(timeline(page)).toHaveValue("3");
  await expect(page.locator(".guided-parent-edge")).toHaveCount(2);
  await page.goForward();
  await expect(timeline(page)).toHaveValue("8");
  await expect(page.locator(".vl-head-attachment")).toContainText("(detached)");
});

test("keyboard playback leaves graph panning independent and fullscreen pauses the lesson", async ({
  page,
}) => {
  await page.goto("/branches#V07");
  const player = page.getByRole("region", { name: "Visual lesson player" });
  await player.focus();
  await page.keyboard.press("ArrowRight");
  await expect(timeline(page)).toHaveValue("1");
  await page.keyboard.press("ArrowLeft");
  await expect(timeline(page)).toHaveValue("0");
  const graph = page.locator(".graph-surface");
  await graph.focus();
  await page.keyboard.press("ArrowRight");
  await expect(timeline(page)).toHaveValue("0");
  await page.getByRole("button", { name: "Play lesson", exact: true }).click();
  await page
    .getByRole("button", { name: "Fullscreen graph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Commit graph fullscreen" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Play lesson", exact: true }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`visual player fits ${viewport.width}×${viewport.height} and remains accessible`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/branches");
    await seek(page, 4);
    await expect(
      page.getByRole("button", { name: "Next step", exact: true }),
    ).toBeInViewport();
    const geometry = await page.locator(".vl-player").evaluate((element) => {
      const root = document.documentElement;
      return {
        width: root.scrollWidth,
        height: root.scrollHeight,
        playerHeight: element.clientHeight,
        playerScroll: element.scrollHeight,
      };
    });
    expect(geometry.width).toBe(viewport.width);
    expect(geometry.height).toBe(viewport.height);
    expect(geometry.playerScroll).toBeLessThanOrEqual(
      geometry.playerHeight + 1,
    );
    if (viewport.width < 900) {
      await expect(page.locator(".vl-mobile-command")).toContainText(
        'echo "Version B" > README.md',
      );
      await page
        .getByRole("button", { name: "Explanation · Check", exact: true })
        .click();
      await expect(
        page.getByText("PAUSE & PREDICT", { exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Files", exact: true }).click();
      await page
        .getByTitle("Inspect README.md in Working files", { exact: true })
        .click();
      await expect(
        page.getByRole("dialog", { name: "File snapshots: README.md" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Animation", exact: true })
        .click();
      await expect(timeline(page)).toHaveValue("4");
    }
    const audit = await new AxeBuilder({ page }).analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({ path: `.local/visual-lab-${viewport.width}.png` });
  });
}

test("comparison demos preserve the current branch and do not grant lesson mastery", async ({
  page,
}) => {
  await page.goto("/branches");
  await page
    .getByRole("button", { name: "Compare operations", exact: true })
    .click();
  await page.getByRole("button", { name: /Merge the histories/ }).click();
  await expect(page.locator(".head-pointer")).toContainText("feature/login");
  await expect(page.locator(".branch-explanation")).toContainText(
    "feature/login moves to the merge",
  );
  await page.getByRole("button", { name: /Replay the feature/ }).click();
  expect((await progress(page)).lessons).toEqual([]);
  await page
    .getByRole("button", { name: "Guided lessons", exact: true })
    .click();
  await expect(timeline(page)).toHaveValue("0");
});
