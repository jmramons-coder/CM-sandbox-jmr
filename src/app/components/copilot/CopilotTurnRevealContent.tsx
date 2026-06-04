'use client';

import { useRef, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ChatArtifact } from '../AiCopilotFooter';
import { useCopilotTurnRevealSequence } from '../../hooks/useCopilotTurnRevealSequence';
import { useCopilotRevealScrollFollow } from '../../hooks/useCopilotRevealScrollFollow';

function CopilotThinkingLine({ label }: { label: string }) {
  return (
    <p className="case-brief-thinking flex items-center gap-2 py-1 text-[13px] text-text-muted">
      <span className="case-brief-thinking__dots inline-flex gap-0.5" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      <span key={label} className="case-brief-thinking__label">
        {label}
      </span>
    </p>
  );
}

type CopilotTurnRevealContentProps = {
  revealIntro?: boolean;
  introReplayKey?: number;
  text: string;
  artifact?: ChatArtifact;
  followUps?: string[];
  renderMarkdown: (value: string) => ReactNode;
  renderArtifact: (artifact: ChatArtifact, introReveal: boolean) => ReactNode;
  onFollowUpClick: (prompt: string) => void;
};

export function CopilotTurnRevealContent({
  revealIntro = false,
  introReplayKey = 0,
  text,
  artifact,
  followUps = [],
  renderMarkdown,
  renderArtifact,
  onFollowUpClick,
}: CopilotTurnRevealContentProps) {
  const intro = useCopilotTurnRevealSequence({
    enabled: revealIntro,
    text,
    artifact,
    followUpCount: followUps.length,
    introReplayKey,
  });

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  useCopilotRevealScrollFollow({
    active: intro.animateIntro && intro.phase !== 'done',
    followKey: `${intro.phase}:${intro.textTyped.length}:${intro.visibleFollowUps}:${intro.showArtifact}`,
    anchorRef: scrollAnchorRef,
  });

  if (!intro.animateIntro) {
    return (
      <>
        {text ? <div className="py-2 text-[15px] leading-relaxed text-[#171717]">{renderMarkdown(text)}</div> : null}
        {artifact ? renderArtifact(artifact, false) : null}
        {followUps.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {followUps.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onFollowUpClick(label)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-white px-3 py-1.5 text-[12px] font-medium text-brand-blue transition-colors hover:border-brand-blue/30 hover:bg-surface-selected-alt"
              >
                <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  const followUpsToShow = followUps.slice(0, intro.visibleFollowUps);

  return (
    <>
      {intro.showThinking ? <CopilotThinkingLine label={intro.thinkingLabel} /> : null}
      {intro.showText && text ? (
        intro.textComplete ? (
          <div className="copilot-turn-reveal-text py-2 text-[15px] leading-relaxed text-[#171717] animate-in fade-in duration-200">
            {renderMarkdown(text)}
          </div>
        ) : (
          <div className="py-2 text-[15px] leading-relaxed text-[#171717]">
            {intro.textTyped}
            <span className="case-brief-caret ml-0.5 inline-block animate-pulse text-brand-accent">|</span>
          </div>
        )
      ) : null}
      {intro.showArtifact && artifact ? renderArtifact(artifact, true) : null}
      {intro.showFollowUps && followUpsToShow.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {followUpsToShow.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => onFollowUpClick(label)}
              className="copilot-follow-up-chip inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-white px-3 py-1.5 text-[12px] font-medium text-brand-blue transition-colors hover:border-brand-blue/30 hover:bg-surface-selected-alt animate-in fade-in slide-in-from-bottom-1 duration-300"
              style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'backwards' }}
            >
              <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div ref={scrollAnchorRef} className="h-px w-full shrink-0" aria-hidden />
    </>
  );
}
