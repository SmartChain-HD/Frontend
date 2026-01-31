import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

export type JobStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress?: number;
  result?: unknown;
  errorMessage?: string;
}

export const getJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const response = await apiClient.get<BaseResponse<JobStatusResponse>>(`/v1/jobs/${jobId}`);
  return response.data.data;
};

export const retryJob = async (jobId: string): Promise<JobStatusResponse> => {
  const response = await apiClient.post<BaseResponse<JobStatusResponse>>(`/v1/jobs/${jobId}/retry`);
  return response.data.data;
};
