import clsx from "clsx";
import svgPaths from "./svg-id7c6trtlg";

function Wrapper10({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper10Props>) {
  return (
    <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[11px] tracking-[0.24px] whitespace-nowrap", additionalClassNames)}>
      <p className="leading-[16px]">{children}</p>
    </div>
  );
}
type Wrapper9Props = {
  additionalClassNames?: string;
};

function Wrapper9({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper9Props>) {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex gap-[4px] h-full items-center px-[4px] relative">
        <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[11px] tracking-[0.24px] whitespace-nowrap", additionalClassNames)}>
          <p className="leading-[16px]">{children}</p>
        </div>
      </div>
    </div>
  );
}
type Wrapper8Props = {
  additionalClassNames?: string;
};

function Wrapper8({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper8Props>) {
  return (
    <div className={clsx("content-stretch flex items-center justify-center relative", additionalClassNames)}>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
        {children}
      </div>
    </div>
  );
}

function Items3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pb-[7px] pl-[8px] pt-[8px] relative size-full">{children}</div>
      </div>
    </div>
  );
}

function Items2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pb-[7px] pl-[8px] pt-[8px] relative w-full">{children}</div>
      </div>
    </div>
  );
}

function Wrapper7({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[17.71%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
          {children}
        </svg>
      </div>
    </div>
  );
}
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

function Wrapper6({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pb-[7px] pt-[8px] px-[8px] relative w-full">{children}</div>
      </div>
    </div>
  );
}
type Wrapper5Props = {
  additionalClassNames?: string;
};

function Wrapper5({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper5Props>) {
  return (
    <div className={clsx("relative shrink-0 w-full", additionalClassNames)}>
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center pb-[11px] pt-[12px] px-[8px] relative w-full">{children}</div>
      </div>
    </div>
  );
}
type Wrapper4Props = {
  additionalClassNames?: string;
};

function Wrapper4({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper4Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative">{children}</div>
      </div>
    </div>
  );
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return <Wrapper4 additionalClassNames={clsx("relative shrink-0", additionalClassNames)}>{children}</Wrapper4>;
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={clsx("content-stretch flex items-start relative", additionalClassNames)}>
      <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Base/Data Table">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center relative w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DataTable1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[40px] relative shrink-0 w-[188px]">
      <Wrapper2 additionalClassNames="size-full">{children}</Wrapper2>
    </div>
  );
}
type DataTableProps = {
  additionalClassNames?: string;
};

function DataTable({ children, additionalClassNames = "" }: React.PropsWithChildren<DataTableProps>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <Wrapper2 additionalClassNames="w-full">{children}</Wrapper2>
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return (
    <div className={clsx("content-stretch flex flex-col items-start relative shrink-0", additionalClassNames)}>
      <DataTable additionalClassNames="w-full">{children}</DataTable>
    </div>
  );
}
type Helper1Props = {
  additionalClassNames?: string;
};

function Helper1({ additionalClassNames = "" }: Helper1Props) {
  return (
    <Wrapper additionalClassNames="gap-[8px]">
      <Wrapper8 additionalClassNames="shrink-0">
        <Helper additionalClassNames="absolute inset-[45.83%]" />
        <Vector additionalClassNames="bottom-3/4 top-[16.67%]" />
        <Vector additionalClassNames="bottom-[16.67%] top-3/4" />
      </Wrapper8>
    </Wrapper>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("content-stretch flex items-center relative shrink-0", additionalClassNames)}>
      <Wrapper3>
        <Wrapper4 additionalClassNames="relative shrink-0">
          <div className="relative rounded-[20px] shrink-0" data-name="Base/Button">
            <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-center justify-center p-[4px] relative">{children}</div>
            </div>
          </div>
        </Wrapper4>
      </Wrapper3>
    </div>
  );
}
type HelperProps = {
  additionalClassNames?: string;
};

