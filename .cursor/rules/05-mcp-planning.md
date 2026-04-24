# mcp_autopilot_planning — Pre-Development Pipeline

## Actions: research | plan | generate_workflow | generate_tasks | get | list | approve | archive

### Pipeline Flow (for FEATURE/INTEGRATION/REFACTORING)
1. `research` — Document goal + findings
2. `plan` — Create implementation plan + tech decisions
3. `generate_workflow` — Auto-generate workflow from plan
4. `generate_tasks` — Auto-generate TODO tasks
5. `approve` — Mark plan as ACTIVE (after APPROVAL_REQUEST)
6. Start coding on generated tasks

| Parameter | Required For | Description |
|-----------|-------------|-------------|
| projectId | research/list | Project ID |
| planId | plan/generate_*/get/approve/archive | Plan ID |
| goal | research | e.g. "Add OAuth login" |
| findings | research | { alternatives, techStack, risks, codebaseAnalysis } |
| plan | plan | { phases: [{ name, description, files?, estimatedEffort? }] } |
| techDecisions | plan | [{ decision, rationale, alternatives, chosen }] |

**Rule:** Use full pipeline for features/integrations (>3 files). Skip for quick bugfixes (<2 files).

## Dashboard: Visual pipeline stepper, rich plan detail view, one-click workflow/task generation.
