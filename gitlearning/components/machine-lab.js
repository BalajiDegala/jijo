"use client";
import { useMemo, useState } from "react";
import { CopyButton } from "./ui";
import { machinePlan } from "@/lib/machine-practice";
import { useProgress } from "./providers";
export function MachineLab({ scenario }) {
  const [os, setOs] = useState("windows"),
    [checked, setChecked] = useState([]);
  const { progress, setProgress } = useProgress();
  const plan = useMemo(() => machinePlan(scenario, os), [scenario, os]);
  const id = scenario?.id || "playground";
  function report() {
    setProgress((p) => ({
      ...p,
      machine: [...new Set([...(p.machine || []), id])],
      activity: [
        {
          id,
          title: scenario?.title || "Free practice",
          type: "Machine practice · self-reported",
          at: new Date().toISOString(),
        },
        ...(p.activity || []),
      ].slice(0, 40),
    }));
  }
  return (
    <div className="machine-lab">
      <span className="eyebrow">
        Real-machine practice · Manual verification
      </span>
      <p>
        These commands run in your terminal. Copying them does not execute or
        verify anything on this site. Use only the new disposable practice
        directory.
      </p>
      <label>
        Operating system and shell
        <select
          value={os}
          onChange={(e) => {
            setOs(e.target.value);
            setChecked([]);
          }}
        >
          <option value="windows">Windows · PowerShell</option>
          <option value="mac">macOS · Terminal (zsh)</option>
          <option value="linux">Linux · Terminal (bash)</option>
        </select>
      </label>
      <p>
        Prerequisite: install Git from{" "}
        <a href="https://git-scm.com/install/" target="_blank" rel="noreferrer">
          git-scm.com
        </a>
        , reopen your shell and run <code>git --version</code>. Use a current
        Git version with switch and restore. This exercise uses repository-local
        identity, not your global configuration.
      </p>
      {plan.steps.some((s) =>
        /reset --hard|branch -D|restore |rebase |worktree remove/.test(
          s.command,
        ),
      ) && (
        <p className="editor-note">
          This exercise includes operations that can discard edits, move
          references or rewrite commits. Run only in the new disposable
          directory. Save uncommitted work separately and create a backup branch
          for commits before experimenting.
        </p>
      )}
      <h3>1. Create the isolated workspace</h3>
      <div className="copy-block">
        <CopyButton text={plan.setup} />
        <pre>{plan.setup}</pre>
      </div>
      <p>
        If Git reports an unknown identity, run the two git config commands
        inside the practice repository. If a directory already exists, use a
        fresh name. Stop after any unexpected error.
      </p>
      <h3>2. Execute and inspect</h3>
      {!plan.procedure &&
        !plan.steps.some((s) =>
          /add -p|hook|reset --hard/.test(s.command + " " + s.why),
        ) && (
          <CopyButton
            text={plan.steps.map((s) => s.command).join("\n")}
            label="Copy all exercise commands"
          />
        )}
      {plan.steps.map((s, i) => (
        <div className="machine-step" key={i}>
          <h4>
            {i + 1}. {s.title}
          </h4>
          {/reset --hard|branch -D|restore |revert|rebase/.test(s.command) && (
            <p className="editor-note">
              Impact: this operation can discard working edits or change
              history. Confirm the isolated path and preserve important work
              first. Use a backup branch for committed work; a branch does not
              save uncommitted edits.
            </p>
          )}
          <div className="copy-block">
            <CopyButton text={s.command} />
            <pre>{s.command}</pre>
          </div>
          <p>{s.why}</p>
          <p>
            <strong>Expected:</strong> {s.expected}
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={checked.includes(i)}
              onChange={(e) =>
                setChecked((v) =>
                  e.target.checked ? [...v, i] : v.filter((x) => x !== i),
                )
              }
            />
            I ran this and inspected the result on my computer.
          </label>
        </div>
      ))}
      {plan.procedure && (
        <>
          <h3>Incident reproduction and decision checkpoints</h3>
          <p>{plan.procedure.evidence}</p>
          <p>{plan.procedure.remediation}</p>
          <p>
            First construct the matching branch/file state in this disposable
            repository. The following is a procedure reference, not a blind
            executable script; named tags, paths and reflog positions must exist
            and be inspected first.
          </p>
          <pre>{plan.procedure.commands}</pre>
          <p>{plan.procedure.verification}</p>
          <p>
            <strong>Alternative:</strong> {plan.procedure.alternative}
          </p>
        </>
      )}
      <h3>3. Verify</h3>
      <div className="copy-block">
        <CopyButton text={plan.verification} />
        <pre>{plan.verification}</pre>
      </div>
      <p>
        Check branch names, commit messages, file contents and staged/unstaged
        status against the expected results. If an editor opens for a merge or
        revert, save its message and close it; in Vim use Esc, then :wq and
        Enter.
      </p>
      <h3>4. Cleanup</h3>
      <pre>{plan.cleanup}</pre>
      <p>
        Confirm you are outside <code>learner</code> and inside the uniquely
        named <code>raga-git-{id}-…</code> folder. Keep it for revision or
        remove only that folder using your file manager after inspecting its
        contents. Do not delete a real project.
      </p>
      <button
        className="ide-button teal"
        disabled={checked.length !== plan.steps.length}
        onClick={report}
      >
        {progress.machine?.includes(id)
          ? "Saved as self-reported practice"
          : "Record my self-reported completion"}
      </button>
      <p className="muted">
        The browser has not inspected your local files or command results.
      </p>
    </div>
  );
}
