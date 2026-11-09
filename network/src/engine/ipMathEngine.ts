export function ipToNumber(ip: string): number {
  const parts = ip.split(".");
  if (
    parts.length !== 4 ||
    parts.some(
      (p) =>
        !/^\d{1,3}$/.test(p) ||
        Number(p) > 255 ||
        (p.length > 1 && p[0] === "0"),
    )
  )
    throw new Error("Enter a valid IPv4 address, such as 192.168.1.10.");
  return parts.reduce((sum, p) => sum * 256 + Number(p), 0);
}
export function numberToIp(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 4294967295)
    throw new Error("Address is outside IPv4 space.");
  return [24, 16, 8, 0]
    .map((shift) => Math.floor(n / 2 ** shift) % 256)
    .join(".");
}
export function parseCidr(cidr: string) {
  const parts = cidr.split("/");
  if (parts.length !== 2 || !/^\d{1,2}$/.test(parts[1]))
    throw new Error("Use an IPv4 CIDR, such as 10.0.0.0/24.");
  const ip = ipToNumber(parts[0]);
  const prefix = Number(parts[1]);
  if (prefix > 32) throw new Error("IPv4 prefixes range from /0 to /32.");
  const total = 2 ** (32 - prefix);
  const start = Math.floor(ip / total) * total;
  return {
    ip,
    prefix,
    total,
    start,
    end: start + total - 1,
    canonical: `${numberToIp(start)}/${prefix}`,
  };
}
export function contains(cidr: string, ip: string): boolean {
  try {
    const c = parseCidr(cidr);
    const n = ipToNumber(ip);
    return n >= c.start && n <= c.end;
  } catch {
    return false;
  }
}
export function overlaps(a: string, b: string): boolean {
  const x = parseCidr(a),
    y = parseCidr(b);
  return x.start <= y.end && y.start <= x.end;
}
export function compareCidrs(first: string, second: string) {
  const a = parseCidr(first),
    b = parseCidr(second);
  const start = Math.max(a.start, b.start),
    end = Math.min(a.end, b.end);
  const shared = Math.max(0, end - start + 1);
  const relationship = !shared
    ? "separate"
    : a.start === b.start && a.end === b.end
      ? "identical"
      : a.start <= b.start && a.end >= b.end
        ? "b-inside-a"
        : "a-inside-b";
  return { a, b, start, end, shared, relationship };
}
export function subnetWithin(child: string, parent: string): boolean {
  const c = parseCidr(child),
    p = parseCidr(parent);
  return c.start >= p.start && c.end <= p.end;
}
export function calculateCidr(cidr: string, aws = false) {
  const c = parseCidr(cidr);
  const awsValid = c.prefix >= 16 && c.prefix <= 28;
  const reserved = aws ? 5 : c.prefix >= 31 ? 0 : 2;
  const usable = aws && !awsValid ? 0 : Math.max(0, c.total - reserved);
  const first = c.start + (aws ? 4 : c.prefix >= 31 ? 0 : 1);
  const last = c.end - (aws ? 1 : c.prefix >= 31 ? 0 : 1);
  return {
    ...c,
    network: numberToIp(c.start),
    broadcast: numberToIp(c.end),
    mask: numberToIp(4294967296 - c.total),
    usable,
    first: usable ? numberToIp(first) : "—",
    last: usable ? numberToIp(last) : "—",
    awsValid,
    binary: c.ip.toString(2).padStart(32, "0"),
    hostBits: 32 - c.prefix,
  };
}
export function prefixForHosts(hosts: number, aws = false): number {
  if (!Number.isInteger(hosts) || hosts < 1)
    throw new Error("Enter a positive whole number of hosts.");
  for (let prefix = aws ? 28 : 32; prefix >= (aws ? 16 : 0); prefix--) {
    if (calculateCidr(`0.0.0.0/${prefix}`, aws).usable >= hosts) return prefix;
  }
  throw new Error(
    aws
      ? "Too many hosts for one AWS IPv4 subnet."
      : "Too many hosts for IPv4.",
  );
}
export function isAssignable(ip: string, cidr: string, aws = false): boolean {
  const c = calculateCidr(cidr, aws);
  return (
    c.usable > 0 &&
    contains(cidr, ip) &&
    ipToNumber(ip) >= ipToNumber(c.first) &&
    ipToNumber(ip) <= ipToNumber(c.last)
  );
}
