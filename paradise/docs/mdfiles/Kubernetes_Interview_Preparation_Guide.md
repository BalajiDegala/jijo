# Kubernetes Interview Preparation Guide

> Converted from the supplied 58-page PDF using OCR. Formatting was normalized for Markdown readability.

## Question Index - All 110 Questions

### Section 1 - Junior Core Concepts

- Q1: What is Kubernetes and why does it exist?
- Q2: Kubernetes architecture - control plane and worker nodes
- Q3: What is a Pod? Why not just run containers directly?
- Q4: ReplicaSet vs Deployment - what each does
- Q5: Kubernetes Services - ClusterIP, NodePort, LoadBalancer, ExternalName
- Q6: Namespaces - isolation, resource quotas, multi-tenancy
- Q7: ConfigMaps and Secrets - storing configuration and credentials
- Q8: kubectl essentials - get, describe, logs, exec, apply, delete
- Q9: Labels, selectors, and annotations - how Kubernetes organizes everything
- Q10: DaemonSet - running one Pod per node
- Q11: Jobs and CronJobs - batch and scheduled workloads
- Q12: Liveness, readiness, and startup probes - keeping apps healthy
- Q13: Environment variables, ConfigMap volumes, and Secret volumes
- Q14: Init containers - setup tasks before the main container starts
- Q15: Resource requests and limits - CPU and memory
- Q16: Rolling updates and rollbacks in Deployments
- Q17: StatefulSet vs Deployment - when state matters
- Q18: Kubernetes DNS - how Pods and Services discover each other
- Q19: Ingress and IngressController - routing external traffic
- Q20: Persistent Volumes and Persistent Volume Claims
- Q21: kubectl explain, dry-run, and diff - safe workflow practices
- Q22: Pod lifecycle - Pending, Running, Succeeded, Failed, Unknown
- Q23: Container restart policies - Always, OnFailure, Never
- Q24: Multi-container Pods - sidecar, ambassador, adapter patterns
- Q25: Kubernetes vs Docker Swarm vs ECS - why K8s wins at scale

### Section 2 - Mid-Level Production Patterns

- Q26: Node affinity, taints, and tolerations - controlling Pod placement
- Q27: Pod affinity and anti-affinity - co-locating and spreading Pods
- Q28: Horizontal Pod Autoscaler - scaling on CPU, memory, custom metrics
- Q29: Vertical Pod Autoscaler and Cluster Autoscaler
- Q30: NetworkPolicies - controlling Pod-to-Pod traffic
- Q31: RBAC - Roles, ClusterRoles, RoleBindings, ServiceAccounts
- Q32: Helm - charts, values, releases, hooks, dependency management
- Q33: StorageClasses and dynamic provisioning
- Q34: Pod Disruption Budgets - safe maintenance and upgrades
- Q35: Kustomize vs Helm - when to use which
- Q36: ConfigMap and Secret hot-reloading - updating without restart
- Q37: Pod Security Context - runAsUser, fsGroup, capabilities, readOnlyRootFilesystem
- Q38: Pod Security Standards and Pod Security Admission
- Q39: Lifecycle hooks - postStart and preStop
- Q40: Service mesh basics - Istio and Linkerd, why and when
- Q41: Kubernetes monitoring - Prometheus, Grafana, metrics-server
- Q42: Logging in Kubernetes - EFK/ELK stack, Loki, Fluent Bit
- Q43: Blue-green and canary deployments in Kubernetes
- Q44: Resource quotas and LimitRanges - preventing noisy neighbors
- Q45: Kubernetes networking model - CNI plugins, Pod-to-Pod, Pod-to-Service
- Q46: Headless Services - when you need direct Pod addressing
- Q47: Ephemeral containers and kubectl debug
- Q48: Topology spread constraints - distributing Pods across zones
- Q49: Priority classes and preemption - critical workload scheduling
- Q50: Certificate management - cert-manager and TLS in Kubernetes
- Q51: GitOps with ArgoCD and Flux - declarative cluster management
- Q52: External Secrets Operator - syncing secrets from Vault/AWS/GCP
- Q53: Image pull policies and private registry authentication
- Q54: CoreDNS customization - stub domains, forwarding, custom zones
- Q55: EndpointSlices vs Endpoints - scalability at 1000+ Pods

### Section 3 - Senior Architecture, Internals & Advanced

- Q56: etcd deep dive - how Kubernetes stores all state
- Q57: API server internals - admission controllers, webhooks, API flow
- Q58: Custom Resource Definitions and Operators - extending Kubernetes
- Q59: Scheduler internals - filtering, scoring, custom schedulers
- Q60: Container runtime interface - containerd, CRI-O, and the CRI
- Q61: Multi-cluster strategies - federation, fleet management
- Q62: Kubernetes security hardening - CIS benchmarks, kube-bench
- Q63: Service mesh deep dive - mTLS, traffic splitting, observability
- Q64: Cluster upgrades - upgrading control plane and nodes safely
- Q65: Disaster recovery - etcd backup/restore, Velero, cluster rebuilding
- Q66: FinOps in Kubernetes - cost optimization and right-sizing
- Q67: Gateway API vs Ingress - the future of traffic management
- Q68: Kubernetes at scale - 1000+ nodes, performance tuning
- Q69: Supply chain security - Kyverno vs OPA/Gatekeeper comparison
- Q70: Karpenter vs Cluster Autoscaler - next-gen node provisioning
- Q71: EKS vs GKE vs AKS - managed Kubernetes comparison
- Q72: Kubernetes API deprecations and migration strategies
- Q73: Sidecar containers (KEP-753) - native sidecar support
- Q74: VPA, HPA, and KEDA - comprehensive autoscaling strategy
- Q75: Zero-trust networking - mTLS, NetworkPolicies, SPIFFE
- Q76: Kubernetes audit logging - who did what and when
- Q77: Secrets encryption at rest - EncryptionConfiguration for etcd
- Q78: RuntimeClass - gVisor, Kata containers for strong isolation
- Q79: Argo Rollouts and Flagger - progressive delivery at scale
- Q80: Kubernetes garbage collection and owner references

### Section 4 - Tricky Scenarios & Real-World Disasters

- Q81: Pod stuck in Pending - systematic debugging
- Q82: Pod stuck in CrashLoopBackOff - step-by-step resolution
- Q83: Pod stuck in ImagePullBackOff - all common causes
- Q84: Pod stuck in ContainerCreating - different from Pending
- Q85: Node NotReady - diagnose and recover without losing workloads
- Q86: Service not routing traffic to Pods - troubleshoot networking
- Q87: Deployment rollout stuck - maxUnavailable and maxSurge misconfigured
- Q88: PVC stuck in Pending - storage class and provisioner issues
- Q89: OOMKilled Pod but application says memory is fine
- Q90: Intermittent 503 errors during rolling update
- Q91: DNS resolution failing intermittently inside Pods
- Q92: etcd is full - cluster becoming read-only
- Q93: Secret accidentally exposed in logs - incident response
- Q94: Cluster upgrade broke CRDs and operators
- Q95: HPA flapping - scaling up and down every 30 seconds
- Q96: Pod evicted due to disk pressure - preventing data loss
- Q97: Ingress returns 502 Bad Gateway after deployment
- Q98: Cross-namespace communication blocked after NetworkPolicy
- Q99: StatefulSet Pod stuck in Terminating for 30+ minutes
- Q100: Cluster costs doubled overnight - audit and optimize
- Q101: Namespace deletion blocked by finalizers - safe cleanup
- Q102: Admission webhook blocking ALL deployments cluster-wide
- Q103: Certificate expired - kubelet can't talk to API server
- Q104: Node drain killing Pods despite PDB configured
- Q105: API server overloaded - slow kubectl, timeouts everywhere
- Q106: Pod resolves internal DNS but not external DNS
- Q107: Helm release stuck in pending-upgrade state
- Q108: PV data from staging accidentally mounted in production
- Q109: CronJob creating thousands of completed Pods filling etcd
- Q110: Container running as root despite Pod Security enforced

## Section 1 - Junior Core Concepts (Q1-Q25)

### Q1: What is Kubernetes and why does it exist?

#### The Simple Answer

Kubernetes is an open-source container orchestration platform. It automates deploying, scaling, and managing containerized applications. Docker containers solve the packaging problem - how to bundle your app consistently. Kubernetes solves what comes after - how to run, scale, heal, and update hundreds or thousands of those containers across many machines.

#### The Real-World Analogy

Think of a massive shipping port. Docker creates the containers. But who decides which ship carries which container? Which dock to use? What happens when a ship sinks - who reroutes the cargo? Kubernetes is the port authority. It schedules containers onto machines, replaces failed containers automatically, scales capacity up and down based on demand, and routes traffic to healthy instances. Without it, you are manually managing every container on every server.

#### Why It Exists

Before Kubernetes, teams ran containers with manual scripts, custom tooling, or simple orchestrators like Docker Compose. This worked for 5-10 containers. At 50-100 containers across multiple servers, manual management becomes impossible. Kubernetes was built at Google based on 15 years of running production containers at scale with their internal system called Borg.

#### What Kubernetes Actually Does

- Scheduling: Decides which machine runs which container based on resource requirements

- Self-healing: Automatically restarts crashed containers, replaces unhealthy ones, and reschedules when nodes die

- Scaling: Adds or removes container replicas based on load e Service discovery: Containers find each other by name, not IP e Rolling updates: Deploys new versions with zero downtime

- Configuration management: Separates config from code using ConfigMaps and Secrets

### Q2: Kubernetes architecture - control plane and worker nodes

#### The Simple Answer

A Kubernetes cluster has two types of machines. The control plane makes decisions about the cluster - scheduling, detecting failures, responding to events. Worker nodes run the actual application containers. The control plane is the brain. Workers are the hands.

#### Control Plane Components

**kube-apiserver** - The front door to Kubernetes. Every command, every tool, every component communicates through the API server. It validates and processes all requests. If the API server is down, the cluster is unmanageable.

**etcd** - A distributed key-value store holding all cluster state. Every Pod definition, every Service, every ConfigMap is stored in etcd. It is the single source of truth. Lose etcd without a backup and you lose your entire cluster configuration.

**kube-scheduler** - Watches for newly created Pods with no assigned node. Evaluates each node based on resource availability, affinity rules, taints, and other constraints. Assigns the Pod to the best node.

**kube-controller-manager** - Runs controller loops that watch the cluster state and make changes to move toward the desired state. The ReplicaSet controller ensures the right number of Pods exist. The Node controller monitors node health. The Job controller manages batch workloads.

#### Worker Node Components

**kubelet** - The agent on each node. Receives Pod specifications from the API server and ensures the containers described in those specs are running and healthy.

**kube-proxy** - Maintains network rules on each node. Implements the Service abstraction by routing traffic to the correct Pods. Uses iptables or IPVS under the hood.

**Container runtime** - containerd or CRI-O. Actually pulls images and runs containers. Kubernetes no longer uses Docker as a runtime directly.

**The Analogy** - A Company

The control plane is the management office. The API server is the receptionist who takes every request. etcd is the filing cabinet storing all records. The scheduler is the HR department assigning employees to projects. The controller manager is the operations team ensuring everything runs according to plan. Worker nodes are the actual employees doing the work. Kubelet is each employee's manager ensuring they complete their tasks.

### Q3: What is a Pod? Why not just run containers directly?

#### The Simple Answer

A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share the same network namespace and storage. You cannot run a bare container in Kubernetes - everything runs inside a Pod. A Pod is a thin wrapper that gives containers a shared context.

#### Why Pods Exist

Some applications consist of tightly coupled processes that must run together - a web server and a log collector, an application and a local cache proxy. Pods let these containers share localhost networking and volume mounts. They are scheduled together, scale together, and die together.

#### Single-Container Pods Are Normal

Most Pods contain exactly one container. The Pod wrapper still provides value - it gives Kubernetes a consistent unit to schedule, health-check, and manage. Multi-container Pods are the exception, not the rule.

Pods are ephemeral. They can be killed and recreated at any time. Never store important data inside a Pod. Never rely on a Pod's IP address being stable. Design your application to be stateless or use StatefulSets and PersistentVolumes for state.

### Q4: ReplicaSet vs Deployment - what each does

#### The Simple Answer

A ReplicaSet ensures a specified number of identical Pods are running at all times. If a Pod dies, the ReplicaSet creates a new one. A Deployment manages ReplicaSets and adds rolling update and rollback capabilities. You almost never create ReplicaSets directly - you create Deployments, which create and manage ReplicaSets for you.

#### How Deployments Use ReplicaSets

When you update a Deployment's Pod template (new image version, changed environment variable), the Deployment creates a new ReplicaSet with the new configuration and gradually scales it up while scaling down the old ReplicaSet. This is how rolling updates work. The old ReplicaSet is kept around with zero replicas so you can rollback instantly.

The practical rule: Always create Deployments, never bare ReplicaSets. The only time you interact with ReplicaSets directly is when debugging - checking which ReplicaSet owns which Pods during a stuck rollout.

### Q5: Kubernetes Services - ClusterIP, NodePort, LoadBalancer, ExternalName

#### The Simple Answer

A Service provides a stable network endpoint for a set of Pods. Pods come and go with new IPs each time. A Service gives them a single DNS name and IP that never changes, and load-balances traffic across all matching Pods.

#### Service Types

**ClusterIP** - Default. Exposes the Service on an internal cluster IP. Only accessible from within the cluster. Used for internal communication between services.

**NodePort** - Exposes the Service on a static port on every node. Accessible from outside the cluster via NodeIP:NodePort. Port range is 30000-32767. Used for development and simple external access.

**LoadBalancer** - Provisions a cloud load balancer (ALB, NLB, GCP LB) that routes external traffic to the Service. The standard way to expose production services to the internet on cloud providers.

**ExternalName** - Maps a Service to a DNS name. No proxying. Used to give cluster-internal services a consistent name for an external resource like an RDS database endpoint.

#### How Service Discovery Works

When you create a Service named my-api in namespace production, Kubernetes DNS creates an entry at my-api.production.svc.cluster.local. Any Pod in the cluster can reach it by that name. Pods in the same namespace can just use my-api.

### Q6: Namespaces - isolation, resource quotas, multi-tenancy

#### The Simple Answer

Namespaces are virtual clusters within a physical cluster. They provide a scope for names and a boundary for access control and resource quotas. Two teams can each have a service called api without conflict because they live in different namespaces.

#### What Namespaces Provide

- Name isolation - same resource names can exist in different namespaces

- Access control boundary - RBAC policies can restrict access per namespace

- Resource quotas - limit CPU, memory, and Pod count per namespace

- Network policy boundary - NetworkPolicies can restrict cross-namespace traffic

#### What Namespaces Do NOT Provide

Namespaces are not a security boundary. By default, Pods in different namespaces can communicate freely. They are not separate clusters - they share the same control plane, the same nodes, the same etcd. For hard multi-tenancy with untrusted workloads, you need separate clusters.

### Q7: ConfigMaps and Secrets - storing configuration and credentials

#### The Simple Answer

ConfigMaps store non-sensitive configuration data as key-value pairs. Secrets store sensitive data like passwords, tokens, and certificates. Both decouple configuration from container images, allowing the same image to run in different environments with different configuration.

#### How They Are Consumed

Both can be consumed as environment variables or as files mounted into Pods via volumes. Environment variables are simpler but cannot be updated without restarting the Pod. Volume mounts can be updated dynamically if the kubelet syncs them.

#### The Security Reality About Secrets

Kubernetes Secrets are base64-encoded, not encrypted. Anyone with RBAC access to read Secrets in a namespace can decode them trivially. For real security, enable etcd encryption at rest, restrict Secret access with RBAC, and consider external secret managers like Vault with the External Secrets Operator. See Q49 for details.

### Q8: kubectl essentials - get, describe, logs, exec, apply, delete

#### The Simple Answer

kubectl is the command-line tool for interacting with Kubernetes. Six commands handle 90% of daily operations.

**kubectl get** - Lists resources. kubectl get pods shows all Pods. Add -o wide for more detail, -o yaml for full specification.

**kubectl describe** - Shows detailed information about a resource including events. When a Pod is failing, kubectl describe pod pod-name shows the events that explain why.

**kubectl logs** - Shows container output. kubectl logs pod-name -f follows the log stream. kubectl logs pod-name - c container-name for multi-container Pods. kubectl logs pod-name --previous shows logs from the previous crashed instance.

**kubectl exec** - Runs a command inside a running container. kubectl exec -it pod-name -- /bin/sh opens a shell for debugging.

**kubectl apply** - Creates or updates resources from YAML files. Declarative - you describe the desired state and Kubernetes makes it happen.

**kubectl delete** - Removes resources. Use with caution in production.

### Q9: Labels, selectors, and annotations - how Kubernetes organizes everything

#### The Simple Answer

Labels are key-value pairs attached to objects for identification and grouping. Selectors filter objects by their labels. Annotations store non-identifying metadata. Labels are how Kubernetes connects Deployments to Pods, Services to Pods, and NetworkPolicies to Pods.

#### Why Labels Matter

