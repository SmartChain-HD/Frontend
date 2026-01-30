import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../../shared/components/Logo';
import { Checkbox, RadioButton } from '../../shared/components/FormControls';

export default function SignupStep1Page() {
  const navigate = useNavigate();
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean | null>(null);

  const handleNext = () => {
    if (agreeTerms === true) {
      navigate('/signup/step2');
    } else {
      alert('개인정보 수집 및 이용에 동의해주세요.');
    }
  };

  return (
    <div className="absolute bg-[var(--color-page-bg)] content-stretch flex flex-col h-[1080px] items-start left-0 overflow-clip p-[70px] top-0 w-[1920px]">
      <div className="content-stretch flex flex-col items-start relative shadow-[var(--shadow-card)] shrink-0 w-full">
        <div className="bg-white relative rounded-[var(--radius-card)] shrink-0 w-full">
          <div className="overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-start p-[24px] relative w-full">
              {/* Content */}
              <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[var(--radius-card)]">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
                    {/* Logo */}
                    <div className="content-stretch flex items-center py-[24px] relative shrink-0 w-full">
                      <Logo size="small" />
                    </div>
                    
                    {/* Step Title */}
                    <div className="content-stretch flex flex-col gap-[12px] items-start not-italic relative shrink-0 text-[var(--color-text-primary)]">
                      <p className="css-ew64yg font-title-xxlarge leading-[0]">
                        <span className="leading-[1.4] text-[var(--color-primary-main)]">1단계</span>
                        <span className="leading-[1.4]">/2단계</span>
                      </p>
                      <p className="css-ew64yg font-heading-small leading-[1.35]">개인정보 활용동의</p>
                    </div>
                    
                    {/* Agreement Section */}
                    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                      <p className="css-4hzbpn font-title-medium leading-[1.4] not-italic relative shrink-0 text-[var(--color-text-primary)] w-full">
                        약관 동의
                      </p>
                      <div className="bg-[var(--color-surface-primary)] relative rounded-[24px] shrink-0 w-full">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col gap-[12px] items-start p-[24px] relative w-full">
                            <Checkbox
                              label="모두 동의합니다"
                              checked={agreeAll}
                              onChange={(checked) => {
                                setAgreeAll(checked);
                                setAgreeTerms(checked ? true : null);
                              }}
                            />
                            <div className="css-g0mm18 font-body-medium leading-[1.5] not-italic relative shrink-0 text-[var(--color-state-info-text)]">
                              <p className="css-ew64yg mb-0">0000, 0000, 0000 항목에 모두 동의합니다.</p>
                              <p className="css-ew64yg">선택 사항은 ....</p>
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[var(--color-primary-border)] border-solid inset-0 pointer-events-none rounded-[24px]" />
                      </div>
                    </div>
                    
                    {/* Terms Detail */}
                    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                      <p className="css-4hzbpn font-title-medium leading-[1.4] not-italic relative shrink-0 text-[var(--color-text-primary)] w-full">
                        [필수] 개인정보수집 및 이용
                      </p>
                      <div className="bg-white relative rounded-[24px] shrink-0 w-full max-h-[200px] overflow-y-auto">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col gap-[12px] items-start not-italic p-[24px] relative text-[var(--color-text-primary)] w-full">
                            <p className="css-ew64yg font-title-medium leading-[1.4]">약관동의 및 개인정보수집이용동의</p>
                            <div className="css-g0mm18 font-body-medium leading-[0]">
                              <ol className="css-8097nc mb-0" start={1}>
                                <li className="css-4hzbpn mb-0 ms-[24px]">
                                  <span className="leading-[1.5]">수집하는 기간은 ...</span>
                                </li>
                                <li className="css-4hzbpn ms-[24px]">
                                  <span className="leading-[1.5]">보유 기간은 ...</span>
                                </li>
                              </ol>
                              <p className="css-ew64yg leading-[1.5] mb-0">&nbsp;</p>
                              <p className="css-ew64yg leading-[1.5] mb-0">&nbsp;</p>
                              <p className="css-ew64yg leading-[1.5]">&nbsp;</p>
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[var(--color-border-default)] border-solid inset-0 pointer-events-none rounded-[24px]" />
                      </div>
                    </div>
                    
                    {/* Agreement Buttons */}
                    <div className="bg-[var(--color-surface-primary)] relative rounded-[24px] shrink-0 w-full">
                      <div className="overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex gap-[10px] items-start p-[24px] relative w-full">
                          <p className="css-4hzbpn flex-[1_0_0] font-body-medium leading-[1.5] min-h-px min-w-px not-italic relative text-[var(--color-state-info-text)]">
                            개인정보수집 및 이용에 대한 안내 사항을 읽고 동의합니다.
                          </p>
                          <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
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

                    {/* Next Button */}
                    <div className="flex justify-end w-full mt-4">
                      <button
                        onClick={handleNext}
                        className="bg-[var(--color-primary-main)] text-white font-body-large px-10 py-4 rounded-[var(--radius-default)] hover:bg-[var(--color-primary-dark)] transition-colors"
                      >
                        다음
                      </button>
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