import { useEffect, useMemo, useState } from 'react';
import type { CaseBriefArtifact } from '../components/AiCopilotFooter';

export type CaseBriefIntroPhase =
  | 'thinking'
  | 'greeting'
  | 'requirements'
  | 'focusLine'
  | 'focusCard'
  | 'done';

const THINKING_LABELS = ['Thinking…', 'Gathering context…'] as const;
const THINKING_LABEL_MS = 650;
const THINKING_HOLD_MS = 400;
const GREETING_CHAR_MS = 22;
const REQUIREMENT_STAGGER_MS = 140;
const STEP_GAP_MS = 220;

function buildGreetingPlainText(artifact: CaseBriefArtifact): string {
  const headline = artifact.clientHeadline?.trim();
  if (headline) {
    return `Hi ${artifact.greetingName}, you're on ${artifact.caseId} · ${headline}.`;
  }
  return `Hi ${artifact.greetingName}, you're on ${artifact.caseId}.`;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function caseBriefIntroStorageKey(caseId: string): string {
  return `amplify-case-brief-intro-played:${caseId}`;
}

function hasPlayedCaseBriefIntro(caseId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(caseBriefIntroStorageKey(caseId)) === '1';
  } catch {
    return false;
  }
}

function markCaseBriefIntroPlayed(caseId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(caseBriefIntroStorageKey(caseId), '1');
  } catch {
    /* private mode */
  }
}

export function clearCaseBriefIntroPlayed(caseId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(caseBriefIntroStorageKey(caseId));
  } catch {
    /* private mode */
  }
}

function canPlayCaseBriefIntro(
  wantsIntro: boolean,
  caseId: string,
  focusTask?: CaseBriefArtifact['focusTask'],
): boolean {
  if (focusTask?.semiAuto && !focusTask.taskOutcome) return false;
  return wantsIntro && !hasPlayedCaseBriefIntro(caseId) && !prefersReducedMotion();
}

export function useCaseBriefIntroSequence(
  artifact: CaseBriefArtifact,
  wantsIntro: boolean,
  /** Bumps when the case AI panel opens so the intro can replay in-panel. */
  introReplayKey = 0,
) {
  const greetingPlain = useMemo(() => buildGreetingPlainText(artifact), [artifact]);
  const requirementCount = artifact.openRequirements.length;

  const [animateIntro, setAnimateIntro] = useState(() =>
    canPlayCaseBriefIntro(wantsIntro, artifact.caseId, artifact.focusTask),
  );

  const [phase, setPhase] = useState<CaseBriefIntroPhase>(animateIntro ? 'thinking' : 'done');
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [greetingLength, setGreetingLength] = useState(animateIntro ? 0 : greetingPlain.length);
  const [visibleRequirements, setVisibleRequirements] = useState(animateIntro ? 0 : requirementCount);

  const resetIntroRun = () => {
    if (prefersReducedMotion() || !wantsIntro) {
      setAnimateIntro(false);
      setPhase('done');
      setGreetingLength(greetingPlain.length);
      setVisibleRequirements(requirementCount);
      return;
    }
    setAnimateIntro(true);
    setPhase('thinking');
    setThinkingIndex(0);
    setGreetingLength(0);
    setVisibleRequirements(0);
  };

  useEffect(() => {
    if (!wantsIntro || introReplayKey === 0) return;
    clearCaseBriefIntroPlayed(artifact.caseId);
    resetIntroRun();
  }, [wantsIntro, introReplayKey, artifact.caseId, greetingPlain.length, requirementCount]);

  useEffect(() => {
    if (introReplayKey > 0) return;
    if (canPlayCaseBriefIntro(wantsIntro, artifact.caseId, artifact.focusTask)) {
      resetIntroRun();
      return;
    }
    setAnimateIntro(false);
    setPhase('done');
    setGreetingLength(greetingPlain.length);
    setVisibleRequirements(requirementCount);
  }, [wantsIntro, artifact.caseId, greetingPlain, requirementCount, introReplayKey]);

  useEffect(() => {
    if (!animateIntro || phase !== 'thinking') return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    THINKING_LABELS.forEach((_, index) => {
      if (index > 0) {
        timers.push(
          setTimeout(() => setThinkingIndex(index), THINKING_LABEL_MS * index),
        );
      }
    });

    const thinkingEnd =
      THINKING_LABEL_MS * THINKING_LABELS.length + THINKING_HOLD_MS;
    timers.push(setTimeout(() => setPhase('greeting'), thinkingEnd));

    return () => timers.forEach(clearTimeout);
  }, [animateIntro, phase]);

  useEffect(() => {
    if (!animateIntro || phase !== 'greeting') return;

    if (greetingLength >= greetingPlain.length) {
      const timer = setTimeout(() => {
        if (requirementCount > 0) {
          setPhase('requirements');
        } else {
          setPhase('focusLine');
        }
      }, STEP_GAP_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(
      () => setGreetingLength((value) => Math.min(value + 1, greetingPlain.length)),
      GREETING_CHAR_MS,
    );
    return () => clearTimeout(timer);
  }, [animateIntro, phase, greetingLength, greetingPlain.length, requirementCount]);

  useEffect(() => {
    if (!animateIntro || phase !== 'requirements') return;

    if (visibleRequirements >= requirementCount) {
      const timer = setTimeout(() => setPhase('focusLine'), STEP_GAP_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(
      () => setVisibleRequirements((value) => Math.min(value + 1, requirementCount)),
      visibleRequirements === 0 ? STEP_GAP_MS : REQUIREMENT_STAGGER_MS,
    );
    return () => clearTimeout(timer);
  }, [animateIntro, phase, visibleRequirements, requirementCount]);

  useEffect(() => {
    if (!animateIntro || phase !== 'focusLine') return;

    const timer = setTimeout(() => {
      if (artifact.focusTask) {
        setPhase('focusCard');
      } else {
        setPhase('done');
      }
    }, STEP_GAP_MS);
    return () => clearTimeout(timer);
  }, [animateIntro, phase, artifact.focusTask]);

  useEffect(() => {
    if (!animateIntro || phase !== 'focusCard') return;

    const timer = setTimeout(() => setPhase('done'), 480);
    return () => clearTimeout(timer);
  }, [animateIntro, phase]);

  useEffect(() => {
    if (phase === 'done' && animateIntro) {
      markCaseBriefIntroPlayed(artifact.caseId);
    }
  }, [phase, animateIntro, artifact.caseId]);

  const thinkingLabel = THINKING_LABELS[thinkingIndex] ?? THINKING_LABELS[0];
  const greetingTyped = greetingPlain.slice(0, greetingLength);
  const showThinking = phase === 'thinking';
  const showGreeting = phase !== 'thinking';
  const showRequirementsSection =
    phase === 'requirements' || phase === 'focusLine' || phase === 'focusCard' || phase === 'done';
  const showFocusLine =
    phase === 'focusLine' || phase === 'focusCard' || phase === 'done';
  const showFocusCard =
    Boolean(artifact.focusTask)
    && (phase === 'focusCard' || phase === 'done');

  return {
    phase,
    thinkingLabel,
    greetingTyped,
    greetingComplete: greetingLength >= greetingPlain.length,
    visibleRequirements,
    showThinking,
    showGreeting,
    showRequirementsSection,
    showFocusLine,
    showFocusCard,
    animateIntro,
  };
}
