import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const views = [
  {
    name: "native laptop",
    width: 1366,
    height: 768,
    expanded: true,
    fallback: false,
    extra: false,
  },
  {
    name: "fallback laptop with large text",
    width: 1024,
    height: 768,
    expanded: true,
    fallback: true,
    extra: true,
  },
  {
    name: "mobile",
    width: 390,
    height: 844,
    expanded: false,
    fallback: false,
    extra: false,
  },
];

async function openLab(page: Page, view: (typeof views)[number]) {
  await page.setViewportSize({ width: view.width, height: view.height });
  await page.emulateMedia({ reducedMotion: "reduce" });
  if (view.fallback)
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () =>
        Promise.reject(new Error("Test fallback"));
    });
  await page.goto("/");
  const navigation = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  if (await navigation.isVisible()) await navigation.click();
  await page
    .getByRole("button", { name: "NAT gateway laboratory", exact: true })
    .click();
  if (view.extra)
    await page.getByLabel("Text size", { exact: true }).selectOption("extra");
  if (view.expanded)
    await page
      .getByRole("button", { name: "Fullscreen: Network diagram", exact: true })
      .click();
}

async function activeStepIsInsideStrip(page: Page) {
  await expect
    .poll(() =>
      page.locator(".event-strip").evaluate((strip) => {
        const selected = strip
          .querySelector('[aria-current="step"]')!
          .getBoundingClientRect();
        const box = strip.getBoundingClientRect();
        return selected.left >= box.left - 1 && selected.right <= box.right + 1;
      }),
    )
    .toBe(true);
}

for (const view of views) {
  test(`all packet stages remain reachable in ${view.name}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await openLab(page, view);
    await page.getByLabel("Packet source", { exact: true }).selectOption("app");
    await page
      .getByLabel("Packet destination", { exact: true })
      .fill("8.8.8.8");
    await page
      .getByLabel("Packet protocol", { exact: true })
      .selectOption("TCP");
    await page.getByLabel("Destination port", { exact: true }).fill("443");
    await page
      .getByRole("button", { name: "Send packet", exact: true })
      .click();
    const slider = page.getByLabel("Packet journey position", { exact: true });
    const last = Number(await slider.getAttribute("max"));
    expect(last).toBeGreaterThan(5);
    await activeStepIsInsideStrip(page);
    await slider.focus();
    await slider.press("End");
    await expect(slider).toHaveValue(String(last));
    await activeStepIsInsideStrip(page);
    await expect(page.locator(".flow-count")).toHaveText(
      `Step ${last + 1} of ${last + 1}`,
    );
    await expect(page.locator(".result-badge")).toHaveText("Delivered");
    if (view.expanded) {
      await expect(page.locator(".journey-timeline")).toBeInViewport({
        ratio: 1,
      });
      await expect(page.locator(".current-event h3")).toBeInViewport({
        ratio: 1,
      });
      await expect(page.locator(".canvas-wrap")).toBeInViewport({ ratio: 1 });
      const flow = (await page.locator(".journey-timeline").boundingBox())!;
      const canvas = (await page.locator(".canvas-wrap").boundingBox())!;
      expect(flow.y).toBeGreaterThanOrEqual(canvas.y + canvas.height - 1);
      expect(flow.width).toBeGreaterThan(view.width - 5);
      expect(canvas.height).toBeGreaterThan(300);
      await expect
        .poll(() =>
          page.locator(".canvas-wrap").evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            return Array.from(
              element.querySelectorAll(".react-flow__node"),
            ).every((node) => {
              const box = node.getBoundingClientRect();
              return (
                box.top >= bounds.top - 1 &&
                box.bottom <= bounds.bottom + 1 &&
                box.left >= bounds.left - 1 &&
                box.right <= bounds.right + 1
              );
            });
          }),
        )
        .toBe(true);
    }
    const later = page.getByRole("button", {
      name: "Scroll to later steps",
      exact: true,
    });
    await expect(later).toBeDisabled();
    const earlier = page.getByRole("button", {
      name: "Scroll to earlier steps",
      exact: true,
    });
    await earlier.click();
    await expect(later).toBeEnabled();
    await slider.focus();
    await slider.press("Home");
    await expect(slider).toHaveValue("0");
    await activeStepIsInsideStrip(page);
    await expect(earlier).toBeDisabled();
    for (let i = 0; i < 6; i++) await slider.press("ArrowRight");
    await expect(slider).toHaveValue("6");
    await activeStepIsInsideStrip(page);
    await page.getByLabel("Playback speed", { exact: true }).selectOption("4");
    const position = Number(await slider.inputValue());
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await expect
      .poll(async () => Number(await slider.inputValue()))
      .toBeGreaterThan(position + 2);
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await activeStepIsInsideStrip(page);
    if (view.expanded) {
      await page.screenshot({ path: `.local/packet-flow-${view.width}.png` });
      const selected = await slider.inputValue();
      await page
        .getByRole("button", {
          name: "Exit fullscreen: Network diagram",
          exact: true,
        })
        .click();
      await expect(slider).toHaveValue(selected);
      await activeStepIsInsideStrip(page);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });

  test(`terminal follows new output and keeps the command usable in ${view.name}`, async ({
    page,
  }) => {
    await openLab(page, view);
    await page.getByRole("button", { name: "Terminal", exact: true }).click();
    const command = page.getByRole("textbox", {
      name: "Terminal command",
      exact: true,
    });
    const output = page.getByRole("log", {
      name: "Terminal output",
      exact: true,
    });
    for (let i = 0; i < 9; i++) {
      await command.fill("ip route");
      await command.press("Enter");
    }
    await expect
      .poll(() =>
        output.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      )
      .toBe(true);
    await output.evaluate((element) => {
      element.scrollTop = 0;
    });
    await command.fill("curl https://example.net");
    await page.getByRole("button", { name: "Run ↵", exact: true }).click();
    await expect(output).toContainText("HTTP/1.1 200 OK");
    await expect
      .poll(() =>
        output.evaluate((element) =>
          Math.abs(
            element.scrollHeight - element.scrollTop - element.clientHeight,
          ),
        ),
      )
      .toBeLessThan(2);
    await expect(
      output.locator(".terminal-output-entry").last(),
    ).toBeInViewport({ ratio: 1 });
    await expect(command).toBeInViewport({ ratio: 1 });
    await expect(command).toBeFocused();
    await page.locator(".terminal-learning summary").click();
    await page
      .getByRole("button", {
        name: "ip addr Show this device's network addresses.",
        exact: true,
      })
      .click();
    await expect(command).toHaveValue("ip addr");
    await expect(command).toBeFocused();
    await expect(command).toBeInViewport({ ratio: 1 });
    await command.press("Enter");
    await expect(
      output.locator(".terminal-output-entry").last(),
    ).toBeInViewport({ ratio: 1 });
    if (view.expanded)
      await page.screenshot({
        path: `.local/terminal-output-${view.width}.png`,
      });
    await page
      .getByRole("button", { name: "Packet journey", exact: false })
      .click();
    await page.getByRole("button", { name: "Terminal", exact: true }).click();
    await expect(
      output.locator(".terminal-output-entry").last(),
    ).toBeInViewport({ ratio: 1 });
    await command.fill("clear");
    await command.press("Enter");
    await expect(output).toBeEmpty();
    await expect(command).toBeFocused();
    await command.fill("ip addr");
    await command.press("Enter");
    await expect(output).not.toBeEmpty();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
