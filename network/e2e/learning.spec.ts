import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function cidr(page: Page) {
  await page.goto("/");
  if (
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
  await page
    .getByRole("button", { name: "IP & CIDR playground", exact: true })
    .click();
}

test("address practice explains reservations and requires an explicit allocation", async ({
  page,
}) => {
  await cidr(page);
  await page
    .getByRole("button", { name: "Load 8-address example", exact: true })
    .click();
  await expect(page.locator(".address-counts")).toContainText("6 available");
  await page
    .getByRole("button", { name: "192.168.1.0, Reserved", exact: true })
    .click();
  await expect(page.locator(".address-detail")).toContainText(
    "network address",
  );
  await expect(
    page.getByRole("button", { name: "Mark as used", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "192.168.1.1, Available", exact: true })
    .click();
  await expect(page.locator(".address-counts")).toContainText("6 available");
  await page.getByRole("button", { name: "Mark as used", exact: true }).click();
  await expect(page.locator(".address-counts")).toContainText("5 available");
  await page
    .getByRole("button", { name: "Show address list", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "192.168.1.1, Used", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Release address", exact: true })
    .click();
  await expect(page.locator(".address-counts")).toContainText("6 available");
  await page
    .getByRole("button", { name: "192.168.1.0, Reserved", exact: true })
    .focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("button", { name: "192.168.1.1, Available", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("spinbutton", { name: "CIDR prefix", exact: true })
    .fill("31");
  await expect(page.locator(".address-counts")).toContainText("2 available");
  await page.getByRole("button", { name: "AWS subnet", exact: true }).click();
  await expect(page.locator(".address-panel")).toContainText(
    "Choose a valid AWS subnet size",
  );
  await page
    .getByRole("spinbutton", { name: "CIDR prefix", exact: true })
    .fill("28");
  await expect(page.locator(".address-counts")).toContainText("11 available");
  await page
    .getByRole("button", { name: "192.168.1.2, Reserved", exact: true })
    .click();
  await expect(page.locator(".address-detail")).toContainText("DNS");
});

test("the overlap visual explains contained, separate, normalized and invalid ranges", async ({
  page,
}) => {
  await cidr(page);
  await expect(page.locator(".overlap-result")).toContainText("128 addresses");
  await expect(page.locator(".overlap-result")).toContainText(
    "Network B is entirely inside Network A",
  );
  await page
    .getByRole("button", { name: "Try separate networks", exact: true })
    .click();
  await expect(page.locator(".overlap-result")).toContainText(
    "no addresses in common",
  );
  await expect(page.locator(".range-shared")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Try identical networks", exact: true })
    .click();
  await expect(page.locator(".overlap-result")).toContainText("256 addresses");
  await page.getByLabel("Network B", { exact: true }).fill("192.168.1.154/25");
  await expect(page.locator(".overlap-panel")).toContainText(
    "normalized to 192.168.1.128/25",
  );
  await page.getByLabel("Network B", { exact: true }).fill("invalid");
  await expect(page.locator(".overlap-result")).toHaveCount(0);
  await expect(page.locator(".overlap-panel [role=alert]")).toBeVisible();
  await page
    .getByRole("button", { name: "Try overlapping networks", exact: true })
    .click();
  await page.locator(".overlap-panel summary").click();
  await expect(page.locator(".overlap-panel")).toContainText(
    "Counting both endpoints gives 128",
  );
});

for (const fallback of [false, true]) {
  test(`network fullscreen preserves the working experiment (${fallback ? "fallback" : "native"})`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() => {
        Element.prototype.requestFullscreen = () =>
          Promise.reject(new Error("Unavailable"));
      });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Explore the tools", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Send packet", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Skip to result", exact: true })
      .click();
    const viewport = page.locator(".react-flow__viewport");
    await page.getByRole("button", { name: "Zoom In", exact: true }).click();
    // Wait for the library's animated viewport transition to finish before recording it.
    await page.waitForTimeout(400);
    const before = await viewport.getAttribute("style");
    const enter = page.getByRole("button", {
      name: "Fullscreen: Network diagram",
      exact: true,
    });
    await enter.click();
    const dialog = page.getByRole("dialog", {
      name: "Network diagram",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".canvas-wrap")).toBeInViewport({ ratio: 0.5 });
    await expect(dialog.locator(".playback")).toBeInViewport();
    await expect(dialog.locator(".current-event h3")).toBeInViewport();
    if (!fallback)
      await expect
        .poll(() => page.evaluate(() => !!document.fullscreenElement))
        .toBe(true);
    await expect(dialog.locator(".result-badge")).toHaveText("Delivered");
    await dialog.getByRole("button", { name: "Replay", exact: true }).click();
    await dialog.getByRole("button", { name: "Pause", exact: true }).click();
    await dialog.getByRole("button", { name: "Next hop", exact: true }).click();
    const position = await dialog
      .getByLabel("Packet journey position")
      .inputValue();
    if (fallback) await page.keyboard.press("Escape");
    else
      await dialog
        .getByRole("button", {
          name: "Exit fullscreen: Network diagram",
          exact: true,
        })
        .click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByLabel("Packet journey position")).toHaveValue(
      position,
    );
    await expect(viewport).toHaveAttribute("style", before!);
    await expect(enter).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Networking glossary", exact: true }),
    ).toBeEnabled();
  });
}

test("an expanded address view retains allocations and returns keyboard focus", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error("Unavailable"));
  });
  await cidr(page);
  await page
    .getByRole("button", { name: "Load 8-address example", exact: true })
    .click();
  const enter = page.getByRole("button", {
    name: "Fullscreen: Which IP addresses can I use?",
    exact: true,
  });
  await enter.click();
  const dialog = page.getByRole("dialog", {
    name: "Which IP addresses can I use?",
    exact: true,
  });
  await dialog
    .getByRole("button", { name: "192.168.1.1, Available", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Mark as used", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(enter).toBeFocused();
  await expect(page.locator(".address-counts")).toContainText("5 available");
  await expect(
    page.getByRole("button", { name: "Release address", exact: true }),
  ).toBeVisible();
});

test("lessons restore a user's experiment and remember demonstrated understanding", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('.react-flow__node[data-id="pc1"]').click();
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("My original computer");
  await page.getByRole("textbox", { name: "Name", exact: true }).press("Enter");
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect the workstation", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveValue("Workstation");
  await page
    .getByRole("button", { name: "Next lesson step", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Send the example request", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Skip to result", exact: true })
    .click();
  await expect(page.locator(".current-event")).toContainText(
    "The exchange is complete",
  );
  await page
    .getByRole("button", { name: "Next lesson step", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Identifying a network interface so data can reach it",
      exact: true,
    })
    .click();
  await expect(page.locator(".quiz-feedback")).toContainText("That's right");
  await page
    .getByRole("button", { name: "Return to my experiment", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveValue("My original computer");
  await page.reload();
  await page
    .getByRole("button", { name: "Networking fundamentals", exact: true })
    .click();
  await expect(page.locator(".lesson-progress")).toContainText("1 of 8");
  await expect(
    page.getByRole("button", {
      name: "Repeat: Devices and addresses",
      exact: true,
    }),
  ).toBeVisible();
});

test("the glossary and text-size preference are usable and persist", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Text size", { exact: true }).selectOption("large");
  await page.reload();
  await expect(page.getByLabel("Text size", { exact: true })).toHaveValue(
    "large",
  );
  await page
    .getByRole("button", { name: "Networking glossary", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Networking glossary",
    exact: true,
  });
  await dialog
    .getByLabel("Search networking terms", { exact: true })
    .fill("ARP");
  await expect(
    dialog.getByRole("heading", { name: "ARP", exact: true }),
  ).toBeVisible();
  await expect(dialog).toContainText("Address Resolution Protocol");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Networking glossary", exact: true }),
  ).toBeFocused();
});

for (const width of [1366, 1280, 1024, 390]) {
  test(`learning tools reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 720 });
    await cidr(page);
    await page.getByLabel("Text size", { exact: true }).selectOption("extra");
    await page
      .getByRole("button", { name: "Load 8-address example", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "192.168.1.1, Available", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 1280) {
      await page.screenshot({
        path: ".local/learning-cidr-laptop.png",
        fullPage: true,
      });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}

test("reduced motion starts packet playback paused with readable explanations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Packet journey position")).toHaveValue("0");
  await page.getByRole("button", { name: "Next hop", exact: true }).click();
  await expect(page.getByLabel("Packet journey position")).toHaveValue("1");
  await expect(page.locator(".trace-teaching")).toBeVisible();
});
