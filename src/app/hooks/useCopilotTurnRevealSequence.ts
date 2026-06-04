import { useEffect, useMemo, useState } from 'react';
import type { ChatArtifact } from '../components/AiCopilotFooter';

export type CopilotTurnRevealPhase = 'thinking' | 'text' | 'artifact' | 'followUps' | 'done';

const THINKING_MS = 520;
const TEXT_CHAR_MS = 16;
const STEP_GAP_MS = 180;
const FOLLOW_UP_STAGGER_MS = 100;

function stripMarkdownForTyping(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasRevealableArtifact(artifact?: ChatArtifact): boolean {
  if (!artifact) return false;
  return (
    artifact.kind === 'case-next-step'
    || artifact.kind === 'case-task-queue'
    || artifact.kind === 'case-requirements-list'
    || artifact.kind === 'action-card'
    || artifact.kind === 'task-list'
  );
}

export function useCopilotTurnRevealSequence(options: {
  enabled: boolean;
  text: string;
  artifact?: ChatArtifact;
  followUpCount: number;
  introReplayKey?: number;
}) {
  const { enabled, text, artifact, followUpCount, introReplayKey = 0 } = options;
  const plainText = useMemo(() => stripMarkdownForTyping(text), [text]);
  const showArtifact = hasRevealableArtifact(artifact);

  const shouldAnimate = enabled && !prefersReducedMotion() && (plainText.length > 0 || showArtifact);

  const [phase, setPhase] = useState<CopilotTurnRevealPhase>(shouldAnimate ? 'thinking' : 'done');
  const [textLength, setTextLength] = useState(shouldAnimate ? 0 : plainText.length);
  const [visibleFollowUps, setVisibleFollowUps] = useState(shouldAnimate ? 0 : followUpCount);

  useEffect(() => {
    if (!shouldAnimate) {
      setPhase('done');
      setTextLength(plainText.length);
      setVisibleFollowUps(followUpCount);
      return;
    }
    setPhase('thinking');
    setTextLength(0);
    setVisibleFollowUps(0);
  }, [shouldAnimate, plainText, followUpCount, introReplayKey]);

  useEffect(() => {
    if (!shouldAnimate || phase !== 'thinking') return;
    const timer = setTimeout(() => setPhase(plainText.length ? 'text' : showArtifact ? 'artifact' : followUpCount ? 'followUps' : 'done'), THINKING_MS);
    return () => clearTimeout(timer);
  }, [shouldAnimate, phase, plainText.length, showArtifact, followUpCount]);

  useEffect(() => {
    if (!shouldAnimate || phase !== 'text') return;
    if (textLength >= plainText.length) {
      const timer = setTimeout(() => {
        if (showArtifact) setPhase('artifact');
        else if (followUpCount > 0) setPhase('followUps');
        else setPhase('done');
      }, STEP_GAP_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => setTextLength((value) => Math.min(value + 1, plainText.length)),
      TEXT_CHAR_MS,
    );
    return () => clearTimeout(timer);
  }, [shouldAnimate, phase, textLength, plainText.length, showArtifact, followUpCount]);

  useEffect(() => {
    if (!shouldAnimate || phase !== 'artifact') return;
    const timer = setTimeout(() => {
      if (followUpCount > 0) setPhase('followUps');
      else setPhase('done');
    }, STEP_GAP_MS + 120);
    return () => clearTimeout(timer);
  }, [shouldAnimate, phase, followUpCount]);

  useEffect(() => {
    if (!shouldAnimate || phase !== 'followUps') return;
    if (visibleFollowUps >= followUpCount) {
      const timer = setTimeout(() => setPhase('done'), STEP_GAP_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => setVisibleFollowUps((value) => Math.min(value + 1, followUpCount)),
      visibleFollowUps === 0 ? STEP_GAP_MS : FOLLOW_UP_STAGGER_MS,
    );
    return () => clearTimeout(timer);
  }, [shouldAnimate, phase, visibleFollowUps, followUpCount]);

  return {
    phase,
    thinkingLabel: 'Thinking…',
    showThinking: phase === 'thinking',
    showText: phase !== 'thinking',
    textTyped: plainText.slice(0, textLength),
    textComplete: textLength >= plainText.length,
    showArtifact:
      showArtifact && (phase === 'artifact' || phase === 'followUps' || phase === 'done'),
    visibleFollowUps,
    showFollowUps: followUpCount > 0 && (phase === 'followUps' || phase === 'done'),
    animateIntro: shouldAnimate,
  };
}
