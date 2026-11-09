import { expect, test } from "@playwright/test";

test("a beginner can connect nodes without dragging, test traffic, and undo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await page.getByRole("button", { name: "Computer", exact: true }).click();
  await page
    .getByRole("button", { name: "Connect nodes", exact: true })
    .click();
  const first = page.getByLabel("First node", { exact: true });
  const second = page.getByLabel("Second node", { exact: true });
  // Opening the form preselects the device selected on the canvas.
  await expect(first.locator("option:checked")).toContainText("Computer 4");
  await second.selectOption("sw1");
  await expect(page.locator(".connection-feedback")).toContainText(
    "both directions",
  );
  await page.getByRole("button", { name: "Add cable", exact: true }).click();
  await expect(page.locator(".react-flow__edge")).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "Add cable", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".connection-feedback")).toContainText(
    "already have a cable",
  );
  await page
    .getByLabel("Packet destination", { exact: true })
    .fill("192.168.1.14");
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await page
    .getByRole("button", { name: "Skip to result", exact: true })
    .click();
  await expect(page.locator(".result-badge")).toHaveText("Delivered");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".react-flow__edge")).toHaveCount(2);
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await page
    .getByRole("button", { name: "Skip to result", exact: true })
    .click();
  await expect(page.locator(".result-badge")).toHaveText("Dropped");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.locator(".react-flow__edge")).toHaveCount(3);
  await page.screenshot({
    path: ".local/manual-connections.png",
    fullPage: true,
  });
});

test("cloud connections explain unsupported pairs and show updated associations", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "AWS VPC builder", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Basic public/private lab", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Connect nodes", exact: true })
    .click();
  await page.getByLabel("First node", { exact: true }).selectOption("web");
  await page.getByLabel("Second node", { exact: true }).selectOption("app");
  const apply = page.getByRole("button", {
    name: "Apply connection",
    exact: true,
  });
  await expect(apply).toBeDisabled();
  await expect(page.locator(".connection-feedback")).toContainText(
    "cannot be joined directly",
  );
  await page.getByLabel("First node", { exact: true }).selectOption("sg-app");
  await page.getByLabel("Second node", { exact: true }).selectOption("web");
  await expect(page.locator(".connection-feedback")).toContainText("replaces");
  await apply.click();
  await expect(
    page.locator('.react-flow__edge[data-id="logical-web-sg-app"]'),
  ).toBeAttached();
  await expect(
    page.locator('.react-flow__edge[data-id="logical-web-sg-web"]'),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.locator('.react-flow__edge[data-id="logical-web-sg-web"]'),
  ).toBeAttached();
});

test("manual connection controls fit a small screen and work with the keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", {
    name: "Connect nodes",
    exact: true,
  });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const first = page.getByLabel("First node", { exact: true });
  await expect(first).toBeFocused();
  await first.selectOption("pc1");
  await page.getByLabel("Second node", { exact: true }).selectOption("pc1");
  await expect(page.locator(".connection-feedback")).toContainText(
    "two different nodes",
  );
  await expect(
    page.getByRole("button", { name: "Add cable", exact: true }),
  ).toBeDisabled();
  await expect(page.getByLabel("Second node", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await first.focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
