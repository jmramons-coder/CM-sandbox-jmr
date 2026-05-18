# Figma Make Prompt — Amplify Case Management V4
## Post-Approval LTD Claims Focus — 3 Screens

---

## Product Context

Design a modern enterprise case management web application called **Amplify Case Management** by Equisoft. The platform is task-driven: every user begins from their task list, cases are read-only longitudinal records, and dashboards surface performance metrics for managers. An agentic AI crew enriches every task before it reaches the user — producing a plain-language narrative summary, a confidence-scored recommendation checklist, and dynamically gated task actions.

This iteration focuses on the **post-approval phase of a Long-Term Disability (LTD) / Income Protection (IP) claim**. The illustrative case is **Billy Bud, case IP26-5546112**, an Income Protection claimant whose claim has been approved and whose restoration plan is now underway.

**Three screens to design:**
1. Task Module — list + docked side panel
2. Case View — IP26-5546112 full detail
3. Dashboard — LTD claims operations manager view

---

## Shell (All Screens)

**Top navigation bar**
- Left: Equisoft logo + "amplify Case Management" label
- Right: Settings · Help · Notifications (bell with badge "3") · Feedback · Divider · User avatar "WT" (William Tell, Assessor) with dropdown chevron

**Left sidebar**
- Navigation items: Dashboard · Cases · Tasks (active on Screen 1) · Documents · Insights

---

## Screen 1 — Task Module: My Tasks (List + Side Panel)

### Layout
Three horizontal zones:
- **Left**: shell navigation sidebar
- **Center**: task list (narrows when side panel is open)
- **Right**: task side panel (slides in on task card click; docked to right edge; closeable with ×)

---

### Center Zone — Task List

**List header**
- Title: "My tasks"
- Subtitle: "5 Open tasks · 2 Due today"
- Top-right: "CREATE TASK" button

**Filter tabs**
- All tasks | Claims | Underwriting — "Claims" tab is active

**Filter dropdowns** (right-aligned)
- Priority: All ▾ · Due date: Today ▾ · SLA Status: All ▾

---

**Task Card 1 — Active / Selected**

Badges: `URGENT` · `CLAIM` · `⟐ AI`
SLA: `⏱ SLA: 2h 14m` (near breach)

Title: **"IP Adjudication Decision — #IP26-5546112"**
Description: Review AI recommendation and approve or decline the income protection claim.

Metadata: Claimant: **Billy Bud** · Product: **Income Shield 60** · Origin: **STD Exhaustion**
Timestamp: "Assigned 2 hours ago"

Quick actions: `VIEW TASK` · `PICK UP`

---

**Task Card 2**

Badges: `HIGH` · `CLAIM`
SLA: `⏱ SLA: 4h 00m`

Title: **"Restoration Plan Interview — #IP26-5546112"**
Description: Confirm meeting time with claimant to discuss recovery plan and schedule.

Metadata: Claimant: **Billy Bud** · Product: **Income Shield 60** · Origin: **Post-Approval Setup**
Timestamp: "Assigned 1 hour ago"

Quick actions: `VIEW TASK` · `PICK UP`

---

**Task Card 3**

Badges: `HIGH` · `CLAIM`
SLA: `⏱ SLA: 6h 30m`

Title: **"Requirement Follow-Up — Surgical Follow-up — #IP44-6679812"**
Description: Requirement due date passed without receipt. Contact responsible party.

Metadata: Claimant: **Sarah Dupont** · Product: **Income Shield 70** · Origin: **Overdue Monitoring**
Timestamp: "3 hours ago"

Quick actions: `VIEW TASK` · `PICK UP`

---

**Task Card 4**

Badges: `NORMAL` · `CLAIM` · `⟐ AI`
SLA: `⏱ SLA: 1d 2h`

Title: **"Benefit Change Alert — #IP66-7622343"**
Description: Post-approval monitoring agent detected a potential benefit change trigger. Review required.

Metadata: Claimant: **Marc Tremblay** · Product: **Income Shield 50** · Origin: **AI Monitoring**
Timestamp: "30 minutes ago"

Quick actions: `VIEW TASK` · `PICK UP`

---

**Task Card 5**

