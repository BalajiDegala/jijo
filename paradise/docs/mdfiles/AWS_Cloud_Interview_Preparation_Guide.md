# AWS Cloud Interview Preparation Guide

> Converted from the supplied PDF using OCR. Formatting was normalized for Markdown readability.

## Question Index - All 130 Questions

### Section 1 - Junior Core AWS

- Q1: Cloud computing fundamentals - IaaS, PaaS, SaaS, shared responsibility
- Q2: AWS global infrastructure - Regions, AZs, Edge Locations
- Q3: EC2 - instance types, families, AMIs, key pairs, security groups, user data
- Q4: EC2 pricing - On-Demand, Reserved, Spot, Savings Plans
- Q5: EBS - volume types, snapshots, encryption
- Q6: EFS - shared file storage
- Q7: S3 - buckets, objects, storage classes, lifecycle, versioning
- Q8: S3 security - bucket policies, Block Public Access, encryption
- Q9: IAM - users, groups, roles, policies, least privilege
- Q10: IAM policies - JSON structure, Effect/Action/Resource, conditions
- Q11: VPC - subnets, route tables, internet gateway, NAT gateway
- Q12: VPC Endpoints - Gateway vs Interface (PrivateLink)
- Q13: Security Groups vs NACLs - stateful vs stateless
- Q14: Elastic IP - static public IPs
- Q15: Route 53 - DNS hosting, routing policies, health checks
- Q16: RDS - engines, Multi-AZ, read replicas, backups
- Q17: DynamobDB - partition keys, sort keys, capacity modes, GSI/LSI
- Q18: ELB - ALB vs NLB vs CLB vs GWLB
- Q19: Auto Scaling Groups - launch templates, scaling policies
- Q20: CloudWatch - metrics, alarms, logs, dashboards
- Q21: CloudTrail - API activity logging
- Q22: SNS and SQS - pub/sub, queues, DLQ, FIFO
- Q23: Lambda - triggers, concurrency, cold starts, timeout
- Q24: ACM - TLS certificates
- Q25: CloudFormation - stacks, templates, change sets
- Q26: AWS CLI - profiles, credentials chain
- Q27: Tags and cost allocation
- Q28: ECS - task definitions, Fargate vs EC2, task roles
- Q29: ECR - container registry, lifecycle, scanning
- Q30: EKS - managed Kubernetes
- Q31: Elastic Beanstalk - managed platform
- Q32: Systems Manager - SSM Agent, Session Manager, Parameter Store
- Q33: AWS Backup - centralized backup
- Q34: Service Quotas - limits that break production
- Q35: Trusted Advisor
- Q36: Well-Architected Framework - 6 pillars

### Section 2 - Mid-Level AWS Deep Dives

- Q37: VPC advanced - peering, Transit Gateway, PrivateLink, VPN, Direct Connect
- Q38: IAM advanced - assume role, cross-account, permission boundaries
- Q39: IAM Identity Center (SSO) - federation, SAML, OIDC, ABAC
- Q40: S3 advanced - presigned URLs, CRR, event notifications Presigned URLs
- Q41: S3 performance optimization
- Q42: EC2 advanced - placement groups, ENI, instance store, Nitro, IMDSv2
- Q43: EBS advanced - IOPS, multi-attach, fast snapshot restore
- Q44: RDS advanced - Aurora Serverless v2, RDS Proxy, Performance Insights
- Q45: ElastiCache - Redis vs Memcached
- Q46: CloudFront - CDN, Lambda@Edge, Functions
- Q47: API Gateway - REST vs HTTP API
- Q48: Lambda advanced - layers, VPC, provisioned concurrency, SnapStart
- Q49: Step Functions - state machines
- Q50: ECS advanced - service discovery, awsvpc, ECS Exec
- Q51: EKS advanced - IRSA, Pod Identity, Karpenter IRSA (IAM Roles for Service Accounts)
- Q52: Secrets Manager vs Parameter Store
- Q53: KMS - key management
- Q54: Organizations - SCPs, OUs
- Q55: Control Tower - landing zone
- Q56: Config - rules, remediation
- Q57: CloudWatch advanced - Logs Insights, Container Insights Logs Insights
- Q58: EventBridge - event-driven architecture
- Q59: Kinesis - real-time streaming
- Q60: Global Accelerator
- Q61: VPC flow logs, Route 53 Resolver, hybrid DNS VPC Flow Logs
- Q62: Cost optimization - RI, Savings Plans, Spot, right-sizing The Optimization Playbook
- Q63: DR strategies - RPO/RTO
- Q64: Multi-account strategy The Standard OU Structure
- Q65: IaC on AWS - CloudFormation vs CDK vs Terraform
- Q66: CI/CD on AWS - CodePipeline, CodeBuild, CodeDeploy
- Q67: Serverless architecture patterns
- Q68: Container networking on AWS
- Q69: WAF - Web Application Firewall
- Q70: Shield - DDoS protection
- Q71: GuardDuty - threat detection
- Q72: Security Hub - findings aggregation
- Q73: Inspector and Macie
- Q74: Observability - X-Ray, OpenTelemetry, Managed Grafana X-Ray
- Q75: Database selection guide

### Section 3 - Senior Architecture & Scale

- Q76: Multi-region architecture
- Q77: High availability patterns The Layered Approach
- Q78: Data lake on AWS The Architecture
- Q79: Container security on AWS Defense in Depth
- Q80: Serverless at scale
- Q81: Networking at scale - Transit Gateway, RAM, centralized egress
- Q82: Security architecture - defense in depth The Layers
- Q83: FinOps - cost governance
- Q84: Migration strategies - 7 Rs The 7 Rs
- Q85: Hybrid cloud - Direct Connect, Outposts, EKS Anywhere
- Q86: AWS vs GCP vs Azure - decision framework
- Q87: AWS networking deep dive - DNS resolution, flow log analysis VPC DNS Resolution
- Q88: Compliance - Config rules, audit, encryption
- Q89: Event-driven architecture patterns
- Q90: Design a highly available 3-tier architecture The Architecture

### Section 4 - Tricky AWS Scenarios

- Q91: EC2 instance unreachable - systematic debugging
- Q92: S3 bucket accidentally made public - incident response
- Q93: RDS running out of storage
- Q94: Lambda timing out
- Q95: AWS bill doubled - audit and optimize
- Q96: Cross-account assume role not working
- Q97: VPC cannot reach the internet
- Q98: ALB returning 502
- Q99: ECS task keeps restarting
- Q100: EKS Pods stuck Pending
- Q101: CloudFormation stuck UPDATE_ROLLBACK_FAILED
- Q102: S3 lifecycle deleted production data
- Q103: IAM policy too permissive - security audit
- Q104: Route 53 failover not triggering
- Q105: Auto Scaling not launching instances
- Q106: DynamoDB throttling - hot partition
- Q107: KMS key scheduled for deletion
- Q108: CloudWatch alarm not firing
- Q109: Security Group rule limit reached
- Q110: VPC peering traffic not flowing
- Q111: Lambda concurrency limit - throttling production
- Q112: EBS stuck in attaching state
- Q113: EC2 terminated by ASG during deployment
- Q114: RDS Multi-AZ failover caused downtime
- Q115: S3 503 Slow Down
- Q116: Transit Gateway routing loop
- Q117: AWS credentials leaked on GitHub
- Q118: ECS Fargate cannot pull from ECR
- Q119: CloudFront serving stale content
- Q120: SQS messages processed twice
- Q121: RDS read replica lag
- Q122: EC2 in private subnet cannot reach S3
- Q123: GuardDuty - crypto mining detected
- Q124: EKS cluster upgrade broke workloads
- Q125: Lambda in VPC cannot reach DynamoDB
- Q126: AWS account compromised - root access
- Q127: NAT Gateway costs $500/month - optimize
- Q128: API Gateway 429 during product launch
- Q129: DynamoDB scan consuming all capacity
- Q130: EC2 instance store data lost after stop/start

## Section 1 - Junior Core AWS

### Q1: Cloud computing fundamentals - IaaS, PaaS, SaaS, shared responsibility

#### The Simple Answer

Cloud computing delivers computing resources over the internet ona pay-as-you-go basis. Instead of buying and maintaining physical servers, you rent capacity from a cloud provider. Three service models define how much the provider manages versus how much you manage.

**The Analogy** - Housing

IaaS (Infrastructure as a Service) is like renting an empty apartment - you get walls, plumbing, and electricity, but you furnish it, maintain it, and lock the doors yourself. AWS EC2 is IaaS. You get a virtual machine and manage everything from the OS upward.

PaaS (Platform as a Service) is like a serviced apartment - furniture included, cleaning provided, you just live in it. AWS Elastic Beanstalk or Lambda is PaaS. You deploy your code and the platform handles the infrastructure.

SaaS (Software as a Service) is like a hotel - everything is managed, you just show up and use it. Gmail, Slack, Salesforce are SaaS. You use the application; the provider manages everything.

#### Shared Responsibility Model

**AWS is responsible for security OF the cloud** - physical data centers, hardware, hypervisor, network infrastructure. You are responsible for security IN the cloud - your data, IAM configuration, OS patching, firewall rules, encryption settings. The division shifts depending on the service: with EC2 you manage the OS, with RDS you manage database users, with Lambda you only manage your code and permissions.

The interview trap: "Who is responsible for patching the OS on an EC2 instance?" You are. "Who is responsible for patching RDS?" AWS patches the database engine; you manage database users and network access. The answer changes per service.

### Q2: AWS global infrastructure - Regions, AZs, Edge Locations

#### The Simple Answer

AWS infrastructure is organized in Regions (geographic areas like us-east-1, eu-west-1), each containing multiple Availability Zones (isolated data centers within a region), and Edge Locations (CDN points of presence for CloudFront).

#### Why This Matters

**Regions** - Choose based on latency (close to users), compliance (data residency laws), service availability (not all services in all regions), and cost (prices vary by region). us-east-1 is the cheapest and has the most services. It is also where most global services (IAM, Route 53, CloudFront) have their control plane.

**Availability Zones** - Each AZ is one or more physically separate data centers with independent power, networking, and cooling. Designing across multiple AZs provides high availability - if one AZ goes down, the others continue operating. This is the foundation of AWS HA design.

**Edge Locations** - 400+ locations worldwide for CloudFront CDN, Route 53 DNS, and AWS WAF. Much more numerous than regions. They cache content close to end users to reduce latency.

**Local Zones** - Extensions of regions placed in large cities for ultra-low latency. Used for real-time gaming, video rendering, and ML inference.

Production rule: Never deploy production workloads in a single AZ. Always use at least 2 AZs. Use 3 AZs for critical workloads. This is the single most important AWS architecture decision.

### Q3: EC2 - instance types, families, AMIs, key pairs, security groups, user data

#### The Simple Answer

EC2 (Elastic Compute Cloud) provides virtual machines in the cloud. You choose an instance type (CPU, memory, network), an AMI (operating system image), configure security (key pairs for SSH, security groups for firewall), and optionally pass user data (a script that runs on first boot).

#### Instance Families

General purpose (M, T) - Balanced CPU/memory. M6i for steady workloads. T3 for burstable workloads (web servers, dev environments). T instances have CPU credits - they burst above baseline and throttle when credits are exhausted.

**Compute optimized (C)** - High CPU. Batch processing, scientific modeling, gaming servers, machine learning inference.

Memory optimized (R, X) - High memory. Databases, in-memory caches, real-time analytics. Storage optimized (1, D) - High sequential |/O. Data warehousing, distributed file systems. Accelerated computing (P, G) - GPUs. Machine learning training (P instances), graphics rendering (G instances).

#### AMIs

An AMI (Amazon Machine Image) is a template containing the OS, applications, and configuration. You can use

AWS-provided AMIs (Amazon Linux, Ubuntu), marketplace AMIs (with pre-installed software), or custom AMIs (your own golden images). Custom AMIs are essential for fast, consistent deployments - bake your application and dependencies into an AMI rather than installing them via user data on every launch.

#### User Data

A script (bash or cloud-init) that runs once on first boot. Used for bootstrapping - installing packages, pulling configuration, starting services. Keep user data minimal - heavy installation should be baked into the AMI. User data failures are silent - the instance launches but the application may not work. Always check /var/log/cloud - init-output.log for errors.

#### Security Groups

**Virtual firewalls attached to instances. Stateful** - if you allow inbound traffic, the response is automatically allowed outbound. Default deny all inbound, allow all outbound. Specify rules by port, protocol, and source (IP range or another security group).

**Key pairs vs security groups** - the confusion: Key pairs authenticate SSH access (who can log in). Security groups control network access (which traffic reaches the instance). Both are needed for SSH: the security group must allow port 22, AND you must have the private key.

### Q4: EC2 pricing - On-Demand, Reserved, Spot, Savings Plans

#### The Simple Answer

**On-Demand** - Pay by the second with no commitment. Full flexibility. Full price. Use for unpredictable workloads, development, and testing.

**Reserved Instances** - Commit to 1 or 3 years for 30-72% discount. Standard Rls cannot change instance type. Convertible Rls can change type but give smaller discount. Best for steady-state production workloads.

**Savings Plans** - Commit to a dollar amount per hour for 1-3 years. More flexible than Rls - applies across instance families, regions, and even services (Lambda, Fargate). The modern replacement for Rls.

**Spot Instances** - Use spare AWS capacity at 60-90% discount. AWS can reclaim with 2-minute warning. Best for fault-tolerant workloads: batch processing, CI/CD runners, data analysis, and containerized stateless workloads.

**Dedicated Hosts** - Physical server dedicated to you. Required for some licensing models (Windows Server, Oracle). Most expensive option.

The cost optimization sequence: Start with On-Demand. Analyze usage after 1-2 months. Buy Savings Plans for stable baseline. Use Spot for fault-tolerant workloads. Reserved Instances only for specific instance type commitments.

### Q5: EBS - volume types, snapshots, encryption

#### The Simple Answer

EBS (Elastic Block Store) provides persistent block storage for EC2 instances. Unlike instance store (ephemeral), EBS data persists independently of the instance lifecycle. Volumes are AZ-specific - they can only attach to instances in the same AZ.

#### Volume Types

