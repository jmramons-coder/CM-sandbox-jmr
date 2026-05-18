# Product Vision

## Purpose

Amplify Case Management is a work orchestration platform for insurance operations. It helps teams understand what is happening across cases, policies, clients, agents, documents, requirements, requests, and tasks, then act with the right context at the right moment.

The product vision is to make complex operational work feel connected, explainable, and actionable. Users should not have to chase information across disconnected screens. The platform should bring related objects, evidence, workflow state, AI guidance, and next actions together in a focused workspace.

## Experience Principles

- **Context before action**: Every action should be grounded in the object, evidence, workflow state, and business reason behind it.
- **AI at the right time**: AI should appear where it improves judgment, speed, or quality, not as noise everywhere.
- **Dynamic navigation**: Users should move fluidly between related contexts without losing their place.
- **Object-centered work**: Cases, policies, clients, agents, requirements, documents, requests, and tasks are connected objects, not isolated pages.
- **Explainable operations**: AI activity, workflow progress, pending controls, and system-initiated actions should be visible and understandable.

## Current High-Level Modules

### Home / Dashboard

The dashboard gives users a high-level operational view: priority work, case portfolio health, recent activity, evidence signals, and AI-driven cues. It is designed as the starting point for understanding where attention is needed.

### Tasks

Tasks represent concrete work items created by users, workflows, or AI-assisted processes. They connect problems to actions: review evidence, validate a requirement, follow up with a client, record a decision, or complete a control point.

Tasks are not just checklist items. They carry source, owner, due window, linked objects, contextual summaries, and action guidance.

### Cases

The standalone case module supports users who need case management capabilities without requiring deep policy administration or folder-level access. Cases bring together claimant details, stages, requirements, documents, decisions, activities, and AI assessment.

This is especially important for claim, underwriting, and assessment workflows where users need focused case execution without full policy admin visibility.

### Folders

Folders represent the broader object workspace for policy administration and entity-level information. They can contain policies, clients, agents, participants, coverages, relationships, and related objects.

Folders support deeper administrative workflows and object management where users need richer policy or client context.

### Documents

Documents are evidence-bearing objects. They can be linked to cases, requirements, requests, clients, and policies. The document experience includes AI summaries, validation status, source tracking, page preview, evidence highlighting, and contextual insight navigation.

The document viewer is a power tool for understanding evidence quickly, especially when AI has extracted findings that need human review.

### Requirements

Requirements represent evidence, validation, compliance, or workflow conditions needed to move an object forward. They can be created by rules, users, AI, integrations, or downstream processes.

Requirements connect workflow state to evidence and action. They help users understand what is missing, what is overdue, what has been fulfilled, and what needs review.

### Requests

Requests capture inbound and outbound asks. They can come from a client portal, email, phone, internal users, external medical organizations, employers, advisors, or other third parties.

Requests can be tied to a policy, client, case, requirement, document, or chained task. They also expose system-initiated steps so users can see what the platform did when the request was received or created.

### AI Assistant

The AI Assistant is a conversational layer that can work across modules and contexts. It understands active work, tracks conversations, and supports deeper reasoning, summaries, follow-ups, and next-step planning.

The assistant is not separate from the platform. It is context-aware and works alongside object views, side panels, documents, tasks, and case information.

## Platform Features

### App Switcher

The app switcher allows users to move between major product areas while preserving the broader platform mental model. It supports a multi-app future where case management, eApp, documentation, and other experiences can coexist.

### Platform Settings

Platform settings control configuration, feature availability, case types, branding, module behavior, and future product-level rules. These settings allow the same platform to adapt to different operational models and user groups.

### Configuration

Configuration is a core platform capability. It should eventually define object types, workflows, statuses, roles, permissions, rules, AI behavior, module visibility, and integration mappings.

The goal is to let organizations shape the platform around their operating model without hardcoding every workflow.

### Object Navigation

Object links in panels and modules should let users jump between cases, clients, policies, requirements, requests, tasks, and documents without losing their current working context.