Badges: `NORMAL` · `CLAIM`
SLA: `⏱ SLA: 2d 0h`

Title: **"Validate Case Closure — #WP66-998987"**
Description: All restoration requirements satisfied. Confirm readiness for case closure.

Metadata: Claimant: **Elena Rossi** · Product: **WP Protect** · Origin: **Completion Check**
Timestamp: "1 day ago"

Quick actions: `VIEW TASK` · `PICK UP`

---

### Right Zone — Task Side Panel (open, showing Card 1)

**Panel header**
- Breadcrumb: "Tasks > #IT-5201"
- Task title: "IP Adjudication Decision"
- Badges: `URGENT` · `CLAIM` · `⟐ AI`
- Assigned timestamp: "Assigned 2 hours ago" — right-aligned

**AI enrichment block**
- Attribution line: "⟐ AI crew · Claims analysis · 91% confidence"
- Narrative: "Income Protection claim for Billy Bud, 47, following a motorcycle accident on January 30th, 2026. Triple leg fracture with right knee replacement. Rehabilitation complicated by pre-existing Type 2 diabetes and obesity (7 stone overweight, recently started GLP-1 medication). Claim onset within active policy period. Elimination period satisfied. Eligibility confirmed. All 7 required documents received and validated. AI recommendation: Approve."
- Confidence bar: 91% filled

**Content tile sections** (collapsible, each with chevron)

*Case Info Summary* (expanded)
- Case Approved: February 12, 2026
- Case Type: Income Protection
- Case Status: Active: Approved
- Plan Type: Income Protection · Plan Name: Income Shield 60 · Coverage: Individual

*Client Summary* (collapsed)
- Name: Billy Bud · Age: 47 · DOB: May 20, 1978
- Summary (truncated): "Married, two teenage children. Owner of a Harley Davidson sales and service business in Manchester. Anxious to return to work. Concerned about business continuity..."
- Pre-existing conditions: Type 2 Diabetes (2016) · Obesity (7 stone overweight) · GLP-1 medication prescribed

*Requirements Received* (collapsed)
- All 7 documents received with receipt dates
- Thumbnails row (small doc icons): LTD Employee Statement · APS · Employer Statement · Mental Health Statement · Authorization · FCE · Specialist Report
- Each with an AI summary label (e.g., "FCE: Functional limitations confirmed — unable to perform own occupation duties")

**AI Recommendation checklist**
- ☐ Approve claim — 91% confidence — all eligibility criteria met, documentation complete
- ☐ Send approval communication to claimant — standard post-approval notification
- ☐ Initiate restoration plan setup — AI will generate plan on approval
- ☐ Copy agent on approval decision

**Task actions area**
- Notes / Instructions text field — "Add decision rationale or notes..." — 0/250 characters

**Action buttons** (stacked at panel bottom)
- `SAVE` · `CLOSE` — first row
- `DECLINE CASE` — second row — opens reason input on click
- `ORDER ADDITIONAL REQUIREMENT` — third row
- `APPROVE CASE AND SEND TO APPROVER` — primary CTA — fourth row

---

## Screen 2 — Case View: IP26-5546112

### Case Header

- Case type badge: `Claim` · Status badge: `Active: Recovery Plan Underway`
- Case ID: **IP26-5546112**
- Header actions: `RUN AI EVALUATION` · `ASSIGN` · `PRIORITY` · `CREATE TASK` · `CLOSE CASE`

**Identity strip**
- Claimant: **Billy Bud** · Product: **Income Shield 60** · Monthly Benefit: **£11,250**
- Requirement Status: `GREEN` · AI Recommendation: `⟐ Approve · 91%` · SLA: `⏱ 21h 46m`

**AI crew banner**
- "⟐ AI crew · Claims analysis · 91% confidence"
- Narrative: "Income Protection claim — motorcycle accident January 30th 2026. Triple leg fracture, knee replacement. Rehabilitation complex due to Type 2 diabetes and obesity. All documents received and validated. Restoration plan active. Monitoring ongoing."

---

### Workflow Stage Stepper

5 stages — stage 3 active:

`① FNOL Received` → `② Initial Triage` → `③ Requirement Gathering` ← **active** → `④ Medical Review` → `⑤ Decision`

---

