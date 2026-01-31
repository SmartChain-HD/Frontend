import { z } from 'zod';

export const diagnosticCreateSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  campaignId: z.number({
    required_error: '캠페인을 선택해주세요',
    invalid_type_error: '캠페인을 선택해주세요',
  }).min(1, '캠페인을 선택해주세요'),
  domainCode: z.enum(['ESG', 'SAFETY', 'COMPLIANCE'], {
    errorMap: () => ({ message: '도메인을 선택해주세요' }),
  }),
  periodStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),
  periodEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),
});

export type DiagnosticCreateFormData = z.infer<typeof diagnosticCreateSchema>;