Navigation should feel layered and continuous rather than disruptive.

## Object Architecture

At the core of the platform is an object model:

- **Case**
- **Policy**
- **Client**
- **Agent**
- **Participant**
- **Coverage**
- **Requirement**
- **Request**
- **Task**
- **Document**
- **Payment**
- **Decision**
- **Activity**

Each object can hold:

- Structured data
- Status and progress indicators
- Workflow state
- Related actions
- Linked evidence
- AI-generated insights
- Audit and activity history
- Contextual utilities

Objects can have utilities attached to them. For example, a case, folder, policy, or client can have tasks, requirements, requests, documents, notes, activities, decisions, and AI summaries.

This keeps the platform flexible: modules can exist as standalone workspaces, but the same capabilities can also appear contextually inside an object.

## Dynamic Side Panel Vision

The dynamic side panel is a core interaction model. It lets users inspect and act on related objects without leaving their primary workspace.

The panel supports:

- Multiple recent contexts
- Context switching through a compact navigation rail
- Object detail views
- Linked document previews
- Requirement and request context
- AI assistant access inside the same workspace
- In-content AI summaries and evidence quality signals

The goal is to let users move from information to problem to action without repeatedly navigating full pages.

Example flow:

1. Open a task from a table.
2. Inspect the linked case and claimant.
3. Open the linked requirement.
4. Preview the evidence document.
5. Ask the AI assistant a follow-up question.
6. Return to the task and complete the action.

All of this should happen while preserving user orientation.

## AI Integration Vision

AI is integrated throughout the platform, but intentionally:

- AI summarizes complex evidence.
- AI explains why a task or requirement exists.
- AI identifies missing information and contradictions.
- AI suggests next steps.
- AI tracks system-initiated actions.
- AI supports conversations grounded in active context.
- AI feeds expose behind-the-scenes agent activity.

The product should make AI feel like a reliable operational layer, not a separate chatbot bolted onto the side.

AI should help users answer:

- What changed?
- Why does this matter?
- What is missing?
- What should I do next?
- What did the system already do?
- What still needs human review?

## AI Feeds and Agent Visibility

Behind the scenes, AI agents can monitor intake, evidence, requirements, tasks, workflows, and status changes. Users need a high-level way to see this activity.

AI feeds should expose:

- Background analysis
- Evidence extraction
- Request routing
- Workflow recommendations
- Risk or SLA changes
- Suggested tasks
- Pending human review points

This helps users trust automation because they can see what happened, what was inferred, and what still requires review.

## Upcoming Module Potential

Future modules can build on the same object and utility architecture:

- **Payments**: payment methods, benefit payments, banking validation, payment exceptions.
- **Decisions**: approvals, declines, modified offers, authority checks, rationale capture.
- **Communications**: email, phone, portal messages, templates, conversation history.
- **Insights**: portfolio trends, operational risks, AI-detected gaps, SLA forecasting.
- **Reports**: productivity, compliance, case outcomes, requirement aging, AI usage.
- **Finance**: reserves, payouts, recovery, overpayment controls.
- **Integrations**: provider feeds, policy admin, document intake, medical networks, employer portals.
- **Automation Studio**: workflow rules, AI agent configuration, triggers, task generation.
- **Knowledge / Guidance**: internal procedures, product rules, underwriting or claims guidelines.

The guiding idea is that each module can be both:

- A standalone workspace for users focused on that domain.
- A contextual utility available inside cases, folders, policies, clients, and other objects.

## Strategic Direction

Amplify should become the connective tissue of insurance operations:

- It understands the objects involved.
- It shows the workflow state.
- It links evidence to decisions.
- It helps users move across contexts.
- It surfaces AI assistance when it creates value.
- It makes automation visible and reviewable.
- It supports both focused case execution and deeper policy administration.

The long-term vision is a configurable, AI-assisted work platform where operational teams can manage complex insurance journeys with clarity, speed, and confidence.
