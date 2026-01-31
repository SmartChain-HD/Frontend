import { useState } from 'react';
import { Logo } from '../../shared/components/Logo';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { useRegister, useCheckEmail, useSendVerification, useVerifyEmail } from '../../src/hooks/useAuth';

export default function SignupStep2Page() {
  const registerMutation = useRegister();
  const checkEmailMutation = useCheckEmail();
  const sendVerificationMutation = useSendVerification();
  const verifyEmailMutation = useVerifyEmail();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email') {
      setEmailAvailable(null);
      setEmailVerified(false);
      setShowVerificationInput(false);
    }
  };

  const handleCheckAndSendVerification = () => {
    if (!formData.email) return;

    checkEmailMutation.mutate(
      { email: formData.email },
      {
        onSuccess: (data) => {
          if (data.available) {
            setEmailAvailable(true);
            sendVerificationMutation.mutate(
              { email: formData.email },
              {
                onSuccess: () => {
                  setShowVerificationInput(true);
                },
              }
            );
          } else {
            setEmailAvailable(false);
          }
        },
      }
    );
  };

  const handleVerifyCode = () => {
    verifyEmailMutation.mutate(
      { email: formData.email, verificationCode },
      {
        onSuccess: (data) => {
          if (data.verified) {
            setEmailVerified(true);
          }
        },
      }
    );
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      terms: {
        privacyPolicyAgreed: true,
        serviceTermsAgreed: true,
      },
    });
  };

  return (
    <div className="absolute bg-[var(--color-page-bg)] content-stretch flex flex-col h-[1080px] items-start left-0 overflow-clip p-[70px] top-0 w-[1920px]">
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative shadow-[var(--shadow-card)] w-full">
        <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[var(--radius-card)] w-full">
          <div className="flex flex-col items-end justify-end overflow-clip rounded-[inherit] size-full">
            <form onSubmit={handleSignup} className="content-stretch flex flex-col items-end justify-end p-[24px] relative size-full">
              {/* Main Content */}
              <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[var(--radius-card)] w-full">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex flex-col items-start p-[24px] relative size-full">
                    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                      {/* Logo */}
                      <div className="content-stretch flex items-center py-[24px] relative shrink-0 w-full">
                        <Logo size="small" />
                      </div>

                      {/* Step Title */}
                      <div className="content-stretch flex flex-col gap-[12px] items-start not-italic relative shrink-0 text-[var(--color-text-primary)]">
                        <p className="css-ew64yg font-title-xxlarge leading-[0]">
                          <span className="leading-[1.4] text-[var(--color-primary-main)]">2단계</span>
                          <span className="leading-[1.4]">/2단계</span>
                        </p>
                        <p className="css-ew64yg font-heading-small leading-[1.35]">개인정보입력</p>
                      </div>

                      {/* Form */}
                      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full">
                        <div className="content-stretch flex flex-col gap-[24px] items-center justify-center relative shrink-0 w-[480px]">
                          {/* Name */}
                          <Input
                            label="이름"
                            type="text"
                            placeholder="이름을 입력해주세요."
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            containerClassName="w-full"
                            required
                          />

                          {/* Email with Verification Button */}
                          <div className="content-stretch flex gap-[10px] items-end relative shrink-0 w-full">
                            <Input
                              label="이메일"
                              type="email"
                              placeholder="회사 이메일을 입력해주세요."
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              containerClassName="w-[360px]"
                              required
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-[56px]"
                              onClick={handleCheckAndSendVerification}
                              disabled={checkEmailMutation.isPending || sendVerificationMutation.isPending || emailVerified}
                            >
                              {emailVerified ? '인증완료' : '인증요청'}
                            </Button>
                          </div>
                          {emailAvailable === false && (
                            <p className="text-red-500 font-detail-small w-full">이미 사용 중인 이메일입니다.</p>
                          )}

                          {/* Verification Code Input */}
                          {showVerificationInput && !emailVerified && (
                            <div className="content-stretch flex gap-[10px] items-end relative shrink-0 w-full">
                              <Input
                                label="인증코드"
                                type="text"
                                placeholder="6자리 인증코드를 입력해주세요."
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                containerClassName="w-[360px]"
                                maxLength={6}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-[56px]"
                                onClick={handleVerifyCode}
                                disabled={verifyEmailMutation.isPending}
                              >
                                확인
                              </Button>
                            </div>
                          )}

                          {/* Password */}
                          <Input
                            label="비밀번호"
                            type="password"
                            placeholder="비밀번호를 입력해주세요."
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            containerClassName="w-full"
                            required
                          />

                          {/* Password Confirm */}
                          <Input
                            label="비밀번호 확인"
                            type="password"
                            placeholder="비밀번호를 다시 입력해주세요."
                            value={formData.passwordConfirm}
                            onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                            containerClassName="w-full"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="relative shrink-0 w-full">
                <div className="flex flex-col items-end size-full">
                  <div className="content-stretch flex flex-col items-end p-[24px] relative w-full">
                    <Button
                      type="submit"
                      variant="primary"
                      size="large"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? '가입 중...' : '회원가입'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
