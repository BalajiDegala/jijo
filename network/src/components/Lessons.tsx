import { useState } from "react";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { lessons } from "../data/lessons";
import type { Lesson, LessonAction } from "../data/lessons";
import { allowAll, awsTemplate, localTemplate } from "../data/templates";
import { useLab } from "../store";
import { useLearning } from "../learningStore";
import { loadAddressExample, useCidr } from "../cidrStore";
import type { CidrState } from "../cidrStore";

let previousCidr: CidrState | undefined;
export function startLesson(lesson: Lesson, resume = false) {
  const learning = useLearning.getState();
  if (!learning.previousExperiment) {
    const {
      topology,
      past,
      future,
      page,
      request,
      selectedId,
      result,
      step,
      challengeId,
    } = useLab.getState();
    useLearning.setState({
      previousExperiment: structuredClone({
        topology,
        past,
        future,
        page,
        request,
        selectedId,
        result,
        step,
        challengeId,
      }),
    });
    previousCidr = structuredClone(useCidr.getState());
  }
  if (lesson.template === "cidr") loadAddressExample();
  else if (lesson.template !== "challenges")
    useLab
      .getState()
      .replace(
        lesson.template === "aws"
          ? awsTemplate()
          : localTemplate(lesson.template === "routed"),
      );
  useLab.setState({ page: lesson.page, playing: false });
  learning.setPreferences({
    welcomed: true,
    guided: true,
    lessonId: lesson.id,
    lessonStep: resume
      ? Math.min(learning.lessonStep, lesson.steps.length - 1)
      : 0,
  });
  useLearning.setState({ lessonLoaded: true });
}
function returnToExperiment() {
  const saved = useLearning.getState().previousExperiment;
  if (saved) useLab.setState({ ...saved, playing: false });
  if (previousCidr) useCidr.setState(previousCidr);
  previousCidr = undefined;
  useLearning.setState({ previousExperiment: undefined, lessonLoaded: false });
  useLearning.getState().setPreferences({ lessonId: null, lessonStep: 0 });
}
function act(lesson: Lesson, action: LessonAction) {
  const lab = useLab.getState();
  const required =
    lesson.template === "aws"
      ? lesson.id === "security"
        ? "web"
        : "app"
      : "pc1";
  if (!lab.topology.resources.some((resource) => resource.id === required)) {
    useLab.setState({
      toast:
        "This practice device is missing. Reload the lesson example to try this step.",
    });
    return;
  }
  if (action === "inspect") {
    useLab.setState({ selectedId: "pc1" });
    return;
  }
  if (action === "broken-gateway" || action === "restore-gateway")
    lab.update("pc1", {
      gateway: action === "broken-gateway" ? "192.168.1.254" : "192.168.1.1",
    });
  if (action === "disable-nat" || action === "restore-nat")
    lab.update("nat", { enabled: action === "restore-nat" });
  if (action === "block-web" || action === "restore-web")
    lab.update("sg-web", {
      rules:
        action === "block-web"
          ? allowAll().filter((rule) => rule.direction !== "inbound")
          : allowAll(),
    });
  lab.run(
    lesson.template === "aws"
      ? {
          sourceId: lesson.id === "security" ? "internet" : "app",
          destination: lesson.id === "security" ? "web" : "internet",
          protocol: "TCP",
          port: lesson.id === "security" ? 80 : 443,
        }
      : { sourceId: "pc1", destination: "pc2", protocol: "ICMP", port: 80 },
  );
  useLab.setState({ playing: false });
}

export function WelcomeLesson() {
  const welcomed = useLearning((state) => state.welcomed);
  if (welcomed) return null;
  return (
    <section className="welcome-lesson">
      <div>
        <span className="section-eyebrow">NEW TO NETWORKING?</span>
        <h2>Start with one computer and one connection.</h2>
        <p>
          Learn what each part does, try an experiment, and see why it works.
          You can return to your own experiment at any time.
        </p>
      </div>
      <div className="example-actions">
        <button className="primary" onClick={() => startLesson(lessons[0])}>
          Start learning <ArrowRight size={17} />
        </button>
        <button
          className="secondary"
          onClick={() =>
            useLearning
              .getState()
              .setPreferences({ welcomed: true, guided: false })
          }
        >
          Explore the tools
        </button>
      </div>
    </section>
  );
}

