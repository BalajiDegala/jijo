import { Copy, Info, Plus, Settings2, Trash2, X } from "lucide-react";
import { useLab } from "../store";
import { kindLabels, newId } from "../engine/deviceEngine";
import { containerKinds } from "../engine/types";
import type { Resource, ResourceKind, Rule } from "../engine/types";
import { validateTopology } from "../engine/topologyEngine";
import { ResourceIcon } from "./Icons";
import { Field, SelectField } from "./Fields";
import { resourceDescriptions } from "../data/learning";

export function Inspector() {
  const { topology, selectedId, update, remove, duplicate, result, step } =
    useLab();
  const r = topology.resources.find((r) => r.id === selectedId);
  const event = result?.events[step];
  const issues = validateTopology(topology).filter(
    (i) => i.resourceId === selectedId,
  );
  const association = (
    label: string,
    key: keyof Resource,
    kinds: ResourceKind[],
  ) => (
    <SelectField
      label={label}
      value={String(r?.[key] ?? "")}
      onChange={(value) => update(r!.id, { [key]: value || undefined })}
    >
      <option value="">None assigned</option>
      {topology.resources
        .filter((x) => kinds.includes(x.kind))
        .map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
    </SelectField>
  );
  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <span>
          <Settings2 size={15} /> {r ? "Resource inspector" : "Lab assistant"}
        </span>
        {r && (
          <button
            aria-label="Close inspector"
            onClick={() => useLab.setState({ selectedId: undefined })}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="inspector-body scroll-area">
        {r ? (
          <>
            <div className="inspector-resource">
              <span className={`resource-symbol ${r.kind}`}>
                <ResourceIcon kind={r.kind} size={24} />
              </span>
              <div>
                <h3>{r.name}</h3>
                <span>{kindLabels[r.kind]}</span>
              </div>
            </div>
            <p className="resource-description">
              {r.description ?? resourceDescriptions[r.kind]}
            </p>
            {r.serviceId && (
              <p className="resource-description">
                <strong>Shared service / group:</strong>{" "}
                <code>{r.serviceId}</code>
                {r.role && (
                  <>
                    <br />
                    <strong>Database role:</strong> {r.role}
                  </>
                )}
              </p>
            )}
            <div className="inspector-section">
              <span className="section-label">GENERAL</span>
              <Field
                label="Name"
                value={r.name}
                onChange={(name) => update(r.id, { name })}
              />
              <label className="toggle-row">
                Resource online
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) => update(r.id, { enabled: e.target.checked })}
                />
              </label>
              {r.ip !== undefined && (
                <>
                  <Field
                    label="Private IPv4 address"
                    value={r.ip}
                    onChange={(ip) => update(r.id, { ip })}
                  />
                  {r.kind !== "internet" && (
                    <Field
                      label="Prefix length"
                      type="number"
                      value={r.prefix ?? 24}
                      onChange={(v) => update(r.id, { prefix: Number(v) })}
                    />
                  )}
                </>
              )}
              {["computer", "server"].includes(r.kind) && (
                <>
                  <Field
                    label="Default gateway"
                    value={r.gateway ?? ""}
                    placeholder="e.g. 192.168.1.1"
                    onChange={(gateway) => update(r.id, { gateway })}
                  />
                  <Field
                    label="MAC address"
                    value={r.mac ?? ""}
                    onChange={(mac) => update(r.id, { mac })}
                  />
                </>
              )}
              {["computer", "server", "ec2", "internet"].includes(r.kind) && (
                <Field
                  label="Open service ports (comma separated)"
                  value={(r.services ?? []).join(", ")}
                  onChange={(v) =>
                    update(r.id, {
                      services: v
                        .split(",")
                        .map((s) => Number(s.trim()))
                        .filter(
                          (n) => Number.isInteger(n) && n > 0 && n <= 65535,
                        ),
                    })
                  }
                />
              )}
              {r.cidr !== undefined && (
                <Field
                  label="CIDR block"
                  value={r.cidr}
                  onChange={(cidr) => update(r.id, { cidr })}
                />
              )}
              {["ec2", "eip"].includes(r.kind) && (
                <Field
                  label="Public IPv4 address"
                  value={r.publicIp ?? ""}
                  placeholder="e.g. 203.0.113.10"
                  onChange={(publicIp) => update(r.id, { publicIp })}
                />
              )}
              {containerKinds.includes(r.kind) && (
                <p className="note">
                  <Info size={14} />
                  Select the boundary and drag its corner handles to resize.
                </p>
              )}
            </div>
            {["router", "firewall"].includes(r.kind) && (
              <div className="inspector-section">
                <span className="section-label">ROUTER INTERFACES</span>
                <label className="toggle-row">
                  IP forwarding
                  <input
                    type="checkbox"
                    checked={r.forwarding ?? false}
                    onChange={(e) =>
                      update(r.id, { forwarding: e.target.checked })
                    }
                  />
                </label>
                {r.interfaces?.map((intf, i) => (
                  <div className="editor-card" key={intf.id}>
                    <div className="editor-card-title">
                      <code>{intf.id}</code>
                      <button
                        aria-label={`Delete interface ${intf.id}`}
                        onClick={() =>
                          update(r.id, {
                            interfaces: r.interfaces?.filter((_, j) => j !== i),
                          })
                        }
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <Field
                      label="Interface IP"
                      value={intf.ip}
                      onChange={(ip) =>
                        update(r.id, {
                          interfaces: r.interfaces?.map((x, j) =>
                            j === i ? { ...x, ip } : x,
                          ),
                        })
                      }
                    />
                    <Field
                      label="Interface prefix"
                      type="number"
                      value={intf.prefix}
                      onChange={(v) =>
                        update(r.id, {
                          interfaces: r.interfaces?.map((x, j) =>
                            j === i ? { ...x, prefix: Number(v) } : x,
                          ),
                        })
                      }
                    />
                  </div>
                ))}
                <button
                  className="secondary full-width"
                  onClick={() =>
                    update(r.id, {
                      interfaces: [
                        ...(r.interfaces ?? []),
                        {
                          id: `eth${(r.interfaces ?? []).length}`,
                          ip: "192.168.3.1",
                          prefix: 24,
                        },
                      ],
                    })
                  }
                >
                  <Plus size={14} />
                  Add interface
                </button>
              </div>
            )}
            {topology.mode === "aws" && (
              <div className="inspector-section">
                <span className="section-label">ASSOCIATIONS</span>
                {["vpc", "az"].includes(r.kind) &&
                  association("Region", "parentId", ["region"])}
                {["subnet", "igw", "sg", "nacl", "routeTable", "az"].includes(
                  r.kind,
                ) && association("VPC", "vpcId", ["vpc"])}
                {r.kind === "subnet" && (
                  <>
                    {association("Availability zone", "azId", ["az"])}
                    {association("Route table", "routeTableId", ["routeTable"])}
                    {association("Network ACL", "naclId", ["nacl"])}
                  </>
                )}
                {["ec2", "nat", "alb", "rds"].includes(r.kind) &&
                  association("Subnet", "subnetId", ["subnet"])}
                {r.kind === "ec2" &&
                  association("Security group", "sgId", ["sg"])}
                {r.kind === "nat" && (
                  <>
                    {association("Elastic IP", "eipId", ["eip"])}
                    <p className="note">
                      <Info size={14} />
                      Public NAT needs an Elastic IP and a subnet route to an
                      internet gateway.
                    </p>
                  </>
                )}
              </div>
            )}
            {(r.routes !== undefined ||
              ["computer", "server"].includes(r.kind)) && (
              <div className="inspector-section">
                <span className="section-label">STATIC ROUTES</span>
                {r.routes?.map((route, i) => (
                  <div
                    className={`editor-card ${event?.matched === route.id ? "matched" : ""}`}
                    key={route.id}
                  >
                    <div className="editor-card-title">
                      <span>Route {i + 1}</span>
                      <button
                        aria-label={`Delete route ${i + 1}`}
                        onClick={() =>
                          update(r.id, {
                            routes: r.routes?.filter((_, j) => j !== i),
                          })
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <Field
                      label="Destination CIDR"
                      value={route.destination}
                      onChange={(destination) =>
                        update(r.id, {
                          routes: r.routes?.map((x, j) =>
                            j === i ? { ...x, destination } : x,
                          ),
                        })
                      }
                    />
                    {topology.mode === "aws" ? (
                      <SelectField
                        label="Route target"
                        value={route.target}
                        onChange={(target) =>
                          update(r.id, {
                            routes: r.routes?.map((x, j) =>
                              j === i ? { ...x, target } : x,
                            ),
                          })
                        }
                      >
                        <option value="local">Local VPC</option>
                        {topology.resources
                          .filter((x) => ["igw", "nat"].includes(x.kind))
                          .map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.name}
                            </option>
                          ))}
                      </SelectField>
                    ) : (
                      <Field
                        label="Next-hop IPv4"
                        value={route.target}
                        onChange={(target) =>
                          update(r.id, {
                            routes: r.routes?.map((x, j) =>
                              j === i ? { ...x, target } : x,
                            ),
                          })
                        }
                      />
                    )}
                    <label className="toggle-row">
                      Route active
                      <input
                        type="checkbox"
                        checked={route.enabled}
                        onChange={(e) =>
                          update(r.id, {
                            routes: r.routes?.map((x, j) =>
                              j === i ? { ...x, enabled: e.target.checked } : x,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                ))}
                <button
                  className="secondary full-width"
                  onClick={() =>
                    update(r.id, {
                      routes: [
                        ...(r.routes ?? []),
                        {
                          id: newId(),
                          destination: "0.0.0.0/0",
                          target:
                            topology.mode === "aws" ? "local" : "192.168.1.1",
                          enabled: true,
                        },
                      ],
                    })
                  }
                >
                  <Plus size={14} />
                  Add route
                </button>
              </div>
            )}
            {r.rules !== undefined && (
              <div className="inspector-section">
                <span className="section-label">
                  {r.kind === "sg"
                    ? "STATEFUL SECURITY RULES"
                    : "ORDERED STATELESS RULES"}
                </span>
                {r.rules.map((rule, i) => {
                  const patch = (changes: Partial<Rule>) =>
                    update(r.id, {
                      rules: r.rules?.map((x, j) =>
                        i === j ? { ...x, ...changes } : x,
                      ),
                    });
                  return (
                    <div className="editor-card" key={rule.id}>
                      <div className="editor-card-title">
                        <span>Rule {rule.priority}</span>
                        <button
                          aria-label={`Delete rule ${rule.priority}`}
                          onClick={() =>
                            update(r.id, {
                              rules: r.rules?.filter((_, j) => i !== j),
                            })
                          }
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <SelectField
                        label="Direction"
                        value={rule.direction}
                        onChange={(v) =>
                          patch({ direction: v as Rule["direction"] })
                        }
                      >
                        <option value="inbound">Inbound</option>
                        <option value="outbound">Outbound</option>
                      </SelectField>
                      <SelectField
                        label="Protocol"
                        value={rule.protocol}
                        onChange={(v) =>
                          patch({ protocol: v as Rule["protocol"] })
                        }
                      >
                        {["ALL", "TCP", "UDP", "ICMP"].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </SelectField>
                      <Field
                        label={
                          rule.direction === "inbound"
                            ? "Source CIDR"
                            : "Destination CIDR"
                        }
                        value={rule.cidr}
                        onChange={(cidr) => patch({ cidr })}
                      />
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
                      {r.kind !== "sg" && (
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
                            onChange={(v) =>
                              patch({ action: v as Rule["action"] })
                            }
                          >
                            <option value="allow">Allow</option>
                            <option value="deny">Deny</option>
                          </SelectField>
                        </>
                      )}
                    </div>
                  );
                })}
                <button
                  className="secondary full-width"
                  onClick={() =>
                    update(r.id, {
                      rules: [
                        ...(r.rules ?? []),
                        {
                          id: newId(),
                          direction: "inbound",
                          protocol: "TCP",
                          fromPort: 80,
                          toPort: 80,
                          cidr: "0.0.0.0/0",
                          action: "allow",
                          priority:
                            Math.max(
                              90,
                              ...(r.rules ?? []).map((x) => x.priority),
                            ) + 10,
                        },
                      ],
                    })
                  }
                >
                  <Plus size={14} />
                  Add rule
                </button>
                <p className="note">
                  <Info size={14} />
                  {r.kind === "sg"
                    ? "Rules only allow traffic. Tracked responses pass automatically."
                    : "Rules are checked by number. First match wins. No match means deny; return traffic needs its own rule."}
                </p>
              </div>
            )}
            {r.kind === "switch" && (
              <div className="inspector-section">
                <span className="section-label">LEARNED MAC ADDRESSES</span>
                {result?.macTables[r.id] ? (
                  <table>
                    <thead>
                      <tr>
                        <th>MAC</th>
                        <th>Port toward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.macTables[r.id]).map(
                        ([mac, id]) => (
                          <tr key={mac}>
                            <td>{mac}</td>
                            <td>
                              {topology.resources.find((x) => x.id === id)
                                ?.name ?? id}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p className="note">
                    Send a packet through this switch to see its learned MAC
                    addresses.
                  </p>
                )}
              </div>
            )}
            {issues.length > 0 && (
              <div className="validation-box">
                {issues.map((issue, i) => (
                  <p key={i}>{issue.message}</p>
                ))}
              </div>
            )}
            <div className="inspector-actions">
              <button className="secondary" onClick={() => duplicate(r.id)}>
                <Copy size={14} />
                Duplicate
              </button>
              <button
                className="danger-button"
                onClick={() => {
                  remove(r.id);
                  useLab.setState({ selectedId: undefined });
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="assistant-intro">
              <span className="assistant-mark">
                <ResourceIcon kind="router" size={28} />
              </span>
              <span className="section-label">LEARN BY DOING</span>
              <h2>
                Build it.
                <br />
                Break it.
                <br />
                <span>Understand it.</span>
              </h2>
              <p>
                Every connection has a story. Follow a packet to find out what
                yours is telling you.
              </p>
            </div>
            <div className="guide-steps">
              {[
                [
                  "01",
                  "Build your network",
                  "Drag resources onto the canvas. Connect local devices using their handles.",
                ],
                [
                  "02",
                  "Make it yours",
                  "Select any resource to edit its addresses, routes, and security rules.",
                ],
                [
                  "03",
                  "Follow a packet",
                  "Choose two endpoints and send a packet. Watch each decision unfold.",
                ],
              ].map(([n, title, description]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="learning-note">
              <Info size={17} />
              <div>
                <strong>A safe place to experiment</strong>
                <p>
                  Everything runs in your browser. Break a route, try a fix, and
                  undo whenever you like.
                </p>
              </div>
            </div>
          </>
        )}
        {event && (
          <div className="packet-inspector">
            <span className="section-label">PACKET AT HOP {step + 1}</span>
            <dl>
              {[
                ["Protocol", event.packet.protocol],
                [
                  "Source",
                  `${event.packet.sourceIp}${event.packet.sourcePort ? `:${event.packet.sourcePort}` : ""}`,
                ],
                [
                  "Destination",
                  `${event.packet.destinationIp}${event.packet.destinationPort ? `:${event.packet.destinationPort}` : ""}`,
                ],
                ["Direction", event.packet.reply ? "Response" : "Request"],
                ["Decision", event.type],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p>{event.explanation}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
