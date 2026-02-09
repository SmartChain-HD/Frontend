import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Logo } from '../../shared/components/Logo';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import Footer from '../../shared/layout/Footer';
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
    // [1] 전체 화면 고정
    <div className="bg-[var(--color-page-bg)] h-screen w-full flex flex-col overflow-hidden">
      
      {/* [2] 중앙 정렬 컨테이너 */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        
        {/* [3] 카드 컨테이너: max-h-[85vh]로 화면 높이의 85% 제한 (중요!) */}
        <div className="w-full max-w-[1400px] bg-white rounded-[24px] shadow-xl flex flex-col max-h-[85vh]">
          
          {/* Form: h-full로 설정하여 카드 높이만큼 꽉 채움 */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            
            {/* [Header] 고정 */}
            <div className="shrink-0 p-6 md:p-8 pb-4">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => navigate('/signup/step1')}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="뒤로가기"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <Logo size="small" />
              </div>
              
              <div className="flex flex-col gap-[12px] items-start shrink-0 text-[var(--color-text-primary)]">
                <p className="font-title-large leading-[0]">
                  <span className="leading-[1.4] text-[var(--color-primary-main)]">2단계</span>
                  <span className="leading-[1.4]">/2단계</span>
                </p>
                <p className="font-title-medium leading-[1.35]">개인정보입력</p>
              </div>
            </div>

            {/* [Body] 스크롤 영역: flex-1 overflow-y-auto */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-2">
              <div className="w-full max-w-[480px] mx-auto flex flex-col gap-6">
                
                {/* 이름 */}
                <div>
                  <Input
                    label="이름"
                    type="text"
                    placeholder="이름을 입력해주세요."
                    containerClassName="w-full"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-red-500 font-body-small mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* 이메일 & 인증 요청 버튼 */}
                <div>
                  <div className="flex gap-3 items-end w-full">
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
                      className="h-[56px] min-w-[100px]"
                      onClick={handleCheckAndSendVerification}
                      disabled={isVerificationLoading || emailVerified}
                    >
                      {emailVerified ? '인증완료' : isVerificationLoading ? '확인중...' : '인증요청'}
                    </Button>
                  </div>
                  {errors.email && (
                    <p className="text-red-500 font-body-small mt-1">{errors.email.message}</p>
                  )}
                  {emailAvailable === false && (
                    <p className="text-red-500 font-body-small mt-1">이미 사용 중인 이메일입니다.</p>
                  )}
                  {emailAvailable === true && !emailVerified && (
                    <p className="text-blue-600 font-body-small mt-1">사용 가능한 이메일입니다. 인증코드를 확인해주세요.</p>
                  )}
                  {emailVerified && (
                    <p className="text-green-600 font-body-small mt-1">이메일 인증이 완료되었습니다.</p>
                  )}
                </div>

                {/* 인증 코드 입력 (조건부 렌더링) - 여기가 늘어나도 스크롤만 생김 */}
                {showVerificationInput && !emailVerified && (
                  <div>
                    <div className="flex gap-3 items-end w-full">
                      <div className="flex-1 relative">
                        <Input
                          label="인증코드"
                          type="text"
                          placeholder="6자리 인증코드"
                          containerClassName="w-full"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                        />
                        {remainingSeconds > 0 && (
                          <span className="absolute right-4 top-[42px] font-body-small text-red-500">
                            {formatTime(remainingSeconds)}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-[56px] min-w-[80px]"
                        onClick={handleVerifyCode}
                        disabled={verifyEmailMutation.isPending || remainingSeconds <= 0}
                      >
                        {verifyEmailMutation.isPending ? '...' : '확인'}
                      </Button>
                    </div>
                    {remainingSeconds <= 0 && (
                      <p className="text-red-500 font-body-small mt-1">
                        인증코드가 만료되었습니다.
                        <button
                          type="button"
                          className="ml-2 underline text-blue-600 font-medium"
                          onClick={handleCheckAndSendVerification}
                        >
                          재발송
                        </button>
                      </p>
                    )}
                  </div>
                )}

                {/* 비밀번호 */}
                <div>
                  <Input
                    label="비밀번호"
                    type="password"
                    placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                    containerClassName="w-full"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-red-500 font-body-small mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <Input
                    label="비밀번호 확인"
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요."
                    containerClassName="w-full"
                    {...register('passwordConfirm')}
                  />
                  {errors.passwordConfirm && (
                    <p className="text-red-500 font-body-small mt-1">{errors.passwordConfirm.message}</p>
                  )}
                </div>

              </div>
            </div>

            {/* [Footer] 고정 영역 (버튼) */}
            <div className="shrink-0 p-6 md:p-8 pt-4 border-t border-gray-100 bg-white rounded-b-[24px]">
              <div className="flex justify-end gap-3">
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
            
          </form>
        </div>
      </div>

      {/* [4] 페이지 푸터 */}
      <div className="shrink-0 hidden md:block">
        <Footer />
      </div>
    </div>
  );
}