**gp3 (General Purpose SSD)** - Default choice. 3000 IOPS and 125 MB/s baseline included free. Provision more independently. Best for boot volumes, development, and most workloads.

**io2 Block Express** - High performance SSD. Up to 256,000 IOPS. For databases requiring consistent low-latency I/O (Oracle, SQL Server, high-end PostgreSQL).

**st1 (Throughput Optimized HDD)** - Sequential reads/writes. For data warehousing, log processing, big data. sc1 (Cold HDD) - Cheapest. Infrequent access. Archives, backups. Snapshots

Point-in-time backups stored in S3 (managed by AWS, not visible in yourS3 buckets). Incremental - only changed blocks are stored after the first snapshot. Can be copied across regions for DR. Can be shared across accounts. Use AWS Backup for automated snapshot management.

#### Encryption

EBS encryption uses AWS KMS keys. Enable by default in account settings - every new volume is encrypted automatically. Encryption is transparent to the instance - no performance penalty on modern Nitro instances. You cannot encryptan existing unencrypted volume directly - create an encrypted snapshot, then create anew volume from it.

### Q6: EFS - shared file storage

#### The Simple Answer

EFS (Elastic File System) provides shared NFS file storage that multiple EC2 instances, ECS containers, and Lambda functions can mount simultaneously. Unlike EBS (one instance per volume, usually), EFS supports thousands of concurrent connections.

#### When to Use EFS vs EBS vs S3

**EBS** - Single instance block storage. Databases, boot volumes. Highest performance. EFS - Shared file system. Multiple instances need the same files. CMS content, shared configs, machine learning training data. $3 - Object storage. Static assets, backups, data lakes. Not a filesystem - accessed via API, not file mounts.

#### Performance Modes

**General Purpose** - Default. Low latency. Good for most workloads. Max I/O - Higher throughput, slightly higher latency. Use for highly parallelized workloads with hundreds of instances.

#### Cost Optimization

EFS costs 3x more than EBS perGB. Use EFS Infrequent Access (IA) storage class for files not accessed for 30 days - saves 92%. Enable lifecycle management to automatically move files to IA.

### Q7: S3 - buckets, objects, storage classes, lifecycle, versioning

#### The Simple Answer

$3 (Simple Storage Service) is object storage with virtually unlimited capacity. You store objects (files) in buckets (containers). Each object has a key (path/filename), data (the file content), and metadata. $3 provides 99.999999999% (11 nines) durability - you will not lose data.

#### Storage Classes

**S3 Standard** - Frequently accessed data. Highest cost per GB. Lowest retrieval cost.

$3 Intelligent-Tiering - Automatically moves objects between access tiers based on usage patterns. No retrieval fees. Small monthly monitoring fee. Best when access patterns are unpredictable.

$3 Standard-IA - Infrequent access. Lower storage cost, higher retrieval cost. Minimum 30-day storage charge. $3 Glacier Instant Retrieval - Archive with millisecond retrieval. Minimum 90 days.

$3 Glacier Flexible Retrieval - Archive with minutes-to-hours retrieval. Minimum 90 days.

**S3 Glacier Deep Archive** - Cheapest. 12-48 hour retrieval. Minimum 180 days. Compliance archives.

#### Lifecycle Policies

Automatically transition objects between storage classes based on age. Example: Standard for 30 days -> Standard-lA for 60 days -> Glacier for 365 days -> Deep Archive after 7 years -> Delete after 10 years. Set these up for any bucket with growing data to control costs.

#### Versioning

When enabled, S3 keeps all versions of an object. Deleting an object adds a delete marker - previous versions still exist. Essential for protecting against accidental deletion and overwrites. Combined with lifecycle rules, old versions can be transitioned to cheaper storage or deleted after a retention period.

The cost trap: Versioning without lifecycle rules. Every version consumes storage. A 1GB file overwritten daily accumulates 365 GB of versions per year. Always pair versioning with lifecycle rules that expire old versions.

### Q8: S3 security - bucket policies, Block Public Access, encryption

#### The Simple Answer

S3 security operates at multiple layers: Block Public Access (account and bucket level kill switch), bucket policies (JSON policies controlling access), IAM policies (user/role level), ACLs (legacy, avoid), and encryption (SSE-S3, SSE-KMS, SSE-C).

#### Block Public Access

The first line of defense. Enabled by default on new buckets and accounts. Four settings that override any bucket policy or ACL that would make objects public. Always keep all four enabled unless you specifically need public access (static website hosting).

#### Bucket Policies

JSON policies attached to the bucket itself. Control access based on: who (Principal), what (Action like s3:GetObject), which objects (Resource with path patterns), and conditions (IP range, VPC endpoint, encryption requirement).

#### Encryption

**SSE-S3** - AWS manages keys entirely. Simplest. Default encryption. SSE-KMS - You control the KMS key. Key rotation, access policies, audit logs of key usage. Recommended for regulated data. SSE-C - You provide the encryption key with each request. AWS does not store the key. Rarely used.

The #1 S3 security incident: Accidentally making a bucket public. Prevention: enable Block Public Access at the account level. Use AWS Config rule s3-bucket-public-read-prohibited for continuous monitoring. See scenario Q92 for incident response.

### Q9: IAM - users, groups, roles, policies, least privilege

#### The Simple Answer

IAM (Identity and Access Management) controls who can do what in your AWS account. Users are identities for people. Groups organize users. Roles are identities for services and cross-account access. Policies are JSON documents defining permissions.

#### The Analogy - Office Building Security

Users are employee badges. Groups are department access cards (all engineers get server room access). Roles are temporary visitor passes (an EC2 instance gets a role to access S3 for the duration it is running). Policies are the rules posted on each door - who can enter, what they can do inside.

#### Key Principles

**Least privilege** - Grant only the permissions needed. Start with zero permissions and add as needed. Never start with AdministratorAccess and restrict later.

**Use roles over access keys** - EC2 instances, Lambda functions, and ECS tasks should use IAM roles (temporary credentials that rotate automatically). Never embed long-lived access keys in code or environment variables.

**Use groups for users** - Assign permissions to groups, add users to groups. Never attach policies directly to individual users - it becomes unmanageable at scale.

**Enable MFA** - Enforce MFA on all human users, especially the root account. The root account should have MFA, a strong password, and should almost never be used.

The root account rule: Use the root account only for tasks that require it (changing account settings, enabling certain features). Everything else should use IAM users or roles. The root account has no permission boundaries - it can do everything, including deleting the entire account.

### Q10: IAM policies - JSON structure, Effect/Action/Resource, conditions

#### The Simple Answer

An IAM policy is a JSON document with Statements. Each statement has: Effect (Allow or Deny), Action (what API calls - s3:GetObject, ec2:Runinstances), Resource (which specific resources - a specific bucket ARN, all EC2 instances), and optionally Condition (when the rule applies - from specific IP, with MFA, during business hours).

#### Policy Types

**Identity-based** - Attached to users, groups, or roles. Controls what the identity can do. Resource-based - Attached to resources (S3 bucket policy, SQS queue policy). Controls who can access the resource. Permission boundaries - Maximum permissions an identity CAN have. Does not grant - only restricts. SCPs - Organization- level maximum permissions for accounts. Does not grant - only restricts.

#### Evaluation Logic

Explicit Deny always wins -> then SCPs -> then Permission Boundaries -> then Identity and Resource policies -> default implicit Deny. If nothing explicitly allows, the action is denied.

