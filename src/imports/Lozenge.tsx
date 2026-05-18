type LozengeProps = {
  className?: string;
  mobile?: boolean;
  subtle?: boolean;
  type?: "Success" | "Warning" | "Alert" | "Neutral" | "Discovery" | "Informative";
};

function Lozenge({ className, mobile = false, subtle = false, type = "Neutral" }: LozengeProps) {
  const isMobile = mobile;
  return (
    <div className={className || "relative"}>
      <div className="content-stretch flex items-start relative">
        <div className={`relative rounded-[6px] shrink-0 ${type === "Discovery" && subtle ? "bg-[#efeaf5]" : type === "Discovery" && !subtle ? "bg-[#602fa0]" : type === "Alert" && subtle ? "bg-[#faeae9]" : type === "Alert" && !subtle ? "bg-[#cd2c23]" : type === "Warning" && subtle ? "bg-[#fff7e5]" : type === "Warning" && !subtle ? "bg-[#f5a200]" : type === "Success" && subtle ? "bg-[#e1f7ea]" : type === "Success" && !subtle ? "bg-[#008533]" : type === "Informative" && subtle ? "bg-[#e0f0f9]" : type === "Informative" && !subtle ? "bg-[#006296]" : type === "Neutral" && subtle ? "bg-[#f1f2f2]" : "bg-[#60666e]"}`} data-name=".[Lozenge master]">
          <div className="flex flex-row items-center size-full">
            <div className={`content-stretch flex items-center px-[4px] relative ${isMobile ? "gap-[8px] pb-px" : "gap-[4px]"}`}>
              <div className={`flex flex-col font-["Open_Sans:Bold",sans-serif] font-bold justify-center leading-[0] relative shrink-0 tracking-[0.4px] uppercase whitespace-nowrap ${!mobile && type === "Warning" && !subtle ? "text-[#1b1c1e] text-[11px]" : !mobile && subtle ? "text-[#60666e] text-[11px]" : isMobile ? "text-[#60666e] text-[12px]" : "text-[11px] text-white"}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className={isMobile ? "leading-[20px]" : "leading-[16px]"}>LABEL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Lozenge1() {
  return <Lozenge className="relative size-full" />;
}