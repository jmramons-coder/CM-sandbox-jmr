import clsx from "clsx";
import svgPaths from "./svg-8ka7mtik4m";

function Text4({ text }: Text4Props) {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
      <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[9px] text-center tracking-[0.2px] w-[18px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">{text}</p>
      </div>
    </div>
  );
}
type ListItemText2Props = {
  text: string;
  text1: string;
};

function ListItemText2({ text, children, text1 }: React.PropsWithChildren<ListItemText2Props>) {
  return (
    <div className="content-stretch flex items-start relative w-full">
      <div className="flex-[1_0_0] h-[40px] min-h-px min-w-px relative" data-name=".[List Item master]">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <div className="relative shrink-0 size-[24px]" data-name="Avatar">
              <div className="content-stretch flex flex-col items-start relative size-full">
                <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[24px]" data-name=".[Avatar master]">
                  <div className="flex flex-col items-center justify-center size-full">
                    <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                      <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[9px] text-center tracking-[0.2px] w-[18px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <p className="leading-[20px]">{text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              {text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
type Text3Props = {
  text: string;
  additionalClassNames?: string;
};

function Text3({ text, additionalClassNames = "" }: Text3Props) {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
        <div className="relative shrink-0 size-[24px]" data-name="Checkbox Only">
          <CheckboxOnlyMaster additionalClassNames="size-[24px]" />
        </div>
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          {text}
        </p>
      </div>
    </div>
  );
}
type Text2Props = {
  text: string;
  additionalClassNames?: string;
};

function Text2({ text, additionalClassNames = "" }: Text2Props) {
  return (
    <div className={clsx("content-stretch flex items-start relative w-full", additionalClassNames)}>
      <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
        <Text3 text={text} />
      </div>
    </div>
  );
}
type CheckboxOnlyMasterProps = {
  additionalClassNames?: string;
};

function CheckboxOnlyMaster({ additionalClassNames = "" }: CheckboxOnlyMasterProps) {
  return (
    <div className={clsx("-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[4px] top-1/2", additionalClassNames)}>
      <div className="overflow-clip rounded-[inherit] size-full" />
      <div aria-hidden="true" className="absolute border border-[#60666e] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function CheckboxOnly() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <CheckboxOnlyMaster additionalClassNames="size-[16px]" />
    </div>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
        <CheckboxOnly />
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          {text}
        </p>
      </div>
    </div>
  );
}
type ListItemText1Props = {
  text: string;
};

function ListItemText1({ text }: ListItemText1Props) {
  return (
    <div className="content-stretch flex items-start relative w-full">
      <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
        <Text1 text={text} />
      </div>
    </div>
  );
}

function Helper1() {
  return (
    <ListItemHelper1 text="Canada" text1="Option">
      <g id="Group">
        <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
        <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
        <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
        <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
      </g>
    </ListItemHelper1>
  );
}
type ListItemHelper1Props = {
  text: string;
  text1: string;
};

function ListItemHelper1({ text, text1, children }: React.PropsWithChildren<ListItemHelper1Props>) {
  return (
    <div className="content-stretch flex items-start relative w-full">
      <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
            <div className="relative shrink-0 size-[16px]" data-name="Flags">
              <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                    {children}
                  </svg>
                </div>
              </div>
            </div>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              {text}
            </p>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              {text1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Helper() {
  return (
    <ListItemHelper text="Option" text1="Option">
      <g id="Group">
        <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
        <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
        <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
        <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
      </g>
    </ListItemHelper>
  );
}
type ListItemHelperProps = {
  text: string;
  text1: string;
};

function ListItemHelper({ text, text1, children }: React.PropsWithChildren<ListItemHelperProps>) {
  return (
    <div className="content-stretch flex items-start relative w-full">
      <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <div className="relative shrink-0 size-[16px]" data-name="Flags">
              <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                    {children}
                  </svg>
                </div>
              </div>
            </div>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              {text}
            </p>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              {text1}
            </p>
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
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          {text}
        </p>
      </div>
    </div>
  );
}
type ListItemTextProps = {
  text: string;
};

function ListItemText({ text }: ListItemTextProps) {
  return (
    <div className="content-stretch flex items-start relative w-full">
      <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
        <Text text={text} />
      </div>
    </div>
  );
}
type ScrollBarProps = {
  className?: string;
  orientation?: "Horizontal" | "Vertical";
};

function ScrollBar({ className, orientation = "Vertical" }: ScrollBarProps) {
  const isHorizontal = orientation === "Horizontal";
  return (
    <div className={className || `relative ${isHorizontal ? "" : "h-[100px] w-[8px]"}`}>
      {orientation === "Vertical" && <div className="absolute bg-[#878f9a] bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />}
      {isHorizontal && (
        <div className="flex flex-col items-center size-full">
          <div className="content-stretch flex flex-col items-center relative">
            <div className="bg-[#878f9a] h-[8px] rounded-[4px] shrink-0 w-[70px]" data-name="Scroll Bar" />
          </div>
        </div>
      )}
    </div>
  );
}
type ListItemProps = {
  className?: string;
  mobile?: boolean;
  state?: "Default" | "Hover" | "Selected" | "Hover-selected" | "Focus-selected" | "Focus" | "Disabled";
  type?: "Single select" | "Multiselect" | "International phone" | "Avatar" | "2 lines" | "2 lines + Avatar";
};

function ListItem({ className, mobile = false, state = "Default", type = "Single select" }: ListItemProps) {
  if (mobile && type === "Single select" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Single select, State=Default">
        <ListItemText text="Option" />
      </div>
    );
  }
  if (!mobile && type === "International phone" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=International phone, State=Default">
        <Helper />
      </div>
    );
  }
  if (mobile && type === "International phone" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=International phone, State=Default">
        <Helper1 />
      </div>
    );
  }
  if (!mobile && type === "Multiselect" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Multiselect, State=Default">
        <ListItemText1 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Multiselect" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Multiselect, State=Default">
        <Text2 text="Option" />
      </div>
    );
  }
  if (!mobile && type === "Avatar" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Avatar, State=Default">
        <ListItemText2 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Avatar" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Avatar, State=Default">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[56px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[24px]">WW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines + Avatar" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines + Avatar, State=Default">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines + Avatar" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines + Avatar, State=Default">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines, State=Default">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines" && state === "Default") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines, State=Default">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Single select" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Single select, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="h-[32px] relative shrink-0 w-[196px]" data-name=".[List Item master]">
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
    );
  }
  if (mobile && type === "Single select" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Single select, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <ListItemText text="Option" />
      </div>
    );
  }
  if (!mobile && type === "International phone" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=International phone, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <Helper />
      </div>
    );
  }
  if (mobile && type === "International phone" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=International phone, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <Helper1 />
      </div>
    );
  }
  if (!mobile && type === "Multiselect" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Multiselect, State=Selected">
        <ListItemText1 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Multiselect" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Multiselect, State=Selected">
        <Text2 text="Option" />
      </div>
    );
  }
  if (!mobile && type === "Avatar" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Avatar, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <ListItemText2 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Avatar" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Avatar, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[56px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[24px]">WW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines + Avatar" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines + Avatar, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines + Avatar" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines + Avatar, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines" && state === "Selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines, State=Selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Single select" && state === "Hover") {
    return (
      <button className={className || "block cursor-pointer h-[32px] relative w-[198px]"} data-name="Mobile=False, Type=Single select, State=Hover">
        <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0" data-name=".[List Item master]">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                Option
              </p>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (mobile && type === "Single select" && state === "Hover") {
    return (
      <button className={className || "cursor-pointer relative w-[198px]"} data-name="Mobile=True, Type=Single select, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="bg-black h-[48px] relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (!mobile && type === "International phone" && state === "Hover") {
    return (
      <div className={className || "bg-[rgba(0,0,0,0.1)] h-[32px] relative w-[198px]"} data-name="Mobile=False, Type=International phone, State=Hover">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <div className="relative shrink-0 size-[16px]" data-name="Flags">
              <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                    <g id="Group">
                      <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
                      <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
                      <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
                      <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Option
            </p>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Option
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "International phone" && state === "Hover") {
    return (
      <div className={className || "bg-black relative w-[198px]"} data-name="Mobile=True, Type=International phone, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="h-[48px] relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0 size-[16px]" data-name="Flags">
                  <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                    <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                        <g id="Group">
                          <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
                          <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
                          <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
                          <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Canada
                </p>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Multiselect" && state === "Hover") {
    return (
      <button className={className || "bg-[rgba(0,0,0,0.1)] block cursor-pointer h-[32px] relative w-[198px]"} data-name="Mobile=False, Type=Multiselect, State=Hover">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <CheckboxOnly />
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Option
            </p>
          </div>
        </div>
      </button>
    );
  }
  if (mobile && type === "Multiselect" && state === "Hover") {
    return (
      <button className={className || "bg-black cursor-pointer relative w-[198px]"} data-name="Mobile=True, Type=Multiselect, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="h-[48px] relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0 size-[24px]" data-name="Checkbox Only">
                  <CheckboxOnlyMaster additionalClassNames="size-[24px]" />
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (!mobile && type === "Avatar" && state === "Hover") {
    return (
      <button className={className || "bg-[rgba(0,0,0,0.1)] block cursor-pointer h-[40px] relative w-[198px]"} data-name="Mobile=False, Type=Avatar, State=Hover">
        <div className="absolute inset-[-12.5%_0]" data-name=".[List Item master]">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
              <div className="relative shrink-0 size-[24px]" data-name="Avatar">
                <div className="content-stretch flex flex-col items-start relative size-full">
                  <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[24px]" data-name=".[Avatar master]">
                    <div className="flex flex-col items-center justify-center size-full">
                      <Text4 text="WW" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                Option
              </p>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (mobile && type === "Avatar" && state === "Hover") {
    return (
      <button className={className || "bg-black cursor-pointer relative w-[198px]"} data-name="Mobile=True, Type=Avatar, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="h-[56px] relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[24px]">WW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (!mobile && type === "2 lines + Avatar" && state === "Hover") {
    return (
      <button className={className || "bg-[rgba(0,0,0,0.1)] cursor-pointer relative w-[198px]"} data-name="Mobile=False, Type=2 lines + Avatar, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] text-left tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (mobile && type === "2 lines + Avatar" && state === "Hover") {
    return (
      <button className={className || "bg-black cursor-pointer relative w-[198px]"} data-name="Mobile=True, Type=2 lines + Avatar, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] text-left tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (!mobile && type === "2 lines" && state === "Hover") {
    return (
      <button className={className || "bg-[rgba(0,0,0,0.1)] cursor-pointer relative w-[198px]"} data-name="Mobile=False, Type=2 lines, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] text-left tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (mobile && type === "2 lines" && state === "Hover") {
    return (
      <button className={className || "bg-black cursor-pointer relative w-[198px]"} data-name="Mobile=True, Type=2 lines, State=Hover">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] text-left tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
  if (!mobile && type === "Single select" && state === "Hover-selected") {
    return (
      <button className={className || "cursor-pointer h-[32px] relative w-[198px]"} data-name="Mobile=False, Type=Single select, State=Hover-selected">
        <div className="overflow-clip relative rounded-[inherit] size-full">
          <div className="-translate-y-1/2 absolute bg-[rgba(0,0,0,0.1)] h-[32px] left-0 right-0 top-1/2" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
      </button>
    );
  }
  if (mobile && type === "Single select" && state === "Hover-selected") {
    return (
      <button className={className || "cursor-pointer relative w-[198px]"} data-name="Mobile=True, Type=Single select, State=Hover-selected">
        <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
          <div className="bg-black h-[48px] relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] text-left tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
      </button>
    );
  }
  if (!mobile && type === "International phone" && state === "Hover-selected") {
    return (
      <div className={className || "bg-[rgba(0,0,0,0.1)] h-[32px] relative w-[198px]"} data-name="Mobile=False, Type=International phone, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
            <div className="relative shrink-0 size-[16px]" data-name="Flags">
              <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                    <g id="Group">
                      <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
                      <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
                      <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
                      <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Option
            </p>
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Option
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "International phone" && state === "Hover-selected") {
    return (
      <div className={className || "bg-black h-[48px] relative w-[198px]"} data-name="Mobile=True, Type=International phone, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex flex-col items-start justify-between relative size-full">
          <div className="h-[48px] relative shrink-0 w-full" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0 size-[16px]" data-name="Flags">
                  <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                    <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                        <g id="Group">
                          <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
                          <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
                          <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
                          <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Canada
                </p>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Multiselect" && state === "Hover-selected") {
    return (
      <div className={className || "bg-[rgba(0,0,0,0.1)] relative w-[198px]"} data-name="Mobile=False, Type=Multiselect, State=Hover-selected">
        <ListItemText1 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Multiselect" && state === "Hover-selected") {
    return (
      <div className={className || "bg-black relative w-[198px]"} data-name="Mobile=True, Type=Multiselect, State=Hover-selected">
        <Text2 text="Option" additionalClassNames="justify-between" />
      </div>
    );
  }
  if (!mobile && type === "Avatar" && state === "Hover-selected") {
    return (
      <div className={className || "bg-[rgba(0,0,0,0.1)] relative w-[198px]"} data-name="Mobile=False, Type=Avatar, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <ListItemText2 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Avatar" && state === "Hover-selected") {
    return (
      <div className={className || "bg-black relative w-[198px]"} data-name="Mobile=True, Type=Avatar, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start justify-between relative w-full">
          <div className="flex-[1_0_0] h-[56px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[24px]">WW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines + Avatar" && state === "Hover-selected") {
    return (
      <div className={className || "bg-[rgba(0,0,0,0.1)] relative w-[198px]"} data-name="Mobile=False, Type=2 lines + Avatar, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines + Avatar" && state === "Hover-selected") {
    return (
      <div className={className || "bg-black relative w-[198px]"} data-name="Mobile=True, Type=2 lines + Avatar, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start justify-between relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines" && state === "Hover-selected") {
    return (
      <div className={className || "bg-[rgba(0,0,0,0.1)] relative w-[198px]"} data-name="Mobile=False, Type=2 lines, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines" && state === "Hover-selected") {
    return (
      <div className={className || "bg-black relative w-[198px]"} data-name="Mobile=True, Type=2 lines, State=Hover-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start justify-between relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Single select" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Single select, State=Focus">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
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
    );
  }
  if (mobile && type === "Single select" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Single select, State=Focus">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
            <Text text="Option" />
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "International phone" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=International phone, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <Helper />
      </div>
    );
  }
  if (mobile && type === "International phone" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=International phone, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <Helper1 />
      </div>
    );
  }
  if (!mobile && type === "Multiselect" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Multiselect, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <ListItemText1 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Multiselect" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Multiselect, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <Text2 text="Option" />
      </div>
    );
  }
  if (!mobile && type === "Avatar" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Avatar, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <ListItemText2 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Avatar" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Avatar, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[56px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[24px]">WW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines + Avatar" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines + Avatar, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines + Avatar" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines + Avatar, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines" && state === "Focus") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines, State=Focus">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Single select" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Single select, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
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
    );
  }
  if (mobile && type === "Single select" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Single select, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
            <Text text="Option" />
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "International phone" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=International phone, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                <div className="relative shrink-0 size-[16px]" data-name="Flags">
                  <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                    <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                        <g id="Group">
                          <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
                          <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
                          <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
                          <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "International phone" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=International phone, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0 size-[16px]" data-name="Flags">
                  <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                    <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                        <g id="Group">
                          <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
                          <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
                          <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
                          <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Canada
                </p>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Multiselect" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Multiselect, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <Text1 text="Option" />
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "Multiselect" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Multiselect, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <Text3 text="Option" />
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Avatar" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Avatar, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[40px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
                <div className="relative shrink-0 size-[24px]" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative size-full">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[24px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <Text4 text="WW" />
                      </div>
                    </div>
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
    );
  }
  if (mobile && type === "Avatar" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Avatar, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[56px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[24px]">WW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines + Avatar" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines + Avatar, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines + Avatar" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines + Avatar, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines" && state === "Focus-selected") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines, State=Focus-selected">
        <div aria-hidden="true" className="absolute border-2 border-[#006296] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div aria-hidden="true" className="absolute border-[#006296] border-l-4 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Single select" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Single select, State=Disabled">
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
    );
  }
  if (mobile && type === "Single select" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Single select, State=Disabled">
        <ListItemText text="Option" />
      </div>
    );
  }
  if (!mobile && type === "International phone" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=International phone, State=Disabled">
        <Helper />
      </div>
    );
  }
  if (mobile && type === "International phone" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=International phone, State=Disabled">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0 size-[16px]" data-name="Flags">
                  <div className="absolute contents inset-[17.19%_0_14.06%_0]" data-name="Group">
                    <div className="absolute inset-[17.19%_0_14.06%_0]" data-name="Group">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
                        <g id="Group">
                          <path d="M4 0H12V11H4V0Z" fill="var(--fill-0, #F0F0F0)" id="Vector" />
                          <path d={svgPaths.p320f0480} fill="var(--fill-0, #EC1C24)" id="Vector_2" />
                          <path d={svgPaths.p12001500} fill="var(--fill-0, #EC1C24)" id="Vector_3" />
                          <path clipRule="evenodd" d={svgPaths.p356ad500} fill="var(--fill-0, #EC1C24)" fillRule="evenodd" id="Vector_4" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Canada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "Multiselect" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Multiselect, State=Disabled">
        <ListItemText1 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Multiselect" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Multiselect, State=Disabled">
        <Text2 text="Option" />
      </div>
    );
  }
  if (!mobile && type === "Avatar" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Avatar, State=Disabled">
        <ListItemText2 text="Option" />
      </div>
    );
  }
  if (mobile && type === "Avatar" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=Avatar, State=Disabled">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] h-[56px] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
                <div className="relative shrink-0" data-name="Avatar">
                  <div className="content-stretch flex flex-col items-start relative">
                    <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                          <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[14px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <p className="leading-[24px]">WW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Option
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines + Avatar" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines + Avatar, State=Disabled">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines + Avatar" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines + Avatar, State=Disabled">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && type === "2 lines" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=2 lines, State=Disabled">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[4px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start pt-[4px] relative">
                      <div className="h-[32px] relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col h-full items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[32px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold h-[19px] justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] text-center tracking-[0.2px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[16px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && type === "2 lines" && state === "Disabled") {
    return (
      <div className={className || "relative w-[198px]"} data-name="Mobile=True, Type=2 lines, State=Disabled">
        <div className="content-stretch flex items-start relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name=".[List Item master]">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[12px] relative w-full">
                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0" data-name="Avatar">
                    <div className="content-stretch flex h-full items-start py-[4px] relative">
                      <div className="relative shrink-0" data-name="Avatar">
                        <div className="content-stretch flex flex-col items-start relative">
                          <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0 size-[40px]" data-name=".[Avatar master]">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
                                <div className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#60666e] text-[16px] text-center tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  <p className="leading-[24px]">WW</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
                  <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[16px] tracking-[0.2px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Option
                  </p>
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Additional line">
                    <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#60666e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Additional text
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={className || "relative w-[198px]"} data-name="Mobile=False, Type=Single select, State=Default">
      <div className="content-stretch flex items-start relative w-full">
        <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[List Item master]">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative size-full">
              <p className="flex-[1_0_0] font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#1b1c1e] text-[14px] tracking-[0.2px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Option
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Listbox() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Listbox">
      <div className="min-w-[240px] relative rounded-[4px] shrink-0 w-full" data-name=".[Filtering Listbox master]">
        <div className="min-w-[inherit] overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col items-start min-w-[inherit] relative w-full">
            <div className="bg-white content-stretch flex h-[244px] items-start overflow-clip pr-[16px] relative shadow-[0px_51px_51px_4px_rgba(0,0,0,0.01),0px_29px_29px_2px_rgba(27,28,30,0.04),0px_13px_13px_1px_rgba(27,28,30,0.07),0px_3px_6px_0px_rgba(27,28,30,0.1)] shrink-0 w-full" data-name="Listbox">
              <div className="flex-[1_0_0] min-h-px min-w-px mr-[-16px] relative rounded-[4px] self-stretch" data-name="List">
                <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex flex-col gap-[4px] items-center py-[4px] relative size-full">
                    <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0 w-full" data-name="Options">
                      <div className="relative shrink-0 w-full" data-name="Menu Item">
                        <div className="content-stretch flex items-start relative w-full">
                          <div className="flex-[1_0_0] h-[32px] min-h-px min-w-px relative" data-name=".[Listbox item master]/Group Label">
                            <div className="flex flex-col items-center justify-center size-full">
                              <div className="content-stretch flex flex-col items-center justify-center relative size-full">
                                <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Content">
                                  <div className="flex flex-row items-center size-full">
                                    <div className="content-stretch flex items-center pb-[4px] pt-[8px] px-[16px] relative size-full">
                                      <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#60666e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                        <p className="leading-[20px]">Select [...]</p>
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
                                <p className="flex-[1_0_0] font-['Open_Sans:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#1b1c1e] text-[14px] tracking-[0.2px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  Option
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ListItem className="relative shrink-0 w-full" />
                      <ListItem className="relative shrink-0 w-full" />
                      <ListItem className="relative shrink-0 w-full" />
                      <ListItem className="relative shrink-0 w-full" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mr-[-16px] relative self-stretch shrink-0" data-name="Scrollbar">
                <div className="content-stretch flex flex-col gap-[4px] h-full items-start p-[4px] relative">
                  <ScrollBar className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" />
                  <div className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" data-name="Invisible layer">
                    <div className="absolute bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />
                  </div>
                  <div className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" data-name="Invisible layer">
                    <div className="absolute bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />
                  </div>
                  <div className="flex-[1_0_0] min-h-px min-w-px relative w-[8px]" data-name="Invisible layer">
                    <div className="absolute bottom-0 left-0 rounded-[4px] top-0 w-[8px]" data-name="Scroll Bar" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_51px_51px_4px_rgba(0,0,0,0.01),0px_29px_29px_2px_rgba(27,28,30,0.04),0px_13px_13px_1px_rgba(27,28,30,0.07),0px_3px_6px_0px_rgba(27,28,30,0.1)]" />
      </div>
    </div>
  );
}