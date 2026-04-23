# Dashboard REST API — Templates & Remote Execution

## Task Templates (42 pre-built across 10 categories)
- FEATURE(8), BUGFIX(5), REFACTORING(4), INTEGRATION(4), UI(4), RESEARCH(4), DOCUMENTATION(3), TESTING(4), PLANNING(3), REVIEW(3)
- `GET /api/projects/:id/templates` — List templates
- `POST /api/templates/:id/apply` — Create task from template

## Send to AI (Remote Execution)
- `POST /api/tasks/:id/execute` — Sends task prompt to connected IDE chat via WebSocket
- Returns `{ success, delivered, connectedClients, message }`
- Prompt includes: task context + mandatory MCP rules (set status, log files, add comments, ask approval)
