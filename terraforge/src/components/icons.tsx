import {
  Network,
  Layers3,
  Cpu,
  ShieldCheck,
  KeyRound,
  Globe2,
  Route,
  Database,
  Search,
  Braces,
  ArrowUpRight,
  Box,
  GitFork,
  Link2,
} from "lucide-react";
import { schemaFor } from "@/lib/registry";
const icons: Record<string, typeof Network> = {
  network: Network,
  layers: Layers3,
  cpu: Cpu,
  shield: ShieldCheck,
  key: KeyRound,
  globe: Globe2,
  route: Route,
  database: Database,
  search: Search,
  braces: Braces,
  arrow: ArrowUpRight,
  box: Box,
  split: GitFork,
  link: Link2,
};
export function ResourceIcon({
  type,
  size = 19,
}: {
  type: string;
  size?: number;
}) {
  const s = schemaFor(type);
  const Icon = icons[s?.icon ?? "box"] ?? Box;
  return (
    <span className={`resource-icon ${s?.color ?? "violet"}`}>
      <Icon size={size} strokeWidth={1.7} />
    </span>
  );
}
export function Logo() {
  return (
    <svg
      width="27"
      height="30"
      viewBox="0 0 32 34"
      fill="none"
      aria-label="TerraForge"
    >
      <path d="M2 2l12 7v13L2 15V2z" fill="#6de8c8" />
      <path d="M17 10l12-7v13l-12 7V10z" fill="#38b99f" />
      <path d="M2 19l12 7v8L2 27v-8z" fill="#2f8f7d" />
    </svg>
  );
}
