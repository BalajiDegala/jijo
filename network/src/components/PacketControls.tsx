import { ArrowRight, Send } from "lucide-react";
import { useLab } from "../store";
import { endpointKinds } from "../engine/types";
import { Term } from "./LearningUI";
export function PacketControls() {
  const lab = useLab();
  const { topology, request } = lab;
  const endpoints = topology.resources.filter((r) =>
    endpointKinds.includes(r.kind),
  );
  const fromInternet =
    topology.resources.find((r) => r.id === request.sourceId)?.kind ===
    "internet";
  const destinationResource = topology.resources.find(
    (r) => r.id === request.destination,
  );
  const displayedDestination = destinationResource
    ? ((fromInternet
        ? (destinationResource.publicIp ?? destinationResource.ip)
        : destinationResource.ip) ?? request.destination)
    : request.destination;

  return (
    <>
      <details className="packet-help">
        <summary>How do I send a packet?</summary>
        <p>
          Choose the device sending the request in From, and the destination IP
          address in To. Send packet starts a simulated request and reply. ICMP
          tests reachability; TCP and UDP also use the destination service port.
        </p>
        <div className="term-row">
          <Term name="Packet" />
          <Term name="Protocol" />
          <Term name="Port" />
        </div>
      </details>
      <form
        className="packet-bar"
        onSubmit={(e) => {
          e.preventDefault();
          lab.run();
        }}
      >
        <span className="packet-label">
          <Send size={15} />
          SEND A PACKET
        </span>
        <label>
          <span>From</span>
          <select
            aria-label="Packet source"
            value={request.sourceId}
            onChange={(e) =>
              useLab.setState({
                request: { ...request, sourceId: e.target.value },
              })
            }
          >
            <option value="">Choose source</option>
            {endpoints.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <ArrowRight className="packet-arrow" size={15} />
        <label>
          <span>To</span>
          <input
            aria-label="Packet destination"
            list="destinations"
            value={displayedDestination}
            placeholder="IPv4 address or name"
            onChange={(e) =>
              useLab.setState({
                request: { ...request, destination: e.target.value },
              })
            }
          />
          <datalist id="destinations">
            {endpoints
              .filter((r) => r.id !== request.sourceId)
              .map((r) => (
                <option
                  key={r.id}
                  value={fromInternet ? (r.publicIp ?? r.ip) : r.ip}
                >
                  {r.name} · {r.ip}
                </option>
              ))}
          </datalist>
        </label>
        <label className="protocol-label">
          <span>Protocol</span>
          <select
            aria-label="Packet protocol"
            value={request.protocol}
            onChange={(e) =>
              useLab.setState({
                request: {
                  ...request,
                  protocol: e.target.value as typeof request.protocol,
                },
              })
            }
          >
            {["ICMP", "TCP", "UDP"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        {request.protocol !== "ICMP" && (
          <label className="port-label">
            <span>Port</span>
            <input
              aria-label="Destination port"
              type="number"
              min="1"
              max="65535"
              value={request.port}
              onChange={(e) =>
                useLab.setState({
                  request: {
                    ...request,
                    port: Number(e.target.value),
                  },
                })
              }
            />
          </label>
        )}
        <button
          className="primary send-button"
          disabled={!request.sourceId || !request.destination}
        >
          <Send size={16} />
          Send packet
        </button>
      </form>
    </>
  );
}
