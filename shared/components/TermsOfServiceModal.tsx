import { useEffect } from 'react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-[20px] w-[calc(100vw-32px)] max-w-[640px] max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[#dee2e6] shrink-0">
          <h2 className="font-heading-small text-[var(--color-text-primary)]">사이트 이용약관</h2>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#f1f3f5] transition-colors"
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
          <div className="font-body-medium leading-[1.8] text-[var(--color-text-primary)] flex flex-col gap-[20px]">
            <section>
              <h3 className="font-title-medium mb-[8px]">제1조 (목적)</h3>
              <p>본 약관은 SmartChain(이하 &quot;서비스&quot;)의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제2조 (정의)</h3>
              <ul className="list-disc pl-[20px]">
                <li>&quot;서비스&quot;란 SmartChain이 제공하는 협력사 통합관리 플랫폼 및 관련 제반 서비스를 의미합니다.</li>
                <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
                <li>&quot;회원&quot;이란 서비스에 가입하여 이용자 계정을 부여받은 자를 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제3조 (약관의 효력 및 변경)</h3>
              <ul className="list-disc pl-[20px]">
                <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
                <li>서비스 제공자는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시 적용 일자 및 변경 사유를 명시하여 사전 공지합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제4조 (서비스의 제공)</h3>
              <p>서비스는 다음의 기능을 제공합니다.</p>
              <ul className="list-disc pl-[20px] mt-[8px]">
                <li>협력사 등록 및 관리</li>
                <li>기안 작성, 결재 및 승인 처리</li>
                <li>ESG 평가 및 관련 데이터 관리</li>
                <li>기타 서비스 제공자가 정하는 업무</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제5조 (이용자의 의무)</h3>
              <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
              <ul className="list-disc pl-[20px] mt-[8px]">
                <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
                <li>서비스의 운영을 방해하거나 안정성을 해치는 행위</li>
                <li>다른 이용자의 개인정보를 무단으로 수집, 저장, 공개하는 행위</li>
                <li>서비스를 이용하여 법령 또는 공서양속에 반하는 행위</li>
                <li>서비스 내 정보를 무단으로 변경하거나 삭제하는 행위</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제6조 (서비스 이용의 제한 및 중지)</h3>
              <p>서비스 제공자는 다음의 경우 서비스 이용을 제한하거나 중지할 수 있습니다.</p>
              <ul className="list-disc pl-[20px] mt-[8px]">
                <li>서비스 설비의 보수, 점검, 교체 등 부득이한 사유가 있는 경우</li>
                <li>이용자가 본 약관의 의무를 위반한 경우</li>
                <li>기타 천재지변, 국가비상사태 등 불가항력적 사유가 발생한 경우</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제7조 (면책 조항)</h3>
              <ul className="list-disc pl-[20px]">
                <li>서비스 제공자는 천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</li>
                <li>서비스 제공자는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
                <li>서비스 제공자는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못한 것에 대해 책임을 지지 않습니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제8조 (분쟁 해결)</h3>
              <p>서비스 이용과 관련하여 분쟁이 발생한 경우, 서비스 제공자와 이용자는 상호 협의하여 해결하도록 노력합니다. 협의가 이루어지지 않을 경우 관할 법원에 소를 제기할 수 있습니다.</p>
            </section>

            <p className="text-[var(--color-text-tertiary)] font-detail-small">본 약관은 2026년 1월 1일부터 시행됩니다.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-[24px] py-[16px] border-t border-[#dee2e6] shrink-0">
          <button
            onClick={onClose}
            className="w-full h-[48px] bg-[var(--color-primary-main)] text-white rounded-[var(--radius-default)] font-title-small hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
