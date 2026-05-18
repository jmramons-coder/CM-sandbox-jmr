import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ChevronDown, FileText, Maximize2, MessageSquare, Pencil, Plus, Search } from 'lucide-react';
import { AgentSearchOptionContent, CaseSearchOptionContent, InitialsAvatar } from './ds';
import { toAgentSummarySearchResult } from '../utils/agent-display';
import { toCaseSummarySearchResult } from '../utils/case-display';
import { useTranslation } from 'react-i18next';
import VerticalNav from './VerticalNav';
import { SimpleLogo } from './SimpleLogo';
import { UserMenu } from './UserMenu';
import { ProductGuideModal } from './ProductGuideModal';
import {
  AiCopilotDock,
  GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT,
  type ChatArtifact,
} from './AiCopilotFooter';
import { AiCueSparkle } from './AiCueSparkle';
import { CasesNavProvider } from '../contexts/CasesNavContext';
import { GlobalCreateProvider } from '../contexts/GlobalCreateContext';
import { FoldersNavProvider } from '../contexts/FoldersNavContext';
import { CopilotProvider, useCopilot, newChatDefaultTitle, type ReplyHandler } from '../contexts/CopilotContext';
import { LiveContextProvider } from '../contexts/LiveContextProvider';
import { PlatformSettingsProvider, useBranding, useDataSourceSettings, usePlatformSettings, useThemeMode } from '../contexts/PlatformSettingsContext';
import { AppSwitcher } from './AppSwitcher';
import { getActiveApp } from '../domain/apps';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { WorkspaceObjectSidePanel } from './WorkspaceObjectSidePanel';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { buildDatasetAssistantReply } from '../domain/assistantResponses';
import { resolveBrandingLogoSrc } from '../utils/branding-logo';

/* ─── Mock reply system ─── */

type MockReply = {
  text: string;
  artifact?: ChatArtifact;
  followUps?: string[];
};

