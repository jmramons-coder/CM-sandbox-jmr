import { useState } from 'react';
import { X, ChevronDown, ExternalLink, Clock, AlertTriangle, Check, FileText } from 'lucide-react';
import type { CaseRequirement } from '../types';
import { AiCueSparkle } from './AiCueSparkle';
import { CollapsibleDetailSection } from './CollapsibleDetailSection';
import { LozengeTag } from './LozengeTag';

function statusLozengeType(status: CaseRequirement['status']) {
  if (status === 'Fulfilled' || status === 'Waived') return 'Success' as const;
  if (status === 'Overdue') return 'Alert' as const;
  if (status === 'Pending') return 'Warning' as const;
  if (status === 'Ordered') return 'Informative' as const;
  return 'Neutral' as const;
}

function sourceLabel(source: string) {
  if (source === 'ai_rule_engine') return 'AI Rule Engine';
  if (source === 'id_verification') return 'ID Verification';
  if (source === 'employer_portal') return 'Employer Portal';
  if (source === 'pharmacy_check') return 'Pharmacy Check';
  return source;
}

function sourcePillClass(source: string) {
  if (source === 'ai_rule_engine') return 'bg-brand-accent-light text-brand-accent';
  if (source === 'id_verification') return 'bg-surface-selected text-brand-blue';
  return 'bg-surface-muted text-text-secondary';
}

export type RequirementDetailSidePanelProps = {
  requirement: CaseRequirement;
  caseId: string;
  panelWidth: number;
  onResizeStart: () => void;
  onClose: () => void;
  externalHref: string;
  externalCode: string;
};