function Helper({ additionalClassNames = "" }: HelperProps) {
  return (
    <div className={additionalClassNames}>
      <div className="absolute inset-[-37.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
          <path d={svgPaths.padc050} fill="var(--fill-0, #60666E)" id="Vector" stroke="var(--stroke-0, #60666E)" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
type VectorProps = {
  additionalClassNames?: string;
};

function Vector({ additionalClassNames = "" }: VectorProps) {
  return <Helper additionalClassNames={clsx("absolute left-[45.83%] right-[45.83%]", additionalClassNames)} />;
}

function BaseDataTable() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative">
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
        <Text1 text="Participant" />
        <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
      </div>
      <div className="flex flex-row items-center self-stretch">
        <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
      </div>
    </div>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <Items1>
      <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Wrapper9 additionalClassNames="text-[#60666e] text-center uppercase">{text}</Wrapper9>
    </Items1>
  );
}

function Items1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white h-[39px] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pb-[7px] pl-[34px] pt-[8px] relative size-full">
          <div className="relative shrink-0" data-name="Status">
            <div className="content-stretch flex items-start relative">
              <div className="h-[18px] relative shrink-0" data-name="Status inactive">
                <div className="content-stretch flex h-full items-start relative">
                  <div className="bg-[#f1f2f2] h-full relative rounded-[4px] shrink-0" data-name="Base/Lozenge">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div style={{ fontVariationSettings: "'wdth' 100" }} className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#006296] text-[14px] tracking-[0.24px] whitespace-nowrap">
      <p className="[text-decoration-skip-ink:none] decoration-solid leading-[24px] underline">{text}</p>
    </div>
  );
}

function Items() {
  return (
    <Wrapper5 additionalClassNames="bg-white">
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
        <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
          <AtomCheckbox additionalClassNames="bg-white" />
        </div>
      </div>
    </Wrapper5>
  );
}
type ItemTextProps = {
  text: string;
};

function ItemText({ text }: ItemTextProps) {
  return (
    <Wrapper6>
      <Reorder className="overflow-clip relative shrink-0 size-[16px]" />
      <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">{text}</p>
      </div>
    </Wrapper6>
  );
}
type AtomCheckboxProps = {
  additionalClassNames?: string;
};

