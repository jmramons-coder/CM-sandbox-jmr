# Amplify Case Management — Demo Walkthrough

A high-fidelity, fully client-side React prototype of a multi-case life & disability workspace (underwriting + claims). All data is mocked. Run `npm run dev` and open `http://localhost:5173/`.

The left vertical nav has five modules: **Home · Cases · Tasks · Documents · Assistant** (the AI copilot). **Folders** also exists but is off by default. Most demos start in **Tasks**.

---

## Demo flow

```
Tasks (My tasks)
  └─ IT-5197 "Decision — verify requirements & AI recommendation"
       └─ open case IP26-5546112
            ├─ Requirements tab  (R-1 … R-7)
            └─ Decision tab → Approve
                 └─ AI Crew — Post-Approval Setup
                      ├─ creates case IP26-5546200 (Restoration Plan)
                      └─ pushes task IT-5198
                           └─ Task detail → ACCEPT MEETING
                                └─ AI Crew — Meeting Confirmed
                                     └─ +5% CPI benefit increase on IP26-5546200
                                          └─ CONFIRM PLAN (top-right of case header)
                                               └─ ongoing follow-ups (SEND FOLLOW-UP)
```

### IT-5197 — first task in My tasks
The preselected row in the queue. URGENT, attached to Billy Bud's pre-approval IP claim.

### Open case IP26-5546112
Two ways to jump from a task to its case: click the case ID in the **Case** column of the table, or open the task and click the case ID in the **task detail side panel**.

### Requirements tab
Pre-approval evidence list (`R-1` to `R-7`: Claimant Interview, Identity Verification, …, Orthopaedic Consultant Report). Quick visual review before deciding.

### Decision tab → Approve
Where the underwriter records the human decision. Approving Billy's case is what fires the AI agent sequence below.

### AI Crew — Post-Approval Setup
Once the decision is approved, a toast in the **bottom-left** of the screen visualizes the AI agents working through three steps: (1) creating the post-approval case, (2) building the restoration plan and its requirements, (3) pushing the follow-up task.

### Case IP26-5546200 with Restoration Plan
While the toast is still running, the new case appears in the **Cases** workspace (left side panel) flagged with a **pulsing blue dot** to mark it as new and unseen. Open it: the **case progress bar** at the top shows the **Restoration Plan** stage as completed and the case as currently sitting at **Plan Verification**. On the **Requirements** tab you see the **Restoration Plan** section freshly populated with the post-approval set (e.g. Restoration Plan Interview, Monthly Physician Follow-Up).

### Task IT-5198 pushed
While the user is reviewing the requirements on the new case, the agents have in parallel created the next human action. A **red badge** appears on the **Tasks** tab signaling a new, unseen task. Clicking through, **IT-5198 — *Restoration plan review — schedule meeting with claimant*** is sitting at the top of the queue.

### Task detail → ACCEPT MEETING
Open the task; the side panel shows the proposed appointment with primary CTA **ACCEPT MEETING** (and **REJECT MEETING** as the secondary). This is the human-in-the-loop confirmation moment.

### AI Crew — Meeting Confirmed
A second toast sequence runs after the meeting is accepted, ending with a benefit-change step.

### +5% CPI benefit increase
On `IP26-5546200`, the monthly benefit chip in the case header updates to **£6,562 ↑ +£312 · 5%**, with a tooltip explaining it as **CPI indexation, auto-applied** — illustrating the platform reacting to live policy events without a human edit.

### CONFIRM PLAN
After the off-app conversation with the claimant, the user closes out the meeting from the **CONFIRM PLAN** button in the top-right of the case header on `IP26-5546200`. This marks the **Restoration Plan Interview** requirement as Fulfilled and moves the case forward to *Recovery Underway*. *(Note: the per-requirement actions in the kebab and side panel are not wired up to this requirement yet — CONFIRM PLAN is the working path for the demo.)*

### Ongoing follow-ups
Subsequent post-approval requirements (e.g. **Monthly Physician Follow-Up**) carry a **Follow-Up Date**. From the requirement side panel use **SEND FOLLOW-UP** to chase them — this is the steady-state loop after restoration is underway.

---

## Platform settings & app switcher (briefly)

**Platform Settings** lives behind the **user avatar / name menu** in the top-right header (click the avatar with the user's name to open the dropdown, then choose **Platform settings** — the entry with the gear icon). It opens a five-tab modal — **Branding · Modules · Intelligence · Language · Roles** — used to reconfigure the demo: enable/disable modules, switch case types, toggle AI activity, change theme/branding. Settings are persisted to `localStorage`. Note: the AI flow above only fires when **Intelligence → AI activity** is enabled.

**App Switcher** (9-dot icon, top left) lists the Equisoft apps available to the user (Amplify Case Management, eApp). It is functional — selecting an app navigates to that app's default route — but the visual treatment is still in progress and will be replaced when the cross-app shell design lands.
