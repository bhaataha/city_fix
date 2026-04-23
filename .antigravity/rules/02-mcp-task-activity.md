# mcp_autopilot_task_activity — Comments, Research, File Changes, Questions

## Actions: add_comment | add_research | log_file_change | ask_question | answer_question | get_changelog | get_comments | get_questions

### add_comment
| Parameter | Required | Values |
|-----------|----------|--------|
| taskId | ✅ | Task ID |
| content | ✅ | Comment text (Markdown) |
| type | — | COMMENT, TECHNICAL_RESEARCH, BUSINESS_RESEARCH, MANUAL_SETUP, RESULT |

**Rule:** Add comments at EVERY milestone. Use RESULT for completion summaries. Use MANUAL_SETUP when user action needed.

### add_research
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | ✅ | Task ID |
| researchType | ✅ | TECHNICAL or BUSINESS |
| summary | ✅ | 1-2 sentence overview |
| sources | ✅ | File paths or URLs examined |
| findings | ✅ | Detailed findings (Markdown) |
| recommendations | — | Action items |

**Rule:** Call add_research BEFORE writing ANY code. No exceptions for "quick fixes."

### log_file_change
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | ✅ | Task ID |
| filePath | ✅ | Relative path (e.g. src/auth/jwt.ts) |
| changeType | ✅ | CREATED, MODIFIED, or DELETED |
| description | ✅ | SPECIFIC description of what changed and WHY |
| linesAdded | — | Approximate lines added |
| linesDeleted | — | Approximate lines removed |

**Rule:** Call IMMEDIATELY after EACH file edit. NEVER batch. Description must be specific — never "Updated file" or "Changes."

### ask_question
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | ✅ | Task ID |
| questionText | ✅ | Clear, specific question |
| category | ✅ | TECHNICAL_DECISION, ARCHITECTURE, UX, CLARIFICATION, APPROVAL_REQUEST |
| priority | — | LOW, MEDIUM, HIGH, CRITICAL |
| context | — | Background context (Markdown) |
| options | — | [{ label: "Option A", recommended: true }] |

**Rule:** ALL escalations go through ask_question. NEVER ask questions in chat text. If a low-risk option is recommended, choose it and continue instead of asking.