function AtomCheckbox({ additionalClassNames = "" }: AtomCheckboxProps) {
  return (
    <div className={clsx("-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[4px] size-[16px] top-1/2", additionalClassNames)}>
      <div className="overflow-clip rounded-[inherit] size-full" />
      <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}
type PageLinkProps = {
  className?: string;
  states?: "Default" | "Hover" | "Selected" | "Disabled" | "Focus" | "Active-selected";
  variant?: "Text";
};

function PageLink({ className, states = "Default", variant = "Text" }: PageLinkProps) {
  const isTextAndDisabled = variant === "Text" && states === "Disabled";
  const isTextAndHover = variant === "Text" && states === "Hover";
  const isTextAndIsFocusOrActiveSelected = variant === "Text" && ["Focus", "Active-selected"].includes(states);
  const isTextAndSelected = variant === "Text" && states === "Selected";
  return (
    <div className={className || `relative ${isTextAndDisabled ? "" : variant === "Text" && ["Selected", "Active-selected"].includes(states) ? "bg-[#e0f0f9] rounded-[12px]" : isTextAndHover ? "bg-[#dbdee1] rounded-[12px]" : "bg-[rgba(255,255,255,0)] rounded-[12px]"}`}>
      <div aria-hidden={isTextAndSelected ? "true" : undefined} className={isTextAndSelected ? "absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[12px]" : "flex flex-col items-center justify-center size-full"}>
        {variant === "Text" && ["Default", "Default", "Hover", "Disabled", "Focus", "Active-selected"].includes(states) && (
          <div className={`content-stretch flex flex-col items-center justify-center px-[8px] relative ${isTextAndIsFocusOrActiveSelected ? "overflow-clip" : ""}`}>
            <div className={`flex flex-col justify-center leading-[0] relative shrink-0 text-[14px] text-center tracking-[0.24px] whitespace-nowrap ${variant === "Text" && states === "Active-selected" ? 'font-["Open_Sans:SemiBold",sans-serif] font-semibold text-[#003a5a]' : isTextAndDisabled ? 'font-["Open_Sans:Regular",sans-serif] font-normal text-[#b7bbc2]' : isTextAndHover ? 'font-["Open_Sans:Regular",sans-serif] font-normal text-[#1b1c1e]' : 'font-["Open_Sans:Regular",sans-serif] font-normal text-[#60666e]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[24px]">1</p>
            </div>
          </div>
        )}
      </div>
      {variant === "Text" && ["Selected", "Focus", "Active-selected"].includes(states) && (
        <div aria-hidden={isTextAndIsFocusOrActiveSelected ? "true" : undefined} className={isTextAndIsFocusOrActiveSelected ? "absolute border-2 border-[#84c6ea] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0px_0px_2px_#006296]" : "flex flex-col items-center justify-center size-full"}>
          {isTextAndSelected && (
            <div className="content-stretch flex flex-col items-center justify-center px-[8px] relative">
              <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#003a5a] text-[14px] text-center tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[24px]">1</p>
              </div>
            </div>
          )}
        </div>
      )}
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

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Page Header">
        <div aria-hidden="true" className="absolute border-[#dbdee1] border-b border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex flex-col gap-[12px] items-start px-[24px] py-[21px] relative w-full">
          <div className="content-stretch flex gap-[16px] h-[32px] items-start relative shrink-0 w-full" data-name="Content-start">
            <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-full justify-center leading-[0] min-h-px min-w-px relative text-[24px] text-black" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[36px]">All Tasks</p>
            </div>
            <div className="content-stretch flex items-start justify-end relative shrink-0" data-name="Buttons">
              <div className="relative shrink-0" data-name="Button">
                <div className="flex flex-row items-end justify-center size-full">
                  <div className="content-stretch flex items-end justify-center relative">
                    <Wrapper3 additionalClassNames="shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]">
                      <div className="bg-[#006296] relative rounded-[74px] shrink-0" data-name="Base/Button">
                        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[4px] relative">
                            <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white tracking-[0.4px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                              <p className="leading-[24px]">Create task</p>
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[74px]" />
                      </div>
                    </Wrapper3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Table">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Action Bar">
          <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
          <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Action Bar">
            <div aria-hidden="true" className="absolute border-[#dbdee1] border-b border-solid inset-0 pointer-events-none" />
            <div className="flex flex-col items-end justify-center size-full">
              <div className="content-stretch flex flex-col gap-[8px] items-end justify-center px-[24px] py-[16px] relative w-full">
                <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Seearch bar">
                  <div className="h-[32px] relative shrink-0 w-[599px]" data-name="Search Bar">
                    <div className="content-stretch flex flex-col items-start relative size-full">
                      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Base/Search Bar">
                        <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Search Bar">
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative" data-name="Input">
                            <div className="bg-white h-[32px] relative rounded-bl-[4px] rounded-tl-[4px] shrink-0 w-full" data-name="Input">
                              <div aria-hidden="true" className="absolute border-[#60666e] border-b border-l border-solid border-t inset-0 pointer-events-none rounded-bl-[4px] rounded-tl-[4px]" />
                              <div className="flex flex-row items-center justify-center size-full">
                                <div className="content-stretch flex items-center justify-center pl-[8px] pr-[2px] py-px relative size-full">
                                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#878f9a] text-[14px] tracking-[0.24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    <p className="leading-[24px]">Search</p>
                                  </div>
                                  <div className="relative shrink-0" data-name="Button/Tertiary/Default/Small/False/True">
                                    <div className="flex flex-row items-center justify-center size-full">
                                      <Wrapper8 additionalClassNames="p-[4px]">
                                        <div className="absolute inset-[5.21%]" data-name="Vector">
                                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.3333 14.3333">
                                            <g id="Vector">
                                              <path d={svgPaths.p1e2a7000} fill="var(--fill-0, #60666E)" />
                                              <path d={svgPaths.p3e60a000} fill="var(--fill-0, #60666E)" />
                                              <path clipRule="evenodd" d={svgPaths.p1239f180} fill="var(--fill-0, #60666E)" fillRule="evenodd" />
                                            </g>
                                          </svg>
                                        </div>
                                      </Wrapper8>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Wrapper3>
                            <div className="bg-white relative rounded-br-[4px] rounded-tr-[4px] shrink-0" data-name="[master]">
                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-br-[4px] rounded-tr-[4px]" />
                              <div className="flex flex-row items-center justify-center size-full">
                                <div className="content-stretch flex items-center justify-center p-[8px] relative">
                                  <Wrapper7>
                                    <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #1B1C1E)" fillRule="evenodd" id="Vector" />
                                  </Wrapper7>
                                </div>
                              </div>
                            </div>
                          </Wrapper3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-full" data-name="Task_Table">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="content-stretch flex items-start relative shrink-0" data-name="Row_Header">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-[50px]" data-name="Column check box">
              <div className="relative shrink-0 w-full" data-name="Data Table">
                <div className="flex flex-row justify-center size-full">
                  <div className="content-stretch flex items-start justify-center relative w-full">
                    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Base/Data Table">
                      <div className="flex flex-row items-center justify-center size-full">
                        <div className="content-stretch flex items-center justify-center relative w-full">
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative" data-name="Content">
                            <Wrapper5 additionalClassNames="bg-[#fafafa]">
                              <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                <AtomCheckbox additionalClassNames="bg-[#fafafa]" />
                              </div>
                            </Wrapper5>
                            <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Wrapper1 additionalClassNames="w-[144px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Wrapper6>
                  <Wrapper7>
                    <path clipRule="evenodd" d={svgPaths.p3b904200} fill="var(--fill-0, #1B1C1E)" fillRule="evenodd" id="Vector" />
                  </Wrapper7>
                  <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[24px]">Task</p>
                  </div>
                </Wrapper6>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </Wrapper1>
            <DataTable additionalClassNames="w-[106px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <ItemText text="Priority" />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <Wrapper1 additionalClassNames="w-[123px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <ItemText text="Due date" />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </Wrapper1>
            <Wrapper1 additionalClassNames="w-[137px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <ItemText text="Status" />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </Wrapper1>
            <Wrapper1 additionalClassNames="w-[162px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <ItemText text="Users assignee" />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </Wrapper1>
            <Wrapper1 additionalClassNames="w-[161px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <ItemText text="Groups assignee" />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </Wrapper1>
            <Wrapper1 additionalClassNames="h-[40px] w-[188px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <ItemText text="Linked folders" />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </Wrapper1>
            <Wrapper1 additionalClassNames="w-[139px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <ItemText text="Folder type" />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </Wrapper1>
            <Wrapper1 additionalClassNames="bg-[#fafafa] w-[46px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <div className="bg-[#fafafa] h-[39px] relative shrink-0 w-full" data-name="Item">
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex gap-[8px] items-center pb-[7px] pt-[8px] px-[8px] size-full" />
                  </div>
                </div>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </Wrapper1>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" data-name="Row(White)">
            <DataTable additionalClassNames="w-[50px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[144px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Medical report...Dr. Catherine ...</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[106px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">High</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[123px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">2021-10-09</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <div className="content-stretch flex h-[40px] items-center justify-center relative shrink-0 w-[137px]" data-name="Data Table">
              <div className="content-stretch flex flex-[1_0_0] h-full items-center min-h-px min-w-px relative" data-name="Base/Data Table">
                <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Content">
                  <Items3>
                    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                      <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    </div>
                    <div className="relative shrink-0" data-name="Status">
                      <div className="content-stretch flex items-start relative">
                        <div className="h-[18px] relative shrink-0" data-name="Status in queue">
                          <div className="content-stretch flex h-full items-start relative">
                            <div className="bg-[#fffbf5] h-full relative rounded-[4px] shrink-0" data-name="Base/Lozenge">
                              <div aria-hidden="true" className="absolute border border-[#f5a200] border-solid inset-0 pointer-events-none rounded-[4px]" />
                              <Wrapper9 additionalClassNames="text-[#a36d00] text-center uppercase">IN QUEUE</Wrapper9>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Items3>
                  <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
                </div>
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </div>
            <DataTable additionalClassNames="w-[162px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Richard, Daniels</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[161px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Accountability</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable1>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <Text text="Bilodeau, Jacques" />
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable1>
            <div className="content-stretch flex h-[39px] items-start relative shrink-0 w-[139px]" data-name="Data Table">
              <BaseDataTable />
            </div>
            <DataTable additionalClassNames="w-[46px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <div className="bg-white content-stretch flex gap-[8px] items-center justify-center pb-[7px] pt-[8px] relative shrink-0 w-full" data-name="Items">
                  <Helper1 />
                </div>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" data-name="Row(Gray)">
            <DataTable additionalClassNames="w-[50px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[144px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Conditional rep....lacement notice</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[106px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">High</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[123px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">2021-10-09</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <div className="content-stretch flex h-[40px] items-center justify-center relative shrink-0 w-[137px]" data-name="Data Table">
              <div className="content-stretch flex flex-[1_0_0] h-full items-center min-h-px min-w-px relative" data-name="Base/Data Table">
                <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Content">
                  <Items3>
                    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                      <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    </div>
                    <div className="relative shrink-0" data-name="Status">
                      <div className="flex flex-row justify-end size-full">
                        <div className="content-stretch flex items-start justify-end relative">
                          <div className="h-[18px] relative shrink-0" data-name="Status active">
                            <div className="content-stretch flex h-full items-start relative">
                              <div className="bg-[#f6fbf8] h-full relative rounded-[4px] shrink-0" data-name="Base/Lozenge">
                                <div aria-hidden="true" className="absolute border border-[#008533] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                <Wrapper9 additionalClassNames="text-[#004f1e] text-center uppercase">Completed</Wrapper9>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Items3>
                  <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
                </div>
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </div>
            <DataTable additionalClassNames="w-[162px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Richard, Daniels</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[161px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Richard, Daniels</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable1>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <Text text="MLI 3745399 Desmeules, Line" />
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable1>
            <div className="content-stretch flex h-[39px] items-start relative shrink-0 w-[139px]" data-name="Data Table">
              <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Base/Data Table">
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                  <Text1 text="Policy" />
                  <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
                </div>
                <div className="flex flex-row items-center self-stretch">
                  <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
                </div>
              </div>
            </div>
            <DataTable additionalClassNames="w-[46px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <div className="bg-white content-stretch flex gap-[8px] items-center justify-center pb-[7px] pt-[8px] relative shrink-0 w-full" data-name="Items">
                  <Helper1 />
                </div>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" data-name="Row(White)">
            <DataTable additionalClassNames="w-[50px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[144px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Medical report....Dr. Catherine ...</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[106px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">High</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[123px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">2021-10-09</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <div className="content-stretch flex h-[40px] items-center justify-center relative shrink-0 w-[137px]" data-name="Data Table">
              <div className="content-stretch flex flex-[1_0_0] h-full items-center min-h-px min-w-px relative" data-name="Base/Data Table">
                <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Content">
                  <Items3>
                    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                      <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    </div>
                    <div className="h-[18px] relative shrink-0 w-[44px]" data-name="Status">
                      <div className="content-stretch flex items-start relative size-full">
                        <div className="bg-[#f9f7fb] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[4px]" data-name="Base/Lozenge">
                          <div aria-hidden="true" className="absolute border border-[#602fa0] border-solid inset-0 pointer-events-none rounded-[4px]" />
                          <div className="flex flex-row items-center size-full">
                            <div className="content-stretch flex gap-[4px] items-center px-[4px] relative size-full">
                              <Wrapper10 additionalClassNames="text-[#3a1c60]">TO DO</Wrapper10>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Items3>
                  <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
                </div>
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </div>
            <DataTable additionalClassNames="w-[162px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Richard, Daniels</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[161px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Accountability</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable1>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <Text text="Bilodeau, Jacques" />
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable1>
            <div className="content-stretch flex h-[39px] items-start relative shrink-0 w-[139px]" data-name="Data Table">
              <BaseDataTable />
            </div>
            <DataTable additionalClassNames="w-[46px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <div className="bg-white content-stretch flex gap-[8px] items-center justify-center pb-[7px] pt-[8px] relative shrink-0 w-full" data-name="Items">
                  <Helper1 />
                </div>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
          </div>
          <div className="content-stretch flex items-start relative shrink-0" data-name="Row(White)">
            <DataTable additionalClassNames="w-[50px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items />
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[144px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Medical report....Dr. Catherine ...</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[106px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">High</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[123px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">2021-10-09</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <div className="content-stretch flex h-[40px] items-center justify-center relative shrink-0 w-[137px]" data-name="Data Table">
              <div className="content-stretch flex flex-[1_0_0] h-full items-center min-h-px min-w-px relative" data-name="Base/Data Table">
                <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Content">
                  <Items3>
                    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                      <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    </div>
                    <div className="relative shrink-0" data-name="Status">
                      <div className="content-stretch flex items-start relative">
                        <div className="h-[18px] relative shrink-0" data-name="Status vested">
                          <div className="content-stretch flex h-full items-start relative">
                            <div className="bg-[#fdf7f6] h-full relative rounded-[4px] shrink-0" data-name="Base/Lozenge">
                              <div aria-hidden="true" className="absolute border border-[#cd2c23] border-solid inset-0 pointer-events-none rounded-[4px]" />
                              <Wrapper9 additionalClassNames="text-[#7b1a15] text-center uppercase">Overdue</Wrapper9>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Items3>
                  <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
                </div>
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </div>
            <DataTable additionalClassNames="w-[162px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Richard, Daniels</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable additionalClassNames="w-[161px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[24px]">Accountability</p>
                    </div>
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable>
            <DataTable1>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <Items2>
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Labels">
                    <div className="shrink-0 size-[16px]" data-name="Start-icon" />
                    <Text text="Bilodeau, Jacques" />
                  </div>
                </Items2>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
              </div>
            </DataTable1>
            <div className="content-stretch flex h-[39px] items-start relative shrink-0 w-[139px]" data-name="Data Table">
              <BaseDataTable />
            </div>
            <DataTable additionalClassNames="w-[46px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
                <div className="bg-white content-stretch flex gap-[8px] items-center justify-center pb-[7px] pt-[8px] relative shrink-0 w-full" data-name="Items">
                  <Helper1 />
                </div>
                <div className="bg-[#dbdee1] h-px shrink-0 w-full" data-name="Divider" />
              </div>
            </DataTable>
          </div>
        </div>
      </div>
      <div className="bg-white flex-[1_0_0] min-h-px min-w-px w-full" />
      <div className="bg-white content-stretch flex flex-col items-start justify-end pl-[24px] py-px relative shrink-0 w-[1100px]" data-name="Table footer">
        <div aria-hidden="true" className="absolute border-[#dbdee1] border-solid border-t inset-0 pointer-events-none" />
        <div className="bg-white content-stretch flex gap-[24px] items-center py-[12px] relative shrink-0 w-full" data-name="Pagination with row per page">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Select input">
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[24px]">Row per page</p>
            </div>
            <div className="flex flex-row items-center self-stretch">
              <div className="h-full relative shrink-0 w-[72px]" data-name="Textbox">
                <div className="content-stretch flex flex-col items-start relative size-full">
                  <div className="h-[31px] relative shrink-0 w-full" data-name="Base/Textbox">
                    <div className="content-stretch flex flex-col items-start relative size-full">
                      <div className="bg-white h-[32px] relative rounded-[4px] shrink-0 w-full" data-name="Content">
                        <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                        <div className="flex flex-row items-center size-full">
                          <div className="content-stretch flex gap-[4px] items-center p-[8px] relative size-full">
                            <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Value">
                              <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                <p className="leading-[24px]">25</p>
                              </div>
                            </div>
                            <div className="content-stretch flex items-start relative shrink-0" data-name="Buttons">
                              <Wrapper additionalClassNames="justify-center">
                                <Wrapper8 additionalClassNames="shrink-0">
                                  <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
                                    <div className="absolute inset-[-12.5%_-6.25%]">
                                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                                        <path d="M0.5 0.5L4.5 4.5L8.5 0.5" id="Vector" stroke="var(--stroke-0, #60666E)" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </div>
                                  </div>
                                </Wrapper8>
                              </Wrapper>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[24px]">1-4 of 4 results</p>
            </div>
            <div className="content-stretch flex items-center relative shrink-0" data-name="Page links">
              <PageLink className="bg-[#e0f0f9] relative rounded-[12px] shrink-0" states="Selected" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}