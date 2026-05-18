import svgPaths from "./svg-xvo91vt2hu";
type LogoProps = {
  className?: string;
  onDark?: boolean;
  product?: "Default" | "/analyze" | "/apply" | "/centralize" | "/connect" | "/design" | "/illustrate" | "/manage" | "/plan" | "Placeholder" | "/empower" | "LifeGuide";
};

function Logo({ className, onDark = true, product = "Default" }: LogoProps) {
  const isAnalyze = product === "/analyze";
  const isAnalyzeAndNotOnDark = product === "/analyze" && !onDark;
  const isAnalyzeAndOnDark = product === "/analyze" && onDark;
  const isAnalyzeOrIllustrateOrManage = ["/analyze", "/illustrate", "/manage"].includes(product);
  const isApply = product === "/apply";
  const isApplyAndNotOnDark = product === "/apply" && !onDark;
  const isCentralize = product === "/centralize";
  const isCentralizeAndNotOnDark = product === "/centralize" && !onDark;
  const isCentralizeAndOnDark = product === "/centralize" && onDark;
  const isConnect = product === "/connect";
  const isConnectAndNotOnDark = product === "/connect" && !onDark;
  const isConnectAndOnDark = product === "/connect" && onDark;
  const isDefaultAndNotOnDark = product === "Default" && !onDark;
  const isDesign = product === "/design";
  const isDesignAndNotOnDark = product === "/design" && !onDark;
  const isDesignAndOnDark = product === "/design" && onDark;
  const isEmpower = product === "/empower";
  const isEmpowerAndNotOnDark = product === "/empower" && !onDark;
  const isEmpowerOrAnalyzeOrIllustrateOrManage = ["/empower", "/analyze", "/illustrate", "/manage"].includes(product);
  const isIllustrate = product === "/illustrate";
  const isIllustrateAndNotOnDark = product === "/illustrate" && !onDark;
  const isIllustrateAndOnDark = product === "/illustrate" && onDark;
  const isManage = product === "/manage";
  const isManageAndOnDark = product === "/manage" && onDark;
  const isNotOnDarkAndIsAnalyzeOrIllustrateOrManage = !onDark && ["/analyze", "/illustrate", "/manage"].includes(product);
  const isNotOnDarkAndIsCentralizeOrConnect = !onDark && ["/centralize", "/connect"].includes(product);
  const isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage = !onDark && ["/empower", "/analyze", "/illustrate", "/manage"].includes(product);
  const isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign = !onDark && ["/plan", "/centralize", "/connect", "/design"].includes(product);
  const isNotOnDarkAndIsPlanOrDesign = !onDark && ["/plan", "/design"].includes(product);
  const isPlaceholderAndOnDark = product === "Placeholder" && onDark;
  const isPlanAndNotOnDark = product === "/plan" && !onDark;
  const isPlanOrDesign = ["/plan", "/design"].includes(product);
  return (
    <div className={className || "h-[32px] relative w-[104px]"}>
      {(["Default", "/plan", "/empower"].includes(product) || isPlaceholderAndOnDark || isApply || isAnalyze || isCentralize || isConnect || isDesign || isIllustrate || isManage) && (
        <div className={`absolute contents ${isCentralizeAndNotOnDark ? "inset-[0.01%_0.14%_6.72%_0.14%]" : isManage ? "inset-[-0.14%_0.14%]" : isIllustrate ? "inset-[0.14%_0]" : isConnect ? "inset-[0.15%_0]" : isCentralizeAndOnDark ? "inset-[0.12%_0]" : ["/apply", "/analyze", "/design"].includes(product) ? "inset-[0_0.14%]" : isPlaceholderAndOnDark ? "inset-[3.13%_15.38%]" : isEmpower ? "inset-[-0.14%_0.16%_0.11%_0.14%]" : product === "/plan" ? "inset-[-0.09%_0.14%]" : "inset-[10.06%_0]"}`} data-name="Desktop">
          {["/plan", "/apply", "/centralize", "/connect", "/design"].includes(product) && (
            <div className={`absolute ${isCentralizeAndNotOnDark ? "inset-[0.01%_0.14%_6.72%_0.14%]" : isDesign ? "inset-[0_0.14%]" : isConnect ? "inset-[0.15%_0.14%_6.69%_0.14%]" : isCentralizeAndOnDark ? "inset-[0.12%_0.14%_6.61%_0.14%]" : isApply ? "contents inset-[0_0.14%]" : "inset-[-0.09%_0.14%]"}`} data-name="Logo">
              {["/plan", "/centralize", "/connect", "/design"].includes(product) && (
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isDesign ? "0 0 103.71 32" : isConnect ? "0 0 103.71 29.8126" : isCentralize ? "0 0 103.71 29.846" : "0 0 103.71 32.0591"}>
                  <g id="Logo">
                    <path clipRule="evenodd" d={isConnectAndNotOnDark ? svgPaths.p5ef3400 : isPlanAndNotOnDark ? svgPaths.p38b39f80 : isDesign ? svgPaths.p3db79e00 : isConnectAndOnDark ? svgPaths.p1bae4000 : isCentralize ? svgPaths.p1fe9a900 : svgPaths.pd60d200} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-1" />
                    <path clipRule="evenodd" d={isDesign ? svgPaths.p3d1927c0 : isConnect ? svgPaths.p2a6ba00 : isCentralize ? svgPaths.p8d18900 : svgPaths.p37001a00} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-2" />
                    <path clipRule="evenodd" d={isDesignAndNotOnDark ? svgPaths.p2a6b6b90 : isCentralizeAndNotOnDark ? svgPaths.p28cb8280 : isPlanAndNotOnDark ? svgPaths.p83ae300 : isDesignAndOnDark ? svgPaths.p17e0fd80 : isConnect ? svgPaths.p4d40280 : isCentralizeAndOnDark ? svgPaths.p84bd080 : svgPaths.p28212e00} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-3" />
                    {isPlanOrDesign && <path clipRule="evenodd" d={isDesign ? svgPaths.p20498400 : svgPaths.p1a2d5d00} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-4" />}
                    <g id={isDesign ? "Group-26" : "Group-25"}>
                      <path clipRule="evenodd" d={isDesignAndNotOnDark ? svgPaths.p3c86da00 : isCentralizeAndNotOnDark ? svgPaths.p37725100 : isPlanAndNotOnDark ? svgPaths.p3431bb00 : isDesignAndOnDark ? svgPaths.p9570600 : isConnect ? svgPaths.p2bb19300 : isCentralizeAndOnDark ? svgPaths.p368ca780 : svgPaths.p272af100} fill={isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-5" />
                      <path clipRule="evenodd" d={isDesign ? svgPaths.pcc2b200 : isConnect ? svgPaths.p309baf80 : isCentralize ? svgPaths.p6dc9700 : svgPaths.p2730f680} fill={isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-7" />
                      <path clipRule="evenodd" d={isPlanAndNotOnDark ? svgPaths.p21778000 : isDesign ? svgPaths.p24935400 : isConnect ? svgPaths.p35037100 : isCentralize ? svgPaths.pe137200 : svgPaths.p8993700} fill={isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-9" />
                      <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p1bc900 : isPlanAndNotOnDark ? svgPaths.p2b3b4bf0 : isDesign ? svgPaths.p29dc1500 : isConnect ? svgPaths.p358c2000 : isCentralizeAndOnDark ? svgPaths.p375cea00 : svgPaths.p14e90600} fill={isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-11" />
                      <path clipRule="evenodd" d={isConnectAndNotOnDark ? svgPaths.p22205900 : isCentralizeAndNotOnDark ? svgPaths.p1a2bbc80 : isDesign ? svgPaths.p21074400 : isConnectAndOnDark ? svgPaths.p270d1000 : isCentralizeAndOnDark ? svgPaths.pe0211f0 : svgPaths.p3d724370} fill={isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-13" />
                      {["/plan", "/centralize", "/connect"].includes(product) && (
                        <g id="Group-17">
                          <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p304bc380 : isConnect ? svgPaths.p4b79a80 : isCentralizeAndOnDark ? svgPaths.p2e75c300 : svgPaths.p1917b600} fill={!onDark && ["/plan", "/centralize", "/connect"].includes(product) ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-15" />
                        </g>
                      )}
                      <path clipRule="evenodd" d={isDesignAndNotOnDark ? svgPaths.p37fcf640 : isCentralizeAndNotOnDark ? svgPaths.p8aec200 : isDesignAndOnDark ? svgPaths.p10f8ac00 : isConnect ? svgPaths.p2fd07b00 : isCentralizeAndOnDark ? svgPaths.p1fc79b00 : svgPaths.p3d577b00} fill={isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isDesign ? "Fill-15" : "Fill-18"} />
                      <path clipRule="evenodd" d={isDesignAndNotOnDark ? svgPaths.p31b27c80 : isCentralizeAndNotOnDark ? svgPaths.p3c542580 : isDesignAndOnDark ? svgPaths.p1b333980 : isConnect ? svgPaths.p216c3200 : isCentralizeAndOnDark ? svgPaths.p29534a70 : svgPaths.p2855400} fill={isNotOnDarkAndIsPlanOrCentralizeOrConnectOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isDesign ? "Fill-17" : "Fill-20"} />
                      {isPlanOrDesign && (
                        <>
                          <path clipRule="evenodd" d={isDesign ? svgPaths.p2c026f00 : svgPaths.p112adc80} fill={isNotOnDarkAndIsPlanOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isDesign ? "Fill-19" : "Fill-21"} />
                          <path clipRule="evenodd" d={isDesign ? svgPaths.p1a0e0b00 : svgPaths.p3d0b3b00} fill={isNotOnDarkAndIsPlanOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isDesign ? "Fill-20" : "Fill-22"} />
                          <path clipRule="evenodd" d={isDesign ? svgPaths.p2e080600 : svgPaths.p3b2b3d00} fill={isNotOnDarkAndIsPlanOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isDesign ? "Fill-21" : "Fill-23"} />
                          <path clipRule="evenodd" d={isDesign ? svgPaths.p27c41b80 : svgPaths.p2c77b700} fill={isNotOnDarkAndIsPlanOrDesign ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isDesign ? "Fill-22" : "Fill-24"} />
                        </>
                      )}
                      {["/centralize", "/connect"].includes(product) && (
                        <g id={isConnect ? "Group 2" : "Group 3"}>
                          <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p159864c0 : isConnect ? svgPaths.p723f580 : svgPaths.p30372e80} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-4" />
                          <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.pcb92680 : isConnect ? svgPaths.p32fcd3c0 : svgPaths.p31930400} fill={isNotOnDarkAndIsCentralizeOrConnect ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isConnect ? "Fill-20_2" : "Fill-21"} />
                          <path clipRule="evenodd" d={isConnectAndNotOnDark ? svgPaths.p33f17600 : isCentralizeAndNotOnDark ? svgPaths.p176f28f0 : isConnectAndOnDark ? svgPaths.p9ad480 : svgPaths.p13f2c800} fill={isNotOnDarkAndIsCentralizeOrConnect ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isConnect ? "Fill-21" : "Fill-22"} />
                          <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p3e67bc80 : isConnect ? svgPaths.p27c41400 : svgPaths.p25ce8580} fill={isNotOnDarkAndIsCentralizeOrConnect ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isConnect ? "Fill-22" : "Fill-23"} />
                          <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p1b666080 : isConnect ? svgPaths.p28355100 : svgPaths.p12fb1600} fill={isNotOnDarkAndIsCentralizeOrConnect ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isConnect ? "Fill-23" : "Fill-24"} />
                          <path clipRule="evenodd" d={isConnectAndNotOnDark ? svgPaths.p39efe100 : isCentralizeAndNotOnDark ? svgPaths.p1458ba00 : isConnectAndOnDark ? svgPaths.p37af9140 : svgPaths.p11449580} fill={isNotOnDarkAndIsCentralizeOrConnect ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isConnect ? "Fill-24" : "Fill-25"} />
                          <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p2583f600 : isConnect ? svgPaths.p7bb6d70 : svgPaths.p1041ab70} fill={isNotOnDarkAndIsCentralizeOrConnect ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isConnect ? "Fill-25" : "Fill-26"} />
                          <path clipRule="evenodd" d={isConnectAndNotOnDark ? svgPaths.p855d980 : isCentralizeAndNotOnDark ? svgPaths.p1c7a2f00 : isConnectAndOnDark ? svgPaths.p311274c0 : svgPaths.p195b0740} fill={isNotOnDarkAndIsCentralizeOrConnect ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isConnect ? "Fill-26" : "Fill-27"} />
                          {isCentralize && (
                            <>
                              <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p27dd3e00 : svgPaths.p17a9300} fill={isCentralizeAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-28" />
                              <path clipRule="evenodd" d={svgPaths.p26346700} fill={isCentralizeAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-29" />
                              <path clipRule="evenodd" d={isCentralizeAndNotOnDark ? svgPaths.p261080 : svgPaths.p2ea57e00} fill={isCentralizeAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-30" />
                            </>
                          )}
                        </g>
                      )}
                      {isDesign && (
                        <>
                          <path clipRule="evenodd" d={svgPaths.p2c3e5200} fill={isDesignAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-23" />
                          <path clipRule="evenodd" d={svgPaths.pbc4b600} fill={isDesignAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-24" />
                          <path clipRule="evenodd" d={svgPaths.p3d790780} fill={isDesignAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-25" />
                        </>
                      )}
                    </g>
                  </g>
                </svg>
              )}
              {isApply && (
                <>
                  <div className="absolute inset-[72.34%_0.14%_0_68.36%]" data-name="Produit">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32.762 8.8509">
                      <g id="Produit">
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p4cbfb00 : svgPaths.pcba900} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-21" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p388fa000 : svgPaths.p31308200} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-22" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p14276e00 : svgPaths.p315400f2} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-23" />
                        <path clipRule="evenodd" d={svgPaths.p13a7a080} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-24" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p2d7d780 : svgPaths.p1d7da340} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-25" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p14fc9780 : svgPaths.p2bfe2f00} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-4" />
                      </g>
                    </svg>
                  </div>
                  <div className="absolute inset-[0_4.33%_23.93%_23.62%]" data-name="Equisoft">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 74.9314 24.3427">
                      <g id="Equisoft">
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.pedd2e00 : svgPaths.p1fb51580} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-5" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p3aef5b80 : svgPaths.p11a5ad80} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-7" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p2e33dc80 : svgPaths.p301f6000} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-9" />
                        <path clipRule="evenodd" d={svgPaths.pe7d7100} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-11" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p2a954c80 : svgPaths.p10be1200} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-13" />
                        <g id="Group-17">
                          <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p1667df00 : svgPaths.p1b958780} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-15" />
                        </g>
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p3bd18c00 : svgPaths.p3258900} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-18" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.pd830780 : svgPaths.p36f72bc0} fill={isApplyAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-20" />
                      </g>
                    </svg>
                  </div>
                  <div className="absolute inset-[8.79%_81.73%_40.46%_0.14%]" data-name="Symbole">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.8562 16.2403">
                      <g id="Symbole">
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p333d7a00 : svgPaths.p10acc100} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-1" />
                        <path clipRule="evenodd" d={svgPaths.p3c628500} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-2" />
                        <path clipRule="evenodd" d={isApplyAndNotOnDark ? svgPaths.p3e638100 : svgPaths.p16510700} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-3" />
                      </g>
                    </svg>
                  </div>
                </>
              )}
            </div>
          )}
          {isEmpowerOrAnalyzeOrIllustrateOrManage && (
            <>
              <div className={`absolute ${isManage ? "inset-[76.18%_0.14%_-0.14%_56.51%]" : isIllustrate ? "inset-[72.02%_0.14%_6.66%_55.43%]" : isAnalyze ? "inset-[72.55%_0.14%_0_59.77%]" : "inset-[76.25%_0.16%_0.11%_53.37%]"}`} data-name="Produit">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isAnalyzeAndNotOnDark ? "0 0 41.6984 8.78402" : isManage ? "0 0 45.087 7.6669" : isIllustrate ? "0 0 46.2129 6.82527" : isAnalyzeAndOnDark ? "0 0 41.6984 8.78403" : "0 0 48.3313 7.5652"}>
                  <g id="Produit">
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p2e45c600 : isAnalyzeAndNotOnDark ? svgPaths.p3381e380 : isIllustrateAndOnDark ? svgPaths.p3d5a7c00 : isAnalyzeAndOnDark ? svgPaths.p1f95d2f0 : svgPaths.p1ba2c700} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-4" />
                    {isAnalyzeOrIllustrateOrManage && (
                      <>
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p30593100 : isAnalyzeAndNotOnDark ? svgPaths.pcabd00 : isManage ? svgPaths.p2f801100 : isIllustrateAndOnDark ? svgPaths.p3c703b80 : svgPaths.p142aae00} fill={isNotOnDarkAndIsAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isManage ? "Fill-20" : "Fill-21"} />
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p1c985180 : isAnalyzeAndNotOnDark ? svgPaths.p3c5e90c0 : isManage ? svgPaths.p1abac500 : isIllustrateAndOnDark ? svgPaths.p1f8d0c80 : svgPaths.p3a12d780} fill={isNotOnDarkAndIsAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isManage ? "Fill-21" : "Fill-22"} />
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p2a635600 : isAnalyzeAndNotOnDark ? svgPaths.p117a2d80 : isManage ? svgPaths.p13772600 : isIllustrateAndOnDark ? svgPaths.p102ca200 : svgPaths.p14ec1980} fill={isNotOnDarkAndIsAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isManage ? "Fill-22" : "Fill-23"} />
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p375a3e00 : isAnalyzeAndNotOnDark ? svgPaths.p3c836500 : isManage ? svgPaths.p2f9b8900 : isIllustrateAndOnDark ? svgPaths.p365c4f70 : svgPaths.p4250580} fill={isNotOnDarkAndIsAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isManage ? "Fill-23" : "Fill-24"} />
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p3f00a600 : isAnalyzeAndNotOnDark ? svgPaths.p18173f00 : isManage ? svgPaths.p3750c100 : isIllustrateAndOnDark ? svgPaths.p15939200 : svgPaths.p25c368f0} fill={isNotOnDarkAndIsAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isManage ? "Fill-24" : "Fill-25"} />
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p1d2f2400 : isManage ? svgPaths.p2d1bc900 : isIllustrateAndOnDark ? svgPaths.p3697700 : svgPaths.p31197b00} fill={isNotOnDarkAndIsAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id={isManage ? "Fill-25" : "Fill-26"} />
                      </>
                    )}
                    {["/analyze", "/illustrate"].includes(product) && <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p18b97b00 : isAnalyzeAndNotOnDark ? svgPaths.p263e7c80 : isIllustrateAndOnDark ? svgPaths.pd60fd00 : svgPaths.p11458000} fill={!onDark && ["/analyze", "/illustrate"].includes(product) ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-27" />}
                    {isEmpower && (
                      <g id="empower">
                        <path d={svgPaths.p15959500} fill={isEmpowerAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} id="Vector" />
                        <path d={svgPaths.pf899230} fill={isEmpowerAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} id="Vector_2" />
                        <path d={svgPaths.p394fcf00} fill={isEmpowerAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} id="Vector_3" />
                        <path d={svgPaths.p2294d900} fill={isEmpowerAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} id="Vector_4" />
                        <path d={svgPaths.p2e7c2e00} fill={isEmpowerAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} id="Vector_5" />
                        <path d={svgPaths.p29c0180} fill={isEmpowerAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} id="Vector_6" />
                        <path d={svgPaths.p26b6fa00} fill={isEmpowerAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} id="Vector_7" />
                      </g>
                    )}
                    {isIllustrate && (
                      <>
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p20173600 : svgPaths.p1b23fa00} fill={isIllustrateAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-28" />
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p3a466280 : svgPaths.p3fb7ea40} fill={isIllustrateAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-29" />
                        <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p2b338600 : svgPaths.p2fe2fe00} fill={isIllustrateAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-30" />
                      </>
                    )}
                  </g>
                </svg>
              </div>
              <div className={`absolute ${isIllustrate ? "inset-[0.14%_4.24%_23.47%_23.64%]" : isAnalyze ? "inset-[0_4.33%_23.68%_23.62%]" : "inset-[-0.14%_4.33%_23.82%_23.62%]"}`} data-name="Equisoft">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isIllustrate ? "0 0 75.0041 24.4449" : isAnalyze ? "0 0 74.9317 24.4213" : "0 0 74.9326 24.4216"}>
                  <g id="Equisoft">
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.pc9e6c00 : isAnalyzeAndNotOnDark ? svgPaths.p804c300 : isManageAndOnDark ? svgPaths.p1828e00 : isIllustrateAndOnDark ? svgPaths.p78c1900 : isAnalyzeAndOnDark ? svgPaths.p188901a0 : svgPaths.p19f23700} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-5" />
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p15a5a800 : isAnalyzeAndNotOnDark ? svgPaths.p7a9a80 : isIllustrateAndOnDark ? svgPaths.pbc06600 : isAnalyzeAndOnDark ? svgPaths.p2df97300 : svgPaths.p35dff900} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-7" />
                    <path clipRule="evenodd" d={isAnalyzeAndNotOnDark ? svgPaths.p3053c600 : isIllustrate ? svgPaths.p1015c080 : isAnalyzeAndNotOnDark ? svgPaths.p3f432040 : svgPaths.p3a7a4500} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-9" />
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p22467600 : isAnalyzeAndNotOnDark ? svgPaths.p33617800 : isManageAndOnDark ? svgPaths.pf2e5700 : isIllustrateAndOnDark ? svgPaths.p36951040 : isAnalyzeAndOnDark ? svgPaths.p27ef0520 : svgPaths.p17c7f480} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-11" />
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p2bdfe300 : isManageAndOnDark ? svgPaths.p32203740 : isIllustrateAndOnDark ? svgPaths.p29743d00 : isAnalyze ? svgPaths.p321dc200 : svgPaths.p110b4680} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-13" />
                    <g id="Group-17">
                      <path clipRule="evenodd" d={isAnalyzeAndNotOnDark ? svgPaths.p3660ab00 : isIllustrate ? svgPaths.pd774c00 : isAnalyzeAndNotOnDark ? svgPaths.p3331caf0 : svgPaths.p2f982580} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-15" />
                    </g>
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p32136800 : isIllustrateAndOnDark ? svgPaths.p6a9ff0 : isAnalyze ? svgPaths.p37f3af00 : svgPaths.p5ce75f0} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-18" />
                    <path clipRule="evenodd" d={isIllustrate ? svgPaths.p1a5a3700 : isAnalyze ? svgPaths.p185cee80 : svgPaths.p13e5a500} fill={isNotOnDarkAndIsEmpowerOrAnalyzeOrIllustrateOrManage ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-20" />
                  </g>
                </svg>
              </div>
              <div className={`absolute ${isIllustrate ? "inset-[8.96%_81.71%_40.07%_0.14%]" : isAnalyze ? "inset-[8.82%_81.73%_40.27%_0.14%]" : "inset-[8.68%_81.73%_40.41%_0.14%]"}`} data-name="Symbole">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isIllustrate ? "0 0 18.8745 16.3085" : isAnalyze ? "0 0 18.8563 16.2928" : "0 0 18.8565 16.293"}>
                  <g id="Symbole">
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p3768e40 : isAnalyzeAndNotOnDark ? svgPaths.p336e8e00 : isIllustrateAndOnDark ? svgPaths.p38fb8e80 : isAnalyzeAndOnDark ? svgPaths.p183f8dc0 : svgPaths.p26f28540} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-1" />
                    <path clipRule="evenodd" d={isIllustrate ? svgPaths.p1160ae80 : isAnalyze ? svgPaths.p30a3fbf2 : svgPaths.p2f7af580} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-2" />
                    <path clipRule="evenodd" d={isIllustrateAndNotOnDark ? svgPaths.p5cc6f80 : isIllustrateAndOnDark ? svgPaths.p2b466a00 : isAnalyze ? svgPaths.p22968480 : svgPaths.pd4faf00} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-3" />
                  </g>
                </svg>
              </div>
            </>
          )}
          {(isCentralizeAndOnDark || isConnect || isIllustrate) && <div className={`absolute ${isIllustrate ? "inset-[93.14%_0_0.14%_0]" : isConnect ? "h-[2.15px] left-0 top-[29.8px] w-[104px]" : "h-[2.15px] left-0 top-[29.81px] w-[104px]"}`} data-name="Margin" />}
          {product === "Default" && (
            <div className="absolute contents inset-[10.06%_0]" data-name="Desktop/Default/Color">
              <div className="absolute inset-[10.06%_0]" data-name="logo">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 104 25.5639">
                  <g id="logo">
                    <path clipRule="evenodd" d={svgPaths.p28d2c800} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-1" />
                    <path clipRule="evenodd" d={svgPaths.p3b87f980} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-2" />
                    <path clipRule="evenodd" d={svgPaths.p3a938580} fill="var(--fill-0, #FF4138)" fillRule="evenodd" id="Fill-3" />
                    <g id="Group-27">
                      <path clipRule="evenodd" d={svgPaths.p120f9000} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-5" />
                      <path clipRule="evenodd" d={svgPaths.p2703a470} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-7" />
                      <path clipRule="evenodd" d={svgPaths.p25ade980} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-9" />
                      <path clipRule="evenodd" d={svgPaths.p112e0e00} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-11" />
                      <path clipRule="evenodd" d={svgPaths.p383d5100} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-13" />
                      <path clipRule="evenodd" d={svgPaths.p26325a40} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-15" />
                      <path clipRule="evenodd" d={svgPaths.p3db15d00} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-17" />
                      <path clipRule="evenodd" d={svgPaths.p1855d300} fill={isDefaultAndNotOnDark ? "var(--fill-0, #012639)" : "var(--fill-0, white)"} fillRule="evenodd" id="Fill-19" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          )}
          {isPlaceholderAndOnDark && <p className="absolute font-['Inter:Bold',sans-serif] font-bold inset-[3.13%_15.38%] leading-[normal] not-italic text-[25px] text-white whitespace-nowrap">LOGO</p>}
        </div>
      )}
      {product === "LifeGuide" && onDark && (
        <div className="absolute h-[17px] left-0 top-[8px] w-[104.532px]" data-name="LifeGuide_HZ_W 1">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 104.532 17">
            <g clipPath="url(#clip0_1_18929)" id="LifeGuide_HZ_W 1">
              <path d={svgPaths.pdc84f00} fill="var(--fill-0, white)" id="Vector" />
              <path d={svgPaths.p1c33b080} fill="var(--fill-0, white)" id="Vector_2" />
              <path d={svgPaths.p2fd24400} fill="var(--fill-0, white)" id="Vector_3" />
              <path d={svgPaths.p30ed1cc0} fill="var(--fill-0, white)" id="Vector_4" />
              <path d={svgPaths.p168c3b00} fill="var(--fill-0, white)" id="Vector_5" />
              <path d={svgPaths.p3a220700} fill="var(--fill-0, white)" id="Vector_6" />
              <path d={svgPaths.p22686e00} fill="var(--fill-0, white)" id="Vector_7" />
              <path d={svgPaths.p2c56a00} fill="var(--fill-0, white)" id="Vector_8" />
              <path d={svgPaths.p1f1f2c00} fill="var(--fill-0, white)" id="Vector_9" />
            </g>
            <defs>
              <clipPath id="clip0_1_18929">
                <rect fill="white" height="17" width="104.532" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
      {isCentralizeAndNotOnDark && <div className="absolute h-[2.15px] left-0 top-[29.85px] w-[104px]" data-name="Margin" />}
    </div>
  );
}

export default Logo;