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

function Frame2() {
  return (
    <div className="content-stretch flex flex-col font-['HD:Bold',sans-serif] gap-[12px] items-start not-italic relative shrink-0 text-[#212529]">
      <p className="css-ew64yg leading-[0] relative shrink-0 text-[24px]">
        <span className="leading-[1.4] text-[#003087]">2단계</span>
        <span className="leading-[1.4]">/2단계</span>
      </p>
      <p className="css-ew64yg leading-[1.35] relative shrink-0 text-[28px]">개인정보입력</p>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0" data-name="Label">
      <p className="css-ew64yg font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[16px]">이름</p>
    </div>
  );
}

function BaseInput() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[56px] items-center px-[16px] relative rounded-[20px] shrink-0 w-[360px]" data-name="Base-input">
      <div aria-hidden="true" className="absolute border border-[#868e96] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <p className="css-4hzbpn flex-[1_0_0] font-['HD:Medium',sans-serif] leading-[1.5] min-h-px min-w-px not-italic relative text-[#adb5bd] text-[16px]">이름을 입력해주세요.</p>
    </div>
  );
}

function TextFieldShort() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[480px]" data-name="TextField-short">
      <Label />
      <BaseInput />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0" data-name="Label">
      <p className="css-ew64yg font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[16px]">이메일</p>
    </div>
  );
}

function BaseInput1() {
  return (
    <div className="bg-white h-[56px] relative rounded-[20px] shrink-0 w-full" data-name="Base-input">
      <div aria-hidden="true" className="absolute border border-[#868e96] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[16px] relative size-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['HD:Medium',sans-serif] leading-[1.5] min-h-px min-w-px not-italic relative text-[#adb5bd] text-[16px]">회사 이메일을 입력해주세요.</p>
        </div>
      </div>
    </div>
  );
}

function TextFieldShort1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[360px]" data-name="TextField-short">
      <Label1 />
      <BaseInput1 />
    </div>
  );
}

function ButtonSecondary() {
  return (
    <div className="bg-[#dde8f9] content-stretch flex gap-[4px] h-[56px] items-center justify-center px-[24px] relative rounded-[20px] shrink-0" data-name="Button-Secondary">
      <div aria-hidden="true" className="absolute border border-[#b0cbef] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="css-g0mm18 flex flex-col font-['HD:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#002970] text-[18px]">
        <p className="css-ew64yg leading-[1.6]">인증요청</p>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[10px] items-end relative shrink-0 w-[480px]">
      <TextFieldShort1 />
      <ButtonSecondary />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0" data-name="Label">
      <p className="css-ew64yg font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[16px]">비밀번호</p>
    </div>
  );
}

function BaseInput2() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[56px] items-center px-[16px] relative rounded-[20px] shrink-0 w-[360px]" data-name="Base-input">
      <div aria-hidden="true" className="absolute border border-[#868e96] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <p className="css-4hzbpn flex-[1_0_0] font-['HD:Medium',sans-serif] leading-[1.5] min-h-px min-w-px not-italic relative text-[#adb5bd] text-[16px]">비밀번호를 입력해주세요.</p>
    </div>
  );
}

function TextFieldShort2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[480px]" data-name="TextField-short">
      <Label2 />
      <BaseInput2 />
    </div>
  );
}

function Label3() {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative shrink-0" data-name="Label">
      <p className="css-ew64yg font-['HD:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#212529] text-[16px]">비밀번호 확인</p>
    </div>
  );
}

function BaseInput3() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[56px] items-center px-[16px] relative rounded-[20px] shrink-0 w-[360px]" data-name="Base-input">
      <div aria-hidden="true" className="absolute border border-[#868e96] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <p className="css-4hzbpn flex-[1_0_0] font-['HD:Medium',sans-serif] leading-[1.5] min-h-px min-w-px not-italic relative text-[#adb5bd] text-[16px]">비밀번호를 다시 입력해주세요.</p>
    </div>
  );
}

function TextFieldShort3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[480px]" data-name="TextField-short">
      <Label3 />
      <BaseInput3 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center relative shrink-0 w-[480px]">
      <TextFieldShort />
      <Frame5 />
      <TextFieldShort2 />
      <TextFieldShort3 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full">
      <Frame4 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <LogoTitleHorizontal />
      <Frame2 />
      <Frame6 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[48px] w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[24px] relative size-full">
          <Frame7 />
        </div>
      </div>
    </div>
  );
}

function ButtonPrimary() {
  return (
    <div className="bg-[#003087] content-stretch flex gap-[4px] h-[64px] items-center justify-center px-[24px] relative rounded-[20px] shrink-0" data-name="Button-Primary">
      <div className="css-g0mm18 flex flex-col font-['HD:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white">
        <p className="css-ew64yg leading-[1.6]">회원가입</p>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-col items-end size-full">
        <div className="content-stretch flex flex-col items-end p-[24px] relative w-full">
          <ButtonPrimary />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[48px] w-full">
      <div className="flex flex-col items-end justify-end overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-end justify-end p-[24px] relative size-full">
          <Frame1 />
          <Frame8 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative shadow-[4px_4px_20px_0px_rgba(0,0,0,0.1)] w-full">
      <Frame />
    </div>
  );
}

function Component() {
  return (
    <div className="absolute bg-[#f8f9fa] content-stretch flex flex-col h-[1080px] items-start left-0 overflow-clip p-[70px] top-0 w-[1920px]" data-name="회원가입 - 개인정보입력">
      <Frame3 />
    </div>
  );
}

export default function Frame9() {
  return (
    <div className="relative size-full">
      <Component />
    </div>
  );
}