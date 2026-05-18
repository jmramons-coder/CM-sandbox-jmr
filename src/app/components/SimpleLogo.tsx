import svgPaths from '../../imports/svg-xvo91vt2hu';

interface SimpleLogoProps {
  className?: string;
  /** Fill color for the "equisoft" wordmark. Defaults to white for dark headers. */
  textFill?: string;
}

export function SimpleLogo({ className, textFill = 'white' }: SimpleLogoProps) {
  const textPaths = [
    svgPaths.p120f9000,
    svgPaths.p2703a470,
    svgPaths.p25ade980,
    svgPaths.p112e0e00,
    svgPaths.p383d5100,
    svgPaths.p26325a40,
    svgPaths.p3db15d00,
    svgPaths.p1855d300,
  ];
  const accentPaths = [svgPaths.p28d2c800, svgPaths.p3b87f980, svgPaths.p3a938580];

  return (
    <div className={className || 'h-[24px] w-[78px]'}>
      <svg
        className="block h-full w-full"
        fill="none"
        viewBox="0 0 104 32"
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          {accentPaths.map((d, i) => (
            <path key={`accent-${i}`} clipRule="evenodd" d={d} fill="#FF4138" fillRule="evenodd" />
          ))}
          <g>
            {textPaths.map((d, i) => (
              <path key={`text-${i}`} clipRule="evenodd" d={d} fill={textFill} fillRule="evenodd" />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}