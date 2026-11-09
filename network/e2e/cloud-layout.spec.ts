import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { awsTemplate } from "../src/data/templates";
import { containerKinds } from "../src/engine/types";
import type { Resource, Topology } from "../src/engine/types";

async function checkBoundaries(
  page: Page,
  resources: Resource[] = awsTemplate().resources,
) {
  await expect
    .poll(() =>
      page.evaluate((resources) => {
        const errors: string[] = [];
        for (const resource of resources) {
          const node = document.querySelector<HTMLElement>(
            `.react-flow__node[data-id="${resource.id}"]`,
          );
          const boundary = node?.querySelector<HTMLElement>(".container-node");
          if (boundary && node) {
            const outer = node.getBoundingClientRect(),
              inner = boundary.getBoundingClientRect();
            if (
              Math.abs(outer.width - inner.width) > 1 ||
              Math.abs(outer.height - inner.height) > 1
            )
              errors.push(
                `${resource.name}: visible boundary does not fill its layout box (${inner.width.toFixed(1)} vs ${outer.width.toFixed(1)})`,
              );
          }
          if (!node) {
            errors.push(`${resource.name}: node missing`);
            continue;
          }
          if (!resource.parentId) continue;
          const parent = document.querySelector<HTMLElement>(
            `.react-flow__node[data-id="${resource.parentId}"] .container-node`,
          );
          if (!parent) {
            errors.push(`${resource.name}: parent boundary missing`);
            continue;
          }
          const childBox = node.getBoundingClientRect(),
            parentBox = parent.getBoundingClientRect();
          if (
            childBox.left < parentBox.left - 1 ||
            childBox.top < parentBox.top - 1 ||
            childBox.right > parentBox.right + 1 ||
            childBox.bottom > parentBox.bottom + 1
          )
            errors.push(
              `${resource.name}: outside its visible parent boundary`,
            );
          const heading = parent
            .querySelector<HTMLElement>(".container-label")
            ?.getBoundingClientRect();
          if (heading && childBox.top < heading.bottom - 1)
            errors.push(`${resource.name}: overlaps its parent's label`);
          const footer = parent
            .querySelector<HTMLElement>(".subnet-exposure")
            ?.getBoundingClientRect();
          if (footer && childBox.bottom > footer.top + 1)
            errors.push(
              `${resource.name}: overlaps its subnet's public/private label`,
            );
          for (const sibling of resources.filter(
            (other) =>
              other.parentId === resource.parentId && other.id !== resource.id,
          )) {
            const siblingBox = document
              .querySelector<HTMLElement>(
                `.react-flow__node[data-id="${sibling.id}"]`,
              )
              ?.getBoundingClientRect();
            if (
              siblingBox &&
              childBox.left < siblingBox.right - 1 &&
              childBox.right > siblingBox.left + 1 &&
              childBox.top < siblingBox.bottom - 1 &&
              childBox.bottom > siblingBox.top + 1
            )
              errors.push(`${resource.name}: overlaps ${sibling.name}`);
          }
        }
        const region = document
          .querySelector(
            `.react-flow__node[data-id="${resources.find((resource) => resource.kind === "region")?.id}"]`,
          )
          ?.getBoundingClientRect();
        const toolbar = document
          .querySelector(".canvas-topline")
          ?.getBoundingClientRect();
        if (region && toolbar && region.top < toolbar.bottom)
          errors.push("Cloud layers sit behind the diagram controls");
        return errors;
      }, resources),
    )
    .toEqual([]);
}

async function libraryAdd(page: Page, name: string) {
  const open = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  if (await open.isVisible()) await open.click();
  await page
    .locator(".component-list")
    .getByRole("button", { name, exact: true })
    .click();
  const close = page.getByRole("button", {
    name: "Close navigation",
    exact: true,
  });
  if (await close.isVisible()) {
    await close.focus();
    await close.press("Enter");
  }
}

async function savedResources(page: Page) {
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  return page.evaluate(
    () =>
      (JSON.parse(localStorage.getItem("netverse.project.v1")!) as Topology)
        .resources,
  );
}

