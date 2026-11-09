# brocode

A simple, mobile-first reader for seven DevOps subjects. Read one topic at a time, swipe to the next, or jump directly to any topic.

**Live app: https://brocodeparadise.vercel.app**

## Content

The app contains **719 topics** across seven guides:

| Subject                            | Topics | Link                   |
| ---------------------------------- | -----: | ---------------------- |
| Kubernetes                         |    110 | `#/guide/kubernetes/1` |
| CI/CD Pipelines                    |    110 | `#/guide/cicd/1`       |
| Ansible & Configuration Management |     75 | `#/guide/ansible/1`    |
| AWS Cloud                          |    130 | `#/guide/aws/1`        |
| Git & Version Control              |     80 | `#/guide/git/1`        |
| Linux & Shell Scripting            |    112 | `#/guide/linux/1`      |
| Terraform & Infrastructure as Code |    102 | `#/guide/terraform/1`  |

Each topic keeps its full explanation, headings, lists, and comparison tables from the corresponding Markdown file in `docs/mdfiles/`. The source files remain intact. The website uses “topic” throughout. `scripts/website-wording.json` records the explicit wording edits that turn hiring-oriented commentary into practical learning language during import. The source index and closing study tips are excluded from the feed.

The Markdown files are the editable content sources. `src/guides.json` is the shared subject catalog used by the importer and app. `npm run content:build` extracts numbered sections into one JSON feed per subject in `public/content/`, checks the count and sequence against each source index, and records SHA-256 source hashes. Kubernetes retains its original `feed.json` filename. Import fails if restricted wording remains in any displayed content. Source files and generated feeds are excluded from formatting. The original PDFs are unchanged.

The previous 55 adapted lessons and app source are archived locally in `.tools/before-reels/` and excluded from deployment. Existing browser storage from that edition is left untouched but is no longer read or used by this app.

## Read the guide

- The app opens directly to the first Kubernetes topic. Use the **Subject** dropdown in the header to switch among all seven guides.
- Drag the bottom slider to browse quickly, or enter a number in “Jump to topic” and press Enter or leave the field. Values outside the guide are clamped to its first or last topic.
- Swipe upward on the topic heading or bottom navigation bar to advance; swipe downward to go back. The arrow buttons provide the same navigation.
- Scroll inside an answer to read all of it. Wide source tables scroll horizontally.
- Keyboard users can focus the feed and use Up/Down or Page Up/Page Down. Inside an answer, those keys scroll its text.
- The guide and topic number are reflected in the URL, such as `#/guide/cicd/100`, so refreshing stays on that topic. Existing `#/q/81` and `#/learn/kubernetes-055` links still open their corresponding Kubernetes topics.

Switching guides uses the same reading screen, and browser Back/Forward restores the corresponding guide and topic.

## Reading themes

Use the palette button beside **Subject** to open **Reading themes**. Choose Light, Dark, Pink, or Handwritten. The selection is saved on this device and applies across subjects and reloads. Changing the theme keeps the current topic in place. If browser storage is blocked, themes still work for the current session.

Handwritten uses warm notebook paper and locally bundled Kalam headings. Body text stays in a clear system font; commands and code keep monospace formatting. All four themes and the handwriting font work offline after the app has finished caching. The font's SIL Open Font License is included in `public/licenses/Kalam-OFL.txt`.

## Hosted app and offline reading

Vercel hosts the app independently of the development computer. Existing installations keep using **brocodeparadise.vercel.app**. When an update is ready, refresh the app to load it.

The app remains installable through the browser's Add to Home Screen / Install app action. Once its first online load and service-worker installation complete, all seven full guides can be read offline, including guides that have not yet been opened. App icons and branding remain brocode.

## Development

Requires Node.js 22 and npm.

```powershell
npm ci
npm run dev
```

Production preview and checks:

```powershell
npm run build
npm run preview -- --port 4173 --strictPort
npm test
npm run format:check
```

The build imports all guides, type-checks the app, bundles it, and creates a versioned offline cache. Browser checks cover content completeness and permitted wording edits, guide switching, direct jumps and slider controls, navigation and swipes, long-answer scrolling, tables, legacy links, small screens and rotation, offline access to every guide, retry behavior, and accessibility. They run in desktop Chromium, Android-sized Chromium, and iPhone-sized WebKit. Browser automation does not substitute for physical-device installation testing.

## Structure

```text
docs/mdfiles/                                       Seven Markdown sources
src/guides.json                                     Subject catalog, counts, and feed paths
scripts/build-content.mjs                             Validated Markdown import
scripts/website-wording.json                         Documented website wording edits
public/content/                                     Generated subject feeds
src/App.tsx                                          App shell and loading state
src/components/Reels.tsx                              Swipe feed and Markdown rendering
src/routes.ts                                        Guide and topic links
src/styles.css                                       Reading layout
scripts/build-sw.mjs                                 Offline cache generation
tests/reels.spec.ts                                   Source and interaction checks
tests/guides.spec.ts                                  Guide switching, jumps, wording checks
```

Only the current and adjacent answers are rendered. Markdown is displayed with React Markdown and GFM table support; raw HTML is not rendered. No application commands in the source text are executed.

## Deployment

The existing Vercel project is `paradise-interview-prep` in `balaji-degalas-projects`:

```powershell
vercel --prod --yes --scope balaji-degalas-projects
```

Build command: `npm run build`. Output directory: `dist`.

`.vercelignore` excludes PDFs, the old app archive, development tools, test artifacts, and environment files. The browser receives only the generated feeds and application assets. Hash navigation needs no server route rewrites.
