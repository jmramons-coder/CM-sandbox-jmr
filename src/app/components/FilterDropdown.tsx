/**
 * FilterDropdown Component
 * Reusable dropdown filter with Figma-styled appearance
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COLORS, MODULE_TEXT, SHADOWS, Z_INDEX, TYPOGRAPHY } from '../constants/design-tokens';

export interface FilterDropdownProps {
  /** Label displayed in the dropdown button */
  label: string;
  /** Array of selectable options */
  options: string[];
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /**
   * Optional renderer for an option's display text. Lets callers map raw
   * option keys (kept stable for filtering) to translated labels for display.
   */
  renderOption?: (option: string) => string;
}

export function FilterDropdown({ label, options, value, onChange, renderOption }: FilterDropdownProps) {
  const { t } = useTranslation('folders');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* "All" is the sentinel value the parent uses to mean "no filter applied".
   * Translate it for display only — the value passed back to onChange stays
   * 'All' so callers can keep their filtering logic untouched. */
  const allLabel = t('module.filters.all');
  const displayOption = (option: string) => {
    if (option === 'All') return allLabel;
    return renderOption ? renderOption(option) : option;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  // Determine if filter is active (not showing "All")
  const isActive = value !== 'All';

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 ${MODULE_TEXT.control} leading-none transition-colors ${
          isActive
            ? 'border-brand-blue bg-surface-selected text-brand-navy'
            : 'border-border-default bg-white text-text-secondary hover:bg-surface-muted'
        }`}
        style={{ fontVariationSettings: TYPOGRAPHY.fontVariation }}
      >
        <span
          className={`font-['Open_Sans:Regular',sans-serif] font-normal ${
            isActive ? 'text-brand-navy' : 'text-text-secondary'
          }`}
        >
          {label}
        </span>
        {isActive ? (
          <>
            <span className="text-text-primary">:</span>
            <span className="font-['Open_Sans:SemiBold',sans-serif] font-semibold text-brand-navy">
              {displayOption(value)}
            </span>
          </>
        ) : null}
        <ChevronDown
          className={`size-4 shrink-0 text-text-secondary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+4px)] min-w-[200px]"
          style={{ zIndex: Z_INDEX.dropdown }}
        >
            <div className="relative rounded-[4px] shrink-0 w-full">
              <div className="min-w-[inherit] overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex flex-col items-start min-w-[inherit] relative w-full">
                  <div
                    className="bg-white content-stretch flex items-start overflow-clip pr-[16px] relative w-full shrink-0"
                    style={{ boxShadow: SHADOWS.dropdown }}
                  >
                    <div className="flex-[1_0_0] min-h-px min-w-px mr-[-16px] relative rounded-[4px] self-stretch">
                      <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex flex-col items-center py-[4px] relative size-full">
                          {/* Menu Options */}
                          {options.map((option) => (
                            <div
                              key={option}
                              className={`relative shrink-0 w-full cursor-pointer hover:bg-[${COLORS.ui.background.secondary}]`}
                              onClick={() => handleSelect(option)}
                            >
                              <div className="content-stretch flex items-start relative w-full">
                                <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative">
                                  <div className="flex flex-row items-center size-full">
                                    <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                      <p
                                        className={`font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-text-primary ${MODULE_TEXT.tableCell} tracking-[0.2px] whitespace-nowrap`}
                                        style={{ fontVariationSettings: TYPOGRAPHY.fontVariation }}
                                      >
                                        {displayOption(option)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                aria-hidden="true"
                className={`absolute border border-[${COLORS.ui.border.subtle}] border-solid inset-0 pointer-events-none rounded-[4px]`}
                style={{ boxShadow: SHADOWS.dropdown }}
              />
            </div>
          </div>
        )}
    </div>
  );
}
