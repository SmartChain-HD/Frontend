/* Dummy API 함수 테스트 용 */

import { apiRequest } from '@shared/api/apiRequest';

// Postman Echo 테스트용 함수
export const testStatusApi = (status: number) => {
  return apiRequest({
    endPoint: `/status/${status}`,
    method: 'GET',
  });
};