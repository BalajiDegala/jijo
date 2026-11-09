import { useMemo } from "react";
import type { KeyboardEvent } from "react";
import { ArrowRight, Calculator, Check, Lock, RotateCcw } from "lucide-react";
import {
  calculateCidr,
  compareCidrs,
  isAssignable,
  numberToIp,
  parseCidr,
  prefixForHosts,
} from "../engine/ipMathEngine";
import { loadAddressExample, useCidr } from "../cidrStore";
import { VisualPanel } from "./VisualPanel";
import { Term } from "./LearningUI";

function reservationReason(
  n: number,
  c: ReturnType<typeof calculateCidr>,
  aws: boolean,
) {
  if (aws) {
    if (n === c.start)
      return "AWS reserves the first address to identify the subnet.";
    if (n === c.start + 1)
      return "AWS reserves this address for the VPC router.";
    if (n === c.start + 2) return "AWS reserves this address for DNS.";
    if (n === c.start + 3) return "AWS reserves this address for future use.";
    if (n === c.end)
      return "AWS reserves the last address. VPCs do not support broadcast traffic.";
  } else if (c.prefix < 31) {
    if (n === c.start)
      return "This is the network address: it identifies the whole subnet instead of an individual device.";
    if (n === c.end)
      return "This is the broadcast address: it represents all devices on this traditional subnet.";
  }
  return "";
}

