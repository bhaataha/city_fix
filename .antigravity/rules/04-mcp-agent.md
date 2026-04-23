# mcp_autopilot_agent — AI Agent Management

## Actions: list | get | create | update | delete

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| action | enum | ✅ | list, get, create, update, delete |
| agentId | string | get/update/delete | Agent ID |
| projectId | string | list/create | Project ID |
| name | string | create | Agent name |
| systemPrompt | string | create | System prompt for the agent |
| description | string | — | Agent description |
| role | enum | — | DEVELOPER, REVIEWER, PLANNER, TESTER, ARCHITECT, DEVOPS |
| capabilities | object | — | Key-value pairs of agent capabilities |

## Roles
- **DEVELOPER**: Writes code and implements features
- **REVIEWER**: Reviews code and provides feedback
- **PLANNER**: Creates plans and breaks down tasks
- **TESTER**: Writes and runs tests
- **ARCHITECT**: Designs system architecture
- **DEVOPS**: Handles deployment and infrastructure