export function RequirementDetailSidePanel({
  requirement,
  caseId,
  panelWidth,
  onResizeStart,
  onClose,
  externalHref,
  externalCode,
}: RequirementDetailSidePanelProps) {
  const [aiExpanded, setAiExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const isFulfilled = requirement.status === 'Fulfilled' || requirement.status === 'Waived';
  const isOverdue = requirement.status === 'Overdue';

  return (
    <div
      className="fixed right-0 z-20 flex flex-col overflow-hidden border-l border-t border-border-default bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)]"
      style={{
        width: `${panelWidth}px`,
        top: '48px',
        height: 'calc(100dvh - 48px)',
      }}
    >
      {/* Resize Handle */}
      <div
        className="group absolute bottom-0 left-0 top-0 z-10 w-2.5 -translate-x-1/2 cursor-col-resize bg-transparent"
        onMouseDown={() => onResizeStart()}
      >
        <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-brand-blue" />
        <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-9 w-2 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors group-hover:border-brand-blue" />
      </div>

      {/* Panel Header */}
      <div className="border-b border-border-default px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>Requirements {'>'} R-{requirement.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border-default px-3 py-1 text-xs font-semibold leading-none text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              {externalCode}
              <ExternalLink className="h-3 w-3" />
            </a>
            <button onClick={onClose} className="text-text-secondary transition-colors hover:text-text-primary">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-text-heading">{requirement.name}</h2>
        <div className="mb-1 flex items-center gap-2">
          <LozengeTag label={requirement.status} type={statusLozengeType(requirement.status)} subtle />
          <LozengeTag label={requirement.category} type="Neutral" subtle />
          {requirement.source === 'ai_rule_engine' && (
            <LozengeTag label="AI" type="Discovery" subtle showSparkles />
          )}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Due {requirement.dueDate}
          </span>
          {requirement.followUpDate && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Follow-up {requirement.followUpDate}
            </span>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-y-auto px-6 py-2">
          {/* AI Section */}
          {requirement.source === 'ai_rule_engine' && (
            <section className="border-b border-border-divider py-4">
              <button
                type="button"
                onClick={() => setAiExpanded((prev) => !prev)}
                className="group flex w-full items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-heading">
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand-accent">
                    <AiCueSparkle size={10} className="!text-white" spinOnParentHover />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="text-[9px] font-normal tracking-wide text-[#b7bbc2]">amplify</span>
                    <span className="text-sm font-semibold text-text-heading">Assistant</span>
                  </span>
                </span>
                <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${aiExpanded ? '' : 'rotate-[-90deg]'}`} />
              </button>
              {aiExpanded && (
                <div className="pt-4 text-sm">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3px] text-brand-accent">Requirement Analysis</div>
                  <p className="mb-3 text-text-secondary">
                    This requirement was automatically ordered by the AI rule engine based on the case assessment.
                    {isOverdue && ' This requirement is overdue — follow up with the source to expedite fulfillment.'}
                    {isFulfilled && ' All criteria have been met and the requirement has been fulfilled.'}
                  </p>
                  {requirement.trigger && (
                    <div className="text-xs text-text-secondary">
                      <span className="font-semibold text-text-secondary">Trigger: </span>
                      {requirement.trigger}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Requirement Details */}
          <section className="border-b border-border-divider py-4">
            <button
              type="button"
              onClick={() => setDetailsExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-text-heading">Summary</span>
              <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${detailsExpanded ? '' : 'rotate-[-90deg]'}`} />
            </button>
            {detailsExpanded && (
              <div className="pt-4 text-sm">
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <div className="text-[12px] text-text-muted">Category</div>
                    <div className="font-semibold text-text-primary">{requirement.category}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-text-muted">Status</div>
                    <div className="font-semibold text-text-primary">{requirement.status}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-text-muted">Due Date</div>
                    <div className="font-semibold text-text-primary">{requirement.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-text-muted">Follow-Up Date</div>
                    <div className="font-semibold text-text-primary">{requirement.followUpDate || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-text-muted">Source</div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${sourcePillClass(requirement.source)}`}>
                        {sourceLabel(requirement.source)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-text-muted">Phase</div>
                    <div className="font-semibold capitalize text-text-primary">{requirement.phase?.replace('-', '-') || '—'}</div>
                  </div>
                  {requirement.trigger && (
                    <div className="col-span-2">
                      <div className="text-[12px] text-text-muted">Trigger</div>
                      <div className="font-semibold text-text-primary">{requirement.trigger}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[12px] text-text-muted">External Reference</div>
                    <div>
                      <a
                        href={externalHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[13px] font-medium text-brand-blue underline decoration-brand-blue/25 underline-offset-2 hover:decoration-brand-blue"
                      >
                        {externalCode}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-text-muted">Acknowledgement</div>
                    <div className="font-semibold text-text-primary">{requirement.requiresAcknowledgement ? 'Required' : 'Not required'}</div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Timeline (collapsed by default) */}
          <section className="border-b border-border-divider py-4">
            <button
              type="button"
              onClick={() => setTimelineExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-text-heading">Activity Timeline</span>
              <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${timelineExpanded ? '' : 'rotate-[-90deg]'}`} />
            </button>
            {timelineExpanded && (
              <div className="pt-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-selected">
                      <FileText className="h-3 w-3 text-brand-blue" />
                    </span>
                    <div>
                      <div className="text-sm text-text-primary">Requirement ordered</div>
                      <div className="text-xs text-text-muted">Created as part of case setup</div>
                    </div>
                  </div>
                  {requirement.status !== 'Ordered' && (
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isOverdue ? 'bg-[#fde5e4]' : 'bg-[#fff4e6]'}`}>
                        {isOverdue ? <AlertTriangle className="h-3 w-3 text-brand-red" /> : <Clock className="h-3 w-3 text-[#a36d00]" />}
                      </span>
                      <div>
                        <div className="text-sm text-text-primary">{isOverdue ? 'Became overdue' : 'Awaiting fulfillment'}</div>
                        <div className="text-xs text-text-muted">Follow-up date: {requirement.followUpDate}</div>
                      </div>
                    </div>
                  )}
                  {isFulfilled && (
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e5f5ea]">
                        <Check className="h-3 w-3 text-brand-green" />
                      </span>
                      <div>
                        <div className="text-sm text-text-primary">Requirement {requirement.status.toLowerCase()}</div>
                        <div className="text-xs text-text-muted">All criteria met</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="py-4">
            <button
              type="button"
              onClick={() => setNotesExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-text-heading">Notes</span>
              <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${notesExpanded ? '' : 'rotate-[-90deg]'}`} />
            </button>
            {notesExpanded ? (
              <div className="pt-4">
                <textarea
                  className="w-full rounded-md border border-border-default p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  placeholder="Add notes about this requirement..."
                  rows={3}
                />
                <div className="mt-1 text-xs text-text-muted">0/250 characters</div>
              </div>
            ) : null}
          </section>
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-16"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)' }}
        />
      </div>

      {/* Footer Actions */}
      <div className="relative z-[2] shrink-0 space-y-2 border-t border-border-default bg-white p-4">
        {!isFulfilled && (
          <>
            <button className="inline-flex w-full items-center justify-center rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold leading-none text-white transition-colors hover:bg-brand-blue-hover">
              MARK FULFILLED
            </button>
            {isOverdue && (
              <button className="inline-flex w-full items-center justify-center rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold leading-none text-brand-blue transition-colors hover:bg-surface-selected">
                SEND FOLLOW-UP
              </button>
            )}
          </>
        )}
        <button className="inline-flex w-full items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-semibold leading-none text-text-secondary transition-colors hover:bg-surface-muted">
          WAIVE REQUIREMENT
        </button>
      </div>

      {/* Ask Assistant pill */}
      <button
        type="button"
        className="group absolute bottom-[14px] right-[14px] z-[3] inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-accent px-3.5 py-1.5 text-xs font-semibold leading-none text-white shadow-[0_4px_12px_rgba(96,47,160,0.3)] transition-all hover:bg-brand-accent-hover hover:shadow-[0_6px_16px_rgba(96,47,160,0.4)]"
      >
        <AiCueSparkle size={12} className="!text-white" spinOnParentHover aria-hidden />
        Ask Assistant
      </button>
    </div>
  );
}