A Deployment uses a label selector to know which Pods it manages. A Service uses a label selector to know which Pods to route traffic to. If the labels do not match, the connection is broken - a Service will not find its Pods, a Deployment will not know its replicas.

The most common misconfiguration in Kubernetes: A Service's selector does not match any Pod's labels. Traffic goes nowhere. kubectl describe service will show no Endpoints. Always verify labels match between Services and Deployments.

### Q10: DaemonSet - running one Pod per node

#### The Simple Answer

A DaemonSet ensures that a copy of a Pod runs on every node (or every node matching certain criteria). When a new node joins the cluster, the DaemonSet automatically schedules a Pod on it. When a node is removed, the Pod is garbage collected.

#### Common Use Cases

Log collectors (Fluent Bit on every node), monitoring agents (node-exporter on every node), network plugins (CNI Pods on every node), and storage drivers (CSI node plugins). These are infrastructure services that need presence on every machine.

### Q11: Jobs and CronJobs - batch and scheduled workloads

#### The Simple Answer

A Job creates one or more Pods and ensures they complete successfully. Once the task is done, the Job is finished. A CronJob creates Jobs on a schedule, like a cron daemon in Linux.

#### Job Completion Patterns

**Single completion** - One Pod runs to success. Good for one-time tasks like database migrations. Parallel with fixed count - Run N Pods, all must succeed. Good for batch processing with known work items.

**Work queue** - Pods consume from a queue until it is empty. Good for variable-length batch processing.

CronJob timezone gotcha: CronJobs use the kube-controller-manager's timezone by default, not UTC. Since Kubernetes 1.27, you can set the timeZone field explicitly. Always set it to avoid surprises when the cluster runs in a different timezone than expected.

### Q12: Liveness, readiness, and startup probes - keeping apps healthy

#### The Simple Answer

Probes are health checks that kubelet performs on containers. Liveness probes detect stuck containers and restart them. Readiness probes detect containers that cannot serve traffic and remove them from Service endpoints. Startup probes handle slow-starting containers.

#### The Critical Difference

**Liveness** - Is the container alive? If it fails, kubelet kills and restarts the container. Use for deadlock detection. A deadlocked application is running but not doing anything useful - restart it.

**Readiness** - Can the container serve traffic? If it fails, the Pod is removed from Service endpoints but not restarted. Use for temporary unavailability - database connection lost, loading a cache, warming up. The container stays alive but stops receiving traffic until it recovers.

**Startup** - Has the container finished starting? Disables liveness and readiness checks until the container starts. Use for applications that take a long time to initialize. Without a startup probe, a slow-starting application might be killed by the liveness probe before it finishes starting.

The most common probe mistake: Setting liveness probes too aggressively on applications that have occasional slow responses. The probe times out, kubelet restarts the container, the container takes time to start, more requests fail, more restarts happen. A restart cascade. Set initialDelaySeconds and timeoutSeconds generously.

### Q13: Environment variables, ConfigMap volumes, and Secret volumes

#### The Simple Answer

Kubernetes provides three ways to inject configuration into containers. Environment variables from ConfigMaps and Secrets are the simplest. Volume mounts expose ConfigMap and Secret data as files inside the container. Each approach has different trade-offs for update behavior and data format.

#### When to Use Each

Environment variables are best for simple key-value configuration that the application reads at startup. Volume mounts are best for configuration files (nginx.conf, application.properties) and when you want hot-reloading without restarts. Secrets as volumes are better than Secrets as environment variables because environment variables can leak into crash dumps, logs, and child processes.

### Q14: Init containers - setup tasks before the main container starts

#### The Simple Answer

Init containers run before the main application containers and must complete successfully before the app starts. They are used for setup tasks - waiting for a database to be ready, downloading configuration files, running database migrations, or populating a shared volume with data.

#### Key Properties

**Init containers run sequentially** - each must finish before the next starts. If an init container fails, Kubernetes restarts it (and the Pod stays in Init state). Init containers can use different images from the main containers and can have elevated permissions for setup tasks without those permissions persisting into the running application.

### Q15: Resource requests and limits - CPU and memory

#### The Simple Answer

Requests tell the scheduler how much CPU and memory a container needs - the scheduler uses this to find a node with enough capacity. Limits set the maximum a container can use - exceeding the memory limit triggers an OOM kill, exceeding the CPU limit causes throttling.

#### The Critical Distinction

**Requests** - Guaranteed resources. The scheduler only places the Pod on a node that has this much capacity available. Setting requests too high wastes cluster resources. Setting them too low causes overcommitment and contention.

Limits - Maximum ceiling. Memory limits are hard - exceed them and the container is killed. CPU limits are soft - the container is throttled but not killed. Setting limits too low causes OOM kills and CPU throttling. Setting them too high reduces cluster efficiency.

The golden rule: Set requests to what your application normally uses. Set memory limits to the peak usage plus a safety margin. Be cautious with CPU limits - many teams remove them entirely because CPU throttling can cause latency spikes that are harder to diagnose than high CPU usage.

### Q16: Rolling updates and rollbacks in Deployments

#### The Simple Answer

Kubernetes Deployments support rolling updates by default. When you update the Pod template, Kubernetes creates new Pods with the new configuration and gradually terminates old Pods. If something goes wrong, you can rollback to the previous version instantly.

#### How Rolling Updates Work

The Deployment creates a new ReplicaSet with the updated Pod template. It scales up the new ReplicaSet and scales down the old one, controlled by maxUnavailable (how many old Pods can be killed before new ones are ready) and maxSurge (how many extra Pods can exist during the update). The defaults ensure at least 75% of desired replicas are available throughout the update.

#### Rollback

kubectl rollout undo deployment/my-app rolls back to the previous version. Kubernetes keeps the history of ReplicaSets so you can rollback to any previous revision: kubectl rollout undo deployment/my-app --to revision=3.

### Q17: StatefulSet vs Deployment - when state matters

#### The Simple Answer

Deployments manage stateless applications where any Pod is interchangeable. StatefulSets manage stateful applications where each Pod has a unique identity, stable hostname, and persistent storage that follows it across rescheduling.

#### What StatefulSets Guarantee

- Stable network identity - Pods get predictable names: my-app-0, my-app-1, my-app-2

- Ordered deployment - Pods are created sequentially, not in parallel

- Stable storage - Each Pod gets its own PersistentVolumeClaim that persists across restarts e Ordered scaling - Scale-down removes Pods in reverse order

#### When to Use StatefulSets

Databases (PostgreSQL, MySQL, MongoDB), message queues (Kafka, RabbitMQ), distributed storage systems (Elasticsearch, Cassandra), and any application where Pods need stable identity or dedicated storage.

### Q18: Kubernetes DNS - how Pods and Services discover each other

#### The Simple Answer

Kubernetes runs a DNS server (CoreDNS) that automatically creates DNS records for Services and Pods. Any Pod can reach a Service by its DNS name without knowing IP addresses. This is the foundation of service discovery in Kubernetes.

#### DNS Naming Convention

- Service: my-service.my-namespace.svc.cluster.local e Pod (StatefulSet): pod-0.my-service.my-namespace.svc.cluster.local

- Within the same namespace, just use the service name: my-service

### Q19: Ingress and IngressController - routing external traffic

#### The Simple Answer

An Ingress defines rules for routing external HTTP/HTTPS traffic to Services inside the cluster. An IngressController is the component that actually implements those rules - it is a reverse proxy (nginx, Traefik, HAProxy, AWS ALB) running inside the cluster that reads Ingress resources and configures itself accordingly.

#### What Ingress Provides

- Host-based routing - app.example.com goes to service A, api.example.com goes to service B e Path-based routing - /api goes to the backend service, /web goes to the frontend service e TLStermination - handles HTTPS certificates

- A single load balancer for multiple services instead of one LoadBalancer per service

Common misconception: Creating an Ingress resource does nothing unless an IngressController is running in the cluster. An Ingress is just a configuration object - you need an IngressController to act on it.

### Q20: Persistent Volumes and Persistent Volume Claims

#### The Simple Answer

A PersistentVolume (PV) is a piece of storage provisioned in the cluster. A PersistentVolumeClaim (PVC) is a request for storage bya user. The separation abstracts storage provisioning from consumption - platform teams provision storage, application teams request it.

#### The Analogy

PVs are like available apartments in a building. PVCs are like apartment applications. When you submit an application (PVC) specifying how much space you need and what type, the building management (Kubernetes) matches you with an available apartment (PV) that meets your requirements. Dynamic provisioning is like building a new apartment to spec whenever someone submits an application.

### Q21: kubectl explain, dry-run, and diff - safe workflow practices

#### The Simple Answer

kubectl explain shows the documentation for any resource field directly in your terminal. kubectl explain pod.spec.containers.resources shows what the resources field accepts. Essential for writing YAML without constantly checking online docs.

kubectl apply --dry-run=client validates your YAML locally without sending anything to the cluster. --dry-run=server sends it to the API server for full validation including admission webhooks but does not persist changes.

kubectl diff shows what would change if you applied a manifest - like terraform plan for Kubernetes. Always run diff before apply in production.

### Q22: Pod lifecycle - Pending, Running, Succeeded, Failed, Unknown

#### The Simple Answer

**Pending** - The Pod is accepted but not yet scheduled or images are being pulled. If it stays Pending, check scheduler issues, node resources, or image availability.

**Running** - At least one container is running. Does not mean the application is healthy - only that the process started.

**Succeeded** - All containers terminated with exit code 0. Normal for Jobs. Failed - All containers terminated and at least one exited with a non-zero code.

**Unknown** - The node running the Pod is not responding. Usually a node failure.

### Q23: Container restart policies - Always, OnFailure, Never

#### The Simple Answer

**Always** - Default for Deployments. Restart the container regardless of exit code. Used for long-running services that should always be up.

**OnFailure** - Restart only on non-zero exit codes. Used for Jobs where successful completion should stop the container.

**Never** - Never restart. Used for debugging or one-shot tasks where you want to inspect the failed container.

### Q24: Multi-container Pods - sidecar, ambassador, adapter patterns

#### The Simple Answer

Multi-container Pods run multiple containers that share the same network namespace and storage. The patterns are: sidecar (enhances the main container - log shipper, metrics exporter), ambassador (proxies outbound traffic - database proxy, service mesh proxy), and adapter (transforms output - metrics format converter, log format standardizer).

With Kubernetes 1.28+, native sidecar containers were introduced. These are defined as init containers with restartPolicy: Always. They start before the main container, run alongside it, and are terminated after it. This solves the long-standing problem of sidecar containers (like Istio proxy) preventing Job completion. See Q68 for details.

### Q25: Kubernetes vs Docker Swarm vs ECS - why K8s wins at scale

#### The Simple Answer

Docker Swarm is simpler to set up but lacks advanced features like auto-scaling, custom resources, and a rich ecosystem. ECS is AWS-native and well-integrated but vendor-locked. Kubernetes is the industry standard with the largest ecosystem, multi-cloud portability, and the most active community.

| Feature | Kubernetes | Docker Swarm | ECS |
| --- | --- | --- | --- |
| Learning curve | Steep | Low | Medium |
| Ecosystem | Massive (Helm, operators, service mesh) | Small | AWS-only tools |
| Multi-cloud | Yes | Limited | No (AWS-only) |
| Auto-scaling | HPA, VPA, KEDA, Cluster Autoscaler | Basic | Target tracking |
| Community | Largest | Declining | AWS-backed |

## Section 2 - Mid-Level Production Patterns (Q26-Q55)

### Q26: Node affinity, taints, and tolerations - controlling Pod placement

#### The Simple Answer

Node affinity attracts Pods to specific nodes using label matching. Taints repel Pods from nodes. Tolerations allow specific Pods to override taints. Together they give fine-grained control over where Pods land.

#### The Analogy - Hotel Rooms

A hotel has rooms tagged by floor and type - ocean-view, pet-friendly, executive. Node affinity is a guest saying 'I want an ocean-view room.' Taints are signs saying 'no pets allowed on this floor.' Tolerations are a guest showing their service-animal certificate, overriding the no-pets sign. The front desk (scheduler) matches guests to rooms based on all these rules.

#### How Taints and Tolerations Work Together

Taints have three effects: NoSchedule (hard block - new Pods without tolerations cannot schedule), PreferNoSchedule (soft - scheduler tries to avoid but may still place), and NoExecute (evicts existing Pods that do not tolerate the taint). Common use cases: taint GPU nodes so only ML workloads schedule there, taint Windows nodes for Windows-only containers, taint spot/preemptible nodes so only fault-tolerant workloads run there.

#### Node Affinity Types

**requiredDuringSchedulingIgnoredDuringExecution** - Hard constraint. The Pod will NOT schedule if no node matches. Use for strict requirements like 'must run on nodes in us-east-1a.'

**preferredDuringSchedulingIgnoredDuringExecution** - Soft preference. The scheduler tries to match but will place elsewhere if needed. Use for optimization like 'prefer nodes with SSD storage. '

Common mistake: Using required affinity with a label that no node has. The Pod stays Pending forever. Always verify node labels exist before applying affinity rules: kubectl get nodes --show-labels.

### Q27: Pod affinity and anti-affinity - co-locating and spreading Pods

#### The Simple Answer

Pod affinity attracts Pods toward other Pods. Pod anti-affinity repels Pods away from other Pods. While node affinity controls 'which node,' Pod affinity/anti-affinity controls 'near which other Pods. '

#### Real-World Use Cases

**Pod affinity** - Place the cache Pod on the same node as the application Pod to minimize latency. Place frontend Pods on the same zone as backend Pods to reduce cross-zone traffic costs.

**Pod anti-affinity** - Spread replicas of the same Deployment across different nodes so a single node failure does not take down all replicas. This is the most common use case and should be default for any production Deployment.

#### The topologyKey Field

The topologyKey defines what 'same' means. topologyKey: kubernetes.io/hostname means same node. topologyKey: topology.kubernetes.io/zone means same availability zone. topologyKey: topology.kubernetes.io/region means same region. This determines the blast radius of co-location or spreading.

Production best practice: Every production Deployment should have pod anti-affinity with topologyKey: kubernetes.io/hostname as preferred (not required, to avoid scheduling deadlocks). This ensures replicas spread across nodes without blocking scheduling when nodes are limited.

### Q28: Horizontal Pod Autoscaler - scaling on CPU, memory, custom metrics

#### The Simple Answer

HPA automatically adjusts Pod replica count based on observed metrics. When CPU crosses 70%, HPA adds Pods. When it drops, HPA removes Pods. It requires metrics-server for CPU/memory and a custom metrics adapter (like Prometheus Adapter) for application-specific metrics.

#### The Scaling Formula

HPA calculates: desiredReplicas = ceil{currentReplicas x (currentMetric / targetMetric)). If target CPU is 50% and current is 80% with 3 replicas: ceil(3 x 80/50) = ceil(4.8) = 5 replicas.

#### Why HPA Sometimes Doesn't Work

The number one reason HPA appears broken: resource requests are not set. CPU utilization percentage is calculated as (actual usage / requested CPU). Without requests, the denominator is undefined and HPA cannot calculate utilization. Always set CPU requests on every container that HPA monitors.

#### Scaling Behavior Configuration

HPA v2 has behavior.scaleUp and behavior.scaleDown with stabilizationWindowSeconds and policies. Scale -up should be fast (react to load spikes quickly). Scale-down should be slow (wait 5+ minutes to avoid flapping). Set scaleDown.stabilizationWindowSeconds: 300 as a starting point.

#### Custom Metrics Scaling

Beyond CPU and memory, HPA can scale on any Prometheus metricexposed through a custom metrics adapter: request queue depth, active WebSocket connections, messages in a Kafka topic. This is far more accurate than CPU for most applications because CPU utilization is a lagging indicator - the queue fills up before CPU spikes.

### Q29: Vertical Pod Autoscaler and Cluster Autoscaler

#### Vertical Pod Autoscaler (VPA)

VPA watches container resource usage over time and recommends (or automatically sets) appropriate requests and limits. Running in recommendation mode is safe - it only suggests. Running in auto mode restarts Pods to apply new resource values, which causes brief disruptions.

#### Cluster Autoscaler

Cluster Autoscaler watches for Pods that cannot schedule due to insufficient resources. When it sees Pending Pods, it provisions new nodes. When nodes are underutilized for an extended period, it drains and removes them. It interacts with cloud provider APIs (ASGs on AWS, MIGs on GCP, VMSS on Azure) to add or remove nodes.

#### How All Three Autoscalers Work Together

HPA adds Pods when load increases. If those Pods cannot schedule because the cluster is full, Cluster Autoscaler adds nodes. VPA right-sizes resource requests over time so you are not wasting money on over-provisioned Pods. The combination gives you responsive horizontal scaling, efficient resource allocation, and elastic infrastructure.

Critical rule: Do not run VPA in auto mode and HPA on the same Deployment for the same metric (CPU). VPA increases CPU requests, which changes the utilization percentage HPA sees, causing unpredictable behavior. Use VPA in recommendation mode alongside HPA.

### Q30: NetworkPolicies - controlling Pod-to-Pod traffic

#### The Simple Answer