const MOCK_REPLIES: Record<string, MockReply> = {
  /* ─── CASE PRIORITIES ─── */
  [GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT]: {
    text:
      'Here\'s how I\'d prioritize your workload this week:\n\n' +
      '1. **IP44-6679812 \u00b7 Sarah Dupont** \u2014 Overdue on surgical report and APS. Clear this first to protect SLA and unblock medical review.\n\n' +
      '2. **IP26-5546112 \u00b7 Billy Bud** \u2014 Decision due today. When you\'re ready, record the claim decision; the file summary is aligned with approval.\n\n' +
      '3. **IP66-7622343 \u00b7 Marc Tremblay** \u2014 High-attention monitoring. Review PT outcomes within the next day to stay ahead of the plan.\n\n' +
      '4. **WP66-998987 \u00b7 Elena Rossi** \u2014 RTW planning is nearly complete. Confirm the employer accommodation and finalize the return-to-work date.\n\n' +
      'Open any case from the list below \u2014 each link goes straight into that file.',
    artifact: {
      kind: 'case-links',
      title: 'Jump to a case',
      items: [
        { caseId: 'IP44-6679812', claimant: 'Sarah Dupont', summary: 'Overdue \u2014 surgical report & APS', tone: 'critical' },
        { caseId: 'IP26-5546112', claimant: 'Billy Bud', summary: 'Due today \u2014 record claim decision', tone: 'warning' },
        { caseId: 'IP66-7622343', claimant: 'Marc Tremblay', summary: 'Due soon \u2014 review PT outcomes (1 day)', tone: 'neutral' },
        { caseId: 'WP66-998987', claimant: 'Elena Rossi', summary: 'RTW planning \u2014 confirm employer accommodation', tone: 'neutral' },
      ],
    },
    followUps: [
      'Draft an escalation email for Sarah Dupont\'s overdue documents',
      'What\'s the risk if Billy Bud\'s decision slips to next week?',
      'Show me Marc Tremblay\'s rehabilitation timeline',
    ],
  },

  /* ─── QUEUE FOCUS ─── */
  'What should I prioritize in my queue today\u2014overdue items, due today, and anything at risk?': {
    text:
      'Good morning, Victor. Here\'s your queue snapshot for today:\n\n' +
      '**Overdue** (1 item)\n' +
      '\u2022 IP44-6679812 \u2014 Sarah Dupont: surgical report and APS were due Mar 10. SLA breach in < 2 hours.\n\n' +
      '**Due today** (2 items)\n' +
      '\u2022 IP26-5546112 \u2014 Billy Bud: record the claim decision. All 7 requirements fulfilled, AI recommends approval at 91% confidence.\n' +
      '\u2022 TSK-6112-02 \u2014 Validate PT appointment outcomes for Billy Bud (normal priority).\n\n' +
      '**At risk this week** (2 items)\n' +
      '\u2022 IP66-7622343 \u2014 Marc Tremblay: physician follow-up due Apr 22.\n' +
      '\u2022 WP66-998987 \u2014 Elena Rossi: employer accommodation deadline approaching Apr 30.\n\n' +
      'I recommend starting with Sarah Dupont\'s escalation (SLA critical), then moving to Billy Bud\'s decision.',
    artifact: {
      kind: 'task-list',
      title: 'Your priority queue',
      items: [
        { id: 'q1', label: 'Escalate overdue documents \u2014 Sarah Dupont', done: false, caseId: 'IP44-6679812', dueDate: 'Mar 10 (overdue)', priority: 'High' },
        { id: 'q2', label: 'Record claim decision \u2014 Billy Bud', done: false, caseId: 'IP26-5546112', dueDate: 'Today', priority: 'High' },
        { id: 'q3', label: 'Validate PT outcomes \u2014 Billy Bud', done: false, caseId: 'IP26-5546112', dueDate: 'Mar 30', priority: 'Normal' },
        { id: 'q4', label: 'Confirm physician follow-up \u2014 Marc Tremblay', done: false, caseId: 'IP66-7622343', dueDate: 'Apr 22', priority: 'Normal' },
        { id: 'q5', label: 'RTW accommodation follow-up \u2014 Elena Rossi', done: false, caseId: 'WP66-998987', dueDate: 'Apr 30', priority: 'Normal' },
      ],
    },
    followUps: [
      'Draft the escalation for Sarah Dupont',
      'Walk me through Billy Bud\'s decision summary',
      'What happens if Marc Tremblay misses the physician follow-up?',
    ],
  },

  /* ─── MY TASKS ─── */
  'Help me plan my work: summarize my open tasks, due dates, and suggested order to tackle them.': {
    text:
      'Here\'s your task planner for this week, ordered by urgency. You have **5 open tasks** across 4 cases. At current pace, you can clear the critical items by lunch and the rest by end of week.',
    artifact: {
      kind: 'task-list',
      title: 'Task planner',
      items: [
        { id: 't1', label: 'Escalate overdue documents \u2014 Sarah Dupont (IP44-6679812)', done: false, caseId: 'IP44-6679812', dueDate: 'Mar 10 (overdue)', priority: 'High' },
        { id: 't2', label: 'Record claim decision \u2014 Billy Bud (IP26-5546112)', done: false, caseId: 'IP26-5546112', dueDate: 'Today', priority: 'High' },
        { id: 't3', label: 'Validate PT outcomes \u2014 Billy Bud (IP26-5546112)', done: false, caseId: 'IP26-5546112', dueDate: 'Mar 30', priority: 'Normal' },
        { id: 't4', label: 'Confirm adherence plan \u2014 Marc Tremblay (IP66-7622343)', done: false, caseId: 'IP66-7622343', dueDate: 'Apr 2', priority: 'Normal' },
        { id: 't5', label: 'RTW accommodation \u2014 Elena Rossi (WP66-998987)', done: false, caseId: 'WP66-998987', dueDate: 'Apr 30', priority: 'Normal' },
      ],
    },
    followUps: [
      'Block 2 hours on my calendar for the top 2 tasks',
      'Draft a follow-up email to Dr. Moreau',
      'Which tasks can I delegate to Marina Scott?',
    ],
  },

  /* ─── DOCUMENTS ─── */
  'How can I spot missing or outstanding documents and follow-ups across my cases?': {
    text:
      'I\'ve scanned all your active cases for document gaps. Here\'s the breakdown:\n\n' +
      '**Missing documents (critical)**\n' +
      '\u2022 IP44-6679812 \u00b7 Sarah Dupont\n' +
      '  \u2014 Surgical Report: due Mar 10, overdue by 30 days. Provider: Dr. Pierre Moreau.\n' +
      '  \u2014 Attending Physician Statement (APS): due Mar 10, overdue by 30 days.\n\n' +
      '**Fully documented**\n' +
      '\u2022 IP26-5546112 \u00b7 Billy Bud \u2014 7/7 documents validated. No gaps.\n' +
      '\u2022 IP66-7622343 \u00b7 Marc Tremblay \u2014 All pre-approval docs plus 3/12 post-approval fulfilled.\n' +
      '\u2022 WP66-998987 \u00b7 Elena Rossi \u2014 All requirements met.\n\n' +
      'Overall: **2 outstanding documents** across 1 case. Your other 4 cases are clean.',
    followUps: [
      'Generate the escalation letter for Sarah Dupont\'s provider',
      'Show me the document validation timeline for Billy Bud',
      'What documents will Marc Tremblay need in the next 30 days?',
    ],
  },

  /* ─── Escalation email (draft artifact) ─── */
  'Draft an escalation email for Sarah Dupont\'s overdue documents': {
    text: 'Here\'s a draft escalation email ready for your review:',
    artifact: {
      kind: 'draft',
      title: 'Escalation Email',
      subject: 'URGENT \u2014 Outstanding documents for claim IP44-6679812 (Sarah Dupont)',
      body:
        'Dear Dr. Moreau,\n\n' +
        'I\'m writing regarding claim IP44-6679812 for our mutual patient, Sarah Dupont. The following documents were requested on March 3rd and remain outstanding as of today:\n\n' +
        '1. Surgical Report \u2014 spinal decompression surgery (L4-L5)\n' +
        '2. Attending Physician Statement (APS)\n\n' +
        'These documents are now 30 days overdue and are blocking the medical review phase of Ms. Dupont\'s income protection claim. Without them, we cannot proceed to assessment, which may result in delayed benefit payments for your patient.\n\n' +
        'Could you please arrange for these to be sent within 48 hours? Documents can be uploaded directly to our secure provider portal or emailed to claims-intake@guardian.co.uk.\n\n' +
        'Thank you for your prompt attention.\n\n' +
        'Kind regards,\nVictor Ramon\nClaims Assessor \u2014 Income Protection\nGuardian Financial Services',
      actions: [
        { id: 'formal', label: 'Make it more formal', prompt: 'Make it more formal' },
        { id: 'cc', label: 'Add CC for team lead', prompt: 'Add a CC line for the team lead' },
      ],
    },
    followUps: [
      'What if the provider doesn\'t respond in 48 hours?',
    ],
  },

  /* ─── Draft escalation for Sarah (alternate) ─── */
  'Draft the escalation for Sarah Dupont': {
    text: 'Here\'s a draft escalation email ready for your review:',
    artifact: {
      kind: 'draft',
      title: 'Escalation Email',
      subject: 'URGENT \u2014 Outstanding documents for claim IP44-6679812 (Sarah Dupont)',
      body:
        'Dear Dr. Moreau,\n\n' +
        'I\'m writing regarding claim IP44-6679812 for our mutual patient, Sarah Dupont. The following documents were requested on March 3rd and remain outstanding:\n\n' +
        '1. Surgical Report \u2014 spinal decompression surgery (L4-L5)\n' +
        '2. Attending Physician Statement (APS)\n\n' +
        'These are now 30 days overdue and blocking the medical review phase. Could you please arrange for submission within 48 hours?\n\n' +
        'Kind regards,\nVictor Ramon\nGuardian Financial Services',
      actions: [
        { id: 'formal', label: 'Make it more formal', prompt: 'Make it more formal' },
        { id: 'cc', label: 'Add CC for team lead', prompt: 'Add a CC line for the team lead' },
      ],
    },
    followUps: [
      'What if the provider doesn\'t respond in 48 hours?',
    ],
  },

  /* ─── Billy risk of delay ─── */
  'What\'s the risk if Billy Bud\'s decision slips to next week?': {
    text:
      'Good question. Here\'s the impact analysis:\n\n' +
      '**SLA impact:** Billy\'s claim has been in pre-approval for 56 days. The internal SLA target is 60 days. Slipping to next week puts you at 61-65 days \u2014 a minor SLA breach.\n\n' +
      '**Financial impact:** The monthly benefit of \u00a311,250 is scheduled to start Apr 30. A 1-week delay doesn\'t change the payment date, but compresses post-approval setup.\n\n' +
      '**Claimant impact:** Billy has been waiting since Jan 30. Every day matters for trust and satisfaction.\n\n' +
      '**AI assessment:** The recommendation has been stable at 91% approve for 2 weeks. No new information is expected.\n\n' +
      '**My recommendation:** record the decision today. It takes roughly 5 minutes if you agree with the AI recommendation.',
    artifact: {
      kind: 'action-card',
      title: 'Recommended action',
      description: 'The AI recommendation is stable at 91% approve. Recording the decision now unblocks the entire post-approval journey.',
      actions: [
        { id: 'decide', label: 'Open Billy Bud\'s decision tab', variant: 'primary', prompt: 'OK, take me to Billy Bud\'s decision tab' },
        { id: 'later', label: 'Remind me tomorrow', variant: 'secondary' },
      ],
    },
    followUps: [
      'What does the post-approval journey look like after approval?',
      'Has the AI confidence changed recently?',
    ],
  },

  /* ─── Marc rehab timeline ─── */
  'Show me Marc Tremblay\'s rehabilitation timeline': {
    text:
      'Here\'s Marc Tremblay\'s rehabilitation timeline (IP66-7622343). Current status: **Recovery Underway** (stage 2 of 5). Marc\'s shoulder mobility is improving steadily.\n\n' +
      'Key risk: The physician follow-up on Apr 22 will determine if the current PT cadence is sufficient.',
    artifact: {
      kind: 'timeline',
      title: 'Rehabilitation timeline \u2014 Marc Tremblay',
      events: [
        { date: 'Feb 15', label: 'Workplace injury (rotator cuff tear)', status: 'done' },
        { date: 'Feb 20', label: 'Arthroscopic repair surgery', status: 'done', detail: 'Performed by Dr. Isabelle Fontaine. Successful repair with good joint alignment.' },
        { date: 'Mar 28', label: 'Claim approved, restoration plan initiated', status: 'done' },
        { date: 'Apr 2', label: 'PT session 1 completed', status: 'done', detail: 'Good range of motion progress noted.' },
        { date: 'Apr 9', label: 'PT session 2 completed', status: 'done', detail: 'Continued improvement in mobility.' },
        { date: 'Apr 16', label: 'PT session 3 completed (milestone)', status: 'done', detail: 'PT milestone reached \u2014 active ROM exceeds 50%.' },
        { date: 'Apr 22', label: 'Physician follow-up', status: 'active', detail: 'Critical checkpoint \u2014 determines if PT cadence needs adjustment.' },
        { date: 'Apr 23', label: 'PT session 4', status: 'upcoming' },
        { date: 'Apr 30', label: 'PT session 5', status: 'upcoming' },
        { date: 'May 5', label: 'Medication compliance report', status: 'upcoming' },
        { date: 'May 20', label: 'Return-to-work assessment', status: 'upcoming' },
      ],
    },
    followUps: [
      'What should I watch for in the physician follow-up?',
      'Is Marc on track compared to similar cases?',
      'Draft a check-in message for Marc',
    ],
  },

  /* ─── Follow-up: Dr. Moreau email ─── */
  'Draft a follow-up email to Dr. Moreau': {
    text: 'Here\'s a follow-up email for Dr. Moreau:',
    artifact: {
      kind: 'draft',
      title: 'Follow-up Email',
      subject: 'Follow-up \u2014 Outstanding documents for Sarah Dupont (IP44-6679812)',
      body:
        'Dear Dr. Moreau,\n\n' +
        'I\'m following up on my previous request regarding the surgical report and attending physician statement for Sarah Dupont\'s income protection claim.\n\n' +
        'These documents are now significantly overdue, and Ms. Dupont\'s benefit assessment cannot proceed without them.\n\n' +
        'Options for submission:\n' +
        '\u2022 Secure provider portal: portal.guardian.co.uk/upload\n' +
        '\u2022 Encrypted email: claims-intake@guardian.co.uk\n' +
        '\u2022 Phone dictation: +44 800 555 0199 (reference IP44-6679812)\n\n' +
        'If there are any issues, please don\'t hesitate to let me know.\n\n' +
        'Best regards,\nVictor Ramon',
      actions: [
        { id: 'shorten', label: 'Shorten to 3 sentences', prompt: 'Shorten this to 3 sentences' },
      ],
    },
    followUps: [
      'What\'s the escalation path if we still hear nothing?',
    ],
  },

  /* ─── Delegation ─── */
  'Which tasks can I delegate to Marina Scott?': {
    text:
      'Based on your team\'s assignment rules and Marina\'s current workload, here are tasks she could take:\n\n' +
      '**Can delegate:**\n' +
      '\u2022 TSK-6112-03 \u2014 Confirm claimant adherence plan (Billy Bud) \u2014 Marina is already co-owner.\n' +
      '\u2022 WP66-998987 \u2014 Elena Rossi\'s RTW follow-up \u2014 Marina handled earlier stages.\n\n' +
      '**Better to keep:**\n' +
      '\u2022 Sarah Dupont escalation \u2014 you\'re the primary provider contact.\n' +
      '\u2022 Billy Bud decision \u2014 must be recorded under your name per audit policy.\n\n' +
      'Delegating 2 tasks frees up ~45 minutes today.',
    artifact: {
      kind: 'action-card',
      title: 'Delegate tasks',
      description: 'Reassign 2 tasks to Marina Scott to free up 45 minutes for SLA-critical work.',
      actions: [
        { id: 'reassign', label: 'Reassign both to Marina', variant: 'primary', prompt: 'Reassign the Elena Rossi follow-up to Marina' },
        { id: 'keep', label: 'Keep all assigned to me', variant: 'secondary' },
      ],
    },
    followUps: [
      'Send Marina a summary of what she needs to do',
    ],
  },

  /* ─── Formal escalation letter ─── */
  'Generate the escalation letter for Sarah Dupont\'s provider': {
    text: 'Here\'s a formal escalation letter on Guardian letterhead:',
    artifact: {
      kind: 'draft',
      title: 'Formal Escalation Letter',
      subject: 'Re: Outstanding Medical Documentation \u2014 Sarah Dupont',
      body:
        'GUARDIAN FINANCIAL SERVICES\nClaims Department \u2014 Income Protection\n\nDate: April 9, 2026\nRef: IP44-6679812\n\nDr. Pierre Moreau\nH\u00f4pital \u00c9douard Herriot\nLyon, France\n\nDear Dr. Moreau,\n\nWe are writing to formally escalate our outstanding request for medical documentation pertaining to the above-referenced income protection claim.\n\nThe following documents were initially requested on March 3, 2026:\n\n1. Surgical Report \u2014 Spinal decompression (L4-L5)\n2. Attending Physician Statement (APS)\n\nAs of today, these remain outstanding. Ms. Dupont\'s claim assessment cannot proceed until this clinical evidence is received.\n\nWe respectfully request submission within 5 business days.\n\nYours sincerely,\nVictor Ramon\nSenior Claims Assessor\nGuardian Financial Services',
      actions: [
        { id: 'translate', label: 'Translate to French', prompt: 'Translate to French for the provider' },
        { id: 'attach', label: 'Attach to case', prompt: 'Attach this to Sarah Dupont\'s case communications' },
      ],
    },
    followUps: [],
  },

  /* ─── Document validation timeline ─── */
  'Show me the document validation timeline for Billy Bud': {
    text:
      'Here\'s Billy Bud\'s document validation timeline (IP26-5546112). All 7 documents were received within a **9-day window** \u2014 well ahead of the SLA.',
    artifact: {
      kind: 'timeline',
      title: 'Document validation \u2014 Billy Bud',
      events: [
        { date: 'Feb 15', label: 'Claimant Interview completed', status: 'done', detail: 'AI rule engine \u2014 auto-validated' },
        { date: 'Feb 16', label: 'Identity Verification validated', status: 'done', detail: 'Score: 98/100, no fraud indicators' },
        { date: 'Feb 17', label: 'Employer Confirmation received', status: 'done' },
        { date: 'Feb 19', label: 'Surgical Report uploaded', status: 'done', detail: 'Medical provider \u2014 cross-validated' },
        { date: 'Feb 20', label: 'APS received', status: 'done' },
        { date: 'Feb 22', label: 'FCE completed', status: 'done', detail: 'Rehabilitation provider' },
        { date: 'Feb 24', label: 'Orthopaedic Consultant Report', status: 'done', detail: 'Specialist provider \u2014 final document' },
      ],
    },
    followUps: [
      'Compare this to industry benchmarks',
      'What made the document collection so fast?',
    ],
  },

  /* ─── Compare to industry benchmarks ─── */
  'Compare this to industry benchmarks': {
    text:
      'Here\'s how Billy Bud\'s document collection compares to industry benchmarks for IP claims:\n\n' +
      '**Billy Bud: 9 days** (Feb 15\u2013Feb 24) for 7 documents\n' +
      '**Industry median: 21\u201328 days** for the same document set\n\n' +
      '**Breakdown:**\n' +
      '\u2022 Identity verification \u2014 Billy: 1 day vs. industry: 2\u20133 days\n' +
      '\u2022 Employer confirmation \u2014 Billy: 2 days vs. industry: 5\u20137 days\n' +
      '\u2022 Surgical report \u2014 Billy: 4 days vs. industry: 10\u201314 days\n' +
      '\u2022 APS \u2014 Billy: 5 days vs. industry: 12\u201318 days\n' +
      '\u2022 FCE \u2014 Billy: 7 days vs. industry: 14\u201321 days\n' +
      '\u2022 Specialist report \u2014 Billy: 9 days vs. industry: 18\u201328 days\n\n' +
      'Billy\'s file completed **60\u201370% faster** than the industry median. This is in the top 5% of IP claims we\'ve benchmarked. The main drivers were the AI-initiated parallel ordering (all requests sent on day 1) and the provider portal enabling direct upload.',
    followUps: [
      'What can we learn from this for Sarah Dupont\'s case?',
      'How does our overall portfolio compare?',
    ],
  },

  /* ─── What made collection fast ─── */
  'What made the document collection so fast?': {
    text:
      'Three factors made Billy Bud\'s document collection exceptionally fast:\n\n' +
      '**1. AI parallel ordering (Day 1)**\n' +
      'The AI rule engine identified all 7 required documents at intake and sent requests simultaneously rather than sequentially. Traditional workflows wait for each document before requesting the next \u2014 adding 3\u20135 days per dependency.\n\n' +
      '**2. Provider portal adoption**\n' +
      'Billy\'s surgical team (Mr. David Harding) and the rehabilitation provider both use Guardian\'s secure upload portal. Portal submissions are validated automatically within hours vs. 2\u20133 days for email/post.\n\n' +
      '**3. Proactive follow-up cadence**\n' +
      'The AI monitoring engine sent automated follow-ups at 48-hour intervals. The employer confirmation was received after the first follow-up \u2014 before it would have been flagged as overdue in a manual workflow.\n\n' +
      '**Contrast with Sarah Dupont:**\n' +
      'Sarah\'s provider (Dr. Moreau at H\u00f4pital \u00c9douard Herriot) doesn\'t use the portal, and the hospital\'s records department has a known 2\u20133 week turnaround. This is the structural bottleneck \u2014 not a process failure on our side.',
    artifact: {
      kind: 'action-card',
      title: 'Apply learnings',
      description: 'Would you like to onboard Dr. Moreau\'s office to the provider portal to prevent future delays?',
      actions: [
        { id: 'onboard', label: 'Send portal invitation to Dr. Moreau', variant: 'primary', prompt: 'Draft a portal onboarding invitation for Dr. Moreau' },
        { id: 'skip', label: 'Not now', variant: 'secondary' },
      ],
    },
    followUps: [
      'Draft a portal onboarding invitation for Dr. Moreau',
      'Which other providers should we onboard?',
    ],
  },

  /* ─── Portal onboarding draft ─── */
  'Draft a portal onboarding invitation for Dr. Moreau': {
    text: 'Here\'s a portal onboarding invitation for Dr. Moreau\'s office:',
    artifact: {
      kind: 'draft',
      title: 'Portal Onboarding Invitation',
      subject: 'Invitation \u2014 Guardian Secure Provider Portal access',
      body:
        'Dear Dr. Moreau,\n\n' +
        'We would like to invite you to register for the Guardian Secure Provider Portal, a free tool that streamlines medical document exchange for your patients\' income protection claims.\n\n' +
        'Benefits for your office:\n' +
        '\u2022 Upload documents directly \u2014 no email or post required\n' +
        '\u2022 Secure, encrypted, and GDPR-compliant\n' +
        '\u2022 Real-time confirmation when documents are received and validated\n' +
        '\u2022 Reduces follow-up calls from our claims team\n\n' +
        'Registration takes approximately 5 minutes:\n' +
        'https://portal.guardian.co.uk/provider/register\n\n' +
        'If you have any questions about the portal or need assistance with registration, please contact our provider support team at provider-support@guardian.co.uk or +44 800 555 0200.\n\n' +
        'Kind regards,\nVictor Ramon\nSenior Claims Assessor\nGuardian Financial Services',
      actions: [
        { id: 'send', label: 'Send invitation', prompt: 'Send the portal invitation' },
      ],
    },
    followUps: [
      'Which other providers should we onboard?',
    ],
  },

  /* ─── Marc upcoming docs ─── */
  'What documents will Marc Tremblay need in the next 30 days?': {
    text:
      'Here are the upcoming document requirements for Marc Tremblay (IP66-7622343) over the next 30 days. The physician follow-up on Apr 22 is the most important \u2014 it\'s the clinical checkpoint that determines recovery trajectory.',
    artifact: {
      kind: 'timeline',
      title: 'Upcoming documents \u2014 Marc Tremblay',
      events: [
        { date: 'Apr 22', label: 'Physician Follow-Up report', status: 'active', detail: 'Determines whether the rehabilitation plan needs adjustment.' },
        { date: 'Apr 23', label: 'Shoulder PT Session 4 notes', status: 'upcoming' },
        { date: 'Apr 30', label: 'Shoulder PT Session 5 notes', status: 'upcoming' },
        { date: 'May 5', label: 'Medication Compliance Report', status: 'upcoming', detail: 'Verifies continued diabetes management during recovery.' },
        { date: 'May 7', label: 'Shoulder PT Session 6 notes', status: 'upcoming' },
      ],
    },
    followUps: [
      'Set a reminder for the Apr 22 physician follow-up',
      'What if Marc\'s PT notes show a setback?',
    ],
  },

  /* ─── Formal tone ─── */
  'Make it more formal': {
    text: 'Here\'s the revised version with a more formal tone:',
    artifact: {
      kind: 'draft',
      title: 'Formal Escalation Email',
      subject: 'FORMAL REQUEST \u2014 Overdue Medical Documentation, Claim IP44-6679812',
      body:
        'Dear Dr. Moreau,\n\nI am writing on behalf of Guardian Financial Services to formally request the submission of outstanding medical documentation pertaining to the income protection claim of Ms. Sarah Dupont (Claim Reference: IP44-6679812).\n\nThe following items were initially requested on 3 March 2026 and remain outstanding:\n\n(i) Surgical Report \u2014 spinal decompression surgery, L4-L5 vertebrae\n(ii) Attending Physician Statement (APS)\n\nThese documents are essential for the continuation of Ms. Dupont\'s claim assessment. Their absence has resulted in a material delay to the adjudication process.\n\nWe respectfully request that these documents be furnished within forty-eight (48) hours of receipt of this communication.\n\nYours faithfully,\nVictor Ramon\nSenior Claims Assessor\nGuardian Financial Services',
      actions: [
        { id: 'cc', label: 'Add CC for team lead', prompt: 'Add a CC line for the team lead' },
      ],
    },
    followUps: [
      'Perfect \u2014 send this now',
    ],
  },

  /* ─── CC line ─── */
  'Add a CC line for the team lead': {
    text:
      'Done \u2014 I\'ve added a CC line:\n\n**CC:** Sophie Laurent, Claims Team Lead (sophie.laurent@guardian.co.uk)\n\nThis signals internal visibility and often accelerates provider responses.',
    followUps: [
      'That\'s sufficient, thanks',
      'Yes, add a read receipt too',
    ],
  },

  /* ─── Post-approval journey ─── */
  'What does the post-approval journey look like after approval?': {
    text:
      'After recording an approval for Billy Bud, here\'s the post-approval journey:',
    artifact: {
      kind: 'timeline',
      title: 'Post-approval journey \u2014 Billy Bud',
      events: [
        { date: 'Immediate', label: 'Restoration Plan', status: 'active', detail: 'Schedule meeting with Billy to review recovery plan: physician cadence, PT schedule, RTW guardrails. AI proposes 3 calendar slots.' },
        { date: 'Month 1-3', label: 'Recovery Underway', status: 'upcoming', detail: 'Monthly benefit payments begin (\u00a311,250/mo). PT sessions and medical checkpoints tracked. Setbacks surface as tasks.' },
        { date: 'Month 3-6', label: 'Monitoring', status: 'upcoming', detail: 'Pharmacy compliance, self-reports, and clinical touchpoints feed a risk score. AI flags drift proactively.' },
        { date: 'Month 6-8', label: 'RTW Planning', status: 'upcoming', detail: 'Employer accommodations and phased return negotiated. Documented to prevent disputes.' },
        { date: 'Month 8-9', label: 'Case Closure', status: 'upcoming', detail: 'Final payments, closure letters, and audit trail. Requirements grid closed out.' },
      ],
    },
    followUps: [
      'Approve Billy Bud now \u2014 take me to the decision tab',
      'What\'s the typical timeline for similar knee replacement cases?',
    ],
  },
};

