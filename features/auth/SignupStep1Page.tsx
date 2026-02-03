import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Logo } from '../../shared/components/Logo';
import { Checkbox, RadioButton } from '../../shared/components/FormControls';
import { Button } from '../../shared/components/Button';

export default function SignupStep1Page() {
  const navigate = useNavigate();
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean | null>(null);

  const handleNext = () => {
    if (agreeTerms === true) {
      navigate('/signup/step2', { state: { termsAgreed: true } });
    } else {
      toast.error('개인정보 수집 및 이용에 동의해주세요.');
    }
  };

  return (
    <div className="bg-[var(--color-page-bg)] h-screen w-full flex items-center justify-center p-4 lg:p-[70px] overflow-hidden">
      <div className="w-full max-w-[1776px] max-h-full shadow-[var(--shadow-card)]">
        <div className="bg-white rounded-[var(--radius-card)] w-full max-h-[calc(100vh-32px)] lg:max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="overflow-clip rounded-[inherit] size-full">
            <div className="flex items-start p-3 lg:p-[24px] relative w-full">
              <div className="flex-1 min-h-px min-w-px rounded-[var(--radius-card)]">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="flex flex-col gap-3 lg:gap-[24px] items-start p-3 lg:p-[24px] relative w-full">
                    {/* Back Button + Logo */}
                    <div className="flex items-center gap-[12px] py-[24px] shrink-0 w-full">
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-[var(--color-surface-primary)] transition-colors"
                        aria-label="뒤로가기"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <Logo size="small" />
                    </div>

                    {/* Step Title */}
                    <div className="flex flex-col gap-[12px] items-start shrink-0 text-[var(--color-text-primary)]">
                      <p className="font-title-xxlarge leading-[0]">
                        <span className="leading-[1.4] text-[var(--color-primary-main)]">1단계</span>
                        <span className="leading-[1.4]">/2단계</span>
                      </p>
                      <p className="font-heading-small leading-[1.35]">개인정보 활용동의</p>
                    </div>

                    {/* Agreement Section */}
                    <div className="flex flex-col gap-[12px] items-start shrink-0 w-full">
                      <p className="font-title-medium leading-[1.4] text-[var(--color-text-primary)] w-full">
                        약관 동의
                      </p>
                      <div className="bg-[var(--color-surface-primary)] relative rounded-[24px] shrink-0 w-full">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="flex flex-col gap-[12px] items-start p-[24px] relative w-full">
                            <Checkbox
                              label="모두 동의합니다"
                              checked={agreeAll}
                              onChange={(checked) => {
                                setAgreeAll(checked);
                                setAgreeTerms(checked ? true : null);
                              }}
                            />
                            <div className="font-body-medium leading-[1.5] text-[var(--color-state-info-text)]">
                              <p className="mb-0">서비스 이용약관, 개인정보 수집 및 이용 항목에 모두 동의합니다.</p>
                              <p>선택 사항은 동의하지 않아도 서비스 이용이 가능합니다.</p>
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[var(--color-primary-border)] border-solid inset-0 pointer-events-none rounded-[24px]" />
                      </div>
                    </div>

                    {/* Terms Detail */}
                    <div className="flex flex-col gap-[12px] items-start shrink-0 w-full">
                      <p className="font-title-medium leading-[1.4] text-[var(--color-text-primary)] w-full">
                        [필수] 개인정보수집 및 이용
                      </p>
                      <div className="bg-white relative rounded-[24px] shrink-0 w-full max-h-[120px] lg:max-h-[200px] overflow-y-auto">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="flex flex-col gap-[12px] items-start p-[24px] text-[var(--color-text-primary)] w-full">
                            <p className="font-title-medium leading-[1.4]">약관동의 및 개인정보수집이용동의</p>
                            <div className="font-body-medium leading-[1.5]">
                              <ol className="list-decimal pl-[24px]">
                                <li>수집하는 개인정보 항목: 이름, 이메일, 비밀번호</li>
                                <li>수집 목적: 서비스 제공 및 회원 관리</li>
                                <li>보유 기간: 회원 탈퇴 시까지</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[var(--color-border-default)] border-solid inset-0 pointer-events-none rounded-[24px]" />
                      </div>
                    </div>

                    {/* Agreement Buttons */}
                    <div className="bg-[var(--color-surface-primary)] relative rounded-[24px] shrink-0 w-full">
                      <div className="overflow-clip rounded-[inherit] size-full">
                        <div className="flex flex-wrap gap-[10px] items-center p-[24px] relative w-full">
                          <p className="flex-1 font-body-medium leading-[1.5] min-w-[200px] text-[var(--color-state-info-text)]">
                            개인정보수집 및 이용에 대한 안내 사항을 읽고 동의합니다.
                          </p>
                          <div className="flex gap-[10px] items-center shrink-0">
                            <RadioButton
                              label="동의안함"
                              checked={agreeTerms === false}
                              onChange={() => setAgreeTerms(false)}
                              name="agree"
                            />
                            <RadioButton
                              label="동의함"
                              checked={agreeTerms === true}
                              onChange={() => setAgreeTerms(true)}
                              name="agree"
                            />
                          </div>
                        </div>
                      </div>
                      <div aria-hidden="true" className="absolute border border-[var(--color-primary-border)] border-solid inset-0 pointer-events-none rounded-[24px]" />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end w-full mt-4">
                      <div className="flex gap-[12px]">
                        <Button
                          type="button"
                          variant="secondary"
                          size="large"
                          onClick={() => navigate('/login')}
                        >
                          이전
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="large"
                          onClick={handleNext}
                        >
                          다음
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
