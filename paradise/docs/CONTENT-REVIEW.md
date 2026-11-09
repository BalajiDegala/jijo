# Kubernetes content review: Q1–Q55

Historical notes for the earlier 55-lesson edition. The current app is a simple 110-question feed using the supplied Markdown guide directly; see [README](../README.md). The adapted lessons described below are no longer served.

The next 50 questions, Q6–Q55, extend the original five-question prototype at the user's request. They follow the order of the supplied scanned guide, docs/7. Kubernetes_compressed.pdf, covering PDF pages 8–28. Page numbers below are one-based PDF pages, not printed page labels. The original document is unchanged and is excluded from deployment.

## How the answers are taught

Each new lesson has a concise answer, a plain-language explanation in short paragraphs, a sequence explaining the mechanism, a concrete scenario or annotated manifest fragment, common mistakes, a memory cue, an interview answer, and a linked follow-up. Each also has an applied understanding check with a reasoned answer. These are editorial adaptations, not verbatim PDF transcriptions. Examples, interview wording, and checks are authored for learning; official references clarify technical limits and current behavior.

The steps and example are open after “Help me understand.” The understanding check does not mark a lesson ready, record a recall attempt, or assess the user's written explanation. Interview readiness remains an explicit self-assessment after attempting recall. Existing IDs and local-storage keys are retained. One ready lesson is now 1/55 rather than 1/5, so the percentage changes even though saved progress is preserved.

## Accuracy clarifications

- Namespaces alone do not provide complete network or security isolation; use the relevant RBAC, quota, and networking controls.
- Base64 is not encryption. Secret synchronization and application activation are separate steps; mounted files update eventually, while environment values and subPath mounts do not hot-update.
- Readiness failure does not restart a container. Running is not the same as Ready, and CrashLoopBackOff is not a Pod phase.
- Regular init containers finish before app startup; native sidecars are a restartable init-container lifecycle exception.
- Deployment rollback is deliberate, restores the Pod template, and does not reverse external database changes.
- A toleration permits placement but does not force a node choice. Autoscalers cannot fix impossible placement constraints by adding arbitrary nodes.
- PDBs constrain supported voluntary eviction requests, not direct deletion, workload scale-down, rolling updates, or all failures. Preemption respects them on a best-effort basis.
- Helm pre-install hooks cannot assume ordinary resources from that install already exist; post-install readiness depends on waiting behavior.
- The built-in Restricted Pod Security Standard does not itself require readOnlyRootFilesystem. Pod-level and container-level security fields have different scopes.
- The termination grace period includes preStop; postStart is not a guaranteed barrier before the application entrypoint.
- Service mesh architecture is implementation-dependent, including non-sidecar models; mutual TLS does not replace authorization.
- Pod ratios do not guarantee precise request percentages during a canary. Git reverts do not restore runtime data.
- Ephemeral debug containers cannot simply be removed or edited after addition to an existing Pod.
- Always image pulling can reuse cached layers. Default pull policy is assigned when an object is created, not recalculated after every image change.
- EndpointSlices distribute backend data across objects. Legacy Endpoints truncates over-capacity data above 1,000 backends and has been deprecated since Kubernetes 1.33.

Every lesson includes primary-source links for its concepts. Reference URLs were checked during this batch; the PDF supplies the question selection, not an unconditional guarantee that each original assertion remains correct. Manifest fragments and placeholder domains are explicitly labeled. The app never executes their commands against a cluster.

## Source mapping

