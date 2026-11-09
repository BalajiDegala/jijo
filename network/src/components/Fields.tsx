import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { fieldHelp } from "../data/learning";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [applied, setApplied] = useState(false);
  const helpId = useId();
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <div className="field-with-help">
      <label className="field">
        <span>{label}</span>
        <input
          type={type}
          aria-label={label}
          aria-describedby={fieldHelp[label] ? helpId : undefined}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => {
            setDraft(e.target.value);
            setApplied(false);
          }}
          onBlur={() => {
            if (draft !== String(value)) {
              onChange(draft);
              setApplied(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
      </label>
      {draft !== String(value) ? (
        <p className="field-feedback">
          Press Enter or leave this field to apply.
        </p>
      ) : (
        applied && (
          <p className="field-feedback" aria-live="polite">
            Applied to this experiment.
          </p>
        )
      )}
      {fieldHelp[label] && (
        <details className="field-help">
          <summary>Explain {label.toLowerCase()}</summary>
          <p id={helpId}>{fieldHelp[label]}</p>
        </details>
      )}
    </div>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const helpId = useId();
  return (
    <div className="field-with-help">
      <label className="field">
        <span>{label}</span>
        <select
          aria-label={label}
          aria-describedby={fieldHelp[label] ? helpId : undefined}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
      </label>
      {fieldHelp[label] && (
        <details className="field-help">
          <summary>Explain {label.toLowerCase()}</summary>
          <p id={helpId}>{fieldHelp[label]} This choice applies immediately.</p>
        </details>
      )}
    </div>
  );
}
