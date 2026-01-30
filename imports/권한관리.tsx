import svgPaths from "./svg-m9t3ct0oli";

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
      <p className="font-['HD:Bold',sans-serif] leading-none not-italic relative shrink-0 text-[#008233] text-[16px]">수신자</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#212529] text-[16px]">김수신</p>
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

function Brightness() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="brightness_1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="brightness_1">
          <mask height="12" id="mask0_1_2933" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_1_2933)">
            <path d={svgPaths.p3ff18480} fill="var(--fill-0, #002970)" id="brightness_1_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Menu1DepthDefault() {
  return (
    <div className="content-stretch flex gap-[8px] items-center px-[24px] py-[18px] relative self-stretch shrink-0 w-[300px]" data-name="menu-1depth-default">
      <Brightness />
      <p className="flex-[1_0_0] font-['HD:Bold',sans-serif] leading-[1.4] min-h-px min-w-px not-italic relative text-[#002554] text-[18px] whitespace-pre-wrap">권한 관리</p>
    </div>
  );
}

function Menu1DepthSelect1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="menu-1depth-select">
      <Menu1DepthDefault />
    </div>
  );
}

function Menu1DepthSelect() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="menu-1depth-select">
      <Menu1DepthSelect1 />
    </div>
  );
}

function SideMenuLayout() {
  return (
    <div className="bg-white content-stretch flex flex-col h-full items-start py-[16px] relative rounded-[20px] shrink-0 w-[300px]" data-name="SideMenu-Layout">
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[20px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)]" />
      <Menu1DepthSelect />
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="search">
          <mask height="24" id="mask0_41_996" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_996)">
            <path d={svgPaths.pc423380} fill="var(--fill-0, #212529)" id="search_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function DropDownLayout() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full" data-name="DropDown-Layout">
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[24px] py-[18px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#adb5bd] text-[14px] whitespace-pre-wrap">협력사를 선택해주세요.</p>
          <Search />
        </div>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px relative">
      <p className="font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[18px] text-black">협력사 명</p>
      <DropDownLayout />
    </div>
  );
}

function KeyboardArrowDown() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="keyboard_arrow_down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="keyboard_arrow_down">
          <mask height="24" id="mask0_41_613" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_613)">
            <path d={svgPaths.p2b1b0180} fill="var(--fill-0, #212529)" id="keyboard_arrow_down_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function DropDownLayout1() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full" data-name="DropDown-Layout">
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[24px] py-[18px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#adb5bd] text-[14px] whitespace-pre-wrap">상태를 선택해주세요.</p>
          <KeyboardArrowDown />
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px relative">
      <p className="font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[18px] text-black">상태</p>
      <DropDownLayout1 />
    </div>
  );
}

function CalendarToday() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="calendar_today">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="calendar_today">
          <mask height="24" id="mask0_41_1000" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_1000)">
            <path d={svgPaths.p3823abb0} fill="var(--fill-0, #212529)" id="calendar_today_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function DropDownLayout2() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full" data-name="DropDown-Layout">
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[24px] py-[18px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#adb5bd] text-[14px] whitespace-pre-wrap">날짜를 선택해주세요.</p>
          <CalendarToday />
        </div>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px relative">
      <p className="font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[18px] text-black">요청일</p>
      <DropDownLayout2 />
    </div>
  );
}

function ButtonPrimary() {
  return (
    <div className="bg-[#003087] content-stretch flex gap-[4px] h-[64px] items-center justify-center px-[24px] relative rounded-[20px] shrink-0" data-name="Button-Primary">
      <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white whitespace-nowrap">
        <p className="leading-[1.6]">적용</p>
      </div>
    </div>
  );
}

function ButtonTertiary() {
  return (
    <div className="bg-white content-stretch flex gap-[4px] h-[64px] items-center justify-center px-[24px] relative rounded-[20px] shrink-0" data-name="Button-Tertiary">
      <div aria-hidden="true" className="absolute border border-[#212529] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#212529] text-[18px] whitespace-nowrap">
        <p className="leading-[1.6]">초기화</p>
      </div>
    </div>
  );
}