| Lesson                                                         | Area                      | PDF question | PDF pages |
| -------------------------------------------------------------- | ------------------------- | ------------ | --------- |
| kubernetes-001: Why Kubernetes?                                | Fundamentals              | Q1           | 6         |
| kubernetes-002: Inside the cluster                             | Architecture              | Q2           | 6, 7      |
| kubernetes-003: Meet the Pod                                   | Pods                      | Q3           | 7         |
| kubernetes-004: Replicas and rollouts                          | Workloads                 | Q4           | 7, 8      |
| kubernetes-005: A stable way in                                | Networking                | Q5           | 8         |
| kubernetes-006: Give each team a namespace                     | Cluster basics            | Q6           | 8         |
| kubernetes-007: Configuration versus credentials               | Configuration & security  | Q7           | 9         |
| kubernetes-008: Find the right kubectl command                 | Cluster basics            | Q8           | 9         |
| kubernetes-009: Labels connect the pieces                      | Cluster basics            | Q9           | 9, 10     |
| kubernetes-010: An agent on each eligible node                 | Workloads & lifecycle     | Q10          | 10        |
| kubernetes-011: Work that finishes or repeats                  | Workloads & lifecycle     | Q11          | 10        |
| kubernetes-012: Alive, ready, or still starting?               | Workloads & lifecycle     | Q12          | 10, 11    |
| kubernetes-013: Get settings into a container                  | Configuration & security  | Q13          | 11        |
| kubernetes-014: Prepare before the app starts                  | Workloads & lifecycle     | Q14          | 11        |
| kubernetes-015: What a container needs and may use             | Scheduling & scaling      | Q15          | 11        |
| kubernetes-016: Replace a version gradually                    | Delivery & reliability    | Q16          | 12        |
| kubernetes-017: When each replica needs an identity            | Workloads & lifecycle     | Q17          | 12        |
| kubernetes-018: Find a Service by name                         | Networking & discovery    | Q18          | 12        |
| kubernetes-019: Route web traffic into the cluster             | Networking & discovery    | Q19          | 12, 13    |
| kubernetes-020: Ask for a disk that outlives a Pod             | Storage                   | Q20          | 13        |
| kubernetes-021: Understand and preview a manifest              | Cluster basics            | Q21          | 13        |
| kubernetes-022: Read a Pod’s lifecycle correctly               | Workloads & lifecycle     | Q22          | 13, 14    |
| kubernetes-023: Restart a container or replace a Pod?          | Workloads & lifecycle     | Q23          | 14        |
| kubernetes-024: Helpers that belong beside the app             | Workloads & lifecycle     | Q24          | 14        |
| kubernetes-025: Choose orchestration by the problem            | Cluster basics            | Q25          | 14, 15    |
| kubernetes-026: Attract a Pod, repel other Pods                | Scheduling & scaling      | Q26          | 16        |
| kubernetes-027: Place replicas near or apart                   | Scheduling & scaling      | Q27          | 16, 17    |
| kubernetes-028: Scale the number of replicas                   | Scheduling & scaling      | Q28          | 17        |
| kubernetes-029: More replicas, bigger requests, or more nodes? | Scheduling & scaling      | Q29          | 17, 18    |
| kubernetes-030: Allow only the traffic you intend              | Networking & discovery    | Q30          | 18        |
| kubernetes-031: Give an identity only the access it needs      | Configuration & security  | Q31          | 18, 19    |
| kubernetes-032: Package an application with Helm               | Delivery & reliability    | Q32          | 19        |
| kubernetes-033: Let a claim provision the right storage        | Storage                   | Q33          | 19, 20    |
| kubernetes-034: Budget for planned evictions                   | Delivery & reliability    | Q34          | 20        |
| kubernetes-035: Templates or plain-YAML overlays?              | Delivery & reliability    | Q35          | 20        |
| kubernetes-036: A changed setting must reach the app           | Configuration & security  | Q36          | 20, 21    |
| kubernetes-037: Reduce what a container can do                 | Configuration & security  | Q37          | 21        |
| kubernetes-038: Set a namespace’s Pod security policy          | Configuration & security  | Q38          | 21, 22    |
| kubernetes-039: Start and stop without false assumptions       | Workloads & lifecycle     | Q39          | 22        |
| kubernetes-040: What a service mesh adds                       | Networking & discovery    | Q40          | 22, 23    |
| kubernetes-041: Metrics, history, and dashboards               | Observability & debugging | Q41          | 23        |
| kubernetes-042: Keep logs after Pods disappear                 | Observability & debugging | Q42          | 23, 24    |
| kubernetes-043: Switch traffic or introduce a small sample     | Delivery & reliability    | Q43          | 24        |
| kubernetes-044: A team budget and per-container defaults       | Scheduling & scaling      | Q44          | 24        |
| kubernetes-045: How a Pod gets connected                       | Networking & discovery    | Q45          | 24, 25    |
| kubernetes-046: Discover individual backends                   | Networking & discovery    | Q46          | 25        |
| kubernetes-047: Debug a minimal container image                | Observability & debugging | Q47          | 25        |
| kubernetes-048: Keep replica counts spread across domains      | Scheduling & scaling      | Q48          | 25, 26    |
| kubernetes-049: Which workload gets a chance first?            | Scheduling & scaling      | Q49          | 26        |
| kubernetes-050: Obtain and renew TLS certificates              | Configuration & security  | Q50          | 26        |
| kubernetes-051: Reconcile deployments from versioned intent    | Delivery & reliability    | Q51          | 26, 27    |
| kubernetes-052: Bring external secrets into Kubernetes         | Configuration & security  | Q52          | 27        |
| kubernetes-053: Pull the intended image with the right access  | Delivery & reliability    | Q53          | 27        |
| kubernetes-054: Forward the right DNS zone                     | Networking & discovery    | Q54          | 27, 28    |
| kubernetes-055: Track Service backends in manageable slices    | Networking & discovery    | Q55          | 28        |

## Review scope

The library now contains 55 questions, with area and difficulty filters, a five-lesson home preview, seven nearby sidebar questions, and batches of 50 in the library. Mock sessions contain up to ten distinct questions. All 55 lessons are included in the offline production cache.

The app remains a hosted installable PWA with device-local progress. It has no cloud progress synchronization, automated written-answer grading, or app-store package. Physical-device installation and the learner's feedback on clarity remain useful complements to browser automation.
