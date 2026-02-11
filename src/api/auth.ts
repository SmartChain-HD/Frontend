import { apiClient } from './client';
import { useAuthStore } from '../store/authStore';
import type {
  BaseResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  EmailCheckRequest,
  EmailCheckResponse,
  SendVerificationRequest,
  SendVerificationResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  MyInfoResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../types/api.types';
import type { AuthUser } from '../store/authStore';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<BaseResponse<LoginResponse>>('/v1/auth/login', data);
  const result = response.data.data;
  useAuthStore.getState().setTokens(result.accessToken, result.refreshToken);
  useAuthStore.getState().setUser(result.user as AuthUser);
  return result;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<BaseResponse<RegisterResponse>>('/v1/auth/register', data);
  return response.data.data;
};

export const checkEmail = async (data: EmailCheckRequest): Promise<EmailCheckResponse> => {
  const response = await apiClient.post<BaseResponse<EmailCheckResponse>>('/v1/auth/check-email', data);
  return response.data.data;
};

export const sendVerification = async (data: SendVerificationRequest): Promise<SendVerificationResponse> => {
  const response = await apiClient.post<BaseResponse<SendVerificationResponse>>('/v1/auth/send-verification', data);
  return response.data.data;
};

export const verifyEmail = async (data: EmailVerificationRequest): Promise<EmailVerificationResponse> => {
  const response = await apiClient.post<BaseResponse<EmailVerificationResponse>>('/v1/auth/verify-email', data);
  return response.data.data;
};

export const refreshToken = async (token: string): Promise<boolean> => {
  try {
    const response = await apiClient.post<BaseResponse<{ accessToken: string; refreshToken: string }>>(
      '/v1/auth/refresh',
      { refreshToken: token }
    );
    const { accessToken, refreshToken: newRefresh } = response.data.data;
    useAuthStore.getState().setTokens(accessToken, newRefresh);
    return true;
  } catch {
    useAuthStore.getState().logout();
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const { refreshToken } = useAuthStore.getState();
    if (refreshToken) {
      await apiClient.post('/v1/auth/logout', { refreshToken });
    }
  } finally {
    useAuthStore.getState().logout();
  }
};

export const getMe = async (): Promise<MyInfoResponse> => {
  const response = await apiClient.get<BaseResponse<MyInfoResponse>>('/v1/auth/me');
  return response.data.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<BaseResponse<ChangePasswordResponse>>('/v1/auth/change-password', data);
  return response.data.data;
};
