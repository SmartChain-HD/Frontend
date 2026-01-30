import svgPaths from "./svg-vddsnwkpmt";

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <p className="col-1 css-ew64yg font-['HD:Bold',sans-serif] leading-none ml-0 mt-0 not-italic relative row-1 text-[#003087] text-[23.558px]">SmartChain</p>
    </div>
  );
}

function LogoTitleHorizontal() {
  return (
    <div className="content-stretch flex items-center py-[24px] relative shrink-0 w-full" data-name="logo-title-horizontal">
      <Group />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col font-['HD:Bold',sans-serif] gap-[12px] items-start not-italic relative shrink-0 text-[#212529]">
      <p className="css-ew64yg leading-[0] relative shrink-0 text-[24px]">
        <span className="leading-[1.4] text-[#003087]">1단계</span>
        <span className="leading-[1.4]">/2단계</span>
      </p>
      <p className="css-ew64yg leading-[1.35] relative shrink-0 text-[28px]">개인정보 활용동의</p>
    </div>
  );
}

function CheckBoxOutlineBlank() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="check_box_outline_blank">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="check_box_outline_blank">
          <mask height="24" id="mask0_1_2947" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #002970)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_1_2947)">
            <path d={svgPaths.p3b4f0880} fill="var(--fill-0, #002970)" id="check_box_outline_blank_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
      <CheckBoxOutlineBlank />
      <p className="css-ew64yg font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#002554] text-[16px]">모두 동의합니다</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[#eff4fc] relative rounded-[24px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start p-[24px] relative w-full">
          <Frame6 />
          <div className="css-g0mm18 font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#002554] text-[16px]">
            <p className="css-ew64yg mb-0">0000, 0000, 0000 항목에 모두 동의합니다.</p>
            <p className="css-ew64yg">선택 사항은 ....</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="css-4hzbpn font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[18px] w-full">약관 동의</p>
      <Frame5 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start not-italic p-[24px] relative text-[#212529] w-full">
          <p className="css-ew64yg font-['HD:Bold',sans-serif] leading-[1.4] relative shrink-0 text-[18px]">약관동의 및 개인정보수집이용동의</p>
          <div className="css-g0mm18 font-['HD:Medium',sans-serif] leading-[0] relative shrink-0 text-[16px]">
            <ol className="css-8097nc mb-0" start="1">
              <li className="css-4hzbpn mb-0 ms-[24px]">
                <span className="leading-[1.5]">{`수집하는 기간은 `}</span>
              </li>
              <li className="css-4hzbpn ms-[24px]">
                <span className="leading-[1.5]">보유 기간은</span>
              </li>
            </ol>
            <p className="css-ew64yg leading-[1.5] mb-0">&nbsp;</p>
            <p className="css-ew64yg leading-[1.5] mb-0">&nbsp;</p>
            <p className="css-ew64yg leading-[1.5] mb-0">&nbsp;</p>
            <p className="css-ew64yg leading-[1.5] mb-0">&nbsp;</p>
            <p className="css-ew64yg leading-[1.5]">&nbsp;</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dee2e6] border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="css-4hzbpn font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[18px] w-full">[필수] 개인정보수집 및 이용</p>
      <Frame9 />
    </div>
  );
}

function RadioButtonChecked() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="radio_button_checked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="radio_button_checked">
          <mask height="24" id="mask0_1_2939" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_1_2939)">
            <path d={svgPaths.pf1830f2} fill="var(--fill-0, #002970)" id="radio_button_checked_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
      <RadioButtonChecked />
      <p className="css-ew64yg font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#002554] text-[16px]">동의안함</p>
    </div>
  );
}

function RadioButtonUnchecked() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="radio_button_unchecked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="radio_button_unchecked">
          <mask height="24" id="mask0_1_2943" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_1_2943)">
            <path d={svgPaths.p1ee5e230} fill="var(--fill-0, #002970)" id="radio_button_unchecked_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
      <RadioButtonUnchecked />
      <p className="css-ew64yg font-['HD:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#002554] text-[16px]">동의함</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <Frame10 />
      <Frame7 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="bg-[#eff4fc] relative rounded-[24px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-start p-[24px] relative w-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['HD:Medium',sans-serif] leading-[1.5] min-h-px min-w-px not-italic relative text-[#002554] text-[16px]">개인정보수집 및 이용에 대한 안내 사항을 읽고 동의합니다.</p>
          <Frame8 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[48px]">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
          <LogoTitleHorizontal />
          <Frame4 />
          <Frame />
          <Frame1 />
          <Frame11 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-white relative rounded-[48px] shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start p-[24px] relative w-full">
          <Frame3 />
        </div>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] shrink-0 w-full">
      <Frame2 />
    </div>
  );
}

function Component() {
  return (
    <div className="absolute bg-[#f8f9fa] content-stretch flex flex-col h-[1080px] items-start left-0 overflow-clip p-[70px] top-0 w-[1920px]" data-name="회원가입 - 개인정보 활용동의">
      <Frame12 />
    </div>
  );
}

export default function Frame13() {
  return (
    <div className="relative size-full">
      <Component />
    </div>
  );
}