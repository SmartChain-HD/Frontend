import svgPaths from "./svg-le65mycy3s";

function Close() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path d={svgPaths.p2edaeb50} fill="var(--fill-0, #212529)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['HD:Bold',sans-serif] leading-[1.4] min-h-px min-w-px not-italic relative text-[#212529] text-[20px] whitespace-pre-wrap">권한 설정</p>
      <Close />
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

function Frame2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <RadioButtonUnchecked />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#212529] text-[14px]">승인</p>
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

function Frame3() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <RadioButtonChecked />
      <p className="font-['HD:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[#212529] text-[14px]">반려</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0">
      <Frame2 />
      <Frame3 />
    </div>
  );
}

function ButtonPrimary() {
  return (
    <div className="bg-[#002554] h-[64px] relative rounded-[20px] shrink-0 w-full" data-name="Button-Primary">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[4px] items-center justify-center px-[24px] relative size-full">
          <div className="flex flex-col font-['HD:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white whitespace-nowrap">
            <p className="leading-[1.6]">권한 설정</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] size-full" data-name="권한 관리 모달">
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[20px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)]" />
      <Frame />
      <Frame1 />
      <ButtonPrimary />
    </div>
  );
}