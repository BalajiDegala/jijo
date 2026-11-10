# JIJO contributor guide

The root Vite app lives in studio/. Run commands from the repository root with Node 22. The five imported projects have separate manifests, tooling and deployment setups. Nested contributor instructions apply inside their respective directories.

- Keep learning content and fixtures in studio/lab/content.ts. Change Docker semantics in the shared engine only when the existing DockerLab callers and tests support the change. Build fixtures through the same engine used for the exercise.
- Keep verification tied to an observed outcome. Record the prediction before revealing test output. Maintain the independent repair with reduced hints. Identify the simulated execution mode in all lab surfaces.
- Treat the persisted event format and fixture semantics as a versioned contract. Preserve old progress through migration or provide explicit recovery. Bound and validate imported input before replacing the current project.
- Use local assets, typed interfaces, keyboard-operable controls, native semantics, and responsive layouts. Include useful failure feedback when storage, commands, verification or imports fail.
- Run npm test, npm run build, npm run check:export, then npm run e2e. For browser setup run npx playwright install chromium. Rerun DockerLab engine tests from dockerlab/ when changing the integration. See docs/studio.md for validation boundaries.
- Keep .env files, hosting credentials, caches and machine-specific configuration out of source. Obtain explicit approval before production deployment, paid services, or execution against real infrastructure. The root CI workflow only performs checks.
