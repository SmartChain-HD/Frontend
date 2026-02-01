import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as authApi from '../api/auth';
import { getMyRoleRequests } from '../api/roles';
import { useAuthStore } from '../store/authStore';
import type { AuthUser } from '../store/authStore';
import { QUERY_KEYS } from '../constants/queryKeys';
import { handleApiError } from '../utils/errorHandler';
import type { ErrorResponse } from '../types/api.types';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      const user = data.user;
      toast.success(`${user.name}님, 환영합니다.`);
      if (!user.role || user.role.code === 'GUEST') {
        try {
          const myRequest = await getMyRoleRequests();
          if (myRequest && myRequest.status === 'PENDING') {
            navigate('/permission/status');
            return;
          }
        } catch {
          // 요청 조회 실패 시 기본 권한 요청 페이지로 이동
        }
        navigate('/permission/request');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다.');
      navigate('/login');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
};

export const useMe = () => {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: async () => {
      const data = await authApi.getMe();
      setUser(data as AuthUser);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: authApi.checkEmail,
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useSendVerification = () => {
  return useMutation({
    mutationFn: authApi.sendVerification,
    onSuccess: (data) => {
      toast.success(data.message || '인증 코드가 발송되었습니다.');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success('이메일 인증이 완료되었습니다.');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      handleApiError(error);
    },
  });
};