function findMockReply(text: string): MockReply | null {
  const direct = MOCK_REPLIES[text];
  if (direct) return direct;
  for (const [key, reply] of Object.entries(MOCK_REPLIES)) {
    if (text.toLowerCase().includes(key.toLowerCase().slice(0, 40))) return reply;
  }
  return null;
}

/* ─── Layout width helpers ─── */

const GLOBAL_AI_MIN_WIDTH = 400;
const GLOBAL_AI_MAX_FACTOR = 0.7;

function clampGlobalAiWidth(innerWidth: number, width: number): number {
  const max = Math.max(GLOBAL_AI_MIN_WIDTH, Math.floor(innerWidth * GLOBAL_AI_MAX_FACTOR));
  return Math.max(GLOBAL_AI_MIN_WIDTH, Math.min(width, max));
}

/* ─── Inline editor for conversation title ─── */

function InlineTitleEditor({
  value,
  editing,
  onEditingChange,
  onCommit,
  className,
}: {
  value: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onCommit: (next: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    onEditingChange(false);
    if (next && next !== value) onCommit(next);
    else setDraft(value);
  };

  if (editing) {
    // Size the input to hug its content (draft length) instead of filling the row.
    const ch = Math.min(Math.max(draft.length + 1, 10), 42);
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setDraft(value);
            onEditingChange(false);
          }
        }}
        style={{ width: `${ch}ch` }}
        className={`inline-block max-w-full min-w-0 rounded-md border border-brand-blue/40 bg-white px-1.5 py-0.5 text-[15px] font-semibold leading-tight tracking-tight text-text-heading outline-none focus:border-brand-blue ${
          className ?? ''
        }`}
      />
    );
  }

  return (
    <span
      className={`inline-block min-w-0 max-w-full truncate align-middle text-[15px] font-semibold leading-tight tracking-tight text-text-heading ${className ?? ''}`}
      title={value}
    >
      {value}
    </span>
  );
}

