import test from "node:test";
import assert from "node:assert/strict";
import { createTemplate, templates, makeResource } from "../src/lib/templates";
import { generate, renderValue, resourceHCL } from "../src/lib/hcl";
import { validate, cidrRange, internetPath } from "../src/lib/validation";
import { ref } from "../src/lib/model";
import { normalizeHCL } from "../src/lib/import";
import { graph } from "../src/lib/graph";
import { useStudio } from "../src/lib/store";
for (const t of templates)
  test(`Template ${t.id}: no model errors and complete Terraform files`, () => {
    const p = createTemplate(t.id);
    assert.deepEqual(
      validate(p).filter((i) => i.severity === "error"),
      [],
    );
    const files = generate(p);
    assert.equal(Object.keys(files).length, 6);
    assert.ok(files["main.tf"].includes("resource"));
    assert.ok(files["providers.tf"].includes("us-east-1"));
  });
test("Resource references remain expressions and rename propagates", () => {
  const p = createTemplate();
  p.resources.find((r) => r.id === "main")!.name = "production";
  assert.match(generate(p)["main.tf"], /vpc_id\s+= aws_vpc.production.id/);
  assert.doesNotMatch(generate(p)["main.tf"], /"aws_vpc.production.id"/);
});
test("count and for_each outputs select concrete instances", () => {
  assert.match(
    generate(createTemplate("count"))["outputs.tf"],
    /aws_instance.web\[0\].public_ip/,
  );
  assert.match(
    generate(createTemplate("foreach"))["outputs.tf"],
    /aws_instance.web\["blue"\].public_ip/,
  );
});
test("CIDR range handles canonical addresses and rejects out-of-range octets", () => {
  assert.deepEqual(cidrRange("10.0.0.0/16"), [167772160, 167837695]);
  assert.equal(cidrRange("10.0.1.1/24"), null);
  assert.equal(cidrRange("300.0.0.0/8"), null);
  assert.equal(cidrRange("0.0.0.0/0")?.[1], 4294967295);
});
test("Subnets outside their VPC and overlaps are rejected", () => {
  const p = createTemplate();
  p.resources.push(
    makeResource("aws_subnet", "other", {
      vpc_id: ref("main"),
      cidr_block: "10.0.1.0/24",
    }),
  );
  assert.ok(validate(p).some((x) => x.message.includes("overlaps")));
  p.resources.find((r) => r.id === "public")!.args.cidr_block =
    "192.168.1.0/24";
  assert.ok(validate(p).some((x) => x.message.includes("contained")));
});
test("Public subnet name does not imply internet access", () => {
  const p = createTemplate();
  const instance = p.resources.find((r) => r.type === "aws_instance")!;
  assert.equal(internetPath(p, instance).reachable, true);
  p.resources = p.resources.filter(
    (r) => r.type !== "aws_route_table_association",
  );
  assert.equal(internetPath(p, instance).reachable, false);
});
test("Cross-VPC security groups are invalid", () => {
  const p = createTemplate();
  p.resources.push(
    makeResource("aws_vpc", "other", { cidr_block: "10.1.0.0/16" }),
  );
  p.resources.find((r) => r.id === "web_sg")!.args.vpc_id = ref("other");
  assert.ok(validate(p).some((i) => i.message.includes("different VPC")));
});
test("Deleting a referenced resource leaves a repairable error", () => {
  const p = createTemplate();
  p.resources = p.resources.filter((r) => r.id !== "public");
  assert.ok(
    validate(p).some((i) => i.message.includes("Unresolved reference")),
  );
});
test("Dependency cycles are rejected", () => {
  const p = createTemplate();
  p.resources.find((r) => r.id === "main")!.args.depends_on = [ref("web", "")];
  assert.ok(validate(p).some((i) => i.message.includes("cycle")));
});
test("Scaling stays compact in HCL and graph", () => {
  const p = createTemplate("count");
  p.resources.find((r) => r.id === "web")!.scale!.count = 1000;
  assert.ok(generate(p)["main.tf"].length < 6000);
  assert.ok(graph(p, "topology", null).nodes.length < 30);
});
test("Unsupported import constructs stop normalization", () => {
  assert.throws(
    () =>
      normalizeHCL({
        resource: {
          aws_vpc: {
            main: [
              {
                cidr_block: "10.0.0.0/16",
                lifecycle: [{ prevent_destroy: true }],
              },
            ],
          },
        },
      }),
    /Unsupported/,
  );
  assert.throws(
    () => normalizeHCL({ resource: { unknown_type: { main: [{}] } } }),
    /Unsupported/,
  );
});
test("Import normalizes supported references", () => {
  const r = normalizeHCL({
    resource: {
      aws_vpc: { main: [{ cidr_block: "10.0.0.0/16" }] },
      aws_subnet: {
        subnet: [{ vpc_id: "${aws_vpc.main.id}", cidr_block: "10.0.1.0/24" }],
      },
    },
  });
  assert.match(generate(r.project)["main.tf"], /aws_vpc.main.id/);
});
test("Undo and redo restore canonical model", () => {
  useStudio.setState({
    project: createTemplate("empty"),
    past: [],
    future: [],
  });
  useStudio.getState().add("aws_vpc");
  assert.equal(useStudio.getState().project.resources.length, 1);
  useStudio.getState().undo();
  assert.equal(useStudio.getState().project.resources.length, 0);
  useStudio.getState().redo();
  assert.equal(useStudio.getState().project.resources.length, 1);
});
test("Connections write compatible properties and reject incompatible handles", () => {
  useStudio.setState({ project: createTemplate() });
  assert.equal(useStudio.getState().connect("main", "web_sg"), true);
  assert.equal(useStudio.getState().connect("deployer", "main"), false);
});
test("Literal strings escape Terraform template sequences", () => {
  assert.equal(
    renderValue("${not_an_expression}", createTemplate()),
    '"$${not_an_expression}"',
  );
});

test("Data source addresses have exactly one data prefix", () => {
  const p = createTemplate("default");
  assert.match(generate(p)["main.tf"], /ami\s+= data.aws_ami.amazon_linux.id/);
  assert.doesNotMatch(generate(p)["main.tf"], /data\.data\./);
});
test("Unsupported model arguments and empty expressions prevent export", () => {
  const p = createTemplate();
  p.resources[0].args.not_an_aws_argument = true;
  p.resources[1].args.cidr_block = { expr: "" };
  assert.ok(
    validate(p).some((x) => x.message.includes("Unsupported argument")),
  );
  assert.ok(validate(p).some((x) => x.message.includes("cannot be empty")));
});
test("Sensitive key content is rejected recursively", () => {
  const p = createTemplate();
  p.resources[0].args.tags = { bad: "-----BEGIN OPENSSH PRIVATE KEY-----" };
  assert.ok(
    validate(p).some((x) => x.message.includes("Private key material")),
  );
});

test("Explicit depends_on can reference an entire counted block", () => {
  const p = createTemplate("count");
  assert.equal(renderValue(ref("web", ""), p), "aws_instance.web");
});
