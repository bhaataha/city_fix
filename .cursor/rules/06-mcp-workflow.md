# mcp_autopilot_workflow — Workflow Automation

## Actions: list | get | create | update | delete | trigger | list_runs | get_run

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| action | enum | ✅ | list, get, create, update, delete, trigger, list_runs, get_run |
| workflowId | string | get/update/delete/trigger/list_runs | Workflow ID |
| runId | string | get_run | Workflow run ID |
| projectId | string | list/create | Project ID |
| name | string | create | Workflow name |
| description | string | — | Workflow description |
| steps | object[] | create | Step format: [{ action, params }] |
| triggers | object | — | Auto-trigger conditions |
| isActive | boolean | — | Active state (for update) |
| context | object | — | Context data (for trigger) |

## Seeded Workflows: AI Development, Bug Triage, Code Review, Release, CI/CD, Security Audit.
