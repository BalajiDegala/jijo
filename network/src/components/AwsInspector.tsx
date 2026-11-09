import { Info, Plus, Trash2, X } from "lucide-react";
import { useLab } from "../store";
import { Field, SelectField } from "./Fields";
import { ResourceIcon } from "./Icons";
import { awsDefinition, awsDocs } from "../data/awsResources";
import { groupsOf, vpcOf } from "../engine/awsBuilder";
import {
  awsConfigurationIssues,
  effectiveTable,
} from "../engine/awsValidation";
import {
  awsRelationships,
  removeAwsRelationship,
} from "../engine/awsRelationships";
import { effectiveRoutes, subnetExposure } from "../engine/awsEngine";
import { newId } from "../engine/deviceEngine";
import type { Resource, ResourceKind, Rule } from "../engine/types";

function AwsRules({ resource }: { resource: Resource }) {
  const { topology, update } = useLab();
  const security = resource.kind === "sg";
  return (
    <section
      className="inspector-section"
      aria-label={`${resource.name} rules`}
    >
      <h3>{security ? "Security Group rules" : "Network ACL rules"}</h3>
      <p className="note">
        <Info size={14} />
        {security
          ? "Allow rules from all attached groups are combined. Stateful tracking allows replies to permitted requests."
          : "Ordered, stateless rules. The lowest matching rule number wins; no match denies traffic. Permit return traffic separately."}
      </p>
      {(resource.rules || []).map((rule, index) => {
        const patch = (changes: Partial<Rule>) =>
          update(resource.id, {
            rules: resource.rules?.map((r) =>
              r.id === rule.id ? { ...r, ...changes } : r,
            ),
          });
        return (
          <fieldset className="editor-card" key={rule.id}>
            <legend>Rule {index + 1}</legend>
            <button
              aria-label={`Delete policy rule ${index + 1}`}
              onClick={() =>
                update(resource.id, {
                  rules: resource.rules?.filter((r) => r.id !== rule.id),
                })
              }
            >
              <Trash2 size={14} />
            </button>
            <SelectField
              label="Direction"
              value={rule.direction}
              onChange={(direction) =>
                patch({ direction: direction as Rule["direction"] })
              }
            >
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </SelectField>
            <SelectField
              label="Protocol"
              value={rule.protocol}
              onChange={(protocol) =>
                patch({ protocol: protocol as Rule["protocol"] })
              }
            >
              {["ALL", "ICMP", "TCP", "UDP"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </SelectField>
            {security && (
              <SelectField
                label="Peer type"
                value={rule.securityGroupId !== undefined ? "sg" : "cidr"}
                onChange={(v) =>
                  patch({ securityGroupId: v === "sg" ? "" : undefined })
                }
              >
                <option value="cidr">IPv4 CIDR</option>
                <option value="sg">Security Group reference</option>
              </SelectField>
            )}
            {security && rule.securityGroupId !== undefined ? (
              <SelectField
                label={
                  rule.direction === "inbound"
                    ? "Source Security Group"
                    : "Destination Security Group"
                }
                value={rule.securityGroupId}
                onChange={(securityGroupId) => patch({ securityGroupId })}
              >
                <option value="">Choose a group</option>
                {topology.resources
                  .filter((r) => r.kind === "sg" && r.vpcId === resource.vpcId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </SelectField>
            ) : (
              <Field
                label={
                  rule.direction === "inbound"
                    ? "Source CIDR"
                    : "Destination CIDR"
                }
                value={rule.cidr}
                onChange={(cidr) => patch({ cidr })}
              />
            )}
            {rule.protocol === "ICMP" && (
              <>
                <p className="note">
                  ICMP uses type and code, not port numbers. Echo Request: 8/0;
                  Echo Reply: 0/0; -1 means any.
                </p>
                <div className="two-fields">
                  <Field
                    label="ICMP type"
                    type="number"
                    value={rule.icmpType ?? -1}
                    onChange={(v) => patch({ icmpType: Number(v) })}
                  />
                  <Field
                    label="ICMP code"
                    type="number"
                    value={rule.icmpCode ?? -1}
                    onChange={(v) => patch({ icmpCode: Number(v) })}
                  />
                </div>
              </>
            )}
            {["TCP", "UDP"].includes(rule.protocol) && (
              <div className="two-fields">
                <Field
                  label="From port"
                  type="number"
                  value={rule.fromPort}
                  onChange={(v) => patch({ fromPort: Number(v) })}
                />
                <Field
                  label="To port"
                  type="number"
                  value={rule.toPort}
                  onChange={(v) => patch({ toPort: Number(v) })}
                />
              </div>
            )}
            {!security && (
              <>
                <Field
                  label="Rule number"
                  type="number"
                  value={rule.priority}
                  onChange={(v) => patch({ priority: Number(v) })}
                />
                <SelectField
                  label="Action"
                  value={rule.action}
                  onChange={(action) =>
                    patch({ action: action as Rule["action"] })
                  }
                >
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </SelectField>
              </>
            )}
          </fieldset>
        );
      })}
      <button
        className="secondary"
        onClick={() =>
          update(resource.id, {
            rules: [
              ...(resource.rules || []),
              {
                id: newId(),
                direction: "inbound",
                protocol: "ICMP",
                icmpType: 8,
                icmpCode: 0,
                fromPort: 0,
                toPort: 0,
                cidr: vpcOf(topology, resource)?.cidr || "10.0.0.0/16",
                action: "allow",
                priority:
                  Math.max(
                    90,
                    ...(resource.rules || []).map((r) => r.priority),
                  ) + 10,
              },
            ],
          })
        }
      >
        <Plus size={14} />
        Add policy rule
      </button>
      <a
        href={security ? awsDocs.security : awsDocs.acl}
        target="_blank"
        rel="noreferrer"
      >
        Official AWS policy documentation
      </a>
    </section>
  );
}

export function AwsInspector() {
  const { topology, selectedId, selectedLinkId, update, edit, remove } =
    useLab();
  const r = topology.resources.find((r) => r.id === selectedId);
  const relationship = awsRelationships(topology).find(
    (r) => r.id === selectedLinkId,
  );
  const close = () =>
    useLab.setState({ selectedId: undefined, selectedLinkId: undefined });
  if (!r && !relationship) return null;
  if (!r && relationship)
    return (
      <aside
        className="inspector aws-inspector"
        aria-label="Relationship properties"
      >
        <div className="inspector-heading">
          <h3>Relationship</h3>
          <button onClick={close} aria-label="Close relationship inspector">
            <X size={16} />
          </button>
        </div>
        <div className="inspector-body scroll-area">
          <h3>{relationship.label}</h3>
          <p>
            {topology.resources.find((r) => r.id === relationship.source)?.name}{" "}
            →{" "}
            {topology.resources.find((r) => r.id === relationship.target)?.name}
          </p>
          <p>
            This is a{" "}
            {relationship.relation === "intent"
              ? "communication intent, not evidence of reachability"
              : "configuration relationship, not a physical cable"}
            .
          </p>
          {relationship.relation === "intent" &&
            relationship.id !== "builder-test-path" && (
              <Field
                label="Connection label"
                value={relationship.label || ""}
                onChange={(label) =>
                  edit((t) => {
                    const link = t.links.find((l) => l.id === relationship.id);
                    if (link) link.label = label;
                  })
                }
              />
            )}
          {relationship.relation !== "intent" && (
            <button
              className="secondary"
              onClick={() =>
                useLab.setState({
                  selectedId: relationship.ownerId,
                  selectedLinkId: undefined,
                })
              }
            >
              Edit associated resource
            </button>
          )}
          {(["acl", "table"] as string[]).includes(relationship.relation) && (
            <p>
              Removing an explicit association restores the VPC default ACL or
              main route table, as in AWS.
            </p>
          )}
          <button
            className="danger-button"
            onClick={() => {
              edit((t) => removeAwsRelationship(t, relationship.id));
              close();
            }}
          >
            <Trash2 size={14} />
            Remove relationship
          </button>
        </div>
      </aside>
    );
  if (!r) return null;
  const vpc = vpcOf(topology, r);
  const definition = awsDefinition(r.kind);
  const association = (
    label: string,
    key: keyof Resource,
    kinds: ResourceKind[],
    sameVpc = false,
  ) => (
    <SelectField
      label={label}
      value={String(r[key] || "")}
      onChange={(value) => update(r.id, { [key]: value || undefined })}
    >
      <option value="">
        {key === "naclId"
          ? "Use VPC default ACL"
          : key === "routeTableId"
            ? "Use VPC main route table"
            : "Not assigned"}
      </option>
      {topology.resources
        .filter(
          (x) =>
            kinds.includes(x.kind) &&
            (!sameVpc || vpcOf(topology, x)?.id === vpc?.id),
        )
        .map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
    </SelectField>
  );
  const issues = awsConfigurationIssues(topology).filter(
    (i) => i.resourceId === r.id,
  );
  let routes = r.routes || [];
  try {
    if (r.kind === "routeTable") routes = effectiveRoutes(topology, r);
  } catch {
    /* Inline configuration errors explain invalid CIDRs. */
  }
  return (
    <aside
      className="inspector aws-inspector"
      aria-label="AWS resource properties"
    >
      <div className="inspector-heading">
        <span>Resource inspector</span>
        <button onClick={close} aria-label="Close inspector">
          <X size={16} />
        </button>
      </div>
      <div className="inspector-body scroll-area">
        <div className="inspector-resource">
          <ResourceIcon kind={r.kind} />
          <h3>{r.name}</h3>
        </div>
        <p className="resource-description">{definition?.description}</p>
        {definition && !definition.modeled && (
          <p className="note">
            Architecture resource. Its service-specific runtime behavior is
            outside the two-EC2 validator.
          </p>
        )}
        <Field
          label="Name"
          value={r.name}
          onChange={(name) => update(r.id, { name })}
        />
        <Field
          label="Description"
          value={r.description || ""}
          onChange={(description) => update(r.id, { description })}
        />
        <label className="toggle-row">
          {r.kind === "ec2"
            ? "Instance running (modeled)"
            : "Resource available (modeled)"}
          <input
            type="checkbox"
            checked={r.enabled}
            onChange={(e) => update(r.id, { enabled: e.target.checked })}
          />
        </label>
        {r.cidr !== undefined && (
          <Field
            label="CIDR block"
            value={r.cidr}
            onChange={(cidr) => update(r.id, { cidr })}
          />
        )}
        {r.kind === "region" && (
          <Field
            label="Region name"
            value={r.regionName || "us-east-1"}
            onChange={(regionName) => update(r.id, { regionName })}
          />
        )}
        {r.kind === "vpc" && (
          <>
            {association("Region", "parentId", ["region"])}
            <p>
              AWS Region: {r.regionName || "us-east-1"}. Edit the parent Region
              to change its identifier.
            </p>
          </>
        )}
        {r.kind === "subnet" && (
          <>
            {association("VPC", "vpcId", ["vpc"])}
            {association("Availability Zone", "azId", ["az"], true)}
            {association("Route table", "routeTableId", ["routeTable"], true)}
            {association("Network ACL", "naclId", ["nacl"], true)}
            <SelectField
              label="Desired subnet type"
              value={r.subnetType || "private"}
              onChange={(subnetType) =>
                update(r.id, { subnetType: subnetType as "private" | "public" })
              }
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </SelectField>
            <p className="note">
              Routing currently classifies this subnet as{" "}
              {subnetExposure(topology, r)}. Changing the desired type does not
              add a gateway or route.
            </p>
          </>
        )}
        {["ec2", "nat", "alb", "nlb", "rds"].includes(r.kind) &&
          association("Subnet", "subnetId", ["subnet"])}
        {r.ip !== undefined && (
          <Field
            label="Private IPv4 address"
            value={r.ip}
            onChange={(ip) => update(r.id, { ip })}
          />
        )}
        {r.kind === "ec2" && (
          <>
            <Field
              label="Instance type"
              value={r.instanceType || "t3.micro"}
              onChange={(instanceType) => update(r.id, { instanceType })}
            />
            <SelectField
              label="Operating system"
              value={r.os || "Linux"}
              onChange={(os) => update(r.id, { os: os as Resource["os"] })}
            >
              <option>Linux</option>
              <option>Windows</option>
            </SelectField>
            <label className="toggle-row">
              Auto-assign public IPv4
              <input
                type="checkbox"
                checked={!!r.publicIpAuto}
                onChange={(e) =>
                  update(r.id, { publicIpAuto: e.target.checked })
                }
              />
            </label>
            <Field
              label="Public IPv4 address (optional)"
              value={r.publicIp || ""}
              onChange={(publicIp) =>
                update(r.id, { publicIp: publicIp || undefined })
              }
            />
            <fieldset className="aws-group-list">
              <legend>Attached Security Groups</legend>
              {topology.resources
                .filter((g) => g.kind === "sg" && g.vpcId === vpc?.id)
                .map((sg) => (
                  <label key={sg.id}>
                    <input
                      type="checkbox"
                      checked={groupsOf(r).includes(sg.id)}
                      onChange={(e) =>
                        update(r.id, {
                          sgIds: e.target.checked
                            ? [...groupsOf(r), sg.id]
                            : groupsOf(r).filter((id) => id !== sg.id),
                        })
                      }
                    />
                    {sg.name}
                    <button
                      className="secondary"
                      aria-label={`Edit ${sg.name}`}
                      onClick={() => useLab.setState({ selectedId: sg.id })}
                    >
                      Edit
                    </button>
                  </label>
                ))}
            </fieldset>
            <SelectField
              label="Host firewall assumption"
              value={r.osFirewall || "unknown"}
              onChange={(osFirewall) =>
                update(r.id, {
                  osFirewall: osFirewall as Resource["osFirewall"],
                })
              }
            >
              <option value="unknown">Unknown — must verify</option>
              <option value="allow">Model as allowing test traffic</option>
              <option value="deny">Model as blocking test traffic</option>
            </SelectField>
            <p className="note">
              This is an explicit model assumption. Verify the real OS firewall
              separately in AWS.
            </p>
            <Field
              label="Listening application ports"
              value={(r.services || []).join(", ")}
              onChange={(v) =>
                update(r.id, {
                  services: v.trim()
                    ? v.split(",").map((x) => Number(x.trim()))
                    : [],
                })
              }
            />
          </>
        )}
        {r.kind === "nat" && (
          <>
            <SelectField
              label="NAT connectivity type"
              value={r.natType || "public"}
              onChange={(natType) =>
                update(r.id, { natType: natType as "public" | "private" })
              }
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </SelectField>
            {r.natType !== "private" &&
              association("Elastic IP", "eipId", ["eip"])}
          </>
        )}
        {r.kind === "endpoint" && (
          <>
            <SelectField
              label="Endpoint type"
              value={r.endpointType || "gateway"}
              onChange={(endpointType) =>
                update(r.id, {
                  endpointType: endpointType as "gateway" | "interface",
                })
              }
            >
              <option value="gateway">Gateway</option>
              <option value="interface">Interface</option>
            </SelectField>
            <Field
              label="AWS service"
              value={r.serviceName || "s3"}
              onChange={(serviceName) => update(r.id, { serviceName })}
            />
          </>
        )}
        {r.kind === "peering" && association("Peer VPC", "peerVpcId", ["vpc"])}
        {r.kind === "cgw" && (
          <>
            <Field
              label="Gateway public IPv4"
              value={r.publicIp || ""}
              onChange={(publicIp) => update(r.id, { publicIp })}
            />
            <Field
              label="BGP ASN"
              type="number"
              value={r.asn || 65000}
              onChange={(v) => update(r.id, { asn: Number(v) })}
            />
          </>
        )}
        {r.kind === "vpn" && (
          <Field
            label="Remote network CIDR"
            value={r.remoteCidr || ""}
            onChange={(remoteCidr) => update(r.id, { remoteCidr })}
          />
        )}
        {r.kind === "routeTable" && (
          <section className="inspector-section">
            <h3>Routes and subnet associations</h3>
            <p className="note">
              The implicit VPC local route is always present. Inspect matching
              routes in both directions.
            </p>
            {routes.map((route, index) => {
              const patch = (changes: Partial<typeof route>) =>
                update(r.id, {
                  routes: routes.map((x) =>
                    x.id === route.id ? { ...x, ...changes } : x,
                  ),
                });
              return (
                <fieldset className="editor-card" key={route.id}>
                  <legend>Route {index + 1}</legend>
                  <Field
                    label="Destination CIDR"
                    value={route.destination}
                    onChange={(destination) => patch({ destination })}
                  />
                  <SelectField
                    label="Route target"
                    value={route.target}
                    onChange={(target) => patch({ target })}
                  >
                    <option value="local">Local VPC routing</option>
                    {topology.resources
                      .filter((x) =>
                        [
                          "igw",
                          "nat",
                          "peering",
                          "tgw",
                          "vgw",
                          "endpoint",
                        ].includes(x.kind),
                      )
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </SelectField>
                  <label className="toggle-row">
                    Route active
                    <input
                      type="checkbox"
                      checked={route.enabled}
                      onChange={(e) => patch({ enabled: e.target.checked })}
                    />
                  </label>
                  <button
                    aria-label={`Delete route ${index + 1}`}
                    disabled={route.target === "local"}
                    onClick={() =>
                      update(r.id, {
                        routes: routes.filter((x) => x.id !== route.id),
                      })
                    }
                  >
                    <Trash2 size={14} />
                    Delete route
                  </button>
                </fieldset>
              );
            })}
            <button
              className="secondary"
              onClick={() =>
                update(r.id, {
                  routes: [
                    ...routes,
                    {
                      id: newId(),
                      destination: "0.0.0.0/0",
                      target: "",
                      enabled: true,
                    },
                  ],
                })
              }
            >
              Add route
            </button>
            <fieldset className="aws-group-list">
              <legend>Associated subnets</legend>
              {topology.resources
                .filter((s) => s.kind === "subnet" && s.vpcId === r.vpcId)
                .map((s) => (
                  <label key={s.id}>
                    <input
                      type="checkbox"
                      checked={effectiveTable(topology, s)?.id === r.id}
                      onChange={(e) =>
                        update(s.id, {
                          routeTableId: e.target.checked ? r.id : undefined,
                        })
                      }
                    />
                    {s.name}
                  </label>
                ))}
            </fieldset>
            {r.main && (
              <p className="note">
                Subnets without an explicit association use this main table.
              </p>
            )}
          </section>
        )}
        {["sg", "nacl"].includes(r.kind) && <AwsRules resource={r} />}
        {issues.length > 0 && (
          <div className="validation-box" role="status">
            {issues.map((issue, index) => (
              <p key={index}>{issue.message}</p>
            ))}
          </div>
        )}
        <p className="note">{definition?.next}</p>
        {definition && (
          <p>
            <a href={definition.docs} target="_blank" rel="noreferrer">
              AWS documentation for this resource
            </a>
          </p>
        )}
        <button
          className="danger-button"
          onClick={() => {
            remove(r.id);
            close();
          }}
        >
          <Trash2 size={14} />
          Delete resource
        </button>
      </div>
    </aside>
  );
}
