import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check } from 'lucide-react';
import type { InsightBundle, InsightSection } from './caseInsightsData';

const rail = {
  text: 'text-[13px] font-medium leading-5 tracking-[-0.01em] text-[#3d3d3f]',
  textMuted: 'text-[#8e8e93]',
  textSelected: 'text-[13px] font-semibold leading-5 tracking-[-0.01em] text-text-primary',
  fillHover: 'hover:bg-[#1b1c1e]/[0.04]',
  fillSelected: 'bg-brand-blue/[0.09]',
};

function statusForIndex(idx: number, activeStage: number, n: number): 'done' | 'active' | 'upcoming' {
  const step = idx + 1;
  if (activeStage > n) return 'done';
  if (activeStage < 1) return 'upcoming';
  if (step < activeStage) return 'done';
  if (step === activeStage) return 'active';
  return 'upcoming';
}

function renderBodyWithHooks(
  body: string,
  onRequirementsClick: () => void,
): ReactNode {
  if (!body.includes('[[requirements]]')) return body;
  const parts = body.split('[[requirements]]');
  return (
    <>
      {parts[0]}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRequirementsClick(); }}
        className="mx-0.5 inline border-b border-dotted border-brand-blue font-medium text-brand-blue underline decoration-brand-blue/40 underline-offset-2 transition-colors hover:bg-surface-selected/60 hover:decoration-brand-blue"
      >
        requirements
      </button>
      {parts[1]}
    </>
  );
}