By default, every Pod can talk to every other Pod. NetworkPolicies add firewall rules. Once any NetworkPolicy selects a Pod, that Pod becomes isolated - all traffic not explicitly allowed is denied.

#### The Analogy - Office Building Access

By default, the office building has no locked doors - anyone can walk anywhere. A NetworkPolicy is like adding key-card access. Once you put a card reader on the server room door, only people with the right badge get in. Everyone else is blocked. And critically, adding a card reader on one door does not lock any other doors - each door (Pod) needs its own rules.

#### The Default-Deny Pattern

Start with a default-deny policy that selects all Pods and allows nothing. Then add specific allow policies for each communication path. This is the zero-trust approach - deny everything, then allow only what is documented and needed.

#### Cross-Namespace Traffic

By default, NetworkPolicies only match Pods in the same namespace. To allow traffic from another namespace, you needa namespaceSelector in the ingress rule AND the source namespace must have a label that the selector matches. Label the namespace first, then reference it.

The trap that catches everyone: You deploy Prometheus in the monitoring namespace. It scrapes metrics from Pods in production. You apply a default-deny NetworkPolicy in production. Prometheus stops scraping because the policy blocks it. Always map out all traffic flows - including monitoring, ingress controllers, and service mesh proxies - before applying NetworkPolicies.

### Q31: RBAC - Roles, ClusterRoles, RoleBindings, ServiceAccounts

#### The Simple Answer

RBAC is Kubernetes' authorization system. It answers: 'Can user X perform action Y on resource Z?'' Roles define what actions are allowed. Bindings assign Roles to users or ServiceAccounts.

#### The Four RBAC Objects

**Role** - Defines permissions within a single namespace. Example: 'can get, list, and watch Pods in the production namespace. '

**ClusterRole** - Defines permissions cluster-wide or for non-namespaced resources (nodes, PVs). Example: 'can list all nodes in the cluster.'

**RoleBinding** - Assigns a Role (or ClusterRole) to a user/group/ServiceAccount within a specific namespace. ClusterRoleBinding - Assigns a ClusterRole to a user/group/ServiceAccount across the entire cluster.

#### ServiceAccounts for Pods

Every Pod runs with a ServiceAccount that determines its API server permissions. The default ServiceAccount in each namespace has minimal permissions but in older clusters may have more than expected. Always create dedicated ServiceAccounts for applications that need API access and grant only the specific permissions they need.

The security rule: Never grant cluster-admin to automation. Never use the default ServiceAccount for applications that need API access. Audit RBAC permissions regularly with kubectl auth can -i --list --as=system:serviceaccount:namespace:sa-name.

### Q32: Helm - charts, values, releases, hooks, dependency management

#### The Simple Answer

Helm is the package manager for Kubernetes. A chart packages all the YAML manifests an application needs. Values customize the chart per environment. A release is a deployed instance of a chart. Hooks run actions at specific points in the release lifecycle.

#### Why Helm Matters in Production

Without Helm, deploying a complex application means managing 20-50 YAML files with environment-specific values managed through error-prone string substitution. Helm provides: templating with Go templates, version management for upgrades and rollbacks, dependency management for charts that need other charts, and a release lifecycle (install, upgrade, rollback, uninstall, test).

#### Helm Hooks

Hooks let you run Jobs at specific lifecycle points. pre-install runs before any chart resources are created - perfect for database migrations. post-install runs after all resources are ready. pre-upgrade and post-upgrade handle upgrade-specific tasks. pre-delete cleans up external resources before uninstall.

#### Common Mistakes

- Using helm install in CI/CD instead of helm upgrade --install (which handles both cases) e Not pinning chart versions, leading to unexpected changes e Storing Helm values with secrets in Git without encryption

- Not testing charts with helm template (renders YAML locally without deploying)

### Q33: StorageClasses and dynamic provisioning

#### The Simple Answer

**StorageClasses define types of storage** - fast SSD, standard HDD, replicated, encrypted. Whena PVCreferences a StorageClass, Kubernetes automatically provisions a matching PV. No manual volume creation needed.

#### Key Parameters That Matter in Production

**reclaimPolicy** - Delete (destroy the volume when PVC is deleted - dangerous for databases) or Retain (keep the data for manual recovery). Default is Delete. Always set Retain for production databases.

**volumeBindingMode** - Immediate (create volume now) or WaitForFirstConsumer (wait until a Pod needs it). WaitForFirstConsumeris critical in multi-zone clusters - it ensures the volume is created in the same zone as the Pod. Without it, the volume might be in zone A while the Pod gets scheduled to zone B, causing mount failures.

**allowVolumeExpansion** - Whether PVCs can be resized after creation. Set to true for any StorageClass used by databases. Expanding is usually supported; shrinking is never supported.

Production setup: Create at least two StorageClasses - a fast SSD class with Retain for databases, and a standard class with Delete for temporary storage. Set the SSD class as default only if you accept the cost.

### Q34: Pod Disruption Budgets - safe maintenance and upgrades

#### The Simple Answer

PDBs prevent cluster maintenance from accidentally taking down your application. They define the minimum number of Pods that must remain available during voluntary disruptions like node drains, cluster upgrades, and Pod evictions.

#### How PDBs Work

You set either minAvailable (minimum Pods that must stay running) or maxUnavailable (maximum Pods that can be down simultaneously). During a node drain, kubectl drain respects PDBs - it will not evict a Pod if doing so would violate the budget. It waits until another replica is healthy before evicting the next one.

#### The Critical Detail

PDBs only protect against voluntary disruptions (drain, eviction, scaling down). They do NOT protect against involuntary disruptions (node crash, OOM kill, hardware failure). For involuntary disruptions, you need sufficient replicas spread across nodes and zones.

Without PDBs, a node drain evicts all Pods on that node simultaneously. If all 3 replicas of your payment service happen to be on that node, your payment service goes down completely during a routine node upgrade. This is a real production incident that PDBs prevent.

### Q35: Kustomize vs Helm - when to use which

#### The Simple Answer

**Helm uses templating** - Go templates generate YAMLfrom parameterized values. Kustomize uses overlays - you maintain plain YAML as a base and patch it for each environment. Helm is better for packaging and distributing applications. Kustomize is better for managing environment-specific variations of your own applications.

#### When to Use Helm

Third-party applications (nginx-ingress, Prometheus, cert-manager) - use the community Helm chart. Complex applications with many configuration knobs that change across environments. When you need release lifecycle management (versioned upgrades, rollbacks, test hooks).

#### When to Use Kustomize

In-house applications where you want to keep YAMLreadable and un-templated. Simple environment variations (dev uses 1 replica and no TLS, prod uses 5 replicas with TLS). Kustomize is built into kubectl (kubectl apply -k) - no additional tooling needed.

#### They Are Not Mutually Exclusive

Many teams use Helm for third-party charts and Kustomize for their own applications. You can even use Kustomize to customize a Helm-rendered output with post-rendering.

### Q36: ConfigMap and Secret hot-reloading - updating without restart

#### The Simple Answer

When ConfigMaps or Secrets are mounted as volumes, kubelet syncs changes periodically (default every 60 seconds + cache TTL). The files update inside the running container. But most applications read config at startup and never re-read files - they need either a reload signal or a restart.

#### Three Approaches

**Application-level file watching** - The application watches the config file for changes and reloads when it detects a modification. Best approach but requires application code changes.

**Sidecar reload trigger** - A sidecar container watches the volume and sends a signal (SIGHUP) or HTTP request to the main container when files change.

**Reloader controller** - Open-source tool (stakater/Reloader) watches ConfigMaps and Secrets. When they change, it triggers a rolling restart of the Deployment by updating an annotation. The simplest approach and widely used.

Note: Subpath volume mounts do NOT receive updates. If you mount a single key from a ConfigMap using subPath, the file is never updated by kubelet. This catches many teams by surprise. Use directory mounts instead of subPath if you need hot-reloading.

### Q37: Pod Security Context - runAsUser, fsGroup, capabilities, readOnlyRootFilesystem

#### The Simple Answer

Security context defines privilege and access control settings for a Pod or container. It is the per-Pod level security configuration that complements cluster-wide Pod Security Stand ards.

#### Key Fields

**runAsUser / runAsGroup** - Specify the UID/GID the container process runs as. Prevents running as root even if the container image defaults to root.

runAsNonRoot: true - Kubernetes rejects the Pod if the container image would run as root (UID 0). A safety net that catches misconfigured images.

**fsGroup** - Sets the group ownership of all volumes mounted into the Pod. Solves the permission denied problem when anon-root user needs to write to a volume - the volume is chown''d to the fsGroup.

readOnlyRootFilesystem: true - Makes the container's root filesystem read-only. The application can only write to explicitly mounted volumes (emptyDir, PVC). Prevents attackers from modifying binaries or writing malicious files to the container.

**capabilities** - Linux capabilities can be dropped or added. Best practice: drop ALL capabilities and add back only what the application needs. Most web applications need zero capabilities.

The production-hardened security context: runAsNonRoot: true, readOnlyRootFilesystem: true, allowPrivilegeEscalation: false, capabilities: drop: ["ALL"]. This is the baseline every production container should have.

### Q38: Pod Security Standards and Pod Security Admission

#### The Simple Answer

Pod Security Stand ards define three hardening profiles: Privileged (unrestricted), Baseline (prevents known privilege escalations - no hostNetwork, no hostPID, no privileged containers), and Restricted (heavily hardened - must run as non-root, must drop all capabilities, read-only root filesystem). Pod Security Admission (PSA) enforces these at the namespace level through labels.

#### Enforcement Modes

**enforce** - Reject Pods that violate the standard. Blocks creation entirely.

**audit** - Allow the Pod but record a violation in the audit log. Good for rollout - see what would break without blocking anything.

**warn** - Allow the Pod but show a warning to the user. Visible feedback without enforcement.

#### Migration Strategy

Start with audit mode on the Baseline standard across all namespaces. Review violations for a month. Fix the easy ones. Then enable warn mode. After another month with no surprises, enable enforce mode. This gradual rollout prevents breaking production workloads.

### Q39: Lifecycle hooks - postStart and preStop

#### The Simple Answer

Lifecycle hooks execute actions at specific points in a container's lifecycle. postStart runs immediately after the container starts (but not guaranteed to complete before the ENTRYPOINT). preStop runs immediately before a container is terminated.

#### preStop - The Most Important Hook in Production

When Kubernetes decides to terminate a Pod (during scaling down, rolling update, node drain), it first calls the preStop hook, then sends SIGTERM, then waits for terminationGracePeriodSeconds, then sends SIGKILL. The preStop hook is your chance to prepare for shutdown - drain connections, deregister from service discovery, finish in-flight work.

The most common preStop pattern: sleep 10. This delay gives kube-proxy and Ingress controllers time to remove the Pod's IP from their routing tables before the Pod starts shutting down. Without it, traffic arrives at a Pod that is already shutting down, causing 503 errors.

#### postStart Caveats

postStart runs in parallel with the container's ENTRYPOINT - it is NOT guaranteed to run before the main process starts. If postStart takes a long time or fails, the container is killed. Do not use it for initialization that must complete before the application starts - use init containers instead.

### Q40: Service mesh basics - Istio and Linkerd, why and when

#### The Simple Answer

A service mesh adds a sidecar proxy to every Pod that intercepts all network traffic. This proxy handles mTLS encryption, traffic management, retries, circuit breaking, and observability - all without application code changes.

#### Istio vs Linkerd

**Istio** - Feature-rich: advanced traffic management (fault injection, traffic mirroring, percentage-based routing), extensive policy engine, multi-cluster support. Drawback: complex to operate, significant resource overhead (each sidecar uses 50-100 MB RAM and CPU), steep learning curve.

**Linkerd** - Lightweight: focused on simplicity and operational ease. Lower resource overhead (10-20 MB per sidecar). Easier to install and manage. Fewer features than Istio but covers 80% of use cases. Written in Rust (data plane) for performance.

#### When You Need a Service Mesh

When you have 20+ services and need: consistent mTLS between all services without application changes, detailed request-level observability (latency percentiles, success rates per route), advanced traffic management (canary with automatic rollback based on error rate), or retry and timeout policies applied uniformly.

#### When You Do NOT Need a Service Mesh

Fewer than 10services. Applications already handle TLS. Simple deployments without canary or traffic splitting requirements. The overhead and complexity of a service mesh is not justified for simple architectures.

### Q41: Kubernetes monitoring - Prometheus, Grafana, metrics-server

#### The Simple Answer

**metrics-server** - Lightweight, in-memory metrics for CPU and memory. Required for HPA and kubectl top. Not for long-term storage or alerting - it retains data for only a few minutes.

**Prometheus** - Time-series database that scrapes metrics endpoints. The industry standard for Kubernetes monitoring. Pull-based model - Prometheus reaches out to targets rather than targets pushing metrics. Uses PromQL for queries. Supports recording rules (pre-computed expensive queries) and alerting rules (trigger alerts when conditions are met).

**Grafana** - Visualization and dashboarding. Connects to Prometheus as a data source. Community dashboards exist for every common Kubernetes component. Provides alerting integration with Slack, PagerDuty, email.

#### What to Monitor

Cluster level: Node CPU/memory/disk utilization, API server latency, etcd health, scheduler queue depth, kubelet health.

Application level: Pod CPU/memory usage vs requests/limits, restart count, error rates, request latency, queue depths.

Business level: Requests per second, error rates, latency percentiles (p50, p95, p99), active users.

The monitoring stack that most production teams run: Prometheus (with Thanos or Cortex for long-term storage) + Grafana (dashboards and alerting) + Alertmanager (alert routing and deduplication) + Node Exporter (hardware metrics) + kube-state-metrics (Kubernetes object metrics).

### Q42: Logging in Kubernetes - EFK/ELK stack, Loki, Fluent Bit

#### The Simple Answer

Container logs go to stdout/stderr and are stored temporarily on the node. When a Pod is evicted or a node dies, logs are lost. Centralized logging ships logs to a persistent store for search, correlation, and retention.

#### The Two Major Stacks

**EFK (Elasticsearch + Fluent Bit + Kibana)** - Powerful full-text search and analytics. Kibana provides rich visualization. Downside: Elasticsearch is resource-heavy (each node needs significant RAM) and complex to operate at scale.

**Loki + Grafana** - Lightweight log aggregation. Loki indexes only metadata labels (like Pod name and namespace), not the full log text. Much cheaper to operate. Searches are slower than Elasticsearch for free-text queries but fast for label-based filtering. Integrates seamlessly with existing Grafana dashboards.

#### Log Collection Pattern

Run Fluent Bit as a DaemonSet on every node. It reads container log files from /var/log/containers/, parses and enriches them with Kubernetes metadata (Pod name, namespace, labels), and ships them to the log store. Fluent Bit is the lightweight forwarder - use it over Fluentd for most deployments.

### Q43: Blue-green and canary deployments in Kubernetes

#### The Simple Answer

**Blue-green** - Runtwo full copies of the application. Switch traffic from blue (current) to green (new) instantly. If green fails, switch back instantly. Simple but doubles infrastructure cost during deployment.

**Canary** - Route a small percentage (5-10%) of traffic to the new version. Monitor error rates and latency. If healthy, gradually increase to 100%. If not, rollback the small percentage. More cost-efficient and safer than blue-green.

#### Implementation Methods

Native Kubernetes (basic canary): Create two Deployments (v1 and v2) with the same labels. A shared Service load-balances across both. Control the traffic split by adjusting replica counts. Limitation: you cannot do precise percentage routing - a 3:1 replica ratio gives 75/25, not exact percentages.

Istio/Linkerd (precise canary): VirtualService or TrafficSplit resources route exactly 5% of requests to v2 regardless of replica count. Combined with metrics, you can automate promotion or rollback based on error rates.

Argo Rollouts / Flagger (automated progressive delivery): Define a Rollout resource with promotion criteria (error rate < 1%, p99 latency < 500ms). The controller automatically advances canary steps or rolls back if metrics degrade. See Q79 for deep coverage.

### Q44: Resource quotas and LimitRanges - preventing noisy neighbors

#### The Simple Answer

**ResourceQuota** - Limits the total resources a namespace can consume. Maximum total CPU, memory, Pod count, PVC count, Service count. Prevents one team from consuming the entire cluster.

**LimitRange** - Sets per-container or per-Pod defaults and maximums within a namespace. If a developer creates a Pod without resource requests, LimitRange applies defaults. If they request too much, LimitRange blocks it.

#### Why Both Are Needed

ResourceQuota without LimitRange: a developer could create one Pod requesting all the namespace's quota, blocking everyone else. LimitRange without Resource Quota: individual Pods are reasonable but the team could create hundreds of them, consuming unlimited total resources. Together they provide both per-Pod and total namespace guardrails.

### Q45: Kubernetes networking model - CNI plugins, Pod-to-Pod, Pod-to-Service

#### The Simple Answer

Kubernetes networking has three fundamental rules: every Pod gets its own IP, Pods can communicate with all other Pods without NAT, and agents on a node can communicate with all Pods on that node. CNI (Container Network Interface) plugins implement these rules.

#### Major CNI Plugins

