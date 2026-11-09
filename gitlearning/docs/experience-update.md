# raga-git experience update

## Audit findings

- The hotfix lab is titled cherry-pick but its final operation was merge. Its existing concept was not rendered in the workspace.
- New practical labs relied on generic explanations; readers could reach a terminal without an introduction to the topic.
- The graph's maximize icon implemented fit-to-width, not fullscreen. Panning used scroll offsets and failed when content did not overflow.
- `help` existed, but the familiar `git --help` and command-specific help forms did not. Misspelled commands offered no correction.

## Implementation and acceptance

- [x] Rename the visible product to raga-git while preserving stored progress.
- [x] Give all 40 practical labs a concise concept, before/after explanation, watch point, and linked source lessons.
- [x] Make the hotfix exercise actually cherry-pick, and verify its two branch snapshots.
- [x] Add command-specific help and typo suggestions without executing misspelled commands.
- [x] Separate fit and fullscreen; implement unrestricted camera panning, keyboard movement, zoom and accessible exit.
- [x] Improve discovery with short learning paths, visible topics, step progress, and relevant next labs.
- [x] Test simulator regressions, content coverage, graph interactions, accessibility and viewport fit.
- [x] Build and deploy to Vercel; verify the deployed routes and branding.

Original curriculum answers and numbering remain preserved. Explanations added here are editorial teaching aids, not quotations from the source documents.

## Validation

- 111 Node tests passed, including 13 actual Git practice sequences and 17 PowerShell machine plans.
- Initial browser suite: 28/29 passed; the remaining failure identified duplicated landmark labels on the two branch comparison graphs.
- After correcting the labels and improving framing, all 13 affected browser checks passed. Two additional tests cover narrow graph controls and both branch visualizer fullscreen buttons. There are now 31 browser checks, all passed across these runs.
- All 80 lesson routes and 63 practical/incident routes render. Original interview answers remain byte-for-byte traceable.
- Verified desktop sizes: 1920×1080, 1366×768, 1280×720. Mobile: 390×844, including actual touch events. No global workspace overflow.
- Fullscreen is an accessible, viewport-filling graph dialog with focus containment, an exit button and Escape restoration. It does not hide the browser's own chrome.
- Graph camera supports dragging in either direction even when content fits, wheel panning, Ctrl/Command-wheel zoom, keyboard arrows, fit and focus-HEAD. Fit preserves the entire graph; zooming in can be necessary for large histories.
- No external shell execution or real GitHub integration was added.

## Production

- Public address: https://raga-git.vercel.app
- Existing address remains working: https://gitquest-lab.vercel.app
- Deployment: https://gitquest-la4btrflm-balaji-degalas-projects.vercel.app
- Added the new address as a project production domain. Preview/deployment protection was not disabled.
- Anonymous Chromium verified ten routes/addresses, 80 interview entries, the full hotfix sequence, help and typo handling, fullscreen/panning and the mobile help terminal. No console or page errors. Desktop dimensions stayed exactly 1920×1080.
- Live evidence: `.local/raga-live-report.json`, `.local/raga-live-hotfix.png`, `.local/raga-live-fullscreen.png`, `.local/raga-live-mobile.png`.
- Browser storage is origin-specific. Existing progress is retained on the old address; the new address starts its own local progress. No automatic redirect hides the old address.
