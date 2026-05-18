import clsx from "clsx";
import svgPaths from "./svg-3d59592cvz";

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center justify-center relative">
      <div className="bg-white relative rounded-[74px] shrink-0" data-name="Base/Button">
        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative">
            <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Icon-start">
              {children}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[74px]" />
      </div>
    </div>
  );
}
type PageHeaderComponentsTabsNaviguationTextProps = {
  text: string;
};

function PageHeaderComponentsTabsNaviguationText({ text }: PageHeaderComponentsTabsNaviguationTextProps) {
  return (
    <div className="h-[40px] relative shrink-0">
      <div className="content-stretch flex flex-col h-full items-start relative">
        <div className="bg-[#fafafa] content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[12px] py-[8px] relative shrink-0" data-name="Label">
          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] text-center tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[24px]">{text}</p>
          </div>
        </div>
        <div className="bg-[rgba(132,198,234,0)] h-[4px] shrink-0 w-full" data-name="Highlight" />
      </div>
    </div>
  );
}
type PageHeaderComponentsTabsNaviguationProps = {
  text: string;
  text1: string;
};

function PageHeaderComponentsTabsNaviguation({ text, text1 }: PageHeaderComponentsTabsNaviguationProps) {
  return (
    <div className="h-[40px] relative shrink-0">
      <div className="content-stretch flex flex-col h-full items-start relative">
        <div className="bg-[#fafafa] content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[12px] py-[8px] relative shrink-0" data-name="Label">
          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] text-center tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[24px]">{text}</p>
          </div>
          <div className="relative shrink-0 size-[16px]" data-name="Badge">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#dbdee1] content-stretch flex items-start left-1/2 px-[4.5px] rounded-[8px] top-1/2" data-name="Shape">
              <div aria-hidden="true" className="absolute border border-[#b7bbc2] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-black text-center tracking-[0.24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[16px]">{text1}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[rgba(132,198,234,0)] h-[4px] shrink-0 w-full" data-name="Highlight" />
      </div>
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
          <path d={svgPaths.padc050} fill="var(--fill-0, #B7BBC2)" id="Vector" stroke="var(--stroke-0, #B7BBC2)" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
type PageHeaderVectorProps = {
  additionalClassNames?: string;
};

function PageHeaderVector({ additionalClassNames = "" }: PageHeaderVectorProps) {
  return <Helper additionalClassNames={clsx("absolute left-[45.83%] right-[45.83%]", additionalClassNames)} />;
}

function PageHeaderMenuButton({ children }: React.PropsWithChildren<{}>) {
  return (
    <button className="cursor-pointer relative shrink-0 size-[32px]">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end relative size-full">
          <div className="relative shrink-0" data-name="Button">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center relative">
                <div className="relative shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)] shrink-0" data-name="Base/Button-variants">
                  <div className="flex flex-row items-center justify-center size-full">
                    <div className="content-stretch flex items-center justify-center relative">
                      <div className="bg-white relative rounded-[74px] shrink-0" data-name="Base/Button">
                        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative">
                            <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Icon-start">
                              {children}
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[74px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function PageHeader() {
  return (
    <div className="bg-[rgba(250,250,250,0.98)] relative size-full" data-name="Page header">
      <div aria-hidden="true" className="absolute border-[#dbdee1] border-b border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-px pl-[32px] pr-[24px] pt-[20px] relative size-full">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Content">
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="top">
            <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Content">
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Tag and Title">
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Tags">
                  <div className="relative shrink-0" data-name="Tag">
                    <div className="flex flex-row items-center justify-center size-full">
                      <div className="content-stretch flex items-center justify-center relative">
                        <div className="bg-[#f1f2f2] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
                          <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[4px]" />
                          <div className="flex flex-row items-center justify-center size-full">
                            <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                              <div className="content-stretch flex flex-col h-[18px] items-center justify-center pl-[4px] pr-[2px] relative shrink-0" data-name="Content">
                                <div className="content-stretch flex gap-[4px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1b1c1e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                      Claims
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative shrink-0" data-name="Status">
                    <div className="content-stretch flex items-start relative">
                      <div className="h-[18px] relative shrink-0" data-name="Status active">
                        <div className="content-stretch flex h-full items-start relative">
                          <div className="bg-[#f6fbf8] h-full relative rounded-[4px] shrink-0" data-name="Base/Lozenge">
                            <div aria-hidden="true" className="absolute border border-[#008533] border-solid inset-0 pointer-events-none rounded-[4px]" />
                            <div className="flex flex-row items-center size-full">
                              <div className="content-stretch flex gap-[4px] h-full items-center px-[4px] relative">
                                <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#004f1e] text-[11px] text-center tracking-[0.24px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">Active</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] min-w-full relative shrink-0 text-[24px] text-black tracking-[0.2px] w-[min-content]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[32px]">271-2446</p>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-end min-h-px min-w-px relative" data-name="Buttons-end">
                <PageHeaderMenuButton>
                  <div className="overflow-clip relative shrink-0 size-[16px]" data-name="plus">
                    <div className="absolute bottom-[20.83%] left-1/2 right-1/2 top-[20.83%]" data-name="Vector">
                      <div className="absolute inset-[-5.36%_-0.5px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 10.3333">
                          <path d="M0.5 0.5V9.83333" id="Vector" stroke="var(--stroke-0, #006296)" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-1/2 left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
                      <div className="absolute inset-[-0.5px_-5.36%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 1">
                          <path d="M0.5 0.5H9.83333" id="Vector" stroke="var(--stroke-0, #006296)" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </PageHeaderMenuButton>
                <PageHeaderMenuButton>
                  <div className="relative shrink-0 size-[16px]" data-name="plus">
                    <div className="absolute inset-[0_6.25%_0_0]" data-name="Vector">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 16">
                        <path d={svgPaths.pd78fe00} fill="var(--fill-0, #60666E)" id="Vector" stroke="var(--stroke-0, #006296)" />
                      </svg>
                    </div>
                  </div>
                </PageHeaderMenuButton>
                <div className="relative shrink-0" data-name="Alerts">
                  <div className="flex flex-row items-center justify-center size-full">
                    <div className="content-stretch flex items-center justify-center relative">
                      <div className="relative shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)] shrink-0" data-name="Base/Button-variants">
                        <div className="flex flex-row items-center justify-center size-full">
                          <Wrapper>
                            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="plus">
                              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                                <g id="flag">
                                  <path d={svgPaths.p1b661780} id="Vector" stroke="var(--stroke-0, #006296)" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M2.66667 14.6667V10" id="Vector_2" stroke="var(--stroke-0, #006296)" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                              </svg>
                            </div>
                          </Wrapper>
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
                          <div className="content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative">
                            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon-start">
                              <div className="absolute inset-[17.71%]" data-name="Vector">
                                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
                                  <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white tracking-[0.4px] uppercase whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                              <p className="leading-[16px]">Button</p>
                            </div>
                            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon-end">
                              <div className="absolute inset-[34.38%_21.88%]" data-name="Vector">
                                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                                  <path clipRule="evenodd" d={svgPaths.p29cba700} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative shrink-0" data-name="Kebab">
                  <div className="flex flex-row items-center justify-center size-full">
                    <div className="content-stretch flex items-center justify-center relative">
                      <div className="relative shrink-0" data-name="Base/Button-variants">
                        <div className="flex flex-row items-center justify-center size-full">
                          <div className="content-stretch flex items-center justify-center relative">
                            <div className="bg-[rgba(255,255,255,0)] relative rounded-[74px] shrink-0" data-name="Base/Button">
                              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                                <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative">
                                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Icon-start">
                                    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="plus">
                                      <Helper additionalClassNames="absolute inset-[45.83%]" />
                                      <PageHeaderVector additionalClassNames="bottom-3/4 top-[16.67%]" />
                                      <PageHeaderVector additionalClassNames="bottom-[16.67%] top-3/4" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[74px]" />
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
        <div className="relative shrink-0" data-name="Tabs-centralize">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center relative">
              <button className="cursor-pointer h-[40px] relative shrink-0" data-name="Components Tabs Naviguation">
                <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex flex-col h-full items-center relative">
                    <div className="bg-[#fafafa] content-stretch flex gap-[4px] items-center justify-center overflow-clip pb-[4px] pt-[8px] px-[12px] relative shrink-0" data-name="Label">
                      <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#1b1c1e] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <p className="leading-[24px]">Information</p>
                      </div>
                    </div>
                    <div className="bg-[#006296] h-[4px] shrink-0 w-full" data-name="Highlight" />
                  </div>
                </div>
              </button>
              <PageHeaderComponentsTabsNaviguation text="Tasks" text1="1" />
              <PageHeaderComponentsTabsNaviguation text="Documents" text1="1" />
              <PageHeaderComponentsTabsNaviguation text="Requirements" text1="1" />
              <PageHeaderComponentsTabsNaviguationText text="Notes" />
              <PageHeaderComponentsTabsNaviguationText text="Business events" />
              <PageHeaderComponentsTabsNaviguationText text="Activity history" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}