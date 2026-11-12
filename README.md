# JIJO

**Learn it. Visualize it. Build it. Break it. Fix it. Deploy it.**

JIJO’s first learning journey follows an HTTP request from a browser into a Flask container. Predict the response, inspect a rule-driven simulation, repair the mapping, explain the result, and solve a second case with a different port and service. The root application imports DockerLab’s engine directly.

## Run the learning studio

Use Node 22 and npm from the repository root.

```sh
npm ci
npm run dev
```

Open [the local studio](http://127.0.0.1:4178). Guest progress is saved in IndexedDB. **Project files** lets you download or restore a JSON backup. Completing the independent repair unlocks a ZIP with Python source, requirements, a Dockerfile, Compose configuration, and a local verification checklist.

## Docker playgrounds

Open **Docker** from the learning module directory. Its overview groups the guided lesson and two playgrounds. The sidebar opens from the top left and remembers a desktop preference on this device. Git, Networking and Terraform open their standalone studios.

- **Resource playground** (`#graph`) supports application, Nginx, PostgreSQL, Redis, network and volume nodes. Press Tab on the canvas to add a node. Right-click a service (or use its actions button), choose Connect, then select a highlighted target. F expands either playground and Esc exits. Resolve validation errors to download the generated Compose file or a ZIP with each application's build context.
- **Dockerfile playground** (`#dockerfile`) includes Flask, FastAPI, Express and Fastify starters and repair exercises. Select and edit instruction nodes or switch to Source. Connecting two instruction nodes places the later step immediately after the source. Predict the result, run the simulated build, then add the checked recipe to the graph. Use **Edit service Dockerfile** in the inspector to update an existing service.

## Existing projects

| Directory | Existing project | Purpose |
| --- | --- | --- |
| [dockerlab](dockerlab/README.md) | DockerLab | Rule-driven Docker, Dockerfile, and Compose simulations |
| [gitlearning](gitlearning/README.md) | Raga Git | Interactive Git learning, visualizations, and practice |
| [network](network/README.md) | NetVerse | Networking and AWS architecture exercises and simulations |
| [terraforge](terraforge/README.md) | TerraForge | Visual infrastructure modeling and Terraform configuration generation |
| [paradise](paradise/README.md) | BroCode Paradise | Technical questions and reference content |

## Development

The root app has its own lockfile. Installing legacy apps is optional for JIJO development. Each legacy directory has its own setup and tests.

```sh
npm test
npm run build
npm run check:export
npx playwright install chromium
npm run e2e
```

The export check uses the Docker Compose CLI and Python 3 to normalize the configuration and compile the sample. Browser tests serve the production build on port 4179. To use an installed Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

The repository intentionally excludes dependency folders, build output, local environment files, credentials, and machine-specific hosting metadata. Existing source files and bundled runtime assets are preserved.

The large original reference PDFs in `paradise/docs/` remain local and are not included. BroCode Paradise uses the included Markdown sources in `paradise/docs/mdfiles/` and generated content files.

## Current status

The implemented scope, source audit, architecture decisions, release procedure, and limitations are in the [studio engineering notes](docs/studio.md). The [contributor guide](AGENTS.md) lists repository conventions and verification commands.

Production deployment is a separate, explicitly authorized step. Individual projects retain their existing deployment configuration; this repository does not introduce automatic deployments.
