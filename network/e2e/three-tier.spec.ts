import { test, expect } from "@playwright/test";

test("AWS builder uses editable nodes, preserves their edits, and supports drag undo", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "AWS VPC builder", exact: true })
    .click();
  await expect(page.locator(".container-node.subnet")).toHaveCount(8);
  await expect(page.locator(".resource-node.alb")).toHaveCount(4);
  await expect(page.locator(".resource-node.rds")).toHaveCount(2);
  await expect(page.locator(".architecture-page img")).toHaveCount(0);
  await page
    .getByLabel("Inspect architecture resource", { exact: true })
    .selectOption("web-server-a");
  await page.getByLabel("Name", { exact: true }).fill("Frontend A");
  await page.getByLabel("Name", { exact: true }).press("Tab");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("netverse.project.v1")!),
  );
  expect(saved.diagram).toBe("three-tier");
  expect(
    saved.resources.find((r: { id: string }) => r.id === "web-server-a").name,
  ).toBe("Frontend A");
  await page
    .getByRole("button", { name: "Close inspector", exact: true })
    .click();
  await page.getByRole("button", { name: "Focus AZ A", exact: true }).click();
  const node = page.locator('.react-flow__node[data-id="web-server-a"]');
  await expect(node).toBeInViewport();
  await page.waitForTimeout(300);
  const position = await node.getAttribute("style");
  const box = await node.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + 15,
    box!.y + box!.height / 2 + 5,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(node).not.toHaveAttribute("style", position!);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(node).toHaveAttribute("style", position!);
  await page
    .getByRole("button", { name: "Basic public/private lab", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Load saved project", exact: true })
    .click();
  await expect(page.locator(".container-node.subnet")).toHaveCount(8);
  await expect(
    page.locator('.react-flow__node[data-id="web-server-a"]'),
  ).toContainText("Frontend A");
});

test("graph views expose actual route and scaling associations and allow logical link edits", async ({
  page,
}) => {
  await page.goto("/#aws-architecture");
  await expect(
    page.getByRole("heading", { name: "AWS VPC builder", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Synchronous replication", { exact: true }),
  ).toBeVisible();
  const count = await page.locator(".react-flow__edge").count();
  await page.getByLabel("Cross-zone paths", { exact: true }).check();
  await expect(page.locator(".react-flow__edge")).toHaveCount(count + 6);
  await page
    .getByLabel("Architecture connections", { exact: true })
    .selectOption("routing");
  await expect(page.locator(".resource-node.routeTable")).toHaveCount(4);
  await expect(page.locator(".resource-node.eip")).toHaveCount(2);
  await page
    .getByLabel("Inspect architecture resource", { exact: true })
    .selectOption("rt-b");
  await expect(page.getByLabel("Route target").last()).toHaveValue("nat-b");
  await page
    .getByRole("button", { name: "Close inspector", exact: true })
    .click();
  await page
    .getByLabel("Architecture connections", { exact: true })
    .selectOption("scaling");
  await expect(page.locator(".resource-node.asg")).toHaveCount(2);
  await expect(page.locator(".react-flow__edge")).toHaveCount(4);
  await page
    .getByLabel("Architecture connections", { exact: true })
    .selectOption("request");
  await page
    .getByRole("button", { name: "Connect nodes", exact: true })
    .click();
  await page
    .getByLabel("First node", { exact: true })
    .selectOption("web-server-a");
  await page
    .getByLabel("Second node", { exact: true })
    .selectOption("app-server-a");
  await expect(page.locator("#connection-feedback")).toContainText(
    "logical connection",
  );
  await page
    .getByRole("button", { name: "Apply connection", exact: true })
    .click();
  await expect(page.locator(".react-flow__edge")).toHaveCount(count + 7);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".react-flow__edge")).toHaveCount(count + 6);
});

test("the node graph supports fullscreen, keyboard selection, and mobile without page overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error("Exercise fallback"));
  });
  await page.goto("/#aws-architecture");
  await page
    .getByRole("button", { name: "Fullscreen: Network diagram", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Network diagram",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Focus AZ A", exact: true }).click();
  await expect(
    dialog.locator('.react-flow__node[data-id="web-server-a"]'),
  ).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  for (const size of ["standard", "extra"]) {
    await page.getByLabel("Text size", { exact: true }).selectOption(size);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page
    .getByLabel("Inspect architecture resource", { exact: true })
    .selectOption("db-b-instance");
  await expect(page.locator(".inspector")).toContainText("standby");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