**Calico** - Most widely deployed. Supports NetworkPolicies. Uses BGP for routing in on-premises environments and IP-in-IP or VXLAN for overlay. Mature and well-documented.

**Cilium** - eBPF-based. High performance, advanced NetworkPolicies (L7 filtering - you can allow HTTP GET but block HTTP POST), and built-in observability with Hubble. Replacing kube-proxy with eBPF for Service routing. Growing rapidly and becoming the default in many managed Kubernetes offerings.

**AWS VPC CNI** - Each Pod gets a real VPC IP address. Pods are directly routable from the VPC without overlay networks. Integrated with security groups. Limitation: IP address exhaustion in large clusters (each node can only support a limited number of IPs based on instance type).

**Flannel** - Simple overlay network. No NetworkPolicy support. Good for learning and simple clusters. Not recommended for production.

### Q46: Headless Services - when you need direct Pod addressing

#### The Simple Answer

A headless Service (clusterIP: None) does not get a virtual cluster IP. DNS queries return the individual IPs of all backing Pods instead of a single VIP. This enables direct Pod-to-Pod communication without load balancing.

#### When You Need Headless Services

**StatefulSets** - Each Pod (postgres-0, postgres-1) needs to be individually addressable. The headless Service creates DNS records like postgres-0.postgres-svc.namespace.svc.cluster.local for each Pod.

**Client-side load balancing** - Applications like gRPC that implement their own connection pooling and load balancing need all endpoint IPs to distribute connections themselves.

**Service discovery without proxy** - When the application needs to know all peer IPs (like a Cassandra or Elasticsearch cluster forming a ring or consensus group).

### Q47: Ephemeral containers and kubectl debug

#### The Simple Answer

Ephemeral containers are temporary containers injected into a running Pod for debugging. kubectl debug creates an ephemeral container with debugging tools (curl, strace, netcat, tcpdump) inside a Pod that might be running a distroless or minimal image with no shell.

#### How It Works

kubectl debug -it my-pod --image=busybox --target=my-container attaches a new container to the Pod that shares the target container's process namespace. You can now inspect processes, network connections, and the filesystem of the target container from within the debug container.

#### When to Use It

When a production Pod is misbehaving but the container image has no debugging tools (which is a good security practice). Instead of rebuilding the image with tools, inject an ephemeral container, debug the issue, and the ephemeral container disappears when you are done.

### Q48: Topology spread constraints - distributing Pods across zones

#### The Simple Answer

Topology spread constraints control how Pods are distributed across failure domains - availability zones, nodes, regions. You define the maximum imbalance (maxSkew) and the topology key. Kubernetes ensures Pods are spread as evenly as possible.

#### Real-World Example

You have 6 replicas across 3 availability zones. With maxSkew: 1 and topologyKey: topology.kubernetes.io/zone, Kubernetes distributes 2 Pods perzone. If zone A has 3 and zone B has 1, the next Pod must go to zone B or C to maintain the skew limit.

#### The Relationship with Pod Anti-Affinity

Pod anti-affinity says 'do not put me on the same node as my siblings.' Topology spread constraints say 'distribute me evenly across zones.' They are complementary - use anti-affinity for node-level spreading and topology spread for zone-level spreading.

### Q49: Priority classes and preemption - critical workload scheduling

#### The Simple Answer

PriorityClasses assign importance levels to Pods. When the cluster is full, a high-priority Pod can preempt (evict) lower-priority Pods to make room. System-critical workloads should have high priority. Batch jobs should have low priority.

#### Built-in Priority Classes

Kubernetes has two built-in: system-cluster-critical and system-node-critical. These are reserved for system components (CoreDNS, kube-proxy). Never assign these to application workloads.

#### Custom Priority Classes

Create a PriorityClass with a numeric value (higher = more important). Assign it to Pods via priorityClassName. When resources are scarce, the scheduler evicts lower-priority Pods to make room for higher-priority ones. Set preemptionPolicy: Never if you want priority for scheduling order but do not want to evict existing Pods.

### Q50: Certificate management - cert-manager and TLS in Kubernetes

#### The Simple Answer

cert-manager automates TLS certificate provisioning and renewal. You create an Issuer (or ClusterIssuer) that defines the certificate authority, and a Certificate resource that defines what certificate you need. cert-manager handles obtaining, storing, and renewing the certificate automatically.

#### Integration with Ingress

cert-manager can automatically provision certificates for Ingress resources using annotations. When you create an Ingress with the cert-manager annotation and a TLS section, cert-manager creates a Certificate resource, obtains the certificate from Let's Encrypt (or another CA), stores it as a Kubernetes Secret, and renews it before expiry.

### Q51: GitOps with ArgoCD and Flux - declarative cluster management

#### The Simple Answer

GitOps means Git is the single source of truth for your cluster's desired state. A GitOps controller continuously reconciles the cluster to match what is in Git. Every change is a git commit - auditable, reviewable, and reversible.

#### ArgoCD

ArgoCD provides a rich web UI showing application health, sync status, and resource tree. It uses an Application CRD to define what to deploy and where. Supports multi-cluster, SSO, RBAC, and webhook-triggered sync. Best for teams that value visibility and want a self-service deployment platform.

#### Flux

**Flux is more composable** - it consists of separate controllers for source tracking (GitRepository), Kustomize rendering (Kustomization), and Helm releases (HelmRelease). No web UI by default (Weave GitOps provides one). Better suited for teams that prefer CLI-driven workflows and want fine-grained control over the reconciliation process.

#### The Key Principle

No more kubectl apply from laptops. No more CI/CD pipelines with cluster credentials. The GitOps controller has cluster credentials. Developers push to Git. The controller applies changes. The audit trail is the Git history.

### Q52: External Secrets Operator - syncing secrets from Vault/AWS/GCP

#### The Simple Answer

ESO synchronizes secrets from external secret managers into Kubernetes Secrets. You define an ExternalSecret resource pointing to a secret in Vault, AWS Secrets Manager, or GCP Secret Manager. ESO fetches the value and creates a Kubernetes Secret. It periodically refreshes to keep the Secret in sync.

Why Not Just Use Vault Directly?

Applications running in Kubernetes expect configuration in Kubernetes Secrets (mounted as volumes or environment variables). Vault requires a Vault SDK or sidecar agent. ESO bridges the gap - the external store is the source of truth, but applications consume standard Kubernetes Secrets.

### Q53: Image pull policies and private registry authentication

#### The Simple Answer

**Always** - Pull every time a Pod starts. Use for mutable tags (latest). Adds latency and registry dependency on every startup.

**IfNotPresent** - Pull only if not cached on the node. Default for tagged images. Faster but risks stale images if tags are overwritten.

**Never** - Image must already exist on the node. Used for pre-loaded or locally built images.

#### Private Registry Authentication

Create a docker-registry Secret: kubectl create secret docker-registry my-reg --docker-server=ECR_URL --docker-username=AWS --docker-password=TOKEN. Reference it in Pod spec under imagePullSecrets. For cluster-wide access, patch the default ServiceAccount in each namespace to include the Secret.

ECR token rotation: ECR tokens expire every 12 hours. Use a CronJob or the ecr-credential-provider kubelet plugin to automatically refresh tokens. Without this, Pods fail to pull images after 12 hours.

### Q54: CoreDNS customization - stub domains, forwarding, custom zones

#### The Simple Answer

CoreDNS is configured through a ConfigMap (coredns in the kube-system namespace). You can customize it to forward specific domains to custom DNS servers, add stub domains for on-premises services, and configure caching and logging.

#### Common Customizations

Forward corporate domains to internal DNS: If your company has internal services at *.corp.example.com resolved by a corporate DNS server, add a forward block in the Corefile so Pods can resolve internal services without VPN-level DNS configuration.

Custom hosts entries: Use the hosts plugin to add static DNS entries - useful for services not yet in DNS or for local development overrides.

Logging and debugging: Enable the log plugin temporarily to trace DNS queries when debugging resolution issues.

### Q55: EndpointSlices vs Endpoints - scalability at 1000+ Pods

#### The Simple Answer

The original Endpoints API stores all Pod IPs for a Service in a single object. For a Service with 5000 Pods, this one object is enormous and must be transferred to every node's kube-proxy on every change. EndpointSlices break this into smaller chunks (default 100 endpoints per slice), reducing the data transferred when a single Pod changes.

#### Why This Matters at Scale

With Endpoints, adding or removing one Pod requires transferring the entire 5000-endpoint object to every node. With EndpointSlices, only the affected slice (100 endpoints) is updated. This dramatically reduces API server load and kube-proxy processing time in large clusters.

EndpointSlices are the default since Kubernetes 1.21. You do not need to enable anything. But if you are writing custom controllers that watch Endpoints, migrate them to watch EndpointSlices instead for better performance.

## Section 3 - Senior Architecture, Internals & Advanced (Q56-Q80)

### Q56: etcd deep dive - how Kubernetes stores all state

#### The Simple Answer

etcd is a distributed key-value store that holds the entire state of the Kubernetes cluster. Every Pod, Service, ConfigMap, Secret, and Custom Resource is a key-value entry. It uses the Raft consensus algorithm to maintain consistency across replicas. If etcd is lost without a backup, your entire cluster configuration is gone.

#### How Kubernetes Uses etcd

The API server is the only component that talks to etcd directly. All reads and writes go through the API server. Keys are organized hierarchically: /registry/pods/namespace/podname, /registry/services/namespace/servicename. When you run kubectl get pods, the API server reads from etcd and returns the results.

#### Performance Matters

etcd latency directly affects cluster responsiveness. The recommendation is: SSD-backed storage (not network-attached HDD), dedicated nodes for etcd (not shared with worker workloads), 3or 5 members for HA (never 2 or 4 - Raft consensus needs an odd number), and a dedicated network for etcd peer traffic in large clusters.

#### The Database Size Limit

etcd has a default 2 GB storage limit (configurable up to 8 GB). Reaching this limit makes the cluster read-only - no new Pods, no updates, no scaling. Regular compaction and defragmentation prevent this. Monitor the db_size metric and alert at 75%.

etcd is the most critical component in the cluster. API server, scheduler, and controllers can be restarted. etcd data is irreplaceable. Back up etcd every hour and test restoration quarterly.

### Q57: API server internals - admission controllers, webhooks, API flow

#### The Request Flow

Every API request passes through: Authentication (who are you - certificates, tokens, OIDC) > Authorization (are you allowed - RBAC check) > Mutating Admission (modify the request - inject sidecars, add default labels, set resource limits) > Schema Validation (is the object valid) > Validating Admission (reject invalid requests - block images from untrusted registries, enforce required labels) > etcd Write.

#### Mutating vs Validating Webhooks

Mutating webhooks modify resources before they are persisted. Common uses: Istio's sidecar injector adds the envoy proxy container to every Pod, a webhook adds default resource limits to Pods that do not specify them, a webhook adds mandatory labels for cost attribution.

Validating webhooks accept or reject resources without modifying them. Common uses: block containers without resource limits, deny Pods with latest tag, enforce naming conventions, reject images from non-approved registries.

#### The Danger of Webhooks

A misconfigured webhook that crashes or times out can block ALL resource creation in the cluster. Always set failurePolicy: Ignore for non-critical webhooks, and set timeoutSeconds to a low value (5 seconds). Never deploy a webhook without thorough testing. See Q102 for the disaster scenario.

### Q58: Custom Resource Definitions and Operators - extending Kubernetes

#### The Simple Answer

CRDs extend the Kubernetes API with new resource types. Instead of managing a PostgreSQL database with Deployments, ConfigMaps, Services, and PVCs manually, you create a PostgresCluster custom resource and an operator manages all the underlying resources automatically.

#### How Operators Work

An operator is a controller that watches custom resources and reconciles the actual state toward the desired state. When you create a PostgresCluster resource, the operator creates the StatefulSet, Services, ConfigMaps, PersistentVolumeClaims, backup CronJobs, and monitoring configuration. When you update the resource (change replicas from 3 to 5), the operator handles the scaling procedure including data replication.

#### The Operator Maturity Model

**Level 1** - Basic Install: Automated installation and configuration.

**Level 2** - Seamless Upgrades: Automated version upgrades with data migration. Level 3 - Full Lifecycle: Backup, restore, and failure recovery.

**Level 4** - Deep Insights: Metrics, alerts, and log analysis.

**Level 5** - Auto Pilot: Auto-scaling, auto-tuning, anomaly detection.

#### Build vs Buy

Use existing operators from OperatorHub for common software - there are mature operators for PostgreSQL (Zalando/CrunchyData), MongoDB, Kafka (Strimzi), Redis, Elasticsearch, and many more. Build custom operators only for proprietary application lifecycle logic that no existing tool covers. Building an operator is a 3-6 month engineering investment minimum.

### Q59: Scheduler internals - filtering, scoring, custom schedulers

#### The Two Phases

**Filtering** - Eliminates nodes that cannot run the Pod. Checks: sufficient CPU and memory (based on requests), matching taints/tolerations, node affinity, volume topology, Pod topology spread constraints. After filtering, you have a list of feasible nodes.

**Scoring** - Ranks feasible nodes by preference. Plugins score based on: resource balance (prefer nodes with more headroom), Pod affinity (prefer nodes near related Pods), zone spreading (prefer zones with fewer Pods), image locality (prefer nodes that already have the image cached). The highest-scoring node wins.

#### Custom Schedulers

You can run multiple schedulers in a cluster. Pods specify which scheduler to use via schedulerName. Use cases: machine learning workloads with GPU-aware scheduling, batch processing with bin-packing optimization, or regulatory requirements for specific placement logic.

### Q60: Container runtime interface - containerd, CRI-O, and the CRI

#### The Simple Answer

The CRI is the standardized API between kubelet and the container runtime. Kubernetes removed Docker as a runtime in v1.24 because Docker wrapped containerd with additional features kubelet did not need. containerd is the most widely used runtime. CRI-O is a minimal runtime purpose-built for Kubernetes.

#### What Changed When Docker Was Removed

Nothing changed for developers. Docker images still work because they follow the OCI image specification. docker build still works for building images. Only the runtime (what pulls and runs containers on nodes) changed from Docker > containerd. Most teams did not notice any difference.

### Q61: Multi-cluster strategies - federation, fleet management

#### Why Multiple Clusters

Blast-radius isolation (a bad deploymentin one cluster does not affect others), regional latency (clusters close to users), compliance (data residency requirements), environment separation (dev/staging/prod in separate clusters), and scaling limits (some organizations hit single-cluster limits around 5000 nodes).

#### Management Approaches

**GitOps (ArgoCD ApplicationSets / Flux)** - Define cluster configurations in Git. Each cluster is a target. Changes propagate to all clusters through Git commits. The most common approach.

**Rancher / Google Fleet** - Centralized management plane that deploys and monitors workloads across clusters.

**Service mesh multi-cluster (Istio)** - Federated service discovery across clusters. A Pod in cluster A can calla Service in cluster B transparently.

### Q62: Kubernetes security hardening - CIS benchmarks, kube-bench

#### The Simple Answer

The CIS Kubernetes Benchmark is a comprehensive set of security recommendations. kube -bench is an open-source tool that automatically checks your cluster against these recommendations and reports failures.

#### Key Findings That kube-bench Typically Reports

API server: anonymous authentication enabled, insecure port open, audit logging not configured, encryption at rest not enabled. kubelet: read-only port open, anonymous authentication enabled, certificate rotation not configured. Pods: running as root, not using security contexts, no network policies applied.

Beyond kube-bench

kube-bench checks cluster configuration. For runtime security, add: Falco (detects anomalous behavior in running containers - unexpected shell access, network connections, file modifications), Trivy Operator (continuously scans running images for new CVEs), and kubeaudit (audits Kubernetes manifests for security misconfigurations).

### Q63: Service mesh deep dive - mTLS, traffic splitting, observability

#### mTLS Everywhere

A service mesh automatically encrypts all Pod-to-Pod traffic using mutual TLS. Both sides present certificates. Both sides verify the other's identity. No application code changes needed - the sidecar proxy handles everything. This means even if an attacker gains access to the cluster network, they cannot read or tamper with inter-service traffic.

#### Traffic Splitting for Canary

Istio VirtualService or Linkerd TrafficSplit resources route exact percentages of traffic to different Deployments. Unlike replica-based splitting (3:1 ratio = 75/25), mesh-based splitting is precise (exactly 5% to canary). Combined with metrics, you can automatically promote or rollback based on error rate thresholds.

#### Observability Without Code Changes

The sidecar proxy sees every request. It automatically generates: request rate, error rate, and latency metrics (RED metrics) for every service, distributed trace spans (when combined with trace header propagation), and

access logs with full request/response metadata. This gives you a complete service topology map and performance dashboard for free.

### Q64: Cluster upgrades - upgrading control plane and nodes safely

#### The Upgrade Rules

Kubernetes supports version skew of +/- 1 minor version between components. You cannot skip minor versions - you must upgrade 1.27 > 1.28 > 1.29, never 1.27 > 1.29. Upgrade control plane first, then worker nodes.

#### Before Upgrading

Run pluto or kubent to scan for deprecated API versions in your manifests and running resources. Check release notes for breaking changes. Verify all operators and Helm charts are compatible with the new version. Take an etcd backup. Test the complete upgrade in staging for at least one week.

