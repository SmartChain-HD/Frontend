import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

export interface UploadFileResponse {
  fileId: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  fileSizeLabel: string;
  uploadStatus: string;
  errorMessage: string | null;
  uploadedAt: string;
  jobId: string;
  statusCheckUrl: string;
}

export interface ParsingResultResponse {
  fileId: number;
  fileName: string;
  parsedAt: string;
  slotHints: Array<{ slotName: string; confidence: number }>;
  extractedText?: string;
}

export interface UploadOptions {
  onUploadProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export const uploadFile = async (
  diagnosticId: number,
  file: File,
  options?: UploadOptions
): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<BaseResponse<UploadFileResponse>>(
    `/v1/diagnostics/${diagnosticId}/files`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
      signal: options?.signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options?.onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onUploadProgress(percentCompleted);
        }
      },
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
