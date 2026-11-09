import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  GraduationCap,
  Lightbulb,
  Play,
  X,
} from "lucide-react";
import { challenges, verifyChallenge } from "../engine/challengeEngine";
import { useLab } from "../store";
import { PageGuide } from "./LearningUI";

export function ChallengeGallery() {
  const { completed, replace } = useLab();
  return (
    <div className="challenges-page scroll-area">
      <div className="section-eyebrow">
        <GraduationCap size={14} />
        NETWORK DETECTIVE
      </div>
      <h1>
        Something’s broken.
        <br />
        <span>That’s where you come in.</span>
      </h1>
      <p className="subtitle">
        Five real networking problems. A canvas, a packet, and your curiosity.
      </p>
      <div className="challenge-progress">
        <span>{completed.length} of 5 challenges solved</span>
        <div>
          {challenges.map((c) => (
            <i key={c.id} className={completed.includes(c.id) ? "done" : ""} />
          ))}
        </div>
      </div>
      <PageGuide page="challenges" />
      <div className="challenge-cards">
        {challenges.map((c) => (
          <button
            key={c.id}
            className="panel challenge-card"
            onClick={() => {
              replace(c.create());
              useLab.setState({
                page: c.id <= 2 ? "local" : "aws",
                challengeId: c.id,
                request: c.request,
              });
            }}
          >
            <span
              className={`challenge-number ${completed.includes(c.id) ? "done" : ""}`}
            >
              {completed.includes(c.id) ? (
                <Check size={19} />
              ) : (
                String(c.id).padStart(2, "0")
              )}
            </span>
            <div>
              <div className="challenge-meta">
                <span>{c.difficulty}</span>
                <span>
                  <Clock size={11} />
                  {c.minutes} min
                </span>
              </div>
              <h2>{c.title}</h2>
              <p>{c.description}</p>
            </div>
            <ArrowRight size={18} />
          </button>
        ))}
      </div>
      <div className="learning-note">
        <Lightbulb size={18} />
        <div>
          <strong>A passing packet is your proof.</strong>
          <p>
            Fix the configuration yourself. Completion is checked by the same
            routing and security engines that power the lab.
          </p>
        </div>
      </div>
    </div>
  );
}
export function ChallengeBanner() {
  const { challengeId, completed, topology } = useLab();
  const [hints, setHints] = useState(0);
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return null;
  const solved = completed.includes(challenge.id);
  function verify() {
    if (!challenge) return;
    const v = verifyChallenge(challenge.id, topology);
    useLab.setState((s) => ({
      result: v.result,
      request: challenge.request,
      step: 0,
      playing: true,
      completed: v.complete
        ? [...new Set([...s.completed, challenge.id])]
        : s.completed,
      toast: v.complete
        ? "Challenge solved. Your request and response both arrived."
        : `Not solved yet: ${v.explanation}`,
    }));
  }
  return (
    <section className={`challenge-banner ${solved ? "solved" : ""}`}>
      <div className="challenge-banner-top">
        <span className="section-eyebrow">
          {solved
            ? "✓ COMPLETED"
            : "CHALLENGE " + String(challenge.id).padStart(2, "0")}
        </span>
        <button
          aria-label="Exit challenge"
          onClick={() => useLab.setState({ challengeId: undefined })}
        >
          <X size={14} />
        </button>
      </div>
      <h3>{challenge.title}</h3>
      <p>{solved ? challenge.explanation : challenge.objective}</p>
      <div className="challenge-banner-actions">
        <button className="primary" onClick={verify}>
          <Play size={12} />
          Verify my fix
        </button>
        <button
          className="text-button"
          disabled={hints === challenge.hints.length}
          onClick={() => setHints(hints + 1)}
        >
          <Lightbulb size={13} />
          Hint {Math.min(hints + 1, 3)}/3
        </button>
        <button
          className="text-button"
          onClick={() => useLab.setState({ page: "challenges" })}
        >
          All challenges <ArrowRight size={12} />
        </button>
      </div>
      {hints > 0 && !solved && (
        <div className="hint-box">{challenge.hints[hints - 1]}</div>
      )}
    </section>
  );
}
