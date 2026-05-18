import clsx from "clsx";
import svgPaths from "./svg-c3554nkr1j";

function NavigationItemsNavButtonVerticalMenuCentralize({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[56px] relative shrink-0 w-[72px]">
      <div className="content-stretch flex flex-col items-start relative size-full">{children}</div>
    </div>
  );
}

function Content({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[72px]">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[2px] items-center justify-center px-[10px] py-[8px] relative size-full">{children}</div>
      </div>
    </div>
  );
}
type LayoutHelperProps = {
  additionalClassNames?: string;
};

function LayoutHelper({ additionalClassNames = "" }: LayoutHelperProps) {
  return (
    <div className={clsx("-rotate-90 flex-none", additionalClassNames)}>
      <div className="relative rounded-[1px] size-full">
        <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-[-0.5px] pointer-events-none rounded-[1.5px]" />
      </div>
    </div>
  );
}
type PlusProps = {
  className?: string;
  color?: "Default" | "Red" | "Gold" | "Purple" | "Green";
  onDark?: boolean;
  state?: "Default" | "Hover" | "Disabled" | "Selected";
  variant?: "Tertiary" | "Primary" | "Destructive";
};

function Plus({ className, color = "Default", onDark = false, state = "Default", variant = "Tertiary" }: PlusProps) {
  const isDestructiveAndDefaultAndRedAndNotOnDark = variant === "Destructive" && state === "Default" && color === "Red" && !onDark;
  const isDestructiveAndDisabledAndDefaultAndNotOnDark = variant === "Destructive" && state === "Disabled" && color === "Default" && !onDark;
  const isDestructiveAndHoverAndDefaultAndNotOnDark = variant === "Destructive" && state === "Hover" && color === "Default" && !onDark;
  const isPrimaryAndDefaultAndDefaultAndOnDark = variant === "Primary" && state === "Default" && color === "Default" && onDark;
  const isPrimaryAndDefaultAndGoldAndOnDark = variant === "Primary" && state === "Default" && color === "Gold" && onDark;
  const isPrimaryAndDefaultAndGreenAndOnDark = variant === "Primary" && state === "Default" && color === "Green" && onDark;
  const isPrimaryAndDefaultAndPurpleAndOnDark = variant === "Primary" && state === "Default" && color === "Purple" && onDark;
  const isPrimaryAndDisabledAndDefaultAndNotOnDark = variant === "Primary" && state === "Disabled" && color === "Default" && !onDark;
  return (
    <div className={className || "overflow-clip relative size-[16px]"}>
      <div className="absolute inset-[17.71%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.333 10.333">
          <path d={isPrimaryAndDefaultAndGreenAndOnDark ? svgPaths.p304ed100 : isPrimaryAndDisabledAndDefaultAndNotOnDark || isDestructiveAndDefaultAndRedAndNotOnDark || isDestructiveAndHoverAndDefaultAndNotOnDark || isDestructiveAndDisabledAndDefaultAndNotOnDark || isPrimaryAndDefaultAndDefaultAndOnDark || isPrimaryAndDefaultAndGoldAndOnDark || isPrimaryAndDefaultAndPurpleAndOnDark ? svgPaths.p33d7e480 : svgPaths.p41773f0} fill={isPrimaryAndDefaultAndGreenAndOnDark ? "var(--fill-0, #008533)" : isPrimaryAndDefaultAndPurpleAndOnDark ? "var(--fill-0, #602FA0)" : isPrimaryAndDefaultAndGoldAndOnDark ? "var(--fill-0, #A36D00)" : isPrimaryAndDefaultAndDefaultAndOnDark ? "var(--fill-0, white)" : isDestructiveAndDisabledAndDefaultAndNotOnDark ? "var(--fill-0, #F99D99)" : isDestructiveAndHoverAndDefaultAndNotOnDark ? "var(--fill-0, #7B1A15)" : isDestructiveAndDefaultAndRedAndNotOnDark ? "var(--fill-0, #CD2C23)" : isPrimaryAndDisabledAndDefaultAndNotOnDark ? "var(--fill-0, #84C6EA)" : variant === "Primary" && state === "Selected" && color === "Default" && !onDark ? "var(--fill-0, #012639)" : variant === "Primary" && state === "Hover" && color === "Default" && !onDark ? "var(--fill-0, #003A5A)" : variant === "Primary" && state === "Default" && color === "Default" && !onDark ? "var(--fill-0, #006296)" : variant === "Tertiary" && state === "Disabled" && color === "Default" && !onDark ? "var(--fill-0, #B7BBC2)" : variant === "Tertiary" && state === "Hover" && color === "Default" && !onDark ? "var(--fill-0, #1B1C1E)" : "var(--fill-0, #60666E)"} id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function VerticalMenuCentralize() {
  return (
    <div className="bg-white relative shadow-[0px_26px_26px_0px_rgba(27,28,30,0.01),0px_14px_14px_0px_rgba(27,28,30,0.04),0px_6px_10px_0px_rgba(27,28,30,0.07),0px_2px_6px_0px_rgba(27,28,30,0.1)] size-full" data-name="Vertical-menu-centralize">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative size-full">
          <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Menu">
            <div className="flex flex-col items-center size-full">
              <div className="content-stretch flex flex-col gap-[24px] items-center pb-[16px] pt-[24px] relative size-full">
                <div className="bg-[#006296] relative rounded-[16px] shadow-[0px_6px_6px_0px_rgba(27,28,30,0.01),0px_5px_5px_0px_rgba(27,28,30,0.04),0px_2px_4px_0px_rgba(27,28,30,0.07),0px_0px_4px_0px_rgba(27,28,30,0.1)] shrink-0" data-name="Button/Primary/Default/Medium/True/False">
                  <div className="flex flex-row items-center justify-center size-full">
                    <div className="content-stretch flex items-center justify-center p-[8px] relative">
                      <Plus className="overflow-clip relative shrink-0 size-[16px]" onDark variant="Primary" />
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Navigation Items">
                  <NavigationItemsNavButtonVerticalMenuCentralize>
                    <Content>
                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="dashboard">
                        <div className="absolute flex inset-0 items-center justify-center">
                          <div className="flex-none rotate-90 size-[16px]">
                            <div className="overflow-clip relative size-full" data-name="layout">
                              <div className="absolute flex inset-[12.5%_12.5%_56.25%_12.5%] items-center justify-center">
                                <LayoutHelper additionalClassNames="h-[12px] w-[5px]" />
                              </div>
                              <div className="absolute flex inset-[56.25%_56.25%_12.5%_12.5%] items-center justify-center">
                                <LayoutHelper additionalClassNames="size-[5px]" />
                              </div>
                              <div className="absolute flex inset-[56.25%_12.5%_12.5%_56.25%] items-center justify-center">
                                <LayoutHelper additionalClassNames="size-[5px]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Dashboard
                      </p>
                    </Content>
                  </NavigationItemsNavButtonVerticalMenuCentralize>
                  <NavigationItemsNavButtonVerticalMenuCentralize>
                    <Content>
                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="briefcase">
                        <div className="absolute inset-[9.38%_5.21%]" data-name="Vector">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.3333 13">
                            <path clipRule="evenodd" d={svgPaths.p32211d00} fill="var(--fill-0, #003A5A)" fillRule="evenodd" id="Vector" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Folder
                      </p>
                    </Content>
                  </NavigationItemsNavButtonVerticalMenuCentralize>
                  <div className="bg-[#e0f0f9] h-[56px] relative rounded-[8px] shrink-0 w-[72px]" data-name="Nav-button-vertical-menu-centralize">
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#e0f0f9] content-stretch flex flex-col gap-[2px] h-[56px] items-center justify-center left-1/2 px-[10px] py-[8px] rounded-[8px] top-1/2 w-[72px]" data-name="Item">
                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="check">
                        <div className="absolute inset-[21.88%_13.54%_26.04%_13.54%]" data-name="Vector">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 8.33333">
                            <path clipRule="evenodd" d={svgPaths.p7d96c00} fill="var(--fill-0, #003A5A)" fillRule="evenodd" id="Vector" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[16px] relative shrink-0 text-[#003a5a] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Tasks
                      </p>
                    </div>
                  </div>
                  <NavigationItemsNavButtonVerticalMenuCentralize>
                    <Content>
                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="file">
                        <div className="absolute inset-[5.21%_13.54%]" data-name="Vector">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 14.3333">
                            <path clipRule="evenodd" d={svgPaths.p3351b500} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Documents
                      </p>
                    </Content>
                  </NavigationItemsNavButtonVerticalMenuCentralize>
                  <NavigationItemsNavButtonVerticalMenuCentralize>
                    <Content>
                      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="search-results">
                        <div className="absolute h-[15.167px] left-[13.54%] right-0 top-[0.83px]" data-name="Vector">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.8339 15.167">
                            <path d={svgPaths.p7eb2400} fill="var(--fill-0, #60666E)" id="Vector" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Insights
                      </p>
                    </Content>
                  </NavigationItemsNavButtonVerticalMenuCentralize>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#dbdee1] h-full shrink-0 w-px" data-name="Divider" />
        </div>
      </div>
    </div>
  );
}