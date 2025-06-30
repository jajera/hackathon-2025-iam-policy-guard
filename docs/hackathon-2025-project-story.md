# IAM Policy Monitor – Hackathon 2025 Entry

## Inspiration

Modern AWS environments quickly grow crowded with IAM users, roles, and policies. A single accidental attachment of `AdministratorAccess` can expose your organization to massive risk—often discovered only after an audit or, worse, a breach.

We wanted a **self-healing security layer** that:

* Detects dangerous IAM changes in real-time
* Instantly rolls them back if needed
* Explains what happened in plain language
* Runs for (almost) free, with no servers to manage

Using just Lambda, EventBridge, and S3, we built **IAM Policy Monitor**—a lightweight but powerful guardrail for AWS IAM.

---

## What It Does

1. **Real-time detection** – CloudTrail events stream into a Detector Lambda that evaluates every IAM API call against YAML-defined rules.
2. **AI triage** – For medium-severity changes, the Detector queries Claude 3 Sonnet via Amazon Bedrock to explain the potential risk.
3. **Automated rollback** – High and critical violations go straight to an SQS queue, where a Remediator Lambda detaches or deletes the offending policy—usually within seconds.
4. **Audit + analytics** – Every event is written to versioned S3 buckets, partitioned for low-cost querying in Athena.
5. **Alerting + dashboards** – Slack/SNS alerts plus a CloudWatch dashboard give real-time visibility into IAM trends.

All of this deploys with a single `terraform apply` and runs entirely within the AWS free tier.

---

## How We Built It

* **Runtime** – Python 3.13 Lambdas packaged as a reproducible ZIP, built with Bash.
* **Infrastructure** – Terraform module (\~2 KLOC), with optional submodules for Bedrock, Athena, dashboards, and CodeBuild tests.
* **Rules engine** – YAML-as-code evaluated with glob matching; no heavyweight policy-as-code tools.
* **Safety net** – A `remediator-config.json` file lets teams exclude critical users or policies.
* **CI/CD** – GitHub Actions runs lint/tests and builds; CodeBuild runs live sandbox tests.

---

## Challenges We Ran Into

* **Cold starts** – Bedrock SDK bloated the ZIP. We trimmed dependencies and lazy-loaded the client to keep p95 < 600 ms.
* **IAM eventual consistency** – DetachPolicy took up to 2 mins to reflect in ListAttached\* calls. We added retries with backoff.
* **Overbroad protection** – Our early blocklist prevented remediation of `AdministratorAccess`. We refined it and added S3-based overrides.

---

## Accomplishments We're Proud Of

* Secure by default: **0 publicly exposed endpoints** and strict least-privilege permissions.
* Average time from detection to remediation: **18 seconds**.
* Entire solution—Terraform, Lambda, tests, docs—fits in **< 5 MB**.

---

## What We Learned

* A simple rules engine beats complex frameworks when scoped well.
* Bedrock is worth the latency/cost for ambiguous cases.
* Terraform's `filemd5()` trick enables hot-reload of config files without redeploy.

---

## What's Next

* **Multi-account support** – One deploy, org-wide impact via EventBridge Pipes.
* **Custom remediators** – Teams can plug in their own logic, e.g., to update SCPs.
* **Vault-style approvals** – Slack buttons for "Fix / Ignore / Justify" workflows.
* **OpenTelemetry** – Trace flows into X-Ray for observability.

---

## Hackathon Submission Details

### **Complete List of AWS Tools Used:**

* **AWS Lambda** - Core serverless compute for detection and remediation functions
* **Amazon EventBridge** - Event routing and status publishing
* **AWS CloudTrail** - IAM API call monitoring and logging
* **Amazon S3** - Event storage, CloudTrail logs, and configuration files
* **Amazon SQS** - Reliable message queuing for remediation jobs
* **Amazon SNS** - Email notification delivery
* **Amazon Bedrock** - AI-powered risk analysis using Claude 3 Sonnet
* **Amazon CloudWatch** - Monitoring, dashboards, and log management
* **Amazon Athena** - SQL analytics on stored security events
* **AWS CodeBuild** - Automated testing infrastructure
* **AWS IAM** - Permission management and role-based access
* **AWS Systems Manager Parameter Store** - Configuration management

### **How AWS Lambda Powers This Project:**

AWS Lambda serves as the core execution engine with two primary functions:

1. **Detector Lambda**: Triggered by EventBridge when CloudTrail detects IAM policy changes. It evaluates events against YAML-defined security rules, performs risk scoring (CRITICAL/HIGH/MEDIUM/LOW), and for medium-severity violations, queries Amazon Bedrock AI for threat analysis. High/critical violations are queued to SQS for immediate remediation.

2. **Remediator Lambda**: Processes SQS messages containing policy violations. It automatically detaches dangerous IAM policies, implements safety checks to protect critical system roles, and publishes success/failure status events back to EventBridge for notification workflows.

Both functions use Python 3.13 runtime with optimized cold start performance (<600ms p95) and implement retry logic with exponential backoff for reliability.

### **Lambda Triggers Implemented:**

✅ **Yes** - Multiple Lambda triggers:

* **EventBridge trigger** for the Detector Lambda (IAM policy change events from CloudTrail)
* **SQS trigger** for the Remediator Lambda (violation messages requiring immediate action)
* **CloudWatch Events** for status monitoring and alerting workflows

---

### Built With

Amazon Athena · Amazon Bedrock · Amazon EventBridge · Amazon S3 · AWS Lambda · CloudWatch · CodeBuild · GitHub Actions · Parameter Store · Python 3 · Slack API · SNS · SQS · Terraform
