import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

export interface UploadFileResponse {
  fileId: number;
  jobId: string;
  fileName: string;
  message: string;
}

export interface ParsingResultResponse {
  fileId: number;
  fileName: string;
  parsedAt: string;
  slotHints: Array<{ slotName: string; confidence: number }>;
  extractedText?: string;
}

export const uploadFile = async (
  diagnosticId: number,
  file: File
): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<BaseResponse<UploadFileResponse>>(
    `/v1/diagnostics/${diagnosticId}/files`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }
  );
  return response.data.data;
};

export const getParsingResult = async (
  diagnosticId: number,
  fileId: number
): Promise<ParsingResultResponse> => {
  const response = await apiClient.get<BaseResponse<ParsingResultResponse>>(
    `/v1/diagnostics/${diagnosticId}/files/${fileId}/parsing-result`
  );
  return response.data.data;
};

export const getDownloadUrl = async (fileId: number): Promise<string> => {
  const response = await apiClient.get<BaseResponse<{ url: string }>>(`/v1/files/${fileId}/download-url`);
  return response.data.data.url;
};

export const deleteFile = async (fileId: number): Promise<void> => {
  await apiClient.delete(`/v1/files/${fileId}`);
};

export const getPackageUrl = async (diagnosticId: number): Promise<string> => {
  const response = await apiClient.get<BaseResponse<{ url: string }>>(
    `/v1/files/diagnostics/${diagnosticId}/package-url`
  );
  return response.data.data.url;
};
