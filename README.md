# JIJO

**Learn it. Visualize it. Build it. Break it. Fix it. Deploy it.**

JIJO is a planned interactive software engineering and deployment learning platform. This repository preserves the five existing projects that will inform its development. They currently run as separate applications; the unified JIJO experience has not been implemented.

| Directory | Existing project | Purpose |
| --- | --- | --- |
| [dockerlab](dockerlab/README.md) | DockerLab | Rule-driven Docker, Dockerfile, and Compose simulations |
| [gitlearning](gitlearning/README.md) | Raga Git | Interactive Git learning, visualizations, and practice |
| [network](network/README.md) | NetVerse | Networking and AWS architecture exercises and simulations |
| [terraforge](terraforge/README.md) | TerraForge | Visual infrastructure modeling and Terraform configuration generation |
| [paradise](paradise/README.md) | BroCode Paradise | Technical questions and reference content |

## Development

Each directory has its own package manifest, dependencies, configuration, tests, and README. Follow the relevant project README for setup and verification. There is no root application or shared package workspace yet.

The repository intentionally excludes dependency folders, build output, local environment files, credentials, and machine-specific hosting metadata. Existing source files and bundled runtime assets are preserved.

The large original reference PDFs in `paradise/docs/` remain local and are not included. BroCode Paradise uses the included Markdown sources in `paradise/docs/mdfiles/` and generated content files.

## Current status

The existing projects have been audited. A Docker-focused learning journey is the proposed first JIJO increment; implementation awaits approval. Simulations do not provision cloud infrastructure or execute learner code on a server.

Production deployment is a separate, explicitly authorized step. Individual projects retain their existing deployment configuration; this repository does not introduce automatic deployments.
