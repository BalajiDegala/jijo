import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

function node(page: Page, kind: string) {
  return page.locator(".react-flow__node").filter({
    has: page.locator(`.resource-node.${kind}`),
  });
}

async function add(page: Page, name: string) {
  await page
    .locator(".component-list")
    .getByRole("button", { name, exact: true })
    .click();
}

test("resources remain clickable after selecting layers in a scratch cloud diagram", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "AWS VPC builder", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Build from scratch", exact: true })
    .click();
  for (const name of [
    "Region",
    "VPC",
    "Availability zone",
    "Subnet",
    "EC2 instance",
    "Internet gateway",
    "Route table",
    "Security group",
  ])
    await add(page, name);
  await page.getByRole("button", { name: "Fit diagram", exact: true }).click();
  await page.waitForTimeout(450); // Wait for the fit animation before clicking.

  for (const kind of ["region", "vpc", "az", "subnet"]) {
    for (const resource of ["igw", "routeTable", "sg", "ec2"]) {
      await node(page, kind).locator(".container-label strong").click();
      await expect(node(page, kind)).toHaveClass(/selected/);
      await node(page, resource).locator(".resource-node > strong").click({
        timeout: 2000,
      });
      await expect(node(page, resource)).toHaveClass(/selected/);
      await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
        (await node(page, resource)
          .locator(".resource-node > strong")
          .textContent())!,
      );
    }
  }
});
