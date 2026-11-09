import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { scenarios } from "../../lib/scenario-engine.js";
import { incidents } from "../../lib/incident-labs.js";
const command = async (page, text) => {
  await page
    .getByRole("textbox", { name: "Git command", exact: true })
    .fill(text);
  await page.getByRole("button", { name: "Run command", exact: true }).click();
};
for (const [width, height] of [
  [1920, 1080],
  [1366, 768],
  [1280, 720],
])
  test(`desktop workspace fits ${width}×${height}, expanded rail and long output`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/playground");
    await expect(
      page.getByRole("textbox", { name: "Git command", exact: true }),
    ).toBeVisible();
    async function geometry() {
      return page.evaluate(() => {
        const boxes = [
          ...document.querySelectorAll(
            ".repo-pane,.history-pane,.terminal-pane",
          ),
        ].map((e) => {
          const r = e.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom };
        });
        return {
          boxes,
          h: innerHeight,
          sh: document.documentElement.scrollHeight,
          w: innerWidth,
          sw: document.documentElement.scrollWidth,
        };
      });
    }
    for (const expanded of [false, true]) {
      if (expanded)
        await page
          .getByRole("button", { name: "Expand navigation", exact: true })
          .click();
      const d = await geometry();
      expect(d.sh).toBeLessThanOrEqual(d.h);
      expect(d.sw).toBeLessThanOrEqual(d.w);
      expect(new Set(d.boxes.slice(0, 4).map((b) => b.y)).size).toBe(1);
      expect(d.boxes[4].y).toBe(d.boxes[5].y);
      expect(d.boxes[5].h).toBeGreaterThan(240);
      for (const b of d.boxes) expect(b.b).toBeLessThanOrEqual(d.h);
    }
    for (let i = 0; i < 18; i++) await command(page, "help");
    const d = await geometry();
    expect(d.sh).toBe(d.h);
    expect(
      await page
        .locator(".terminal-output")
        .evaluate((e) => e.scrollHeight > e.clientHeight),
    ).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Collapse navigation" }),
    ).toBeVisible();
  });
for (const id of [
  "first-commit",
  "index-snapshot",
  "conflict",
  "rebase",
  "clone",
  "fetch-only",
  "pull-rebase",
  "rejected-push",
  "ignore",
  "reflog-recovery",
])
  test(`complete verified workflow ${id}`, async ({ page }) => {
    const s = scenarios.find((s) => s.id === id);
    await page.goto("/scenarios/" + id);
    for (const step of s.steps) {
      await page.getByRole("button", { name: "Load step" }).click();
      await expect(
        page.getByRole("textbox", { name: "Git command", exact: true }),
      ).toHaveValue(step.command);
      await page
        .getByRole("button", { name: "Run command", exact: true })
        .click();
    }
    await expect(
      page.getByText("All steps verified.", { exact: false }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Reset scenario" }).click();
    await expect(
      page.getByText(`Guided lab · Step 1 of ${s.steps.length}`, {
        exact: false,
      }),
    ).toBeVisible();
    await page.goto("/progress");
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("gitquest-progress-v1")).verified,
      ),
    ).toContain(id);
  });
