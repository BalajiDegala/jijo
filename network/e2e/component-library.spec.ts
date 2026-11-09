import { expect, test } from "@playwright/test";
import type { Topology } from "../src/engine/types";

test("the original Component Library remains consistent in the guided lab, including drag placement", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "AWS VPC builder", exact: true })
    .click();
  const library = page.locator(".component-library");
  const search = library.getByRole("textbox", { name: "Search components" });
  const originalNames = await library
    .locator(".component-list button")
    .allTextContents();
  await search.fill("VPC");
  await page
    .getByRole("button", { name: "Start two-subnet lab", exact: true })
    .click();
  await expect(library).toHaveCount(1);
  await expect(library.locator(".library-heading")).toHaveText(
    "COMPONENT LIBRARYAWS",
  );
  await expect(search).toHaveValue("VPC");
  await search.clear();
  const guidedNames = await library
    .locator(".component-list button")
    .allTextContents();
  expect(guidedNames.slice(0, originalNames.length)).toEqual(originalNames);
  await library.getByRole("button", { name: "VPC", exact: true }).click();
  await library.getByRole("button", { name: "VPC", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(library.locator(".library-heading")).toHaveText(
    "COMPONENT LIBRARYAWS",
  );
  await library.getByRole("button", { name: "Subnet", exact: true }).click();
  await library.getByRole("button", { name: "Subnet", exact: true }).click();
  await page
    .getByLabel("Inspect AWS resource", { exact: true })
    .selectOption({ label: "VPC 2" });
  await library
    .getByRole("button", { name: "EC2 instance", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  await dialog
    .getByLabel("Parent resource", { exact: true })
    .selectOption({ label: "Subnet-A (10.1.1.0/24)" });
  await dialog
    .getByRole("button", { name: "Create resource", exact: true })
    .click();
  await page.getByRole("button", { name: "Auto arrange", exact: true }).click();
  await page.getByRole("button", { name: "Fit diagram", exact: true }).click();
  await page.waitForTimeout(450);
  const subnetB = page
    .locator(".react-flow__node")
    .filter({ has: page.locator(".resource-node.subnet") })
    .filter({ hasText: "Subnet-B" });
  const bounds = (await subnetB.boundingBox())!;
  const transfer = await page.evaluateHandle(() => new DataTransfer());
  await library
    .getByRole("button", { name: "EC2 instance", exact: true })
    .dispatchEvent("dragstart", { dataTransfer: transfer });
  await page.locator(".canvas-wrap").dispatchEvent("drop", {
    dataTransfer: transfer,
    clientX: bounds.x + bounds.width / 2,
    clientY: bounds.y + bounds.height / 2,
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".resource-node.ec2")).toHaveCount(2);
  await expect(
    page.getByText("Draft saved on this device", { exact: true }),
  ).toBeVisible();
  const topology = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("netverse.aws-builder.v1")!) as Topology,
  );
  const subnet = topology.resources.find((r) => r.name === "Subnet-B")!;
  expect(topology.resources.find((r) => r.name === "EC2-B")).toMatchObject({
    subnetId: subnet.id,
    parentId: subnet.id,
    ip: "10.1.2.10",
  });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".resource-node.ec2")).toHaveCount(1);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.locator(".resource-node.ec2")).toHaveCount(2);
  await library
    .getByRole("button", { name: "RDS DNS endpoint", exact: true })
    .click();
  await expect(page.locator(".resource-node.dbEndpoint")).toHaveCount(1);
});
