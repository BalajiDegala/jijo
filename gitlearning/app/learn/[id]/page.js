import { notFound } from "next/navigation";
import source from "@/lib/curriculum/source.json";
import { LessonDetail } from "@/components/curriculum";
export function generateStaticParams() {
  return source.questions.map((q) => ({ id: q.id }));
}
export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title:
      source.questions.find((q) => q.id === id)?.title || "Lesson not found",
  };
}
export default async function LessonPage({ params }) {
  const { id } = await params;
  if (!source.questions.some((q) => q.id === id)) notFound();
  return <LessonDetail id={id} />;
}
