# Release validation — 20 October 2026

Current production: https://raga-git.vercel.app

Current deployment: https://gitquest-la4btrflm-balaji-degalas-projects.vercel.app

## raga-git update

111 unit/integration checks passed. All 31 browser checks passed across the full run and focused reruns following an accessibility correction. Added coverage includes help aliases and typo handling, every practical lab's concept introduction, the corrected cherry-pick sequence, unrestricted graph panning, touch input, fullscreen/Escape/focus, narrow controls and both branch comparison graphs.

The final production build succeeded. Anonymous live checks verified the new and old addresses, all 80 interview entries, the full cherry-pick hotfix exercise, help/typo feedback, graph fullscreen and panning, and mobile help. No runtime/console errors or desktop overflow were detected. Full details and artifacts: [experience update](experience-update.md).

The following records describe the previous baseline release, retained for comparison.

## Verified outcomes

- Next.js production build generated 156 static routes/assets; Vercel installation and production build completed successfully.
- 104 unit/integration checks passed in the full suite. The subsequent upstream/unsupported-argument regression test also passed, bringing the current suite inventory to 105. The affected engine/content suite passed all 73 checks after that change.
- These checks include thirty executable scenario sequences, independent remote storage, immutable push rejection, fetch with dirty files, pull/rebase, merge conflict resolution, branch protection, original source numbering/answers and progress serialization.
- Seventeen complete Windows PowerShell exercise plans ran against actual Git in isolated `.local/machine-plans` directories. Thirteen existing Git instruction sequences were also tested in disposable repositories. No user repository was reset or modified by those exercises.
- Twenty-three browser checks passed across the full suite and focused reruns after corrections. They cover 1920×1080, 1366×768 and 1280×720 layouts; all four state panels in one row; graph/terminal visibility; internal scrolling; expanded rail; long history/output; ten guided workflows; remote collaboration; files; autocomplete/history; interview revision; lesson and incident assessments; manual completion; mobile navigation and reduced motion.
- All eighty lesson routes and all sixty-three practical/incident routes loaded successfully in Chromium. Original interview entries number exactly eighty; the tricky category has twenty-three.
- Axe reported no violations on Learn, Playground, a source lesson, Scenarios, an incident, Interview, Progress and Branch Visualizer after the final label fixes. Automated checks do not replace comprehensive assistive-technology testing.

## Live production smoke test

Eight primary production routes returned HTTP 200. A complete non-fast-forward rejection → fetch → inspect → merge → successful push exercise passed on the deployed website. The interview page rendered all eighty entries. A 390px mobile terminal executed simulated status successfully. Browser page and console error collection was empty.

The live desktop measurement was `innerHeight=1080`, `document.scrollHeight=1080`, `innerWidth=1920`, `document.scrollWidth=1920`. The workspace did not introduce global scrolling.

Local evidence artifacts: `.local/live-check.json`, `.local/live-workspace-1920.png`, `.local/live-mobile-terminal.png`. They are intentionally excluded from deployment and version control.

## Practical limits

Native macOS and Linux were not available for OS-level execution tests. Their instructions use POSIX shell syntax and shared Git commands; Windows plans were exercised directly. Advanced server/authentication/CI/GitOps procedures need the learner's real environment and human verification. No browser checkbox proves those operations occurred. The simulator uses whole-file merges, clean linear rebase, lightweight tags, one remote fixture and deterministic teaching IDs. See `simulator-scope.md` for the complete supported boundary.

Original curriculum files are preserved. The unavailable reference screenshot and source OCR/semantic ambiguities are recorded in the implementation plan and coverage matrix.
