import svgPaths from "./svg-pm46v78im3";

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
          <mask height="30" id="mask0_41_639" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="30" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="30" id="Bounding box" width="30" />
          </mask>
          <g mask="url(#mask0_41_639)">
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
          <mask height="30" id="mask0_41_635" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="30" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="30" id="Bounding box" width="30" />
          </mask>
          <g mask="url(#mask0_41_635)">
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
          <mask height="24" id="mask0_41_631" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_631)">
            <path d={svgPaths.pa81fa00} fill="var(--fill-0, #002970)" id="error_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[#eff4fc] relative rounded-[24px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-start p-[24px] relative w-full">
          <Error />
          <p className="font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#002554] text-[16px]">현재 권한: 게스트 권한입니다. 역할을 선택해주세요.</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function RadioButtonChecked() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="radio_button_checked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="radio_button_checked">
          <mask height="24" id="mask0_41_627" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_627)">
            <path d={svgPaths.pf1830f2} fill="var(--fill-0, #009619)" id="radio_button_checked_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function AssignmentAdd() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="assignment_add">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[10px] items-center px-[10px] py-[9px] relative size-full">
          <div className="h-[79px] relative shrink-0 w-[70px]" data-name="assignment_add">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 79">
              <path d={svgPaths.p93dc580} fill="var(--fill-0, #009619)" id="assignment_add" />
            </svg>
          </div>
          <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#008233] text-[14px]">기안자</p>
          <div className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#008233] text-[12px] text-center whitespace-nowrap">
            <p className="mb-0">ESG 기안표 작성</p>
            <p>기안 관리</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Component1() {
  return (
    <div className="bg-[#f0fdf4] relative rounded-[20px] shrink-0 size-[240px]" data-name="역할선택-선택">
      <div className="content-stretch flex flex-col gap-[10px] items-end overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <RadioButtonChecked />
        <AssignmentAdd />
      </div>
      <div aria-hidden="true" className="absolute border border-[#86efac] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function RadioButtonUnchecked() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="radio_button_unchecked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="radio_button_unchecked">
          <mask height="24" id="mask0_41_621" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_41_621)">
            <path d={svgPaths.p1ee5e230} fill="var(--fill-0, #ADB5BD)" id="radio_button_unchecked_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function AssignmentTurnedIn() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="assignment_turned_in">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
        <g id="assignment_turned_in">
          <mask height="80" id="mask0_41_617" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="80" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="80" id="Bounding box" width="80" />
          </mask>
          <g mask="url(#mask0_41_617)">
            <path d={svgPaths.p4e74e00} fill="var(--fill-0, #ADB5BD)" id="assignment_turned_in_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function AssignmentAdd1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="assignment_add">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[10px] items-center px-[10px] py-[9px] relative size-full">
          <AssignmentTurnedIn />
          <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#adb5bd] text-[14px]">결재자</p>
          <div className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#adb5bd] text-[12px] text-center whitespace-nowrap">
            <p className="mb-0">ESG 기안표 검토</p>
            <p>협력사 내 권한 관리</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Component2() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[20px] shrink-0 size-[240px]" data-name="역할선택-기본">
      <div className="content-stretch flex flex-col gap-[10px] items-end overflow-clip p-[12px] relative rounded-[inherit] size-full">
        <RadioButtonUnchecked />
        <AssignmentAdd1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#adb5bd] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex gap-[24px] items-start justify-center p-[24px] relative w-full">
          <Component1 />
          <Component2 />
        </div>
      </div>
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

function Menu1DepthSelect() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full" data-name="menu-1depth-select">
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[24px] py-[18px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#adb5bd] text-[14px] whitespace-pre-wrap">회사를 선택해주세요.</p>
          <KeyboardArrowDown />
        </div>
      </div>
    </div>
  );
}

function Menu2DepthSelect() {
  return (
    <div className="bg-[#f8f9fa] relative shrink-0 w-full" data-name="menu-2depth-select">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#212529] text-[14px] whitespace-pre-wrap">리스트 1</p>
        </div>
      </div>
    </div>
  );
}

function Menu2DepthSelect1() {
  return (
    <div className="bg-[#f8f9fa] relative shrink-0 w-full" data-name="menu-2depth-select">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#212529] text-[14px] whitespace-pre-wrap">리스트 2</p>
        </div>
      </div>
    </div>
  );
}

function Menu2DepthSelect2() {
  return (
    <div className="bg-[#f8f9fa] relative shrink-0 w-full" data-name="menu-2depth-select">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#212529] text-[14px] whitespace-pre-wrap">리스트 3</p>
        </div>
      </div>
    </div>
  );
}

function Menu2DepthSelect3() {
  return (
    <div className="bg-[#f8f9fa] relative shrink-0 w-full" data-name="menu-2depth-select">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center p-[12px] relative w-full">
          <p className="flex-[1_0_0] font-['HD:Medium',sans-serif] leading-none min-h-px min-w-px not-italic relative text-[#212529] text-[14px] whitespace-pre-wrap">리스트 4</p>
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[20px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[8px] relative w-full">
          <Menu2DepthSelect />
          <Menu2DepthSelect1 />
          <Menu2DepthSelect2 />
          <Menu2DepthSelect3 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function DropDown() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-[20px] shrink-0 w-full" data-name="DropDown">
      <Menu1DepthSelect />
      <Frame6 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <p className="font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[18px]">회사명</p>
      <DropDown />
    </div>
  );
}

function ButtonPrimary() {
  return (
    <div className="bg-[#003087] h-[64px] relative rounded-[20px] shrink-0 w-full" data-name="Button-Primary">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[4px] items-center justify-center px-[24px] relative size-full">
          <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white whitespace-nowrap">
            <p className="leading-[1.6]">권한요청</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-white flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[32px]">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start p-[48px] relative size-full">
          <p className="font-['HD:Bold',sans-serif] leading-[1.35] not-italic relative shrink-0 text-[#212529] text-[28px]">시스템 권한요청</p>
          <Frame7 />
          <Frame8 />
          <Frame9 />
          <ButtonPrimary />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center relative shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] shrink-0 w-[1392px]">
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Frame5 />
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#f8f9fa] content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full" data-name="시스템권한요청 - 요청페이지">
      <Header />
      <Frame4 />
    </div>
  );
}