#### Node Upgrade Strategy

Cordon (prevent new scheduling) > Drain (gracefully move workloads) > Upgrade (OS packages, kubelet, kube - proxy) > Uncordon (re-enable scheduling). Do one node ata time. Verify workloads are healthy after each node. PDBs protect against draining too many Pods simultaneously.

#### Managed Service Upgrades

EKS, GKE, and AKS handle control plane upgrades but node upgrades vary. GKE has node auto-upgrade. EKS requires managed node group updates or manual rolling. Always test, even on managed services - addons, CNI plugins, and custom controllers may need separate updates.

### Q65: Disaster recovery - etcd backup/restore, Velero, cluster rebuilding

#### etcd Backup and Restore

etcdctl snapshot save creates a point-in-time backup of all cluster state. etcdctl snapshot restore creates a new etcd data directory from a snapshot. This is the nuclear option - it recovers the entire cluster state but requires stopping the API server during restoration.

#### Velero - Application-Level Backup

Velero backs up Kubernetes resources (manifests) and persistent volume data to object storage (S3, GCS). Unlike etcd backup (all-or-nothing), Velero can backup and restore individual namespaces, specific resources, or label-selected objects. It supports: scheduled backups, backup hooks (quiesce a database before snapshot), cross-cluster migration, and disaster recovery to a different cluster or region.

#### The Complete DR Strategy

etcd snapshots every hour for full cluster state recovery. Velero scheduled backups for namespace-level and application-level recovery. GitOps (all manifests in Git) for rebuilding from scratch. Infrastructure-as-Code (Terraform/Pulumi) for cluster provisioning. All four layers together provide fast recovery from any failure scenario.

### Q66: FinOps in Kubernetes - cost optimization and right-sizing

#### The Problem

Teams request 4 CPU and 8 GB for a Pod that actually uses 0.5 CPU and 1 GB. Across thousands of Pods, this over-provisioning wastes 60-80% of cluster spend. Kubernetes makes it easy to request resources and hard to know if those requests are right.

#### Tools

**Kubecost / OpenCost** - Allocate costs to namespaces, teams, and labels. Show real-time spend and waste.

**VPA recommendations** - Based on historical usage, VPA suggests optimal resource requests. Run in recommendation-only mode and review suggestions monthly.

**Spot/Preemptible nodes** - 60-80% cheaper than on-demand. Use for stateless workloads, batch processing, and CI/CD runners. Handle interruptions with PDBs and graceful shutdown.

#### Quick Wins

Right-size requests based on actual usage (biggest savings). Use spot nodes for fault-tolerant workloads. Delete unused PVs and LoadBalancers. Shut down development clusters outside business hours. Set Cluster Autoscaler scale-down delay aggressively for non-production.

### Q67: Gateway API vs Ingress - the future of traffic management

#### The Simple Answer

Gateway API is the successor to Ingress. It provides a more expressive, role-oriented model with better separation of concerns.

#### Why Ingress Is Limited

Ingress only supports HTTP/HTTPS. Complex routing requires vendor-specific annotations that are not portable. There is no standard way to express traffic splitting, header-based routing, or cross-namespace routing. Every Ingress controller implements these differently through non-standard annotations.

#### How Gateway API Improves Things

**GatewayClass** - Defines the infrastructure provider (managed by platform team). Gateway - Defines listeners, ports, and TLS (managed by cluster operator). HTTPRoute - Defines routing rules (managed by application developer).

This separation means the platform team controls infrastructure, the cluster team controls network configuration, and developers control their own routing - each with appropriate RBAC.

### Q68: Kubernetes at scale - 1000+ nodes, performance tuning

#### Performance Bottlenecks

**API server** - Becomes the bottleneck for watch events and list operations. Increase watch cache size. Use API priority and fairness to prevent one misbehaving controller from starving others.

**etcd** - Database size grows with resource count. Compact and defragment regularly. Monitor leader elections - frequent elections indicate network or disk problems.

**Scheduler** - Throughput matters at scale. The scheduler evaluates up to 100 nodes by default (percentageOfNodesToScore). Increase parallelism if scheduling latency is too high.

#### Scaling Techniques

Use EndpointSlices (not Endpoints). Enable API server caching. Shard custom controllers by namespace. Use node pools / node groups to segment workloads. Consider cluster sharding - multiple smaller clusters instead of one massive cluster.

### Q69: Supply chain security - Kyverno vs OPA/Gatekeeper comparison

#### OPA/Gatekeeper

OPA uses Rego, a purpose-built policy language. Gatekeeper integrates OPA with Kubernetes admission control. Powerful and flexible but Rego has a steep learning curve. Better for organizations that use OPA across multiple systems (Kubernetes, Terraform, CI/CD).

#### Kyverno

**Kyverno policies are written in YAML** - no new language to learn. Policies can validate, mutate, generate, and clean up resources. Lower learning curve than OPA. Better for Kubernetes-only policy enforcement.

#### Common Policies Both Can Enforce

Block images from untrusted registries. Require resource limits on all containers. Enforce required labels (team, environment, cost-center). Deny privileged containers. Require non-root security contexts. Enforce image digest references instead of tags.

### Q70: Karpenter vs Cluster Autoscaler - next-gen node provisioning

#### Cluster Autoscaler (Traditional)

Works with predefined node groups (ASGs on AWS, MIGs on GCP). When Pods cannot schedule, it scales up the node group. When nodes are underutilized, it scales down. Limitation: you must predefine node groups with specific instance types. Cannot mix instance types within a group for optimal bin-packing.

#### Karpenter (Next Generation)

Karpenter provisions nodes directly without predefined node groups. It evaluates pending Pods, determines the optimal instance type and size, and launches individual instances. It can mix instance types for better bin-packing, consolidate underutilized nodes by replacing multiple small instances with fewer larger ones, and respond faster than Cluster Autoscaler (seconds instead of minutes).

#### When to Choose Which

**Karpenter** - AWS-native (GCP/Azure support is emerging). Better for dynamic workloads, mixed instance types, and cost optimization. Replaces both Cluster Autoscaler and the need for carefully designed node groups.

**Cluster Autoscaler** - Multi-cloud, mature, predictable. Better when you need specific instance types (GPU nodes, high-memory nodes) and have well-defined node group configurations.

### Q71: EKS vs GKE vs AKS - managed Kubernetes comparison

| Feature | EKS | GKE | AKS |
| --- | --- | --- | --- |
| Control plane cost | $73/month | Free (Autopilot) or $73 (Standard) | Free |
| Easiest upgrades | GKE | GKE (auto-upgrade) | AKS |
| Best networking | EKS (VPC CNI) | GKE (native) | AKS (Azure CNI) |
| Strongest security | GKE (Binary Auth, Workload Identity) | GKE | AKS (Azure AD) |
| Best autoscaling | EKS (Karpenter) | GKE (Autopilot) | AKS (KEDA built-in) |
| Multi-cloud story | EKS Anywhere | Anthos | Azure Arc |

### Q72: Kubernetes API deprecations and migration strategies

APIs are deprecated with at least two releases of notice. Once removed, manifests using old API versions fail. Tools: pluto scans manifests in Git, kubent scans running resources in the cluster. Always check the deprecation guide before upgrading. Convert manifests proactively - do not wait until the upgrade forces it.

### Q73: Sidecar containers (KEP-753) - native sidecar support

Before 1.28, sidecars were regular containers with no lifecycle guarantees - they could prevent Jobs from completing and had no startup ordering. Native sidecars are init containers with restartPolicy: Always. They start before the main container, run alongside it, and terminate after it exits. This fixes Job completion, ensures proper startup order, and integrates with Pod readiness.

### Q74: VPA, HPA, and KEDA - comprehensive autoscaling strategy

**HPA** - Horizontal scaling based on CPU, memory, or custom metrics. Best for stateless services.

**VPA** - Vertical right-sizing based on historical usage. Best for finding optimal resource requests. Do not run in auto mode with HPA on the same metric.

**KEDA** - Event-driven scaling from 0 to N. Scales based on external event sources - Kafka queue depth, SQS messages, cron schedules, Prometheus queries. Best for event-driven workloads and scaling to zero.

#### The Combined Strategy

VPA in recommendation mode to right-size requests. HPA for horizontal scaling during load spikes. KEDA for event-driven workloads and scale-to-zero. Cluster Autoscaler or Karpenter for infrastructure scaling.

### Q75: Zero-trust networking - mTLS, NetworkPolicies, SPIFFE

Zero-trust means no implicit trust. Every connection must be authenticated and encrypted. Implementation: MTLS via service mesh for encryption and identity verification, NetworkPolicies for network segmentation, SPIFFE/SPIRE for workload identity (each workload gets a cryptographic identity regardless of its IP), and admission webhooks to enforce security policies on all resources.

### Q76: Kubernetes audit logging - who did what and when

#### The Simple Answer

Audit logging records who did what, when, and to which resource. Essential for security compliance, incident investigation, and change tracking. Configured through an audit policy file that defines which events to log at which detail level.

#### Audit Levels

**None** - Do not log.

**Metadata** - Log request metadata (user, timestamp, resource, verb) but not request/response bodies. The default for most resources.

**Request** - Log metadata and request body. Use for sensitive operations like Secret creation.

**RequestResponse** - Log everything including response bodies. Very verbose - use sparingly.

Always exclude Secret read events from RequestResponse level. Logging Secret values in audit logs defeats the purpose of securing them. Log Secret reads at Metadata level only.

### Q77: Secrets encryption at rest - EncryptionConfiguration for etcd

#### The Simple Answer

By default, Secrets are stored in etcd as base64-encoded plaintext. Anyone with etcd access can read all Secrets. Encryption at rest encrypts Secrets before writing them to etcd using an EncryptionConfiguration.

#### How to Enable

Create an EncryptionConfiguration file specifying the encryption provider (aescbc, aesgcm, kms, secretbox). The KMS provider is recommended - it integrates with AWS KMS, GCP KMS, or Azure Key Vault so keys are managed externally and rotated by the cloud provider. After enabling encryption, re-write all existing Secrets with kubectl get secrets --all-namespaces -o json | kubectl replace -f - to encrypt previously unencrypted data.

### Q78: RuntimeClass - gVisor, Kata containers for strong isolation

#### The Simple Answer

RuntimeClass lets you run different containers with different runtimes. gVisor interposes a user-space kernel between the container and the host kernel, providing stronger isolation. Kata Containers runs each container inside a lightweight VM. Both provide stronger isolation than standard runc at the cost of performance overhead.

#### When to Use

Multi-tenant environments where you run untrusted code (CI/CD build environments, serverless functions, customer-submitted workloads). The stronger isolation prevents container escape attacks from reaching the host kernel.

### Q79: Argo Rollouts and Flagger - progressive delivery at scale

#### Argo Rollouts

Replaces the standard Deployment resource with a Rollout resource. Supports canary (percentage-based traffic shifting with automatic promotion/rollback based on metrics), blue-green (instant traffic switching with preview environments), and analysis runs (automated metric checks at each canary step).

#### Flagger

Works with existing Deployments and Ingress/Service mesh resources. Monitors Prometheus metrics during canary steps. Automatically promotes if metrics are healthy, rolls back if degraded. Supports Istio, Linkerd, nginx, Contour, and other traffic providers.

#### The Progressive Delivery Pipeline

Push new image > Rollout starts canary at 5% -> Analysis checks error rate and latency > If healthy, advance to 25% -> Check again > 50% > 100% > Promotion complete. If any check fails, automatic rollback to the previous version. No human intervention needed for the happy path.

### Q80: Kubernetes garbage collection and owner references

#### The Simple Answer

Owner references create parent-child relationships between resources. A Deployment owns a ReplicaSet which owns Pods. When the parent is deleted, the children are automatically garbage collected (cascading delete). This is why deleting a Deployment deletes its ReplicaSet and all its Pods.

#### Foreground vs Background Deletion

**Background (default)** - The parent is deleted immediately. The garbage collector asynchronously deletes children. There is a brief period where orphaned children exist.

**Foreground** - Children are deleted first. The parent is only deleted after all children are gone. Use when you need to ensure cleanup is complete before proceeding.

#### Orphan Policy

kubectl delete deployment my-app --cascade=orphan deletes the Deployment but leaves the ReplicaSet and Pods running. Useful when you want to adopt resources under a new parent or when restructuring ownership.

#### Finalizers and Garbage Collection

Finalizers are pre-delete hooks. When a resource has a finalizer, it is not deleted until the finalizer controller processes it and removes the finalizer. Stuck finalizers (from deleted operators) block garbage collection and cause resources to hang in Terminating state. See Q101 for the scenario.

## Section 4 - Tricky Scenarios & Real-World Disasters (Q81-Q110)

### Q81: Pod stuck in Pending - systematic debugging

#### What Pending Means

A Pod in Pending state has been accepted by the API server but has not been scheduled to a node. Something is preventing the scheduler from placing it.

#### Step-by-Step Debugging

1. **Step 1 -** Read the events. Run kubectl describe pod pod-name and scroll to the Events section. This is where Kubernetes tells you exactly what is wrong. Common messages include: FailedScheduling, Insufficient cpu, Insufficient memory, no nodes available to schedule pods, and volume node affinity conflict.

2. **Step 2 -** Check resource availability. Run kubectl describe nodes and look at the Allocated resources section. If the node's allocated CPU or memory is close to capacity, there is no room for the new Pod. Compare the Pod's resource requests (kubectl get pod -o yaml) against available capacity. Even if the node has free resources in reality, Kubernetes schedules based on requests, not actual usage.

3. **Step 3 -** Check node taints and Pod tolerations. If all nodes have taints that the Pod does not tolerate, it cannot schedule. Run kubectl get nodes -o json | jq'.items[].spec.taints' to see all taints. Run kubectl get pod pod-name -o json | jq '.spec.tolerations' to check Pod tolerations. Common culprit: Pods without tolerations on a cluster where all nodes are tainted for specific workloads.

4. **Step 4 -** Check node affinity rules. If the Pod has requiredDuringSchedulingIgnoredDuringExecution node affinity and no node matches the label selector, the Pod will never schedule. Verify label selectors match actual node labels with kubectl get nodes --show-labels.

5. **Step 5 -** Check PVC binding. If the Pod uses a PersistentVolumeClaim that is stuck in Pending (see Q77), the Pod cannot schedule. Run kubectl get pvc in the same namespace. If the PVC is Pending, fix that first.

6. **Step 6 -** Check topology constraints. If the Pod has topology spread constraints and adding it to any node would violate maxSkew, the scheduler blocks it. This happens when zones are already at maximum imbalance.

7. **Step 7 -** Check Cluster Autoscaler. If the cluster has no node with sufficient resources AND the Cluster Autoscaler is either not configured, has reached its node limit, or the node group's max size is hit, the Pod stays Pending until capacity is added.

#### The Most Common Cause

In 80% of cases, the Pod is Pending because resource requests exceed available capacity. Either reduce the Pod's requests, add nodes, or evict lower-priority workloads. Always check kubectl describe pod first - the Events section tells you the answer directly.

### Q82: Pod stuck in CrashLoopBackOff - step-by-step resolution

#### What CrashLoopBackOff Means

The container starts, crashes, and Kubernetes restarts it. Each restart happens with an increasing delay (10s, 20s, 40s, up to 5 minutes). The Podis in a restart loop because the container keeps failing immediately after starting.

#### Step-by-Step Debugging

1. **Step 1 -** Check the logs. Run kubectl logs pod-name. If the container crashes too fast to produce logs, run kubectl logs pod-name --previous to see logs from the last crashed instance. This is your most important diagnostic tool.

2. **Step 2 -** Check the exit code. Run kubectl describe pod pod-name and look at the Last State section. Exit code 1 means application error (bad config, missing dependency). Exit code 137 means OOM killed (see Q78). Exit code 139 means segmentation fault. Exit code 126 means permission denied on the command. Exit code 127 means command not found.

3. **Step 3 -** For exit code 1 - check configuration. Missing or incorrect environment variables are the number one cause. Verify ConfigMaps and Secrets are mounted correctly. Check that the database, API, or external service the application depends on is reachable. Try running the container locally with the same environment variables to reproduce the error.

4. **Step 4 -** For exit code 127 - check the image. The command or entrypoint specified in the Pod spec does not exist in the image. Verify the image tag is correct and the binary path matches. Common cause: a multi-stage build that forgot to copy the binary to the final stage.

5. **Step 5 -** For exit code 137 - check resources. The container is being OOM killed. Increase memory limits. If the container is legitimately using that much memory, either optimize the application or increase the limit. See Q78 for detailed OOM debugging.

6. **Step 6 -** If no useful logs exist. Override the entrypoint to get a shell: kubectl run debug --rm -it --image=same-image --command -- /bin/sh. Inspect the filesystem, check file permissions, verify dependencies are present.

7. **Step 7 -** Check the liveness probe. An overly aggressive liveness probe can kill a slow-starting container. If the container starts, runs briefly, then is killed, the liveness probe might be the culprit. Check probe configuration and increase initialDelaySeconds and timeoutSeconds. Use a startup probe instead for slow-starting applications.

