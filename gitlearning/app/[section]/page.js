import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Collaboration } from "@/components/lessons";
import { VisualLab } from "@/components/visual-lab/visual-lab";
import { Workspace as Playground } from "@/components/workspace";
import {
  LearningHub,
  ScenarioCatalog as ScenarioLibrary,
  InterviewBank as Interview,
  ProgressDesk as Progress,
} from "@/components/curriculum";
const sections = {
  fundamentals: { title: "Git fundamentals", Component: LearningHub },
  playground: { title: "Interactive Git playground", Component: Playground },
  scenarios: { title: "Real-world scenarios", Component: ScenarioLibrary },
  branches: { title: "Git Visual Lab", Component: VisualLab },
  collaboration: { title: "Team workflows", Component: Collaboration },
  interview: { title: "Interview practice", Component: Interview },
  progress: { title: "My progress", Component: Progress },
};
export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}
export async function generateMetadata({ params }) {
  const { section } = await params;
  return { title: sections[section]?.title || "Not found" };
}
export default async function SectionPage({ params }) {
  const { section } = await params;
  if (!sections[section]) notFound();
  const Component = sections[section].Component;
  return (
    <Suspense
      fallback={
        <div className="loading-state">Opening your learning workspace…</div>
      }
    >
      <Component />
    </Suspense>
  );
}
