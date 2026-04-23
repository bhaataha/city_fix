# mcp_autopilot_project — Project Management

## Actions: list | get | create | update | delete | archive

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| action | enum | ✅ | list, get, create, update, delete, archive |
| projectId | string | get/update/delete/archive | Project ID |
| name | string | create | Project name |
| description | string | — | Project description |
| teamId | string | — | Team ID for filtering or association |

## Usage
- Call `list` first to get projectId for other tools
- Every task, workflow, and agent belongs to a project
