/**
 * Starter templates per AI tool.
 * Client-safe: no server imports, no next/server, no db.
 */

export interface ToolTemplate {
  label: string;
  input: string;
}

const TEMPLATES: Record<string, ToolTemplate[]> = {
  'prompt-improver': [
    {
      label: 'Improve a research prompt',
      input: 'research the best CRM software for a small consulting business',
    },
    {
      label: 'Improve a writing prompt',
      input: 'write a blog post about time management for remote workers',
    },
    {
      label: 'Improve an analysis prompt',
      input: 'analyze our quarterly sales numbers and tell me what to focus on',
    },
    {
      label: 'Improve a planning prompt',
      input: 'help me plan a product launch for a mobile app',
    },
  ],

  'email-drafter': [
    {
      label: 'Weekly status update',
      input:
        `update for my manager: finished the client report, waiting on legal review for the contract, ` +
        `blocked on budget approval for the new hire, next week starting the Q3 planning`,
    },
    {
      label: 'Schedule slip notice',
      input:
        `tell the team the launch moved from Tuesday to Friday because QA found two critical bugs, ` +
        `apologize for short notice, ask everyone to update their task boards by tomorrow morning`,
    },
    {
      label: 'Follow-up after meeting',
      input:
        `follow up with Sarah after today's pricing meeting: thank her for the walkthrough, ` +
        `confirm we agreed on the tiered model, ask for the revised spreadsheet by Thursday`,
    },
    {
      label: 'Decline a request politely',
      input:
        `decline the vendor's invitation to their conference next month, we don't have budget ` +
        `this quarter, keep the door open for next year`,
    },
  ],

  summarizer: [
    {
      label: 'Try: meeting recap',
      input:
        `Project sync — 14 Jun. We decided to push the API migration to Q3 to avoid disrupting ` +
        `the live product during peak season. Risk flagged: the legacy auth tokens will expire in ` +
        `August, so the migration window is tight. Follow-up 1: Priya to share the revised ` +
        `migration runbook by Friday. Follow-up 2: Dev team to spike the token-refresh endpoint ` +
        `next sprint and report back at the 21 Jun sync.`,
    },
    {
      label: 'Try: policy excerpt',
      input:
        `Employees who have completed 90 days of continuous employment are eligible to work remotely ` +
        `up to three days per week, subject to manager approval. Remote work requests must be ` +
        `submitted through the HR portal no later than the last Friday of each month for the ` +
        `following month. Exceptions for hardship circumstances require VP-level sign-off and must ` +
        `be logged with HR within 48 hours. This policy takes effect 1 September and supersedes ` +
        `the interim remote-work guidance issued in March.`,
    },
    {
      label: 'Try: incident report',
      input:
        `On 11 Jun at 14:32 UTC the payments API began returning 503 errors, affecting ` +
        `approximately 2 400 checkout attempts over 38 minutes. The on-call engineer identified ` +
        `a memory leak in the new session-pooling code deployed at 13:55 UTC and rolled back to ` +
        `the previous build at 15:10 UTC. Customer impact: roughly 340 orders failed and required ` +
        `manual reprocessing; no data loss occurred. Root cause was insufficient load testing of ` +
        `the pooling logic under concurrent write bursts — corrective action is a pre-deploy ` +
        `load test gate added to CI.`,
    },
    {
      label: 'Try: product update',
      input:
        `Version 4.2 ships two headline improvements: bulk CSV export now supports up to ` +
        `100 000 rows (previously 10 000) and the dashboard redesign reduces page load time ` +
        `by 42 % on mobile. We have also introduced per-workspace API keys, replacing the single ` +
        `organisation-level key. Note: the legacy organisation key will continue to work until ` +
        `31 December; after that date it will be revoked. The old PDF report endpoint ` +
        `/api/v1/report is deprecated as of this release and will be removed in v5.0.`,
    },
  ],

  'meeting-actions': [
    {
      label: 'Try: project sync notes',
      input:
        `Weekly project sync 16 Jun\n` +
        `- James: backend done, PR open for review\n` +
        `- Leila: design sign-off received, handed assets to dev\n` +
        `- Tom: still blocked on staging creds -- needs DevOps (urgent)\n` +
        `- Decision: skip beta to external users this sprint, ship internally only\n` +
        `- Tom to follow up with DevOps today\n` +
        `- James to review Leila PR by Wed\n` +
        `- All: update JIRA tickets before EOD Friday`,
    },
    {
      label: 'Try: shift handoff',
      input:
        `Night shift handoff -- 17 Jun 06:00\n` +
        `Server rack B3 running warm, facilities notified, ticket #4412 open.\n` +
        `Customer escalation (acct #88201) waiting for billing team callback -- promised before noon.\n` +
        `Scheduled maintenance window 22:00-02:00 tonight; change record CR-791 approved.\n` +
        `Nothing else outstanding, day shift clear to proceed.`,
    },
    {
      label: 'Try: client call notes',
      input:
        `Call with Meridian Corp -- 15 Jun, 45 min\n` +
        `They are happy with phase 1 delivery. Raised concern about report latency -- ` +
        `we agreed to investigate and respond within 5 business days.\n` +
        `Next step: we send revised SLA doc by 19 Jun; they sign by 26 Jun.\n` +
        `Open question: do they want SSO included in phase 2 or as a separate engagement? ` +
        `Ana to confirm with their IT lead.`,
    },
    {
      label: 'Try: standup notes',
      input:
        `Standup 17 Jun\n` +
        `Alex: finished auth refactor, starting on notification service today, no blockers.\n` +
        `Britta: PR #214 in review, waiting on Carlos. Blocked: needs spec clarification on ` +
        `export filter -- leaving a comment.\n` +
        `Carlos: reviewing Britta PR this morning, then fixing the intermittent test flake in CI ` +
        `(ticket #389). Blocker: CI keeps timing out, needs infra team to bump the runner timeout.`,
    },
  ],

  'output-checker': [
    {
      label: 'Try: stats-heavy claim',
      input:
        `Studies show that 87 % of companies that adopt AI-powered project management tools see ` +
        `a significant reduction in delivery delays within the first quarter. Our platform is built ` +
        `on this research and is guaranteed to reduce your operational costs by at least 30 %. ` +
        `Businesses that don't act now risk falling irreversibly behind their competitors who are ` +
        `already leveraging these proven advantages.`,
    },
    {
      label: 'Try: technical assertion',
      input:
        `Our proprietary compression algorithm achieves a 94.7 % lossless compression ratio on ` +
        `unstructured JSON payloads, outperforming gzip by 3.2x at identical CPU overhead. This is ` +
        `because we exploit the specific entropy characteristics of nested key repetition that ` +
        `standard deflate codecs cannot optimise. Independent benchmarks conducted on enterprise ` +
        `datasets confirm these figures consistently across all payload sizes above 1 KB.`,
    },
    {
      label: 'Try: historical summary',
      input:
        `The Great Fire of London broke out in September 1666 and destroyed more than 13 000 houses ` +
        `across the city. Experts widely agree that the fire ultimately led to the invention of ` +
        `modern fire insurance and transformed urban planning practices throughout Europe. The ` +
        `rebuilding effort, completed in under five years, produced the version of London that ` +
        `travellers would have recognised throughout the entire eighteenth century.`,
    },
    {
      label: 'Try: product comparison',
      input:
        `In independent head-to-head testing, ToolX processed 1 847 records per second compared ` +
        `to ToolY 612 -- a 3.02x throughput advantage. ToolX also uses 41 % less memory under ` +
        `peak load. Customer satisfaction surveys show that 96 % of ToolX users would recommend ` +
        `it to a colleague, versus only 54 % for ToolY. These results make ToolX the clear choice ` +
        `for any team serious about performance.`,
    },
  ],
};

export function getTemplates(toolId: string): ToolTemplate[] {
  return TEMPLATES[toolId] ?? [];
}