The debugging tool: [AM Policy Simulator (policysim.aws.amazon.com) tests policies without making real API calls. Essential for debugging "why is this access denied."

### Q11: VPC - subnets, route tables, internet gateway, NAT gateway

#### The Simple Answer

A VPC (Virtual Private Cloud) is your private network in AWS. You define the IP range (CIDR block), create subnets across AZs, and control routing and access. Think of it as your own data center network in the cloud.

#### Key Components

**Subnets** - Subdivisions of the VPC in specific AZs. Public subnets have a route to an Internet Gateway. Private subnets do not - they access the internet through a NAT Gateway in a public subnet.

**Internet Gateway (IGW)** - Allows resources in public subnets to communicate with the internet. One per VPC. Highly available by default.

**NAT Gateway** - Allows resources in private subnets to reach the internet (for updates, API calls) without being directly accessible from the internet. Deployed in a public subnet. Charged per hour and per GB of data processed. One of the most expensive networking components - see scenario Q127.

**Route Tables** - Rules determining where traffic goes. Public subnet route table: local traffic to VPC, 0.0.0.0/0 to IGW. Private subnet: local to VPC, 0.0.0.0/0 to NAT Gateway.

#### The Standard VPC Design

3 public subnets (one per AZ) for load balancers and NAT gateways. 3 private subnets (one per AZ) for application servers. 3 isolated subnets (one per AZ) for databases (no internet access at all). This three -tier design is the foundation of most AWS architectures.

### Q12: VPC Endpoints - Gateway vs Interface (PrivateLink)

#### The Simple Answer

VPC Endpoints allow resources in your VPC to access AWS services without going through the internet. Traffic stays on the AWS network, improving security and reducing NAT Gateway costs.

#### Gateway Endpoints (Free)

Available for S3 and DynamoDB only. A route table entry that directs traffic to the service through the AWS network. No ENI created. Free to use. Always create these - there is no reason not to.

#### Interface Endpoints (PrivateLink)

Available for 100+ AWS services (and custom services). Creates an ENI in your subnet with a private IP. Traffic goes to the service through this private ENI. Costs $0.01/hour per endpoint per AZ plus data processing charges.

The cost optimization win: An EC2 instance in a private subnet accessing $3 through a NAT Gateway pays data processing charges on the NAT Gateway. Adding a free $3 Gateway Endpoint eliminates those charges entirely. For data-heavy workloads, this can save hundreds of dollars per month. See scenario Q122 and Q127.

### Q13: Security Groups vs NACLs - stateful vs stateless

#### The Simple Answer

**Security Groups** - Instance-level firewall. Stateful (if inbound is allowed, the response outbound is automatically allowed). Default: deny all inbound, allow all outbound. Rules are ALLOW only - no deny rules. Evaluated as a whole - all rules are checked.

**NACLs** - Subnet-level firewall. Stateless (inbound and outbound rules evaluated independently - you must explicitly allow response traffic). Default: allow everything. Rules have numbers - evaluated in order, first match wins. Supports both ALLOW and DENY rules.

#### When to Use Each

**Security Groups for most use cases** - simpler, stateful, instance-level. NACLs as an additional defense layer - blocking specific IP ranges, subnet-level deny rules. Most teams use Security Groups exclusively and only add NACLs for specific deny requirements.

The classic debugging trap: You add an inbound NACL rule allowing port 443 but forget the outbound rule for ephemeral ports (1024-65535). Security Groups handle this automatically (stateful). NACLs do not - you must add both directions.

### Q14: Elastic IP - static public IPs

#### The Simple Answer

An Elastic IP is a static public IPv4 address. Unlike the default public IP (which changes when you stop/start an instance), an EIP stays the same until you release it. Free when attached to a running instance. Charged when allocated but not attached ($0.005/hour) - AWS penalizes hoarding unused IPs.

#### Limits

5 EIPs per region by default. Request increase through Service Quotas. Most architectures should use DNS names (Route 53) or load balancers instead of EIPs for public-facing services.

### Q15: Route 53 - DNS hosting, routing policies, health checks

#### The Simple Answer

Route 53 is AWS's DNS service. It registers domains, hosts DNS zones, and routes traffic using health checks and routing policies.

#### Routing Policies

**Simple** - Single resource. One A record pointing to one IP. Weighted - Distribute traffic by percentage. 90% to blue, 10% to green. Used for canary deployments. Latency - Route to the region with lowest latency for the user. Failover - Primary/secondary. Switch to secondary when primary fails health check. Geolocation - Route by

user's geographic location. Compliance and localization. Multi-value - Return multiple healthy IPs. Simple load balancing without ELB.

#### Health Checks

Route 53 checks endpoint health every 10 or 30 seconds from multiple global locations. If a threshold of checkers report unhealthy, the record is removed from DNS responses. Combine with failover routing for automatic disaster recovery.

### Q16: RDS - engines, Multi-AZ, read replicas, backups

#### The Simple Answer

**RDS (Relational Database Service) manages relational databases** - you choose the engine (PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, Aurora), AWS handles provisioning, patching, backups, and replication.

#### Multi-AZ

Synchronous replication to a standby in another AZ. Automatic failover in 1-2 minutes if the primary fails. The standby is not readable - it is purely for HA. DNS endpoint stays the same after failover. Always enable for production databases.

#### Read Replicas

**Asynchronous replication. Used for read scaling** - route read queries to replicas, writes to primary. Can be in different AZs or regions. Up to 15 replicas for Aurora, 5 for others. Replication lag means reads may be slightly Stale.

#### Automated Backups

Point-in-time recovery to any second within the retention period (up to 35 days). Uses EBS snapshots and transaction logs. Combined with manual snapshots (kept indefinitely) for long-term retention.

Multi-AZ is for availability. Read replicas are for performance. They serve different purposes. Production databases should have Multi-AZ enabled AND read replicas if read traffic is high.

### Q17: DynamobDB - partition keys, sort keys, capacity modes, GSI/LSI

#### The Simple Answer

DynamoDB is a fully managed NoSQL key-value and document database. Millisecond performance at any scale. No servers to manage, no patches, no maintenance windows.

#### Data Model

**Partition key** - The primary lookup key. Must be unique (if no sort key) or unique in combination with sort key. Determines which partition stores the data. Choose high-cardinality keys (user_id, order_id) - not low-cardinality (status, country) which cause hot partitions.

**Sort key** - Optional. Enables range queries within a partition. Partition key + sort key together must be unique.

#### Capacity Modes

**On-demand** - Pay per request. No capacity planning. Scales automatically. Best for unpredictable traffic, new applications. More expensive per request than provisioned.

**Provisioned** - Set RCU (Read Capacity Units) and WCU (Write Capacity Units). Cheaper if you can predict traffic. Auto Scaling adjusts based on utilization. Best for steady-state production workloads with predictable patterns.

#### Indexes

**GSI (Global Secondary Index)** - Different partition key and optional sort key. Queries across all partitions. Eventually consistent. Has its own capacity.

**LSI (Local Secondary Index)** - Same partition key, different sort key. Must be created at table creation time. Strongly consistent option. Shares table capacity.

### Q18: ELB - ALB vs NLB vs CLB vs GWLB

#### The Simple Answer

**ALB (Application Load Balancer)** - Layer 7 (HTTP/HTTPS). Path-based and host-based routing. WebSocket support. Best for web applications, microservices, and container-based architectures.

**NLB (Network Load Balancer)** - Layer 4 (TCP/UDP). Ultra-high performance (millions of requests per second). Static IPs. Best for non-HTTP protocols, gaming, loT, and extreme performance needs.

**CLB (Classic Load Balancer)** - Legacy. Both L4 and L7 but limited features. Do not use for new deployments. Migrate existing ones to ALB or NLB.

**GWLB (Gateway Load Balancer)** - Transparent network gateway. Distributes traffic to virtual appliances (firewalls, intrusion detection). Used for network security architectures.

#### Key ALB Features

Target groups route to EC2, ECS containers, Lambda, or IP addresses. Health checks verify backend health. SSL termination offloads HTTPS at the ALB. Sticky sessions pin a user to a specific backend. Access logs capture all requests for analysis.

### Q19: Auto Scaling Groups - launch templates, scaling policies

#### The Simple Answer

ASG maintains a fleet of EC2 instances at a desired count. It replaces unhealthy instances automatically, scales out when demand increases, and scales in when demand decreases.

#### Launch Templates

Define the instance configuration: AMI, instance type, key pair, security groups, user data, [AM role. Launch templates version-control your instance configuration. Always use launch templates over launch configurations (deprecated).

#### Scaling Policies

**Target Tracking** - Maintain a metric at a target. "Keep average CPU at 50%." Simplest and most common. AWS adjusts instance count automatically.

**Step Scaling** - Add/remove specific numbers of instances at metric thresholds. "At 60% CPU add 2, at 80% add 4."

**Scheduled** - Scale based on time. "Scale to 10 instances at 9 AM, down to 2 at 6 PM." Health Checks

ASG can use EC2 status checks (default) or ELB health checks. If an instance fails the health check, ASG terminates it and launches a replacement. Always configure ELB health checks for web-facing instances - EC2 status checks only catch hardware/OS failures, not application failures.

### Q20: CloudWatch - metrics, alarms, logs, dashboards

#### The Simple Answer

CloudWatch is AWS's monitoring service. It collects metrics (CPU, memory, disk, custom), triggers alarms (notify or auto-scale), aggregates logs (from applications, services, and infrastructure), and visualizes everything in dashboards.

#### Metrics

Default metrics: CPU utilization, network |/O, disk I/O, status checks (EC2). Custom metrics: application -level data pushed via PutMetricData API (request count, error rate, queue depth). Note: memory and disk usage are NOT default EC2 metrics - you must install the CloudWatch agent.

#### Alarms

Watch a metric and take action when it crosses a threshold. Actions: send SNS notification, trigger Auto Scaling, execute Systems Manager automation. States: OK, ALARM, INSUFFICIENT_DATA. Set evaluation periods to avoid alerting on brief spikes.

#### Logs

CloudWatch Logs collects log streams into log groups. Set retention periods (1 day to never expire). Use Logs Insights for SQL-like querying across log groups. Subscription filters send log data to Lambda, Kinesis, or Elasticsearch for processing.

### Q21: CloudTrail - API activity logging

#### The Simple Answer

CloudTrail logs every API call made in your AWS account - who called what, when, from where, and the result. It is your audit trail for everything that happens in AWS. Essential for security investigation, compliance, and troubleshooting.

#### What CloudTrail Captures

**Management events** - Control plane operations: creating EC2 instances, modifying security groups, changing IAM policies. Logged by default.

**Data events** - Data plane operations: S3 object read/write, Lambda function invocations. Not logged by default - must enable. Generates high volume.

#### How to Use

Create a trail that delivers events to an S3 bucket (and optionally CloudWatch Logs). Enable for all regions. Enable log file integrity validation (detect tampering). For security, store CloudTrail logs in a separate account that the primary account cannot modify - preventing an attacker from deleting the audit trail.

### Q22: SNS and SQS - pub/sub, queues, DLQ, FIFO

#### The Simple Answer

**SNS (Simple Notification Service)** - Push-based pub/sub messaging. One message published to a topic is delivered to all subscribers (email, SMS, Lambda, SQS, HTTP). Used for fan-out patterns and notifications.

**SQS (Simple Queue Service)** - Pull-based message queue. Producers send messages, consumers poll and process them. Decouples components. Messages are retained until processed and deleted.

#### SQS Standard vs FIFO

**Standard** - Unlimited throughput. At-least-once delivery (messages may be delivered more than once). Best- effort ordering. Use when processing is idempotent.

**FIFO** - Exactly-once delivery. Guaranteed ordering. 3,000 messages/second with batching. Use when order matters (financial transactions, command sequences).

#### Dead Letter Queues (DLQ)

After a configurable number of failed processing attempts (maxReceiveCount), messages are moved to a DLQ. This prevents a poison message from blocking the entire queue. Monitor the DLQ and investigate messages that land there.

The decoupling pattern: Instead of Service A calling Service B directly (tight coupling), Service A sends a message to SQS. Service B polls SQS at its own pace. If B is down, messages queue up. When B recovers, it processes the backlog. Neither service needs to know about the other.

### Q23: Lambda - triggers, concurrency, cold starts, timeout

#### The Simple Answer

Lambda runs your code without provisioning servers. You upload a function, define a trigger, and Lambda handles execution, scaling, and availability. Pay only for compute time consumed - measured in milliseconds.

#### Triggers

API Gateway (HTTP requests), S3 (object events), SQS (messages), EventBridge (events/schedules), DynamoDB Streams (table changes), CloudWatch Events/Alarms, and 200+ other event sources.

#### Cold Starts

When Lambda creates a new execution environment (downloading code, initializing runtime), the first invocation takes longer - 100ms to several seconds depending on runtime, VPC configuration, and function size. Subsequent invocations reuse the warm environment. Mitigations: provisioned concurrency (pre-warmed environments), SnapStart (for Java - snapshots the initialized state), smaller deployment packages, and avoid VPC unless necessary.

#### Concurrency

Default 1,000 concurrent executions per region (all functions combined). Each active invocation uses one unit of concurrency. If limit is reached, new invocations are throttled (synchronous triggers return 429, async triggers retry). Reserve concurrency for critical functions to guarantee capacity.

#### Limits That Bite

15-minute maximum timeout. 10 GB maximum memory. 250 MB deployment package (unzipped). 512 MB /tmp storage (10 GB with ephemeral storage). These limits shape architecture decisions - long-running processes need Step Functions or ECS, not Lambda.

### Q24: ACM - TLS certificates

#### The Simple Answer

ACM (AWS Certificate Manager) provides free public TLS certificates for use with AWS services (ALB, CloudFront, API Gateway). ACM handles provisioning, validation, and auto-renewal - no manual certificate management.

#### Validation Methods

**DNS validation** - Add a CNAME record to your DNS. ACM verifies domain ownership. Preferred because it enables auto-renewal without manual intervention.

**Email validation** - ACM sends verification email to domain admin contacts. Manual process. Does not auto- renew cleanly.

#### Key Limitations

ACM certificates can only be used with AWS services - you cannot export the private key for use on EC2 instances directly. For EC2, use ACM Private CA or manage certificates yourself (certbot/Let's Encrypt). CloudFront requires certificates in us-east-1 region regardless of where your resources are.

### Q25: CloudFormation - stacks, templates, change sets

#### The Simple Answer

CloudFormation is AWS's native IaC service. You write a template (JSON or YAML) describing your resources. CloudFormation creates a stack - a collection of resources managed as a single unit. Update the template and apply - CloudFormation calculates what needs to change and applies it.

#### Change Sets

Before applying updates, create a change set to preview what CloudFormation will do - create, modify, replace, or delete. Like terraform plan for CloudFormation. Always review change sets before executing, especially for production stacks.

#### Key Concepts

**Stack** - A unit of deployment. Allresourcesina stack are created, updated, and deleted together. Nested stacks - Stacks that reference other stacks. Used for reusable components. Stack sets - Deploy stacks across multiple accounts and regions simultaneously. Drift detection - Detect resources that were changed outside CloudFormation.

CloudFormation vs Terraform: CloudFormation is AWS-native, free, deeply integrated, and supports every AWS feature on launch day. Terraform is multi-cloud, has a larger community, and HCLis more readable than CloudFormation YAML. Most AWS-only shops use CloudFormation; multi-cloud shops use Terraform.

### Q26: AWS CLI - profiles, credentials chain

#### The Simple Answer

The AWS CLI is the command-line interface for interacting with all AWS services. Configuration is stored in ~/.aws/config (profiles, regions) and ~/.aws/credentials (access keys).

#### Credentials Chain (Resolution Order)

1. Command-line options (--profile). 2. Environment variables (AWS _ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY). 3. CLI credentials file (~/.aws/credentials). 4. CLI config file (~/.aws/config). 5. Container credentials (ECS task role). 6. Instance profile credentials (EC2 IAM role). 7. AWS SSO/IAM Identity Center.

#### Named Profiles

Configure multiple accounts: aws configure --profile prod. Use with: aws s3 ls --profile prod. Set default with AWS_PROFILE=prod environment variable.

Security rule: Never put credentials in code. Use IAM roles for EC2/ECS/Lambda. Use SSO for human access. If access keys are necessary, rotate them every 90 days and never commit them to Git.

### Q27: Tags and cost allocation

#### The Simple Answer

Tags are key-value pairs attached to resources for organization, cost tracking, automation, and access control. A well-designed tagging strategy is essential for managing any AWS account beyond a small prototype.

#### Mandatory Tags for Every Organization

**Environment** - dev, staging, production. Team/Owner - Which team owns this resource. Project/Application - Which project this supports. CostCenter - For billing attribution.

#### Cost Allocation Tags

Activate tags in the Billing Console to break down costs by tag. Use AWS Cost Explorer to filter and group costs by tag. Without proper tagging, cost attribution is impossible at scale - you cannot answer "how much does the payment service cost?"

### Q28: ECS - task definitions, Fargate vs EC2, task roles

#### The Simple Answer

ECS (Elastic Container Service) runs Docker containers on AWS. A task definition describes the container (image, CPU, memory, ports, environment). A service ensures a desired number of tasks are running and integrates with load balancers.

#### Fargate vs EC2 Launch Type

**Fargate** - Serverless containers. No EC2 instances to manage. Pay per vCPU and memory per second. AWS manages the infrastructure. Best for most workloads, especially when you do not want to manage instances.

**EC2** - You manage the EC2 instances in the cluster. More control over instance type, storage, and networking. Better for GPU workloads, large sustained workloads (cheaper than Fargate at scale), and Windows containers.

#### Task Roles

Each ECS task can assume its own IAM role - task role. This gives the container permissions to access AWS services (S3, DynamoDB, SQS) without embedding credentials. Always use task roles - never put access keys in environment variables.

### Q29: ECR - container registry, lifecycle, scanning

#### The Simple Answer

ECR (Elastic Container Registry) stores Docker images in AWS. Integrated with ECS and EKS for seamless image pulling. Supports image scanning for vulnerabilities on push or on-demand using Amazon Inspector.

#### Lifecycle Policies

Automatically clean up old images based on rules: keep only the last 10 images, delete untagged images after 7 days, expire images older than 90 days. Without lifecycle policies, registry storage grows indefinitely.

#### Authentication

ECR authentication tokens expire every 12 hours. Use aws ecr get-login-password to get a token. For Kubernetes, use a CronJob or the ecr-credential-provider kubelet plugin for automatic rotation.

### Q30: EKS - managed Kubernetes

#### The Simple Answer

EKS (Elastic Kubernetes Service) provides managed Kubernetes. AWS manages the control plane (API server, etcd, scheduler). You manage the worker nodes (or use Fargate for serverless Pods).

#### Node Options

**Managed node groups** - AWS manages the EC2 instances in an ASG. Automated upgrades and patching. Most common choice.

**Self-managed nodes** - You manage the EC2 instances entirely. Maximum control. Used for specialized requirements.

**Fargate** - Serverless Pods. Nonodes to manage. Each Pod runs in its own micro-VM. Higher per-Pod cost but zero node management. Best for batch workloads and applications with variable demand.

#### Cost

Control plane: $0.10/hour ($73/month). Nodes: standard EC2 pricing. Fargate: premium over EC2 equivalent. Use Spot instances for non-critical node groups to reduce cost by 60-80%.

### Q31: Elastic Beanstalk - managed platform

#### The Simple Answer

Beanstalk deploys and manages web applications without you dealing with the underlying infrastructure. Upload your code, Beanstalk provisions EC2, load balancers, Auto Scaling, monitoring, and deploys your application. Supports Java, Python, Node.js, Go, Docker, and more.

#### When to Use

Rapid deployment of web apps without infrastructure expertise. Good for developers who want to focus on code, not DevOps. The underlying resources (EC2, ALB, ASG) are still visible and customizable - Beanstalk is automation, not abstraction.

### Q32: Systems Manager - SSM Agent, Session Manager, Parameter Store

#### The Simple Answer

SSM is a collection of management tools for EC2 instances and on-premises servers. The SSM Agent (pre- installed on Amazon Linux and most AMIs) communicates with the SSM service.

#### Key Features

**Session Manager** - SSH replacement. Browser-based or CLI shell access to instances without opening port 22. No SSH keys needed. All sessions are logged to S3 and CloudWatch. Audit who accessed which instance and what commands they ran.

**Parameter Store** - Key-value store for configuration and secrets. Hierarchical naming (/app/prod/db_host). Free for standard parameters. Integrates with ECS, Lambda, and CloudFormation. For sensitive values, use SecureString type (encrypted with KMS).

**Patch Manager** - Automated OS patching. Define maintenance windows, patch baselines, and schedules. Report compliance.

**Run Command** - Execute scripts on thousands of instances simultaneously without SSH.

Session Manager vs SSH: Session Manager is preferred because: no inbound port 22 needed (better security), no SSH key management, all sessions are audited, and it works through IAM (existing access control). SSH requires port 22 open, key distribution, and has no built-in audit trail.

### Q33: AWS Backup - centralized backup

#### The Simple Answer

AWS Backup provides centralized backup management across AWS services. Create backup plans defining: what to back up (EC2, RDS, EBS, EFS, DynamoDB, $3), how often (hourly, daily, weekly), how long to retain, and whether to copy backups cross-region or cross-account.

#### Why It Matters

Without AWS Backup, each service has its own backup mechanism - EBS snapshots, RDS automated backups, DynamoDB point-in-time recovery. Managing them separately is error-prone. AWS Backup unifies everything with consistent policies, centralized monitoring, and cross-account backup vaults for ransomware protection.

### Q34: Service Quotas - limits that break production

#### The Simple Answer

**Every AWS service has default limits** - number of EC2 instances, VPCs perregion, Lambda concurrent executions, S3 bucket count. These limits protect against runaway costs and resource exhaustion. Hitting a limit causes mysterious failures - "why can't | launch an instance?" because you hit the vCPU limit for your instance type.

#### Common Limits That Bite

EC2: 5 EIPs per region, vCPU limits per instance family. VPC: 5 VPCs per region, 200 subnets per VPC. Lambda: 1000 concurrent executions. $3: 100 buckets per account. EBS: volume and snapshot limits. Most limits can be increased through the Service Quotas console.

Proactive approach: Check limits before major launches. Set CloudWatch alarms on Service Quotas metrics. Request increases weeks before you need them - some increases require manual AWS review.

### Q35: Trusted Advisor

#### The Simple Answer

Trusted Advisor scans your AWS account and provides recommendations across five categories: Cost Optimization (idle resources, reserved instance usage), Performance (overutilized instances, EBS IOPS), Security (open security groups, IAM usage, MFA), Fault Tolerance (Multi-AZ, backups), and Service Limits (approaching quotas).

#### Free vs Paid

Basic plan: 7 core checks (S3 bucket permissions, security groups, IAM use, MFA, EBS snapshots, RDS snapshots, service limits). Business/Enterprise plan: all 100+ checks plus API access.

### Q36: Well-Architected Framework - 6 pillars

#### The Simple Answer

The Well-Architected Framework provides best practices for building reliable, secure, efficient, cost-effective, and sustainable workloads.

#### The 6 Pillars

**Operational Excellence** - Automate operations, respond to events, learn from failures. Security - Protect information, systems, and assets. Least privilege. Encryption everywhere. Reliability - Recover from failures, scale to meet demand. Multi-AZ, health checks, auto-scaling. Performance Efficiency - Use resources efficiently. Right-size instances. Use caching. Cost Optimization - Avoid unnecessary costs. Right-size. Use Savings Plans. Delete unused resources. Sustainability - Minimize environmental impact. Efficient resource usage.

For interviews: Know all 6 pillar names and their key themes. The most commonly asked are Security (least privilege, encryption), Reliability (Multi-AZ, auto-scaling), and Cost Optimization (right-sizing, Savings Plans).

## Section 2 - Mid-Level AWS Deep Dives

### Q37: VPC advanced - peering, Transit Gateway, PrivateLink, VPN, Direct Connect

#### The Simple Answer

**VPC Peering** - Direct connection between two VPCs. Traffic stays on AWS network. Non-transitive - if A peers with B and B peers with C, A cannot reach C through B. Free for same-region. Works cross-region and cross- account.

**Transit Gateway** - Hub-and-spoke network connecting multiple VPCs, VPNs, and Direct Connect. Transitive routing - all attached networks can communicate through the TGW. Scales to thousands of VPCs. Centralized routing management. Costs per attachment and per GB processed.

**PrivateLink** - Expose a service in one VPC to other VPCs without peering, public IPs, or internet. The consumer creates an Interface Endpoint; the provider creates a Network Load Balancer behind a VPC Endpoint Service. Traffic flows through the AWS network. Used by AWS services and SaaS providers.

**Site-to-Site VPN** - Encrypted IPsectunnel over the public internet between your on-premises network and VPC. Quick to set up (minutes). Limited bandwidth (1.25 Gbps per tunnel). Latency depends on internet conditions.

**Direct Connect** - Dedicated private network connection from your data center to AWS. 1 Gbps or 10 Gbps. Consistent latency. Takes weeks to provision. Used for high-bandwidth, low-latency, or compliance requirements.

Decision framework: Two VPCs talking to each other -> VPC peering. Multiple VPCs in a hub-and- spoke -> Transit Gateway. Exposing a service privately -> PrivateLink. Connecting on-premises quickly -> VPN. Connecting on-premises with high bandwidth -> Direct Connect (with VPN as backup).

### Q38: IAM advanced - assume role, cross-account, permission boundaries

#### Assume Role

A principal (user, service, or external identity) temporarily takes on the permissions of a role. The STS AssumeRole API returns temporary credentials (access key, secret key, session token) that expire in 1-12 hours. Used for: cross-account access, service access (EC2 roles), and federation (external identity providers).

#### Cross-Account Access

Account A creates a role with a trust policy allowing Account B's principals to assume it. Account B users assume the role to access Account A's resources. No credentials are shared - just the role ARN and a trust relationship. The role's permission policy controls what actions are allowed.

#### Permission Boundaries

A maximum permission limit for an IAM entity. The effective permissions are the intersection of identity policy AND permission boundary. Used by administrators to delegate user creation without allowing escalation - "you can create users, but they can never have more than these permissions."

### Q39: IAM Identity Center (SSO) - federation, SAML, OIDC, ABAC

#### The Simple Answer

IAM Identity Center (formerly AWS SSO) provides centralized access management across multiple AWS accounts. Users authenticate once through an external identity provider (Okta, Azure AD, Google Workspace) and get temporary access to AWS accounts based on permission sets. No long-lived access keys needed for human users.

#### ABAC (Attribute-Based Access Control)

Instead of creating separate roles for each team, use tags as attributes. A policy like "allow access to resources where the resource tag team matches the user's tag team" scales to hundreds of teams with a single policy. Reduces policy management overhead dramatically.

### Q40: S3 advanced - presigned URLs, CRR, event notifications Presigned URLs

Generate a URL that grants temporary access to a private $3 object. The URL includes the signature and expiration time. Used for: file downloads without making objects public, file uploads from clients directly to $3 (bypassing your server), and sharing private files with external parties temporarily.

#### Cross-Region Replication (CRR)

Automatically replicate objects from a source bucket to a destination bucket in a different region. Used for: disaster recovery, compliance (data copies in specific regions), and latency reduction (copy data closer to users). Requires versioning enabled on both buckets.

#### Event Notifications

Trigger actions when objects are created, deleted, orrestored. Targets: Lambda (process the object), SQS (queue for batch processing), SNS (fan-out to multiple consumers), EventBridge (complex routing). Used for: image processing on upload, ETL pipelines, audit logging.

### Q41: S3 performance optimization

#### The Simple Answer

$3 supports 5,500 GET/HEAD and 3,500 PUT/COPY/POST/DELETE requests per second per prefix. For higher throughput, distribute objects across multiple prefixes.

#### Transfer Acceleration

Uses CloudFront edge locations to accelerate uploads. Client uploads to the nearest edge location; the edge transfers to S3 over AWS's optimized network. Beneficial for large file uploads from geographically distant clients.

#### Multipart Upload

Required for objects -> 5 GB, recommended for objects -> 100 MB. Uploads parts in parallel, retries only failed parts. Abort incomplete multipart uploads with lifecycle rules - incomplete parts consume storage invisibly.

### Q42: EC2 advanced - placement groups, ENI, instance store, Nitro, IMDSv2

#### Placement Groups

**Cluster** - All instances in one AZ, close together. Lowest latency. Used for HPC, tightly coupled workloads. Risk: single AZ failure affects all. Spread - Each instance on different hardware. Maximum resilience. 7 instances per AZ limit. Used for critical instances. Partition - Groups of instances on separate racks. Used for distributed databases (Kafka, Cassandra, HDFS).

#### Instance Metadata Service v2 (IMDSv2)

IMDSv1 allowed any process to query http://169.254.169.254/ for instance credentials - an SSRF vulnerability could steal IAM role credentials. IMDSv2 requires a session token obtained via PUT request with a TTL, making SSRF exploitation significantly harder. Always enforce IMDSv2: HttpTokens: required in launch template.

### Q43: EBS advanced - IOPS, multi-attach, fast snapshot restore

#### IOPS Provisioning

gp3: baseline 3000 IOPS, provision up to 16,000. io2: provision up to 64,000 IOPS (256,000 with Block Express). Match IOPS to workload - paying for unused IOPS wastes money.

#### Multi-Attach

io2 volumes can be attached to up to 16 Nitro instances simultaneously. Used for clustered applications that need shared block storage. Applications must handle concurrent access (use cluster filesystems like GFS2).

### Q44: RDS advanced - Aurora Serverless v2, RDS Proxy, Performance Insights

Aurora Serverless v2

Scales capacity in increments of 0.5 ACU (Aurora Capacity Units) based on load. Scales in seconds. Pay for capacity used. Best for variable workloads - applications with unpredictable traffic patterns, development environments, multi-tenant SaaS.

#### RDS Proxy

Manages a connection pool between your application and the database. Reduces database connections (each connection uses memory). Enables faster failover (maintains connections during Multi-AZ failover). Essential for Lambda functions - without a proxy, Lambda creates a new connection per invocation, overwhelming the database.

#### Performance Insights

Database performance dashboard showing wait events, top SQL queries, and resource consumption. Identifies slow queries, lock contention, and resource bottlenecks. Available at no extra cost for 7 days of retention.

### Q45: ElastiCache - Redis vs Memcached

#### The Simple Answer

**Redis** - Rich data structures (strings, lists, sets, sorted sets, hashes). Persistence options. Replication with automatic failover. Pub/sub messaging. Lua scripting. Best for: session stores, leaderboards, real-time analytics, message queues.

**Memcached** - Simple key-value cache. Multi-threaded (scales horizontally). No persistence, no replication. Best for: simple caching where data can be regenerated from the database.

The default choice is Redis. Memcached only when you need multi-threaded performance and data loss is acceptable.

### Q46: CloudFront - CDN, Lambda@Edge, Functions

#### The Simple Answer

CloudFront caches content at 400+ edge locations worldwide. Reduces latency, offloads origin traffic, and provides DDoS protection (Shield Standard included).

#### Lambda@Edge vs CloudFront Functions

**CloudFront Functions** - Lightweight (JavaScript only, sub-millisecond). Run on every request. Use for: header manipulation, URL rewriting, request validation. Very cheap.

Lambda@ Edge - Full Lambda (Node.js, Python). Run at edge locations. Use for: A/B testing, authentication, dynamic content generation, image resizing. More expensive but more capable.

#### Cache Invalidation

CloudFront caches content based on TTL. After deployment, cached content may be stale. Create invalidation: aws Ccloudfront create-invalidation --distribution-id DIST_ID --paths "/*". Invalidation takes 1-2 minutes to propagate globally. Use versioned filenames (app.v123.js) instead of invalidation - it is faster and free.

### Q47: API Gateway - REST vs HTTP API

#### The Simple Answer

**REST API** - Full-featured. Request validation, request/response transformation, WAF integration, caching, usage plans with API keys and throttling. More expensive.

**HTTP API** - Lightweight. Lower latency, lower cost (up to 71% cheaper). JWT authorizers, CORS support. Fewer features. Best for most new APIs unless you need REST API-specific features.

#### Throttling

Default: 10,000 requests/second per region, 5,000 burst. Per-method throttling available. Usage plans limit individual API consumers. During traffic spikes, clients receive 429 Too Many Requests. Plan capacity for launches - request limit increases ahead of time.

### Q48: Lambda advanced - layers, VPC, provisioned concurrency, SnapStart

#### Layers

Shared code and dependencies packaged separately from the function. Up to 5 layers per function. Use for: common libraries, custom runtimes, shared utilities. Reduces deployment package size and enables sharing across functions.

#### VPC Access

Lambda can run inside a VPC to access private resources (RDS, ElastiCache). Requires: subnets in at least 2 AZs, a security group, and NAT Gateway for internet access. VPC Lambdas had severe cold start penalties before 2019; now Hyperplane ENls eliminated most of the overhead. Still, only put Lambda in a VPC if it needs to access VPC resources.

The trap: Lambda in a VPC without a NAT Gateway or VPC Endpoints. The function cannot reach any AWS service (DynamoDB, S3, SQS) or the internet. Add VPC Endpoints for AWS services or a NAT Gateway for internet access. See scenario Q125.

#### Provisioned Concurrency

Pre-warms execution environments. Eliminates cold starts entirely. You pay for provisioned environments whether they are used or not. Use for: latency-sensitive APIs, predictable traffic patterns, scheduled scaling before known traffic spikes.

#### SnapStart (Java)

Snapshots the initialized JVM state after the init phase. Subsequent cold starts restore from snapshot instead of re-initializing. Reduces Java cold starts from 5-10 seconds to <1 second. Automatic for Java 11+ on Lambda.

### Q49: Step Functions - state machines

#### The Simple Answer

Step Functions orchestrates multiple AWS services into workflows defined as state machines. Instead of chaining Lambda functions with SQS, define the workflow visually with states (Task, Choice, Parallel, Wait, Map) and let Step Functions handle execution, error handling, and retry.

#### Standard vs Express

**Standard** - Long-running (up to 1 year). Exactly-once execution. Audit history. $0.025 per 1,000 transitions. Use for: order processing, human approval workflows, ETL pipelines.

**Express** - Short-duration (up to 5 minutes). At-least-once execution. Higher throughput. $1 per million invocations. Use for: data processing, loT ingestion, real-time streaming.

### Q50: ECS advanced - service discovery, awsvpc, ECS Exec

awsvpc Networking

Each ECS task gets its own ENI with a private IP. Tasks are directly addressable by IP. Security groups apply at the task level. The default and recommended networking mode for Fargate. For EC2 launch type, awsvpc may exhaust ENI limits on smaller instances.

#### ECS Exec

**Interactive shellinto a running container** - like kubectl execfor ECS. Uses SSM Session Manager under the hood. Requires: SSM agent in the container image (or use the ECS managed agent), task role with SSM permissions, and the execute-command flag enabled on the service. Essential for debugging production containers.

### Q51: EKS advanced - IRSA, Pod Identity, Karpenter IRSA (IAM Roles for Service Accounts)

Associates a Kubernetes ServiceAccount with an IAM role. Pods using that ServiceAccount get temporary AWS credentials scoped to the role. No access keys stored. Each microservice gets its own role with least-privilege permissions. The standard for AWS access from EKS Pods.

EKS Pod Identity (newer alternative)

**Simpler than IRSA** - no OIDC provider configuration needed. AWS manages the identity federation. Still in adoption phase but becoming the recommended approach for new clusters.

#### Karpenter

Next-generation node provisioner. Replaces Cluster Autoscaler + ASG node groups. Directly provisions EC2 instances (any type) based on pending Pod requirements. Faster scaling (seconds vs minutes), better bin - packing, automatic consolidation. The recommended autoscaler for new EKS clusters on AWS.

### Q52: Secrets Manager vs Parameter Store

#### The Simple Answer

#### free Secrets Manager Parameter Store

Automatic rotation Yes (Lambda-based) No Cross-account access Yes Limited Cost S0.40/secret/month + API calls Free (Standard),

#### S0.05/advanced

Max size 64 KB 8 KB (Standard), 64 KB (Advanced) Best for Database passwords, API keys Configuration values, non- needing rotation rotating secrets

#### When to Use Which

**Secrets Manager** - Database credentials that need automatic rotation, API keys shared across accounts, any secret that must rotate. Parameter Store - Application configuration, feature flags, non-sensitive settings, secrets where rotation is manual, and when cost matters (free tier).

### Q53: KMS - key management

#### The Simple Answer

KMS manages encryption keys for AWS services. AWS-managed keys (free, AWS controls rotation), Customer- managed keys (you control policies, rotation, and deletion), and Customer-provided keys (you manage entirely - SSE-C).

#### Envelope Encryption

KMS encrypts a data key. The data key encrypts your data. Only the encrypted data key is stored alongside the data. To decrypt: KMS decrypts the data key, the data key decrypts the data. This avoids sending large data volumes to KMS (which has a 4 KB limit per API call).

KMS key deletion is dangerous. When you schedule a key for deletion (minimum 7-day waiting period), ALL data encrypted with that key becomes permanently unrecoverable after deletion. See scenario Q107.

### Q54: Organizations - SCPs, OUs

#### The Simple Answer

AWS Organizations manages multiple AWS accounts centrally. Organizational Units (OUs) group accounts by function (Production, Development, Security). Service Control Policies (SCPs) set maximum permissions for accounts in an OU - they restrict, never grant.

#### Common SCPs

Deny all actions outside approved regions. Deny disabling CloudTrail. Deny leaving the organization. Deny creating IAM users with console access (force SSO). These guardrails prevent individual accounts from violating organizational policies.

### Q55: Control Tower - landing zone

#### The Simple Answer

Control Tower automates multi-account setup following AWS best practices. Creates a landing zone with: a management account, alog archive account, an audit account, guardrails (mandatory and elective), and Account Factory for creating new accounts with compliant configurations. The fastest way to set up a production-grade multi-account environment.

### Q56: Config - rules, remediation

#### The Simple Answer

AWS Config continuously monitors resource configurations and evaluates them against rules. Examples: s3- bucket-public-read-prohibited, ec2-instance-no-public-ip, rds-instance-public-access-check. Non-compliant resources are flagged. Auto-remediation can fix violations automatically (using SSM Automation documents).

### Q57: CloudWatch advanced - Logs Insights, Container Insights Logs Insights

SQL-like query language for searching and analyzing CloudWatch Logs. Parse, filter, aggregate, and visualize log data. Example: find the top 10 most expensive API calls in the last hour, count error rates by service, or trace a request across microservices by correlation ID.

#### Container Insights

Pre-built dashboards for ECS and EKS clusters. CPU, memory, network, and disk usage at cluster, service, task, and Pod levels. Requires the CloudWatch agent or ADOT (AWS Distro for OpenTelemetry) collector.

### Q58: EventBridge - event-driven architecture

#### The Simple Answer

EventBridge routes events from AWS services, SaaS applications, and custom sources to targets (Lambda, SQS, Step Functions, etc.). Events are JSON documents describing what happened. Rules match events by pattern and route to targets.

#### Key Concepts

**Event bus** - Default bus receives AWS service events. Custom buses for application events. Partner buses for SaaS integrations (Shopify, AuthO, Datadog).

**Schema Registry** - Automatically discovers and stores event schemas. Generates code bindings for type -safe event handling.

**Pipes** - Point-to-point connections from a source (SQS, Kinesis, DynamoDB Streams) to a target with optional filtering, enrichment, and transformation. Simpler than building this with Lambda.

### Q59: Kinesis - real-time streaming

#### The Simple Answer

**Kinesis Data Streams** - Real-time data streaming. Producers send records to shards. Consumers (Lambda, KCL applications) process records. Sub-second latency. You manage capacity by adding/removing shards.

**Kinesis Data Firehose** - Near-real-time delivery to destinations ($3, Redshift, Elasticsearch, Splunk). Fully managed - no shards to manage. Buffering by size or time. Built-in format conversion (JSON to Parquet).

**Kinesis Data Analytics** - SQL or Apache Flink for stream processing. Real-time aggregation, filtering, and transformation.

Kinesis vs SQS: Kinesis is for real-time analytics on ordered event streams where multiple consumers process the same data. SQS is for decoupling services with at-least-once delivery where each message is processed by one consumer. Different use cases, not alternatives.

### Q60: Global Accelerator

#### The Simple Answer

Global Accelerator provides two anycast static IPs that route traffic to the optimal AWS endpoint globally. Traffic enters the AWS network at the nearest edge location and travels over AWS's backbone - faster and more consistent than the public internet.

#### Global Accelerator vs CloudFront

**CloudFront** - Caches content at edge locations. Best for static and cacheable content (images, CSS, videos). Global Accelerator - Routes traffic to your backend, does not cache. Best for dynamic, non-cacheable traffic (APIs, TCP/UDP applications, gaming, VoIP).

### Q61: VPC flow logs, Route 53 Resolver, hybrid DNS VPC Flow Logs

Capture IP traffic information for network interfaces. Published to CloudWatch Logs, $3, or Kinesis Firehose. Shows source/destination IP, port, protocol, bytes, packets, and action (ACCEPT/REJECT). Essential for: security investigations, troubleshooting connectivity, network traffic analysis. Note: flow logs do not capture packet content - only metadata.

#### Route 53 Resolver

**Inbound endpoints** - Allow on-premises DNS to resolve AWS private hosted zones. Outbound endpoints - Forward DNS queries from VPC to on-premises DNS servers. Essential for hybrid environments where some domains resolve on-premises and others in AWS.

### Q62: Cost optimization - RI, Savings Plans, Spot, right-sizing The Optimization Playbook

**Right-size first** - Use Compute Optimizer recommendations. An m5.xlarge running at 20% CPU should be m5.large. This saves 50% immediately with zero risk.

**Savings Plans second** - Commit to a $/hour spend for 1-3 years. Automatically applies to EC2, Lambda, and Fargate. Savings Plans are more flexible than Rls and should be the default commitment.

**Spot for fault-tolerant** - 60-90% discount. Use Spot Fleet with multiple instance types and AZs for availability. Best for: CI/CD runners, batch processing, stateless containers, data processing.

**Delete unused** - Unattached EBS volumes, unused EIPs, idle load balancers, old snapshots, orphaned ENls. Each costs money silently.

**Data transfer** - VPC Endpoints for S3/DynamoDB (free Gateway Endpoints). NAT Gateway traffic is expensive - minimize outbound traffic. Use CloudFront for frequently accessed content.

### Q63: DR strategies - RPO/RTO

#### The Four Strategies (Cost vs Recovery Speed)

**Backup and Restore** - Lowest cost. Highest RTO (hours). Back up data to $3/Glacier. Rebuild infrastructure when disaster hits using CloudFormation/Terraform. RPO: hours. RTO: hours.

**Pilot Light** - Core infrastructure always running (database replicas), everything else stopped. On disaster, scale up and start stopped components. RPO: minutes. RTO: tens of minutes.

**Warm Standby** - Full system running at minimum capacity in the DR region. On disaster, scale to production capacity. RPO: seconds. RTO: minutes.

**Active-Active (Multi-Site)** - Full production running in multiple regions simultaneously. Traffic routes to both. On disaster, traffic shifts to healthy region. RPO: near-zero. RTO: near-zero. Highest cost.

### Q64: Multi-account strategy The Standard OU Structure

Root -> Security OU (log archive, audit, security tools) -> Infrastructure OU (networking, shared services) -> Workloads OU -> Production OU (prod accounts) + Non-Production OU (dev, staging). Each environment in a separate account. SCPs restrict production accounts more tightly than development.

### Q65: IaC on AWS - CloudFormation vs CDK vs Terraform

#### The Simple Answer

**CloudFormation** - AWS-native YAML/JSON. Supports every AWS feature on day one. Free. Deep integration. Verbose syntax. CDK - Write infrastructure in TypeScript, Python, Java, Go. Compiles to CloudFormation. Programming language features (loops, conditions, abstractions). Best for developers who prefer code over YAML. Terraform - Multi-cloud HCL. Largest community. Better state management visibility. May lag behind CloudFormation on new feature support.

Decision: AWS-only and prefer YAML~> CloudFormation. AWS-only and prefer code -> CDK. Multi- cloud -> Terraform.

### Q66: CI/CD on AWS - CodePipeline, CodeBuild, CodeDeploy

#### The Simple Answer

**CodePipeline** - Orchestrates the pipeline stages (source -> build -> test -> deploy). Integrates with GitHub, CodeCommit, S3 as sources. CodeBuild - Managed build service. Runs builds in Docker containers. Scales automatically. Pay per build minute. CodeDeploy - Deploys to EC2, ECS, and Lambda. Supports rolling, blue/green, and canary deployments. Traffic shifting with automatic rollback on alarm.

CodePipelinevs GitHub Actions: CodePipeline is deeply integrated with AWS services (CodeDeplky, ECS, CloudFormation). GitHub Actions has a richer ecosystem and better developer experience. Most teams use GitHub Actions for CI and CodeDeploy/ArgoCD for CD.

### Q67: Serverless architecture patterns

#### The Classic Pattern

API Gateway -> Lambda -> DynamoDB. Client sends HTTP request. API Gateway validates and routes. Lambda processes. DynamoDB stores data. S3 hosts static frontend. CloudFront caches everything. EventBridge handles async processing.

#### When Serverless Breaks Down

Long-running processes (>15 min). Heavy computation needing persistent state. Applications requiring WebSocket with many concurrent connections. Workloads that need consistent sub-10ms latency (cold starts). Very high throughput where per-request pricing exceeds EC2 cost.

### Q68: Container networking on AWS

#### awsvpc Mode (Default for Fargate)

Each task/Pod gets its own ENI and private IP. Security groups at the task level. Direct addressability. ENI limits per EC2 instance type can limit how many tasks run on a single instance.

#### EKS VPC CNI

Each Pod gets a real VPC IP address from the subnet. Pods are directly routable from the VPC. No overlay network. AWS-native networking. Limitation: IP address exhaustion on large clusters. Mitigation: use prefix delegation (assigns /28 prefixes instead of individual IPs, supporting more Pods per node).

### Q69: WAF - Web Application Firewall

#### The Simple Answer

AWS WAF protects web applications from common exploits. Attach to ALB, CloudFront, or API Gateway. Rules evaluate each request and allow, block, or count.

#### Rule Types

**Managed rules** - AWS and partner-maintained rulesets. AWSManagedRulesCcommonRuleSet blocks common OWASP vulnerabilities (SQLi, XSS). AWSManagedRulesBotControlRuleSet detects bots. Enable managed rules first - they cover 80% of threats with zero configuration.

**Custom rules** - Match on IP, headers, body, URI, query string. Rate limiting: block IPs exceeding 100 requests per 5 minutes.

### Q70: Shield - DDoS protection

**Shield Standard** - Free. Automatic. Protects against common L3/L4 DDoS attacks (SYN floods, UDP reflection). Always active on all AWS resources.

**Shield Advanced** - $3,000/month per organization. Enhanced detection, near-real-time metrics, 24/7 DDoS Response Team, cost protection (credits for scaling during attacks), and WAF included.

### Q71: GuardDuty - threat detection

#### The Simple Answer

GuardDuty analyzes VPC Flow Logs, CloudTrail, DNS logs, and EKS audit logs using machine learning to detect threats. Finding types: unauthorized API calls, compromised instances (crypto mining, C&C communication), unusual data access patterns, exposed credentials. Enable in every region and account. Findings feed to Security Hub for centralized view.

### Q72: Security Hub - findings aggregation

#### The Simple Answer

Security Hub aggregates findings from GuardDuty, Inspector, Macie, Config, Firewall Manager, and third-party tools into a single dashboard. Runs automated compliance checks against CIS AWS Foundations Benchmark and PCI DSS. Prioritizes findings by severity. Enables automated remediation through EventBridge rules triggering Lambda or SSM.

### Q73: Inspector and Macie

#### Inspector

Automated vulnerability scanning for EC2 instances, container images in ECR, and Lambda functions. Scans for software vulnerabilities (CVEs) and network exposure. Continuous scanning - new vulnerabilities are detected as they are published.

#### Macie

Data classification service that discovers sensitive data (PII, financial data, credentials) in S3 buckets. Uses ML to classify data and alert on exposure risks. Essential for GDPR and compliance.

### Q74: Observability - X-Ray, OpenTelemetry, Managed Grafana X-Ray

Distributed tracing for microservices. Traces requests across Lambda, ECS, EC2, API Gateway. Shows service map, latency breakdown per service, error analysis. Instrument with X-Ray SDK or OpenTelemetry.

#### AWS Distro for OpenTelemetry (ADOT)

AWS-supported Opentelemetry distribution. Vendor-neutral instrumentation. Send traces to X-Ray, metrics to CloudWatch, and logs to CloudWatch Logs using one collector. The recommended approach for new applications.

#### Managed Grafana/Prometheus

Managed Grafana for dashboards, Managed Prometheus for metric storage. Use when you want the Grafana/Prometheus experience without managing the infrastructure. Multi-account and cross-region support.

### Q75: Database selection guide

#### The Simple Answer

SS eee:

#### Traditional relational RDS (PostgreSQL, MySQL) Familiar SQL, ACID, joins

High-performance relational Aurora 5x MySQL performance, multi- AZ, serverless option

Key-value, millisecond latency DynamoDB Infinite scale, single-digit ms, serverless

Caching ElastiCache (Redis) Sub-ms latency, session store, leaderboards

Data warehouse Redshift Columnar storage, SQL analytics

on petabytes

#### Document store DocumentDB MongoDB-compatible

Graph Neptune Relationship queries, social networks

Time series Timestream loT, metrics, log analytics

The decision tree: Need joins and transactions -> RDS/Aurora. Need infinite scale and single -digit ms -> DynamoDB. Need caching -> ElastiCache. Need analytics on large datasets -> Redshift. Most applications use RDS/Aurora for primary data and DynamoDB for specific use cases.

## Section 3 - Senior Architecture & Scale

### Q76: Multi-region architecture

#### The Simple Answer

Multi-region deployments provide disaster recovery, lower latency for global users, and data sovereignty compliance. Key services: Route 53 (global DNS with health-check failover), DynamoDB Global Tables (multi- region read/write), Aurora Global Database (cross-region read replicas with <1 second replication lag), $3 Cross- Region Replication, and Global Accelerator (anycast routing to the nearest healthy region).

#### The Hard Parts

Data replication lag creates consistency challenges. Database writes must go to a single primary region (Aurora) or handle conflicts (DynamoDB Global Tables uses last-writer-wins). Application code must handle the possibility of stale reads. Deployment must be coordinated across regions. Testing failover is complex and should happen quarterly.

### Q77: High availability patterns The Layered Approach

**Instance level** - Auto Scaling replaces failed instances. Multiple instance types for availability. AZ level - Resources spread across 3 AZs. ALB distributes traffic. RDS Multi-AZ. Region level - Active-passive (Route 53 failover) or active-active (Global Accelerator). Service level - Circuit breakers, retries with backoff, fallback responses. Data level - Multi-AZ database, cross-region replicas, regular backups.

The HA formula: No single point of failure at any level. Everything that can fail should have a redundant counterpart that takes over automatically without human intervention.

### Q78: Data lake on AWS The Architecture

**Ingest** - Kinesis Firehose, DMS, S3 Transfer Acceleration. Store - S3 (raw zone, processed zone, curated zone). Catalog - Glue Data Catalog (schema discovery, crawlers). Process - Glue ETL (Spark-based), EMR, Lambda. Query - Athena (serverless SQL on S3), Redshift Spectrum (extends Redshift to $3). Govern - Lake Formation (permissions, row/column-level access), encryption.

### Q79: Container security on AWS Defense in Depth

**Image** - ECR scanning (Inspector) on push. Only deploy images from your own ECR. Block public registries with SCP. Runtime - ECS task roles with least privilege. EKS Pod Identity/IRSA. Read-only root filesystem. Non-root containers. Network - Security groups per task/Pod. VPC private subnets only. VPC endpoints for AWS services. Host - Bottlerocket OS (minimal, immutable, container-optimized). Managed node groups with automatic patching. Secrets - Secrets Manager with ECS/EKS integration. Never environment variables for secrets.

### Q80: Serverless at scale

#### Concurrency Management

Default: 1,000 concurrent Lambda executions per region (all functions). Reserve concurrency for critical functions. Use provisioned concurrency for latency-sensitive workloads. Monitor throttles with CloudWatch.

#### Backpressure Patterns

SQS between API Gateway and Lambda smooths traffic spikes. AP! Gateway throttling protects downstream. Step Functions orchestrate complex workflows. DynamoDB on-demand handles scaling automatically.

#### Cost at Scale

At very high throughput, Lambda per-invocation pricing may exceed EC2/Fargate equivalent. Evaluate crossover point: typically >10 million invocations/month or sustained high concurrency.

### Q81: Networking at scale - Transit Gateway, RAM, centralized egress

#### Transit Gateway at Scale

Connect hundreds of VPCs through a single hub. Route tables segment traffic between VPCs. Peering TGWs across regions for global connectivity. RAM (Resource Access Manager) shares TGW across accounts.

#### Centralized Egress

Instead of NAT Gateways in every VPC ($0.045/GB), route all internet-bound traffic through a shared egress VPC with centralized NAT Gateways, firewalls, and inspection. Reduces cost and centralizes security controls.

### Q82: Security architecture - defense in depth The Layers

**Perimeter** - WAF, Shield, CloudFront. Network - VPC, security groups, NACLs, PrivateLink. Identity - |AM, Identity Center, MFA, SCPs. Data - KMS encryption, $3 Block Public Access, Macie. Compute - IMDSv2, Inspector, minimal AMIls. Detection - GuardDuty, Security Hub, CloudTrail. Response - EventBridge + Lambda automated remediation.

### Q83: FinOps - cost governance

#### The Tools

**AWS Budgets** - Set monthly budget with alerts at 80% and 100%. Action-based budgets can automatically apply SCPs or stop instances when budget is exceeded.

**Cost Anomaly Detection** - ML-based detection of unusual spending. Alerts when costs deviate from historical patterns.

**Cost and Usage Reports (CUR)** - Detailed hourly billing data delivered to $3. Analyze with Athena for custom reports. Most granular cost data available.

**Compute Optimizer** - Recommendations for right-sizing EC2, EBS, and Lambda based on historical usage.

### Q84: Migration strategies - 7 Rs The 7 Rs

**Retire - Decommission. Not needed. Retain** - Keep on-premises for now. Rehost - Lift and shift. Move to EC2 as- is. Relocate - Move to VMware Cloud on AWS. Replatform - Lift and reshape. RDS instead of self-managed database. Refactor - Re-architect for cloud-native (serverless, containers). Repurchase - Move to SaaS (self- hosted CRM -> Salesforce).

#### Tools

**Application Discovery Service** - Discovers on-premises servers, dependencies, and performance data. Migration Hub - Tracks migration progress across tools. DMS (Database Migration Service) - Migrates databases with minimal downtime. Supports heterogeneous migrations (Oracle -> Aurora PostgreSQL).

### Q85: Hybrid cloud - Direct Connect, Outposts, EKS Anywhere

#### The Simple Answer

**Direct Connect** - Dedicated private connection. 1-10 Gbps. Consistent latency. For large data transfers and hybrid workloads. Outposts - AWS hardware running in your data center. Same APIs as the cloud. For low- latency, data residency, and local data processing. EKS Anywhere - Run EKS on-premises on VMware or bare metal. Same Kubernetes experience, unified management.

### Q86: AWS vs GCP vs Azure - decision framework

#### The Simple Answer

Market share ~31% (largest) ~11% ~25%

Best for Broadest service Data/ML, Kubernetes Microsoft ecosystem catalog

Strengths Maturity, services, GKE, BigQuery, pricing ADintegration, hybrid community

Weaknesses Complexity, pricing Fewerservices, smaller UX, naming confusion confusion community

### Q87: AWS networking deep dive - DNS resolution, flow log analysis VPC DNS Resolution

enableDnsHostnames and enableDnsSupport control whether VPC resources get DNS hostnames and can use the Amazon-provided DNS server (169.254.169.253). Both must be true for private hosted zones to work. Route 53 Resolver endpoints handle hybrid DNS (on-premises <> AWS).

#### Flow Log Analysis

Flow logs at VPC, subnet, or ENI level. Analyze with Athena (query S3-stored logs with SQL) for: top talkers, rejected connections (security investigation), traffic patterns, and cost optimization (identify unexpected cross - AZ traffic).

### Q88: Compliance - Config rules, audit, encryption

#### The Compliance Baseline

CloudTrail in every region and account (audit trail). Config rules for continuous compliance monitoring. GuardDuty for threat detection. SecurityHub for findings aggregation. $3 Block Public Access account-wide. EBS default encryption enabled. KMS keys with rotation. IAM password policies. SCPs preventing compliance- breaking actions.

### Q89: Event-driven architecture patterns

#### The Patterns

**Fan-out** - SNS topic -> multiple SQS queues -> multiple consumers. One event processed by multiple services. Event sourcing - EventBridge -> Kinesis Data Streams -> S3. Full event history. Replay events to rebuild state. Saga - Step Functions orchestrate distributed transactions. Each step has a compensation action for rollback. CQRS - Separate write (DynamoDB) and read (ElastiCache/Elasticsearch) models. EventBridge syncs between them.

### Q90: Design a highly available 3-tier architecture The Architecture

**Presentation tier** - CloudFront CDN -> ALB in 3 AZs -> Auto Scaling group of web servers. Application tier - Internal ALB -> Auto Scaling group of app servers in private subnets. Database tier - Aurora Multi-AZ in isolated subnets. Read replicas for read scaling. ElastiCache for session store.

#### Supporting Infrastructure

VPCwith 3 public, 3 private, 3 isolated subnets across 3 AZs. NAT Gateways in each public subnet (or centralized egress VPC). VPC endpoints for $3 and DynamoDB. Route 53 with health checks. CloudWatch monitoring with alarms. Auto Scaling based on target tracking. AWS Backup for automated backups. WAF on ALB/CloudFront. ACM for TLS certificates.

## Section 4 - Tricky AWS Scenarios

### Q91: EC2 instance unreachable - systematic debugging

#### Step-by-Step

1. **Step 1 -** Is the instance running? AWS Console -> EC2 -> Instance state. If stopped, start it. If terminated, it is gone.

2. **Step 2 -** Check instance status checks. System status check failed -> hardware issue -> stop and start (moves to different hardware). Instance status check failed -> OS issue -> check system logs (Actions -> Monitor -> Get System Log).

3. **Step 3 -** Security Group. Does the SG allow inbound traffic on the required port (22 for SSH, 443 for HTTPS)? From the correct source IP or CIDR? Check: EC2 -> Security Groups -> Inbound Rules.

4. **Step 4 -** NACL. Does the subnet's NACLallow inbound AND outbound (stateless!) traffic? NACLs have numbered rules evaluated in order. A deny rule before an allow rule blocks traffic.

5. **Step 5 -** Route table. Does the subnet's route table have a route to the internet? Public subnet: 0.0.0.0/0 -> IGW. Private subnet: 0.0.0.0/0 -> NAT Gateway. No route = no connectivity.

6. **Step 6 -** Public IP. Does the instance have a public IP or Elastic IP? Instances in public subnets without public IPs are unreachable from the internet.

7. **Step 7 -** OS-level firewall. iptables, ufw, or firewalld inside the instance may be blocking traffic. Use Session Manager (does not require SSH) to access the instance and check.

8. **Step 8 -** Key pair. "Permission denied (publickey)" -> wrong key, wrong username (ec2-user for Amazon Linux, ubuntu for Ubuntu), or key file permissions wrong (must be 600).

The debugging chain that impresses interviewers: Instance state -> status checks -> Security Group -> NACL -> Route table -> Public IP -> OS firewall -> Key pair. Methodical, layered, complete.

### Q92: S3 bucket accidentally made public - incident response

#### Step-by-Step

1. **Step 1 -** Block public access immediately. Enable Block Public Access on the bucket. This overrides any policy or ACL that grants public access. Do this within minutes of discovery.

2. **Step 2 -** Identify what was exposed. Check bucket contents. Were there sensitive files? PII? Credentials? Application data?

3. **Step 3 -** Determine the exposure duration. Check CloudTrail for S3 API calls - when was the bucket policy changed? Who changed it? Check S3 access logs for download activity from unknown IPs during the exposure window.

4. **Step 4 -** Assess impact. If credentials were exposed, rotate them immediately. If Pll was exposed, determine legal notification requirements (GDPR: 72 hours, CCPA, etc.). If application data was exposed, assess competitive impact.

5. **Step 5 -** Root cause. Was it a misconfigured bucket policy? A Terraform change? A manual console action? An ACL change?

6. **Step 6 -** Prevent recurrence. Enable Block Public Access at the account level (not just bucket level). Enable Config rule s3-bucket-public-read-prohibited. Create an EventBridge rule that triggers Lambda to automatically block public access if detected. Enable Macie for sensitive data monitoring. Review IAM policies - restrict who can modify bucket policies.

### Q93: RDS running out of storage

#### Step-by-Step

1. **Step 1 -** Enable storage auto-scaling if not already enabled. RDS can automatically increase storage when free space drops below 10%. Set the maximum storage threshold.

2. **Step 2 -** If auto-scaling is not available or fast enough, manually modify the instance to increase allocated storage. This is online - no downtime. But it takes time (hours for large increases).

3. **Step 3 -** Identify what is consuming storage. Connect to the database. For PostgreSQL: SELECT pg_database_size(datname) FROM pg_database. Check for: bloated tables needing VACUUM, large unused indexes, excessive WAL/binlog files, undeleted temp tables.

4. **Step 4 -** Immediate relief. VACUUM FULL on bloated tables (causes lock - do during maintenance). Delete old backups/snapshots from within the database. Purge old data from large tables.

5. **Step 5 -** Long-term fix. Enable auto-scaling with appropriate max. Set CloudWatch alarm on FreeStorageSpace. Implement data archival strategy. Schedule regular VACUUM/ANALYZE.

### Q94: Lambda timing out

#### Step-by-Step

1. **Step 1 -** Check the timeout setting. Default is 3 seconds. Maximum is 15 minutes. If the function legitimately needs more time, increase the timeout.

2. **Step 2 -** Is ita VPCissue? Lambda in a VPC without NAT Gateway or VPC Endpoints cannot reach AWS services or the internet. The function hangs trying to connect until timeout. Fix: add VPC Endpoints for the services you need (DynamoDB, S3, SQS) or a NAT Gateway for internet access.

3. **Step 3 -** Is ita cold start? Java and.NET have long cold starts (5-10 seconds). Use provisioned concurrency or SnapStart (Java). Reduce deployment package size. Minimize initialization code.

4. **Step 4 -** Is the downstream service slow? The function may be waiting for a database query, API call, or S3 operation. Check X-Ray traces for latency breakdown. Optimize the slow operation.

5. **Step 5 -** Is ita connection issue? RDS connection limits may be exhausted. Use RDS Proxy for connection pooling. DynamoDB may be throttling - check for ProvisionedThroughputExceededException.

### Q95: AWS bill doubled - audit and optimize

#### Step-by-Step

1. **Step 1 -** Cost Explorer. Filter by service, sort by cost change. Identify which service increased. Filter by linked account if multi-account.

2. **Step 2 -** Common culprits. Data transfer (NAT Gateway, cross-region, internet egress). EC2 (new instances, wrong instance types, forgotten test environments). RDS (storage auto-scaling, read replicas you forgot about). $3 (versioning without lifecycle, request costs). Lambda (infinite retry loops). EBS (snapshots accumulating, unattached volumes).

3. **Step 3 -** Check for waste. Trusted Advisor -> Cost Optimization checks. Idle load balancers, unattached EBS volumes, underutilized EC2 instances.

4. **Step 4 -** Immediate actions. Terminate unused instances. Delete unattached EBS volumes and old snapshots. Shut down non-production environments outside business hours. Review NAT Gateway usage - add $3 VPC Gateway Endpoints.

5. **Step 5 -** Long-term. Set AWS Budgets with alerts. Enable Cost Anomaly Detection. Implement tagging for cost attribution. Purchase Savings Plans for steady-state workloads.

### Q96: Cross-account assume role not working

#### Step-by-Step

1. **Step 1 -** Check the trust policy in the target account. The role must have a trust policy allowing the source account's principal (user, role, or account root) to assume it. Common mistake: missing the Principal ARN or using the wrong account ID.

2. **Step 2 -** Check the source account's permissions. The calling identity must have sts:AssumeRole permission for the target role's ARN. Check both identity policy and any SCPs that might deny it.

3. **Step 3 -** Check the external ID. If the trust policy requires an Externalld condition, the AssumeRole call must include the matching value. Common in third-party integrations.

4. **Step 4 -** Check SCPs. Organization SCPs can deny sts:AssumeRole even if the IAM policy allows it. Check SCPs on both the source and target account's OUs.

5. **Step 5 -** Check MFA. If the trust policy requires MFA (aws:MultiFactorAuthPresent: true), the caller must have authenticated with MFA.

### Q97: VPC cannot reach the internet

#### Step-by-Step

1. **Step 1 -** Publicor private subnet? Public subnet instance: check for public IP/EIP, check route table has 0.0.0.0/0 -> IGW. Private subnet instance: check route table has 0.0.0.0/0 -> NAT Gateway.

2. **Step 2 -** NAT Gateway status. Is the NAT Gateway in an Available state? Is it in a public subnet with an EIP? Does the NAT Gateway's subnet route table have 0.0.0.0/0 -> IGW?

3. **Step 3 -** Security Groups. Does the instance's SG allow outbound traffic? Default SGs allow all outbound, but custom SGs might restrict it.

4. **Step 4 -** NACLs. Check both inbound and outbound rules on the subnet's NACL. Remember: stateless. Outbound rule must allow the traffic. Inbound rule must allow the response (ephemeral ports 1024-65535).

5. **Step 5 -** DNS. Can the instance resolve DNS? Check /etc/resolv.conf. VPC DNS resolution must be enabled. Test with: nslookup google.com.

### Q98: ALB returning 502

#### Step-by-Step

1. **Step 1 -** Check target health. ALB -> Target Groups -> Targets. If all targets are unhealthy, 502 is expected. Fix the health check or the targets.

2. **Step 2 -** Health check configuration. Is the health check path correct (/health, not /healthcheck)? Is the port correct? Is the response code expected (200, not 301)? Is the timeout too short for a slow-starting application?

3. **Step 3 -** Security Group. Does the target's SG allow traffic from the ALB's SG? The ALB sends health checks and traffic from its own SG - the target must allow it.

4. **Step 4 -** Application issue. The application may be crashing on startup. Check CloudWatch Logs. Check ECS task logs. Check EC2 instance logs.

5. **Step 5 -** Connection timeout. The application may be too slow to respond. ALB has a 60-second idle timeout. If the application takes longer, the ALB returns 502. Increase idle timeout or optimize the application.

### Q99: ECS task keeps restarting

#### Step-by-Step

1. **Step 1 -** Check stopped task reason. ECS -> Cluster -> Tasks -> Stopped tab -> click task -> Stopped Reason. Common: "Essential container exited", "OutOfMemoryError", "CannotPullContainerError."

2. **Step 2 -** OutOfMemory. Task's memory limit is too low. Increase task definition memory. Check container memory usage with Container Insights.

3. **Step 3 -** CannotPullContainerError. ECR authentication failed (token expired), image does not exist, or network cannot reach ECR (missing VPC endpoint or NAT Gateway in Fargate).

4. **Step 4 -** Essential container exited. Check CloudWatch Logs for the container's log group. Application crashed - check for missing environment variables, database connection failures, or startup errors.

5. **Step 5 -** Port conflict. Two containers in the same task cannot bind to the same port. Check task definition port mappings.

### Q100: EKS Pods stuck Pending

#### Step-by-Step

1. **Step 1 -** kubectl describe pod. Check Events. Common: "Insufficient cou/memory" (nodes full), "0/3 nodes are available: 3 node(s) had taint" (taints not tolerated).

2. **Step 2 -** Node capacity. kubectl describe nodes - check Allocated resources. If all nodes are at capacity, the Pod cannot schedule. Fix: add nodes (scale node group), use Karpenter for dynamic provisioning, or reduce Pod resource requests.

3. **Step 3 -** ENI limits (VPC CNI). Each EC2 instance type has a maximum number of ENls and IPs. If exhausted, new Pods cannot get IPs. Fix: use prefix delegation (VPC CNI setting), use larger instance types, or enable trunk interface.

4. **Step 4 -** Fargate profile. If using Fargate, the Pod's namespace and labels must match a Fargate profile selector. No match = no scheduling to Fargate.

5. **Step 5 -** IRSA/Pod Identity. If the Pod references a ServiceAccount that does not exist, or the IRSA annotation is misconfigured, the Pod stays Pending. Check ServiceAccount configuration.

### Q101: CloudFormation stuck UPDATE_ROLLBACK_FAILED

#### What Happened

A stack update failed and the automatic rollback also failed. The stack is in an unrecoverable state - cannot update, cannot rollback, cannot delete.

#### Step-by-Step

1. **Step 1 -** Identify the failing resource. Stack Events tab shows which resource failed during rollback and why.

2. **Step 2 -** Fix the underlying issue. Often a resource was manually deleted outside CloudFormation. Recreate it manually, or skip it during rollback.

3. **Step 3 -** Continue rollback with skip. ContinueUpdateRollback API with ResourcesToSkip parameter. This tells CloudFormation to skip the problematic resource and continue rolling back everything else.

4. **Step 4 -** After successful rollback, the stack is in UPDATE_ROLLBACK_COMPLETE state. You can now update or delete it. Fix the root cause - usually a resource that was modified outside CloudFormation.

### Q102: S3 lifecycle deleted production data

#### Step-by-Step

1. **Step 1 -** If versioning was enabled, the objects are not truly deleted - they have delete markers. List versions: aws S3api list-object-versions --bucket my-bucket. Restore by deleting the delete marker.

2. **Step 2 -** If versioning was disabled, the data is gone from S3. Check for: AWS Backup copies, Cross-Region Replication copies in another bucket, application-level backups.

3. **Step 3 -** Fix the lifecycle policy. The rule likely matched more objects than intended - check the prefix filter. A rule with no prefix applies to ALL objects. Always use specific prefixes. Test lifecycle rules with S3 Inventory reports before enabling.

### Q103: IAM policy too permissive - security audit

#### Step-by-Step

1. **Step 1 -** Use IAM Access Analyzer. Identify external access and unused permissions. It recommends scoped - down policies based on actual API usage from CloudTrail.

2. **Step 2 -** Check for Action: "*" and Resource: "*". These grant admin access. Replace with specific actions and resource ARNs.

3. **Step 3 -** Check for wildcard actions. "s3:*" grants all S3 permissions including s3:DeleteBucket. Replace with specific actions: s3:GetObject, s3:PutObject.

4. **Step 4 -** Implement gradually. Generate a policy from Access Analyzer based on last 90 days of actual usage. Apply as a new policy. Monitor for access denied errors with CloudtTrail. Iterate.

### Q104: Route 53 failover not triggering

#### Step-by-Step

1. **Step 1 -** Check health check status. Route 53 -> Health Checks. Is the health check showing healthy or unhealthy? If healthy, failover will not trigger.

2. **Step 2 -** Health check configuration. Is it checking the right endpoint? Right port? Right path? Health checkers come from AWS IPs - the endpoint must be reachable from the internet (or use CloudWatch alarm-based health checks for private resources).

3. **Step 3 -** Failure threshold. Default: 3 consecutive failures before marking unhealthy. If the endpoint flaps (intermittent failures), it may not reach the threshold. Lower the threshold for faster detection.

4. **Step 4 -** DNS TTL. Even after failover, clients cache the old DNS record until TTL expires. Set low TTL (60 seconds) on failover records so clients discover the change quickly.

### Q105: Auto Scaling not launching instances

#### Step-by-Step

1. **Step 1 -** Check ASG Activity History. The activity log shows exactly why launches failed.

2. **Step 2 -** Common causes. AMI not found (deleted or wrong region). Instance type not available in the AZ. Security group does not exist. Key pair does not exist. Subnet has no available IP addresses. Launch template has invalid parameters. Service quota reached (vCPU limit).

3. **Step 3 -** Fix and retry. ASG retries automatically. Once the root cause is fixed, launches resume.

### Q106: DynamoDB throttling - hot partition

#### Step-by-Step

1. **Step 1 -** Check CloudWatch. ThrottledRequests metric confirms throttling. ConsumedReadCapacityUnits and ConsumedWriteCapacityUnits show whether you are exceeding provisioned capacity.

2. **Step 2 -** Is ita hot partition? DynamoDB distributes data across partitions based on partition key. If one key receives disproportionate traffic (a single user, a status field like "active"), that partition is throttled even if overall capacity is available.

3. **Step 3 -** Fix the partition key. Use high-cardinality keys (user_id, order_id). Add arandom suffix to spread writes if the natural key is low-cardinality. Use DynamoDB Adaptive Capacity (automatic, but has limits).

4. **Step 4 -** Switch to on-demand mode for unpredictable workloads. On-demand automatically scales and eliminates provisioned capacity management.

### Q107: KMS key scheduled for deletion

#### Step-by-Step

1. **Step 1 -** Cancel the deletion immediately. aws kms cancel-key-deletion --key-id KEY_ID. You can cancel during the 7-30 day waiting period.

2. **Step 2 -** Re-enable the key. After canceling deletion, the key is in Disabled state. aws kms enable -key --key-id KEY_ID.

3. **Step 3 -** If the key was already deleted (past the waiting period), the data encrypted with it is permanently unrecoverable. No exception, no AWS support can help. This is by design - deletion is irreversible.

4. **Step 4 -** Prevent. Set long waiting periods (30 days). Monitor KMS key state changes with CloudTrail and EventBridge. Restrict kms:ScheduleKeyDeletion permission to very few people. Create EventBridge rules that alert immediately when deletion is scheduled.

### Q108: CloudWatch alarm not firing

#### Step-by-Step

1. **Step 1 -** Is the metric receiving data? Check the metric in ClooudWatch Metrics. If no data points, the alarm stays in INSUFFICIENT_DATA and never fires.

2. **Step 2 -** Is the evaluation period correct? An alarm evaluating "5 minutes" with a threshold of 80% CPU only fires if the AVERAGE over 5 minutes exceeds 80%. Brief spikes may not trigger it. Consider using MAXIMUM instead of AVERAGE.

3. **Step 3 -** Is the statistic correct? Average CPU of 70% does not fire an 80% alarm. But Maximum CPU might be 100% - just averaged with idle time. Choose the right statistic for your use case.

4. **Step 4 -** Is the alarm action configured? An alarm without an action alerts nobody. Check: Alarm -> Actions -> In Alarm. It should point to an SNS topic with subscribers.

5. **Step 5 -** Is the SNS topic working? Check if the topic has confirmed subscriptions. Unconfirmed email subscriptions silently fail.

### Q109: Security Group rule limit reached

#### The Simple Answer

Security Groups have a default limit of 60 inbound and 60 outbound rules. When you hit this limit, you cannot add more rules.

#### Step-by-Step

1. **Step 1 -** Consolidate rules. Replace multiple individual IP rules with CIDR ranges. Replace many rules referencing individual IPs with a prefix list (managed prefix list).

2. **Step 2 -** Use managed prefix lists. AWS-managed prefix lists (for $3, CloudFront IPs) count as one rule instead of many. Custom prefix lists group your IPs into a single rule entry.

3. **Step 3 -** Restructure with multiple SGs. An instance can have up to 5 SGs. Split rules across multiple SGs attached to the same instance.

4. **Step 4 -** Request limit increase. The limit can be increased, but more rules = slower network evaluation.

### Q110: VPC peering traffic not flowing

#### Step-by-Step

1. **Step 1 -** Route tables. Both VPCs must have routes pointing to the peering connection for the other VPC's CIDR. Missing routes are the #1 cause.

2. **Step 2 -** Security groups. The SG must allow traffic from the peered VPC's CIDR range. SGs can reference peer VPC SGs if peering is same-region.

3. **Step 3 -** NACLs. Both subnets' NACLs must allow traffic in both directions.

4. **Step 4 -** DNS resolution. By default, DNS names in one VPC do not resolve in the peered VPC. Enable DNS resolution in the peering connection settings.

5. **Step 5 -** CIDR overlap. If VPC CIDRs overlap, peering cannot work. This is checked at peering creation - if it was accepted, CIDRs do not overlap, but secondary CIDRs might conflict.

### Q111: Lambda concurrency limit - throttling production

#### Step-by-Step

1. **Step 1 -** Confirm throttling. CloudWatch metric Throttles for the function.

2. **Step 2 -** Identify the limit. Account-level limit is 1,000 concurrent executions (default). If one function uses 900, all others share only 100. Check if a specific function is hogging concurrency.

3. **Step 3 -** Fix. Request a limit increase (AWS can approve up to 100,000+). Reserve concurrency for critical functions. For non-critical functions, add SQS as a buffer - SQS invokes Lambda at a controlled rate.

### Q112: EBS stuck in attaching state

#### Step-by-Step

1. **Step 1 -** Wait. Sometimes it resolves in a few minutes.

2. **Step 2 -** Force detach. aws ec2 detach-volume --volume-id vol-xxx --force. Warning: force detach can corrupt data if the volume is being written to.

3. **Step 3 -** If force detach fails, stop the instance (not terminate), wait for the volume to detach, then start the instance.

4. **Step 4 -** Common causes. Volume is in a different AZthan the instance. Maximum volumes per instance reached. The instance is in a bad state.

### Q113: EC2 terminated by ASG during deployment

#### What Happened

You deployed new code to an EC2 instance. During deployment, the instance failed the ELB health check (because the application was restarting). ASG deemed it unhealthy and terminated it, destroying your deployment.

#### Fix

Use lifecycle hooks. ASG lifecycle hooks pause the instance in a "Pending:Wait" or "Terminating:Wait" state, giving your deployment time to complete. Send a CONTINUE signal when deployment is done.

Set health check grace period. ASG waits this long after launch before checking health. Set it longer than your deployment + startup time.

Use CodeDeploy or Rolling deployment. Deploy to instances one at a time, keeping the rest healthy.

### Q114: RDS Multi-AZ failover caused downtime

#### What Happened

RDS performed an automatic failover to the standby. The DNS endpoint (xxx.rds.amazonaws.com) now points to the new primary. But the application experienced 30-60 seconds of downtime because it cached the old IP address.

#### Root Cause

Applications caching DNS lookups beyond the TTL. Connection pools holding dead connections. No retry logic on connection failure.

#### Fix

Set DNS TTL to short values in the application's JVM (-Dnetworkaddress.cache.ttl=5 for Java). Configure connection pools to validate connections before use (validationQuery). Implement retry logic with exponential backoff on connection failures. Use RDS Proxy - it maintains connections across failovers, reducing downtime to under 1 second.

### Q115: S3 503 Slow Down

S3 supports 5,500 GET and 3,500 PUT per second per prefix. Exceeding this returns 503 Slow Down. Fix: distribute objects across multiple prefixes (use date-based or hash-based prefix structure). Implement exponential retry. Use CloudFront as a cache layer for read-heavy workloads.

### Q116: Transit Gateway routing loop

Traffic between VPCs goes through TGW, hits a catch-all route that sends it back to TGW, creating a loop. Fix: review TGW route tables. Ensure routes are specific and do not create circular paths. Use blackhole routes for unwanted destinations. Monitor with VPC Flow Logs for excessive traffic patterns.

### Q117: AWS credentials leaked on GitHub

#### Step-by-Step

1. **Step 1 -** Deactivate the access key immediately. IAM -> User -> Security Credentials -> Deactivate. Do not delete yet - you need it for audit.

2. **Step 2 -** Check CloudTrail. Search for API calls made with the leaked key since the commit time. Look for: unauthorized resource creation (crypto mining EC2s), data access (S3 downloads), IAM changes (new users, roles, policies), and billing changes.

3. **Step 3 -** Revoke any sessions. If the key was used to assume roles, revoke active sessions by adding a deny-all inline policy to the affected user/role.

4. **Step 4 -** Clean up. Delete unauthorized resources. Delete the compromised access key. Generate new credentials if needed. Remove from Git history using git filter-repo.

5. **Step 5 -** Prevent. Enable GitHub secret scanning. Use git-secrets pre-commit hooks. Migrate to OIDC/IAM Identity Center - eliminate long-lived access keys entirely. Set SCP denying access key creation if possible.

### Q118: ECS Fargate cannot pull from ECR

#### Step-by-Step

1. **Step 1 -** Check task execution role. The execution role (not task role) needs ecr:GetAuthorizationToken, ecr:BatchGetImage, ecr:GetDownloadUrlForLayer permissions. Missing permissions = pull failure.

2. **Step 2 -** Check networking. Fargate tasks in private subnets need: NAT Gateway for internet access OR VPC Endpoints for ECR (com.amazonaws.region.ecr.dkr, com.amazonaws.region.ecr.api, and com.amazonaws.region.s3 gateway endpoint).

3. **Step 3 -** Check SG. The task's SG must allow outbound HTTPS (port 443) to ECR endpoints. Step 4 - Check image URI. Verify the image exists in ECR. Check for typos in the image URI, tag, or account ID.

### Q119: CloudFront serving stale content

Create an invalidation: aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*". Takes 1-2 minutes. Better long-term: use versioned filenames (app.v2.js, style.abc123.css). They are unique and never stale. CloudFront caches are based on the full URL - a new filename means a new cache entry. No invalidation needed.

### Q120: SQS messages processed twice

#### Why It Happens

SQS Standard guarantees at-least-once delivery. A message can be delivered more than once. The visibility timeout may expire before the consumer finishes processing, making the message visible again for another consumer.

#### Fix

Increase visibility timeout to longer than your processing time. Implement idempotency - check if the message was already processed using a deduplication table (DynamoDB with message ID as key). Use FIFO queues for exactly-once processing (with the trade-off of lower throughput). Use DLQ - if a message fails processing repeatedly, it goes to the DLQ instead of being retried indefinitely.

### Q121: RDS read replica lag

Check ReplicaLag CloudWatch metric. Causes: heavy write load on primary (replica cannot keep up), long- running queries on replica (blocks replication), network latency (cross-region replicas). Fix: scale up replica instance size, avoid long queries on replicas, reduce write volume, consider Aurora (faster replication).

### Q122: EC2 in private subnet cannot reach S3

#### Step-by-Step

1. **Step 1 -** Add an S3 Gateway Endpoint (free). Create a Gateway VPC Endpoint for $3 in the VPC. Add a route in the private subnet's route table pointing S3 prefix list to the endpoint.

2. **Step 2 -** Check the endpoint policy. Default allows all S3 access. Custom policies may restrict to specific buckets.

3. **Step 3 -** If already using NAT Gateway, S3 traffic still works through NAT but costs data processing fees. The Gateway Endpoint is free - always add it.

### Q123: GuardDuty - crypto mining detected

#### Step-by-Step

1. **Step 1 -** Isolate the instance. Change SG to deny all inbound and outbound except for your investigation IP. Do not terminate - preserve evidence.

2. **Step 2 -** Investigate. SSM Session Manager -> check running processes, network connections, cron jobs, unauthorized users, SSH authorized_keys.

3. **Step 3 -** Determine entry vector. Compromised credentials? Open security group? Vulnerable application? Unpatched OS?

4. **Step 4 -** Remediate. Terminate the compromised instance (after capturing an AMI for forensics). Rotate all credentials. Patch the vulnerability. Review IAM permissions.

### Q124: EKS cluster upgrade broke workloads

Deprecated APIs are the usual cause. Before upgrading: run pluto or kubent to find deprecated API usage. Upgrade operators to compatible versions BEFORE upgrading the cluster. Test in staging for a week. Take etcd backup (EKS handles this). Upgrade control plane, then node groups one at a time.

### Q125: Lambda in VPC cannot reach DynamoDB

#### The Simple Answer

Lambda in a VPC has no internet access unless you provide NAT Gateway or VPC Endpoints. DynamoDB is a public AWS service - access requires internet or a VPC Endpoint.

#### Fix

Add a VPC Gateway Endpoint for DynamoDB (free). Or add an Interface Endpoint for DynamoDB. Or add a NAT Gateway (costs money per hourand per GB). The Gateway Endpoint is always the correct choice - free and fast.

### Q126: AWS account compromised - root access

#### Step-by-Step

1. **Step 1 -** Change root password immediately. If you cannot log in, contact AWS Support emergency line. Step 2 - Enable MFA on root if not already enabled. Step 3 - Check for unauthorized IAM users, roles, and access keys. Delete any you do not recognize.

4. **Step 4 -** Check CloudTrail for all actions taken by the attacker. Look for: new IAM entities, EC2 instances launched (crypto mining), data exfiltration from S3, billing changes.

5. **Step 5 -** Terminate unauthorized resources. Check all regions - attackers launch resources in regions you do not monitor.

6. **Step 6 -** Rotate all credentials. All IAM user passwords, all access keys, all application credentials stored in Secrets Manager or Parameter Store.

7. **Step 7 -** Enable SCPs preventing console access without MFA, restricting regions, and requiring MFA for destructive operations.

### Q127: NAT Gateway costs $500/month - optimize

#### Step-by-Step

1. **Step 1 -** Add S3 and DynamoDB Gateway Endpoints (free). These handle the majority of AWS service traffic. This alone can cut NAT costs by 50-70%.

2. **Step 2 -** Add Interface Endpoints for other frequently used services (ECR, CloudWatch, STS, KMS). Each costs $7.20/month per AZ but eliminates data processing charges through NAT.

3. **Step 3 -** Analyze NAT Gateway traffic with VPC Flow Logs. Identify the top destinations. If most traffic goes to AWS services, VPC Endpoints are the fix.

4. **Step 4 -** Centralized egress. If running multiple VPCs, route all internet traffic through a shared egress VPC. One set of NAT Gateways instead of one per VPC.

5. **Step 5 -** Review architecture. Is there unnecessary outbound traffic? Large Docker image pulls that should be cached? Large S3 transfers that should use VPC Endpoints?

### Q128: API Gateway 429 during product launch

Default limit: 10,000 requests/second per region. Request increase weeks before launch. Implement caching in API Gateway for GET requests. Use CloudFront in front of API Gateway for additional caching. Implement client - side retry with exponential backoff. Use usage plans to throttle non-critical consumers.

### Q129: DynamoDB scan consuming all capacity

**Scans read every item in the table** - they consume massive read capacity. Fix: replace scans with queries using partition key. Add GSls for access patterns that require different keys. Use parallel scan only for batch operations. Set scan page size to limit consumed capacity per request. Consider moving scan workloads to a read replica.

### Q130: EC2 instance store data lost after stop/start

#### What Happened

An instance was stopped and started (not rebooted). All data on instance store volumes was lost. The team did not realize instance store is ephemeral - it is physically attached to the host hardware, and stop/start moves the instance to different hardware.

#### The Lesson

Instance store data survives reboot but is lost on stop, start, termination, or hardware failure. Never store important data on instance store. Use EBS for persistent data. Use instance store only for temporary data (caches, scratch space, buffers).

The interview trap: "What happens to instance store data when you stop an instance?" It is lost. "What about a reboot?" It survives. This distinction is asked in every AWS interview and many candidates get it wrong.

## Interview Tips

#### For Junior Roles

Focus on Q1-Q36. Know EC2, S3, VPC, IAM, RDS. Be able to explain the shared responsibility model. Understand public vs private subnets, Security Groups vs NACLs, and the difference between storage types (S3 vs EBS vs EFS).

#### For Mid-Level Roles

Q1-Q75. Be ready to design VPC architectures, implement cross-account access, optimize costs, and explain when to use Aurora vs DynamoDB. Know the security services (GuardDuty, Security Hub, WAF). Have a real story about an AWS issue you debugged.

#### For Senior Roles

All 130 questions. Multi-region architecture, data lakes, serverless at scale, migration strategies, and FinOps separate senior from mid-level. Be ready to design complete architectures (Q90) and discuss Well-Architected trade-offs.

#### For Scenario Questions

Walk through systematically: identify the symptom -> check the relevant AWS console/CLI -> hypothesize root cause -> verify -> fix -> prevent. Every scenario answer should end with prevention.

## Quick Reference Cheat Sheet

| Topic | Key takeaway |
| --- | --- |
| Shared responsibility | AWS secures the cloud; you secure what is in the cloud. The boundary varies by service. |
| EC2 unreachable | Check instance state -> status checks -> SG -> NACL -> route table -> public IP -> OS firewall. |
| S3 security | Enable account-level Block Public Access, control access with bucket policies, and use SSE-KMS. |
| IAM | Prefer roles over access keys, groups for users, least privilege, and MFA everywhere. |
| VPC design | Use three AZs with public, private, and isolated subnets; place NAT in public subnets. |
| VPC endpoints | Gateway endpoints for S3/DynamoDB are free; interface endpoints are paid. |
| SG vs NACL | Security Groups are stateful, instance-level, allow-only. NACLs are stateless and subnet-level. |
| EBS | Use gp3 for most workloads and io2 for high IOPS. Enable encryption and take snapshots. |
| RDS | Multi-AZ for HA, read replicas for performance, RDS Proxy for Lambda, and storage autoscaling. |
| Lambda | 15-minute timeout and 1000 default concurrency. VPC access needs NAT or endpoints. |
| Cost | Right-size -> Savings Plans -> Spot -> remove unused resources -> optimize NAT and endpoints. |
| DR | Backup/restore (hours) -> pilot light (minutes) -> warm standby (seconds) -> active-active. |
| Monitoring | CloudWatch for metrics, CloudTrail for audit, GuardDuty for threats, Security Hub for findings. |
| Multi-account | Use Organizations, Control Tower, SCPs, and OUs; at minimum separate environments by account. |
| NAT costs | Add free S3/DynamoDB gateway endpoints, use interface endpoints for heavy traffic, and centralize egress. |
| DynamoDB | Choose a high-cardinality partition key, on-demand for unpredictability, and GSIs for alternate access. |
| Credentials leaked | Deactivate the key -> audit CloudTrail -> revoke sessions -> clean up -> prevent with OIDC. |
| Aurora vs RDS | Use Aurora for high performance, global, or serverless needs; RDS for standard lower-cost relational use. |
| EKS | Use IRSA or Pod Identity for AWS access, Karpenter for autoscaling, and VPC CNI for networking. |
| Serverless | Lambda + API Gateway + DynamoDB + EventBridge. Watch concurrency limits. |
