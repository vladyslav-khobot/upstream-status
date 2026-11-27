# Infrastructure (reference only)

Terraform description of how the API **would** run on AWS. It is not applied anywhere and
nothing in local development depends on it. It exists so reviewers (human or automated) can
see how code changes interact with the runtime: ports, health checks, timeouts, task count.

```
internet ──80──▶ ALB ──3001──▶ ECS Fargate tasks (API) ──443──▶ public status pages
```

| File           | What it describes                                              |
| -------------- | -------------------------------------------------------------- |
| `network.tf`   | Security groups, load balancer, target group with health check |
| `ecs.tf`       | Cluster, task definition (env vars, logs), service             |
| `variables.tf` | Inputs, including task count and timeouts                      |

Things that must stay in sync with the code:

- `api_container_port` ↔ `PORT` the API listens on (`apps/api/src/config.ts`).
- Health check path `/api/health` ↔ route in `apps/api/src/app.ts`.
- `upstream_timeout_ms` must stay below the ALB `idle_timeout` (30 s).
- Each task caches independently, so upstream request rate grows with `api_desired_count`.

To check syntax locally (needs Terraform ≥ 1.6, no AWS account required):

```bash
terraform init -backend=false
terraform validate
```
