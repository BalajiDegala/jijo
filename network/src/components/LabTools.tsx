import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Play,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useLab } from "../store";
import { awsTemplate, emptyTemplate } from "../data/templates";
import { effectiveRoutes, subnetExposure } from "../engine/awsEngine";
import { localRoutes, longestPrefixMatch } from "../engine/routingEngine";
import { contains } from "../engine/ipMathEngine";
import { simulate } from "../engine/simulationEngine";
import type { Resource, Topology } from "../engine/types";

export function LabTools() {
  const { page, topology, request, update, replace, run } = useLab();
  const [open, setOpen] = useState(true);
  const [lookup, setLookup] = useState("8.8.8.8");
  if (!["aws", "routing", "security", "nat"].includes(page)) return null;
  const find = (id: string) => topology.resources.find((r) => r.id === id);
  const select = (id: string) => useLab.setState({ selectedId: id });
  const test = (sourceId: string, destination: string, port = 443) =>
    run({ sourceId, destination, protocol: "TCP", port });
  return (
    <section className="lab-tools">
      <div className="lab-tools-heading">
        <span>
          <Info size={14} />
          {page === "aws"
            ? "A cloud network you can take apart"
            : page === "routing"
              ? "Follow the most specific route"
              : page === "security"
                ? "Two layers. Different rules."
                : "One public address. Many private connections."}
        </span>
        <button
          aria-label={open ? "Collapse lab guide" : "Expand lab guide"}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
      {open && (
        <div className="lab-tools-body">
          {page === "aws" && (
            <>
              <p>
                An instance’s subnet chooses its routes. Its security group
                controls access. Availability zones place resources; they never
                forward packets.
              </p>
              <div className="lab-quick-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    replace(emptyTemplate("aws"));
                    useLab.setState({
                      page: "aws",
                      toast: "Use the guided build below to assemble your VPC.",
                    });
                  }}
                >
                  <Plus size={12} />
                  Build from scratch
                </button>
                {find("web") && find("app") && (
                  <button
                    className="secondary"
                    onClick={() => test("web", "app")}
                  >
                    Test local VPC traffic <ArrowRight size={12} />
                  </button>
                )}
                {find("web") && find("internet") && (
                  <button
                    className="secondary"
                    onClick={() => test("web", "internet")}
                  >
                    Test public internet <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </>
          )}
          {page === "routing" && (
            <>
              <label className="route-lookup">
                <span>Look up a destination</span>
                <input
                  aria-label="Route lookup destination"
                  value={lookup}
                  onChange={(e) => setLookup(e.target.value)}
                />
              </label>
              <div className="route-tables">
                {topology.resources
                  .filter((r) =>
                    topology.mode === "aws"
                      ? r.kind === "routeTable"
                      : ["router", "computer", "server"].includes(r.kind),
                  )
                  .map((r) => {
                    let routes: ReturnType<typeof localRoutes> = [];
                    try {
                      routes =
                        topology.mode === "aws"
                          ? effectiveRoutes(topology, r)
                          : localRoutes(r);
                    } catch {
                      /* validation banner shows malformed addresses */
                    }
                    const chosen = longestPrefixMatch(routes, lookup);
                    return (
                      <div className="route-table-card" key={r.id}>
                        <button onClick={() => select(r.id)}>
                          {r.name}
                          <Wrench size={12} />
                        </button>
                        <table>
                          <thead>
                            <tr>
                              <th>Destination</th>
                              <th>Target</th>
                              <th>Match</th>
                            </tr>
                          </thead>
                          <tbody>
                            {routes.map((route) => (
                              <tr
                                key={route.id}
                                className={
                                  chosen?.id === route.id ? "chosen-route" : ""
                                }
                              >
                                <td>{route.destination}</td>
                                <td>
                                  {find(route.target)?.name ?? route.target}
                                </td>
                                <td>
                                  {chosen?.id === route.id
                                    ? route.enabled
                                      ? "Selected"
                                      : "Blackhole"
                                    : contains(route.destination, lookup)
                                      ? "Less specific"
                                      : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!chosen && (
                          <p className="error-text">No matching route.</p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          )}
          {page === "security" && (
            <>
              <div className="security-explainer">
                <div>
                  <ShieldCheck size={17} />
                  <strong>Security groups</strong>
                  <span>Stateful · allow rules · instance boundary</span>
                </div>
                <div>
                  <ShieldCheck size={17} />
                  <strong>Network ACLs</strong>
                  <span>Stateless · ordered allow/deny · subnet boundary</span>
                </div>
              </div>
              <p>
                Test HTTP from Internet to Web server. Remove the inbound allow
                rule to block a new connection. A response uses destination port
                49152; the NACL must allow it.
              </p>
              <div className="lab-quick-actions">
                {topology.resources
                  .filter((r) => ["sg", "nacl"].includes(r.kind))
                  .map((r) => (
                    <button
                      className="secondary"
                      key={r.id}
                      onClick={() => select(r.id)}
                    >
                      <Wrench size={12} />
                      {r.name}
                    </button>
                  ))}
                {find("web") && find("internet") && (
                  <button
                    className="secondary"
                    onClick={() => test("internet", "web", 80)}
                  >
                    <Play size={12} />
                    Test inbound HTTP
                  </button>
                )}
              </div>
            </>
          )}
          {page === "nat" && (
            <>
              <div className="nat-journey">
                <span>Private instance</span>
                <ArrowRight size={13} />
                <span>NAT gateway</span>
                <ArrowRight size={13} />
                <span>Internet gateway</span>
                <ArrowRight size={13} />
                <span>Internet</span>
              </div>
              <p>
                Public NAT tracks outbound flows and translates the source port.
                Open NAT table below to inspect the mapping. Unsolicited inbound
                requests have no mapping and are dropped.
              </p>
              <div className="lab-quick-actions">
                {find("app") && find("internet") && (
                  <button
                    className="secondary"
                    onClick={() => test("app", "internet")}
                  >
                    <Play size={12} />
                    Test private HTTPS
                  </button>
                )}
                {find("eip") && find("internet") && (
                  <button
                    className="secondary"
                    onClick={() => test("internet", find("eip")!.publicIp!)}
                  >
                    Try unsolicited inbound
                  </button>
                )}
                {["nat", "igw"]
                  .filter((id) => find(id))
                  .map((id) => (
                    <button
                      className={`secondary ${!find(id)!.enabled ? "experiment-broken" : ""}`}
                      key={id}
                      onClick={() =>
                        update(id, { enabled: !find(id)!.enabled })
                      }
                    >
                      {find(id)!.enabled ? "Disable" : "Enable"}{" "}
                      {find(id)!.name}
                    </button>
                  ))}
                {find("rt-private") && (
                  <button
                    className="secondary"
                    onClick={() => select("rt-private")}
                  >
                    Edit private routes
                  </button>
                )}
              </div>
            </>
          )}
          {page === "aws" && (
            <div className="subnet-summary">
              {topology.resources
                .filter((r) => r.kind === "subnet")
                .map((r) => (
                  <button key={r.id} onClick={() => select(r.id)}>
                    <i
                      className={`dot ${subnetExposure(topology, r) === "public" ? "green" : "blue"}`}
                    />
                    {r.name}
                    <code>{r.cidr}</code>
                    <span>{subnetExposure(topology, r)}</span>
                  </button>
                ))}
            </div>
          )}
          {request.sourceId && (
            <span className="sr-only">Current source: {request.sourceId}</span>
          )}
        </div>
      )}
    </section>
  );
}

interface BuildStep {
  title: string;
  description: string;
  done: (t: Topology) => boolean;
  apply: (t: Topology) => void;
  select?: string;
}
const fixture = awsTemplate();
function put(t: Topology, ids: string[], transform?: (r: Resource) => void) {
  for (const id of ids) {
    if (t.resources.some((r) => r.id === id)) continue;
    const r = structuredClone(fixture.resources.find((x) => x.id === id)!);
    transform?.(r);
    t.resources.push(r);
  }
}
const steps: BuildStep[] = [
  {
    title: "Create a VPC",
    description: "A VPC owns the 10.0.0.0/16 address space inside a region.",
    done: (t) => t.resources.some((r) => r.kind === "vpc"),
    apply: (t) => put(t, ["region", "vpc"]),
    select: "vpc",
  },
  {
    title: "Add two availability zones",
    description: "Separate placement boundaries, without adding network hops.",
    done: (t) => t.resources.filter((r) => r.kind === "az").length >= 2,
    apply: (t) => put(t, ["az-a", "az-b"]),
    select: "az-a",
  },
  {
    title: "Create two /24 subnets",
    description:
      "10.0.1.0/24 and 10.0.2.0/24 fit inside the VPC without overlapping.",
    done: (t) => t.resources.filter((r) => r.kind === "subnet").length >= 2,
    apply: (t) =>
      put(t, ["public", "private"], (r) => {
        r.routeTableId = undefined;
        r.naclId = undefined;
      }),
    select: "public",
  },
  {
    title: "Launch the instances",
    description:
      "Private addresses .10 are usable; AWS reserves .0 through .3 and .255 in each /24.",
    done: (t) => t.resources.filter((r) => r.kind === "ec2").length >= 2,
    apply: (t) =>
      put(t, ["sg-web", "sg-app", "web", "app"], (r) => {
        if (r.kind === "ec2") r.publicIp = undefined;
      }),
    select: "web",
  },
  {
    title: "Connect the VPC locally",
    description:
      "Associate a route table with each subnet. The local route connects their private addresses.",
    done: (t) =>
      ["public", "private"].every(
        (id) => t.resources.find((r) => r.id === id)?.routeTableId,
      ),
    apply: (t) => {
      put(t, ["rt-public", "rt-private"], (r) => {
        r.routes = r.routes?.filter((x) => x.target === "local");
      });
      for (const r of t.resources) {
        if (r.id === "public") r.routeTableId = "rt-public";
        if (r.id === "private") r.routeTableId = "rt-private";
      }
    },
    select: "rt-public",
  },
  {
    title: "Attach an internet gateway",
    description:
      "This provides the VPC’s internet boundary. Routes and public addresses come next.",
    done: (t) => t.resources.some((r) => r.kind === "igw"),
    apply: (t) => put(t, ["igw", "internet"]),
    select: "igw",
  },
  {
    title: "Give the web subnet an internet route",
    description: "0.0.0.0/0 → Internet gateway makes this a public subnet.",
    done: (t) =>
      !!t.resources
        .find((r) => r.id === "rt-public")
        ?.routes?.some((r) => r.target === "igw"),
    apply: (t) => {
      const r = t.resources.find((r) => r.id === "rt-public");
      if (r)
        r.routes = [
          ...(r.routes ?? []),
          {
            id: "public-default",
            destination: "0.0.0.0/0",
            target: "igw",
            enabled: true,
          },
        ];
    },
    select: "rt-public",
  },
  {
    title: "Assign a public IPv4 address",
    description:
      "The internet gateway maps Web server’s private address to 203.0.113.10.",
    done: (t) => !!t.resources.find((r) => r.id === "web")?.publicIp,
    apply: (t) => {
      const r = t.resources.find((r) => r.id === "web");
      if (r) r.publicIp = "203.0.113.10";
    },
    select: "web",
  },
  {
    title: "Add public NAT and an Elastic IP",
    description:
      "Place NAT in the web subnet, which already has a route to the internet gateway.",
    done: (t) =>
      t.resources.some((r) => r.kind === "nat") &&
      t.resources.some((r) => r.kind === "eip"),
    apply: (t) => put(t, ["nat", "eip"]),
    select: "nat",
  },
  {
    title: "Route private traffic through NAT",
    description:
      "The application subnet’s default route targets NAT. Test HTTPS and inspect the translation.",
    done: (t) =>
      !!t.resources
        .find((r) => r.id === "rt-private")
        ?.routes?.some((r) => r.target === "nat"),
    apply: (t) => {
      const r = t.resources.find((r) => r.id === "rt-private");
      if (r)
        r.routes = [
          ...(r.routes ?? []),
          {
            id: "private-default",
            destination: "0.0.0.0/0",
            target: "nat",
            enabled: true,
          },
        ];
    },
    select: "rt-private",
  },
];
export function GuidedBuild() {
  const { topology, page, challengeId, edit, run } = useLab();
  const [expanded, setExpanded] = useState(false);
  if (page !== "aws" || challengeId) return null;
  const current = steps.findIndex((s) => !s.done(topology)),
    finished = current === -1;
  const complete =
    finished &&
    simulate(topology, {
      sourceId: "app",
      destination: "internet",
      protocol: "TCP",
      port: 443,
    }).success;
  return (
    <div className="guided-build">
      <button
        className="guided-build-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span>
          <GraduationIcon />
          {finished
            ? "Your cloud network is assembled"
            : "Guided build · " + Math.max(0, current) + " of 10 steps"}
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expanded && (
        <div className="build-steps">
          {steps.map((s, i) => (
            <div
              className={`${s.done(topology) ? "done" : ""} ${i === current ? "current" : ""}`}
              key={s.title}
            >
              <span>
                {s.done(topology) ? (
                  <Check size={12} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.description}</p>
              </div>
              <button
                className="secondary"
                disabled={i > current && current !== -1}
                onClick={() => {
                  if (!s.done(topology)) edit(s.apply);
                  useLab.setState({ selectedId: s.select });
                }}
              >
                {s.done(topology) ? "Inspect" : "Build"}
              </button>
            </div>
          ))}
          {finished && (
            <div className="build-complete">
              <span>
                {complete
                  ? "The model verifies private internet connectivity."
                  : "The resources are in place. Use packet diagnostics to check the configuration."}
              </span>
              <button
                className="primary"
                onClick={() =>
                  run({
                    sourceId: "app",
                    destination: "internet",
                    protocol: "TCP",
                    port: 443,
                  })
                }
              >
                Test private HTTPS <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function GraduationIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v7q6 5 12 0v-7M22 9v8" />
    </svg>
  );
}
