import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function create(
  page: Page,
  step: number,
  button: string,
  parent?: string,
) {
  if (parent)
    await page
      .getByLabel("Inspect AWS resource", { exact: true })
      .selectOption({ label: parent.replace(/ \(.*\)$/, "") });
  await page
    .getByRole("button", { name: new RegExp(`^Step ${step}:`) })
    .click();
  await page
    .locator(".aws-current-step")
    .getByRole("button", { name: button, exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Resource name", { exact: true })).toHaveCount(
    0,
  );
}
async function build(page: Page) {
  await create(page, 1, "Add VPC");
  await create(page, 2, "Add Subnet", "VPC 1 (10.0.0.0/16)");
  await create(page, 3, "Add Subnet", "VPC 1 (10.0.0.0/16)");
  await create(page, 4, "Add EC2 Instance", "Subnet-A (10.0.1.0/24)");
  await create(page, 5, "Add EC2 Instance", "Subnet-B (10.0.2.0/24)");
}

test("complete two-subnet learning scenario validates policies and generates a diagram-specific guide", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#aws-learning");
  await expect(page.locator(".react-flow__node")).toHaveCount(0);
  await build(page);
  await page.getByRole("button", { name: "Auto arrange", exact: true }).click();
  await page
    .getByRole("button", { name: "Check My Architecture", exact: true })
    .click();
  await expect(page.locator('[data-check="routing"]')).toHaveAttribute(
    "data-status",
    "pass",
  );
  await expect(page.locator('[data-check="security"]')).toHaveAttribute(
    "data-status",
    "fail",
  );
  await expect(page.locator('[data-check="host"]')).toHaveAttribute(
    "data-status",
    "unknown",
  );
  await page
    .getByRole("button", { name: "Show Network Connectivity", exact: true })
    .click();
  await expect(page.locator(".aws-logical-path ol")).toContainText(
    "VPC local routing",
  );
  await expect(page.locator('[data-check="security"]')).toHaveAttribute(
    "data-status",
    "fail",
  );
  await page
    .getByRole("button", { name: "Add recommended SG rules", exact: true })
    .click();
  await expect(page.locator('[data-check="security"]')).toHaveAttribute(
    "data-status",
    "pass",
  );
  await page
    .getByLabel("Source host firewall", { exact: true })
    .selectOption("allow");
  await page
    .getByLabel("Destination host firewall", { exact: true })
    .selectOption("allow");
  await expect(page.locator(".aws-validation > p")).toHaveText(
    "Your diagram passes the modeled configuration checks. Actual connectivity must still be verified in AWS.",
  );
  await page
    .getByLabel("AWS test protocol", { exact: true })
    .selectOption("TCP");
  await expect(page.locator('[data-check="security"]')).toHaveAttribute(
    "data-status",
    "fail",
  );
  await page
    .getByRole("button", { name: "Add recommended SG rules", exact: true })
    .click();
  await expect(page.locator(".aws-validation > p")).toContainText(
    "passes the modeled configuration checks",
  );
  await page
    .getByLabel("Inspect AWS resource", { exact: true })
    .selectOption({ label: "EC2-B" });
  await page.getByLabel("Name", { exact: true }).fill("Metrics API");
  await page.getByLabel("Name", { exact: true }).press("Enter");
  await page
    .getByRole("button", { name: "AWS implementation guide", exact: true })
    .click();
  await page
    .locator(".aws-implementation-guide summary")
    .filter({ hasText: "Launch Metrics API" })
    .click();
  await expect(page.locator(".aws-implementation-guide")).toContainText(
    "Private IP: 10.0.2.10",
  );
  await page
    .locator(".aws-implementation-guide summary")
    .filter({ hasText: "Test connectivity in AWS" })
    .click();
  await expect(page.locator(".aws-implementation-guide")).toContainText(
    "nc -vz 10.0.2.10 8080",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download guide", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "aws-network-implementation.md",
  );
  const nodeCount = await page.locator(".react-flow__node").count();
  await page.getByLabel("Builder mode", { exact: true }).selectOption("free");
  await expect(page.locator(".aws-step-list")).toHaveCount(0);
  await expect(page.locator(".react-flow__node")).toHaveCount(nodeCount);
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Load saved project", exact: true })
    .click();
  await expect(page.getByLabel("Builder mode", { exact: true })).toHaveValue(
    "free",
  );
  await expect(page.locator(".react-flow__node")).toHaveCount(nodeCount);
  await page
    .getByRole("button", { name: "Check My Architecture", exact: true })
    .click();
  await expect(page.locator(".aws-validation > p")).toContainText(
    "passes the modeled configuration checks",
  );
  await page
    .getByRole("button", { name: "Reset scenario", exact: true })
    .click();
  await expect(page.locator(".react-flow__node")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(nodeCount);
  await page
    .locator(".aws-builder-canvas")
    .screenshot({ path: ".local/aws-learning-desktop.png" });
  expect(errors).toEqual([]);
});

test("property errors, policy relationships and undo update the model immediately", async ({
  page,
}) => {
  await page.goto("/#aws-learning");
  await build(page);
  await page
    .getByLabel("Inspect AWS resource", { exact: true })
    .selectOption({ label: "Subnet-B" });
  await page.getByLabel("CIDR block", { exact: true }).fill("192.168.0.0/24");
  await page.getByLabel("CIDR block", { exact: true }).press("Enter");
  await expect(page.locator(".aws-inspector .validation-box")).toContainText(
    "fit inside a VPC",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("CIDR block", { exact: true })).toHaveValue(
    "10.0.2.0/24",
  );
  await page
    .getByLabel("Inspect AWS resource", { exact: true })
    .selectOption({ label: "EC2-B-SG" });
  await page
    .getByRole("button", { name: "Add policy rule", exact: true })
    .click();
  const inbound = page.locator(".aws-inspector fieldset.editor-card").last();
  await inbound.getByLabel("Peer type", { exact: true }).selectOption("sg");
  await inbound
    .getByLabel("Source Security Group", { exact: true })
    .selectOption({ label: "EC2-A-SG" });
  await expect(inbound.getByLabel("ICMP type", { exact: true })).toHaveValue(
    "8",
  );
  await expect(inbound.getByLabel("From port", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Check My Architecture", exact: true })
    .click();
  await expect(page.locator('[data-check="security"]')).toHaveAttribute(
    "data-status",
    "pass",
  );
  await page
    .getByRole("button", { name: "Connect nodes", exact: true })
    .click();
  await page
    .getByLabel("First node", { exact: true })
    .selectOption({ label: "EC2-B — EC2 instance" });
  await page
    .getByLabel("Second node", { exact: true })
    .selectOption({ label: "EC2-A-SG — Security group" });
  await page
    .getByRole("button", { name: "Apply connection", exact: true })
    .click();
  await expect(page.locator(".connection-feedback")).toContainText(
    "already exists",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Apply connection", exact: true }),
  ).toBeEnabled();
});

test("guided resource creation and the canvas remain usable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#aws-learning");
  await build(page);
  await page.getByRole("button", { name: "Auto arrange", exact: true }).click();
  await page
    .getByRole("button", { name: "Close inspector", exact: true })
    .click();
  await page.getByLabel("Builder mode", { exact: true }).selectOption("free");
  await expect(page.locator(".aws-builder-canvas")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .locator(".aws-builder-canvas")
    .screenshot({ path: ".local/aws-learning-mobile.png" });
  await page
    .getByRole("button", { name: "Check My Architecture", exact: true })
    .click();
  await expect(page.locator('[data-check="host"]')).toHaveAttribute(
    "data-status",
    "unknown",
  );
});

test("autosaved diagram and guided progress survive a refresh without an explicit save", async ({
  page,
}) => {
  await page.goto("/#aws-learning");
  await create(page, 1, "Add VPC");
  await create(page, 2, "Add Subnet", "VPC 1 (10.0.0.0/16)");
  await page.getByRole("button", { name: /^Step 3:/ }).click();
  const before = await page.locator(".react-flow__node").count();
  await expect(
    page.getByText("Draft saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".react-flow__node")).toHaveCount(before);
  await expect(page.getByRole("button", { name: /^Step 3:/ })).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(page.locator(".aws-current-step")).toContainText(
    "Create Subnet-B",
  );
  await page
    .getByRole("button", { name: "Reset scenario", exact: true })
    .click();
  await page.getByRole("button", { name: /^Step 4:/ }).click();
  await page
    .locator(".aws-current-step")
    .getByRole("button", { name: "Add EC2 Instance", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Add EC2 Instance",
    exact: true,
  });
  await expect(
    dialog.getByRole("button", { name: "Create resource" }),
  ).toBeDisabled();
  await expect(dialog).toContainText("Create a Subnet first");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page
      .locator(".aws-current-step")
      .getByRole("button", { name: "Add EC2 Instance", exact: true }),
  ).toBeFocused();
});

test("canvas relationship selection removes the actual security association and undo restores it", async ({
  page,
}) => {
  await page.goto("/#aws-learning");
  await build(page);
  await page
    .getByRole("button", { name: "Close inspector", exact: true })
    .click();
  await page.getByRole("button", { name: "Auto arrange", exact: true }).click();
  await page.locator(".aws-builder-canvas").scrollIntoViewIfNeeded();
  const sourceId = await page
    .getByLabel("Inspect AWS resource", { exact: true })
    .locator("option")
    .filter({ hasText: /^EC2-B$/ })
    .getAttribute("value");
  const groupId = await page
    .getByLabel("Inspect AWS resource", { exact: true })
    .locator("option")
    .filter({ hasText: /^EC2-B-SG$/ })
    .getAttribute("value");
  const edge = page.locator(
    `.react-flow__edge[data-id="rel:security:${sourceId}:${groupId}"]`,
  );
  await expect(edge).toBeVisible();
  let point: { x: number; y: number } | null = null;
  await expect
    .poll(async () => {
      point = await edge.evaluate((element) => {
        const path = element.querySelector("path")!;
        for (const ratio of [0.5, 0.3, 0.7, 0.2, 0.8]) {
          const at = path.getPointAtLength(path.getTotalLength() * ratio);
          const p = new DOMPoint(at.x, at.y).matrixTransform(
            path.getScreenCTM()!,
          );
          if (
            document
              .elementFromPoint(p.x, p.y)
              ?.closest(".react-flow__edge") === element
          )
            return { x: p.x, y: p.y };
        }
        return null;
      });
      return point !== null;
    })
    .toBe(true);
  await page.mouse.click(point!.x, point!.y);
  await expect(
    page.getByRole("complementary", { name: "Relationship properties" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove relationship", exact: true })
    .click();
  await expect(edge).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(edge).toHaveCount(1);
  await page
    .getByLabel("Inspect AWS resource", { exact: true })
    .selectOption({ label: "EC2-B" });
  await page
    .getByRole("button", { name: "Delete resource", exact: true })
    .click();
  await expect(
    page.locator(`.react-flow__node[data-id="${sourceId}"]`),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.locator(`.react-flow__node[data-id="${sourceId}"]`),
  ).toHaveCount(1);
});
