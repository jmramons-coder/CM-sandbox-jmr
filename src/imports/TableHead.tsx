import clsx from "clsx";
import svgPaths from "./svg-0uo6iviyke";

function Wrapper5({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center justify-center relative">
      <div className="bg-[rgba(255,255,255,0)] relative rounded-[9999px] shrink-0" data-name=".[Button master]">
        {children}
      </div>
    </div>
  );
}

function Wrapper4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-start relative size-full">
      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">{children}</div>
      </div>
    </div>
  );
}
type MasterDataTableCell1Props = {
  additionalClassNames?: string;
};

function MasterDataTableCell1({ children, additionalClassNames = "" }: React.PropsWithChildren<MasterDataTableCell1Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex h-full items-center pl-[16px] py-[8px] relative">{children}</div>
      </div>
    </div>
  );
}

function Wrapper3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex h-full items-start relative">
      <MasterDataTableCell1 additionalClassNames="h-full">{children}</MasterDataTableCell1>
    </div>
  );
}

function Wrapper2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center size-full">
      <div className="content-stretch flex items-center justify-center p-[4px] relative">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
          <div className="absolute inset-[17.71%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
              {children}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Helper4() {
  return (
    <TableHeadHelper10>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Wrapper2>
        <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
      </Wrapper2>
    </TableHeadHelper10>
  );
}

function TableHeadHelper10({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper4>
      <div className="content-stretch flex items-center px-[12px] py-[8px] relative size-full">
        <div className="relative shrink-0" data-name="Button">
          <div className="flex flex-row items-center justify-center size-full">
            <Wrapper5>{children}</Wrapper5>
          </div>
        </div>
      </div>
    </Wrapper4>
  );
}

function TableHeadHelper9() {
  return (
    <Wrapper3>
      <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
          <div className="overflow-clip rounded-[inherit] size-full" />
          <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
        </div>
      </div>
    </Wrapper3>
  );
}

function TableHeadHelper8() {
  return (
    <Wrapper4>
      <div className="size-full" />
    </Wrapper4>
  );
}

function TableHeadHelper7() {
  return (
    <div className="content-stretch flex h-full items-start relative">
      <div className="h-full relative shrink-0 w-[104px]" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">
          <div className="size-full" />
        </div>
      </div>
    </div>
  );
}

function TableHeadHelper6() {
  return (
    <div className="content-stretch flex h-full items-start relative">
      <div className="h-full relative shrink-0 w-[88px]" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">
          <div className="size-full" />
        </div>
      </div>
    </div>
  );
}

function TableHeadHelper5() {
  return (
    <div className="content-stretch flex h-full items-start relative">
      <div className="h-full relative shrink-0 w-[72px]" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">
          <div className="size-full" />
        </div>
      </div>
    </div>
  );
}

function TableHeadHelper4() {
  return (
    <div className="content-stretch flex h-full items-start relative">
      <div className="h-full relative shrink-0 w-[56px]" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">
          <div className="size-full" />
        </div>
      </div>
    </div>
  );
}

function TableHeadHelper3() {
  return (
    <div className="content-stretch flex items-start relative size-full">
      <div className="h-full relative shrink-0 w-[32px]" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">
          <div className="size-full" />
        </div>
      </div>
    </div>
  );
}

function TableHeadHelper2() {
  return (
    <div className="content-stretch flex items-start relative size-full">
      <div className="h-full relative shrink-0 w-[48px]" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">
          <div className="size-full" />
        </div>
      </div>
    </div>
  );
}

function TableHeadHelper1() {
  return (
    <div className="content-stretch flex h-full items-start relative">
      <div className="h-full relative shrink-0 w-[40px]" data-name=".[Master Data table cell]">
        <div className="flex flex-row items-center size-full">
          <div className="size-full" />
        </div>
      </div>
    </div>
  );
}