for (const width of [1366, 1024]) {
  test(`manual AWS containers leave room for each nested level at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 768 });
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () =>
        Promise.reject(new Error("Test expanded view"));
    });
    await page.goto("/");
    const open = page.getByRole("button", {
      name: "Open navigation",
      exact: true,
    });
    if (await open.isVisible()) await open.click();
    await page
      .getByRole("button", { name: "AWS VPC builder", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Build from scratch", exact: true })
      .click();
    await libraryAdd(page, "Region");
    await libraryAdd(page, "VPC");
    let resources = await savedResources(page);
    await checkBoundaries(page, resources);
    await libraryAdd(page, "Availability zone");
    await libraryAdd(page, "Availability zone");
    await libraryAdd(page, "Subnet");
    resources = await savedResources(page);
    await checkBoundaries(page, resources);
    await page.getByLabel("Text size", { exact: true }).selectOption("extra");
    await checkBoundaries(page, resources);
    await page
      .getByRole("button", { name: "Close inspector", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Fullscreen: Network diagram", exact: true })
      .click();
    await checkBoundaries(page, resources);
    await page
      .locator(".canvas-wrap")
      .screenshot({ path: `.local/manual-aws-${width}.png` });
    await page
      .getByRole("button", {
        name: "Exit fullscreen: Network diagram",
        exact: true,
      })
      .click();
    await libraryAdd(page, "VPC");
    const expanded = await savedResources(page);
    expect(
      expanded.find((item) => item.kind === "region")!.width,
    ).toBeGreaterThan(resources.find((item) => item.kind === "region")!.width!);
    await checkBoundaries(page, expanded);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    expect(await savedResources(page)).toEqual(resources);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    expect(await savedResources(page)).toEqual(expanded);
    await checkBoundaries(page, expanded);
    expect(errors).toEqual([]);
  });
}

test("a VPC dropped near the region edge stays inside its boundary", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "AWS VPC builder", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Build from scratch", exact: true })
    .click();
  await libraryAdd(page, "Region");
  const region = page
    .locator(".react-flow__node")
    .filter({ has: page.locator(".container-node.region") });
  await expect(region).toBeVisible();
  await page.getByRole("button", { name: "Fit diagram", exact: true }).click();
  await page.waitForTimeout(400); // Fit diagram animates for 300 ms.
  const bounds = (await region.boundingBox())!;
  const dataTransfer = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.setData("application/netverse", "vpc");
    return transfer;
  });
  await page.locator(".canvas-wrap").dispatchEvent("drop", {
    dataTransfer,
    clientX: bounds.x + bounds.width - 5,
    clientY: bounds.y + bounds.height - 5,
  });
  const resources = await savedResources(page);
  expect(resources.find((item) => item.kind === "vpc")!.parentId).toBe(
    resources.find((item) => item.kind === "region")!.id,
  );
  await checkBoundaries(page, resources);
});

for (const size of [
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
]) {
  test(`cloud layers contain their resources at ${size.width}px and in fullscreen`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () =>
        Promise.reject(new Error("Use expanded view"));
    });
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
      .getByRole("button", { name: "AWS VPC builder", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Basic public/private lab", exact: true })
      .click();
    await expect(page.locator(".container-node")).toHaveCount(
      awsTemplate().resources.filter((resource) =>
        containerKinds.includes(resource.kind),
      ).length,
    );
    await checkBoundaries(page);
    await page.getByLabel("Text size", { exact: true }).selectOption("extra");
    await expect(page.locator("html")).toHaveCSS("font-size", "22px");
    await checkBoundaries(page);
    await page
      .getByRole("button", { name: "Fullscreen: Network diagram", exact: true })
      .click();
    await checkBoundaries(page);
    expect(
      (await page.locator(".canvas-wrap").boundingBox())!.height,
    ).toBeGreaterThanOrEqual(480);
    await page
      .locator(".canvas-wrap")
      .screenshot({ path: `.local/cloud-layers-fullscreen-${size.width}.png` });
    await page
      .getByRole("button", {
        name: "Exit fullscreen: Network diagram",
        exact: true,
      })
      .click();
    await page
      .getByLabel("Text size", { exact: true })
      .selectOption("standard");
    await page
      .getByRole("button", { name: "Test local VPC traffic", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Skip to result", exact: true })
      .click();
    await expect(page.locator(".result-badge")).toHaveText("Delivered");
    await page
      .locator(".canvas-wrap")
      .screenshot({ path: `.local/cloud-layers-${size.width}.png` });
  });
}
