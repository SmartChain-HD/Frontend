import { z } from 'zod';

export const roleRequestSchema = z.object({
  requestedRole: z.enum(['DRAFTER', 'APPROVER', 'REVIEWER'], {
    errorMap: () => ({ message: '역할을 선택해주세요' }),
  }),
  companyId: z
    .number({
      errorMap: () => ({ message: '회사를 선택해주세요' }),
    })
    .positive(),
  reason: z.string().max(500, '사유는 500자 이내로 입력해주세요').optional(),
});

export type RoleRequestFormData = z.infer<typeof roleRequestSchema>;
