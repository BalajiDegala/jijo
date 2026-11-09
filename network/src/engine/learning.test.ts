import { describe, expect, it } from "vitest";
import { compareCidrs } from "./ipMathEngine";

describe("explaining overlap with exact address ranges", () => {
  it("counts the endpoints of a contained network", () => {
    const result = compareCidrs("192.168.1.0/24", "192.168.1.128/25");
    expect(result.shared).toBe(128);
    expect(result.relationship).toBe("b-inside-a");
    expect(result.start).toBe(result.b.start);
    expect(result.end).toBe(result.b.end);
  });
  it("distinguishes adjacent ranges from a shared boundary address", () => {
    expect(compareCidrs("10.0.0.0/25", "10.0.0.128/25").shared).toBe(0);
    expect(compareCidrs("10.0.0.0/25", "10.0.0.127/32").shared).toBe(1);
  });
  it("normalizes input addresses and identifies identical ranges", () => {
    const result = compareCidrs("10.0.0.123/24", "10.0.0.250/24");
    expect(result.relationship).toBe("identical");
    expect(result.shared).toBe(256);
    expect(result.a.canonical).toBe("10.0.0.0/24");
  });
  it("handles all of IPv4 without signed integer overflow", () => {
    expect(compareCidrs("0.0.0.0/0", "0.0.0.0/0").shared).toBe(4294967296);
    expect(compareCidrs("255.255.255.255/32", "0.0.0.0/0")).toMatchObject({
      shared: 1,
      relationship: "a-inside-b",
      start: 4294967295,
      end: 4294967295,
    });
  });
  it("rejects invalid comparison inputs rather than showing a misleading result", () => {
    expect(() => compareCidrs("192.168.1.0/24", "192.168.300.1/24")).toThrow();
    expect(() => compareCidrs("192.168.1.0/33", "192.168.2.0/24")).toThrow();
  });
});
