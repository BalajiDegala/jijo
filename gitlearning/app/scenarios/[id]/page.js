import { notFound, redirect } from "next/navigation";
import { scenarios } from "@/lib/scenario-engine";
import { incidents } from "@/lib/incident-labs";
import { ScenarioScreen } from "@/components/curriculum";
export function generateStaticParams() {
  return [
    ...scenarios,
    ...incidents,
    { id: "fetch-pull" },
    { id: "pull-request" },
  ].map((s) => ({ id: s.id }));
}
export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: scenarios.find((s) => s.id === id)?.title || "Scenario not found",
  };
}
export default async function ScenarioPage({ params }) {
  const { id } = await params;
  if (id === "fetch-pull") redirect("/scenarios/fetch-only");
  if (id === "pull-request") redirect("/scenarios/protected");
  if (![...scenarios, ...incidents].some((s) => s.id === id)) notFound();
  return <ScenarioScreen key={id} id={id} />;
}
