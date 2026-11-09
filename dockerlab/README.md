# DockerLab

A browser-based Docker workspace with one shared simulation engine for the terminal, architecture canvas, inspectors, Dockerfile builds, Compose projects, and troubleshooting scenarios. Docker installation and Docker Hub credentials are not required.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. Workspace resources, virtual files, editor contents, scenario progress, and virtual registry publications are saved in this browser's local storage. Reset environment removes virtual resources and stored data while keeping editor files. Leaving an interview lab restores the playground saved before that investigation.

```sh
npm test            # Engine, build, Compose, and scenario tests
npm run e2e         # Browser acceptance workflows and responsive checks
npm run build       # TypeScript checks and production output in dist/
npm run preview    # Serve the production build locally
```

Browser tests require Playwright Chromium (`npx playwright install chromium`). An existing browser can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Vercel deployment

This project is configured for Vercel as `joo-docker`. Vercel installs dependencies with `npm ci`, runs the TypeScript/Vite build, and serves `dist/`. No backend service or environment variables are required.

```sh
vercel link --project joo-docker
vercel --prod
```

The `.vercel` project link stays local. Deployment uploads exclude local tools, test artifacts, and Sites metadata.

## Try the workspace

```sh
docker pull nginx
docker run -d --name web -p 8080:80 nginx
docker network create app-network
docker network connect app-network web
docker ps
curl http://localhost:8080
```

Select resources and edges to inspect them. Drag nodes to arrange the environment, connect a network handle to a container, or use the inspector to stop, restart, or remove resources. Expand the canvas for a larger view; Escape restores the panel. Terminal input stays available while scrolling output. Use Up/Down for history, Tab for completion, Ctrl+` to focus the terminal, and `help` for the supported CLI.

- **Dockerfile Lab:** edit the virtual Flask project, build an image with cache and layer inspection, run it, then simulate login, tagging, and publication.
- **Compose Lab:** load one of five examples, edit YAML to change the architecture preview, select a service to locate its configuration, then create its resources in the shared engine.
- **Interview Scenarios:** investigate ten broken environments, request optional hints, repair their underlying configuration, and verify the outcome. Scoring includes inspections, observations, changes, and hint usage.
- **Resource Explorer:** inspect, filter, create, and remove shared containers, images, networks, and volumes.

## Architecture

`src/engine/DockerEngine.ts` owns Docker resource state, lifecycle operations, diagnostics, and events. `CommandParser.ts` validates the CLI subset. `DockerfileEngine.ts`, `ComposeEngine.ts`, and `ScenarioEngine.ts` operate on that same engine. `src/store/workspace.ts` connects the engine to React, persists the workspace, and records terminal history and troubleshooting progress. Canvas nodes and connections are derived from engine resources.

## Intentional simulation boundaries

- No host Docker commands, arbitrary shell commands, application code, or network packets execute. Terminal `curl`, `ping`, and DNS results come from simulated topology and service state. Application responses and container logs are representative rather than outputs of running application code.
- Image pulls use the finite catalog in `src/engine/catalog.ts`. Images built here can also be run. Registry login, tags, and pushes remain virtual and never contact Docker Hub.
- User-defined bridge networks provide name resolution and isolation. The default bridge supports IP connectivity without automatic name-based discovery. Overlay networking, Kubernetes, and real firewall rules are outside this subset.
- Port mappings support the simulator's TCP services. EXPOSE is metadata. Change published ports by removing and recreating a container. CPU/memory statistics and image/layer sizes are illustrative.
- Named volumes and virtual bind mounts are browser data, never directories on the user's computer. `write /path text` and `cat /path` are simulated file helpers. Permissions model the runtime user, volume ownership, and read-only mounts; they are not a complete POSIX filesystem.
- Readiness advances through deterministic command ticks rather than wall-clock time. Health checks recognize a small set of commands. Restart policies are recorded; there is no background daemon or complete crash/retry scheduler.
- Dockerfile builds support one stage and the documented FROM, WORKDIR, COPY, ADD, RUN, ENV, EXPOSE, CMD, ENTRYPOINT, USER, and ARG subset. RUN recognizes selected package-install patterns; packages are not downloaded. ADD accepts local virtual files. File copying, build arguments, cache keys, and layer sizes are simplified; this is not BuildKit.
- Compose supports a validated subset of services, images, local builds, names, ports, environment/env files, volumes, networks, dependencies, health checks, restart, command, and entrypoint. Unsupported fields and invalid configurations produce errors. It does not implement every option in the Compose specification.
- Data belongs to this browser and origin. Storage limits or browser-data removal can affect persistence. A visible warning indicates a save failure.

The browser suite covers container creation, network isolation, port repair, volume persistence, scenario recovery, Dockerfile build/publication, Compose synchronization, Resource Explorer actions, and mobile layout.
