import type {
  DailyBriefFacts,
  DailyBriefFocus,
  DailyBriefLinkKind,
  DailyBriefSegment,
} from '../../domain/dailyBrief';
import type {
  DashboardBriefHighlightIcon,
  DashboardBriefHighlightTone,
  DashboardCaseHealthRow,
} from '../../domain/access/roleView';

export function briefSegmentsToText(segments: DailyBriefSegment[]): string {
  return segments
    .map((segment) => {
      if (segment.type === 'text') return segment.value;
      if (segment.type === 'cue') return '';
      return segment.label;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function pushBriefText(segments: DailyBriefSegment[], value: string) {
  segments.push({ type: 'text', value });
}

function pushBriefCue(
  segments: DailyBriefSegment[],
  icon: DashboardBriefHighlightIcon,
  label: string,
  tone: DashboardBriefHighlightTone,
) {
  segments.push({ type: 'cue', icon, label, tone });
}

function pushBriefLink(
  segments: DailyBriefSegment[],
  label: string,
  route: string,
  kind: DailyBriefLinkKind,
) {
  segments.push({ type: 'link', label, route, kind });
}

function appendCaseLinks(
  segments: DailyBriefSegment[],
  rows: DashboardCaseHealthRow[],
  max = 2,
) {
  const shown = rows.slice(0, max);
  shown.forEach((row, index) => {
    if (index > 0) {
      pushBriefText(segments, index === shown.length - 1 ? ' and ' : ', ');
    }
    pushBriefLink(segments, row.name, `/cases/${row.id}`, 'case');
  });
  if (rows.length > max) {
    pushBriefText(segments, ` and ${rows.length - max} more`);
  }
}

function findCaseByKey(cases: DashboardCaseHealthRow[], caseKey: string) {
  return cases.find((row) => row.key === caseKey);
}

function truncateBriefLabel(value: string, max = 48): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function subjectPlural(count: number, label: string): string {
  return count === 1 ? label : `${label}s`;
}

function buildOpeningLine(facts: DailyBriefFacts): string {
  const noun = subjectPlural(facts.subjectCount, facts.subjectLabel);
  if (facts.teamScope && facts.subjectMode === 'cases') {
    return `Your team has ${facts.subjectCount} ${noun} in flight. `;
  }
  if (facts.subjectMode === 'tasks') {
    return `You have ${facts.subjectCount} open ${noun} ${facts.scopePhrase}. `;
  }
  if (facts.subjectMode === 'requests') {
    return `You have ${facts.subjectCount} open ${noun} ${facts.scopePhrase}. `;
  }
  if (facts.subjectMode === 'documents') {
    return `You have ${facts.subjectCount} ${noun} ${facts.scopePhrase}. `;
  }
  if (facts.subjectMode === 'actions') {
    return `You have ${facts.subjectCount} ${noun} ${facts.scopePhrase}. `;
  }
  return `You have ${facts.subjectCount} active ${noun} ${facts.scopePhrase}. `;
}

function appendFocusClause(segments: DailyBriefSegment[], facts: DailyBriefFacts, focus: DailyBriefFocus) {
  const isManager = facts.roleView === 'manager';
  pushBriefText(segments, ' ');
  if (!isManager) {
    pushBriefText(segments, ' Your ');
    pushBriefCue(segments, 'focus', 'Focus', 'action');
    pushBriefText(segments, ' is ');
  } else {
    pushBriefText(segments, ' Team ');
    pushBriefCue(segments, 'focus', 'Focus', 'action');
    pushBriefText(segments, ': ');
  }
  pushBriefLink(
    segments,
    truncateBriefLabel(focus.title),
    focus.primaryRoute || '/tasks',
    focus.linkKind ?? 'task',
  );
  const focusCase = facts.cases.find((row) => row.id === focus.caseId);
  if (focusCase) {
    pushBriefText(segments, ' on ');
    pushBriefLink(segments, focusCase.name, `/cases/${focusCase.id}`, 'case');
  } else if (focus.caseId) {
    pushBriefText(segments, ' on ');
    pushBriefLink(segments, focus.caseId, `/cases/${focus.caseId}`, 'case');
  }
  if (isManager && focus.reason) {
    pushBriefText(segments, ` — ${truncateBriefLabel(focus.reason, 56)}`);
  }
  pushBriefText(segments, '.');
}

/** Rules-based segment writer — same logic for every workspace context. */
export function buildDailyBriefSegments(facts: DailyBriefFacts): DailyBriefSegment[] {
  if (!facts.subjectCount && !facts.cases.length) {
    return [{ type: 'text', value: facts.fallbackText }];
  }

  const segments: DailyBriefSegment[] = [];
  const isManager = facts.roleView === 'manager';
  const cases = facts.cases;
  const slaUrgent = cases.filter((row) => row.slaCls === 'red');
  const slaWarning = cases.filter((row) => row.slaCls === 'amber');

  pushBriefText(segments, buildOpeningLine(facts));

  if (isManager && facts.subjectMode === 'cases') {
    const decisionReady = cases.filter((row) => {
      const status = row.status.toLowerCase();
      return status.includes('pending') || status.includes('countersign');
    });
    if (decisionReady.length) {
      pushBriefText(segments, ' ');
      pushBriefText(
        segments,
        decisionReady.length === 1 ? ' One case needs your ' : ` ${decisionReady.length} cases need your `,
      );
      pushBriefCue(segments, 'decision', 'Decisions', 'warn');
      pushBriefText(segments, ': ');
      appendCaseLinks(segments, decisionReady);
      pushBriefText(segments, '. ');
    }
  } else if (facts.subjectMode === 'cases' || facts.subjectMode === 'tasks') {
    if (slaUrgent.length) {
      pushBriefText(segments, ' ');
      pushBriefText(
        segments,
        slaUrgent.length === 1 ? ' One case is at its ' : ` ${slaUrgent.length} cases are at their `,
      );
      pushBriefCue(segments, 'sla', 'SLA', 'urgent');
      pushBriefText(segments, ' deadline today: ');
      appendCaseLinks(segments, slaUrgent);
      pushBriefText(segments, '. ');
    } else if (slaWarning.length) {
      pushBriefText(segments, ' ');
      pushBriefText(
        segments,
        slaWarning.length === 1 ? ' One case is nearing its ' : ` ${slaWarning.length} cases are nearing their `,
      );
      pushBriefCue(segments, 'sla', 'SLA', 'warn');
      pushBriefText(segments, ' deadline');
      if (slaWarning.length <= 2) {
        pushBriefText(segments, ': ');
        appendCaseLinks(segments, slaWarning);
      }
      pushBriefText(segments, '. ');
    }
  }

  if (facts.blocker.count > 0) {
    pushBriefText(segments, ' ');
    pushBriefText(segments, ` ${facts.blocker.count} open `);
    pushBriefCue(segments, 'blocker', 'Blockers', 'warn');
    pushBriefText(segments, ' holding up ');
    const primary = findCaseByKey(cases, facts.blocker.primaryCaseKey);
    if (primary) {
      pushBriefLink(segments, primary.name, `/cases/${primary.id}`, 'case');
      pushBriefText(segments, ` (${facts.blocker.val} in play)`);
    } else {
      pushBriefText(segments, `${facts.blocker.val} in exposure`);
    }
    pushBriefText(segments, '. ');
  }

  if (facts.focus.title) {
    appendFocusClause(segments, facts, facts.focus);
  }

  return segments;
}