export function LearningHub() {
  const { completed, lessonId, lessonStep } = useLearning();
  const saved = lessons.find((lesson) => lesson.id === lessonId);
  return (
    <div className="fundamentals scroll-area">
      <span className="section-eyebrow">LEARN BY TRYING</span>
      <h1>Networking, one idea at a time.</h1>
      <p className="subtitle">
        Each lesson opens a practice example with steps and a short
        understanding check. Your current experiment is kept for Return to my
        experiment.
      </p>
      <p className="lesson-progress">
        {completed.length} of {lessons.length} lessons understood
      </p>
      {saved && (
        <button className="primary" onClick={() => startLesson(saved, true)}>
          Resume {saved.title} · step{" "}
          {Math.min(lessonStep + 1, saved.steps.length)}
        </button>
      )}
      <div className="lesson-cards">
        {lessons.map((lesson, index) => (
          <article className="panel" key={lesson.id}>
            <span className="lesson-number">
              {completed.includes(lesson.id) ? (
                <Check size={22} />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            <h2>{lesson.title}</h2>
            <p>{lesson.question}</p>
            <button className="secondary" onClick={() => startLesson(lesson)}>
              {completed.includes(lesson.id) ? "Repeat" : "Start"}:{" "}
              {lesson.title} <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
      <p className="helper-copy">
        Progress is stored in this browser when storage is available. Practice
        examples use the same simulation as the other tools.
      </p>
    </div>
  );
}

export function LessonGuide() {
  const learning = useLearning();
  const page = useLab((state) => state.page);
  const lesson = lessons.find((item) => item.id === learning.lessonId);
  if (!lesson || !learning.guided)
    return learning.previousExperiment ? (
      <div className="lesson-return">
        <button className="secondary" onClick={returnToExperiment}>
          Return to my experiment
        </button>
      </div>
    ) : null;
  if (!learning.lessonLoaded)
    return (
      <section className="lesson-guide">
        <h2>Continue learning: {lesson.title}</h2>
        <p>
          Your reading progress was saved. Resume loads a fresh practice example
          at your saved step; repeat any actions you need.
        </p>
        <button className="primary" onClick={() => startLesson(lesson, true)}>
          Resume lesson
        </button>
        <button
          className="secondary"
          onClick={() => learning.setPreferences({ lessonId: null })}
        >
          Dismiss saved lesson
        </button>
      </section>
    );
  if (page !== lesson.page)
    return (
      <section className="lesson-guide">
        <p>Your lesson is paused: {lesson.title}.</p>
        <div className="example-actions">
          <button
            className="secondary"
            onClick={() => useLab.setState({ page: lesson.page })}
          >
            Back to lesson
          </button>
          <button className="secondary" onClick={returnToExperiment}>
            Return to my experiment
          </button>
        </div>
      </section>
    );
  const index = Math.min(learning.lessonStep, lesson.steps.length - 1);
  const step = lesson.steps[index];
  return (
    <section className="lesson-guide">
      <div className="lesson-guide-heading">
        <span>
          <BookOpen size={18} /> {lesson.title} · Step {index + 1} of{" "}
          {lesson.steps.length}
        </span>
        <button className="secondary" onClick={returnToExperiment}>
          Return to my experiment
        </button>
      </div>
      <h2>{step.title}</h2>
      <p>{step.body}</p>
      <div className="example-actions">
        {step.action && (
          <button className="primary" onClick={() => act(lesson, step.action!)}>
            {step.button}
          </button>
        )}
        <button
          className="secondary"
          disabled={index === 0}
          onClick={() => learning.setPreferences({ lessonStep: index - 1 })}
        >
          Previous lesson step
        </button>
        <button
          className="secondary"
          disabled={index === lesson.steps.length - 1}
          onClick={() => learning.setPreferences({ lessonStep: index + 1 })}
        >
          Next lesson step
        </button>
        <button className="text-button" onClick={() => startLesson(lesson)}>
          Reload lesson example
        </button>
      </div>
      {index === lesson.steps.length - 1 && (
        <LessonQuiz key={lesson.id} lesson={lesson} />
      )}
    </section>
  );
}
function LessonQuiz({ lesson }: { lesson: Lesson }) {
  const [answer, setAnswer] = useState<number>();
  const learning = useLearning();
  return (
    <div className="lesson-quiz">
      <h3>Check your understanding</h3>
      <p>{lesson.quiz.question}</p>
      <div className="quiz-options">
        {lesson.quiz.options.map((option, index) => (
          <button
            className="secondary"
            aria-pressed={answer === index}
            key={option}
            onClick={() => {
              setAnswer(index);
              if (index === lesson.quiz.correct)
                learning.setPreferences({
                  completed: [...new Set([...learning.completed, lesson.id])],
                });
            }}
          >
            {option}
          </button>
        ))}
      </div>
      {answer !== undefined && (
        <p className="quiz-feedback" aria-live="polite">
          <strong>
            {answer === lesson.quiz.correct ? "That's right. " : "Try again. "}
          </strong>
          {lesson.quiz.explanation}
        </p>
      )}
      {answer === lesson.quiz.correct && (
        <button
          className="primary"
          onClick={() => useLab.setState({ page: "fundamentals" })}
        >
          Choose the next lesson <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
