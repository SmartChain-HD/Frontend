/* Dummy API 함수 테스트 용 페이지 */
import { testStatusApi } from '@features/login/api/dummyApi';
import { ApiRequestError } from '@shared/api/apiRequest';

export default function DummyPage() {
  const handleTest = async (code: number) => {
    try {
      console.log(`테스트 시작: ${code}`);
      await testStatusApi(code);
      alert(`${code} 요청 성공!`);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        // 여기서 Postman이 던진 상태 코드를 잡아냅니다.
        alert(`에러 감지! 상태 코드: ${error.status}\n메시지: ${error.message}`);
        
        if (error.status === 403) {
          console.error("접근 권한이 없는 사용자입니다.");
        }
      }
    }
  };

  return (
    <div className="p-20 flex flex-col gap-4">
      <h1 className="font-headline1 mb-4 text-black70">Postman API 테스트</h1>
      
      <button 
        onClick={() => handleTest(200)}
        className="h-12 bg-green-600 text-black70 rounded-lg font-button4"
      >
        200 OK 테스트
      </button>

      <button 
        onClick={() => handleTest(403)}
        className="h-12 bg-red-600 text-black70 rounded-lg font-button4"
      >
        403 Forbidden 테스트
      </button>

      <button 
        onClick={() => handleTest(401)}
        className="h-12 bg-yellow-600 text-black70 rounded-lg font-button4"
      >
        401 Unauthorized 테스트
      </button>
    </div>
  );
};