#### Common Causes by Frequency

1. Missing or wrong environment variable (40% of cases). 2. Application dependency unreachable - database, API, config service (25%). 3. Image issue - wrong tag, missing binary, permission error (15%). 4. OOM killed (10%). 5. Liveness probe killing slow startup (10%).

### Q83: Pod stuck in ImagePullBackOff - all common causes

#### What ImagePullBackOff Means

Kubernetes cannot pull the container image from the registry. It retries with exponential backoff.

#### Step-by-Step Debugging

1. **Step 1 -** Check the exact error. kubectl describe pod pod-name shows the Events. Look for messages like: repository does not exist, authentication required, manifest not found, or timeout.

2. **Step 2 -** For 'repository does not exist' or 'manifest not found'. The image name or tag is wrong. Verify the exact image reference. Check for typos. Check that the tag exists in the registry (docker pull the image locally to verify).

3. **Step 3 -** For 'authentication required'. The node cannot authenticate to the private registry. Verify the imagePullSecrets is set on the Pod or the namespace's default ServiceAccount. Check that the Secret contains valid credentials. Test the credentials manually: echo $SECRET | base64 -d to inspect.

4. **Step 4 -** For 'timeout' or network errors. The node cannot reach the registry. Check node DNS resolution. Check security groups / firewall rules allow outbound HTTPS to the registry. Check if the registry is experiencing an outage (Docker Hub status page, AWS health dashboard).

5. **Step 5 -** For ECR-specificissues. ECR tokens expire every 12 hours. If the imagePullSecret has expired, Pods fail to pull. Use a CronJob or a credential helper (like ecr-credential-provider) to rotate tokens automatically.

6. **Step 6 -** For rate limiting. Docker Hub limits anonymous pulls. Authenticated Docker Hub pulls have higher limits. Consider mirroring images to your private registry. See Q70 from the Docker guide for detailed workarounds.

#### Prevention

Always use imagePullPolicy: IfNotPresent with immutable tags (git SHA or semver). This avoids pulling on every Pod restart. For critical workloads, pre-pull images to nodes during maintenance windows. Consider running a pull-through cache registry for external images.

### Q84: Pod stuck in ContainerCreating - different from Pending

#### What ContainerCreating Means

The Pod has been scheduled to a node (unlike Pending), but the container cannot start. The kubelet is trying to setup the container's environment - pulling secrets, mounting volumes, setting up networking - and something is failing.

#### Step-by-Step Debugging

1. **Step 1 -** Check events. kubectl describe pod pod-name shows events from the kubelet. Common messages: failed to mount volume, secret not found, failed to set up sandbox, network plugin error.

2. **Step 2 -** For volume mount failures. The most common cause. A PVC is not bound, a Secret or ConfigMap referenced in the Pod does not exist in the namespace, or a volume plugin is failing. Check kubectl get pvc and kubectl get secret/configmap in the same namespace. If using CSI drivers, check the CSI node plugin Pods in kube-system.

3. **Step 3 -** For Secret/ConfigMap not found. The Pod spec references a Secret or ConfigMap that does not exist. The Pod cannot start because it cannot mount or inject the missing data. Create the missing resource or fix the reference.

4. **Step 4 -** For network plugin errors. The CNI plugin failed to set up the Pod's network namespace. Check CNI plugin Pods (Calico, Cilium, etc.) in kube-system for errors. Common causes: IP address exhaustion (AWS VPC CNI runs out of IPs), CNI binary not found on the node, or CNI configuration file missing.

5. **Step 5 -** For sandbox setup failures. The container runtime (containerd/CRI-O) failed to create the container sandbox. Check kubelet logs on the node: journalctl -u kubelet. Common causes: disk full on the node, container runtime crashed, or AppArmor/SELinux denying the operation.

#### The Difference from Pending

Pending means the scheduler has not placed the Pod yet (resource/affinity/taint issues). ContainerCreating means the Pod IS placed on a node but the kubelet cannot start the container (volume/secret/network issues). Different problems, different debugging paths.

### Q85: Node NotReady - diagnose and recover without losing workloads

#### What NotReady Means

The node's kubelet has stopped reporting its status to the API server. After the node -monitor-grace-period (default 40 seconds), the node is marked NotReady. After pod-eviction-timeout (default 5 minutes), Pods are evicted and rescheduled to healthy nodes.

#### Step-by-Step Debugging

1. **Step 1 -** Check node conditions. kubectl describe node node-name shows conditions: MemoryPressure, DiskPressure, PIDPressure, and Ready. If any pressure condition is True, the node is under stress.

2. **Step 2 -** SSH into the node. Check if kubelet is running: systemctl status kubelet. Check kubelet logs: journalctl -u kubelet -n 100 --no-pager. Common issues: certificate expired, cannot reach API server, disk full, out of memory.

3. **Step 3 -** For disk pressure. Check /var/lib/docker or /var/lib/containerd disk usage. Prune unused images and containers. Check if container logs are consuming disk - configure log rotation.

4. **Step 4 -** For memory pressure. Check what is consuming memory with top or free -h. The kubelet reserves memory for itself and the system. If workloads consume all memory, the kernel OOM killer starts killing processes - sometimes killing kubelet itself.

5. **Step 5 -** For network issues. The kubelet cannot reach the API server. Check node security groups, VPN connectivity, and DNS resolution. On managed services, check if the node's IAM role has been modified.

6. **Step 6 -** If the node is irrecoverable. Cordon the node (kubectl cordon node-name) to prevent new Pods. Drain it (kubectl drain node-name --ignore-daemonsets --delete-emptydir-data) to gracefully move workloads. Terminate and replace the node. On managed services, this is often as simple as terminating the instance - the node group provisions a replacement.

#### Protecting Workloads

Always run at least 3 replicas across multiple nodes for critical services. Use Pod Disruption Budgets. Use topology spread constraints to distribute Pods across availability zones. A single node failure should never take down a production service.

### Q86: Service not routing traffic to Pods - troubleshoot networking

#### Step-by-Step Debugging

1. **Step 1 -** Check if the Service has endpoints. kubectl get endpoints service-name. If the Endpoints list is empty, the Service cannot find any matching Pods. This is the single most common cause.

2. **Step 2 -** If endpoints are empty, check label selectors. Compare the Service's selector (kubectl get svc service - name -o yaml) with the Pod's labels (kubectl get pod -o yaml). They must match exactly. A typo in a label key or value breaks the connection.

3. **Step 3 -** If endpoints exist, check Pod readiness. Only Pods passing their readiness probe appear as endpoints. Run kubectl get pods to check if Pods are Ready (the READY column shows 1/1, not 0/1). If Pods are not ready, fix the readiness probe or the underlying health issue.

4. **Step 4 -** Check the Pod is listening on the correct port. kubectl exec into the Pod and run netstat -tlnp or ss -tlnp. Verify the application is listening on the port the Service targets (targetPort field). A common mistake: the Service targets port 8080 but the application listens on port 80.

5. **Step 5 -** Check kube-proxy. Run kubectl get pods -n kube-system to verify kube-proxy is running. Check kube-proxy logs for iptables or IPVS errors. On some CNis, kube-proxy is replaced by the CNI's own Service implementation (Cilium).

6. **Step 6 -** Test connectivity directly. From a debug Pod in the same namespace, try: curl service-name:port to test Service routing, then curl pod-ip:port to test direct Pod connectivity. If direct works but Service does not, the issue is in kube-proxy or iptables rules.

The #1 Cause

Mismatched label selectors between the Service and Pods. Every time a Service has no endpoints, check the labels first. This takes 10 seconds and solves the problem 70% of the time.

### Q87: Deployment rollout stuck - maxUnavailable and maxSurge misconfigured

#### What a Stuck Rollout Looks Like

kubectl rollout status shows the rollout is progressing but never completes. Some old Pods are running and some new Pods are running, but the transition is not finishing.

#### Common Causes and Fixes

- **Cause 1 -** New Pods are failing readiness probes. The Deployment creates new Pods but they never become Ready. Old Pods are not terminated because maxUnavailable prevents it. The rollout waits forever. Fix: check why new Pods are not Ready (wrong config, dependency issue, broken image).

- **Cause 2 -** Not enough cluster resources for surge. maxSurge creates extra Pods during rollout. If the cluster does not have capacity for these extra Pods, they stay Pending. The rollout cannot progress. Fix: reduce maxSurge to 0 (replace one-at-a-time), add cluster capacity, or use Cluster Autoscaler.

- **Cause 3 -** PDB preventing old Pod removal. A Pod Disruption Budget might prevent old Pods from being evicted during the rollout. If PDB minAvailable is too high relative to replica count, the rollout deadlocks. Fix: reduce PDB minAvailable or increase replica count.

**Recovery:** If the rollout is stuck with a bad image, kubectl rollout undo deployment/my-app reverts immediately. Check the rollout history with kubectl rollout history deployment/my-app.

### Q88: PVC stuck in Pending - storage class and provisioner issues

#### Step-by-Step Debugging

1. **Step 1 -** Check PVC events. kubectl describe pvc pvc-name shows the Events. Common messages: provisioning failed, no persistent volumes available, waiting for first consumer.

2. **Step 2 -** If 'waiting for first consumer'. The StorageClass has volumeBindingMode: WaitForFirstConsumer. The PVC will not bind until a Pod references it and gets scheduled. This is normal behavior for zone-aware storage - it waits to know which zone the Pod will be in before creating the volume.

3. **Step 3 -** If 'no persistent volumes available'. For static provisioning, no PV matches the PVC's size, access mode, and storage class. Create a PV that matches.

4. **Step 4 -** If 'provisioning failed'. The dynamic provisioner cannot create the volume. Check: Does the StorageClass exist? Is the CSI driver installed and running (kubectl get pods -n kube-system)? Do the node or cluster IAM permissions allow volume creation? Has the cloud provider's volume quota been reached?

5. **Step 5 -** For EBS-specific issues. EBS volumes are availability-zone-scoped. If the PVC was created in zone A but the Pod is scheduled to zone B, the volume cannot attach. Use WaitForFirstConsumer to prevent this. If the volume already exists in the wrong zone, you must snapshot it, create a new volume in the correct zone, and update the PV.

### Q89: OOMKilled Pod but application says memory is fine

#### Why the Application Thinks Memory Is Fine

The application monitors its own heap memory, which may be well within limits. But the container's total memory includes much more: the application heap, native memory, thread stacks, memory-mapped files, shared libraries, and any child processes. The OOM kill happens at the container level, not the application level.

#### Step-by-Step Debugging

1. **Step 1 -** Confirm OOM kill. kubectl describe pod pod-name shows OOMKilled in the last termination reason. The exit code is 137 (128 + SIGKILL signal 9).

2. **Step 2 -** Check what memory Kubernetes saw. kubectl top pod pod-name shows current memory usage. Compare with the container's memory limit from kubectl get pod -o yaml. The memory shown by kubectl top is the cgroup memory counter, which includes everything - not just the application heap.

3. **Step 3 -** Identify memory beyond the heap. For Java: native memory tracking with - XX:Native MemoryTracking=summary. Thread stacks default to 1 MB each - 200 threads = 200 MB just for stacks. Metaspace for class loading. Direct byte buffers for NIO.

For Node.js: the V8 heap is just one component. External C++ bindings (sharp, native modules) allocate outside V8. Worker threads each have their own heap.

For Go: the Go runtime memory is separate from cgo allocations. Goroutine stacks grow dynamically.

4. **Step 4 -** Fix the limit. Set the memory limit to at least 1.5x the expected peak total memory (not just heap). For Java, set -Xmx to 75% of the container's memory limit - the remaining 25% covers non-heap memory. Monitor actual usage over days before tightening limits.

The classic mistake: Setting a Java container's memory limit to 512Mi and -Xmx512m. The JVM will use 512 MB for the heap alone, plus another 100-200 MB for non-heap memory, exceeding the container's 512 Mi limit. Set -Xmx to 75% of the container limit: -Xmx384m for a 512Mi container.

### Q90: Intermittent 503 errors during rolling update

#### Why It Happens

During a rolling update, a Pod receives SIGTERM and starts shutting down. But traffic is still being routed to it because the endpoint has not been removed yet. Requests arriving after SIGTERM but before endpoint removal receive 503 or connection refused errors. There is a race condition between Pod shutdown and Service endpoint updates.

#### Step-by-Step Fix

1. **Step 1 -** Add a preStop hook. The preStop lifecycle hook runs before SIGTERM is sent. Add a sleep of 5-10 seconds: preStop: exec: command: ["sleep", "10"]. This gives kube-proxy and the Ingress controller time to remove the endpoint before the Pod starts shutting down.

2. **Step 2 -** Handle SIGTERM gracefully in the application. After receiving SIGTERM, the application should stop accepting new connections but finish processing in-flight requests. Set terminationGracePeriodSeconds high enough for in-flight requests to complete (30-60 seconds for most web applications).

3. **Step 3 -** Configure the Ingress controller. Increase the deregistration delay or drain timeout on the load balancer. For AWS ALB, set alb.ingress.kubernetes.io/target-group-attributes: deregistration_delay.timeout_seconds=30.

4. **Step 4 -** Ensure readiness probes fail during shutdown. When the application receives SIGTERM, have the readiness probe start returning failure. This removes the Pod from endpoints proactively. Combined with the preStop sleep, this provides a belt-and-suspenders approach.

#### The Complete Solution

The combination of a preStop sleep (10 seconds) + graceful SIGTERM handling + readiness probe failing on shutdown + appropriate terminationGracePeriodSeconds eliminates 503 errors during rolling updates. This is a production hardening step that every team should implement before going to production.

### Q91: DNS resolution failing intermittently inside Pods

#### Common Causes and Fixes

- **Cause 1 -** ndots:5 default causing excessive DNS queries. Kubernetes sets ndots:5 in Pod DNS config, which means any name with fewer than 5 dots gets the search domains appended. A lookup for api.example.com tries api.example.com.default.svc.cluster.local first, then api.example.com.svc.cluster.local, then api.example.com.cluster.local, then api.example.com before finally resolving. This amplifies DNS traffic by 5x. Fix: Set dnsConfig.options with ndots:1 on Pods that primarily communicate with external services.

- **Cause 2 -** CoreDNS overloaded. If CoreDNS has too few replicas for the cluster size, it drops queries under load. Fix: Scale CoreDNS replicas proportionally to cluster size. Enable CoreDNS autoscaling. Monitor CoreDNS metrics for SERVFAIL responses and query latency.

- **Cause 3 -** conntrack table full. Every DNS query creates a conntrack entry. On busy nodes, the conntrack table fills up, causing packet drops. Fix: Increase net.netfilter.nf_conntrack_max on nodes. Monitor conntrack table usage.

- **Cause 4 -** NodeLocal DNSCache not deployed. NodeLocal DNSCache runs a DNS cache on every node, reducing the load on CoreDNS and avoiding conntrack issues for DNS. It is the single most effective fix for DNS reliability in large clusters. Deploy it with the standard DaemonSet manifest.

Intermittent DNS failures are one of the hardest issues to diagnose in Kubernetes because they are non-deterministic and the symptoms appear as random application errors. If you see intermittent timeouts, connection failures, or slow responses across multiple services, always investigate DNS first. Deploy NodeLocal DNSCache proactively - do not wait for problems to start.

### Q92: etcd is full - cluster becoming read-only

#### What Happens

etcd has a configurable database size limit (default 2 GB in most setups, max 8 GB). When the database reaches this limit, etcd switches to read-only mode - it accepts reads but rejects all writes. This means no new Pods can be created, no ConfigMaps can be updated, no scaling operations work. The cluster appears frozen.

#### Step-by-Step Resolution

1. **Step 1 -** Confirm the issue. Check etcd logs for messages containing 'mvcc: database space exceeded' or 'etcdserver: no space.' Run etcdctl endpoint status to see the current database size.

2. **Step 2 -** Compact revision history. etcd keeps a history of all changes. Over time, this history grows. Run etcdctl compact $(etcdctl endpoint status --write-out="json" | jq -r '.[].Status.header.revision') to compact old revisions.

3. **Step 3 -** Defragment. After compaction, the disk space is not reclaimed until you defragment. Run etcdctl defrag --endpoints=... on each etcd member one at a time (never all at once - defrag briefly pauses the member).

4. **Step 4 -** Increase the quota if needed. If the database legitimately needs more space (thousands of CRDs, massive ConfigMaps), increase --quota-backend-bytes in the etcd configuration. Maximum recommended is 8 GB.

5. **Step 5 -** Find what is consuming space. Use etcdctl get --prefix / --keys-only | head -100 to list keys. Large ConfigMaps, excessive Events, and CRD instances are common culprits. Prune old Events, reduce ConfigMap sizes, and set TTLs on ephemeral resources.

#### Prevention

Monitor etcd database size and alert at 75% of the quota. Set up automatic compaction (etcd has a --auto-compaction option). Prune old Events with a TTL. Avoid storing large blobs in ConfigMaps or Secrets - use external storage instead.

### Q93: Secret accidentally exposed in logs - incident response

#### Immediate Response

