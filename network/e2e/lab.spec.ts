import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("local experiment delivers a packet, breaks a gateway, and persists edits", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Local network builder" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".result-badge")).toHaveText("Delivered");
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await page.getByRole("button", { name: "Two networks · one router" }).click();
  await page
    .locator(".react-flow__node")
    .filter({ hasText: "Workstation" })
    .click();
  const gateway = page.getByLabel("Default gateway", { exact: true });
  await gateway.fill("192.168.1.254");
  await gateway.press("Tab");
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".result-badge")).toHaveText("Dropped");
  await expect(page.locator(".current-event")).toContainText("ARP unanswered");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".result-badge")).toHaveText("Delivered");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Load saved project" }).click();
  await expect(page.locator(".experiment-title")).toContainText(
    "Across two networks",
  );
  await page.screenshot({ path: ".local/milestone-1.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("CIDR calculator reacts to prefix changes", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "IP & CIDR playground", exact: true })
    .click();
  await page
    .getByRole("spinbutton", { name: "CIDR prefix", exact: true })
    .fill("26");
  await expect(page.locator(".subnet-splits button")).toHaveCount(4);
  await expect(
    page.locator(".metric").filter({ hasText: "Usable addresses" }),
  ).toContainText("62");
  await page.getByRole("button", { name: "AWS subnet", exact: true }).click();
  await expect(
    page.locator(".metric").filter({ hasText: "Usable addresses" }),
  ).toContainText("59");
});

test("cloud traffic translates through NAT and fails when its gateway is disabled", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "AWS VPC builder", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "AWS VPC builder", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Basic public/private lab", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Test local VPC traffic", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".result-badge")).toHaveText("Delivered");
  await page
    .getByRole("button", { name: "NAT gateway laboratory", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Test private HTTPS", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".result-badge")).toHaveText("Delivered");
  await page.getByRole("button", { name: "NAT table", exact: true }).click();
  await expect(page.locator(".nat-table")).toContainText("10.0.2.10:49152");
  await expect(page.locator(".nat-table")).toContainText("203.0.113.50:55000");
  await page
    .getByRole("button", { name: "Disable NAT gateway", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Packet journey", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Test private HTTPS", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".current-event")).toContainText(
    "NAT gateway is offline",
  );
  await page
    .getByRole("button", { name: "Enable NAT gateway", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Try unsolicited inbound", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".current-event")).toContainText(
    "Unsolicited inbound",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: ".local/cloud-lab.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("the guided build creates a working private internet path from a blank canvas", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "AWS VPC builder", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Build from scratch", exact: true })
    .click();
  await page.locator(".guided-build-toggle").click();
  for (let i = 0; i < 10; i++)
    await page
      .locator(".build-steps .current")
      .getByRole("button", { name: "Build", exact: true })
      .click();
  await expect(page.locator(".build-complete")).toContainText("model verifies");
  await page
    .getByRole("button", { name: "Test private HTTPS", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".result-badge")).toHaveText("Delivered");
  await expect(page.locator(".validation-banner")).toHaveCount(0);
});

test("a challenge is completed only after the learner repairs the security rule", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Troubleshooting challenges", exact: true })
    .click();
  await page
    .getByRole("button", { name: /The website behind the wall/ })
    .click();
  await page
    .getByRole("button", { name: "Verify my fix", exact: true })
    .click();
  await expect(page.locator(".challenge-banner")).not.toHaveClass(/solved/);
  await page
    .getByRole("button", { name: "Security groups & NACLs", exact: true })
    .click();
  await page.getByRole("button", { name: "Web security", exact: true }).click();
  await page.getByRole("button", { name: "Add rule", exact: true }).click();
  await page
    .getByRole("button", { name: "Verify my fix", exact: true })
    .click();
  await expect(page.locator(".challenge-banner")).toHaveClass(/solved/);
  await page
    .getByRole("button", { name: "All challenges", exact: true })
    .click();
  await expect(page.locator(".challenge-progress")).toContainText("1 of 5");
});

test("mobile navigation and CIDR remain within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "IP & CIDR playground", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /Make room/ })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: ".local/mobile-cidr.png", fullPage: true });
});

test("the component library creates a host that can be connected and reached", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Computer", exact: true }).click();
  const host = page
    .locator(".react-flow__node")
    .filter({ hasText: "Computer 4" });
  await expect(host).toBeVisible();
  await page
    .locator('.react-flow__node[data-id="pc1"] .react-flow__handle.source')
    .click();
  await host.locator(".react-flow__handle.target").click();
  await expect(page.locator(".react-flow__edge")).toHaveCount(3);
  await page
    .getByLabel("Packet destination", { exact: true })
    .fill("192.168.1.14");
  await page.getByRole("button", { name: "Send packet", exact: true }).click();
  await page.getByRole("button", { name: "Skip to result" }).click();
  await expect(page.locator(".result-badge")).toHaveText("Delivered");
});

test("terminal commands use real reachability and service decisions", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Terminal", exact: true }).click();
  const command = page.getByRole("textbox", {
    name: "Terminal command",
    exact: true,
  });
  await command.fill("nslookup server.netverse");
  await command.press("Enter");
  await expect(page.locator(".terminal-panel pre")).toContainText(
    "Address: 192.168.1.20",
  );
  await command.fill("curl http://192.168.1.20:9999");
  await command.press("Enter");
  await expect(page.locator(".terminal-panel pre")).toContainText(
    "Connection refused",
  );
  await command.fill("ip route");
  await command.press("Enter");
  await expect(page.locator(".terminal-panel pre")).toContainText(
    "192.168.1.0/24 via connected",
  );
});

test("JSON export round-trips while malformed imports show an error", async ({
  page,
}) => {
  await page.goto("/");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await pending,
    raw = await readFile((await download.path())!, "utf8");
  expect(JSON.parse(raw).resources).toHaveLength(3);
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.getByRole("status")).toContainText("Import failed");
  const imported = JSON.parse(raw);
  imported.name = "Imported experiment";
  await page.locator("input[type=file]").setInputFiles({
    name: "network.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(imported)),
  });
  await expect(page.locator(".experiment-title")).toContainText(
    "Imported experiment",
  );
});
