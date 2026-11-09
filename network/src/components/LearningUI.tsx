import { useEffect, useRef, useState } from "react";
import { BookOpen, HelpCircle, X } from "lucide-react";
import { glossary, pageGuides } from "../data/learning";
import { useLearning } from "../learningStore";
import { useLab } from "../store";
import type { Page } from "../store";

export function Term({ name, children }: { name: string; children?: string }) {
  const entry = glossary.find(
    (item) => item.term.toLowerCase() === name.toLowerCase(),
  );
  if (!entry) return <span>{children ?? name}</span>;
  return (
    <details className="term-help">
      <summary>
        {children ?? name} <HelpCircle size={13} />
      </summary>
      <div>
        <strong>{entry.term}</strong>
        <p>{entry.definition}</p>
        <p>{entry.example}</p>
      </div>
    </details>
  );
}

export function PageGuide({ page }: { page: Page }) {
  const guided = useLearning((s) => s.guided);
  const guide = pageGuides[page];
  if (!guide) return null;
  return (
    <details className="page-guide" open={guided} key={`${page}-${guided}`}>
      <summary>
        <BookOpen size={18} /> What is this lab? How do I use it?
      </summary>
      <div className="guide-copy">
        <p>{guide.meaning}</p>
        <p>
          <strong>Try this:</strong> {guide.try}
        </p>
        <p>
          <strong>Watch for:</strong> {guide.observe}
        </p>
      </div>
    </details>
  );
}

export function LearningToolbar() {
  const learning = useLearning();
  useEffect(() => {
    document.documentElement.style.fontSize = `${{ standard: 16, large: 19, extra: 22 }[learning.textSize]}px`;
  }, [learning.textSize]);
  return (
    <div
      className="learning-toolbar"
      aria-label="Learning and display preferences"
    >
      <label>
        <span>Text size</span>
        <select
          aria-label="Text size"
          value={learning.textSize}
          onChange={(e) =>
            learning.setPreferences({
              textSize: e.target.value as typeof learning.textSize,
            })
          }
        >
          <option value="standard">Standard</option>
          <option value="large">Large</option>
          <option value="extra">Extra large</option>
        </select>
      </label>
      <label>
        <span>Learning style</span>
        <select
          aria-label="Learning style"
          value={learning.guided ? "guided" : "free"}
          onChange={(e) =>
            learning.setPreferences({
              guided: e.target.value === "guided",
              welcomed: true,
            })
          }
        >
          <option value="guided">Learn with guidance</option>
          <option value="free">Explore freely</option>
        </select>
      </label>
      <button
        className="secondary"
        onClick={() => useLearning.setState({ glossary: "" })}
      >
        <BookOpen size={17} /> Networking glossary
      </button>
      {learning.storageUnavailable && (
        <span className="preference-note">
          Preferences will last for this session; browser storage is
          unavailable.
        </span>
      )}
    </div>
  );
}

export function GlossaryDialog() {
  const term = useLearning((s) => s.glossary);
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (term !== null) {
      setQuery(term);
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [term]);
  const close = () => useLearning.setState({ glossary: null });
  const matches = glossary.filter((entry) =>
    `${entry.term} ${entry.definition} ${entry.example}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <dialog
      ref={dialog}
      className="glossary-dialog"
      aria-labelledby="glossary-title"
      onCancel={close}
      onClose={close}
    >
      <div className="visual-heading">
        <h2 id="glossary-title">Networking glossary</h2>
        <button className="secondary" onClick={close}>
          <X size={17} /> Close glossary
        </button>
      </div>
      <label className="glossary-search">
        Find a networking term
        <input
          autoFocus
          aria-label="Search networking terms"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try subnet, gateway, or NAT"
        />
      </label>
      <div className="glossary-results">
        {!matches.length && (
          <p>No matching terms. Try a shorter word or clear the search.</p>
        )}
        {matches.map((entry) => (
          <article key={entry.term}>
            <h3>{entry.term}</h3>
            <p>{entry.definition}</p>
            <p>
              <strong>Example:</strong> {entry.example}
            </p>
            <button
              className="text-button"
              onClick={() => {
                useLab.setState({ page: entry.page });
                close();
              }}
            >
              Open related lab
            </button>
          </article>
        ))}
      </div>
    </dialog>
  );
}
