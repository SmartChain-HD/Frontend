import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { LogoWithSubtitle } from '../../shared/components/Logo';
import Footer from '../../shared/layout/Footer';
import { useChangePassword } from '../../src/hooks/useAuth';
import { changePasswordSchema, type ChangePasswordFormData } from '../../src/validation/auth';

function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#002554] to-[#0066cc] opacity-90" />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="bg-[var(--color-surface-primary)] flex-1 hidden lg:flex flex-col relative overflow-hidden rounded-l-[20px]">
      <LoginBackground />
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-6 text-center">
        <p className="font-body-large leading-[1.6] text-white mb-4">
          안전한 서비스 이용을 위해
          <br aria-hidden="true" />
          비밀번호를 변경해주세요.
        </p>
        <div className="flex flex-col items-center justify-center">
          <p className="font-display-medium text-white/80">SMARTCHAIN</p>
          <p className="font-display-large text-white">ESG Platform</p>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const location = useLocation();
  const isExpired = location.state?.expired === true;
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      newPasswordConfirm: data.newPasswordConfirm,
    });
  };

  return (
    <div className="bg-[var(--color-page-bg)] h-screen w-full flex flex-col overflow-y-auto md:overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 min-h-0">
        <div className="bg-white flex flex-col lg:flex-row w-full max-w-[1400px] h-auto md:h-full md:max-h-[700px] rounded-[20px] shadow-lg overflow-hidden">
          <LeftPanel />

          <div className="flex-1 w-full p-6 md:p-8 flex flex-col justify-center items-center">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[360px] flex flex-col gap-4 items-center">
              <div className="w-full flex flex-col gap-6 items-start">
                <div className="w-full flex justify-center lg:justify-start">
                  <LogoWithSubtitle />
                </div>

                {isExpired && (
                  <div className="w-full p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="font-title-small text-amber-700">비밀번호 변경 필요</p>
                    <p className="font-body-small text-amber-600 mt-1">
                      비밀번호 유효기간(90일)이 만료되었습니다. 새 비밀번호로 변경 후 서비스를 이용해주세요.
                    </p>
                  </div>
                )}

                <div className="w-full flex flex-col gap-4">
                  <div className="w-full">
                    <Input
                      label="현재 비밀번호"
                      type="password"
                      placeholder="현재 비밀번호를 입력해주세요."
                      containerClassName="w-full"
                      {...register('currentPassword')}
                    />
                    {errors.currentPassword && (
                      <p className="text-red-500 font-detail-small mt-1">{errors.currentPassword.message}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <Input
                      label="새 비밀번호"
                      type="password"
                      placeholder="새 비밀번호를 입력해주세요."
                      containerClassName="w-full"
                      {...register('newPassword')}
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 font-detail-small mt-1">{errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <Input
                      label="새 비밀번호 확인"
                      type="password"
                      placeholder="새 비밀번호를 다시 입력해주세요."
                      containerClassName="w-full"
                      {...register('newPasswordConfirm')}
                    />
                    {errors.newPasswordConfirm && (
                      <p className="text-red-500 font-detail-small mt-1">{errors.newPasswordConfirm.message}</p>
                    )}
                  </div>

                  <p className="font-detail-small text-[var(--color-text-tertiary)]">
                    비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    className="w-full font-title-small"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="large"
                    className="w-full font-title-small"
                    onClick={() => reset()}
                    disabled={changePasswordMutation.isPending}
                  >
                    초기화
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
