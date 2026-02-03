import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Logo } from '../../shared/components/Logo';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { useRegister, useCheckEmail, useSendVerification, useVerifyEmail } from '../../src/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../../src/validation/auth';

const VERIFICATION_TIMEOUT_SECONDS = 180; // 3분

export default function SignupStep2Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const termsAgreed = (location.state as { termsAgreed?: boolean })?.termsAgreed;

  const registerMutation = useRegister();
  const checkEmailMutation = useCheckEmail();
  const sendVerificationMutation = useSendVerification();
  const verifyEmailMutation = useVerifyEmail();

  const [verificationCode, setVerificationCode] = useState('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const watchedEmail = watch('email');

  // 이메일 변경 시 인증 상태 초기화
  useEffect(() => {
    setEmailAvailable(null);
    setEmailVerified(false);
    setShowVerificationInput(false);
    setVerificationCode('');
    setRemainingSeconds(0);
  }, [watchedEmail]);

  // 인증코드 타이머
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // 약관 미동의 시 Step1으로 리다이렉트
  if (!termsAgreed) {
    return <Navigate to="/signup/step1" replace />;
  }

  const handleCheckAndSendVerification = () => {
    if (!watchedEmail) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    checkEmailMutation.mutate(
      { email: watchedEmail },
      {
        onSuccess: (data) => {
          if (data.available) {
            setEmailAvailable(true);
            sendVerificationMutation.mutate(
              { email: watchedEmail },
              {
                onSuccess: (res) => {
                  setShowVerificationInput(true);
                  setRemainingSeconds(res.expiresInSeconds || VERIFICATION_TIMEOUT_SECONDS);
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
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('6자리 인증코드를 입력해주세요.');
      return;
    }

    if (remainingSeconds <= 0) {
      toast.error('인증코드가 만료되었습니다. 다시 요청해주세요.');
      return;
    }

    verifyEmailMutation.mutate(
      { email: watchedEmail, verificationCode },
      {
        onSuccess: (data) => {
          if (data.verified) {
            setEmailVerified(true);
            setRemainingSeconds(0);
          }
        },
      }
    );
  };

  const onSubmit = (data: RegisterFormData) => {
    if (!emailVerified) {
      toast.error('이메일 인증을 완료해주세요.');
      return;
    }

    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      terms: {
        privacyPolicyAgreed: true,
        serviceTermsAgreed: true,
      },
    });
  };

  const isVerificationLoading = checkEmailMutation.isPending || sendVerificationMutation.isPending;

  return (
    <div className="bg-[var(--color-page-bg)] h-screen w-full flex items-center justify-center p-4 lg:p-[70px] overflow-hidden">
      <div className="w-full max-w-[1776px] max-h-full shadow-[var(--shadow-card)]">
        <div className="bg-white rounded-[var(--radius-card)] w-full max-h-[calc(100vh-32px)] lg:max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="flex flex-col items-end justify-end overflow-clip rounded-[inherit] size-full">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-end justify-end p-3 lg:p-[24px] relative size-full">
              {/* Main Content */}
              <div className="flex-1 min-h-px min-w-px rounded-[var(--radius-card)] w-full">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="flex flex-col items-start p-3 lg:p-[24px] size-full">
                    <div className="flex flex-col gap-3 lg:gap-[24px] items-start shrink-0 w-full">
                      {/* Logo */}
                      <div className="flex items-center py-[24px] shrink-0 w-full">
                        <Logo size="small" />
                      </div>

                      {/* Step Title */}
                      <div className="flex flex-col gap-[12px] items-start shrink-0 text-[var(--color-text-primary)]">
                        <p className="font-title-xxlarge leading-[0]">
                          <span className="leading-[1.4] text-[var(--color-primary-main)]">2단계</span>
                          <span className="leading-[1.4]">/2단계</span>
                        </p>
                        <p className="font-heading-small leading-[1.35]">개인정보입력</p>
                      </div>

                      {/* Form */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-full">
                        <div className="flex flex-col gap-3 lg:gap-[24px] items-center justify-center shrink-0 w-full max-w-[480px]">
                          {/* Name */}
                          <div className="w-full">
                            <Input
                              label="이름"
                              type="text"
                              placeholder="이름을 입력해주세요."
                              containerClassName="w-full"
                              {...register('name')}
                            />
                            {errors.name && (
                              <p className="text-red-500 font-detail-small mt-1">{errors.name.message}</p>
                            )}
                          </div>

                          {/* Email with Verification Button */}
                          <div className="w-full">
                            <div className="flex gap-[10px] items-end w-full">
                              <Input
                                label="이메일"
                                type="email"
                                placeholder="회사 이메일을 입력해주세요."
                                containerClassName="flex-1"
                                {...register('email')}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-[56px]"
                                onClick={handleCheckAndSendVerification}
                                disabled={isVerificationLoading || emailVerified}
                              >
                                {emailVerified ? '인증완료' : isVerificationLoading ? '확인중...' : '인증요청'}
                              </Button>
                            </div>
                            {errors.email && (
                              <p className="text-red-500 font-detail-small mt-1">{errors.email.message}</p>
                            )}
                            {emailAvailable === false && (
                              <p className="text-red-500 font-detail-small mt-1">이미 사용 중인 이메일입니다.</p>
                            )}
                            {emailAvailable === true && !emailVerified && (
                              <p className="text-[var(--color-success-main)] font-detail-small mt-1">사용 가능한 이메일입니다. 인증코드를 확인해주세요.</p>
                            )}
                            {emailVerified && (
                              <p className="text-[var(--color-success-main)] font-detail-small mt-1">이메일 인증이 완료되었습니다.</p>
                            )}
                          </div>

                          {/* Verification Code Input */}
                          {showVerificationInput && !emailVerified && (
                            <div className="w-full">
                              <div className="flex gap-[10px] items-end w-full">
                                <div className="flex-1 relative">
                                  <Input
                                    label="인증코드"
                                    type="text"
                                    placeholder="6자리 인증코드를 입력해주세요."
                                    containerClassName="w-full"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    maxLength={6}
                                  />
                                  {remainingSeconds > 0 && (
                                    <span className="absolute right-4 top-[42px] font-detail-small text-[var(--color-state-error-text)]">
                                      {formatTime(remainingSeconds)}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="h-[56px]"
                                  onClick={handleVerifyCode}
                                  disabled={verifyEmailMutation.isPending || remainingSeconds <= 0}
                                >
                                  {verifyEmailMutation.isPending ? '확인중...' : '확인'}
                                </Button>
                              </div>
                              {remainingSeconds <= 0 && (
                                <p className="text-[var(--color-state-error-text)] font-detail-small mt-1">
                                  인증코드가 만료되었습니다.
                                  <button
                                    type="button"
                                    className="ml-2 underline text-[var(--color-primary-main)]"
                                    onClick={handleCheckAndSendVerification}
                                  >
                                    재발송
                                  </button>
                                </p>
                              )}
                            </div>
                          )}

                          {/* Password */}
                          <div className="w-full">
                            <Input
                              label="비밀번호"
                              type="password"
                              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                              containerClassName="w-full"
                              {...register('password')}
                            />
                            {errors.password && (
                              <p className="text-red-500 font-detail-small mt-1">{errors.password.message}</p>
                            )}
                          </div>

                          {/* Password Confirm */}
                          <div className="w-full">
                            <Input
                              label="비밀번호 확인"
                              type="password"
                              placeholder="비밀번호를 다시 입력해주세요."
                              containerClassName="w-full"
                              {...register('passwordConfirm')}
                            />
                            {errors.passwordConfirm && (
                              <p className="text-red-500 font-detail-small mt-1">{errors.passwordConfirm.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="shrink-0 w-full">
                <div className="flex flex-col items-end size-full">
                  <div className="flex flex-col items-end p-[24px] w-full">
                    <div className="flex gap-[12px]">
                      <Button
                        type="button"
                        variant="secondary"
                        size="large"
                        onClick={() => navigate('/signup/step1')}
                      >
                        이전
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        disabled={registerMutation.isPending || !emailVerified}
                      >
                        {registerMutation.isPending ? '가입 중...' : '회원가입'}
                      </Button>
                    </div>
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