export function CidrPlayground() {
  const { ip, prefix, aws, compare, hosts, selected, page, allocated, list } =
    useCidr();
  const patch = useCidr.setState;
  const data = useMemo(() => {
    try {
      return { c: calculateCidr(`${ip}/${prefix}`, aws), error: "" };
    } catch (error) {
      return { c: undefined, error: (error as Error).message };
    }
  }, [ip, prefix, aws]);
  const comparison = useMemo(() => {
    try {
      return { result: compareCidrs(`${ip}/${prefix}`, compare), error: "" };
    } catch (error) {
      return { result: undefined, error: (error as Error).message };
    }
  }, [ip, prefix, compare]);
  const c = data.c;
  let hostPrefix: number | undefined,
    hostError = "";
  try {
    hostPrefix = prefixForHosts(Number(hosts), aws);
  } catch (error) {
    hostError = (error as Error).message;
  }
  const offset = c ? Math.min(page * 256, Math.max(0, c.total - 256)) : 0;
  const count = c ? Math.min(256, c.total - offset) : 0;
  const used = c
    ? allocated.filter((address) => isAssignable(address, c.canonical, aws))
        .length
    : 0;
  const selectedHere =
    c && selected !== undefined && selected >= c.start && selected <= c.end;
  const selectedAddress = selectedHere ? numberToIp(selected!) : "";
  const reason = selectedHere ? reservationReason(selected!, c!, aws) : "";
  const allocatedHere = allocated.includes(selectedAddress);
  const moveFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const grid = event.currentTarget.parentElement!;
    const columns =
      getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const next = (
      {
        ArrowRight: index + 1,
        ArrowLeft: index - 1,
        ArrowDown: index + columns,
        ArrowUp: index - columns,
        Home: 0,
        End: count - 1,
      } as Record<string, number>
    )[event.key];
    if (next === undefined) return;
    event.preventDefault();
    grid
      .querySelector<HTMLButtonElement>(
        `[data-index="${Math.max(0, Math.min(count - 1, next))}"]`,
      )
      ?.focus();
  };
  const example = (kind: "overlap" | "separate" | "identical") =>
    patch({
      ip: "192.168.1.0",
      prefix: 24,
      page: 0,
      selected: undefined,
      compare:
        kind === "overlap"
          ? "192.168.1.128/25"
          : kind === "separate"
            ? "192.168.2.0/24"
            : "192.168.1.0/24",
    });
  const overlap = comparison.result;
  const scaleStart = overlap ? Math.min(overlap.a.start, overlap.b.start) : 0;
  const scaleTotal = overlap
    ? Math.max(overlap.a.end, overlap.b.end) - scaleStart + 1
    : 1;
  const selectedOnPage =
    selectedHere &&
    selected! >= c!.start + offset &&
    selected! < c!.start + offset + count;

  return (
    <div className="cidr-page scroll-area">
      <div className="section-eyebrow">
        <Calculator size={17} /> IP & CIDR PLAYGROUND
      </div>
      <h1>
        Make room for your network<span>.</span>
      </h1>
      <p className="subtitle">
        Choose an address range, see which addresses devices can use, and
        compare networks.
      </p>
      <div className="concept-intro">
        <p>
          An <strong>IP address</strong> identifies a device's network
          interface. A <strong>subnet</strong> groups a range of addresses. The
          number after the slash tells you how big that range is.
        </p>
        <div className="term-row">
          <Term name="IP address" />
          <Term name="Subnet" />
          <Term name="CIDR" />
        </div>
      </div>
      <div className="cidr-controls panel">
        <div className="segmented" aria-label="Address reservation rules">
          <button
            aria-pressed={!aws}
            className={!aws ? "active" : ""}
            onClick={() => patch({ aws: false })}
          >
            Traditional IPv4
          </button>
          <button
            aria-pressed={aws}
            className={aws ? "active" : ""}
            onClick={() => patch({ aws: true })}
          >
            AWS subnet
          </button>
        </div>
        <p className="helper-copy">
          {aws
            ? "AWS reserves five addresses in each valid subnet. Use a prefix from /16 to /28."
            : "Traditional networks reserve the first and last address, with special rules for /31 and /32."}
        </p>
        <div className="ip-input">
          <label>
            IP address
            <input
              aria-label="IP address"
              value={ip}
              onChange={(e) =>
                patch({ ip: e.target.value, page: 0, selected: undefined })
              }
            />
          </label>
          <span>/</span>
          <label>
            Prefix
            <input
              aria-label="CIDR prefix"
              type="number"
              min="0"
              max="32"
              value={prefix}
              onChange={(e) =>
                patch({
                  prefix: Math.max(0, Math.min(32, Number(e.target.value))),
                  page: 0,
                  selected: undefined,
                })
              }
            />
          </label>
        </div>
        <p className="helper-copy">
          A larger prefix number means a smaller network. Try moving from /24 to
          /25: the total number of addresses halves.
        </p>
        <input
          aria-label="Prefix slider"
          className="prefix-slider"
          type="range"
          min="0"
          max="32"
          value={prefix}
          onChange={(e) =>
            patch({
              prefix: Number(e.target.value),
              page: 0,
              selected: undefined,
            })
          }
        />
        <div className="range-labels">
          <span>/0 · all IPv4 addresses</span>
          <span>/16</span>
          <span>/32 · one address</span>
        </div>
        {data.error && (
          <p className="error-text" role="alert">
            {data.error}
          </p>
        )}
        {c && (
          <p className="network-summary" aria-live="polite">
            Your network is <strong>{c.canonical}</strong>, from {c.network} to{" "}
            {c.broadcast}.{" "}
            {c.ip !== c.start &&
              "The entered IP is inside this network; the range begins at its network address."}
          </p>
        )}
        {c && aws && !c.awsValid && (
          <p className="error-text">
            AWS subnets support /16 through /28. The arithmetic is shown, but
            this size cannot be used for an AWS subnet.
          </p>
        )}
      </div>
      {c && (
        <>
          <div className="cidr-stats">
            {[
              [
                "Network address",
                c.network,
                "The first address in this range.",
              ],
              [
                "Subnet mask",
                c.mask,
                "Another way to write the boundary between network and device bits.",
              ],
              [
                aws || prefix >= 31 ? "Last address" : "Broadcast address",
                c.broadcast,
                aws
                  ? "AWS reserves this address; broadcast traffic is unsupported."
                  : prefix >= 31
                    ? "This prefix has no reserved broadcast address."
                    : "Used to address all devices on this subnet.",
              ],
              [
                "Total addresses",
                c.total.toLocaleString(),
                "Every address in the range, including reserved ones.",
              ],
              [
                "Usable addresses",
                c.usable.toLocaleString(),
                "Capacity for device addresses before practice allocations.",
              ],
              [
                "Usable range",
                `${c.first} – ${c.last}`,
                "The first and last assignable device addresses.",
              ],
            ].map(([label, value, explanation]) => (
              <div className="panel metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{explanation}</p>
              </div>
            ))}
          </div>
          <VisualPanel
            title="Which IP addresses can I use?"
            className="address-panel"
          >
            <p>
              Each square is one IP address. Select a square to see what it
              means, then mark an available address as used. This practice grid
              does not create devices in the network builder.
            </p>
            <div className="example-actions">
              <button className="secondary" onClick={loadAddressExample}>
                Load 8-address example
              </button>
              <button
                className="secondary"
                onClick={() => patch({ list: !list })}
              >
                {list ? "Show address grid" : "Show address list"}
              </button>
              <button
                className="secondary"
                disabled={!allocated.length}
                onClick={() => patch({ allocated: [] })}
              >
                <RotateCcw size={15} /> Reset practice allocations
              </button>
            </div>
            {aws && !c.awsValid ? (
              <p className="note">
                Choose a valid AWS subnet size above to practice assigning
                addresses.
              </p>
            ) : (
              <>
                <div className="address-counts" aria-live="polite">
                  <span>
                    <strong>{c.total.toLocaleString()}</strong> total
                  </span>
                  <span>
                    <strong>{c.total - c.usable}</strong> reserved
                  </span>
                  <span>
                    <strong>{used}</strong> marked as used
                  </span>
                  <span>
                    <strong>{(c.usable - used).toLocaleString()}</strong>{" "}
                    available
                  </span>
                </div>
                <p className="helper-copy">
                  Showing {numberToIp(c.start + offset)} –{" "}
                  {numberToIp(c.start + offset + count - 1)}.{" "}
                  {c.total > 256 &&
                    `Page ${Math.floor(offset / 256) + 1} of ${Math.ceil(c.total / 256).toLocaleString()}; 256 addresses per page.`}{" "}
                  Use arrow keys to move between addresses, then Tab to reach
                  the action below.
                </p>
                <div
                  className={`address-grid ${list ? "address-list" : count <= 8 ? "short-grid" : ""}`}
                  role="group"
                  aria-label="IP addresses"
                >
                  {Array.from({ length: count }, (_, index) => {
                    const n = c.start + offset + index,
                      address = numberToIp(n);
                    const reserved = reservationReason(n, c, aws),
                      inUse = allocated.includes(address);
                    const status = reserved
                      ? "Reserved"
                      : inUse
                        ? "Used"
                        : "Available";
                    return (
                      <button
                        key={n}
                        data-index={index}
                        title={`${address} · ${status}`}
                        aria-label={`${address}, ${status}`}
                        aria-pressed={selected === n}
                        tabIndex={
                          selectedOnPage
                            ? selected === n
                              ? 0
                              : -1
                            : index === 0
                              ? 0
                              : -1
                        }
                        className={`${reserved ? "reserved" : inUse ? "allocated" : ""} ${selected === n ? "selected" : ""}`}
                        onKeyDown={(event) => moveFocus(event, index)}
                        onFocus={() => patch({ selected: n })}
                        onClick={() => patch({ selected: n })}
                      >
                        <span>{list ? address : address.split(".")[3]}</span>
                        <span className="address-symbol" aria-hidden="true">
                          {reserved ? (
                            <Lock size={12} />
                          ) : inUse ? (
                            <Check size={12} />
                          ) : (
                            "○"
                          )}
                        </span>
                        {list && <span>{status}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="address-footer">
                  <div className="legend">
                    <span>○ Available</span>
                    <span>
                      <Check size={14} /> Used
                    </span>
                    <span>
                      <Lock size={14} /> Reserved
                    </span>
                  </div>
                  {c.total > 256 && (
                    <div className="inline-buttons">
                      <button
                        className="secondary"
                        disabled={offset === 0}
                        onClick={() =>
                          patch({
                            page: Math.max(0, Math.floor(offset / 256) - 1),
                            selected: undefined,
                          })
                        }
                      >
                        Previous addresses
                      </button>
                      <button
                        className="secondary"
                        disabled={offset + count >= c.total}
                        onClick={() =>
                          patch({
                            page: Math.floor(offset / 256) + 1,
                            selected: undefined,
                          })
                        }
                      >
                        Next addresses
                      </button>
                    </div>
                  )}
                </div>
                <div className="address-detail" aria-live="polite">
                  {selectedHere ? (
                    <>
                      <h3>
                        {selectedAddress} ·{" "}
                        {reason
                          ? "Reserved"
                          : allocatedHere
                            ? "Used"
                            : "Available"}
                      </h3>
                      <p>
                        {reason ||
                          (allocatedHere
                            ? "This address is marked as used in your practice grid. Release it to make it available again."
                            : "This address can be assigned to a device in this network. Try marking it as used.")}
                      </p>
                      {!reason && (
                        <button
                          className="primary"
                          onClick={() =>
                            patch({
                              allocated: allocatedHere
                                ? allocated.filter(
                                    (address) => address !== selectedAddress,
                                  )
                                : [...allocated, selectedAddress],
                            })
                          }
                        >
                          {allocatedHere ? "Release address" : "Mark as used"}
                        </button>
                      )}
                    </>
                  ) : (
                    <p>
                      Select an address above to learn about it. Selecting an
                      address does not assign it.
                    </p>
                  )}
                </div>
                {!aws && prefix >= 31 && (
                  <p className="helper-copy">
                    {prefix === 31
                      ? "A /31 is a special point-to-point link: both addresses are usable."
                      : "A /32 represents a single host address."}
                  </p>
                )}
              </>
            )}
          </VisualPanel>
          <VisualPanel
            title="Do these networks share any IP addresses?"
            className="overlap-panel"
          >
            <p>
              Networks overlap when at least one IP address belongs to both
              ranges. Compare the full ranges below, including reserved
              addresses.
            </p>
            <div className="overlap-inputs">
              <label>
                Network A · current network
                <input aria-label="Network A" readOnly value={c.canonical} />
                <small>
                  Uses the IP address and prefix at the top of this page.
                </small>
              </label>
              <label>
                Network B · compare with
                <input
                  aria-label="Network B"
                  value={compare}
                  onChange={(e) => patch({ compare: e.target.value })}
                />
              </label>
            </div>
            <div className="example-actions">
              <button className="secondary" onClick={() => example("overlap")}>
                Try overlapping networks
              </button>
              <button className="secondary" onClick={() => example("separate")}>
                Try separate networks
              </button>
              <button
                className="secondary"
                onClick={() => example("identical")}
              >
                Try identical networks
              </button>
            </div>
            {comparison.error && (
              <p className="error-text" role="alert">
                Network B: {comparison.error}
              </p>
            )}
            {overlap && (
              <>
                <div className="overlap-result" aria-live="polite">
                  <strong>
                    {overlap.shared
                      ? `These networks share ${overlap.shared.toLocaleString()} addresses.`
                      : "These networks have no addresses in common."}
                  </strong>
                  <p>
                    {overlap.shared
                      ? `Shared range: ${numberToIp(overlap.start)} – ${numberToIp(overlap.end)}.`
                      : "Their full address ranges are separate."}{" "}
                    {overlap.relationship === "identical"
                      ? "Both describe exactly the same network."
                      : overlap.relationship === "b-inside-a"
                        ? "Network B is entirely inside Network A."
                        : overlap.relationship === "a-inside-b"
                          ? "Network A is entirely inside Network B."
                          : ""}
                  </p>
                </div>
                <div
                  className="range-diagram"
                  aria-label="Networks on a shared address scale"
                >
                  {[overlap.a, overlap.b].map((range, index) => (
                    <div className="range-row" key={index}>
                      <div>
                        <strong>
                          Network {index === 0 ? "A" : "B"} · {range.canonical}
                        </strong>
                        <span>
                          {numberToIp(range.start)} – {numberToIp(range.end)}
                        </span>
                      </div>
                      <div className="range-track">
                        <div
                          className={`range-bar range-${index}`}
                          style={{
                            left: `${(100 * (range.start - scaleStart)) / scaleTotal}%`,
                            width: `${(100 * range.total) / scaleTotal}%`,
                          }}
                        />
                        {overlap.shared > 0 && (
                          <div
                            className="range-shared"
                            style={{
                              left: `${(100 * (overlap.start - scaleStart)) / scaleTotal}%`,
                              width: `${(100 * overlap.shared) / scaleTotal}%`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="helper-copy">
                    Both bars use the same address scale. The striped area is
                    shared. Very small ranges may appear as thin marks; the
                    exact ranges are printed above.
                  </p>
                </div>
                {overlap.b.ip !== overlap.b.start && (
                  <p className="helper-copy">
                    Network B is normalized to {overlap.b.canonical}: the
                    address you entered is inside that network.
                  </p>
                )}
                <details className="explain-details">
                  <summary>Show how we checked</summary>
                  <p>
                    Take the later starting address: {numberToIp(overlap.start)}
                    . Take the earlier ending address: {numberToIp(overlap.end)}
                    .
                  </p>
                  <p>
                    {overlap.shared
                      ? `The start is no later than the end, so an intersection exists. Counting both endpoints gives ${overlap.shared.toLocaleString()} shared addresses.`
                      : "The start comes after the end, so no shared interval exists."}
                  </p>
                </details>
                <p className="helper-copy">
                  Separate subnets in one VPC must not overlap. A subnet inside
                  its parent VPC is expected to overlap that parent range.
                  Separate ranges alone do not guarantee connectivity; routes
                  and security rules also matter.
                </p>
              </>
            )}
          </VisualPanel>
          {prefix > 24 && prefix <= 28 && (
            <VisualPanel
              title={`Divide a /24 into /${prefix} subnets`}
              className="split-panel"
            >
              <p>
                A /24 contains 256 addresses. Dividing it into /{prefix}{" "}
                networks creates {2 ** (prefix - 24)} smaller ranges with{" "}
                {c.total} addresses each. Select a range to explore it.
              </p>
              <div className="subnet-splits">
                {Array.from({ length: 2 ** (prefix - 24) }, (_, index) => {
                  const start = parseCidr(`${ip}/24`).start + index * c.total;
                  return (
                    <button
                      key={index}
                      className={c.start === start ? "active" : ""}
                      onClick={() =>
                        patch({
                          ip: numberToIp(start),
                          page: 0,
                          selected: undefined,
                        })
                      }
                    >
                      <span>
                        {numberToIp(start)}/{prefix}
                      </span>
                      <small>{c.total} addresses</small>
                    </button>
                  );
                })}
              </div>
            </VisualPanel>
          )}
          <details className="panel binary-panel explain-details">
            <summary>Show the bits: how a prefix divides an address</summary>
            <p>
              An IPv4 address has 32 binary digits. The first {prefix} identify
              the network; the remaining {c.hostBits} provide{" "}
              {c.total.toLocaleString()} address combinations.
            </p>
            <div className="binary">
              {c.binary.split("").map((bit, index) => (
                <span
                  key={index}
                  className={`${index < prefix ? "network-bit" : "host-bit"} ${index % 8 === 7 ? "octet-end" : ""}`}
                >
                  {bit}
                </span>
              ))}
            </div>
            <div className="legend">
              <span>Blue: network bits</span>
              <span>Purple: host bits</span>
            </div>
          </details>
        </>
      )}
      <div className="panel host-sizing">
        <h2>How many devices will fit?</h2>
        <p>
          Enter the number of devices that need addresses. The result accounts
          for reserved addresses under the selected rules.
        </p>
        <label className="field">
          Required hosts
          <input
            aria-label="Required hosts"
            type="number"
            min="1"
            value={hosts}
            onChange={(e) => patch({ hosts: e.target.value })}
          />
        </label>
        <p className="note" aria-live="polite">
          {hostPrefix !== undefined
            ? `Use /${hostPrefix} for at least ${hosts} device addresses${!aws && hostPrefix >= 31 ? (hostPrefix === 31 ? " on a point-to-point link" : " (a single host)") : ""}.`
            : hostError}
        </p>
        {hostPrefix !== undefined && (
          <button
            className="secondary"
            onClick={() =>
              patch({ prefix: hostPrefix!, page: 0, selected: undefined })
            }
          >
            Try this prefix <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
