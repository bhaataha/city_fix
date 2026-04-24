# mcp_autopilot_webhook — Webhook Management

## Actions: list | create | delete | test

| Parameter | Required | Description |
|-----------|----------|-------------|
| action | ✅ | list, create, delete, test |
| webhookId | delete/test | Webhook ID |
| projectId | list/create | Project ID |
| url | create | Delivery URL |
| events | create | e.g. ["task.created", "task.completed"] |
| secret | — | HMAC signing secret (auto-generated if omitted) |

---

# mcp_autopilot_analytics — Analytics & Metrics

## Actions: project_stats | agent_performance | task_metrics

| Parameter | Required | Description |
|-----------|----------|-------------|
| action | ✅ | project_stats, agent_performance, task_metrics |
| projectId | project_stats/task_metrics | Project ID |
| agentId | agent_performance | Agent ID |
| groupBy | — | status, priority, category, day |
| fromDate | — | ISO 8601 start date |
| toDate | — | ISO 8601 end date |

---

# mcp_autopilot_team — Team Management

## Actions: list | get | create | delete | add_member | remove_member | update_role

| Parameter | Required | Description |
|-----------|----------|-------------|
| action | ✅ | list, get, create, delete, add_member, remove_member, update_role |
| teamId | get/delete/member ops | Team ID |
| name | create | Team name |
| userId | member ops | User ID |
| role | add_member/update_role | ADMIN, MEMBER, VIEWER |
