import { apiClient } from './client';
import type { BaseResponse } from '../types/api.types';

export type JobStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export interface JobDetail {
  jobId: string;
  status: JobStatus;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export const getJobStatus = async (jobId: string): Promise<JobDetail> => {
  const response = await apiClient.get<BaseResponse<JobDetail>>(`/v1/jobs/${jobId}`);
  return response.data.data;
};

export const retryJob = async (jobId: string): Promise<JobDetail> => {
  const response = await apiClient.post<BaseResponse<JobDetail>>(`/v1/jobs/${jobId}/retry`);
  return response.data.data;
};