function M() {
  return (
    <div className="bg-white relative rounded-[32px] shrink-0 w-full" data-name="기본 레이아웃 M">
      <div className="flex flex-row items-end overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-end p-[24px] relative w-full">
          <Frame12 />
          <Frame13 />
          <Frame11 />
          <ButtonPrimary />
          <ButtonTertiary />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function Frame27() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[24px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Bold',sans-serif] leading-[1.4] min-h-px min-w-px not-italic relative text-[18px] text-black whitespace-pre-wrap">요청 목록</p>
        </div>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#b0cbef] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#002554] text-[14px] text-center text-ellipsis whitespace-nowrap">요청 ID</p>
        </div>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">campaign0001</p>
        </div>
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">campaign0001</p>
        </div>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">campaign0001</p>
        </div>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">campaign0001</p>
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">campaign0001</p>
        </div>
      </div>
    </div>
  );
}

function TableColumn() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px overflow-clip relative" data-name="Table Column">
      <Frame14 />
      <Frame15 />
      <Frame16 />
      <Frame17 />
      <Frame18 />
      <Frame19 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#b0cbef] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#002554] text-[14px] text-center text-ellipsis whitespace-nowrap">이름</p>
        </div>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">김요청</p>
        </div>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">김요청</p>
        </div>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">김요청</p>
        </div>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">김요청</p>
        </div>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">김요청</p>
        </div>
      </div>
    </div>
  );
}

function TableColumn1() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px overflow-clip relative" data-name="Table Column">
      <Frame20 />
      <Frame21 />
      <Frame22 />
      <Frame23 />
      <Frame24 />
      <Frame25 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#b0cbef] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#002554] text-[14px] text-center text-ellipsis whitespace-nowrap">협력사 명</p>
        </div>
      </div>
    </div>
  );
}

function Frame28() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">(주) 00회사</p>
        </div>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">(주) 00회사</p>
        </div>
      </div>
    </div>
  );
}

function Frame30() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">(주) 00회사</p>
        </div>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">(주) 00회사</p>
        </div>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">(주) 00회사</p>
        </div>
      </div>
    </div>
  );
}

function TableColumn2() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px overflow-clip relative" data-name="Table Column">
      <Frame26 />
      <Frame28 />
      <Frame29 />
      <Frame30 />
      <Frame31 />
      <Frame32 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#b0cbef] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#002554] text-[14px] text-center text-ellipsis whitespace-nowrap">요청일</p>
        </div>
      </div>
    </div>
  );
}

function Frame34() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#212529] text-[14px] text-center whitespace-pre-wrap">2026/01/09</p>
        </div>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">2026/01/09</p>
        </div>
      </div>
    </div>
  );
}

function Frame36() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">2026/01/09</p>
        </div>
      </div>
    </div>
  );
}

function Frame37() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">2026/01/09</p>
        </div>
      </div>
    </div>
  );
}

function Frame38() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#212529] text-[14px] text-center text-ellipsis whitespace-nowrap">2026/01/09</p>
        </div>
      </div>
    </div>
  );
}

function TableColumn3() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px overflow-clip relative" data-name="Table Column">
      <Frame33 />
      <Frame34 />
      <Frame35 />
      <Frame36 />
      <Frame37 />
      <Frame38 />
    </div>
  );
}

function Frame39() {
  return (
    <div className="min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#b0cbef] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#002554] text-[14px] text-center text-ellipsis whitespace-nowrap">상태</p>
        </div>
      </div>
    </div>
  );
}

function Frame41() {
  return (
    <div className="bg-[#f1f3f5] content-stretch flex items-center justify-center px-[12px] py-[5px] relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#495057] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#495057] text-[14px] text-center w-[52px] whitespace-pre-wrap">승인 대기</p>
    </div>
  );
}

function Frame40() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame41 />
        </div>
      </div>
    </div>
  );
}

function Frame43() {
  return (
    <div className="bg-[#f0fdf4] content-stretch flex items-center justify-center px-[12px] py-[5px] relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#008233] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#008233] text-[14px] text-center">승인</p>
    </div>
  );
}

function Frame42() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame43 />
        </div>
      </div>
    </div>
  );
}

function Frame45() {
  return (
    <div className="bg-[#f0fdf4] content-stretch flex items-center justify-center px-[12px] py-[5px] relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#008233] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#008233] text-[14px] text-center">승인</p>
    </div>
  );
}

function Frame44() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame45 />
        </div>
      </div>
    </div>
  );
}

function Frame47() {
  return (
    <div className="bg-[#fff8e1] content-stretch flex items-center justify-center px-[12px] py-[5px] relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#e65100] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#e65100] text-[14px] text-center">반려</p>
    </div>
  );
}

function Frame46() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame47 />
        </div>
      </div>
    </div>
  );
}

function Frame49() {
  return (
    <div className="bg-[#fff8e1] content-stretch flex items-center justify-center px-[12px] py-[5px] relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#e65100] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#e65100] text-[14px] text-center">반려</p>
    </div>
  );
}

function Frame48() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame49 />
        </div>
      </div>
    </div>
  );
}

