/**
 * ReorderIcon Component
 * Sort indicator icon for table column headers
 */

import svgPathsReorder from '../../imports/svg-dcptcj11iq';
import svgPathsArrowDown from '../../imports/svg-99tqrza4r5';

export interface ReorderIconProps {
  /** Whether this column is currently being sorted */
  isActive: boolean;
}

/**
 * ReorderIcon - Shows sort state for table columns
 * - Default: Shows up/down arrows (inactive state)
 * - Active: Shows down arrow (sorted state)
 */
export function ReorderIcon({ isActive }: ReorderIconProps) {
  if (isActive) {
    // Show down arrow when column is sorted
    return (
      <div className="relative size-[16px]">
        <div className="absolute inset-[17.71%]">
          <svg
            className="absolute block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 10.3333 10.3333"
          >
            <path
              clipRule="evenodd"
              d={svgPathsArrowDown.p3b904200}
              fill="var(--fill-0, #1B1C1E)"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Show default reorder icon when not sorted
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      {/* Top Arrow */}
      <div className="absolute inset-[18.75%_29.17%_60.42%_29.17%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
          <path
            d={svgPathsReorder.p1e452c70}
            stroke="var(--stroke-0, #60666E)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Bottom Arrow */}
      <div className="absolute flex inset-[64.58%_29.17%_14.58%_29.17%] items-center justify-center">
        <div className="flex-none h-[3.333px] rotate-180 w-[6.667px]">
          <div className="relative size-full">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
              <path
                d={svgPathsReorder.p1e452c70}
                stroke="var(--stroke-0, #60666E)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
