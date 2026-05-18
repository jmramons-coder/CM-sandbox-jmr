import clsx from "clsx";
import svgPaths from "./svg-cttfrj5p5e";

function Helper1() {
  return (
    <svg fill="none" preserveAspectRatio="none" viewBox="0 0 9 9" className="absolute block size-full">
      <path d={svgPaths.p1ad20000} fill="var(--fill-0, #60666E)" id="Vector" />
    </svg>
  );
}

function Helper() {
  return (
    <div className="flex flex-row items-center justify-center size-full">
      <div className="content-stretch flex items-center justify-center relative">
        <TagTagMasterText text="Tag 1" />
      </div>
    </div>
  );
}
type TextTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TextText({ text, additionalClassNames = "" }: TextTextProps) {
  return (
    <div className={clsx("content-stretch flex gap-[4px] items-center relative shrink-0", additionalClassNames)}>
      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1b1c1e] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
    </div>
  );
}
type ContentTextProps = {
  text: string;
};

function ContentText({ text }: ContentTextProps) {
  return (
    <div className="content-stretch flex flex-col h-[18px] items-center justify-center pl-[4px] pr-[2px] relative shrink-0">
      <div className="content-stretch flex gap-[4px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
        <TextText text={text} />
      </div>
    </div>
  );
}
type TagTagMasterTextProps = {
  text: string;
};