### Tab Navigation

**Overview** (active) · Tasks · Requirements · Communications · Documents · History

---

### Overview Tab

**Claimant card**
- Name: **Billy Bud** · DOB: May 20, 1978 (47 years old) · Male
- Address: Manchester, UK · Email: bbudd19@yahoo.com · Phone: +44 242 5561 444

**Product card**
- Plan: **Income Shield 60** · Coverage: Individual IP · Monthly Benefit: £11,250 · Claim End Date: November 11, 2026

**Claim Information** (expandable)
- Claim Number: IP26-5546112 · Date of Loss: January 30, 2026 · Disability Onset: January 30, 2026
- Cause: Motorcycle accident — multiple leg fractures, right knee replacement
- Pre-existing Conditions: Type 2 Diabetes (2016) · Obesity

**Paid & Planned Benefits** (expandable, two side-by-side tables)

*Paid Benefits to Date:*
| Date Paid | Amount |
|---|---|
| Feb 28, 2026 | £11,250 |
| Mar 31, 2026 | £11,250 |

*Expected Future Payments:*
| Payment Date | Amount |
|---|---|
| Apr 30, 2026 | £11,250 |
| May 31, 2026 | £11,250 |
| Jun 30, 2026 | £11,250 |
| … through Nov 11, 2026 | £11,250 |

**AI Claim Assessment Trend** (expandable)
- Label: "AI Claim Assessment — Weekly Trend"
- Line chart, x-axis: weeks (Feb 12 → Apr 6), y-axis: AI confidence score (0–100%)
- Annotated events on the line: "Claim approved" · "Restoration plan initiated" · "PT appointment 1 completed" · "Medical setback — knee reinjury detected"

**Restoration Plan** (expandable) — `⟐ AI Generated` badge
- Narrative: "The following plan has been established based on physician recommendations and AI analysis to achieve the claimant's full recovery as quickly as possible."
- Plan elements:
  - Monthly physician follow-up appointments (see requirements)
  - Weekly physical therapy sessions (see requirements)
  - Daily at-home exercises as prescribed by physician
  - Medication compliance (insulin management, GLP-1)
  - No driving until approved by physical therapist (not before April 1)
  - No return to work until approved by physical therapist (not before May 1)
  - Dietary recommendations per physician (weight management, diabetes control)

---

### Requirements Tab

**Progress bar**: Requirement Fulfillment — 3 / 14 (21%)

**Requirements table**

Each row: Name · Category · RAG status · Fulfillment status · Acknowledge checkbox · Due Date · Follow-Up Date · Fulfilled Date

| # | Requirement | Category | RAG | Status | Due Date | Follow-Up |
|---|---|---|---|---|---|---|
| 1 | Claimant Interview | Restoration | Green | Fulfilled | Feb 23, 2026 | Feb 25, 2026 |
| 2 | Surgical Follow-Up | Medical | Amber | Pending | Feb 27, 2026 | Mar 6, 2026 |
| 3 | Physical Therapy Appt. | Rehabilitation | Amber | Pending | Feb 27, 2026 | Mar 2, 2026 |
| 4 | Physical Therapy Appt. | Rehabilitation | Amber | Pending | Mar 6, 2026 | Mar 9, 2026 |
| 5 | Physical Therapy Appt. | Rehabilitation | — | Upcoming | Mar 13, 2026 | Mar 16, 2026 |
| 6 | Claimant Interview | Restoration | — | Upcoming | Mar 16, 2026 | Mar 20, 2026 |
| 7 | Physician Follow-Up | Medical | — | Upcoming | Mar 20, 2026 | Mar 23, 2026 |
| 8–14 | Physical Therapy Appts. | Rehabilitation | — | Upcoming | Mar 27 → May 1 | … |

Source (all rows): `ai_rule_engine` · Trigger: "AI Restoration Plan"

---

## Screen 3 — Dashboard (LTD Operations Manager)

### Header
- Title: "Welcome, Sarah"
- Subtitle: "LTD Claims performance and team analytics"
- Period selector: "Last 30 Days" · `+` add tile button

---

### Row 1 — KPI Summary Cards

