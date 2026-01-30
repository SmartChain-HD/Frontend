export default function Footer() {
  return (
    <div className="bg-[#dee2e6] h-auto min-h-[110px] w-full flex flex-col md:flex-row items-center justify-between px-[30px] py-[24px] gap-6">
      {/* Left Side */}
      <div className="flex flex-col gap-4 items-start">
        {/* SmartChain Logo */}
        <div className="w-[136px]">
          <p className="font-heading-small text-[#868e96]">
            SmartChain
          </p>
        </div>

        {/* Contact Info */}
        <div className="font-label-medium text-[#868e96]">
          <p className="mb-0">00시 00구 00로 00 (00동 000번지)</p>
          <div className="flex flex-col md:flex-row md:gap-4">
            <p className="mb-0">이메일 문의: test@test.co.kr</p>
            <p className="">현대중공업 협력사 문의: 1588-0000 (유료)</p>
          </div>
        </div>
      </div>

      {/* Right Side Info */}
      <div className="flex flex-col items-end gap-2 text-[#868e96] text-right">
        <p className="font-title-small">
          개인정보 처리방침 | 사이트 이용 약관
        </p>
        <p className="font-label-medium">
          Copyright © 2026 HD Corp.All rights reserved
        </p>
      </div>
    </div>
  );
}