function TagTagMasterText({ text, children }: React.PropsWithChildren<TagTagMasterTextProps>) {
  return (
    <div className="bg-[#f1f2f2] relative rounded-[4px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pr-[2px] relative">
          <ContentText text={text} />
          <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
            <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
              <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                  <div className="absolute inset-[21.88%]" data-name="Vector">
                    <svg fill="none" preserveAspectRatio="none" viewBox="0 0 9 9" className="absolute block size-full">
                      <path d={svgPaths.p1ad20000} fill="var(--fill-0, #60666E)" id="Vector" />
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
type TagProps = {
  className?: string;
  color?: "Default" | "Purple" | "Gold" | "Red" | "Turquoise" | "Violet" | "Lime" | "Orange" | "Blue" | "Green Forest" | "Magenta";
  mobile?: boolean;
  removable?: boolean;
  size?: "Small" | "Medium";
  state?: "Default" | "Hover" | "Focus" | "Selected" | "Selected-hover" | "Selected-icon-hover" | "Icon-hover" | "Icon-focus";
  variant?: "Default" | "Clickable" | "Colored" | "Expandable" | "Toggle" | "Expandable - Removable";
  withExtraLabel?: boolean;
};

function Tag({ className, color = "Default", mobile = false, removable = false, size = "Small", state = "Default", variant = "Default", withExtraLabel = false }: TagProps) {
  if (!mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Default, State=Default, Color=Default, Size=Small, With extra label=False, Removable=True">
        <Helper />
      </div>
    );
  }
  if (mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Default, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Default, State=Icon-focus, Color=Default, Size=Small, With extra label=False, Removable=True">
        <Helper />
      </div>
    );
  }
  if (mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Icon-focus, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Default, State=Icon-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <Helper />
      </div>
    );
  }
  if (mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Icon-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Default, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[24px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
                              <path d={svgPaths.p1ad20000} fill="var(--fill-0, #1B1C1E)" id="Vector" />
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
    );
  }
  if (mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Default, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Default, State=Icon-hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[24px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Icon-hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Default, State=Icon-focus, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Default, State=Icon-focus, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Medium" && withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Default, State=Default, Color=Default, Size=Medium, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Medium" && withExtraLabel && removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Default, State=Default, Color=Default, Size=Medium, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Medium" && withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Default, State=Icon-hover, Color=Default, Size=Medium, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[24px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Medium" && withExtraLabel && removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Default, State=Icon-hover, Color=Default, Size=Medium, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Medium" && withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Default, State=Icon-focus, Color=Default, Size=Medium, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Medium" && withExtraLabel && removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Default, State=Icon-focus, Color=Default, Size=Medium, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Small" && withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Default, State=Default, Color=Default, Size=Small, With extra label=True, Removable=True">
        <Helper />
      </div>
    );
  }
  if (mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Small" && withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Default, Color=Default, Size=Small, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Small" && withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Default, State=Icon-hover, Color=Default, Size=Small, With extra label=True, Removable=True">
        <Helper />
      </div>
    );
  }
  if (mobile && variant === "Default" && state === "Icon-hover" && color === "Default" && size === "Small" && withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Icon-hover, Color=Default, Size=Small, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Small" && withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Default, State=Icon-focus, Color=Default, Size=Small, With extra label=True, Removable=True">
        <Helper />
      </div>
    );
  }
  if (mobile && variant === "Default" && state === "Icon-focus" && color === "Default" && size === "Small" && withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Icon-focus, Color=Default, Size=Small, With extra label=True, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Default, State=Default, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Default, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[24px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Default" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Default, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Purple" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Purple, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#ebe6eb] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#38023b] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Purple" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Purple, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#ebe6eb] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#38023b] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Purple" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Purple, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#ebe6eb] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#38023b] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Purple" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Purple, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#ebe6eb] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#38023b] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Gold" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Gold, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#faf3e7] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#ce840c] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Gold" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Gold, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#faf3e7] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#ce840c] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Gold" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Gold, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#faf3e7] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#ce840c] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Gold" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Gold, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#faf3e7] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#ce840c] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Turquoise" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Turquoise, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e7f0f1] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#126773] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Turquoise" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Turquoise, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e7f0f1] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#126773] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Turquoise" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Turquoise, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#e7f0f1] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#126773] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Turquoise" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Turquoise, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e7f0f1] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#126773] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Violet" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Violet, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f0f7] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#766dab] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Violet" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Violet, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f0f7] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#766dab] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Violet" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Violet, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f0f7] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#766dab] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Violet" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Violet, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f0f7] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#766dab] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Lime" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Lime, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f2f5e8] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7b9c1d] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Lime" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Lime, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f2f5e8] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7b9c1d] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Lime" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Lime, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f2f5e8] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7b9c1d] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Lime" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Lime, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f2f5e8] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7b9c1d] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Orange" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Orange, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#faede6] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#cd4b00] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Orange" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Orange, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#faede6] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#cd4b00] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Orange" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Orange, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#faede6] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#cd4b00] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Orange" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Orange, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#faede6] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#cd4b00] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Blue" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Blue, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e7edf5] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#104697] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Blue" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Blue, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e7edf5] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#104697] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Blue" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Blue, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#e7edf5] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#104697] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Blue" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Blue, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e7edf5] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#104697] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Green Forest" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Green Forest, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e6edeb] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#064633] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Green Forest" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Green Forest, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e6edeb] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#064633] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Green Forest" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Green Forest, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#e6edeb] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#064633] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Green Forest" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Green Forest, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e6edeb] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#064633] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Magenta" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Magenta, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f2e9ef] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7e235a] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Magenta" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Magenta, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f2e9ef] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7e235a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Magenta" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Magenta, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f2e9ef] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7e235a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Magenta" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Magenta, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f2e9ef] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#7e235a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Red" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Red, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f3e6e6] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#960000] border-solid inset-0 pointer-events-none rounded-[4px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Colored" && state === "Default" && color === "Red" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Red, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f3e6e6] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#960000] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Colored" && state === "Default" && color === "Red" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Colored, State=Default, Color=Red, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f3e6e6] h-full relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#960000] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Colored" && state === "Default" && color === "Red" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Colored, State=Default, Color=Red, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f3e6e6] h-[32px] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#960000] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Clickable" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Clickable, State=Default, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Toggle" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Toggle, State=Default, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable, State=Default, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Clickable" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Clickable, State=Default, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Toggle" && state === "Focus" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Toggle, State=Focus, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border-2 border-[#84c6ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_0px_2px_#006296]" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Expandable" && state === "Focus" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable, State=Focus, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border-2 border-[#84c6ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_0px_2px_#006296]" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && variant === "Clickable" && state === "Focus" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Clickable, State=Focus, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border-2 border-[#84c6ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_0px_2px_#006296]" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Toggle" && state === "Hover" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Toggle, State=Hover, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[rgba(0,0,0,0.1)] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable" && state === "Hover" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable, State=Hover, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[rgba(0,0,0,0.1)] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Clickable" && state === "Hover" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Clickable, State=Hover, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-black relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Toggle" && state === "Selected" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Toggle, State=Selected, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Clickable" && state === "Selected" && color === "Default" && size === "Small" && !withExtraLabel && !removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Clickable, State=Selected, Color=Default, Size=Small, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[4px] relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Toggle" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Toggle, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[24px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Clickable" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Clickable, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[32px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Toggle" && state === "Hover" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Toggle, State=Hover, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[rgba(0,0,0,0.1)] h-[24px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Clickable" && state === "Hover" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Clickable, State=Hover, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-black h-[32px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Default, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Default" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Default, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Focus" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Focus, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Focus" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Focus, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Icon-focus" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Icon-focus, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Icon-focus" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Icon-focus, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[rgba(0,0,0,0.1)] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-black relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Icon-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Icon-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Icon-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Icon-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Selected-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Selected-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Selected-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Selected-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Selected-icon-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Selected-icon-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                  <ContentText text="Tag 1" />
                  <div className="content-stretch flex items-center justify-center px-[2px] py-[3px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[14px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[12px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Selected-icon-hover" && color === "Default" && size === "Small" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Selected-icon-hover, Color=Default, Size=Small, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center relative">
                  <div className="content-stretch flex flex-col items-center justify-center pl-[8px] pr-[4px] py-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[8px] h-[16px] items-center justify-center pb-[2px] relative shrink-0" data-name="Icon+Label">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Text">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Tag 1
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="x">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[24px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Default" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Default, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center py-px relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Icon-focus" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Icon-focus, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-full relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Icon-focus" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Icon-focus, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center py-px relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[rgba(0,0,0,0.1)] h-[24px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-black relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center py-px relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Icon-hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Icon-hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-full relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Icon-hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Icon-hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center py-px relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Selected" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Selected, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#e0f0f9] h-[24px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Selected" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Selected, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center py-px relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Selected-icon-hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Selected-icon-hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#e0f0f9] h-full relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Selected-icon-hover" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Selected-icon-hover, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#e0f0f9] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center py-px relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (!mobile && variant === "Toggle" && state === "Focus" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Toggle, State=Focus, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-full relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border-2 border-[#84c6ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_0px_2px_#006296]" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mobile && variant === "Clickable" && state === "Focus" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Clickable, State=Focus, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-[32px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border-2 border-[#84c6ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_0px_2px_#006296]" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Toggle" && state === "Selected" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Toggle, State=Selected, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#e0f0f9] h-full relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
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
  if (mobile && variant === "Clickable" && state === "Selected" && color === "Default" && size === "Medium" && !withExtraLabel && !removable) {
    return (
      <div className={className || "h-[32px] relative"} data-name="Mobile=True, Variant=Clickable, State=Selected, Color=Default, Size=Medium, With extra label=False, Removable=False">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#e0f0f9] h-[32px] relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center px-[4px] relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
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
          </div>
        </div>
      </div>
    );
  }
  if (!mobile && variant === "Expandable - Removable" && state === "Focus" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "h-[24px] relative"} data-name="Mobile=False, Variant=Expandable - Removable, State=Focus, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center relative">
            <div className="bg-[#f1f2f2] h-full relative rounded-[9999px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex h-full items-center justify-center py-px relative">
                  <div className="content-stretch flex flex-col h-full items-center justify-center pl-[8px] pr-[4px] relative shrink-0" data-name="Content">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                      <TextText text="Tag 1" additionalClassNames="pb-[2px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  if (mobile && variant === "Expandable" && state === "Focus" && color === "Default" && size === "Medium" && !withExtraLabel && removable) {
    return (
      <div className={className || "relative"} data-name="Mobile=True, Variant=Expandable, State=Focus, Color=Default, Size=Medium, With extra label=False, Removable=True">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative">
            <div className="bg-[#f1f2f2] relative rounded-[6px] shrink-0" data-name=".[Tag master]">
              <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[6px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center py-px relative">
                  <div className="flex flex-row items-center self-stretch">
                    <div className="h-full relative shrink-0" data-name="Content">
                      <div className="flex flex-col items-center justify-center size-full">
                        <div className="content-stretch flex flex-col h-full items-center justify-center pl-[12px] pr-[8px] py-[4px] relative">
                          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon+Label">
                            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Text">
                              <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#1b1c1e] text-[14px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                Tag 1
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center p-[8px] relative shrink-0" data-name="Button">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="Button">
                      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[18px]" data-name=".[Button master]">
                        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
                          <div className="absolute inset-[21.88%]" data-name="Vector">
                            <Helper1 />
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
    );
  }
  return (
    <div className={className || "relative"} data-name="Mobile=False, Variant=Default, State=Default, Color=Default, Size=Small, With extra label=False, Removable=False">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center relative">
          <div className="bg-[#f1f2f2] relative rounded-[4px] shrink-0" data-name=".[Tag master]">
            <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[4px]" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center pr-[2px] relative">
                <ContentText text="Tag 1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tag1() {
  return <Tag className="relative size-full" />;
}