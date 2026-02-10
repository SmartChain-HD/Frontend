import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../shared/layout/Footer';
import './onboarding.css';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.ob-feature-card, .ob-process-step, .ob-impact-card').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="ob-page">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 py-3 md:py-6">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div
            className="text-white font-bold text-2xl md:text-4xl cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            SmartChain
          </div>
          <div className="flex gap-2 md:gap-4 items-center">
            <button onClick={() => navigate('/login')} className="ob-btn-primary ob-btn-header">
              시작하기
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="ob-hero min-h-screen flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(-45deg, #002554, #003087, #0052cc, #002970)',
          backgroundSize: '400% 400%',
        }}
      >
        <div className="container mx-auto px-6 py-30 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="ob-fade-in-up mb-8">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 mb-8">
                <p className="font-label-large text-[#DDE8F9]">
                  HD현대중공업 공급망 관리 솔루션
                </p>
              </div>
            </div>

            <h1 className="ob-fade-in-up ob-delay-1 font-display-large text-[7.2rem] text-white mb-[3.2rem]">
              SmartChain
            </h1>

            <p className="ob-fade-in-up ob-delay-2 font-heading-medium text-[#DDE8F9] mb-[4.8rem] max-w-[800px] mx-auto leading-[160%]">
              협력사 서류 검증을 자동으로<br />
              서류 제출부터 승인까지, 한 곳에서 관리하세요
            </p>

            <div className="ob-fade-in-up ob-delay-3 flex gap-4 justify-center flex-wrap">
              <button onClick={() => navigate('/login')} className="ob-btn-primary">
                시작하기
              </button>
              <button onClick={() => scrollTo('features')} className="ob-btn-secondary">
                자세히 보기
              </button>
            </div>

            <div className="ob-fade-in-up ob-delay-4 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="ob-float-1 ob-stat-card">
                <div className="ob-stat-number font-display-small text-[#00AD1D] mb-[0.8rem]">6.5배</div>
                <p className="font-body-medium text-[#DDE8F9]">관리 커버리지 확대</p>
              </div>
              <div className="ob-float-2 ob-stat-card">
                <div className="ob-stat-number font-display-small text-[#00AD1D] mb-[0.8rem]">90%</div>
                <p className="font-body-medium text-[#DDE8F9]">검증 시간 단축</p>
              </div>
              <div className="ob-float-3 ob-stat-card">
                <div className="ob-stat-number font-display-small text-[#00AD1D] mb-[0.8rem]">100%</div>
                <p className="font-body-medium text-[#DDE8F9]">서류 자동 검증</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white" id="problem">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="ob-section-title text-center">왜 SmartChain이 필요한가요?</h2>
            <p className="ob-section-subtitle text-center">관련 법규가 강화되면서, 협력사 서류 관리가 점점 더 까다로워지고 있습니다</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="ob-feature-card bg-gradient-to-br from-red-50 to-white p-10 rounded-[32px] border border-red-100">
                <div className="w-16 h-16 bg-[#FEF2F2] rounded-[20px] flex items-center justify-center mb-[2.4rem]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="font-heading-small text-[#B91C1C] mb-[1.6rem]">안전사고 처벌 강화</h3>
                <p className="font-body-medium text-[#495057]">
                  소규모 사업장까지 적용 확대, 안전 기준 상향 (2025)
                </p>
              </div>

              <div className="ob-feature-card bg-gradient-to-br from-orange-50 to-white p-10 rounded-[32px] border border-orange-100">
                <div className="w-16 h-16 bg-[#FFF8E1] rounded-[20px] flex items-center justify-center mb-[2.4rem]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                    <path d="M3 9h18" />
                  </svg>
                </div>
                <h3 className="font-heading-small text-[#E65100] mb-[1.6rem]">하도급 불공정 거래 단속 강화</h3>
                <p className="font-body-medium text-[#495057]">
                  불공정 계약 조항 무효화, 공정위 현장조사 본격화 (2025)
                </p>
              </div>

              <div className="ob-feature-card bg-gradient-to-br from-blue-50 to-white p-10 rounded-[32px] border border-blue-100">
                <div className="w-16 h-16 bg-[#EFF4FC] rounded-[20px] flex items-center justify-center mb-[2.4rem]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#002970" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </div>
                <h3 className="font-heading-small text-[#002970] mb-[1.6rem]">해외 수출 시 공급망 증빙 의무화</h3>
                <p className="font-body-medium text-[#495057]">
                  EU 거래를 위해 공급망 관리 증빙이 법적 필수 요건으로 지정
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section className="py-24 bg-gradient-to-b from-[#F8F9FA] to-white" id="features">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="ob-section-title text-center">SmartChain의 해결책</h2>
            <p className="ob-section-subtitle text-center">서류 제출부터 검증, 승인까지 모든 과정을 자동으로 처리합니다</p>

            {/* Core Feature */}
            <div className="ob-core-card mb-20">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-[24px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #003087, #002554)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading-large text-[#003087] mb-[0.4rem]">서류 자동 검증</h3>
                  <p className="font-body-medium text-[#6B7280]">파일 업로드부터 최종 검증까지 자동으로 처리</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: '자동 분류 & 검증', desc: 'PDF, 엑셀, 이미지 등 다양한 파일을 자동 분류하고 필수 항목을 체크합니다' },
                  { title: '다양한 문서 형식 지원', desc: '문서 형식에 맞는 최적의 방식으로 내용을 추출하고 검증합니다' },
                  { title: '검증 결과 한눈에 확인', desc: '항목별 검증 결과, 핵심 이슈, 재제출 안내를 한 화면에서 확인할 수 있습니다' },
                  { title: 'AI 보완요청 자동 작성', desc: 'AI가 부족한 부분을 찾아 보완요청 문구를 자동으로 작성해 줍니다' },
                ].map((item) => (
                  <div key={item.title} className="bg-gradient-to-br from-[#EFF4FC] to-[#F8F9FA] p-8 rounded-2xl border border-[#DDE8F9]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="ob-glow-dot bg-[#00AD1D] text-[#00AD1D]" />
                      <h4 className="font-title-large">{item.title}</h4>
                    </div>
                    <p className="font-body-medium text-[#495057]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub Services */}
            <h3 className="text-center mb-12 font-heading-large">도메인별 특화 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  gradient: 'linear-gradient(135deg, #003087, #002970)',
                  title: '컴플라이언스',
                  desc: '법률·사내 규정을 AI 챗봇으로 쉽게 검색\n관련 조항 요약 및 대응 방법 안내',
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  ),
                },
                {
                  gradient: 'linear-gradient(135deg, #00AD1D, #008233)',
                  title: 'ESG',
                  desc: '협력사 관련 외부 위험 요소 자동 탐지\n뉴스·공시 기반으로 위험 신호를 미리 감지',
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                      <polyline points="7.5 19.79 7.5 14.6 3 12" />
                      <polyline points="21 12 16.5 14.6 16.5 19.79" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  ),
                },
                {
                  gradient: 'linear-gradient(135deg, #FF8F00, #E65100)',
                  title: '안전보건',
                  desc: '이미지 분석으로 위험 상황 자동 탐지\n자동 검증으로 현장 실사 최소화',
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="ob-feature-card bg-white p-10 rounded-[32px] border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-[2.4rem]" style={{ background: item.gradient }}>
                    {item.icon}
                  </div>
                  <h4 className="font-heading-small mb-[1.6rem]">{item.title}</h4>
                  <p className="font-body-medium text-[#495057] whitespace-pre-line">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Journey / Process */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="ob-section-title text-center">역할별 최적화된 워크플로우</h2>
            <p className="ob-section-subtitle text-center">협력사부터 원청까지, 각 역할에 맞는 기능을 제공합니다</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  num: '1',
                  title: '게스트',
                  sub: '접근 권한 신청',
                  badgeGradient: 'linear-gradient(135deg, #6B7280, #4B5563)',
                  titleColor: '#4B5563',
                  borderColor: '#E5E7EB',
                  bgFrom: 'from-gray-50',
                  items: ['회사명/역할 입력', '승인 대기 상태 확인', '권한 부여 후 서비스 이용'],
                },
                {
                  num: '2',
                  title: '기안자',
                  sub: '협력사 작성 직원',
                  badgeGradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  titleColor: '#1D4ED8',
                  borderColor: '#BFDBFE',
                  bgFrom: 'from-blue-50',
                  items: ['파일 업로드 & 자동 분류', '필수 항목 체크리스트 확인', '1차 검증으로 품질 향상'],
                },
                {
                  num: '3',
                  title: '결재자',
                  sub: '협력사 팀장',
                  badgeGradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  titleColor: '#6D28D9',
                  borderColor: '#DDD6FE',
                  bgFrom: 'from-purple-50',
                  items: ['검증 결과 요약 확인', '승인/반려 빠른 결정', '대외 반려 리스크 차단'],
                },
                {
                  num: '4',
                  title: '수신자',
                  sub: '원청 수신자',
                  badgeGradient: 'linear-gradient(135deg, #00AD1D, #059669)',
                  titleColor: '#059669',
                  borderColor: '#A7F3D0',
                  bgFrom: 'from-emerald-50',
                  items: ['표준 기준 자동 심사', '보완요청 즉시 발송', '권한 관리 및 통제'],
                },
              ].map((step) => (
                <div key={step.num} className="ob-process-step">
                  <div className={`bg-gradient-to-br ${step.bgFrom} to-white p-8 rounded-[32px] border h-full`} style={{ borderColor: step.borderColor }}>
                    <div
                      className="ob-role-badge"
                      style={{ background: step.badgeGradient }}
                    >
                      <span className="font-heading-small text-white">{step.num}</span>
                    </div>
                    <h4 className="text-center mb-2 font-heading-medium" style={{ color: step.titleColor }}>{step.title}</h4>
                    <p className="text-center mb-6 font-body-small text-[#9CA3AF]">{step.sub}</p>
                    <ul className="font-body-small text-[#495057] list-none space-y-3">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="ob-glow-dot mt-[6px] shrink-0" style={{ background: step.titleColor, color: step.titleColor }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact / Results */}
      <section className="py-24 bg-gradient-to-b from-[#F8F9FA] to-[#EFF4FC]" id="impact">
        <div className="container mx-auto px-6">
          <div className="max-w-8xl mx-auto">
            <h2 className="ob-section-title text-center">검증된 기대 효과</h2>
            <p className="ob-section-subtitle text-center">도입 전후를 비교한 구체적인 개선 효과입니다</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="ob-impact-card">
                <div className="flex items-center gap-4 mb-8">
                  <div className="min-w-[10rem] h-20 px-6 rounded-[16px] flex items-center justify-center font-heading-large text-white" style={{ background: 'linear-gradient(135deg, #00AD1D, #008233)' }}>
                    6.5×
                  </div>
                  <h3 className="font-heading-medium text-[#003087]">관리 커버리지 확대</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: '현재:', text: '516개 사 관리 (물리적 한계)' },
                    { label: '개선:', text: '3,354개 사 전수 관리 체계 구축' },
                    { label: '방법:', text: '추가 인력 없이 시스템 자동화로 즉시 확장' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="ob-glow-dot bg-[#00AD1D] text-[#00AD1D]" />
                      <p className="font-body-medium text-[#495057]"><strong>{item.label}</strong> {item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ob-impact-card">
                <div className="flex items-center gap-6 mb-8">
                  <div className="min-w-[10rem] h-20 px-6 rounded-[16px] flex items-center justify-center font-heading-large text-white" style={{ background: 'linear-gradient(135deg, #003087, #002554)' }}>
                    90%
                  </div>
                  <h3 className="font-heading-medium text-[#003087]">검증 시간 단축</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: '현재:', text: '협력사 1개사당 120분 소요' },
                    { label: '개선:', text: '10분 이내로 단축 (자동 검증 1분 + 최종 승인 10분)' },
                    { label: '효과:', text: '담당자는 고위험군 최종 승인에만 집중' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="ob-glow-dot bg-[#003087] text-[#003087]" />
                      <p className="font-body-medium text-[#495057]"><strong>{item.label}</strong> {item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ob-impact-card md:col-span-2">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-[24px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF8F00, #E65100)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3 className="font-heading-medium text-[#003087]">법령 위반 리스크 사전 차단</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: '안전사고 예방', desc: '안전교육 미실시 사전 감지, 위험성평가 기록 자동 보관' },
                    { title: '하도급 거래 보호', desc: '불공정 계약 조항 탐지, 과징금 위험 사전 예방' },
                    { title: '감사 대응', desc: '모든 처리 과정과 수정 이력을 자동으로 기록' },
                  ].map((item) => (
                    <div key={item.title} className="bg-gradient-to-br from-[#FFF8E1] to-[#FFFBEB] p-6 rounded-2xl border border-[#FDE68A]">
                      <h4 className="font-title-medium text-[#E65100] mb-[1.2rem]">{item.title}</h4>
                      <p className="font-body-small text-[#495057]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ob-cta-section py-24 bg-gradient-to-br from-[#003087] via-[#002970] to-[#002554]">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-8 font-display-medium text-white">
              SmartChain과 함께<br />협력사 관리를 혁신하세요
            </h2>
            <p className="mb-12 font-body-large text-[#DDE8F9] leading-[160%]">
              서류 검증을 자동화하고<br />법령 위반 위험을 미리 차단하세요
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <button
                onClick={() => navigate('/login')}
                className="ob-btn-primary text-[2.0rem] py-[2rem] px-[4rem]"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
