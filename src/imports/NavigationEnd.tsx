import clsx from "clsx";
import svgPaths from "./svg-v9frl7sg8p";
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("content-stretch flex items-center justify-center relative", additionalClassNames)}>
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
        {children}
      </div>
    </div>
  );
}

function Helper() {
  return (
    <ButtonButton>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
        <path clipRule="evenodd" d={svgPaths.p2ebee400} fill="var(--fill-0, #60666E)" fillRule="evenodd" id="Vector" />
      </svg>
    </ButtonButton>
  );
}

function ButtonButton({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative">
          <div className="bg-[rgba(255,255,255,0)] relative rounded-[9999px] shrink-0" data-name=".[Button master]">
            <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
            <div className="flex flex-row items-center justify-center size-full">
              <Wrapper additionalClassNames="p-[8px]">
                <div className="absolute inset-[17.71%]" data-name="Vector">
                  {children}
                </div>
              </Wrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NavigationEnd() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative size-full" data-name="Navigation-end">
      <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Dropdown">
        <button className="cursor-pointer h-[32px] relative shrink-0" data-name="Menu Button">
          <div className="content-stretch flex h-full items-start relative">
            <div className="relative shrink-0" data-name="Button">
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[4px] relative">
                  <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-left text-white tracking-[0.4px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[24px]">Language</p>
                  </div>
                  <div className="overflow-clip relative shrink-0 size-[16px]">
                    <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
                      <div className="absolute inset-[-12.5%_-6.25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                          <path d="M0.5 0.5L4.5 4.5L8.5 0.5" id="Vector" stroke={"Primary" === "Primary" && "Default" === "Default" && "Default" === "Green" && onDark ? "var(--stroke-0, #008533)" : "Primary" === "Primary" && "Default" === "Default" && "Default" === "Purple" && onDark ? "var(--stroke-0, #602FA0)" : "Primary" === "Primary" && "Default" === "Default" && "Default" === "Gold" && onDark ? "var(--stroke-0, #A36D00)" : "Primary" === "Primary" && "Default" === "Default" && "Default" === "Default" && onDark ? "var(--stroke-0, white)" : "Primary" === "Destructive" && "Default" === "Disabled" && "Default" === "Default" && !onDark ? "var(--stroke-0, #F99D99)" : "Primary" === "Destructive" && "Default" === "Hover" && "Default" === "Default" && !onDark ? "var(--stroke-0, #7B1A15)" : "Primary" === "Destructive" && "Default" === "Default" && "Default" === "Red" && !onDark ? "var(--stroke-0, #CD2C23)" : "Primary" === "Primary" && "Default" === "Disabled" && "Default" === "Default" && !onDark ? "var(--stroke-0, #84C6EA)" : "Primary" === "Primary" && "Default" === "Selected" && "Default" === "Default" && !onDark ? "var(--stroke-0, #012639)" : "Primary" === "Primary" && "Default" === "Hover" && "Default" === "Default" && !onDark ? "var(--stroke-0, #003A5A)" : "Primary" === "Primary" && "Default" === "Default" && "Default" === "Default" && !onDark ? "var(--stroke-0, #006296)" : "Primary" === "Tertiary" && "Default" === "Disabled" && "Default" === "Default" && !onDark ? "var(--stroke-0, #B7BBC2)" : "Primary" === "Tertiary" && "Default" === "Hover" && "Default" === "Default" && !onDark ? "var(--stroke-0, #1B1C1E)" : "var(--stroke-0, #60666E)"} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
        <div className="content-stretch flex items-center py-[8px] relative shrink-0" data-name="Divider">
          <div className="bg-[#e0f0f9] h-[16px] shrink-0 w-px" data-name="Divider" />
        </div>
      </div>
      <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Button">
        <Helper />
        <Helper />
        <Helper />
        <Helper />
      </div>
      <div className="bg-[#e0f0f9] h-[16px] shrink-0 w-px" data-name="Divider" />
      <div className="h-[32px] relative shrink-0" data-name="User Profile">
        <div className="content-stretch flex h-full items-start relative">
          <div className="relative rounded-[9999px] shrink-0" data-name=".(User Profile master]">
            <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-center justify-center pl-[4px] pr-[16px] py-[4px] relative">
                <div className="relative shrink-0 size-[24px]" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative size-full">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[24px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[9px] text-center tracking-[0.2px] w-[18px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[20px]">VR</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[20px]">Victor Ramon</p>
                </div>
                <Wrapper additionalClassNames="shrink-0">
                  <div className="absolute inset-[34.38%_21.88%]" data-name="Vector">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                      <path clipRule="evenodd" d={svgPaths.p29cba700} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
                    </svg>
                  </div>
                </Wrapper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}