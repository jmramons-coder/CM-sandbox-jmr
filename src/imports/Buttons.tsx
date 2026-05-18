import svgPaths from "./svg-ymecca49oo";

export default function Buttons() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center py-[2px] relative size-full" data-name="Buttons">
      <div className="relative shrink-0 size-[16px]" data-name="Button">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center relative size-full">
            <div className="bg-[rgba(255,255,255,0)] relative rounded-[9999px] shrink-0" data-name=".[Button master]">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center p-[4px] relative">
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
    </div>
  );
}