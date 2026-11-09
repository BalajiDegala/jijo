import { useEffect, useRef, useState } from "react";
import { Terminal, Activity } from "lucide-react";
import { useLab } from "../store";
import { localRoutes } from "../engine/routingEngine";
import { effectiveRoutes } from "../engine/awsEngine";
import { explainTraceEvent } from "../engine/traceTeaching";
import { useLearning } from "../learningStore";
import { Term } from "./LearningUI";
import { useExpandedVisual } from "./VisualPanel";

export function Console() {
  const { topology, result, step, playing, speed, run, request } = useLab();
  const guided = useLearning((state) => state.guided);
  const expanded = useExpandedVisual();
  const terminalOutput = useRef<HTMLPreElement>(null);
  const terminalWorkspace = useRef<HTMLDivElement>(null);
  const commandInput = useRef<HTMLInputElement>(null);
  const currentEvent = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);
  const [tab, setTab] = useState<"traffic" | "terminal" | "nat">("traffic"),
    [command, setCommand] = useState(""),
    [history, setHistory] = useState<string[]>([
      "NetVerse shell · Commands run against your simulated network.",
      "Try: ping <IP>, traceroute <IP>, ip addr, ip route, curl http://<IP>, nslookup <name>",
    ]);
  useEffect(() => {
    if (tab !== "terminal") return;
    const output = terminalOutput.current;
    if (output) output.scrollTop = output.scrollHeight;
    terminalWorkspace.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
    commandInput.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
    if (submitted.current) {
      commandInput.current?.focus({ preventScroll: true });
      submitted.current = false;
    }
  }, [history, tab, expanded]);
  useEffect(() => {
    if (!expanded || tab !== "traffic") return;
    const event = currentEvent.current;
    const activity = event?.closest<HTMLElement>(".network-activity");
    if (!event || !activity) return;
    // Keep the selected explanation readable without scrolling the diagram or timeline.
    const tabsHeight =
      activity.querySelector(".console-top")?.getBoundingClientRect().height ??
      0;
    activity.scrollTop +=
      event.getBoundingClientRect().top -
      activity.getBoundingClientRect().top -
      tabsHeight;
  }, [step, result, tab, expanded]);
  useEffect(() => {
    if (!playing || !result) return;
    const timer = window.setInterval(
      () =>
        useLab.setState((s) =>
          s.step < result.events.length - 1
            ? { step: s.step + 1 }
            : { playing: false },
        ),
      1050 / speed,
    );
    return () => clearInterval(timer);
  }, [playing, result, speed]);
  function execute() {
    const input = command.trim();
    if (!input) return;
    submitted.current = true;
    setCommand("");
    const [cmd, arg, ...extra] = input.split(/\s+/),
      source = topology.resources.find((r) => r.id === request.sourceId);
    let output = "";
    if (cmd === "clear") {
      setHistory([]);
      return;
    }
    if (cmd === "help")
      output =
        "ping <IP> | traceroute <IP> | ip addr | ip route | curl http://<IP>[:port] | nslookup <name> | clear";
    else if (cmd === "ip" && arg === "addr")
      output = source
        ? `${source.name}\n${source.ip ?? "No primary IP"}/${source.prefix ?? 24}\n${(source.interfaces ?? []).map((i) => `${i.id}: ${i.ip}/${i.prefix}`).join("\n")}`
        : "Select a source first.";
    else if (cmd === "ip" && arg === "route") {
      try {
        const subnet = topology.resources.find(
            (r) => r.id === source?.subnetId,
          ),
          table = topology.resources.find((r) => r.id === subnet?.routeTableId);
        output =
          (topology.mode === "aws"
            ? table
              ? effectiveRoutes(topology, table)
              : []
            : source
              ? localRoutes(source)
              : []
          )
            .map(
              (r) =>
                `${r.destination} via ${topology.resources.find((x) => x.id === r.target)?.name ?? r.target} ${r.enabled ? "" : "[blackhole]"}`,
            )
            .join("\n") || "No routes.";
      } catch {
        output = "Invalid route configuration.";
      }
    } else if (
      ["ping", "traceroute", "curl", "nslookup"].includes(cmd) &&
      arg &&
      !extra.length
    ) {
      let destination = arg,
        port = cmd === "curl" ? 80 : cmd === "nslookup" ? 53 : 0;
      try {
        if (cmd === "curl") {
          const url = new URL(arg.includes("://") ? arg : `http://${arg}`);
          destination = url.hostname;
          port = Number(url.port) || (url.protocol === "https:" ? 443 : 80);
        }
        if (cmd === "nslookup")
          destination =
            topology.resources.find((r) => r.services?.includes(53))?.id ??
            "8.8.8.8";
        const res = run({
          ...request,
          destination,
          protocol:
            cmd === "curl" ? "TCP" : cmd === "nslookup" ? "UDP" : "ICMP",
          port,
        });
        output =
          cmd === "traceroute"
            ? res.events
                .filter(
                  (e) =>
                    ["route", "receive", "drop"].includes(e.type) &&
                    !e.packet.reply,
                )
                .map(
                  (e, i) =>
                    `${i + 1}  ${topology.resources.find((r) => r.id === e.resourceId)?.name ?? e.resourceId}  ${e.explanation}`,
                )
                .join("\n")
            : res.success
              ? cmd === "curl"
                ? "HTTP/1.1 200 OK\nSimulated service response."
                : cmd === "nslookup"
                  ? topology.dns[arg]
                    ? `Name: ${arg}\nAddress: ${topology.dns[arg]}`
                    : "NXDOMAIN: no record in the project DNS table."
                  : `Reply received. ${res.reason}`
              : `Failed: ${res.reason}`;
      } catch (e) {
        output = (e as Error).message;
      }
    } else
      output = "Unknown command or missing argument. Type help for syntax.";
    setHistory((h) => [...h.slice(-80), `$ ${input}`, output]);
  }
  const current = result?.events[step];
  const teaching = current ? explainTraceEvent(current) : undefined;
  const source = topology.resources.find(
    (resource) => resource.id === request.sourceId,
  );
  const other = topology.resources.find(
    (resource) =>
      resource.id !== request.sourceId &&
      resource.ip &&
      ["computer", "server", "ec2", "internet"].includes(resource.kind),
  );
  const samples = [
    {
      command: "ip addr",
      description: "Show this device's network addresses.",
    },
    {
      command: "ip route",
      description:
        "Show the directions this device uses to reach other networks.",
    },
    {
      command: `ping ${other?.ip ?? "192.168.1.20"}`,
      description:
        "Test whether a destination can receive a request and return a reply.",
    },
    {
      command: `traceroute ${other?.ip ?? "192.168.1.20"}`,
      description: "List the forwarding decisions in this simulated journey.",
    },
    {
      command: `curl http://${other?.ip ?? "192.168.1.20"}`,
      description: "Request the destination's HTTP service on port 80.",
    },
    {
      command: `nslookup ${Object.keys(topology.dns)[0] ?? "example.net"}`,
      description:
        "Ask the project's DNS service which IP address belongs to a name.",
    },
  ];
  return (
    <section className="network-console">
      <div className="console-top">
        <div className="console-tabs">
          <button
            className={tab === "traffic" ? "active" : ""}
            onClick={() => setTab("traffic")}
          >
            <Activity size={14} />
            Packet journey {result && <span>{result.events.length}</span>}
          </button>
          <button
            className={tab === "terminal" ? "active" : ""}
            onClick={() => setTab("terminal")}
          >
            <Terminal size={14} />
            Terminal
          </button>
          <button
            className={tab === "nat" ? "active" : ""}
            onClick={() => setTab("nat")}
          >
            NAT table
          </button>
        </div>
        <span className="console-caption">SIMULATION CONSOLE</span>
      </div>
      {tab === "traffic" ? (
        <>
          {result ? (
            <>
              <div
                ref={currentEvent}
                className={`current-event ${current?.type === "drop" ? "failed" : ""}`}
              >
                <span className="event-type">{teaching?.direction}</span>
                <div>
                  <h3>{teaching?.title}</h3>
                  <strong>
                    {
                      topology.resources.find(
                        (r) => r.id === current?.resourceId,
                      )?.name
                    }
                  </strong>
                  <p className="trace-evidence">{current?.explanation}</p>
                  {current && (
                    <p className="packet-addresses">
                      {current.packet.sourceIp}
                      {current.packet.protocol !== "ICMP" &&
                        `:${current.packet.sourcePort}`}{" "}
                      → {current.packet.destinationIp}
                      {current.packet.protocol !== "ICMP" &&
                        `:${current.packet.destinationPort}`}{" "}
                      · {current.packet.protocol}
                    </p>
                  )}
                  <details
                    className="trace-teaching"
                    open={guided}
                    key={`${step}-${guided}`}
                  >
                    <summary>Why this step matters</summary>
                    <p>{teaching?.meaning}</p>
                    <p>
                      <strong>Try next:</strong> {teaching?.next}
                    </p>
                  </details>
                  {current &&
                    topology.resources.some(
                      (resource) => resource.id === current.resourceId,
                    ) && (
                      <button
                        className="text-button"
                        onClick={() =>
                          useLab.setState({ selectedId: current.resourceId })
                        }
                      >
                        Inspect this device
                      </button>
                    )}
                </div>
                {step === result.events.length - 1 && (
                  <span
                    className={`result-badge ${result.success ? "success" : "failed"}`}
                  >
                    {result.success ? "Delivered" : "Dropped"}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="console-empty">
              <span className="terminal-cursor">›_</span>
              <div>
                <strong>Your next discovery is one packet away.</strong>
                <p>
                  Select a source and destination above, then hit Send packet.
                </p>
              </div>
              <span className="waiting">
                <i className="dot blue" />
                Awaiting traffic
              </span>
            </div>
          )}
        </>
      ) : tab === "terminal" ? (
        <div className="terminal-panel">
          <div ref={terminalWorkspace} className="terminal-workspace">
            <p className="terminal-source">
              Commands run from{" "}
              <strong>{source?.name ?? "the selected sender"}</strong>.
            </p>
            <pre
              ref={terminalOutput}
              role="log"
              aria-label="Terminal output"
              aria-live="polite"
              aria-relevant="additions text"
              tabIndex={0}
            >
              {history.map((entry, index) => (
                <span className="terminal-output-entry" key={index}>
                  {entry}
                  {"\n"}
                </span>
              ))}
            </pre>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                execute();
              }}
            >
              <span>netverse:{source?.name ?? "lab"} $</span>
              <input
                ref={commandInput}
                aria-label="Terminal command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit">Run ↵</button>
            </form>
          </div>
          <details className="terminal-learning">
            <summary>Command examples and help</summary>
            <p>
              Commands use the selected packet source. Choose an example to fill
              the command box, then press Run. These commands use your simulated
              network.
            </p>
            <div className="command-examples">
              {samples.map((sample) => (
                <button
                  key={sample.command}
                  className="secondary"
                  onClick={() => {
                    setCommand(sample.command);
                    terminalWorkspace.current?.scrollIntoView({
                      block: "nearest",
                      inline: "nearest",
                    });
                    commandInput.current?.scrollIntoView({
                      block: "nearest",
                      inline: "nearest",
                    });
                    commandInput.current?.focus({ preventScroll: true });
                  }}
                >
                  <code>{sample.command}</code>
                  <span>{sample.description}</span>
                </button>
              ))}
            </div>
          </details>
        </div>
      ) : (
        <div className="nat-table">
          <p>
            NAT changes the source address used for an outgoing connection.
            Compare the private device with the public address seen outside. The
            reply is translated back using this mapping.
          </p>
          <div className="term-row">
            <Term name="NAT" />
            <Term name="Port" />
          </div>
          {result?.translations.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Private source</th>
                    <th>Public source</th>
                    <th>Destination</th>
                    <th>Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {result.translations.map((n, i) => (
                    <tr key={i}>
                      <td>
                        {n.privateIp}:{n.privatePort}
                      </td>
                      <td>
                        {n.publicIp}:{n.publicPort}
                      </td>
                      <td>
                        {n.destinationIp}:{n.destinationPort}
                      </td>
                      <td>{n.protocol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="helper-copy">
                Each row records a mapping from this experiment. The Packet
                journey shows whether the whole request and reply succeeded.
              </p>
            </div>
          ) : (
            <p className="muted">
              Send traffic through a NAT gateway to inspect the translation.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
