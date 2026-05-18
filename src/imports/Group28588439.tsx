import clsx from "clsx";
type Frame28588439HelperProps = {
  additionalClassNames?: string;
};

function Frame28588439Helper({ children, additionalClassNames = "" }: React.PropsWithChildren<Frame28588439HelperProps>) {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex gap-[4px] items-center px-[4px] relative w-full">
        <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[11px] text-center tracking-[0.4px] uppercase whitespace-nowrap", additionalClassNames)}>
          <p className="leading-[16px]">{children}</p>
        </div>
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute content-stretch flex flex-col gap-[9px] items-start left-0 top-0 w-[44px]">
        <div className="bg-[#f6fbf8] relative rounded-[4px] shrink-0 w-full" data-name="status-success">
          <div aria-hidden="true" className="absolute border border-[#008533] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <Frame28588439Helper additionalClassNames="text-[#004f1e]">LABEL</Frame28588439Helper>
        </div>
        <div className="bg-[#fffbf5] relative rounded-[4px] shrink-0 w-full" data-name="status-warning">
          <div aria-hidden="true" className="absolute border border-[#f5a200] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <Frame28588439Helper additionalClassNames="text-[#9e6900]">LABEL</Frame28588439Helper>
        </div>
        <div className="bg-[#fdf7f6] relative rounded-[4px] shrink-0 w-full" data-name=".[Lozenge master]">
          <div aria-hidden="true" className="absolute border border-[#cd2c23] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <Frame28588439Helper additionalClassNames="text-[#7b1a15]">LABEL</Frame28588439Helper>
        </div>
        <div className="bg-[#f1f2f2] relative rounded-[4px] shrink-0 w-full" data-name=".[Lozenge master]">
          <div aria-hidden="true" className="absolute border border-[#878f9a] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <Frame28588439Helper additionalClassNames="text-[#60666e]">LABEL</Frame28588439Helper>
        </div>
        <div className="bg-[#f9f7fb] relative rounded-[4px] shrink-0 w-full" data-name=".[Lozenge master]">
          <div aria-hidden="true" className="absolute border border-[#602fa0] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <Frame28588439Helper additionalClassNames="text-[#3a1c60]">LABEL</Frame28588439Helper>
        </div>
        <div className="bg-[#f3f9fd] relative rounded-[4px] shrink-0 w-full" data-name=".[Lozenge master]">
          <div aria-hidden="true" className="absolute border border-[#006296] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <Frame28588439Helper additionalClassNames="text-[#003a5a]">LABEL</Frame28588439Helper>
        </div>
      </div>
    </div>
  );
}