function HeaderGlobalSearch() {
  const navigate = useNavigate();
  const dataSource = useDataSourceSettings();
  const [scope, setScope] = useState<'all' | 'cases' | 'clients' | 'policies' | 'agents'>('cases');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scopeOptions = [
    { id: 'cases' as const, label: 'Cases' },
    { id: 'clients' as const, label: 'Clients' },
    { id: 'policies' as const, label: 'Policies' },
    { id: 'agents' as const, label: 'Agents' },
    { id: 'all' as const, label: 'All' },
  ];
  const activeScopeLabel = scopeOptions.find((option) => option.id === scope)?.label ?? 'Cases';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const isRecent = !q;
    const activeDataset = filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource);
    const caseResults = scope === 'clients' || scope === 'policies' || scope === 'agents' ? [] : listCaseSummaries(activeDataset).filter((item) =>
        isRecent ||
        [
          item.id,
          item.title,
          item.caseTypeCode,
          item.priority,
          item.primaryPartyName ?? item.claimant,
          item.product,
          item.status,
          item.policyNumber,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
        .slice(0, scope === 'all' ? 3 : 6)
        .map((item) => toCaseSummarySearchResult(item));
    const clientResults = scope === 'cases' || scope === 'policies' || scope === 'agents' ? [] : activeDataset.clients.filter((item) =>
        isRecent ||
        [item.id, item.name, item.profile?.email, item.profile?.phone, item.profile?.dob, item.profile?.address, item.profile?.parish, item.taxId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
        .slice(0, scope === 'all' ? 3 : 6)
        .map((item) => ({
          id: `client-${item.id}`,
          type: 'Client' as const,
          title: item.name,
          subtitle: `${item.category ?? item.type} · ${item.status ?? 'active'}`,
          href: `/folders/${item.id}`,
        }));
    const policyResults = scope === 'cases' || scope === 'clients' || scope === 'agents' ? [] : activeDataset.policies
      .filter((item) =>
        isRecent ||
        [item.id, item.label, item.status, item.product, item.policyNumber]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, scope === 'all' ? 3 : 6)
      .map((item) => ({
        id: `policy-${item.id}`,
        type: 'Policy' as const,
        title: item.label,
        subtitle: `${item.product} · ${item.status}`,
        href: `/folders/${item.id}`,
      }));
    const agentResults = scope === 'cases' || scope === 'clients' || scope === 'policies' ? [] : activeDataset.agents
      .filter((item) =>
        isRecent ||
        [item.id, item.name, item.status, item.agencyName, item.email, item.producerCode]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, scope === 'all' ? 3 : 6)
      .map((item) => toAgentSummarySearchResult(item));
    return [...caseResults, ...clientResults, ...policyResults, ...agentResults].slice(0, 8);
  }, [dataSource, query, scope]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setScopeOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    setScopeOpen(false);
    setQuery('');
    navigate(href);
  };

  return (
    <div ref={containerRef} className="absolute left-1/2 top-1/2 z-[1000] hidden w-[min(700px,52vw)] -translate-x-1/2 -translate-y-1/2 lg:block">
      <div className="flex h-8 items-center gap-2">
        <div className="relative w-[150px] shrink-0">
          <button
            type="button"
            onClick={() => {
              setScopeOpen((prev) => !prev);
              setOpen(false);
            }}
            className="flex h-8 w-full items-center justify-between rounded-[8px] border border-white/20 bg-white px-3 text-[13px] font-medium text-text-primary shadow-sm"
          >
            {activeScopeLabel}
            <ChevronDown className="size-4 text-text-secondary" />
          </button>
          {scopeOpen ? (
            <div className="absolute left-0 right-0 top-full z-[1001] mt-1 overflow-hidden rounded-xl border border-border-default bg-white py-1 shadow-[0_12px_28px_rgba(27,28,30,0.18)]">
              {scopeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setScope(option.id);
                    setScopeOpen(false);
                    setOpen(true);
                  }}
                  className={`block w-full px-3 py-2 text-left text-[13px] transition-colors hover:bg-surface-muted ${
                    scope === option.id ? 'font-semibold text-brand-blue' : 'text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setScopeOpen(false);
              setOpen(true);
            }}
            onFocus={() => {
              setScopeOpen(false);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && results[0]) {
                const first = results[0];
                handleSelect(first.href);
              }
              if (event.key === 'Escape') {
                setOpen(false);
                setScopeOpen(false);
              }
            }}
            placeholder={`Search ${activeScopeLabel.toLowerCase()}...`}
            className="h-8 w-full rounded-[8px] border border-white/20 bg-white pl-3 pr-10 text-[13px] text-text-primary shadow-sm outline-none placeholder:text-text-placeholder focus:border-white/50"
          />
          {open ? (
        <div className="absolute left-0 right-0 top-full z-[1001] mt-2 max-h-[min(420px,60vh)] overflow-y-auto rounded-xl border border-border-default bg-white py-1.5 text-text-primary shadow-[0_12px_28px_rgba(27,28,30,0.18)]">
          {!query.trim() ? (
            <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">
              Recent {activeScopeLabel.toLowerCase()}
            </div>
          ) : null}
          {results.length > 0 ? (
            results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className={`flex w-full items-center gap-3 text-left transition-colors hover:bg-surface-hover ${
                    item.type === 'Case' ? 'px-4 py-3' : 'px-3 py-2.5 hover:bg-surface-muted'
                  }`}
                >
                  {item.type === 'Case' ? (
                    <CaseSearchOptionContent
                      caseId={item.caseId}
                      caseTypeLine={item.caseTypeLine}
                      status={item.status}
                    />
                  ) : item.type === 'Agent' ? (
                    <>
                      <InitialsAvatar name={item.name} seed={item.agentId} size="sm" />
                      <AgentSearchOptionContent
                        name={item.name}
                        agency={item.agency}
                        email={item.email}
                        status={item.status}
                        titleClassName="truncate text-[13px] font-semibold text-text-primary"
                      />
                      <span className="shrink-0 text-[10px] font-semibold text-text-muted/70">{item.agentId}</span>
                    </>
                  ) : item.type === 'Client' ? (
                    <>
                      <InitialsAvatar name={item.title} seed={item.id} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-text-primary">{item.title}</span>
                          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
                            {item.type}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-text-secondary">{item.subtitle}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-secondary">
                        <FileText className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-text-primary">{item.title}</span>
                          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
                            {item.type}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-text-secondary">{item.subtitle}</span>
                      </span>
                    </>
                  )}
                </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-[12px] text-text-muted">No matching cases or clients.</div>
          )}
        </div>
      ) : null}
        </div>
      </div>
    </div>
  );
}

function splitProductName(productName: string) {
  const clean = productName.trim() || 'Amplify Case Management';
  const [first, ...rest] = clean.split(/\s+/);
  return {
    first,
    second: rest.join(' '),
  };
}

/* ─── Inner layout (consumes CopilotContext) ─── */

function LayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('nav');
  const [guideOpen, setGuideOpen] = useState(false);
  const [globalAIWidth, setGlobalAIWidth] = useState(() => getDefaultSidePanelWidth({ min: 480 }));
  const [globalAIResizing, setGlobalAIResizing] = useState(false);

  const {
    isOpen: globalAIOpen,
    setIsOpen: setGlobalAIOpen,
    activeMessages,
    sendMessage,
    registerReplyHandler,
    sessions,
    activeSessionId,
    createSession,
    renameSession,
  } = useCopilot();
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  );
  const activeSessionTitle = activeSession?.title || newChatDefaultTitle();
  const [renamingConversation, setRenamingConversation] = useState(false);

  const branding = useBranding();
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const themeMode = useThemeMode();
  const { settings: platformSettings, setAiActivityEnabled: setAiActivityEnabledCtx } =
    usePlatformSettings();
  const headerLogoSrc =
    branding.logoMode === 'custom'
      ? resolveBrandingLogoSrc(
          themeMode === 'light' ? branding.logoLightDataUrl : branding.logoDarkDataUrl,
        )
      : undefined;
  const headerLogoTextFill = themeMode === 'light' ? '#1b1c1e' : '#ffffff';
  const activeApp = getActiveApp(location.pathname);
  const isFolderCreationForm = location.pathname.startsWith('/folders/') && location.pathname.endsWith('/add');
  const aiActivityEnabled = platformSettings.preferences.aiActivityEnabled;
  const aiSidePanelEnabled = platformSettings.preferences.aiSidePanelEnabled !== false;

  /* Keep legacy sessionStorage key in sync so existing listeners (CaseView, toasts) still
   * work regardless of whether the toggle was flipped in the sidebar or in the modal. */
  useEffect(() => {
    try {
      sessionStorage.setItem('amplify-ai-activity', aiActivityEnabled ? '1' : '0');
    } catch {
      /* */
    }
    try {
      window.dispatchEvent(new Event('amplify-ai-activity-toggle'));
    } catch {
      /* */
    }
  }, [aiActivityEnabled]);

  useEffect(() => {
    try { sessionStorage.removeItem('amplify-billy-post-approval'); } catch { /* */ }
  }, []);

  useEffect(() => {
    const handler: ReplyHandler = (text) => buildDatasetAssistantReply(activeDataset, text) ?? findMockReply(text);
    registerReplyHandler(handler);
  }, [activeDataset, registerReplyHandler]);

  useEffect(() => {
    if (!globalAIResizing) return;
    const onMove = (e: MouseEvent) => {
      const next = window.innerWidth - e.clientX;
      setGlobalAIWidth(clampGlobalAiWidth(window.innerWidth, next));
    };
    const onUp = () => setGlobalAIResizing(false);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [globalAIResizing]);

  useEffect(() => {
    const onResize = () => setGlobalAIWidth((w) => clampGlobalAiWidth(window.innerWidth, w));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isOnCopilotModule = location.pathname.startsWith('/copilot');

  const globalContextId = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const maybeCaseId = parts[1];
    if (parts[0] === 'cases' && maybeCaseId) return maybeCaseId.toUpperCase();
    return 'GLOBAL-WORKSPACE';
  }, [location.pathname]);
  const productNameParts = useMemo(() => splitProductName(branding.productName), [branding.productName]);

  return (
    <>
      <div className="flex h-screen min-h-0 min-w-0 w-full flex-col overflow-x-clip" style={{ backgroundColor: 'var(--brand-header)' }}>
      <header
        className={`flex h-[48px] items-center justify-between px-4 shrink-0 isolate relative z-[1000] ${themeMode === 'dark' ? 'shadow-[0_2px_4px_rgba(0,0,0,0.10),0_6px_20px_rgba(0,0,0,0.08)]' : ''}`}
        style={{ backgroundColor: 'var(--brand-header)', color: 'var(--brand-on-header)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-2">
            {headerLogoSrc ? (
              <img
                src={headerLogoSrc}
                alt={branding.productName}
                className="h-[28px] max-w-[120px] object-contain"
              />
            ) : (
              <SimpleLogo className="h-[28px] w-[90px]" textFill={headerLogoTextFill} />
            )}
            {branding.showProductName ? (
              <span className="mb-[1px] flex flex-col items-start text-left leading-[0.95] opacity-85">
                <span className="text-[11px] font-semibold">{productNameParts.first}</span>
                {productNameParts.second ? (
                  <span className="text-[11px] font-medium">{productNameParts.second}</span>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>

        <HeaderGlobalSearch />
        
        <div className="content-stretch flex gap-[16px] items-center justify-center relative">
          {aiSidePanelEnabled && (
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">

              <div className="relative shrink-0">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex items-center justify-center relative">
                      <button
                      title={t('header.openAssistant')}
                      data-keep-sidepanel="trigger"
                      onClick={() => {
                        if (isOnCopilotModule) return;
                        if (globalAIOpen) {
                          setGlobalAIOpen(false);
                          return;
                        }
                        const detail = { handled: false };
                        window.dispatchEvent(new CustomEvent('amplify-open-sidepanel-context', { detail }));
                        if (detail.handled) return;
                        setGlobalAIOpen(true);
                      }}
                      className={`relative rounded-[9999px] shrink-0 transition-colors ${
                        themeMode === 'light' ? 'hover:bg-black/[0.06]' : 'hover:bg-white/10'
                      } ${
                        globalAIOpen || isOnCopilotModule
                          ? themeMode === 'light' ? 'bg-black/[0.08]' : 'bg-white/[0.16]'
                          : ''
                      }`}
                    >
                      <div aria-hidden="true" className="absolute border border-transparent border-solid inset-0 pointer-events-none rounded-[9999px]" />
                      <div className="flex flex-row items-center justify-center size-full">
                        <div className="content-stretch flex items-center justify-center relative p-[8px]">
                          <div className="relative">
                            <MessageSquare className="h-4 w-4" />
                            <span
                              className="absolute -right-[11px] -top-[11px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-brand-accent"
                              style={{ boxShadow: `0 0 0 1.5px var(--brand-header)` }}
                            >
                              <AiCueSparkle size={9} className="!text-white" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          <div className="h-[16px] shrink-0 w-px opacity-25" style={{ backgroundColor: 'var(--brand-on-header)' }} />

          <div className="h-[32px] relative shrink-0">
            <div className="content-stretch flex h-full items-start relative">
              <UserMenu />
            </div>
          </div>

          <AppSwitcher />
        </div>
      </header>

      <div className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${themeMode === 'light' ? 'bg-[#f5f5f7]' : ''}`}>
        {/* Hide the vertical nav when inside an eApp form instance (full-page form). */}
        {activeApp.id !== 'eapp' ? (
          <aside className="relative w-[96px] shrink-0">
            {themeMode === 'light' ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[-16px] top-0 z-0 size-4 bg-surface-primary"
              />
            ) : null}
            <VerticalNav
              onOpenGuide={() => setGuideOpen(true)}
              aiActivityEnabled={aiActivityEnabled}
              onToggleAiActivity={() => {
                const next = !aiActivityEnabled;
                setAiActivityEnabledCtx(next);
                window.dispatchEvent(new Event('amplify-ai-activity-toggle'));
              }}
            />
          </aside>
        ) : null}

        <main className={`relative z-10 min-w-0 flex-1 ${themeMode === 'light' ? `${isFolderCreationForm ? '' : 'rounded-tl-[16px]'} overflow-hidden border-l border-t border-border-default bg-surface-primary shadow-[0_-2px_6px_rgba(0,0,0,0.04)]` : 'overflow-visible'}`}>
          <Outlet />
        </main>
      </div>
      {globalAIOpen && !isOnCopilotModule && aiSidePanelEnabled ? (
        <WorkspaceObjectSidePanel
          contexts={[{ id: 'assistant', label: activeSessionTitle, icon: MessageSquare }]}
          activeContextId="assistant"
          onChangeContext={() => undefined}
          onClose={() => setGlobalAIOpen(false)}
          panelWidth={globalAIWidth}
          onPanelWidthChange={setGlobalAIWidth}
          isResizing={globalAIResizing}
          onResizeStart={() => setGlobalAIResizing(true)}
          actions={
            <>
              <button
                type="button"
                onClick={() => createSession()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
                aria-label={t('aiPanel.newConversation')}
                title={t('aiPanel.newConversation')}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                {t('aiPanel.newChat')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGlobalAIOpen(false);
                  navigate('/copilot');
                }}
                className="shrink-0 rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
                aria-label={t('aiPanel.openFullPage')}
                title={t('aiPanel.openFullPage')}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </>
          }
        >
          <div className="shrink-0 border-b border-[#ececec] bg-white px-5 pb-3 pt-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <AiCueSparkle size={16} className="!text-brand-accent" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                    {t('aiPanel.eyebrow')}
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-1.5 pl-[24px]">
                  <InlineTitleEditor
                    value={activeSessionTitle}
                    editing={renamingConversation}
                    onEditingChange={setRenamingConversation}
                    onCommit={(next) => renameSession(activeSessionId, next)}
                  />
                  {renamingConversation ? null : (
                    <button
                      type="button"
                      onClick={() => setRenamingConversation(true)}
                      className="shrink-0 rounded-md p-1 text-[#a9aeb5] transition-colors hover:bg-surface-muted hover:text-text-secondary"
                      aria-label={t('aiPanel.renameConversation')}
                      title={t('aiPanel.renameConversation')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AiCopilotDock
            layout="panel"
            data={{ id: globalContextId }}
            messages={activeMessages}
            onSendMessage={sendMessage}
            aiPanelTab="workspace"
          />

        </WorkspaceObjectSidePanel>
      ) : null}
    </div>
    <ProductGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}

/* ─── Exported Layout with providers ─── */

export function Layout() {
  return (
    <PlatformSettingsProvider>
    <CasesNavProvider>
    <GlobalCreateProvider>
    <FoldersNavProvider>
    <CopilotProvider>
      <LiveContextProvider>
        <LayoutInner />
      </LiveContextProvider>
    </CopilotProvider>
    </FoldersNavProvider>
    </GlobalCreateProvider>
    </CasesNavProvider>
    </PlatformSettingsProvider>
  );
}