1. **Step 1 -** Rotate the secret immediately. Change the password, API key, or token in the source system. Update the Kubernetes Secret with the new value. Restart all Pods consuming the Secret to pick up the new value.

2. **Step 2 -** Identify the exposure scope. Which logs contain the secret? Application logs (container stdout)? Kubernetes audit logs? CI/CD pipeline logs? Monitoring dashboards? Each log destination needs separate remediation.

3. **Step 3 -** Purge the logs. Delete the log entries containing the secret from all log stores - Elasticsearch, CloudWatch, Loki, Splunk. If using a managed service, check retention policies - the secret might be in backups too.

4. **Step 4 -** Determine how it leaked. Application printing environment variables on startup? Error handling dumping the full request/response? Kubernetes audit logging at Metadata level capturing Secret reads? Debug logging accidentally enabled in production?

#### Prevention

**Never mount secrets as environment variables** - use volume mounts instead. Environment variables leak into process listings, crash dumps, and child processes. Configure Kubernetes audit logging to redact Secret data (audit policy with omitStages and resource-level rules). Use external secret management (Vault, ESO) where the Kubernetes Secret contains a reference, not the actual value. Add log scrubbing rules to your logging pipeline to detect and mask common secret patterns.

### Q94: Cluster upgrade broke CRDs and operators

#### What Happened

Kubernetes deprecated or changed API versions that the operators and CRDs depended on. After upgrading the control plane, operators start crash-looping because they reference removed APIs, or CRD validation rules become incompatible.

#### Step-by-Step Resolution

1. **Step 1 -** Identify broken operators. kubectl get pods -n operator-namespaces and check for CrashLoopBackOff. Check operator logs for messages about unsupported API versions or webhook failures.

2. **Step 2 -** Check CRD compatibility. Run kubectl get crd and verify all CRDs still work. Check if stored versions in the CRD status match the current API version.

3. **Step 3 -** Upgrade operators to compatible versions. Check the operator documentation for which Kubernetes versions it supports. Upgrade the operator to a version compatible with your new Kubernetes version. This may require upgrading the operator before upgrading the cluster - check the upgrade guide.

4. **Step 4 -** For webhook failures. Mutating and validating webhooks can block all resource creation if they are broken. If a webhook is failing, the API server rejects all matching requests. Temporarily set the webhook's failurePolicy to Ignore to unblock the cluster while you fix the operator. Change it back to Fail once the operator is healthy.

#### Prevention

Before every cluster upgrade: 1) Run pluto or kubent to find deprecated APIs. 2) Check every operator's documentation for Kubernetes version compatibility. 3) Upgrade operators to compatible versions BEFORE upgrading the cluster. 4) Test the complete upgrade in a staging cluster first. 5) Always have an etcd backup before starting.

### Q95: HPA flapping - scaling up and down every 30 seconds

#### Why It Happens

The HPA observes high CPU, scales up, the load spreads across more Pods, CPU drops, HPA scales down, the load concentrates on fewer Pods, CPU spikes again, HPA scales up. This oscillation is called flapping.

#### Step-by-Step Fix

1. **Step 1 -** Increase the stabilization window. HPA has behavior.scaleDown.stabilizationWindowSeconds - set it to 300 seconds (5 minutes). This means HPA waits 5 minutes of sustained low metrics before scaling down, preventing rapid oscillation.

2. **Step 2 -** Add scale-down rate limits. Set behavior.scaleDown.policies to limit the rate of scale-down - for example, remove at most 1 Pod per 60 seconds. This prevents drastic scale-downs.

3. **Step 3 -** Tune the target value. If your target CPU utilization is 50% and actual usage oscillates between 40% and 60%, the HPA constantly crosses the threshold. Either increase the target (70%) to reduce sensitivity, or increase the number of minimum replicas to absorb normal load fluctuation without autoscaling.

4. **Step 4 -** Check the metrics source. If metrics are delayed or spiky, HPA makes decisions on stale or inaccurate data. Ensure metrics-server is healthy and providing timely data. For custom metrics, check the scrape interval and ensure metrics are smoothed (averaged over a window rather than instantaneous).

The ideal HPA configuration: minReplicas handles normal traffic. maxReplicas handles peak traffic. Target utilization is set high enough that normal fluctuations do not cross it. Scale-up is fast (no restrictions). Scale-down is slow (5-minute stabilization, rate-limited). This gives responsive scale-up with stable scale-down.

### Q96: Pod evicted due to disk pressure - preventing data loss

#### What Happened

The node ran out of disk space. kubelet detected DiskPressure and started evicting Pods to free disk. Eviction kills Pods with no grace period for cleanup if the pressure is critical.

#### Step-by-Step Response

1. **Step 1 -** Check which Pods were evicted and why. kubectl get events --field-selector reason=Evicted shows eviction events. kubectl describe pod evicted-pod-name shows the eviction reason.

2. **Step 2 -** Find what consumed the disk. SSH to the node. Check /var/lib/containerd or /var/lib/docker (container images and layers), /var/log (container logs and system logs), /var/lib/kubelet (kubelet data, Pod volumes), and /tmp. The most common culprits are unrotated container logs and unused container images.

3. **Step 3 -** Clean up. Prune unused images: crictl rmi --prune. Rotate logs: configure logrotate for container runtime logs. Delete orphaned Pod directories in /var/lib/kubelet/pods.

4. **Step 4 -** Prevent data loss. If evicted Pods were writing to emptyDir volumes, that data is gone. For critical data, always use PersistentVolumes - they survive Pod eviction. Set resource limits on emptyDir volumes with sizeLimit to prevent a single Pod from filling the disk.

#### Prevention

Monitor node disk usage and alert at 70%. Configure kubelet garbage collection thresholds ( -- image-gc-high-threshold=85, --image-gc-low-threshold=80). Set log rotation in the container runtime. Use separate disk partitions for /var/lib/containerd and /var/log so container images and logs compete for different disk pools.

### Q97: Ingress returns 502 Bad Gateway after deployment

#### What 502 Means

The Ingress controller received a request and forwarded it to a backend Pod, but the Pod did not respond. The Pod was either not ready, not listening on the expected port, or terminated before responding.

#### Step-by-Step Debugging

1. **Step 1 -** Check if backend Pods are ready. kubectl get pods -l app=my-app. If Pods show 0/1 Ready, they are not passing readiness probes. The Ingress controller removes unready Pods from the upstream list. If ALL Pods are unready, every request gets 502.

2. **Step 2 -** Check the Ingress backend configuration. kubectl describe ingress my-ingress shows the backend service and port. Verify the Service exists, has endpoints, and the port number matches what the application listens on.

3. **Step 3 -** Check for port mismatch. The Ingress routes toa Service on a servicePort. The Service routes to Pods on a targetPort. The application must listen on the targetPort. If any of these do not match, requests reach a port where nothing is listening.

4. **Step 4 -** Check for timing issues during deployment. During a rolling update, old Pods are terminating and new Pods are starting. If the readiness probe takes time, there is a window where no ready Pods exist. Fix: ensure minReadySeconds is set, readiness probes are fast, and maxUnavailable does not allow all old Pods to terminate before new ones are ready.

5. **Step 5 -** Check Ingress controller logs. kubectl logs -n ingress-namespace ingress-controller-pod shows the upstream connection errors with details - connection refused, timeout, reset.

6. **Step 6 -** Check for the SIGTERM race condition (Q79). If 502s happen only during deployments and resolve after a few seconds, it is the endpoint removal race condition. Add a preStop sleep hook.

### Q98: Cross-namespace communication blocked after NetworkPolicy

#### What Happened

You applied a NetworkPolicy to restrict traffic in the production namespace. Now services in other namespaces that communicate with production services are getting connection timeouts.

#### Why It Happened

NetworkPolicies are additive but default-deny once any policy selects a Pod. If you applied a policy that allows ingress from Pods with label app=frontend, it implicitly denies ingress from everything else - including Pods in other namespaces.

#### Step-by-Step Fix

1. **Step 1 -** Identify which traffic is blocked. From the source Pod in another namespace, try to connect: kubectl exec -n other-ns debug-pod -- curl production-service.production.svc.cluster.local:8080. If it times out, the NetworkPolicy is blocking it.

2. **Step 2 -** Check existing NetworkPolicies. kubectl get networkpolicies -n production and kubectl describe each one. Look at the ingress rules - do they specify namespaceSelector?

3. **Step 3 -** Add a namespaceSelector. To allow traffic from a specific namespace, add a namespaceSelector to the NetworkPolicy's ingress rules. Labelthe source namespace first: kubectl label namespace other-ns name=other-ns. Then reference it in the policy with namespaceSelector: matchLabels: name: other-ns.

4. **Step 4 -** Test the fix. Retry the connection from the source Pod. If it works, document the NetworkPolicy requirements for cross-namespace communication.

#### Common Mistake

Many teams apply a default-deny policy and then add allow rules only for Pods within the same namespace, forgetting that monitoring tools (Prometheus in the monitoring namespace), Ingress controllers (in the ingress namespace), and mesh sidecars also need network access. Always map out all cross-namespace traffic flows before applying NetworkPolicies.

### Q99: StatefulSet Pod stuck in Terminating for 30+ minutes

#### Why It Happens

StatefulSet Pods have stable storage. When a Pod is deleted, Kubernetes waits for the Pod to terminate gracefully, detach its volumes, and release its persistent storage reference. If any of these steps hang, the Pod stays in Terminating state.

#### Step-by-Step Resolution

1. **Step 1 -** Check if the Pod process is actually stopping. kubectl describe pod pod-name shows the termination grace period. If the application is not handling SIGTERM, it runs until SIGKILL after the grace period. A very long terminationGracePeriodSeconds (30 minutes) means Kubernetes waits that long before force-killing.

2. **Step 2 -** Check for stuck finalizers. kubectl get pod pod-name -o json | jq '.metadata.finalizers'. If there are finalizers (like kubernetes.io/pv-protection), the Pod cannot be deleted until the finalizer controller processes it. A broken controller means stuck finalizers.

3. **Step 3 -** Check for volume detach issues. kubectl describe pod shows volume mount/unmount events. If a PVC volume cannot be unmounted (because the node is unreachable or the storage driver is stuck), the Pod hangs in Terminating.

4. **Step 4 -** For stuck on unreachable node. If the node is gone and the Pod is stuck Terminating because kubelet cannot acknowledge the delete, force-delete: kubectl delete pod pod-name --grace-period=0 --force. Warning: this removes the Pod from the API server but does not guarantee the container stopped. If the node comes back, you might have two copies of the Pod running - a split-brain scenario. For StatefulSets with volume dependencies, verify the volume is detached before starting the replacement Pod.

#### When to Force Delete

Force deletion is a last resort for StatefulSets because it can cause data corruption if two Pods try to mount the same volume simultaneously. Only force-delete when you are certain the original node is permanently unreachable and will not come back. For cloud environments, terminate the node instance first to ensure the volume detaches.

### Q100: Cluster costs doubled overnight - audit and optimize

#### Step-by-Step Audit

1. **Step 1 -** Check for unexpected node scaling. kubectl get nodes. If the Cluster Autoscaler provisioned many new nodes, find out why. Check pending Pods: kubectl get pods --all-namespaces --field-selector status.phase=Pending. Something created many Pods that triggered scaling.

2. **Step 2 -** Check for runaway workloads. kubectl get pods --all-namespaces | wc -l. Compare with expected count. Look for namespaces with unexpectedly high Pod counts. A misconfigured CronJob creating thousands of Pods, or a test Deployment scaled to 100 replicas, can trigger massive node scaling.

3. **Step 3 -** Check resource requests vs usage. Use kubectl top nodes and kubectl top pods to compare actual usage with requested resources. If nodes are 80% requested but only 20% utilized, workloads are over-provisioned. VPA recommendations can identify right-sizing opportunities.

4. **Step 4 -** Check for idle resources. Look for Deployments with zero traffic, PersistentVolumes that are not mounted, LoadBalancer Services with no traffic, and node groups that are oversized. Each cloud LoadBalancer costs $15-20/month. Unused PVs cost storage fees indefinitely.

5. **Step 5 -** Use cost attribution tools. Kubecost or OpenCost break down costs by namespace, deployment, and label. This identifies which team or application is responsible for the cost increase.

#### Quick Wins

1. Right-size resource requests based on actual usage (VPA recommendations). 2) Use spot/preemptible nodes for fault-tolerant workloads (60-80% savings). 3) Set Cluster Autoscaler to scale down aggressively for non-production clusters. 4) Delete unused PVs and Load Balancers. 5) Shut down development clusters outside business hours.

### Q101: Namespace deletion blocked by finalizers - safe cleanup

#### What Happened

You ran kubectl delete namespace my-namespace but it has been stuck in Terminating for hours. The namespace will not delete because resources inside it have finalizers that are not being processed.

#### Step-by-Step Resolution

1. **Step 1 -** Find what is blocking deletion. kubectl get all -n my-namespace shows remaining resources. Check for resources with finalizers: kubectl api-resources --verbs=list -o name | xargs -I {} kubectl get {} -n my-namespace - o json 2>/dev/null | jq -r'.items[] | select(.metadata.finalizers!= null) |.kind+"/" +.metadata.name'

2. **Step 2 -** Identify stuck finalizers. Common culprits: CRD instances with operator-managed finalizers (the operator is already deleted), PVCs with kubernetes.io/pv-protection, and Service instances with loadbalancer finalizers (the cloud provider cleanup is stuck).

3. **Step 3 -** For operator-managed finalizers. If the operator that manages the finalizer was deleted before the CRD instances, the finalizer will never be processed. Manually remove the finalizer: kubectl patch resource -name -n my-namespace --type json -p '[{"op": "remove", "path": "/metadata/finalizers"}]'

4. **Step 4 -** For stuck PVC/PV finalizers. If a PV is bound to a PVCin the namespace, delete the PVC first. If the PV is stuck, remove its finalizer. If the underlying cloud volume is already deleted, removing the finalizer is safe.

5. **Step 5 -** For cloud resource cleanup failures. LoadBalancer Services create cloud load balancers. If the cloud API is failing (permissions changed, API error), the cleanup finalizer hangs. Check cloud provider logs, fix permissions, and retry. If the cloud resource was already manually deleted, removing the finalizer is safe.

6. **Step 6 -** Nuclear option. If nothing works and you understand the consequences, you can force -delete the namespace by removing its finalizer through the API directly: kubectl get namespace my-namespace -o json | jq '.spec.finalizers = []' | kubectl replace --raw "/api/v1/namespaces/my-namespace/finalize" -f -. This bypasses all finalizer processing and immediately deletes the namespace.

#### Prevention

Always delete CRD instances before deleting the operator. Always delete PVCs before deleting the namespace. Always check for LoadBalancer Services and their cloud resources before namespace deletion. Runa pre-deletion script that verifies all cleanup controllers are running before triggering the delete.

### Q102: Admission webhook blocking ALL deployments cluster-wide

#### What Happened

A validating or mutating webhook is failing (crashing, unreachable, timing out). Because the webhook is configured with failurePolicy: Fail and matches all resource types, every create and update request to the API server is being rejected. No new Pods can be created. No Deployments can be updated. The cluster is effectively frozen.

#### Step-by-Step Resolution

1. **Step 1 -** Identify the failing webhook. kubectl get validatingwebhookconfigurations and kubectl get mutatingwebhookconfigurations. Look for webhooks that match broadly (rules matching all resources or all API groups).

2. **Step 2 -** Check if the webhook Service is running. The webhook endpoint is a Service pointing to Pods. If those Pods are crashed (ironic - they might have been affected by the outage they caused), the webhook cannot respond and all matching requests fail.

3. **Step 3 -** Emergency fix - delete or patch the webhook. If the webhook is blocking everything, delete it: kubectl delete validatingwebhookconfiguration webhook-name. If you cannot delete it (the delete operation itself is blocked by another webhook), use the API directly: kubectl patch validatingwebhookconfigu ration webhook-name --type=json -p='[{"op": "replace", "path": "/webhooks/0/failurePolicy", "value": "Ignore"}]'

4. **Step 4 -** Fix the root cause. Restore the webhook's backing Pods. Verify the webhook Service and endpoint are healthy. Check webhook certificate expiration - webhook TLS certificates expire and if not rotated, the API server cannot connect.

5. **Step 5 -** Redeploy the webhook with safety guards. Set failurePolicy: Ignore for non-critical webhooks. Set timeoutSeconds to 5 (default is 10). Exclude the kube-system namespace so system components are never blocked. Add namespaceSelector to limit scope to only namespaces that need the policy.

#### Prevention

Always set failurePolicy: Ignore for webhooks during initial rollout. Only switch to Fail after the webhook is proven stable. Always exclude kube-system and critical namespaces. Always set short timeouts. Monitor webhook latency and error rates. This scenario is one of the most dangerous in Kubernetes because it can make the cluster completely unmanageable.

### Q103: Certificate expired - kubelet can't talk to API server

#### What Happened

The kubelet's client certificate or the API server's serving certificate has expired. The kubelet cannot authenticate to the API server. The node appears NotReady. Pods on the node continue running but cannot be managed - no new scheduling, no health monitoring, no log access.

