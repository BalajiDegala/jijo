"use client";
import Link from "next/link";
import { ArrowRight, Check, GitBranch, Sparkles } from "lucide-react";
import { learningPaths, nextScenarioId } from "@/lib/scenario-concepts";
import { scenarios } from "@/lib/scenario-engine";
import { useProgress } from "./providers";
import { CherryPickPicture } from "./concept-explainer";
export function LearningPaths() {
  const { progress } = useProgress();
  const resumeId = progress.lastScenario
    ? nextScenarioId(progress.lastScenario)
    : "hotfix";
  const featured =
    scenarios.find((s) => s.id === resumeId) ||
    scenarios.find((s) => s.id === "hotfix");
  return (
    <div className="learning-paths">
      <section className="featured-lab">
        <div className="featured-copy">
          <span className="eyebrow">
            <Sparkles size={14} />{" "}
            {progress.lastScenario
              ? "Your next experiment"
              : "Try a real situation"}
          </span>
          <h2>
            {featured.id === "hotfix"
              ? "One fix. Two branches.\nNothing extra shipped."
              : featured.title}
          </h2>
          <p>{featured.introduction.definition}</p>
          <Link
            className="ide-button primary"
            href={`/scenarios/${featured.id}`}
          >
            Explore {featured.introduction.command}
            <ArrowRight size={15} />
          </Link>
          <small>
            {featured.minutes} minute lab ·{" "}
            {featured.mode === "browser"
              ? "Run it. See it. Understand it."
              : "Investigate. Decide. Verify."}
          </small>
        </div>
        <div className="featured-visual">
          {featured.id === "hotfix" ? (
            <>
              <span className="visual-label">
                CHERRY-PICK / A CHANGE WORTH KEEPING
              </span>
              <CherryPickPicture applied />
              <span className="visual-caption">
                Keep the release focused. Carry the fix forward.
              </span>
            </>
          ) : (
            <>
              <GitBranch size={40} />
              <p>{featured.introduction.before}</p>
              <ArrowRight size={22} />
              <p>{featured.introduction.after}</p>
            </>
          )}
        </div>
      </section>
      <div className="path-section-title">
        <h2>Pick a path. Build a little confidence.</h2>
        <Link href="/scenarios">
          All 40 labs <ArrowRight size={14} />
        </Link>
      </div>
      <div className="path-grid">
        {learningPaths.map((path, i) => {
          const count = path.ids.filter((id) =>
            progress.scenarios.includes(id),
          ).length;
          const next =
            path.ids.find((id) => !progress.scenarios.includes(id)) ||
            path.ids[0];
          return (
            <Link
              className={`learning-path path-${path.accent}`}
              href={`/scenarios/${next}`}
              key={path.id}
            >
              <span className="path-index">
                {count === path.ids.length ? <Check size={18} /> : `0${i + 1}`}
              </span>
              <h3>{path.title}</h3>
              <p>{path.detail}</p>
              <div
                className="path-progress"
                aria-label={`${count} of ${path.ids.length} labs completed`}
              >
                {path.ids.map((id) => (
                  <span
                    key={id}
                    className={
                      progress.scenarios.includes(id) ? "complete" : ""
                    }
                  />
                ))}
              </div>
              <div className="path-footer">
                <span>
                  {count} / {path.ids.length} complete
                </span>
                <span>
                  {count === path.ids.length
                    ? "Revisit"
                    : count
                      ? "Continue"
                      : "Begin"}{" "}
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
