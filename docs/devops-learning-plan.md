# A command-first learning plan for JIJO

## What the existing studios teach us

| Studio | Observed learning interaction | What belongs in JIJO |
| --- | --- | --- |
| [Raga Git](https://raga-git.vercel.app/playground) | Typing `git add notes.txt` put one file in staging. Committing cleared staging, added a fourth commit to the graph, and left the local branch one commit ahead of the remote. All four repository panes remained visible. | Keep the input, output, and affected objects visible together. Show the difference between inspecting state and changing it. |
| [Original DockerLab](https://joo-docker.vercel.app) | In a fresh browser session, pulling Nginx created an image. Running it created a named container and showed its bridge membership. Stopping it changed its status while the image remained visible. | Reuse the existing Docker engine, command handling, resource canvas, and inspector as the basis of the beginner workspace. |
| [NetVerse](https://roopa-net.vercel.app) | Sending the default packet produced a 15-step request and reply. Playback exposed the switch forwarding the packet and the destination receiving it. | Give learners an event timeline when an action has an intermediate path. Open at a beginner summary and let them inspect the individual hops. |
| [TerraForge](https://venkata-farm.vercel.app) | The infrastructure workspace presents a resource model alongside generated Terraform. Its subnet configuration includes a reference to the VPC. | Link a selected object to the exact declaration or reference that describes it. This also fits Docker Compose and pipeline configuration. |
| [BroCode Paradise](https://brocodeparadise.vercel.app/#/guide/linux/1) | Its Linux guide opens one addressable topic at a time. The reader also has guides for Git, Kubernetes, CI/CD, Ansible, AWS, and Terraform. | Deep-link the relevant explanation from a lab and preserve the experiment when the learner returns. Use the reader for review and interview preparation. |
| [JIJO port mission](https://jijo-a8f3nculg-balaji-degalas-projects.vercel.app/#lab) | A preconfigured Flask container is already running. Prediction comes first. The command input appears during repair. | Retain the before-and-after trace and independent diagnosis. Place this mission after the learner has started and inspected a container and seen a service listen on a port. |

## One workspace across subjects

The playground opens directly to a working prompt or editor and the current environment. A scenario opens with its goal and a separate practice environment. Both can use the same terminal and visual components. A collapsible left rail handles navigation. The middle holds the subject's visual model. A docked terminal or editor stays reachable alongside the output. Selecting a file, resource, or event opens its properties on the right. On a phone, offer Terminal, View, and Details tabs that retain the same session.

A command, code edit, or canvas action operates on the same underlying environment. Show the command's actual output and highlight only the objects it affected. Inspection commands highlight what they read. A failed operation explains the failure and shows any state changes it actually made. A beginner can request a suggested command, edit it, and run it. Keep a command transcript, an optional explanation of the latest action, and a recoverable checkpoint.

Choose the visual for the subject. A directory tree answers “where is my file?” A variable table answers “what value is this loop using?” A process list answers “what is still running?” A dependency graph answers “what depends on this?” Use playback for activity that unfolds over time. Provide text equivalents for highlights and keyboard access to the same evidence.

Each concept has a short demonstration, an editable experiment, and a fresh task with less guidance. Record a prediction before revealing the result when an exercise assesses a prediction. Leave ordinary exploration and inspection available from the beginning. Mark a task complete when the resulting state or output meets its goal. Save progress separately for watching, guided practice, and independent completion.

### Module navigation

Every module opens straight into **Playground**. The collapsible rail has three primary destinations in this order. Show one at a time.

| Destination | What the learner opens | Docker example |
| --- | --- | --- |
| **Playground** | An open workspace for the learner's own experiments. Start empty or resume a saved project. Type commands, edit files, and inspect the visual result. | Pull an image, run as many containers as you choose, and see the graph change. |
| **Templates** | Finished examples. Preview the final output and configuration first, then open a copy to inspect or change it. | See two services on a shared network, the database volume, and their Compose YAML before opening the example. |
| **Scenarios** | Interview questions and practice cases from the module's source guide. Keep the original question number and prompt alongside the attempt. | In Docker Q69, diagnose why two containers on the same host cannot communicate and verify the restored connection. |

Opening a template creates a project from that setup. Starting a scenario creates an attempt and tracks its result. Returning to the playground restores the learner's own experiment.

### Where the scenarios come from

Use the subject guides in `F:\paradise\docs\mdfiles`. The seven Markdown guides cover Linux and shell scripting, Git, AWS, Terraform, Ansible, Kubernetes, and CI/CD. Use the supplied Docker and Containerization PDF for Docker. Its index on pages 1–4 lists Q1–Q80. Q3 covers images and containers, Q11 covers exposing and publishing ports, and Q14 covers Compose. Q63–Q80 supply the incident and design cases, including a restart loop (Q63), same-host communication (Q69), and a recurring build-cache miss (Q80).

Follow Raga Git's source mapping. Its Git incident exercises retain the Q58–Q80 identifiers from the Git guide. Preserve each module's own numbering and distinguish the source question and answer from any authored commands, fixture, and verification. Use a command-based attempt when the engine can demonstrate the outcome and an evidence or explanation exercise for a design question. Keep the full question index accessible from Scenarios. [Git incident exercises](../gitlearning/lib/incident-labs.js)

## Curriculum for a DevOps beginner

Inside **Playground**, the command reference opens alongside the prompt. The complete index is available from day one. Learners can jump to an advanced command, see its prerequisites, and practice an individual option. Contextual explanations introduce fundamentals as learners explore a command, object, or example.

Each catalog entry gives the exact syntax, aliases, options, prerequisites, and a runnable example. A learner types it, inspects the output and affected objects, then repeats the operation on a different fixture. Group equivalent spellings under one skill. Track command coverage separately from per-option coverage and learner progress. Label examples as available in the simulator, available in a runtime lab, or planned. For environment-specific commands, specify the required platform or plug-in. A reference entry remains visible while its practical exercise is being built.

For Linux, publish the training distribution and index its Bash builtins and installed command-line tools by package and version. For Git, index porcelain and plumbing and show aliases. For Python, teach expressions, control flow, functions, exceptions, files and tests in the editor alongside the interpreter, environment, and package-management commands. Apply the versioned CLI index to Terraform, Kubernetes, Ansible and cloud tools as each module opens.

### Docker command coverage

The inventory below comes from CLI help for Docker 29.1.3, Compose 5.3.1 and Buildx 0.35.0. Each row lists subcommands relative to its prefix. It is the starting curriculum inventory for these versions. Record experimental, platform-specific and plug-in prerequisites with individual lessons. Check the installed CLI help and official command tree at each curriculum release. [Docker CLI](https://docs.docker.com/reference/cli/docker/) · [Compose](https://docs.docker.com/reference/cli/docker/compose/) · [Buildx](https://docs.docker.com/reference/cli/docker/buildx/)

| Command family | Commands to teach |
| --- | --- |
| Client and registry | `--help`, `version`, `info`, `login`, `logout`, `search`. Index top-level spellings such as `ps`, `images`, `inspect`, `rmi`, `build`, and `bake` alongside the object or build operations they expose. Teach generic `inspect` with more than one object type. |
| `docker container` | attach, commit, cp, create, diff, exec, export, inspect, kill, logs, ls, pause, port, prune, rename, restart, rm, run, start, stats, stop, top, unpause, update, wait |
| `docker image` | build, history, import, inspect, load, ls, prune, pull, push, rm, save, tag |
| `docker network` | connect, create, disconnect, inspect, ls, prune, rm |
| `docker volume` | create, inspect, ls, prune, rm, update |
| `docker system` and `docker context` | System covers df, events, info, prune. Context covers create, export, import, inspect, ls, rm, show, update, use. |
| Builders and manifests | Buildx covers bake, build, create, dial-stdio, du, inspect, ls, prune, rm, stop, use, version. Include `dap build`, the history operations inspect/export/import/logs/ls/open/rm/trace, imagetools create/inspect, and policy eval/test. Cross-index `docker builder` according to the selected installation. Manifest covers annotate, create, inspect, push, rm. |
| `docker compose` | attach, build, commit, config, cp, create, down, events, exec, export, images, kill, logs, ls, pause, port, ps, publish, pull, push, restart, rm, run, scale, start, stats, stop, top, unpause, up, version, volumes, wait, watch. Include bridge convert and bridge transformations create/list. |
| Swarm orchestration | Swarm covers ca, init, join, join-token, leave, unlock, unlock-key, update. Node covers demote, inspect, ls, promote, ps, rm, update. Service covers create, inspect, logs, ls, ps, rm, rollback, scale, update. Stack covers config, deploy, ls, ps, rm, services. Config and secret each cover create, inspect, ls, rm. |
| Engine extensions | Checkpoint covers create, ls, rm. Plugin covers create, disable, enable, inspect, install, ls, push, rm, set, upgrade. |
| Installation-specific tracks | The inspected client also advertises ai, debug, desktop, extension, init, mcp, model, offload, sandbox, sbom and scout. Publish each plug-in's version, command tree and platform requirements as its track is added. |

**Current practice coverage.** The original DockerLab implements selected forms of pull, images, image inspect, rmi, run, ps, start, stop, restart, rm, logs, inspect, exec, stats, tag, login, push and logout. It supports six network operations, four volume operations, a Dockerfile build, and eight Compose commands (config, build, up, ps, logs, stop, start, down). Flags and aliases have narrower support than their real CLI counterparts. The port mission further restricts commands to its single service. First expose the existing working commands in JIJO, test their supported syntax, and publish the remaining catalog entries with their status. Track gaps such as container create, logs following, file copying, context selection, and Compose exec explicitly.

**One example of depth.** In `docker ps`, start two containers and stop one. Run `docker ps` and `docker ps -a` and inspect which rows appear. Progress to filtering by status, returning IDs with `-q`, and formatting selected fields. For the independent task, ask the learner to return only the IDs of exited containers in a fresh environment. Accept equivalent commands that produce the correct set. Teach `docker container ls` as the same operation. The Docker playground supports status filtering, quiet IDs, the container ls alias, and the ID, Names, Image, Status, State and Ports format fields.

### Guided path across modules

Carry one small status service through the path. A learner can enter any module with a working starter or continue their own project. Each stage produces something the next stage uses.

| Stage | First hands-on work | Evidence the learner can inspect |
| --- | --- | --- |
| 1. Computer and Linux fundamentals | Navigate a project, create a file, start a process, read a log, and inspect an exit status. | Working directory, file contents, process ID, and output. The learner can distinguish a file on disk from a running program. |
| 2. Bash and Python | In Bash, pass arguments, pipe output, and branch on an exit code. In Python, use values, lists, conditions, loops, and functions to read a JSON log and summarize failed requests. | Stream contents, current source line, variable values, return value, and test output. Try a second log with different data. Introduce JavaScript later as an optional route for the same service. |
| 3. Git | Edit the service, stage one file, commit, and inspect the difference between the working tree and the commit. | File diff, staged snapshot, commit and branch. Reuse the Git playground. |
| 4. Networking fundamentals | Run the service, resolve its name, identify its listening port, and send a request. | Name resolution, process and socket, destination, and request/response path. Use NetVerse for routing and packet detail. |
| 5. Containers and Compose | Pull an image, run two containers, stop one, inspect both, and remove one. Then package the status service, publish a port, attach storage, and connect a database. | Images, individual container lifecycles, ports, mount contents, and the generated Compose file. Use the existing port repair at this point. |
| 6. Delivery and infrastructure | Make a failing test block a CI job, then fix it. Edit Terraform configuration and inspect a modeled plan. Apply an Ansible configuration twice in a practice environment. | Pipeline logs and artifacts, proposed infrastructure changes, and the second configuration run's change count. |
| 7. Operations and capstone | Deploy the service in a modeled Kubernetes environment, inspect a rollout, read logs and metrics, diagnose a failure, and recover. | Desired and actual replica counts, events, application health, and before-and-after evidence. Revisit AWS networking through the same service. |

## First release to build

Ship the versioned command index alongside the first labs. The catalog defines the full scope. The two exercises below establish how commands and programming concepts are taught and checked. Publish a coverage view by module and family showing which commands have a working exercise, which options are supported, and which a learner has used independently.

1. **Docker pilot.** Deliver the existing terminal and live resource canvas as the module entry. Next publish a working Compose example under Templates with its graph and YAML visible before copying. Then map the PDF index to Scenarios, beginning with Q69 and verifying that a failed connection succeeds after the repair. Keep the existing port mission and saved progress reachable as practice for Q11. Introduce images, container lifecycles and the other command families through the playground reference.
2. **Linux and Python pilot.** Build a single exercise around a short log and a Python file. The learner reads the file from a prompt, edits a function that counts failed requests, runs it, then tests it on an unfamiliar log. Show the file tree and variable values. Execute the supported Python exercise in an isolated browser runtime using the learner's source. Mark the Linux shell and Docker exercises as simulated. This second pilot tests whether the workspace works for programming as well as infrastructure.
3. **Beginner trial.** Give five first-time learners a fresh version of each task. Record the first command they choose, where they ask for help, and whether they can explain the observed result. As a proposed release target, four of five should be able to stop the requested container and identify what remains, and four of five should be able to adapt the Python function to the second input without a step-by-step hint. Ask a learner who got stuck to show the exact screen or output that confused them.
4. **Expand after the trial.** Revise the prompts or visuals that caused confusion, then connect Git and networking. Add Compose, CI/CD, Terraform, Ansible, and Kubernetes progressively as the status service requires them.

## How a new lesson earns its place

Before implementation, write down one prerequisite, one skill, the starting environment, a learner action, the expected observable result, a plausible mistake, and an independent task. Agree on which behavior runs and which is modeled. Verify the example through the same engine or runtime the learner uses. A new module is ready to extend when a learner can complete a novel task and point to the evidence that shows it worked.