function TableHeadHelper() {
  return (
    <Wrapper3>
      <div className="relative shrink-0 size-[16px]" data-name="Radio Button Only">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Radio Button">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" fill="var(--fill-0, white)" id="Radio Button" r="7.5" stroke="var(--stroke-0, #60666E)" />
          </svg>
        </div>
      </div>
    </Wrapper3>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Wrapper2>{children}</Wrapper2>
    </Wrapper>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper4>
      <div className="content-stretch flex items-center pl-[12px] py-[8px] relative size-full">
        <div className="relative shrink-0" data-name="Favorite">
          <div className="content-stretch flex items-start relative">
            <div className="relative shrink-0" data-name="Button">
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="bg-[rgba(255,255,255,0)] relative rounded-[9999px] shrink-0" data-name=".[Button master]">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Icon />
      </div>
    </Wrapper4>
  );
}

function Helper3() {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex items-center relative size-full">
        <MasterDataTableCellText text="Title" />
        <Helper2 />
      </div>
    </div>
  );
}

function Helper2() {
  return (
    <div style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties} className="flex h-[16px] items-center justify-center relative shrink-0 w-0">
      <div className="flex-none rotate-90">
        <div className="h-0 relative w-[16px]" data-name=".[Master Data table cell]">
          <div className="absolute inset-[-1px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 1">
              <line id=".[Master Data table cell]" stroke="var(--stroke-0, #878F9A)" x2="16" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Helper1() {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex items-center relative size-full">
        <MasterDataTableCell />
        <Helper2 />
      </div>
    </div>
  );
}
type MasterDataTableCellTextProps = {
  text: string;
};

function MasterDataTableCellText({ text }: MasterDataTableCellTextProps) {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[4px] items-center justify-end px-[16px] py-[8px] relative size-full">
          <Icon />
          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[20px]">{text}</p>
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
    <div className="flex flex-row items-center justify-end size-full">
      <div className="content-stretch flex items-center justify-end relative size-full">
        <MasterDataTableCellText text={text} />
      </div>
    </div>
  );
}
type MasterDataTableCellProps = {
  additionalClassNames?: string;
};

function MasterDataTableCell({ additionalClassNames = "" }: MasterDataTableCellProps) {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
      <div className="flex flex-row items-center size-full">
        <TableHeadText text="Title" additionalClassNames="py-[8px]" />
      </div>
    </div>
  );
}
type HelperProps = {
  additionalClassNames?: string;
};

function Helper({ additionalClassNames = "" }: HelperProps) {
  return (
    <div className={clsx("content-stretch flex relative size-full", additionalClassNames)}>
      <MasterDataTableCell />
    </div>
  );
}