function TableColumn4() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px overflow-clip relative" data-name="Table Column">
      <Frame39 />
      <Frame40 />
      <Frame42 />
      <Frame44 />
      <Frame46 />
      <Frame48 />
    </div>
  );
}

function Frame50() {
  return (
    <div className="min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#b0cbef] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#002554] text-[14px] text-center text-ellipsis whitespace-nowrap">요청권한</p>
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#002554] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#002554] text-[14px]">작성자</p>
    </div>
  );
}

function Frame51() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame4 />
        </div>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[#fff8e1] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#e65100] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#e65100] text-[14px]">결재자</p>
    </div>
  );
}

function Frame52() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#002554] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#002554] text-[14px]">작성자</p>
    </div>
  );
}

function Frame53() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#002554] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#002554] text-[14px]">작성자</p>
    </div>
  );
}

function Frame54() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame7 />
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#002554] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#002554] text-[14px]">작성자</p>
    </div>
  );
}

function Frame55() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <Frame8 />
        </div>
      </div>
    </div>
  );
}

function TableColumn5() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px overflow-clip relative" data-name="Table Column">
      <Frame50 />
      <Frame51 />
      <Frame52 />
      <Frame53 />
      <Frame54 />
      <Frame55 />
    </div>
  );
}

function Frame56() {
  return (
    <div className="min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#b0cbef] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic overflow-hidden relative text-[#002554] text-[14px] text-center text-ellipsis whitespace-nowrap">관리</p>
        </div>
      </div>
    </div>
  );
}

function MoreVert() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="more_vert">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_vert">
          <mask height="24" id="mask0_41_992" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_992)">
            <path d={svgPaths.p34810300} fill="var(--fill-0, #002970)" id="more_vert_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame57() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <MoreVert />
        </div>
      </div>
    </div>
  );
}

function MoreVert1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="more_vert">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_vert">
          <mask height="24" id="mask0_41_992" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_992)">
            <path d={svgPaths.p34810300} fill="var(--fill-0, #002970)" id="more_vert_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame58() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <MoreVert1 />
        </div>
      </div>
    </div>
  );
}

function MoreVert2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="more_vert">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_vert">
          <mask height="24" id="mask0_41_992" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_992)">
            <path d={svgPaths.p34810300} fill="var(--fill-0, #002970)" id="more_vert_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame59() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <MoreVert2 />
        </div>
      </div>
    </div>
  );
}

function MoreVert3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="more_vert">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_vert">
          <mask height="24" id="mask0_41_992" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_992)">
            <path d={svgPaths.p34810300} fill="var(--fill-0, #002970)" id="more_vert_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame60() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <MoreVert3 />
        </div>
      </div>
    </div>
  );
}

function MoreVert4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="more_vert">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_vert">
          <mask height="24" id="mask0_41_992" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_992)">
            <path d={svgPaths.p34810300} fill="var(--fill-0, #002970)" id="more_vert_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame61() {
  return (
    <div className="bg-[#f8f9fa] min-h-[48px] min-w-[45px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#dee2e6] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-center min-h-[inherit] min-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center min-h-[inherit] min-w-[inherit] p-[12px] relative w-full">
          <MoreVert4 />
        </div>
      </div>
    </div>
  );
}

function TableColumn6() {
  return (
    <div className="bg-[#eff4fc] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px overflow-clip relative" data-name="Table Column">
      <Frame56 />
      <Frame57 />
      <Frame58 />
      <Frame59 />
      <Frame60 />
      <Frame61 />
    </div>
  );
}

function Table() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-[720px] relative w-full" data-name="Table">
      <div className="content-stretch flex items-start min-w-[inherit] pr-[24px] relative size-full">
        <TableColumn />
        <TableColumn1 />
        <TableColumn2 />
        <TableColumn3 />
        <TableColumn4 />
        <TableColumn5 />
        <TableColumn6 />
      </div>
    </div>
  );
}

function M1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[32px] w-full" data-name="기본 레이아웃 M">
      <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip py-[24px] relative rounded-[inherit] size-full">
        <Frame27 />
        <Table />
      </div>
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function Frame10() {
  return (
    <div className="bg-white flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[32px]">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start p-[48px] relative size-full">
          <p className="font-['HD:Bold',sans-serif] leading-[1.35] not-italic relative shrink-0 text-[#212529] text-[28px]">권한 관리</p>
          <M />
          <M1 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[32px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-h-px min-w-px relative w-full">
      <SideMenuLayout />
      <Frame10 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#f8f9fa] content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full" data-name="권한 관리">
      <Header />
      <Frame9 />
    </div>
  );
}