#### Step-by-Step Resolution

1. **Step 1 -** Confirm certificate expiration. SSH to the affected node. Check kubelet logs: journalctl -u kubelet | grep -i certificate. Look for messages like 'x509: certificate has expired' or 'tls: bad certificate.'

2. **Step 2 -** Check certificate dates. openssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -dates shows the expiration date. Check all certificates in /etc/kubernetes/pki/ on control plane nodes.

3. **Step 3 -** For kubelet client certificates. If kubelet certificate rotation is enabled (rotateCertificates: true in kubelet config, which is default since 1.19), the kubelet should auto-renew. If it failed, the CSR might be pending approval. Check kubectl get csr for pending requests and approve them: kubectl certificate approve csr-name.

4. **Step 4 -** For control plane certificates. On kubeadm clusters, run kubeadm certs check-expiration to see all certificate expiration dates. Renew with kubeadm certs renew all. Restart control plane components after renewal.

5. **Step 5 -** For managed Kubernetes (EKS/GKE/AKS). Control plane certificates are managed by the cloud provider. Node certificates are rotated automatically. If a node's certificate is expired, the simplest fix is to terminate and replace the node - the new node gets fresh certificates.

#### Prevention

Monitor certificate expiration dates. Alert 30 days before expiry. Enable automatic certificate rotation for kubelets. On kubeadm clusters, set up a CronJob or external alerting to check kubeadm certs check-expiration monthly. On managed services, ensure node auto-upgrade is enabled to get fresh certificates with new nodes.

### Q104: Node drain killing Pods despite PDB configured

#### What Happened

You have a PDB with minAvailable: 2 and 3 replicas. You drain a node and expected the drain to wait fora replacement Pod to be healthy before evicting. Instead, the drain killed a Pod and the application had fewer than 2 replicas momentarily.

#### Common Causes

- **Cause 1 -** PDB selector does not match the Pod labels. The PDB selects Pods by label. If the labels do not match, the PDB does not protect those Pods. Verify with kubectl get pdb -o yaml and compare the selector with your Pod labels.

- **Cause 2 -** The drain used --disable-eviction or --force. The --force flag deletes Pods directly instead of using the eviction API. Direct deletion bypasses PDB checks entirely. The --disable-eviction flag also bypasses PDB. Only the eviction API respects PDBs.

- **Cause 3 -** Only one replica existed on the drained node. If all 3 replicas are on the same node (no pod anti-affinity), draining that node must evict all of them. The PDB allows evicting one at a time, waiting for replacement, but if the replacement also schedules to the same node (which is being drained), it enters a deadlock. The drain eventually times out and force -evicts.

- **Cause 4 -** The PDB has maxUnavailable: 1 but the Pod is already unhealthy. If one of your 3 Pods is already failing readiness probes, the PDB considers 2 Pods available. With minAvailable: 2, no evictions are allowed because evicting another would drop below 2. The drain hangs. An operator might force -drain to unblock the cluster upgrade.

#### The Fix

Use pod anti-affinity to spread replicas across nodes. Set PDB appropriately for the actual replica count. Never use --force or --disable-eviction on production drains. Monitor PDB status with kubectl get pdb to see how many disruptions are allowed.

### Q105: API server overloaded - slow kubectl, timeouts everywhere

#### Symptoms

kubectl commands take 30+ seconds or timeout. Pods are not being scheduled. Controller loops are lagging - Deployments are not scaling, ReplicaSets are not creating Pods. The control plane is unresponsive.

#### Step-by-Step Diagnosis

1. **Step 1 -** Check API server metrics. Look at apiserver_request_duration_seconds for high latency, apiserver_current_inflight_requests for request queuing, and apiserver_request_total for error rates. If etcd latency is high, the bottleneck is etcd, not the API server.

2. **Step 2 -** Identify heavy clients. API server audit logs show which clients are making the most requests. Common culprits: a custom controller with a bug causing rapid list/watch loops, a monitoring tool scraping the API server too aggressively, or a CI/CD system running kubectl get in a tight loop.

3. **Step 3 -** Check for expensive list operations. kubectl get pods --all-namespaces in a cluster with 50,000 Pods generates a massive response. List operations without field selectors or label selectors on large resource collections are the most common cause of API server overload.

4. **Step 4 -** Check etcd performance. If etcd fsync latency is above 10ms, the API server cannot write state quickly. Check etcd disk I/O, check for etcd leader elections (which cause brief pauses), and verify etcd is running on SSD storage.

#### Immediate Mitigation

Enable API Priority and Fairness (APF) to prevent one client from starving others. Rate -limit or pause the offending client. Increase API server resources (CPU, memory). Scale up to multiple API server replicas behind a load balancer.

#### Prevention

Use informers and watches in controllers instead of list operations. Enable API Priority and Fairness to protect against misbehaving clients. Monitor API server latency percentiles and alert on p99 above 1 second. Regularly review audit logs for heavy API consumers.

### Q106: Pod resolves internal DNS but not external DNS

#### Symptoms

kubectl exec into a Pod: nslookup kubernetes.default succeeds but nslookup google.com fails or times out.

#### Step-by-Step Debugging

1. **Step 1 -** Check CoreDNS upstream forwarding. CoreDNS forwards external queries to upstream DNS servers. Check the CoreDNS ConfigMap: kubectl get configmap coredns -n kube-system -o yaml. Look at the forward block - it should forward to the node's DNS or a specific upstream (like 8.8.8.8).

2. **Step 2 -** Check if CoreDNS Pods can reach upstream DNS. kubectl exec into a CoreDNS Pod and test: nslookup google.com 8.8.8.8. If this fails, CoreDNS itself cannot reach external DNS - the issue is network-level.

3. **Step 3 -** Check node DNS resolution. SSH to the node and test: nslookup google.com. If the node cannot resolve external DNS, the problem is node-level DNS configuration, not Kubernetes.

4. **Step 4 -** Check NetworkPolicies. If a NetworkPolicy blocks egress from the Pod's namespace, DNS queries to CoreDNS (in kube-system namespace) and CoreDNS queries to upstream DNS might be blocked. Verify that egress to kube-dns Service on port 53 is allowed, and that CoreDNS has egress to upstream DNS servers.

5. **Step 5 -** Check firewall / security groups. Cloud security groups or on-premises firewalls might block outbound DNS (UDP/TCP port 53) from the node or Pod network.

### Q107: Helm release stuck in pending-upgrade state

#### What Happened

A Helm upgrade was interrupted (CI pipeline timeout, terminal closed, network issue). The release is now stuck in a pending-upgrade state. Further helm upgrade commands fail with 'another operation is in progress. '

#### Step-by-Step Resolution

1. **Step 1 -** Check release status. helm history my-release shows all revisions and their status. Look for a revision with status pending-upgrade.

2. **Step 2 -** Rollback to the last successful revision. helm rollback my-release REVISION _ NUMBER where the revision number is the last one with status deployed. This marks the pending revision as superseded and restores the previous state.

3. **Step 3 -** If rollback fails. In rare cases the release is so corrupted that rollback also fails. Delete the release's Secret (Helm 3 stores state in Secrets): kubectl get secrets -n namespace -l owner=helm. Delete the pending-upgrade Secret and retry the upgrade.

4. **Step 4 -** If nothing works. helm uninstall my-release --keep-history followed by helm upgrade --install. The -- keep-history preserves the history for auditing.

#### Prevention

Always use --timeout and --wait in CI/CD Helm commands. Use --atomic which automatically rolls back on failure. Monitor Helm release status and alert on non-deployed states. Never interrupt a Helm upgrade manually - let it timeout and fail cleanly.

### Q108: PV data from staging accidentally mounted in production

#### What Happened

A PersistentVolume with staging data was reclaimed (Retain policy) when staging was torn down. When production requested a PVC with matching specs, Kubernetes bound it to the old staging PV. Production is now running with staging data - wrong database content, wrong configuration, wrong certificates.

#### Step-by-Step Response

1. **Step 1 -** Immediately stop the affected workload. Scale down the Deployment to prevent further reads and writes to the wrong data.

2. **Step 2 -** Verify the PV provenance. kubectl describe pv pv-name shows the PV's claimRef history, creation time, and labels. Confirm it was previously bound to the staging namespace.

3. **Step 3 -** Create a correct PV for production. Restore production data from the most recent backup. Provision a new PV with the correct data. Update the PVC or create a new one bound to the correct PV.

4. **Step 4 -** Clean up the staging PV. Delete or relabel the staging PV so it cannot be accidentally bound again.

#### Prevention

Use StorageClass reclaimPolicy: Delete for non-critical environments (staging, dev) so volumes are automatically cleaned up. For critical environments, label PVs with environment tags and use a validating webhook to prevent cross-environment PV binding. Use unique StorageClasses per environment. Never leave Retained PVs in Available state - either re-bind them intentionally or delete them.

### Q109: CronJob creating thousands of completed Pods filling etcd

#### What Happened

A CronJob runs every minute and creates a new Job (and Pod) each time. The default successfulJobsHistoryLimit is 3 and failedJobsHistoryLimit is 1, but someone set them to very high values (or used an older Kubernetes version with different defaults). After months, thousands of completed Jobs and their Pods are cluttering the namespace, slowing API responses, and filling etcd.

#### Step-by-Step Resolution

1. **Step 1 -** Clean up old Jobs. kubectl delete jobs -n namespace --field-selector status.successful=1 deletes all successful completed Jobs. For failed jobs: kubectl delete jobs --field-selector status.successful=0.

2. **Step 2 -** Set proper history limits. Update the CronJob: successfulJobsHistoryLimit: 3 and failedJobsHistoryLimit: 1. Kubernetes automatically cleans up old Jobs beyond these limits.

3. **Step 3 -** Set TTL on finished Jobs. spec.ttlSecondsAfterFinished: 3600 on the Job template automatically deletes the Job and its Pod 1 hour after completion. This is the most reliable cleanup mechanism.

4. **Step 4 -** If etcd is full. Run etcd compaction and defragmentation (see Q92). Delete old Events: kubectl delete events --all-namespaces --field-selector reason=Completed.

#### Prevention

Always set successfulJobsHistoryLimit and failedJobsHistoryLimit on every CronJob. Always set ttlSecondsAfterFinished on Job templates. Monitor etcd database size and total Job count. A CronJob running every minute creates 43,200 Jobs per month - without cleanup, this fills etcd in weeks.

### Q110: Container running as root despite Pod Security enforced

#### What Happened

Pod Security Admission is enforced at the Restricted level on the namespace, which requires runAsNonRoot: true. Yet a container is somehow running as root inside the Pod.

#### How This Happens

- **Cause 1 -** The PSA label is set to audit or warn, not enforce. Check: kubectl get namespace my-namespace -o yaml. The label must be pod-security.kubernetes.io/enforce: restricted. If it says audit or warn, the policy is only logging violations, not blocking them.

- **Cause 2 -** The Pod was created before the label was applied. PSA only checks Pods at creation time. Pods that were already running when the label was added are not retroactively evaluated. They continue running with their original security context.

- **Cause 3 -** The container image has USER root baked in. The Pod spec has runAsNonRoot: true, but the container image's Dockerfile has USER root. Kubernetes checks if the container would run as root and rejects it - but if the image does not specify a user at all, the default is root (UID 0). Some images set the user in the ENTRYPOINT script rather than the Dockerfile, bypassing the Kubernetes check.

- **Cause 4 -** The Pod is in a namespace exempt from PSA. Certain namespaces (kube-system, kube-public) may be exempt from PSA enforcement. Pods deployed there are not subject to the policy.

- **Cause 5 -** A mutating webhook removed the security context. A misconfigured mutating webhook might strip the security context from Pods before the PSA validating admission check runs. Mutating webhooks run before validating webhooks, so the modified Pod passes validation without the intended security settings.

#### Step-by-Step Fix

1. **Step 1 -** Verify the PSA label is enforce, not audit. kubectl label namespace my-namespace pod-security.kubernetes.io/enforce=restricted --overwrite

2. **Step 2 -** Restart existing Pods. Delete and recreate Pods that were running before the label was applied. They will be re-evaluated against the new policy on creation.

3. **Step 3 -** Fix the container image. Ensure the Dockerfile includes a non-root USER instruction. Set runAsUser explicitly in the Pod security context to a specific non-zero UID.

4. **Step 4 -** Audit mutating webhooks. Review all mutating webhooks to ensure none are stripping security context fields.

#### Prevention

Apply PSA labels with enforce from the start, not after workloads are deployed. Use kubectl label --dry-run=server to test the impact before applying. Run a policy engine (Kyverno/Gatekeeper) alongside PSA for defense-in-depth. Scan all container images for non-root compliance before pushing to the registry.

## Interview Tips - How to Use This Guide

#### For Junior Roles

Focus on Q1-Q25. Be able to explain Pods, Deployments, Services, ConfigMaps, and the basic debugging flow (describe > logs > exec). Understand the difference between requests and limits, liveness and readiness probes, and StatefulSet vs Deployment. Know how to debug Pending, CrashLoopBackOff, and Image PullBackOff.

#### For Mid-Level Roles

Q1-Q55 should be solid. Be ready to discuss RBAC, NetworkPolicies, HPA, Helm, GitOps, and security contexts. Know the trade-offs between Kustomize and Helm. Have a real story about a production Kubernetes incident you debugged. Understand the complete monitoring and logging stack.

#### For Senior Roles

All 110 questions. The architecture internals (etcd, API server, scheduler, CRI), multi-cluster strategies, security hardening, Karpenter, and progressive delivery separate senior from mid-level. Be ready to discuss operators, service meshes, FinOps, and cluster upgrades. Know the trade-offs between EKS, GKE, and AKS.

#### For Scenario Questions

These are your differentiators. When asked about a stuck Pod, do not just guess the answer. Walk through: kubectl describe > events > check resources/taints/PVC > check node conditions > check logs > check probes. Methodical debugging impresses interviewers far more than guessing.

## Quick Reference Cheat Sheet

| Topic | Key point |
| --- | --- |
| Pod Pending | Check resources, taints, PVC, affinity, Cluster Autoscaler. `kubectl describe` shows the reason. |
| CrashLoopBackOff | Check `logs --previous`, exit code, environment variables, and dependencies. 137 = OOM; 127 = command not found. |
| ContainerCreating | Different from Pending. Check volume mounts, Secrets/ConfigMaps, and the CNI plugin. |
| ImagePullBackOff | Check image name/tag, registry authentication, network, and rate limits. |
| Requests vs Limits | Requests = scheduling. Limits = ceiling. Always set requests. CPU limits cause throttling. |
| Liveness vs Readiness | Liveness restarts. Readiness removes from traffic. Never confuse them. |
| Startup probe | Use for slow-starting applications. Disables liveness until startup completes. |
| Service no endpoints | Labels mismatch. Check the selector against Pod labels first - this is the cause about 70% of the time. |
| Rolling update 503s | Use `preStop` sleep 10 + SIGTERM handling + failed readiness during shutdown. |
| HPA not working | Needs metrics-server and resource requests. CPU percentage is relative to requests. |
| HPA flapping | Set `stabilizationWindowSeconds: 300`, rate-limit scale-down, and widen the target. |
| Karpenter | Next-generation node provisioner. Replaces Cluster Autoscaler plus node groups. AWS-native. |
| StatefulSet | Ordered deployment, stable identity, and persistent storage per Pod. |
| NetworkPolicies | Default-deny once any policy is applied. Needs CNI support. Map all traffic first. |
| RBAC | Use least privilege and dedicated ServiceAccounts. Never use `cluster-admin` in automation. |
| Security Context | Use `runAsNonRoot`, `readOnlyRootFilesystem`, and drop all capabilities as a production baseline. |
| etcd | Back up hourly. Monitor size. Compact and defragment. It is the single most critical component. |
| Cluster upgrades | Upgrade one minor version at a time. Check deprecations, upgrade operators first, and back up etcd. |
| DNS issues | Deploy NodeLocal DNSCache. Set `ndots:1` for external workloads. Scale CoreDNS. |
| Webhooks | Use `failurePolicy: Ignore` initially. Exclude `kube-system`. Use short timeouts. |
| PVC Pending | Check StorageClass, CSI driver, volume quota, and `WaitForFirstConsumer`. |
| Secrets | Base64 is not encryption. Enable encryption at rest. Use ESO for external stores. |
| Helm stuck | Run `helm rollback` to the last deployed revision. Use `--atomic` in CI. |
| Namespace stuck | Find resources with finalizers. Remove them only after verifying cleanup. |
| Cost optimization | Right-size with VPA, use spot nodes, delete unused resources, and shut down non-production at night. |
| GitOps | Use ArgoCD or Flux. Git is the source of truth. Do not run `kubectl apply` from laptops in production. |
| Progressive delivery | Use Argo Rollouts or Flagger for automated canaries with metric-based promotion. |
| Audit logging | Log who did what and when. Exclude Secret values from `RequestResponse` level. |
| Pod anti-affinity | Spread replicas across nodes. Required for production availability. |
| Gateway API | Successor to Ingress. Role-oriented with better routing expressiveness. |
