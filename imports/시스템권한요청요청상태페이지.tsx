import svgPaths from "./svg-yal8z316w9";

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <div className="bg-[#008233] col-1 h-[28.606px] ml-[137.98px] mt-0 rounded-[6.731px] row-1 w-[57.211px]" />
      <p className="col-1 font-['HD:Bold',sans-serif] leading-none ml-0 mt-[3.37px] not-italic relative row-1 text-[#003087] text-[23.558px]">SmartChain</p>
      <p className="col-1 font-['HD:Bold',sans-serif] leading-none ml-[144.71px] mt-[3.37px] not-italic relative row-1 text-[23.558px] text-white">ESG</p>
    </div>
  );
}

function LogoTitleHorizontal() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[250px]" data-name="logo-title-horizontal">
      <Group />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#f0fdf4] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#008233] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['HD:Bold',sans-serif] leading-none not-italic relative shrink-0 text-[#008233] text-[16px]">게스트</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#212529] text-[16px]">김방문</p>
      <Frame2 />
    </div>
  );
}

function Notifications() {
  return (
    <div className="relative shrink-0 size-[30px]" data-name="notifications">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="notifications">
          <mask height="30" id="mask0_41_651" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="30" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="30" id="Bounding box" width="30" />
          </mask>
          <g mask="url(#mask0_41_651)">
            <path d={svgPaths.p1f91d100} fill="var(--fill-0, #212529)" id="notifications_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Logout() {
  return (
    <div className="relative shrink-0 size-[30px]" data-name="logout">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="logout">
          <mask height="30" id="mask0_41_647" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="30" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="30" id="Bounding box" width="30" />
          </mask>
          <g mask="url(#mask0_41_647)">
            <path d={svgPaths.pe204200} fill="var(--fill-0, #212529)" id="logout_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-[94px]">
      <Notifications />
      <Logout />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[32px] items-center justify-end min-h-px min-w-px relative">
      <Frame />
      <Frame1 />
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white h-[80px] relative rounded-[32px] shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-[-1px] pointer-events-none rounded-[33px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[24px] py-[16px] relative size-full">
          <LogoTitleHorizontal />
          <Frame3 />
        </div>
      </div>
    </div>
  );
}

function Error() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="error">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="error">
          <mask height="24" id="mask0_41_643" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_643)">
            <path d={svgPaths.pa81fa00} fill="var(--fill-0, #002970)" id="error_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-[#eff4fc] relative rounded-[24px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-start p-[24px] relative w-full">
          <Error />
          <p className="font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#002554] text-[16px]">권한요청 승인 대기 중입니다.</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['HD:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.4]">요청일시</p>
      </div>
      <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.5]">yyyy-MM-dd HH:mm:ss</p>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['HD:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.4]">요청권한</p>
      </div>
      <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.5]">기안자</p>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['HD:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.4]">회사명</p>
      </div>
      <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.5]">(주) 0000</p>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['HD:Bold',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.4]">이름</p>
      </div>
      <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center relative shrink-0">
        <p className="leading-[1.5]">김방문</p>
      </div>
    </div>
  );
}

function M() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full" data-name="기본 레이아웃 M">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start leading-[0] not-italic p-[24px] relative text-[16px] text-black w-full whitespace-nowrap">
          <Frame7 />
          <Frame8 />
          <Frame9 />
          <Frame10 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-white flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[32px]">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start p-[48px] relative size-full">
          <p className="font-['HD:Bold',sans-serif] leading-[1.35] not-italic relative shrink-0 text-[#212529] text-[28px]">시스템 권한요청</p>
          <Frame6 />
          <p className="font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[18px]">요청 현황</p>
          <M />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] w-full">
      <Frame5 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#f8f9fa] content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full" data-name="시스템권한요청 - 요청 상태 페이지">
      <Header />
      <Frame4 />
    </div>
  );
}