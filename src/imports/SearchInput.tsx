import clsx from "clsx";
import svgPaths from "./svg-vwultokvi6";
type SearchInputTextProps = {
  additionalClassNames?: string;
};

function SearchInputText({ children, additionalClassNames = "" }: React.PropsWithChildren<SearchInputTextProps>) {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] h-[24px] items-center min-h-px min-w-px relative">
      <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Value + Autocomplete">
        <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] tracking-[0.2px] whitespace-nowrap", additionalClassNames)}>
          <p className="leading-[20px]">{children}</p>
        </div>
      </div>
    </div>
  );
}
type SearchInputProps = {
  className?: string;
  mobile?: boolean;
  state?: "Default" | "Filled" | "Disabled" | "Focus" | "Focus-button" | "Hover-button";
  variant?: "Global" | "Contextual";
};

function SearchInput({ className, mobile = false, state = "Default", variant = "Global" }: SearchInputProps) {
  const isContextualAndIsDefaultOrFilledOrDisabledOrFocus = variant === "Contextual" && ["Default", "Filled", "Disabled", "Focus"].includes(state);
  const isGlobal = variant === "Global";
  const isGlobalAndFocus = variant === "Global" && state === "Focus";
  return (
    <div className={className || `relative w-[400px] ${mobile && (["Default", "Filled", "Disabled", "Focus"].includes(state) || (variant === "Global" && state === "Focus-button") || (variant === "Global" && state === "Hover-button")) ? "h-[48px]" : "h-[32px]"}`}>
      <div className="content-stretch flex flex-col items-start relative size-full">
        <div className={`relative shrink-0 ${mobile && variant === "Contextual" && ["Default", "Filled", "Disabled", "Focus"].includes(state) ? "h-[48px] w-[400px]" : !mobile && variant === "Contextual" && ["Default", "Filled", "Disabled", "Focus"].includes(state) ? "h-[32px] w-[400px]" : mobile && variant === "Global" ? "h-[48px] w-full" : "h-[32px] w-full"}`} data-name=".[Search input]">
          <div className={`content-stretch flex items-start relative size-full ${isGlobalAndFocus ? "isolate pr-px" : isContextualAndIsDefaultOrFilledOrDisabledOrFocus ? "flex-col" : "pr-px"}`}>
            <div className={`bg-white h-[32px] relative ${isGlobalAndFocus ? "flex-[1_0_0] min-h-px min-w-px mr-[-1px] rounded-bl-[4px] rounded-tl-[4px] z-[2]" : isContextualAndIsDefaultOrFilledOrDisabledOrFocus ? "rounded-[4px] shrink-0 w-full" : "flex-[1_0_0] min-h-px min-w-px mr-[-1px] rounded-bl-[4px] rounded-tl-[4px]"}`} data-name=".Textbox">
              <div aria-hidden="true" className={`absolute border border-[#60666e] border-solid inset-0 pointer-events-none ${isContextualAndIsDefaultOrFilledOrDisabledOrFocus ? "rounded-[4px]" : "rounded-bl-[4px] rounded-tl-[4px]"}`} />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative size-full">
                  {isGlobal && <SearchInputText additionalClassNames="text-[#60666e]">Search</SearchInputText>}
                  {isContextualAndIsDefaultOrFilledOrDisabledOrFocus && (
                    <>
                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon-left">
                        <div className="absolute inset-[5.21%]" data-name="Vector">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.3333 14.3333">
                            <g id="Vector">
                              <path d={svgPaths.p2aec84b0} fill="var(--fill-0, #60666E)" />
                              <path clipRule="evenodd" d={svgPaths.p20fa8440} fill="var(--fill-0, #60666E)" fillRule="evenodd" />
                            </g>
                          </svg>
                        </div>
                      </div>
                      <SearchInputText additionalClassNames="text-[#1b1c1e]">Value</SearchInputText>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isGlobal && (
              <div className={`mr-[-1px] relative shrink-0 w-[32px] ${isGlobalAndFocus ? "z-[1]" : ""}`} data-name="Button">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex items-center justify-center relative w-full">
                    <div className="bg-white relative rounded-br-[4px] rounded-tr-[4px] shrink-0" data-name=".[Button master]">
                      <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-br-[4px] rounded-tr-[4px]" />
                      <div className="flex flex-row items-center justify-center size-full">
                        <div className="content-stretch flex items-center justify-center p-[8px] relative">
                          <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                            <div className="absolute inset-[17.71%]" data-name="Vector">
                              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchInput1() {
  return <SearchInput className="relative size-full" />;
}