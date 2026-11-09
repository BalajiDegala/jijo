# Five-question prototype review

Historical review of the initial Q1–Q5 edition. The current app uses all 110 questions from the supplied Markdown guide in a simple swipe feed; see [README](../README.md). The notes below describe the original prototype only.

This is a working first edition for reviewing the experience before finalizing the product. It follows the learning-first intent in `mvp/main`, with the user's narrower instruction to start with five Kubernetes questions.

## Source selection

The Kubernetes PDF contains 58 scanned pages. The first five questions in its index are used. Page references below are one-based PDF page numbers.

| App ID         | Source                                              | PDF pages | Learning experience                           |
| -------------- | --------------------------------------------------- | --------- | --------------------------------------------- |
| kubernetes-001 | Q1: What is Kubernetes and why does it exist?       | 6         | Concept and desired-state flow                |
| kubernetes-002 | Q2: Architecture — control plane and worker nodes   | 6–7       | Component responsibilities and execution flow |
| kubernetes-003 | Q3: What is a Pod? Why not run containers directly? | 7         | Shared context, example, and recall           |
| kubernetes-004 | Q4: ReplicaSet vs Deployment                        | 7–8       | Visual comparison and rollout sequence        |
| kubernetes-005 | Q5: Kubernetes Service types                        | 8         | Access-model comparison and discovery flow    |

Content is adapted into shorter explanations, recall cues, interview responses, and follow-ups. It is not a verbatim transcription. The original PDFs remain untouched and are not deployed with the public app.

## Accuracy clarifications

The source is the editorial starting point. Some broad statements were clarified against official Kubernetes references:

- Automatic scaling needs an autoscaler configuration and suitable metrics. Kubernetes does not promise that every update has zero downtime. [Overview](https://kubernetes.io/docs/concepts/overview/)
- A Pod's containers share networking and can mount shared volumes; they do not share their root filesystems by default. [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
- kube-proxy can be replaced by another Service networking implementation. Scheduling and launching containers are separate jobs. [Components](https://kubernetes.io/docs/concepts/overview/components/)
- Retained rollout history enables rollback, which is not instantaneous or automatically triggered for every failed rollout. A replica-count change alone does not create a new rollout revision. [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- ExternalName is a DNS alias rather than a Pod traffic proxy. LoadBalancer needs a supporting provider/controller, and not every Service has a virtual IP. [Services](https://kubernetes.io/docs/concepts/services-networking/service/)

## Review these behaviors first

1. **The first minute:** Is it obvious what to study and how to begin?
2. **Progressive detail:** Does the short answer make sense before opening deeper sections?
3. **Recall:** Is the transition from reading to explaining clear? Does hiding the answer help?
4. **Self-assessment:** Can you honestly distinguish a partial answer, a good answer, and interview readiness?
5. **Revision:** After a weak attempt, is the next useful action easy to find?
6. **Mobile comfort:** Are the type size, touch controls, comparison tables, and navigation comfortable on your actual phone?

## Deliberate prototype boundaries

- Exactly five main questions, from a single source topic. Follow-up prompts enrich these lessons without importing the full document.
- Self-assessment and concept checklists; no automated answer grading or speech transcription. Browser/keyboard dictation can be used in the answer field.
- Local progress, favorites, difficulty overrides, review flags, saved answers, assessed attempts, and completed session history.
- Offline production app and install assets; no store submission, native tooling, or backend.
- Estimated lesson durations, no countdown timer, streak mechanics, or invented activity data.
- Raw document import, semantic duplicate discovery, thousands-of-question benchmarking, selectable offline packs, cloud sync, and automated spaced repetition are later decisions.

The next iteration should respond to how these five lessons feel in practice before expanding the document collection.