test("file editor snapshots, history keys, autocomplete and clear", async ({
  page,
}) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "Create file", exact: true }).click();
  await page.getByLabel("Filename", { exact: true }).fill("new.txt");
  await page.getByLabel("Contents", { exact: true }).fill("New content");
  await page.getByRole("button", { name: "Save working file" }).click();
  await command(page, "git add new.txt");
  await expect(
    page
      .getByRole("region", { name: "Staging area", exact: true })
      .getByRole("button", { name: "new.txt staged" }),
  ).toBeVisible();
  await command(page, 'git commit -m "Save new file"');
  await page
    .getByRole("textbox", { name: "Git command", exact: true })
    .press("ArrowUp");
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toHaveValue('git commit -m "Save new file"');
  await page
    .getByRole("textbox", { name: "Git command", exact: true })
    .fill("git fet");
  await page
    .getByRole("textbox", { name: "Git command", exact: true })
    .press("Tab");
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toHaveValue("git fetch origin");
  await page.getByRole("button", { name: "Clear terminal" }).click();
  await expect(page.getByRole("log")).toBeEmpty();
});
test("teammate push, independent tracking, graph inspection and resize controls", async ({
  page,
}) => {
  await page.goto("/playground");
  await command(page, "git add .");
  await command(page, 'git commit -m "Save local"');
  await page.getByRole("button", { name: "Simulate teammate push" }).click();
  await command(page, "git push origin main");
  await expect(page.getByRole("log")).toContainText("Push rejected");
  await command(page, "git fetch");
  await command(page, "git merge origin/main");
  await command(page, "git push origin main");
  await expect(page.getByRole("log")).toContainText(
    "Remote history now contains",
  );
  await page.getByRole("button", { name: /Merge branch/ }).click();
  await expect(page.locator(".commit-inspector")).toContainText(
    "Local + remote",
  );
  await page.getByRole("button", { name: "Close commit details" }).click();
  await page.getByRole("button", { name: "Zoom out" }).click();
  await page.getByRole("button", { name: "Fit graph" }).click();
  await page.getByRole("slider", { name: "Graph width" }).fill("60");
});
test("all 80 questions, filters, reveal, linked lesson and revision persist", async ({
  page,
}) => {
  await page.goto("/interview");
  await expect(page.locator(".interview-entry")).toHaveCount(80);
  await page.getByLabel("Filter level").selectOption("Tricky Scenarios");
  await expect(page.locator(".interview-entry")).toHaveCount(23);
  await page
    .getByRole("button", { name: "Save Q59 for revision", exact: true })
    .click();
  await page
    .locator("#q59")
    .getByRole("button", { name: "Reveal source answer" })
    .click();
  await expect(page.locator("#q59")).toContainText("Revoke or rotate");
  await page.reload();
  await page.getByLabel(/Show my revision list/).check();
  await expect(page.locator(".interview-entry")).toHaveCount(1);
  await expect(page.locator(".interview-entry")).toContainText(
    "Accidentally committed secrets",
  );
  await page.goto("/interview?q=80");
  await expect(page.locator(".interview-entry")).toHaveCount(1);
  await expect(page.locator(".interview-entry")).toContainText("Same conflict");
});
test("lesson chapters and knowledge check record actual assessment", async ({
  page,
}) => {
  await page.goto("/learn/q02");
  await expect(page.locator(".lesson-chapters h2")).toBeVisible();
  await page.getByRole("tab", { name: "Verify", exact: true }).click();
  await page
    .getByRole("button", {
      name: "The staged snapshot, unless you stage again.",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await page.reload();
  await expect(page.getByText("✓ Knowledge check completed")).toBeVisible();
});
test("incident diagnosis, remediation and verification complete separately", async ({
  page,
}) => {
  const incident = incidents.find((i) => i.number === 59);
  await page.goto("/scenarios/incident-59");
  for (const text of [
    incident.cause,
    incident.remediation,
    incident.verification,
  ]) {
    await page.getByRole("button", { name: text, exact: true }).click();
    await page
      .getByRole("button", { name: /Next checkpoint|Complete assessment/ })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Decision sequence completed." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("gitquest-progress-v1")).assessments,
    ),
  ).toContain("incident-59");
});
test("machine OS instructions and manual completion never imply simulator verification", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/scenarios/first-commit");
  await page.getByRole("button", { name: "On my computer" }).click();
  await expect(page.getByRole("dialog")).toContainText("PowerShell");
  await page.getByLabel("Operating system and shell").selectOption("mac");
  await expect(page.getByRole("dialog")).toContainText("mkdir");
  for (const box of await page.getByRole("dialog").getByRole("checkbox").all())
    await box.check();
  await page
    .getByRole("button", { name: "Record my self-reported completion" })
    .click();
  const p = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("gitquest-progress-v1")),
  );
  expect(p.machine).toContain("first-commit");
  expect(p.verified).not.toContain("first-commit");
});
test("mobile panel selector, drawer, terminal and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/scenarios/first-commit");
  await page.getByRole("tab", { name: "Terminal", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toBeVisible();
  await command(page, "git init -b main");
  await page.getByRole("tab", { name: "Commit graph", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Interactive commit graph" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Interview Practice" })
    .click();
  await expect(page.locator("h1")).toHaveText("Explain it with confidence.");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
test("long history fits the graph camera without expanding the page", async ({
  page,
}) => {
  await page.goto("/playground");
  for (let i = 0; i < 14; i++) {
    await command(page, `echo "${i}" > many.txt`);
    await command(page, "git add .");
    await command(page, `git commit -m "Commit ${i}"`);
  }
  await page.getByRole("button", { name: "Fit graph", exact: true }).click();
  expect(
    Number(
      await page.locator(".graph-surface").getAttribute("data-camera-zoom"),
    ),
  ).toBeLessThan(0.4);
  const contained = await page.locator(".graph-surface").evaluate((el) => {
    const box = el.getBoundingClientRect();
    return [...el.querySelectorAll(".history-node circle")].every((node) => {
      const r = node.getBoundingClientRect();
      return (
        r.left >= box.left &&
        r.right <= box.right &&
        r.top >= box.top &&
        r.bottom <= box.bottom
      );
    });
  });
  expect(contained).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    720,
  );
});
test("primary routes have no accessibility violations or runtime errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/playground",
    "/learn/q01",
    "/scenarios",
    "/scenarios/incident-59",
    "/interview",
    "/progress",
    "/branches",
  ]) {
    await page.goto(route);
    const a = await new AxeBuilder({ page }).analyze();
    expect(
      a.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test("all generated lessons and scenario routes load without missing content", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of [
    ...Array.from(
      { length: 80 },
      (_, i) => "/learn/q" + String(i + 1).padStart(2, "0"),
    ),
    ...scenarios.map((s) => "/scenarios/" + s.id),
    ...incidents.map((i) => "/scenarios/" + i.id),
  ]) {
    const r = await page.goto(path);
    expect(r.status(), path).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
