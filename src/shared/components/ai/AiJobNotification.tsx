import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { JobStatus } from '../../../api/aiJobs';

interface AiJobNotificationProps {
  status: JobStatus;
  jobId: string;
}

export function AiJobNotification({ status, jobId }: AiJobNotificationProps) {
  const prevStatusRef = useRef<JobStatus>(status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev === status) return;

    if (status === 'SUCCEEDED') {
      toast.success('AI 분석이 완료되었습니다.', {
        description: `작업 ID: ${jobId}`,
      });
    }

    if (status === 'FAILED') {
      toast.error('AI 분석에 실패했습니다.', {
        description: `작업 ID: ${jobId}`,
      });
    }
  }, [status, jobId]);

  return null;
}
