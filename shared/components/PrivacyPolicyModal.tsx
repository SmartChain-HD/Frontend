import { useEffect } from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
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
          <h2 className="font-heading-small text-[var(--color-text-primary)]">개인정보 처리방침</h2>
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
              <p>본 방침은 SmartChain(이하 "서비스")이 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내하며, 이용자의 권리와 의무를 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제2조 (수집하는 개인정보 항목)</h3>
              <p>서비스는 회원가입 및 서비스 이용을 위해 다음의 개인정보를 수집합니다.</p>
              <ul className="list-disc pl-[20px] mt-[8px]">
                <li>필수항목: 이름, 이메일 주소, 비밀번호</li>
                <li>선택항목: 회사명, 부서, 직책</li>
                <li>자동 수집 항목: 접속 IP, 접속 일시, 서비스 이용 기록</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제3조 (개인정보의 수집 및 이용 목적)</h3>
              <ul className="list-disc pl-[20px]">
                <li>회원 가입 및 관리: 본인 확인, 서비스 제공, 공지사항 전달</li>
                <li>서비스 제공: 협력사 통합관리 서비스 제공, 기안 및 결재 처리</li>
                <li>서비스 개선: 서비스 이용 통계 분석, 신규 서비스 개발</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제4조 (개인정보의 보유 및 이용 기간)</h3>
              <p>이용자의 개인정보는 수집·이용 목적이 달성된 후 지체 없이 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우에는 해당 법령에서 정한 기간 동안 보관합니다.</p>
              <ul className="list-disc pl-[20px] mt-[8px]">
                <li>회원 탈퇴 시: 즉시 파기</li>
                <li>전자상거래 관련 기록: 5년 (전자상거래법)</li>
                <li>접속 기록: 3개월 (통신비밀보호법)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제5조 (개인정보의 제3자 제공)</h3>
              <p>서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 경우는 예외로 합니다.</p>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제6조 (이용자의 권리)</h3>
              <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제를 요청할 수 있으며, 회원 탈퇴를 통해 개인정보 처리 정지를 요청할 수 있습니다.</p>
            </section>

            <section>
              <h3 className="font-title-medium mb-[8px]">제7조 (개인정보 보호책임자)</h3>
              <ul className="list-disc pl-[20px]">
                <li>담당부서: 정보보호팀</li>
                <li>이메일: privacy@smartchain.co.kr</li>
              </ul>
            </section>

            <p className="text-[var(--color-text-tertiary)] font-detail-small">본 방침은 2026년 1월 1일부터 시행됩니다.</p>
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