function Icon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[13.56%_26.04%_13.52%_26.04%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 11.6668">
          <path d={svgPaths.p10380580} fill="var(--fill-0, #60666E)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}
type TableHeadTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TableHeadText({ text, additionalClassNames = "" }: TableHeadTextProps) {
  return (
    <div className={clsx("content-stretch flex gap-[4px] items-center px-[16px] relative size-full", additionalClassNames)}>
      <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">{text}</p>
      </div>
      <Icon />
    </div>
  );
}

function CheckboxOnlyIndeterminate() {
  return (
    <div className="absolute left-0 overflow-clip size-[16px] top-0">
      <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
          <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function CheckboxOnlyCheck() {
  return (
    <div className="absolute inset-0 overflow-clip">
      <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
          <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}
type CheckboxOnlyProps = {
  className?: string;
  mobile?: boolean;
  state?: "Default" | "Hover" | "Disabled" | "Selected-disabled" | "Selected" | "Selected-focus" | "Focus" | "Indeterminate" | "Indeterminate-focus" | "Error";
};

function CheckboxOnly({ className, mobile = false, state = "Default" }: CheckboxOnlyProps) {
  const isDefaultOrHoverOrDisabledOrSelectedFocusOrFocusOrIndeterminate = ["Default", "Hover", "Disabled", "Selected-focus", "Focus", "Indeterminate-focus", "Error"].includes(state);
  const isNotMobileAndIsHoverOrDisabledOrSelectedFocusOrFocusOr = !mobile && ["Hover", "Disabled", "Selected-focus", "Focus", "Indeterminate-focus", "Error"].includes(state);
  const isNotMobileAndIsSelectedOrSelectedDisabledOrIndeterminate = !mobile && ["Selected", "Selected-disabled", "Indeterminate"].includes(state);
  return (
    <div className={className || `relative ${mobile ? "size-[24px]" : "size-[16px]"}`}>
      <div className={`-translate-x-1/2 -translate-y-1/2 absolute left-1/2 rounded-[4px] top-1/2 ${mobile && ["Selected-focus", "Indeterminate-focus"].includes(state) ? "bg-[#006296] size-[24px]" : !mobile && ["Selected-focus", "Indeterminate-focus"].includes(state) ? "bg-[#006296] size-[16px]" : mobile && state === "Selected-disabled" ? "bg-[#b7bbc2] overflow-clip size-[24px]" : !mobile && state === "Selected-disabled" ? "bg-[#b7bbc2] overflow-clip size-[16px]" : mobile && state === "Hover" ? "bg-black size-[24px]" : !mobile && state === "Hover" ? "bg-[rgba(0,0,0,0.1)] size-[16px]" : mobile && ["Selected", "Indeterminate"].includes(state) ? "bg-[#006296] overflow-clip size-[24px]" : !mobile && ["Selected", "Indeterminate"].includes(state) ? "bg-[#006296] overflow-clip size-[16px]" : mobile && ["Default", "Disabled", "Focus", "Error"].includes(state) ? "bg-white size-[24px]" : "bg-white size-[16px]"}`} data-name=".[Checkbox Only master]">
        {isDefaultOrHoverOrDisabledOrSelectedFocusOrFocusOrIndeterminate && (
          <>
            <div className={`overflow-clip rounded-[inherit] size-full ${isNotMobileAndIsHoverOrDisabledOrSelectedFocusOrFocusOr ? "relative" : ""}`}>
              {isNotMobileAndIsHoverOrDisabledOrSelectedFocusOrFocusOr && (
                <>
                  <CheckboxOnlyCheck />
                  <CheckboxOnlyIndeterminate />
                </>
              )}
            </div>
            <div aria-hidden="true" className={`absolute border-solid inset-0 pointer-events-none rounded-[4px] ${state === "Error" ? "border border-[#cd2c23]" : ["Selected-focus", "Focus", "Indeterminate-focus"].includes(state) ? "border-2 border-[#84c6ea] shadow-[0px_0px_0px_2px_#006296]" : state === "Disabled" ? "border border-[#b7bbc2]" : state === "Hover" ? "border border-black" : "border border-[#60666e]"}`} />
          </>
        )}
        {isNotMobileAndIsSelectedOrSelectedDisabledOrIndeterminate && (
          <>
            <CheckboxOnlyCheck />
            <CheckboxOnlyIndeterminate />
          </>
        )}
      </div>
    </div>
  );
}
type TableHeadProps = {
  className?: string;
  resizeable?: boolean;
  size?: "Narrow" | "Default" | "Wide";
  stickyColumn?: boolean;
  type?: "Expand" | "Error" | "Checkbox" | "Radio-Button" | "Favorite" | "Avatar" | "Multiple avatars (2)" | "Multiple avatars (3)" | "Multiple avatars (4)" | "Multiple avatars (5)" | "Text" | "Amount" | "Input (right-aligned)" | "Action" | "Lozange" | "Tags" | "Last action";
};

function TableHead({ className, resizeable = false, size = "Narrow", stickyColumn = false, type = "Checkbox" }: TableHeadProps) {
  if (type === "Text" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[200px]"} data-name="Type=Text, Size=Narrow, Resizeable=False, Sticky column=False">
        <Wrapper4>
          <TableHeadText text="Title" additionalClassNames="py-[6px]" />
        </Wrapper4>
      </div>
    );
  }
  if (type === "Text" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[200px]"} data-name="Type=Text, Size=Narrow, Resizeable=False, Sticky column=True">
        <Helper additionalClassNames="items-start" />
      </div>
    );
  }
  if (type === "Amount" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[200px]"} data-name="Type=Amount, Size=Narrow, Resizeable=False, Sticky column=False">
        <Text text="Title" />
      </div>
    );
  }
  if (type === "Lozange" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[75px]"} data-name="Type=Lozange, Size=Narrow, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Tags" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[71px]"} data-name="Type=Tags, Size=Narrow, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[120px]"} data-name="Type=Input (right-aligned), Size=Narrow, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Amount" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[200px]"} data-name="Type=Amount, Size=Narrow, Resizeable=False, Sticky column=True">
        <Text text="Title" />
      </div>
    );
  }
  if (type === "Lozange" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[75px]"} data-name="Type=Lozange, Size=Narrow, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Tags" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[71px]"} data-name="Type=Tags, Size=Narrow, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[120px]"} data-name="Type=Input (right-aligned), Size=Narrow, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Text" && size === "Narrow" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[200px]"} data-name="Type=Text, Size=Narrow, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Amount" && size === "Narrow" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[200px]"} data-name="Type=Amount, Size=Narrow, Resizeable=True, Sticky column=False">
        <Helper3 />
      </div>
    );
  }
  if (type === "Lozange" && size === "Narrow" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[75px]"} data-name="Type=Lozange, Size=Narrow, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Tags" && size === "Narrow" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[71px]"} data-name="Type=Tags, Size=Narrow, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Narrow" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[120px]"} data-name="Type=Input (right-aligned), Size=Narrow, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Favorite" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[48px]"} data-name="Type=Favorite, Size=Narrow, Resizeable=False, Sticky column=False">
        <Wrapper1>
          <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </Wrapper1>
      </div>
    );
  }
  if (type === "Favorite" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[52px]"} data-name="Type=Favorite, Size=Narrow, Resizeable=False, Sticky column=True">
        <Wrapper1>
          <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </Wrapper1>
      </div>
    );
  }
  if (type === "Radio-Button" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Type=Radio-Button, Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper />
      </div>
    );
  }
  if (type === "Avatar" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Type=Avatar, Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper1 />
      </div>
    );
  }
  if (type === "Action" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "relative size-[32px]"} data-name="Type=Action, Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Expand" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "relative size-[32px]"} data-name="Type=Expand, Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper3 />
      </div>
    );
  }
  if (type === "Multiple avatars (2)" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Type=Multiple avatars (2), Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper4 />
      </div>
    );
  }
  if (type === "Multiple avatars (3)" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Type=Multiple avatars (3), Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper5 />
      </div>
    );
  }
  if (type === "Multiple avatars (4)" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Type=Multiple avatars (4), Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper6 />
      </div>
    );
  }
  if (type === "Multiple avatars (5)" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Type=Multiple avatars (5), Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper7 />
      </div>
    );
  }
  if (type === "Error" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "relative size-[32px]"} data-name="Type=Error, Size=Narrow, Resizeable=False, Sticky column=False">
        <TableHeadHelper8 />
      </div>
    );
  }
  if (type === "Checkbox" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Checkbox, Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper9 />
      </div>
    );
  }
  if (type === "Radio-Button" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Radio-Button, Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper />
      </div>
    );
  }
  if (type === "Avatar" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Avatar, Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper1 />
      </div>
    );
  }
  if (type === "Action" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] size-[32px]"} data-name="Type=Action, Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Expand" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] size-[32px]"} data-name="Type=Expand, Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper3 />
      </div>
    );
  }
  if (type === "Last action" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[52px]"} data-name="Type=Last action, Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Multiple avatars (2)" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (2), Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper4 />
      </div>
    );
  }
  if (type === "Multiple avatars (3)" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (3), Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper5 />
      </div>
    );
  }
  if (type === "Multiple avatars (4)" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (4), Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper6 />
      </div>
    );
  }
  if (type === "Multiple avatars (5)" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[32px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (5), Size=Narrow, Resizeable=False, Sticky column=True">
        <TableHeadHelper7 />
      </div>
    );
  }
  if (type === "Error" && size === "Narrow" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] size-[32px]"} data-name="Type=Error, Size=Narrow, Resizeable=False, Sticky column=True">
        <Helper4 />
      </div>
    );
  }
  if (type === "Last action" && size === "Narrow" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[32px] relative w-[52px]"} data-name="Type=Last action, Size=Narrow, Resizeable=False, Sticky column=False">
        <Helper4 />
      </div>
    );
  }
  if (type === "Text" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[200px]"} data-name="Type=Text, Size=Default, Resizeable=False, Sticky column=False">
        <Helper additionalClassNames="items-start" />
      </div>
    );
  }
  if (type === "Text" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[200px]"} data-name="Type=Text, Size=Default, Resizeable=False, Sticky column=True">
        <Helper additionalClassNames="items-start" />
      </div>
    );
  }
  if (type === "Amount" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[200px]"} data-name="Type=Amount, Size=Default, Resizeable=False, Sticky column=False">
        <Text text="Title" />
      </div>
    );
  }
  if (type === "Lozange" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[75px]"} data-name="Type=Lozange, Size=Default, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Tags" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[71px]"} data-name="Type=Tags, Size=Default, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[120px]"} data-name="Type=Input (right-aligned), Size=Default, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Amount" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[200px]"} data-name="Type=Amount, Size=Default, Resizeable=False, Sticky column=True">
        <Text text="Title" />
      </div>
    );
  }
  if (type === "Lozange" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[75px]"} data-name="Type=Lozange, Size=Default, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Tags" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[71px]"} data-name="Type=Tags, Size=Default, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[120px]"} data-name="Type=Input (right-aligned), Size=Default, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Amount" && size === "Default" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[200px]"} data-name="Type=Amount, Size=Default, Resizeable=True, Sticky column=False">
        <Helper3 />
      </div>
    );
  }
  if (type === "Lozange" && size === "Default" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[75px]"} data-name="Type=Lozange, Size=Default, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Tags" && size === "Default" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[71px]"} data-name="Type=Tags, Size=Default, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Text" && size === "Default" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[200px]"} data-name="Type=Text, Size=Default, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Default" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[120px]"} data-name="Type=Input (right-aligned), Size=Default, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Favorite" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[48px]"} data-name="Type=Favorite, Size=Default, Resizeable=False, Sticky column=False">
        <Wrapper1>
          <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </Wrapper1>
      </div>
    );
  }
  if (type === "Favorite" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[52px]"} data-name="Type=Favorite, Size=Default, Resizeable=False, Sticky column=True">
        <Wrapper1>
          <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </Wrapper1>
      </div>
    );
  }
  if (type === "Checkbox" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative"} data-name="Type=Checkbox, Size=Default, Resizeable=False, Sticky column=False">
        <div className="content-stretch flex h-full items-start relative">
          <MasterDataTableCell1 additionalClassNames="h-[40px]">
            <CheckboxOnly className="relative shrink-0 size-[16px]" />
          </MasterDataTableCell1>
        </div>
      </div>
    );
  }
  if (type === "Radio-Button" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative"} data-name="Type=Radio-Button, Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper />
      </div>
    );
  }
  if (type === "Avatar" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative"} data-name="Type=Avatar, Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper1 />
      </div>
    );
  }
  if (type === "Action" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[32px]"} data-name="Type=Action, Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Expand" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[32px]"} data-name="Type=Expand, Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper3 />
      </div>
    );
  }
  if (type === "Multiple avatars (2)" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative"} data-name="Type=Multiple avatars (2), Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper4 />
      </div>
    );
  }
  if (type === "Multiple avatars (3)" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative"} data-name="Type=Multiple avatars (3), Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper5 />
      </div>
    );
  }
  if (type === "Multiple avatars (4)" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative"} data-name="Type=Multiple avatars (4), Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper6 />
      </div>
    );
  }
  if (type === "Multiple avatars (5)" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative"} data-name="Type=Multiple avatars (5), Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper7 />
      </div>
    );
  }
  if (type === "Error" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[32px]"} data-name="Type=Error, Size=Default, Resizeable=False, Sticky column=False">
        <TableHeadHelper8 />
      </div>
    );
  }
  if (type === "Checkbox" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Checkbox, Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper9 />
      </div>
    );
  }
  if (type === "Radio-Button" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Radio-Button, Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper />
      </div>
    );
  }
  if (type === "Avatar" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Avatar, Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper1 />
      </div>
    );
  }
  if (type === "Action" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[32px]"} data-name="Type=Action, Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Expand" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[32px]"} data-name="Type=Expand, Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper3 />
      </div>
    );
  }
  if (type === "Last action" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[52px]"} data-name="Type=Last action, Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Multiple avatars (2)" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (2), Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper4 />
      </div>
    );
  }
  if (type === "Multiple avatars (3)" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (3), Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper5 />
      </div>
    );
  }
  if (type === "Multiple avatars (4)" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (4), Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper6 />
      </div>
    );
  }
  if (type === "Multiple avatars (5)" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (5), Size=Default, Resizeable=False, Sticky column=True">
        <TableHeadHelper7 />
      </div>
    );
  }
  if (type === "Error" && size === "Default" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[40px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[32px]"} data-name="Type=Error, Size=Default, Resizeable=False, Sticky column=True">
        <Helper4 />
      </div>
    );
  }
  if (type === "Last action" && size === "Default" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[40px] relative w-[52px]"} data-name="Type=Last action, Size=Default, Resizeable=False, Sticky column=False">
        <Helper4 />
      </div>
    );
  }
  if (type === "Text" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[200px]"} data-name="Type=Text, Size=Wide, Resizeable=False, Sticky column=False">
        <Helper additionalClassNames="items-start" />
      </div>
    );
  }
  if (type === "Text" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[200px]"} data-name="Type=Text, Size=Wide, Resizeable=False, Sticky column=True">
        <Helper additionalClassNames="items-start" />
      </div>
    );
  }
  if (type === "Amount" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[200px]"} data-name="Type=Amount, Size=Wide, Resizeable=False, Sticky column=False">
        <Text text="Title" />
      </div>
    );
  }
  if (type === "Lozange" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[75px]"} data-name="Type=Lozange, Size=Wide, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Tags" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[71px]"} data-name="Type=Tags, Size=Wide, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[120px]"} data-name="Type=Input (right-aligned), Size=Wide, Resizeable=False, Sticky column=False">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Amount" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[200px]"} data-name="Type=Amount, Size=Wide, Resizeable=False, Sticky column=True">
        <Text text="Title" />
      </div>
    );
  }
  if (type === "Lozange" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[75px]"} data-name="Type=Lozange, Size=Wide, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Tags" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[71px]"} data-name="Type=Tags, Size=Wide, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[120px]"} data-name="Type=Input (right-aligned), Size=Wide, Resizeable=False, Sticky column=True">
        <div className="flex flex-row items-center justify-end size-full">
          <Helper additionalClassNames="items-center justify-end" />
        </div>
      </div>
    );
  }
  if (type === "Amount" && size === "Wide" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[200px]"} data-name="Type=Amount, Size=Wide, Resizeable=True, Sticky column=False">
        <Helper3 />
      </div>
    );
  }
  if (type === "Lozange" && size === "Wide" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[75px]"} data-name="Type=Lozange, Size=Wide, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Tags" && size === "Wide" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[71px]"} data-name="Type=Tags, Size=Wide, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Text" && size === "Wide" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[200px]"} data-name="Type=Text, Size=Wide, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Input (right-aligned)" && size === "Wide" && resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[120px]"} data-name="Type=Input (right-aligned), Size=Wide, Resizeable=True, Sticky column=False">
        <Helper1 />
      </div>
    );
  }
  if (type === "Favorite" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "relative size-[48px]"} data-name="Type=Favorite, Size=Wide, Resizeable=False, Sticky column=False">
        <Wrapper1>
          <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </Wrapper1>
      </div>
    );
  }
  if (type === "Favorite" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[52px]"} data-name="Type=Favorite, Size=Wide, Resizeable=False, Sticky column=True">
        <Wrapper1>
          <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
        </Wrapper1>
      </div>
    );
  }
  if (type === "Checkbox" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative"} data-name="Type=Checkbox, Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper9 />
      </div>
    );
  }
  if (type === "Radio-Button" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative"} data-name="Type=Radio-Button, Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper />
      </div>
    );
  }
  if (type === "Avatar" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative"} data-name="Type=Avatar, Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper1 />
      </div>
    );
  }
  if (type === "Action" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[32px]"} data-name="Type=Action, Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Expand" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[32px]"} data-name="Type=Expand, Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper3 />
      </div>
    );
  }
  if (type === "Multiple avatars (2)" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative"} data-name="Type=Multiple avatars (2), Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper4 />
      </div>
    );
  }
  if (type === "Multiple avatars (3)" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative"} data-name="Type=Multiple avatars (3), Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper5 />
      </div>
    );
  }
  if (type === "Multiple avatars (4)" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative"} data-name="Type=Multiple avatars (4), Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper6 />
      </div>
    );
  }
  if (type === "Multiple avatars (5)" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative"} data-name="Type=Multiple avatars (5), Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper7 />
      </div>
    );
  }
  if (type === "Error" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[32px]"} data-name="Type=Error, Size=Wide, Resizeable=False, Sticky column=False">
        <TableHeadHelper8 />
      </div>
    );
  }
  if (type === "Checkbox" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Checkbox, Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper9 />
      </div>
    );
  }
  if (type === "Radio-Button" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Radio-Button, Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper />
      </div>
    );
  }
  if (type === "Avatar" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Avatar, Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper1 />
      </div>
    );
  }
  if (type === "Action" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[32px]"} data-name="Type=Action, Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Expand" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[32px]"} data-name="Type=Expand, Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper3 />
      </div>
    );
  }
  if (type === "Last action" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[52px]"} data-name="Type=Last action, Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper2 />
      </div>
    );
  }
  if (type === "Multiple avatars (2)" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (2), Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper4 />
      </div>
    );
  }
  if (type === "Multiple avatars (3)" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (3), Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper5 />
      </div>
    );
  }
  if (type === "Multiple avatars (4)" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (4), Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper6 />
      </div>
    );
  }
  if (type === "Multiple avatars (5)" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)]"} data-name="Type=Multiple avatars (5), Size=Wide, Resizeable=False, Sticky column=True">
        <TableHeadHelper7 />
      </div>
    );
  }
  if (type === "Error" && size === "Wide" && !resizeable && stickyColumn) {
    return (
      <div className={className || "bg-white h-[48px] relative shadow-[1px_0px_3px_0px_rgba(0,0,0,0.05),3px_0px_6px_0px_rgba(0,0,0,0.05)] w-[32px]"} data-name="Type=Error, Size=Wide, Resizeable=False, Sticky column=True">
        <Helper4 />
      </div>
    );
  }
  if (type === "Last action" && size === "Wide" && !resizeable && !stickyColumn) {
    return (
      <div className={className || "h-[48px] relative w-[52px]"} data-name="Type=Last action, Size=Wide, Resizeable=False, Sticky column=False">
        <Helper4 />
      </div>
    );
  }
  return (
    <div className={className || "h-[32px] relative"} data-name="Type=Checkbox, Size=Narrow, Resizeable=False, Sticky column=False">
      <TableHeadHelper9 />
    </div>
  );
}

