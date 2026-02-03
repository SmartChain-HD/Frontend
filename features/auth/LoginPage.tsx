import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { LogoWithSubtitle } from '../../shared/components/Logo';
import type { AxiosError } from 'axios';
import { useLogin } from '../../src/hooks/useAuth';
import { useAuthStore } from '../../src/store/authStore';
import { loginSchema, type LoginFormData } from '../../src/validation/auth';
import type { ErrorResponse } from '../../src/types/api.types';
import { getLoginErrorMessage } from '../../src/utils/errorHandler';
import svgPaths from "../../imports/svg-1z9x9otd1u";
import { imgGroup } from "../../imports/svg-cdk78";

function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] flex items-center justify-center pointer-events-none">
        <div className="flex-none rotate-[41.48deg] scale-y-88 skew-x-[-28.83deg] opacity-60">
             <div className="h-[2019.02px] relative w-[1419.932px]">
            <div className="absolute inset-[-6.82%_-9.7%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1695.39 2294.48">
                <g data-figma-bg-blur-radius="137.731" filter="url(#filter0_f_1_1231)">
                  <path clipRule="evenodd" d={svgPaths.p126f5b00} fill="url(#paint0_linear_1_1231)" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p126f5b00} fill="url(#paint1_radial_1_1231)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2294.48" id="filter0_f_1_1231" width="1695.39" x="6.34784e-06" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_1_1231" stdDeviation="68.8657" />
                  </filter>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_1231" x1="938.418" x2="938.418" y1="137.732" y2="2156.75">
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient cx="0" cy="0" gradientTransform="translate(938.416 1147.24) rotate(90) scale(1089.68 668.422)" gradientUnits="userSpaceOnUse" id="paint1_radial_1_1231" r="1">
                    <stop offset="0.0619708" stopColor="#E9E9E9" />
                    <stop offset="1" stopColor="#002554" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-cover bg-center mix-blend-soft-light opacity-50" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }} />
    </div>
  );
}

function HDLogo() {
  return (
    <div className="relative shrink-0 w-full flex justify-center pb-8">
      <div className="flex gap-[8px] items-center justify-center p-[24px]">
          <div className="h-[28.001px] w-[23.96px] relative" style={{ maskImage: `url('${imgGroup}')`, WebkitMaskImage: `url('${imgGroup}')`, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}>
             <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.96 28.001">
              <g>
                <path d={svgPaths.p20775f0} fill="white" />
              </g>
            </svg>
          </div>
          <div className="h-[18.782px] relative shrink-0 w-[74.122px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 74.122 18.782">
              <path d={svgPaths.p1d356c00} fill="white" />
            </svg>
          </div>
      </div>
    </div>
  );
}

function LoginLeftPanel() {
  return (
    <div className="bg-[var(--color-surface-primary)] flex-1 hidden lg:flex flex-col relative overflow-hidden rounded-t-[20px] lg:rounded-l-[20px] lg:rounded-tr-none">
        <LoginBackground />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-12 text-center">
            <p className="font-body-large leading-[1.6] text-black mb-8">
                임직원, 협력회사, 지역사회 등 이해관계자 모두와
                <br aria-hidden="true" />
                더 나은 미래를 함께 만들어 갑니다.
            </p>
            <div className="flex flex-col items-center justify-center">
                <p className="font-display-medium text-[var(--color-primary-dark)]">BEYOND BLUE</p>
                <div className="font-display-large text-[var(--color-success-main)]">
                <p className="mb-0">FORWARD</p>
                <p>TO GREEN</p>
                </div>
            </div>
        </div>

        <div className="relative z-10">
            <HDLogo />
        </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 이미 인증된 사용자는 대시보드로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleSignup = () => {
    navigate('/signup/step1');
  };

  return (
    <div className="bg-[var(--color-page-bg)] min-h-screen w-full flex items-center justify-center p-4 lg:p-[72px]">
      <div className="bg-white flex flex-col lg:flex-row w-full max-w-[1776px] min-h-[80vh] lg:h-[936px] rounded-[20px] shadow-lg overflow-hidden">
        <LoginLeftPanel />

        {/* Right Panel - Login Form */}
        <div className="flex-1 w-full p-8 lg:p-12 flex flex-col justify-center items-center h-full">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[400px] flex flex-col gap-[24px] items-center">
                <div className="w-full flex flex-col gap-[40px] items-start">
                    {/* Title */}
                    <div className="w-full flex justify-center lg:justify-start">
                         <LogoWithSubtitle />
                    </div>

                    {/* Form Fields */}
                    <div className="w-full flex flex-col gap-[24px]">
                    <div className="w-full">
                      <Input
                        label="이메일"
                        type="email"
                        placeholder="이메일을 입력해주세요."
                        containerClassName="w-full"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-red-500 font-detail-small mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="w-full">
                      <Input
                        label="비밀번호"
                        type="password"
                        placeholder="비밀번호를 입력해주세요."
                        containerClassName="w-full"
                        {...register('password')}
                      />
                      {errors.password && (
                        <p className="text-red-500 font-detail-small mt-1">{errors.password.message}</p>
                      )}
                    </div>
                    {loginMutation.isError && (
                      <p className="text-red-500 font-body-small">
                        {getLoginErrorMessage(loginMutation.error as AxiosError<ErrorResponse>)}
                      </p>
                    )}
                    <p className="font-detail-medium leading-none text-[var(--color-text-tertiary)] text-right w-full cursor-pointer hover:text-[var(--color-primary-main)]">
                        아이디 찾기 / 비밀번호 초기화
                    </p>
                    </div>

                    {/* Buttons */}
                    <div className="w-full flex flex-col gap-[12px]">
                    <Button
                      type="submit"
                      variant="primary"
                      size="large"
                      className="w-full font-title-small"
                      disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? '로그인 중...' : '로그인'}
                    </Button>
                    <Button type="button" variant="secondary" size="large" className="w-full font-title-small" onClick={handleSignup}>
                        회원가입
                    </Button>
                    </div>
                </div>

                <p className="font-body-small leading-none text-[var(--color-text-tertiary)] cursor-pointer hover:text-[var(--color-primary-main)] mt-auto pt-8">
                    개인정보 처리방침
                </p>
            </form>
        </div>
      </div>
    </div>
  );
}
