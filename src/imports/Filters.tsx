import svgPaths from "./svg-qbomu7sgv9";

function Helper() {
  return (
    <svg fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333" className="absolute block size-full">
      <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
    </svg>
  );
}

function FiltersButton({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[16px]">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative size-full">
          <div className="bg-[rgba(255,255,255,0)] relative rounded-[9999px] shrink-0" data-name=".[Button master]">
            <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center p-[4px] relative">
                <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                  <div className="absolute inset-[17.71%]" data-name="Vector">
                    <svg fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333" className="absolute block size-full">
                      <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                    </svg>
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
type FiltersValueAutocompleteTextProps = {
  text: string;
};

function FiltersValueAutocompleteText({ text }: FiltersValueAutocompleteTextProps) {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">{text}</p>
      </div>
    </div>
  );
}
type FiltersProps = {
  className?: string;
  opened?: boolean;
  state?: "Default" | "Hover" | "Active" | "Active-Hover" | "Focus";
  type?: "Single select" | "Multi-select";
};

function Filters({ className, opened = false, state = "Default", type = "Single select" }: FiltersProps) {
  const isActive = state === "Active";
  const isActiveHover = state === "Active-Hover";
  const isActiveOrActiveHover = ["Active", "Active-Hover"].includes(state);
  const isFocus = state === "Focus";
  const isFocusAndNotOpened = state === "Focus" && !opened;
  const isFocusAndOpened = state === "Focus" && opened;
  const isHover = state === "Hover";
  const isMultiSelectAndDefaultAndNotOpened = type === "Multi-select" && state === "Default" && !opened;
  const isMultiSelectAndIsActiveOrActiveHover = type === "Multi-select" && ["Active", "Active-Hover"].includes(state);
  const isMultiSelectAndOpened = type === "Multi-select" && opened;
  const isMultiSelectAndOpenedAndIsActiveOrActiveHover = type === "Multi-select" && opened && ["Active", "Active-Hover"].includes(state);
  const isMultiSelectAndOpenedAndIsDefaultOrFocusOrHover = type === "Multi-select" && opened && ["Default", "Focus", "Hover"].includes(state);
  const isOpened = opened;
  const isSingleSelectAndIsActiveOrActiveHover = type === "Single select" && ["Active", "Active-Hover"].includes(state);
  const isSingleSelectAndOpened = type === "Single select" && opened;
  return (
    <div className={className || `h-[32px] relative ${isFocusAndNotOpened ? "shadow-[0px_0px_0px_0px_#006296]" : ""}`}>
      <div className={`content-stretch flex h-full items-start relative ${isOpened ? "flex-col gap-[4px]" : ""}`}>
        <div className={`relative shrink-0 ${isFocusAndOpened ? "h-[32px] rounded-[4px]" : state === "Default" && opened ? "h-[32px]" : isMultiSelectAndDefaultAndNotOpened || isHover || isActive || isActiveHover ? "" : isFocusAndNotOpened ? "rounded-[4px]" : "h-full"}`} data-name=".[Filter Dropdown List master]">
          <div aria-hidden={isFocus ? "true" : undefined} className={type === "Single select" && state === "Focus" && opened ? "absolute border-2 border-[#006296] border-solid inset-[-2px] pointer-events-none rounded-[6px] shadow-[0px_0px_0px_0px_#006296]" : state === "Focus" && (!opened || (type === "Multi-select" && opened)) ? "absolute border-2 border-[#006296] border-solid inset-[-2px] pointer-events-none rounded-[6px]" : "flex flex-row items-center size-full"}>
            {["Default", "Hover", "Active", "Active-Hover"].includes(state) && (
              <div className={`content-stretch flex items-center relative ${isMultiSelectAndDefaultAndNotOpened || isHover || isActive || isActiveHover ? "" : "h-full"}`}>
                <div className={`h-[32px] relative rounded-[4px] shrink-0 ${isActiveHover ? "bg-[#c2e2f4] content-stretch flex gap-[8px] items-center px-[8px] py-[4px]" : isActive ? "bg-[#e0f0f9] content-stretch flex gap-[8px] items-center px-[8px] py-[4px]" : isHover ? "bg-[rgba(0,0,0,0.1)]" : "bg-white"}`} data-name=".Textbox">
                  <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[4px] ${isActiveOrActiveHover ? "border-[#006296]" : isHover ? "border-black" : "border-[#878f9a]"}`} />
                  {["Default", "Hover"].includes(state) && (
                    <div className="flex flex-row items-center size-full">
                      <div className="content-stretch flex gap-[8px] h-full items-center px-[8px] py-[4px] relative">
                        <div className={`content-center flex flex-wrap gap-[4px] h-full items-center relative ${isHover ? "flex-[1_0_0] min-h-px min-w-px" : "shrink-0"}`} data-name="Text">
                          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[20px]">{isHover ? "Label :" : state === "Default" && ((type === "Multi-select" && !opened) || opened) ? "Label" : "Label"}</p>
                          </div>
                          {isHover && <FiltersValueAutocompleteText text="Option" />}
                        </div>
                        <div className={`content-stretch flex gap-[8px] items-center justify-center relative shrink-0 ${isHover ? "pl-[4px] py-[4px]" : "py-[2px]"}`} data-name="Buttons">
                          <FiltersButton />
                          {isHover && <FiltersButton />}
                        </div>
                      </div>
                    </div>
                  )}
                  {isActiveOrActiveHover && (
                    <>
                      <div className={`content-center flex flex-wrap gap-[4px] h-full items-center relative shrink-0 ${isMultiSelectAndIsActiveOrActiveHover ? "" : "leading-[0] text-[#003a5a] text-[14px] tracking-[0.2px] whitespace-nowrap"}`} data-name="Text">
                        <div className={`flex flex-col font-["Open_Sans:Regular",sans-serif] font-normal justify-center relative shrink-0 ${isMultiSelectAndIsActiveOrActiveHover ? "leading-[0] text-[#003a5a] text-[14px] tracking-[0.2px] whitespace-nowrap" : ""}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                          <p className="leading-[20px]">{isMultiSelectAndIsActiveOrActiveHover ? "Label" : isSingleSelectAndIsActiveOrActiveHover ? "Label :" : ""}</p>
                        </div>
                        {isSingleSelectAndIsActiveOrActiveHover && (
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center relative shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[20px]">Item</p>
                          </div>
                        )}
                        {isMultiSelectAndIsActiveOrActiveHover && (
                          <div className="bg-[#006296] relative rounded-[9999px] shrink-0 w-[16px]" data-name="Notification Badge">
                            <div className="flex flex-row items-center justify-center size-full">
                              <div className="content-stretch flex items-center justify-center px-[4px] py-[2px] relative w-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] min-w-[6px] relative shrink-0 text-[10px] text-center text-white tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[12px]">9</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="content-stretch flex gap-[8px] items-center justify-center py-[2px] relative shrink-0" data-name="Buttons">
                        <FiltersButton />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {isFocus && (
            <div className="flex flex-row items-center size-full">
              <div className={`content-stretch flex items-center relative ${isFocusAndOpened ? "h-full" : ""}`}>
                <div className="bg-white h-[32px] relative rounded-[4px] shrink-0" data-name=".Textbox">
                  <div aria-hidden="true" className="absolute border-2 border-[#84c6ea] border-solid inset-0 pointer-events-none rounded-[4px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex gap-[8px] h-full items-center px-[8px] py-[4px] relative">
                      <div className="content-center flex flex-[1_0_0] flex-wrap gap-[4px] h-full items-center min-h-px min-w-px relative" data-name="Text">
                        <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          <p className="leading-[20px]">Label :</p>
                        </div>
                        <FiltersValueAutocompleteText text="Option" />
                      </div>
                      <div className="content-stretch flex gap-[8px] items-center justify-center pl-[4px] py-[4px] relative shrink-0" data-name="Buttons">
                        <FiltersButton />
                        <FiltersButton />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {isOpened && (
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Listbox">
            <div className={`min-w-[240px] relative rounded-[4px] shrink-0 w-full ${isMultiSelectAndOpened ? "h-[292px]" : ""}`} data-name=".[Filtering Listbox master]">
              <div className="min-w-[inherit] overflow-clip rounded-[inherit] size-full">
                <div className={`content-stretch flex flex-col items-start min-w-[inherit] relative ${isMultiSelectAndOpened ? "size-full" : "w-full"}`}>
                  <div className={`bg-white content-stretch flex items-start overflow-clip pr-[16px] relative shadow-[0px_51px_51px_4px_rgba(0,0,0,0.01),0px_29px_29px_2px_rgba(27,28,30,0.04),0px_13px_13px_1px_rgba(27,28,30,0.07),0px_3px_6px_0px_rgba(27,28,30,0.1)] w-full ${isMultiSelectAndOpened ? "flex-[1_0_0] min-h-px min-w-px" : "h-[244px] shrink-0"}`} data-name="Listbox">
                    <div className={`flex-[1_0_0] min-h-px min-w-px mr-[-16px] relative rounded-[4px] ${isMultiSelectAndOpened ? "h-full" : "self-stretch"}`} data-name="List">
                      <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
                        <div className={`content-stretch flex flex-col items-center py-[4px] relative size-full ${isMultiSelectAndOpened ? "" : "gap-[4px]"}`}>
                          {opened && (["Default", "Focus", "Hover"].includes(state) || (type === "Single select" && state === "Active") || (type === "Single select" && state === "Active-Hover")) && (
                            <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0 w-full" data-name="Options">
                              <div className="relative shrink-0 w-full" data-name="Menu Item">
                                <div className="content-stretch flex items-start relative w-full">
                                  <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[Listbox item master]/Group Label">
                                    <div className="flex flex-col items-center justify-center size-full">
                                      <div className="content-stretch flex flex-col items-center justify-center relative size-full">
                                        <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Content">
                                          <div className="flex flex-row items-center size-full">
                                            <div className="content-stretch flex items-center pb-[4px] pl-[16px] pr-[8px] pt-[8px] relative size-full">
                                              <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                                <p className="leading-[20px]">Label group</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="relative shrink-0 w-full" data-name="List Item 01">
                                <div className="content-stretch flex items-start relative w-full">
                                  <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                    <div className="flex flex-row items-center size-full">
                                      <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                        {isSingleSelectAndOpened && (
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        )}
                                        {isMultiSelectAndOpenedAndIsDefaultOrFocusOrHover && (
                                          <>
                                            <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                                <div className="overflow-clip relative rounded-[inherit] size-full">
                                                  <div className="absolute inset-0 overflow-clip" data-name="check">
                                                    <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                        <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                  <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                    <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                        <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                              </div>
                                            </div>
                                            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                              Option
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="relative shrink-0 w-full" data-name="List Item 02">
                                <div className="content-stretch flex items-start relative w-full">
                                  <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                    <div className="flex flex-row items-center size-full">
                                      <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                        {isSingleSelectAndOpened && (
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        )}
                                        {isMultiSelectAndOpenedAndIsDefaultOrFocusOrHover && (
                                          <>
                                            <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                                <div className="overflow-clip relative rounded-[inherit] size-full">
                                                  <div className="absolute inset-0 overflow-clip" data-name="check">
                                                    <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                        <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                  <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                    <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                        <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                              </div>
                                            </div>
                                            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                              Option
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="relative shrink-0 w-full" data-name="List Item 03">
                                <div className="content-stretch flex items-start relative w-full">
                                  <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                    <div className="flex flex-row items-center size-full">
                                      <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                        {isSingleSelectAndOpened && (
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        )}
                                        {isMultiSelectAndOpenedAndIsDefaultOrFocusOrHover && (
                                          <>
                                            <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                                <div className="overflow-clip relative rounded-[inherit] size-full">
                                                  <div className="absolute inset-0 overflow-clip" data-name="check">
                                                    <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                        <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                  <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                    <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                        <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                              </div>
                                            </div>
                                            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                              Option
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="relative shrink-0 w-full" data-name="List Item 04">
                                <div className="content-stretch flex items-start relative w-full">
                                  <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                    <div className="flex flex-row items-center size-full">
                                      <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                        {isSingleSelectAndOpened && (
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        )}
                                        {isMultiSelectAndOpenedAndIsDefaultOrFocusOrHover && (
                                          <>
                                            <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                                <div className="overflow-clip relative rounded-[inherit] size-full">
                                                  <div className="absolute inset-0 overflow-clip" data-name="check">
                                                    <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                        <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                  <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                    <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                        <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                              </div>
                                            </div>
                                            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                              Option
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="relative shrink-0 w-full" data-name="List Item 05">
                                <div className="content-stretch flex items-start relative w-full">
                                  <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                    <div className="flex flex-row items-center size-full">
                                      <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                        {isSingleSelectAndOpened && (
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        )}
                                        {isMultiSelectAndOpenedAndIsDefaultOrFocusOrHover && (
                                          <>
                                            <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                                <div className="overflow-clip relative rounded-[inherit] size-full">
                                                  <div className="absolute inset-0 overflow-clip" data-name="check">
                                                    <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                        <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                  <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                    <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                        <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                      </svg>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                              </div>
                                            </div>
                                            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                              Option
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {isMultiSelectAndOpenedAndIsDefaultOrFocusOrHover && (
                                <div className="relative shrink-0 w-full" data-name="List Item 06">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                              <div className="overflow-clip relative rounded-[inherit] size-full">
                                                <div className="absolute inset-0 overflow-clip" data-name="check">
                                                  <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                      <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                  <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                      <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                            </div>
                                          </div>
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {isMultiSelectAndOpenedAndIsActiveOrActiveHover && (
                            <>
                              <div className="content-stretch flex flex-col gap-[4px] items-center pt-[6px] relative shrink-0 w-full" data-name="Clear filter">
                                <div className="relative shrink-0 w-full" data-name="List Item">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="h-[8px] relative shrink-0 w-full" data-name="Divider">
                                  <div className="content-stretch flex items-start px-[16px] py-[4px] relative size-full">
                                    <div className="flex-[1_0_0] h-0 min-h-px min-w-px relative self-center" data-name="Divider">
                                      <div className="absolute inset-[-1px_0_0_0]">
                                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 166 1">
                                          <line id="Divider" stroke="var(--stroke-0, #DBDEE1)" x2="166" y1="0.5" y2="0.5" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0 w-full" data-name="Options">
                                <div className="relative shrink-0 w-full" data-name="Menu Item">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[Listbox item master]/Group Label">
                                      <div className="flex flex-col items-center justify-center size-full">
                                        <div className="content-stretch flex flex-col items-center justify-center relative size-full">
                                          <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Content">
                                            <div className="flex flex-row items-center size-full">
                                              <div className="content-stretch flex items-center pb-[4px] pl-[16px] pr-[8px] pt-[8px] relative size-full">
                                                <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                                  <p className="leading-[20px]">Label group</p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative shrink-0 w-full" data-name="List Item 01">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                              <div className="overflow-clip relative rounded-[inherit] size-full">
                                                <div className="absolute inset-0 overflow-clip" data-name="check">
                                                  <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                      <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                  <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                      <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                            </div>
                                          </div>
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative shrink-0 w-full" data-name="List Item 02">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                              <div className="overflow-clip relative rounded-[inherit] size-full">
                                                <div className="absolute inset-0 overflow-clip" data-name="check">
                                                  <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                      <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                  <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                      <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                            </div>
                                          </div>
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative shrink-0 w-full" data-name="List Item 03">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                              <div className="overflow-clip relative rounded-[inherit] size-full">
                                                <div className="absolute inset-0 overflow-clip" data-name="check">
                                                  <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                      <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                  <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                      <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                            </div>
                                          </div>
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative shrink-0 w-full" data-name="List Item 04">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                              <div className="overflow-clip relative rounded-[inherit] size-full">
                                                <div className="absolute inset-0 overflow-clip" data-name="check">
                                                  <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                      <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                  <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                      <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                            </div>
                                          </div>
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative shrink-0 w-full" data-name="List Item 05">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                              <div className="overflow-clip relative rounded-[inherit] size-full">
                                                <div className="absolute inset-0 overflow-clip" data-name="check">
                                                  <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                      <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                  <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                      <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                            </div>
                                          </div>
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative shrink-0 w-full" data-name="List Item 06">
                                  <div className="content-stretch flex items-start relative w-full">
                                    <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
                                      <div className="flex flex-row items-center size-full">
                                        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                                          <div className="relative shrink-0 size-[16px]" data-name="Checkbox Only">
                                            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] size-[16px] top-1/2" data-name=".[Checkbox Only master]">
                                              <div className="overflow-clip relative rounded-[inherit] size-full">
                                                <div className="absolute inset-0 overflow-clip" data-name="check">
                                                  <div className="absolute inset-[27.38%_19.53%_27.31%_19.53%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 7.25">
                                                      <path clipRule="evenodd" d={svgPaths.p1deef3f0} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="absolute left-0 overflow-clip size-[16px] top-0" data-name="indeterminate">
                                                  <div className="absolute inset-[44.53%_22.66%]" data-name="Vector">
                                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75 1.75">
                                                      <path clipRule="evenodd" d={svgPaths.p85bb900} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                                    </svg>
                                                  </div>
                                                </div>
                                              </div>
                                              <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
                                            </div>
                                          </div>
                                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                            Option
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`mr-[-16px] relative shrink-0 ${isMultiSelectAndOpened ? "h-full" : "self-stretch"}`} data-name="Scrollbar">
                      <div className="content-stretch flex flex-col gap-[4px] h-full items-start p-[4px] relative">
                        <div className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" data-name="Scroll Bar">
                          <div className="absolute bg-[#878f9a] bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />
                        </div>
                        <div className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" data-name="Invisible layer">
                          <div className="absolute bg-[#878f9a] bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />
                        </div>
                        <div className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" data-name="Invisible layer">
                          <div className="absolute bg-[#878f9a] bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />
                        </div>
                        <div className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" data-name="Invisible layer">
                          <div className="absolute bg-[#878f9a] bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {isMultiSelectAndOpened && (
                    <div className="bg-white relative shadow-[0px_26px_26px_0px_rgba(27,28,30,0.01),0px_14px_14px_0px_rgba(27,28,30,0.04),0px_6px_10px_0px_rgba(27,28,30,0.07),0px_2px_6px_0px_rgba(27,28,30,0.1)] shrink-0 w-full" data-name="Footer">
                      <div className="flex flex-row items-center justify-end size-full">
                        <div className="content-stretch flex gap-[8px] items-center justify-end p-[16px] relative w-full">
                          <div className="relative shrink-0" data-name="Button">
                            <div className="flex flex-row items-center justify-center size-full">
                              <div className="content-stretch flex items-center justify-center relative">
                                <div className="bg-[rgba(255,255,255,0)] relative rounded-[9999px] shrink-0" data-name=".[Button master]">
                                  <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                                  <div className="flex flex-row items-center justify-center size-full">
                                    <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[4px] relative">
                                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon-start">
                                        <div className="absolute inset-[17.71%]" data-name="Vector">
                                          <Helper />
                                        </div>
                                      </div>
                                      <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white tracking-[0.4px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                        <p className="leading-[16px]">Button</p>
                                      </div>
                                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon-end">
                                        <div className="absolute inset-[34.38%_21.88%]" data-name="Vector">
                                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                                            <path clipRule="evenodd" d={svgPaths.p29cba700} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="relative shadow-[0px_6px_6px_0px_rgba(27,28,30,0.01),0px_5px_5px_0px_rgba(27,28,30,0.04),0px_2px_4px_0px_rgba(27,28,30,0.07),0px_0px_4px_0px_rgba(27,28,30,0.1)] shrink-0" data-name="Button">
                            <div className="flex flex-row items-center justify-center size-full">
                              <div className="content-stretch flex items-center justify-center relative">
                                <div className="bg-[#006296] relative rounded-[9999px] shrink-0" data-name=".[Button master]">
                                  <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                                  <div className="flex flex-row items-center justify-center size-full">
                                    <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[4px] relative">
                                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon-start">
                                        <div className="absolute inset-[17.71%]" data-name="Vector">
                                          <Helper />
                                        </div>
                                      </div>
                                      <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white tracking-[0.4px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                        <p className="leading-[16px]">Button</p>
                                      </div>
                                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon-end">
                                        <div className="absolute inset-[34.38%_21.88%]" data-name="Vector">
                                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                                            <path clipRule="evenodd" d={svgPaths.p29cba700} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                          </svg>
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
                    </div>
                  )}
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_51px_51px_4px_rgba(0,0,0,0.01),0px_29px_29px_2px_rgba(27,28,30,0.04),0px_13px_13px_1px_rgba(27,28,30,0.07),0px_3px_6px_0px_rgba(27,28,30,0.1)]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Filters1() {
  return <Filters className="relative size-full" />;
}