| Metric | Value | Trend |
|---|---|---|
| Open Cases | 87 | ↑ 6% from last period |
| Tasks Completed Today | 34 | ↑ 12% from yesterday |
| SLA Breaches | 8 | ↓ 2% from last period |
| Avg. Completion Time | 3.2 days | ↓ 8% from last period |

---

### Row 2 — Case Status Distribution + Case SLA Health

**Case Status Distribution** — horizontal bar chart
- Active: Awaiting Requirements · 28 cases
- Active: Approved · 14 cases
- Active: Recovery Plan Underway · 31 cases
- Active: Recovery Plan Completed · 7 cases
- Active: Extended Plan · 7 cases

**Case SLA Health** — donut chart
- Within SLA: 68%
- In Danger (< 20% remaining): 21%
- Breached: 11%
- Center label: "87 Total Cases"

---

### Row 3 — Weekly Case Trends + Task Status Breakdown

**Weekly Case Trends** — multi-line chart
- X-axis: weeks (Mar 2 → Mar 26)
- Three lines: New Claims · Approved Claims · Terminated / Closed

**Task Status Breakdown** — horizontal bar chart
- In Progress: 41
- Open: 87
- Escalated: 8
- Complete: 156

---

### Row 4 — Daily Task Volume + AI Performance

**Daily Task Volume** — line chart
- Three lines by day: Tasks Processed · Tasks Received · Tasks Pending

**AI Layer Performance**
- AI resolution rate: 38%
- Human-only: 62%
- Post-approval monitoring events detected: 47
- Requirement overdue escalations auto-created: 23
- Benefit change alerts triggered: 6
- RTW readiness signals detected: 4
- Validate-completion tasks auto-created: 11
- AI accuracy rate: 91% · +4% vs last month
- Footer: "Models trained on 3,214 completed LTD tasks · Updated today"

---

### Row 5 — Team Performance Table

Columns: User Name · Role · Cases Active · Tasks Completed · Avg. Completion Time · SLA % · Open Tasks

| User | Role | Cases Active | Tasks Done | Avg Time | SLA % | Open |
|---|---|---|---|---|---|---|
| William Tell | Assessor | 18 | 42 | 2.9d | 94% | 11 |
| Marie Chen | Assessor | 22 | 38 | 3.1d | 91% | 14 |
| James Okafor | Assessor | 19 | 45 | 2.6d | 96% | 9 |
| Fatima Ali | Assessor | 24 | 29 | 4.2d | 78% | 18 |
| Sarah Wright | Sr. Assessor | 4 | 19 | 5.1d | 89% | 6 |

---

## Task Type Reference

| Task Type | Priority | Origin | Action Set |
|---|---|---|---|
| IP Adjudication Decision | Urgent | STD Exhaustion / AI | Approve & Send to Approver · Decline · Order Requirement · Close |
| Restoration Plan Interview | High | Post-Approval Setup | Accept Meeting · Reject Meeting · Pass to Another User · Select Different Time |
| Medical Update Review | High | AI Monitoring | Review & Continue · Flag for Senior Review · Order Additional Requirement · Complete |
| Benefit Change Alert | Normal | AI Monitoring | Confirm Benefit Change · Request Clarification · Complete |
| Requirement Follow-Up | High | Overdue Monitoring | Contact Party · Waive · Escalate · Complete |
| Validate Case Closure | Normal | Completion Check | Confirm Closure · Add Requirements · Extend Plan · Complete |
| Medical Setback | Urgent | AI Monitoring | Review · Order APS · Adjust Plan · Escalate |
| RTW Readiness Review | High | AI Monitoring | Initiate RTW Plan · Request Employer Statement · Defer · Complete |

---

## General Design Principles

- All screens belong to the same design system — zero visual discontinuity when switching modules.
- The task list + side panel is the most important interaction pattern. It must feel fast and embedded — not a modal or new route. Docked right, scrollable, dismissible with ×.
- The AI layer feels premium and trustworthy — never overwhelming. AI-generated content is visually distinguished from system or user-generated content everywhere it appears.
- Status indicators (RAG, SLA, priority) communicate state only — never decorative.
- All restoration and post-approval elements (plan tile, interview task, monitoring tasks) use the same visual language as pre-approval tasks.
- Desktop only — 1440px viewport.