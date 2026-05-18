import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Check, ChevronRight, Clock, ExternalLink, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LozengeTag } from './LozengeTag';
import { FOLDER_OVERVIEWS } from '../data/mock-folders';
import { useTranslatedFolder } from '../data/useFolders';
import { useFoldersNav } from '../contexts/FoldersNavContext';
import { usePlatformSettings } from '../contexts/PlatformSettingsContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { getCaseType, parseCaseTypeCodeFromId, resolveCopy } from '../domain/caseTypes';
import { getStatusLozengeType } from '../utils/status-display';
import type { SubCaseSummary } from '../types';

/* Stage label keys — translated at render time so each phase name follows the
 * active language (e.g. "FNOL Received" vs "Avis de sinistre reçu"). */
const PRE_STAGE_KEYS = ['fnol', 'triage', 'requirements', 'review', 'decision'] as const;
const POST_STAGE_KEYS = ['restoration', 'recovery', 'monitoring', 'rtw', 'closure'] as const;

function MiniStepper({ stages, activeStage }: { stages: string[]; activeStage: number }) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((label, idx) => {
        const step = idx + 1;
        const isDone = activeStage > stages.length ? true : step < activeStage;
        const isActive = step === activeStage;
        return (
          <div key={label} className="flex items-center gap-1">
            {idx > 0 && (
              <div className={`h-[2px] w-3 ${isDone ? 'bg-[#008533]' : 'bg-[#dbdee1]'}`} />
            )}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                isDone
                  ? 'bg-[#008533] text-white'
                  : isActive
                    ? 'bg-brand-blue text-white'
                    : 'border border-border-default bg-white text-text-muted'
              }`}
              title={label}
            >
              {isDone ? <Check className="h-3 w-3" strokeWidth={2.5} /> : step}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubCaseCard({ sc, onClick }: { sc: SubCaseSummary; onClick: () => void }) {
  const { t } = useTranslation('folders');
  const stages = sc.phase === 'pre-approval'
    ? PRE_STAGE_KEYS.map((k) => t(`folderView.preStages.${k}` as never))
    : POST_STAGE_KEYS.map((k) => t(`folderView.postStages.${k}` as never));
  const isComplete = sc.activeStage > stages.length;
  const isNotStarted = sc.activeStage === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[200px] flex-1 flex-col rounded-2xl border border-[#e8eaed] bg-white p-5 text-left transition-all hover:border-brand-blue/30 hover:shadow-[0_2px_12px_var(--color-brand-blue-ring)]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-text-primary">{sc.label}</h3>
        <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-blue" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <LozengeTag label={sc.status} type={getStatusLozengeType(sc.status, 'entityTable')} subtle />
      </div>

      <div className="mb-4">
        <MiniStepper stages={stages} activeStage={sc.activeStage} />
        <p className="mt-2 text-[11px] text-text-muted">
          {isComplete
            ? t('folderView.stages.completed')
            : isNotStarted
              ? t('folderView.stages.notStarted')
              : t('folderView.stages.stepN', { current: sc.activeStage, total: stages.length })}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 text-[12px] text-text-secondary">
        <User className="h-3.5 w-3.5 text-text-muted" />
        {sc.owner}
      </div>
    </button>
  );
}

export function FolderView() {
  const { t } = useTranslation('folders');
  const currency = useCurrencyFormatter();
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { addOpenFolder } = useFoldersNav();
  const folder = useTranslatedFolder(folderId);

  /* Register the folder in the sidebar nav whenever this view mounts so it
   * appears in the Cases tree. Lives in an effect to satisfy the
   * Rules of Hooks ordering — must run unconditionally. */
  useMemo(() => {
    if (folderId) addOpenFolder(folderId);
  }, [folderId, addOpenFolder]);

  if (!folder) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        {t('folderView.notFound')}
      </div>
    );
  }

  const overview = FOLDER_OVERVIEWS[`${folder.id}/${folder.subCases[0].id}`];

  const { settings: platformSettings } = usePlatformSettings();
  const folderCaseType = getCaseType(
    parseCaseTypeCodeFromId(folder.id),
    platformSettings.caseTypes,
  );
  const folderCopy = resolveCopy(folderCaseType);

  return (
    <div className="relative flex h-full min-h-0 min-w-0 overflow-x-hidden bg-surface-primary">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="bg-surface-primary px-6 py-4">
          {/* Breadcrumb — matches CaseView */}
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-text-muted">
              <Link to="/folders" className="hover:text-text-secondary">{t('folderView.breadcrumbRoot')}</Link>
              <span className="mx-1">›</span>
              <span>{folder.id}</span>
            </div>
          </div>

          {/* Header — matches CaseView */}
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-flex h-[20px] items-center gap-1 rounded-[6px] border border-[#d0d5dd] bg-white px-[6px] text-xs font-semibold text-text-secondary"
                  title={folderCaseType?.description}
                >
                  {folderCaseType ? (
                    <span
                      className="inline-block size-1.5 rounded-full"
                      style={{ backgroundColor: folderCaseType.accentColor }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span>{t('folderView.folderBadge')}</span>
                  <span className="text-[#a9aeb5]">·</span>
                  <span>{folderCaseType?.label ?? folderCopy.caseNoun}</span>
                </span>
                <LozengeTag label={folder.status} type="Informative" subtle />
              </div>
              <h1 className="text-3xl font-semibold text-text-primary">{folder.id}</h1>
            </div>
          </div>

          {/* Info bar — matches CaseView structure */}
          {overview && (
            <div className="mb-4 rounded-lg border border-[#e8eaed] bg-white">
              <div className="flex items-stretch rounded-t-lg bg-white">
                <div className="flex flex-1 flex-col justify-center px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{t('folderView.applicant')}</span>
                  <span className="text-sm font-semibold text-text-primary">{overview.claimantName}</span>
                </div>
                <div className="w-px self-stretch bg-[#e8eaed]" />
                <div className="flex flex-1 flex-col justify-center px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{t('folderView.plan')}</span>
                  <span className="text-sm font-semibold text-text-primary">{overview.productName}</span>
                  <a href="#" onClick={(e) => e.preventDefault()} className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-blue underline underline-offset-2 hover:underline">
                    {overview.policyNumber}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="w-px self-stretch bg-[#e8eaed]" />
                <div className="flex flex-1 flex-col justify-center px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{t('folderView.monthlyBenefit')}</span>
                  <span className="text-sm font-bold text-text-primary">{currency.localize(overview.monthlyBenefit)}</span>
                </div>
                <div className="w-px self-stretch bg-[#e8eaed]" />
                <div className="flex flex-1 flex-col justify-center px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{t('folderView.sla')}</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                    <Clock className="h-3.5 w-3.5 text-text-muted" />
                    {folder.id === 'FLD-5546112' ? '21h 46m' : folder.id === 'FLD-7622343' ? '1d 4h' : '2d 0h'}
                  </span>
                </div>
              </div>
              <div className="h-px w-full bg-[#e8eaed]" />
              <div className="w-full overflow-visible rounded-b-lg bg-[rgba(250,250,250,0.8)] px-6 py-5">
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {t('folderView.casesInFolder')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {folder.subCases.map((sc) => (
                    <SubCaseCard
                      key={sc.id}
                      sc={sc}
                      onClick={() => navigate(`/folders/${folder.id}/${sc.id}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity timeline */}
          {overview && overview.assessmentTrend.length > 0 && (
            <div className="mt-2">
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {t('folderView.recentActivity')}
              </h2>
              <div className="rounded-xl border border-[#e8eaed] bg-white px-5 py-4">
                <div className="space-y-3">
                  {overview.assessmentTrend.filter((e) => e.event).slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 min-w-[5.5rem] text-[12px] text-text-muted">{entry.week}</span>
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-blue" />
                      <span className="text-text-secondary">{entry.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