export default function TableHead1() {
  return (
    <div className="bg-white relative size-full" data-name="Table Head">
      <div className="content-stretch flex items-start px-[16px] relative size-full">
        <TableHead className="h-[40px] relative shrink-0 w-[32px]" size="Default" type="Expand" />
        <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Col">
          <TableHead className="h-[40px] relative shrink-0" size="Default" />
          <TableHead className="flex-[1_0_0] h-[40px] min-h-px min-w-px relative" size="Default" type="Text" />
        </div>
        <TableHead className="flex-[1_0_0] h-[40px] min-h-px min-w-px relative" size="Default" type="Text" />
        <TableHead className="flex-[1_0_0] h-[40px] min-h-px min-w-px relative" size="Default" type="Text" />
        <TableHead className="flex-[1_0_0] h-[40px] min-h-px min-w-px relative" size="Default" type="Lozange" />
        <div className="content-stretch flex items-start relative shrink-0" data-name="Actions">
          <TableHead className="h-[40px] relative shrink-0 w-[32px]" size="Default" type="Action" />
          <TableHead className="h-[40px] relative shrink-0 w-[32px]" size="Default" type="Action" />
          <TableHead className="h-[40px] relative shrink-0 w-[52px]" size="Default" type="Last action" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#dbdee1] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}