export function CaseInsightsPanel({
  activeStage,
  bundle,
  onTextMouseUp,
  onCopilotToast,
}: {
  casePhase?: string;
  activeStage: number;
  activeStagePre?: number;
  activeStagePost?: number;
  bundle: InsightBundle;
  onTextMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void;
  onCopilotToast: (message: string) => void;
}) {
  const sections = bundle.sections;
  const n = sections.length;

  const [visibleIdx, setVisibleIdx] = useState<number>(activeStage >= 1 && activeStage <= n ? activeStage - 1 : 0);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleRequirementsHook = useCallback(() => {
    onCopilotToast('Jumping to Requirement Gathering \u2014 same items live under Requirements.');
    const el = sectionRefs.current[2];
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [onCopilotToast]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      isUserScrolling.current = true;
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => { isUserScrolling.current = false; }, 150);

      const containerTop = container.getBoundingClientRect().top;
      let closest = 0;
      let closestDist = Infinity;

      for (let i = 0; i < n; i++) {
        const el = sectionRefs.current[i];
        if (!el) continue;
        const dist = Math.abs(el.getBoundingClientRect().top - containerTop - 60);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setVisibleIdx(closest);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [n]);

  useEffect(() => {
    if (activeStage >= 1 && activeStage <= n) {
      const idx = activeStage - 1;
      const el = sectionRefs.current[idx];
      el?.scrollIntoView({ behavior: 'auto', block: 'start' });
      setVisibleIdx(idx);
    }
  }, [activeStage, n]);

  const scrollToSection = useCallback((idx: number) => {
    const el = sectionRefs.current[idx];
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setVisibleIdx(idx);
  }, []);

  const railStepButton = (idx: number, label: string) => {
    const st = statusForIndex(idx, activeStage, n);
    const isVisible = visibleIdx === idx;

    const dotCol = 'inline-flex h-[20px] min-h-[20px] w-[20px] min-w-[20px] shrink-0 items-center justify-center';
    const dotBase = `${dotCol} rounded-full text-[10px] font-semibold tabular-nums transition-[colors,box-shadow] duration-200`;
    const doneDot = `${dotBase} bg-[#2d9d4f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`;
    const upcomingDot = `${dotBase} border border-[#1b1c1e]/[0.08] bg-[#f5f5f7] text-[#8e8e93]`;
    const processDot = `${dotBase} border border-brand-blue/22 bg-white text-brand-blue shadow-[0_0_0_2px_var(--color-brand-blue-ring)]`;

    const dotClass = st === 'done' ? doneDot : st === 'active' ? processDot : upcomingDot;

    return (
      <li key={idx} className="list-none">
        <button
          type="button"
          title={label}
          onClick={() => scrollToSection(idx)}
          className={`flex w-full min-w-0 items-center gap-2 rounded-[10px] py-2 pl-2 pr-3 text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${
            isVisible ? rail.fillSelected : rail.fillHover
          }`}
        >
          <span className={dotClass}>
            {st === 'done' ? (
              <Check className="h-3 w-3" strokeWidth={2.25} />
            ) : (
              <span className="flex h-full w-full items-center justify-center leading-none tabular-nums">
                {idx + 1}
              </span>
            )}
          </span>
          <span
            className={`min-w-0 flex-1 truncate ${
              isVisible
                ? rail.textSelected
                : st === 'done'
                  ? `${rail.text} text-[#2d6a45]`
                  : rail.text
            }`}
          >
            {label}
          </span>
        </button>
      </li>
    );
  };

  const renderSection = (idx: number, section: InsightSection, prevActiveInDom: boolean) => {
    const isCurrent = activeStage - 1 === idx;
    const isActive = visibleIdx === idx;
    const hideDivider = isActive || prevActiveInDom;

    return (
      <div
        key={idx}
        ref={(el) => { sectionRefs.current[idx] = el; }}
        className="scroll-mt-4"
      >
        {idx > 0 && !hideDivider && <div className="mx-1 h-px bg-[#e8eaed]" />}
        {idx > 0 && hideDivider && <div className="h-px" />}
        <div className={`${isActive ? '-mx-5 bg-surface-selected-alt px-5' : ''} py-4`}>

        <div className="flex flex-wrap items-center gap-2">
          {isCurrent && (
            <span className="rounded-md bg-brand-blue px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
              Current
            </span>
          )}
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#86868b]">{section.label}</span>
          {section.aiSignals && section.aiSignals.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {section.aiSignals.map((s) => (
                <span
                  key={`${s.label}-${s.value}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[#e8eaed] bg-surface-primary px-2 py-0.5 text-[10px] text-text-secondary"
                >
                  <span className="font-medium text-brand-accent">{s.label}</span>
                  <span className="text-text-secondary">{s.value}</span>
                </span>
              ))}
            </span>
          )}
        </div>

        <h4 className="mt-2 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-text-primary">
          {section.headline}
        </h4>

        <div className="mt-2 select-text text-[13px] leading-relaxed text-text-secondary">
          {renderBodyWithHooks(section.body, handleRequirementsHook)}
        </div>

        {section.continuation && (
          <p className="mt-3 border-l-2 border-[#d8c7f1] pl-3 text-[13px] leading-relaxed text-[#4a5058]">
            {section.continuation}
          </p>
        )}

        {section.actorsLine && (
          <p className="mt-3 text-[11px] leading-snug text-text-muted">
            <span className="font-medium text-text-secondary">Activity \u00b7 </span>
            {section.actorsLine}
          </p>
        )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-row items-stretch gap-0">
        {/* Left rail */}
        <nav
          className="flex min-h-0 w-[156px] shrink-0 flex-col border-r border-[#e8eaed] sm:w-[172px]"
          aria-label="Journey steps"
        >
          <div className="min-h-0 w-full flex-1 overflow-y-auto px-2 py-3">
            <div className="flex min-h-full flex-col justify-center">
              <ul className="flex flex-col">
                {[...sections].map((_, i) => sections.length - 1 - i).map((idx) => railStepButton(idx, sections[idx].label))}
              </ul>
            </div>
          </div>
        </nav>

        {/* Right content */}
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full min-h-0 overflow-y-auto overscroll-contain px-5 pt-8 pb-[60vh]"
            onMouseUp={onTextMouseUp}
            role="article"
            aria-label="Journey narrative"
          >
            {(() => {
              const reversed = [...sections].map((_, i) => sections.length - 1 - i);
              return reversed.map((idx, renderOrder) => {
                const prevIdx = renderOrder > 0 ? reversed[renderOrder - 1] : -1;
                const prevActiveInDom = prevIdx >= 0 && visibleIdx === prevIdx;
                return renderSection(idx, sections[idx], prevActiveInDom);
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
