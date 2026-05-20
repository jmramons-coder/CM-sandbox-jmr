import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AiCueSparkle } from './AiCueSparkle';
import { SimpleLogo } from './SimpleLogo';
import type { Branding } from '../contexts/PlatformSettingsContext';
import { resolveBrandingLogoSrc } from '../utils/branding-logo';

function splitBrandingProductName(productName: string) {
  const clean = productName.trim() || 'Amplify Case Management';
  const [first, ...rest] = clean.split(/\s+/);
  return {
    first,
    second: rest.join(' '),
  };
}

export function BrandingHeaderPreview({
  branding,
  themeMode,
  className,
  showColorChips = true,
  variant = 'standalone',
}: {
  branding: Branding;
  themeMode: 'light' | 'dark';
  className?: string;
  showColorChips?: boolean;
  variant?: 'standalone' | 'demo-card';
}) {
  const { t } = useTranslation('settings');
  const productNameParts = useMemo(() => splitBrandingProductName(branding.productName), [branding.productName]);
  const customLogoSrc =
    branding.logoMode === 'custom'
      ? resolveBrandingLogoSrc(themeMode === 'light' ? branding.logoLightDataUrl : branding.logoDarkDataUrl)
      : undefined;
  const isDemoCard = variant === 'demo-card';

  return (
    <div
      className={`flex min-w-0 ${
        showColorChips ? 'items-center justify-between' : 'h-full min-h-[52px] items-center'
      } ${
        isDemoCard
          ? 'rounded-none border-0 bg-transparent px-0 py-0 shadow-none'
          : 'rounded-md px-4 py-3 shadow-sm'
      } ${className ?? ''}`}
      style={
        isDemoCard
          ? undefined
          : {
              backgroundColor: themeMode === 'light' ? '#f5f5f7' : branding.headerColor,
              color: themeMode === 'light' ? '#1b1c1e' : branding.onHeaderColor,
              border: themeMode === 'light' ? '1px solid #e0e4e8' : undefined,
            }
      }
    >
      <div className={`flex min-w-0 ${showColorChips ? 'items-end' : 'items-center'} gap-2`}>
        {customLogoSrc ? (
          <img
            src={customLogoSrc}
            alt={t('branding.preview.customLogoAlt')}
            className="h-[28px] max-w-[120px] shrink-0 object-contain"
          />
        ) : (
          <SimpleLogo
            className="h-[28px] w-[90px] shrink-0"
            textFill={themeMode === 'light' ? '#1b1c1e' : '#ffffff'}
          />
        )}
        {branding.showProductName ? (
          <span className={`flex min-w-0 flex-col items-start text-left leading-[0.95] opacity-80 ${showColorChips ? 'mb-[1px]' : ''}`}>
            <span className="truncate text-[11px] font-semibold">{productNameParts.first}</span>
            {productNameParts.second ? (
              <span className="truncate text-[11px] font-medium">{productNameParts.second}</span>
            ) : null}
          </span>
        ) : null}
      </div>
      {showColorChips ? (
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: branding.primaryColor, color: '#fff' }}
          >
            {t('branding.preview.primaryChip')}
          </span>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: branding.accentColor, color: '#fff' }}
          >
            <AiCueSparkle size={12} className="mr-1 inline !text-white" /> {t('branding.preview.aiChip')}
          </span>
        </div>
      ) : null}
    </div>
  );
}
