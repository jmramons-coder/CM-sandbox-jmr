import type { AgentRecord } from '../data/multi-case-dataset';
import { getPersonInitials } from './person-avatar';

/** Second row: agency · email */
export function formatAgentListMetaLine(agent: Pick<AgentRecord, 'agencyName' | 'email'>): string | undefined {
  const line = [agent.agencyName, agent.email].filter(Boolean).join(' · ').trim();
  return line || undefined;
}

/** Options row for `CreationSearchSelect` agent pickers. */
export function toAgentSearchSelectOption(agent: AgentRecord) {
  return {
    value: agent.id,
    label: agent.name,
    avatarLabel: getPersonInitials(agent.name),
    status: agent.status,
    statusContext: 'entityTable' as const,
    agentMeta: {
      agency: agent.agencyName,
      email: agent.email,
    },
    metadata: [agent.agencyName, agent.email, agent.producerCode, agent.phone, agent.jurisdictionSummary].filter(
      Boolean,
    ) as string[],
  };
}

/** Global header search result shape for an agent. */
export function toAgentSummarySearchResult(agent: AgentRecord) {
  return {
    id: `agent-${agent.id}`,
    type: 'Agent' as const,
    agentId: agent.id,
    name: agent.name,
    agency: agent.agencyName,
    email: agent.email,
    status: agent.status,
    href: `/folders/${agent.id}`,
  };
}
