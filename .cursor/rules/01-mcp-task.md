# mcp_autopilot_task — Task Management

## Actions: list | get | create | update | delete

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| action | enum | ✅ | list, get, create, update, delete |
| taskId | string | get/update/delete | Task ID |
| projectId | string | list/create | Project ID |
| title | string | create/update | Task title |
| instructions | string | create | Detailed task instructions (Markdown) |
| taskKnowledge | string | — | Architecture context, file paths, API specs |
| status | enum | — | TODO, IN_PROGRESS, IN_REVIEW, COMPLETE, CANCELLED |
| priority | enum | — | LOW, MEDIUM, HIGH, CRITICAL |
| category | enum | — | FEATURE, BUGFIX, REFACTORING, INTEGRATION, UI, RESEARCH, DOCUMENTATION, TESTING, PLANNING, REVIEW, QUESTION |
| tags | string[] | — | Tags for filtering or categorization |
| aiWorkingOn | boolean | — | Set true when starting, false when done. ONE task at a time. |

## Rules
- **ALWAYS `list` before `create`** to prevent duplicates
- **ALWAYS `get` before starting work** to read full context
- Create with detailed title + instructions + acceptance criteria
- Set `aiWorkingOn: true` when starting, `false` when pausing/completing
- Default to autonomous execution. Escalate only destructive, high-risk, or ambiguous transitions.

## REST-Only: Send to AI
- `POST /api/tasks/:id/execute` — sends task to connected IDE chat
- Returns `{ delivered, connectedClients, message }`
