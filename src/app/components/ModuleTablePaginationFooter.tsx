import { ChevronDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_LABEL_STYLE: CSSProperties = { fontVariationSettings: "'wdth' 100" };

export type ModuleTablePaginationFooterProps = {
  total: number;
  rangeStart?: number;
  rangeEnd?: number;
  labelStyle?: CSSProperties;
  variant?: 'default' | 'compact';
};

export function ModuleTablePaginationFooter({
  total,
  rangeStart = 1,
  rangeEnd,
  labelStyle = DEFAULT_LABEL_STYLE,
  variant = 'default',
}: ModuleTablePaginationFooterProps) {
  const { t } = useTranslation('folders');
  const end = rangeEnd ?? total;
  const compact = variant === 'compact';
  const textClass = compact
    ? "font-['Open_Sans:Regular',sans-serif] text-[12px] font-normal leading-[18px] tracking-[0.18px] text-text-primary"
    : "font-['Open_Sans:Regular',sans-serif] text-[14px] font-normal leading-[24px] tracking-[0.24px] text-text-primary";
  return (
    <div className={`shrink-0 border-t border-border-default bg-white px-6 ${compact ? 'py-1.5' : 'py-3'}`}>
      <div className={`flex items-center ${compact ? 'gap-4' : 'gap-6'}`}>
        {!compact ? (
          <div className="flex items-center gap-2">
            <div
              className={textClass}
              style={labelStyle}
            >
              {t('pagination.rowPerPage')}
            </div>
            <div className="relative">
              <select
                className="cursor-pointer appearance-none rounded border border-[#60666e] bg-white px-2 py-1 pr-8 font-['Open_Sans:Regular',sans-serif] text-[14px] font-normal leading-[24px] tracking-[0.24px] text-text-primary"
                style={labelStyle}
              >
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2">
                <ChevronDown className="h-4 w-4 text-text-secondary" />
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex items-center gap-4">
          <div
            className={textClass}
            style={labelStyle}
          >
            {t('pagination.results', { rangeStart, rangeEnd: end, total })}
          </div>
          <div className="flex items-center">
            <div className={`${compact ? 'rounded-[10px] px-1.5' : 'rounded-[12px] px-2'} border border-brand-blue bg-surface-selected`}>
              <div
                className={`text-center font-['Open_Sans:SemiBold',sans-serif] font-semibold text-brand-navy ${
                  compact
                    ? 'text-[12px] leading-[18px] tracking-[0.18px]'
                    : 'text-[14px] leading-[24px] tracking-[0.24px]'
                }`}
                style={labelStyle}
              >
                1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
