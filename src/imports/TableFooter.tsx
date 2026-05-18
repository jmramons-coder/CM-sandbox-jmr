function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative">{children}</div>
      </div>
    </div>
  );
}

function DropdownHelper({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper>
      <div className="relative shrink-0">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">{children}</div>
        </div>
      </div>
    </Wrapper>
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

export default function TableFooter() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-end pl-[24px] py-px relative size-full" data-name="Table footer">
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
                            <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Dropdown">
                              <DropdownHelper>
                                <div className="relative rounded-[20px] shrink-0" data-name="Base/Button">
                                  <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[4px] relative">
                                      <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Icon-start">
                                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                                          <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
                                            <div className="absolute inset-[-12.5%_-6.25%]">
                                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                                                <path d="M0.5 0.5L4.5 4.5L8.5 0.5" id="Vector" stroke="var(--stroke-0, #60666E)" strokeLinecap="round" strokeLinejoin="round" />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DropdownHelper>
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
  );
}