---
tags: [skill]
aliases: [aws-lambda, aws-lambda-durable-functions, aws-serverless-deployment, api-gateway]
---
# AWS Serverless Skills

A secondary, opt-in backend tier for builds that specifically require AWS infrastructure. The default stack is Vercel + Supabase; reach here only when a client engagement calls for AWS serverless — long-running workflows, saga patterns, or enterprise API gateway requirements that exceed what Vercel functions can handle.

## What it does
- **aws-lambda** — design, build, deploy, and debug serverless apps and event-driven architecture on AWS Lambda.
- **aws-lambda-durable-functions** — resilient long-running multi-step workflows with state persistence, automatic retries, saga pattern, and human-in-the-loop callbacks.
- **aws-serverless-deployment** — infrastructure-as-code deployment using AWS SAM and CDK for serverless applications.
- **api-gateway** — REST, HTTP, and WebSocket APIs with Lambda authorizers, usage plans, throttling, CORS configuration, and custom domain mapping.

## Used in / pairs with
- [[Vercel Platform Skills]] — Vercel is the default deployment target; AWS Serverless is the escalation path when Vercel edge functions hit limitations.
- [[AI SDK & Agent Building]] — long-running agentic workflows may require durable execution and state persistence that Lambda + Step Functions provide.

## Connections
- [[Skills MOC]]
- [[Vercel Platform Skills]]
- [[AI SDK & Agent Building]]
- [[Automation & Orchestration]]
- [[Performance, Testing & QA]]
