import svgPaths from "./svg-dcptcj11iq";
type ReorderVectorProps = {
  additionalClassNames?: string;
};

function ReorderVector({ children, additionalClassNames = "" }: React.PropsWithChildren<ReorderVectorProps>) {
  return (
    <div className={additionalClassNames}>
      <div className="absolute inset-[-15%_-7.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
          {children}
        </svg>
      </div>
    </div>
  );
}
type ReorderProps = {
  className?: string;
  state?: "Default" | "Hover";
};

function Reorder({ className, state = "Default" }: ReorderProps) {
  const isHover = state === "Hover";
  return (
    <div className={className || "overflow-clip relative size-[16px]"}>
      <ReorderVector additionalClassNames="absolute inset-[18.75%_29.17%_60.42%_29.17%]">
        <path d={svgPaths.p1e452c70} id="Vector" stroke={isHover ? "var(--stroke-0, #1B1C1E)" : "var(--stroke-0, #60666E)"} strokeLinecap="round" strokeLinejoin="round" />
      </ReorderVector>
      <div className="absolute flex inset-[64.58%_29.17%_14.58%_29.17%] items-center justify-center">
        <div className="flex-none h-[3.333px] rotate-180 w-[6.667px]">
          <ReorderVector additionalClassNames="relative size-full">
            <path d={svgPaths.p1e452c70} id="Vector" stroke={isHover ? "var(--stroke-0, #1B1C1E)" : "var(--stroke-0, #60666E)"} strokeLinecap="round" strokeLinejoin="round" />
          </ReorderVector>
        </div>
      </div>
    </div>
  );
}

export default function Reorder1() {
  return <Reorder className="relative size-full" />;
}