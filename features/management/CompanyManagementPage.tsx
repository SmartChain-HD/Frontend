import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Building2, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useCompanies, useRegisterCompany } from '../../src/hooks/useManagement';
import type { CompanyListParams, RegisterCompanyRequest } from '../../src/api/management';
import { z } from 'zod';

const companySchema = z.object({
  companyName: z.string().min(1, '회사명을 입력해주세요.').max(100, '회사명은 100자 이내로 입력해주세요.'),
  companyType: z.enum(['SUPPLIER', 'CONTRACTOR'], { required_error: '회사 유형을 선택해주세요.' }),
  businessNumber: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, '올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)')
    .optional()
    .or(z.literal('')),
  address: z.string().max(200, '주소는 200자 이내로 입력해주세요.').optional(),
  contactEmail: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
  contactPhone: z
    .string()
    .regex(/^(\d{2,3}-\d{3,4}-\d{4})?$/, '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678)')
    .optional()
    .or(z.literal('')),
});

type CompanyFormData = z.infer<typeof companySchema>;

const COMPANY_TYPE_OPTIONS = [
  { value: '', label: '전체 유형' },
  { value: 'SUPPLIER', label: '공급업체' },
  { value: 'CONTRACTOR', label: '협력업체' },
];

const getCompanyTypeLabel = (type: string) => {
  switch (type) {
    case 'SUPPLIER':
      return '공급업체';
    case 'CONTRACTOR':
      return '협력업체';
    default:
      return type;
  }
};

const getCompanyTypeBadge = (type: string) => {
  if (type === 'SUPPLIER') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full font-detail-small bg-[#e3f2fd] text-[#1565c0]">
        공급업체
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full font-detail-small bg-[#f3e5f5] text-[#7b1fa2]">
      협력업체
    </span>
  );
};

export default function CompanyManagementPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<CompanyListParams>({ page: 0, size: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    companyType: 'SUPPLIER',
    businessNumber: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({});

  const { data, isLoading, error } = useCompanies(params);
  const registerMutation = useRegisterCompany();

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, search: searchInput, page: 0 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTypeFilter = (type: string) => {
    setParams((prev) => ({
      ...prev,
      companyType: type ? (type as 'SUPPLIER' | 'CONTRACTOR') : undefined,
      page: 0,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBusinessNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 3) {
      formatted = digits;
    } else if (digits.length <= 5) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
    }
    handleInputChange('businessNumber', formatted);
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 6) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else if (digits.length <= 10) {
      if (digits.startsWith('02')) {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
      } else {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      }
    } else {
      if (digits.startsWith('02')) {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
      } else {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
      }
    }
    handleInputChange('contactPhone', formatted);
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      companyType: 'SUPPLIER',
      businessNumber: '',
      address: '',
      contactEmail: '',
      contactPhone: '',
    });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    resetForm();
    setShowRegisterModal(false);
  };

  const handleSubmit = () => {
    const result = companySchema.safeParse(formData);

    if (!result.success) {
      const errors: Partial<Record<keyof CompanyFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CompanyFormData;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    const requestData: RegisterCompanyRequest = {
      companyName: formData.companyName,
      companyType: formData.companyType,
      ...(formData.businessNumber && { businessNumber: formData.businessNumber }),
      ...(formData.address && { address: formData.address }),
      ...(formData.contactEmail && { contactEmail: formData.contactEmail }),
      ...(formData.contactPhone && { contactPhone: formData.contactPhone }),
    };

    registerMutation.mutate(requestData, {
      onSuccess: () => {
        handleCloseModal();
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white border-b border-[#dee2e6] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#495057]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003087] rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading-small text-[#212529]">회사 관리</h1>
                <p className="font-detail-small text-[#868e96]">협력사 및 공급업체를 관리합니다</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003087] text-white rounded-[10px] font-body-medium hover:bg-[#002266] transition-colors"
          >
            <Plus className="w-4 h-4" />
            회사 등록
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-[16px] p-4 mb-6 border border-[#dee2e6]">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[280px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adb5bd]" />
              <input
                type="text"
                placeholder="회사명으로 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border border-[#dee2e6] font-body-medium text-[#212529] placeholder:text-[#adb5bd] focus:outline-none focus:border-[#003087]"
              />
            </div>

            {/* Type Filter */}
            <select
              value={params.companyType || ''}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-[8px] border border-[#dee2e6] font-body-medium text-[#212529] focus:outline-none focus:border-[#003087] bg-white"
            >
              {COMPANY_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-[#003087] text-white rounded-[8px] font-body-medium hover:bg-[#002266] transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[16px] border border-[#dee2e6] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-[#003087] border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-body-medium text-[#dc3545] mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[#003087] font-body-medium hover:underline"
              >
                새로고침
              </button>
            </div>
          ) : !data?.content.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Building2 className="w-12 h-12 text-[#adb5bd] mb-4" />
              <p className="font-body-medium text-[#868e96] mb-4">등록된 회사가 없습니다.</p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003087] text-white rounded-[10px] font-body-medium hover:bg-[#002266] transition-colors"
              >
                <Plus className="w-4 h-4" />
                첫 번째 회사 등록하기
              </button>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                  <tr>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">회사명</th>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">유형</th>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">소속 사용자</th>
                    <th className="px-6 py-4 text-left font-title-small text-[#495057]">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((company) => (
                    <tr key={company.companyId} className="border-b border-[#dee2e6] last:border-b-0 hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#f8f9fa] rounded-full flex items-center justify-center border border-[#dee2e6]">
                            <Building2 className="w-4 h-4 text-[#868e96]" />
                          </div>
                          <p className="font-body-medium text-[#212529]">{company.companyName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getCompanyTypeBadge(company.companyType)}</td>
                      <td className="px-6 py-4">
                        <span className="font-body-medium text-[#495057]">{company.userCount}명</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-body-medium text-[#868e96]">
                          {company.createdAt
                            ? new Date(company.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data.page && data.page.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#dee2e6]">
                  <p className="font-detail-small text-[#868e96]">
                    총 {data.page.totalElements}개 중 {data.page.number * data.page.size + 1}-
                    {Math.min((data.page.number + 1) * data.page.size, data.page.totalElements)}개
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(data.page.number - 1)}
                      disabled={data.page.number === 0}
                      className="p-2 rounded-[6px] border border-[#dee2e6] hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#495057]" />
                    </button>
                    <span className="font-body-medium text-[#495057] px-3">
                      {data.page.number + 1} / {data.page.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(data.page.number + 1)}
                      disabled={data.page.number >= data.page.totalPages - 1}
                      className="p-2 rounded-[6px] border border-[#dee2e6] hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-[#495057]" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Register Company Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[24px] p-[32px] w-[560px] flex flex-col gap-[24px] shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="font-heading-small text-[#212529]">회사 등록</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-[#868e96]" />
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-[20px]">
              {/* Company Name */}
              <div className="flex flex-col gap-2">
                <label className="font-title-small text-[#212529]">
                  회사명 <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="회사명을 입력해주세요"
                  className={`w-full px-4 py-3 rounded-[12px] border font-body-medium text-[#212529] placeholder:text-[#adb5bd] focus:outline-none ${
                    formErrors.companyName ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#dee2e6] focus:border-[#003087]'
                  }`}
                />
                {formErrors.companyName && (
                  <p className="font-detail-small text-[#dc3545]">{formErrors.companyName}</p>
                )}
              </div>

              {/* Company Type */}
              <div className="flex flex-col gap-2">
                <label className="font-title-small text-[#212529]">
                  회사 유형 <span className="text-[#dc3545]">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('companyType', 'SUPPLIER')}
                    className={`flex-1 py-3 px-4 rounded-[12px] border-2 font-body-medium transition-all ${
                      formData.companyType === 'SUPPLIER'
                        ? 'border-[#003087] bg-[#e7f1ff] text-[#003087]'
                        : 'border-[#dee2e6] bg-white text-[#868e96] hover:border-[#adb5bd]'
                    }`}
                  >
                    공급업체
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('companyType', 'CONTRACTOR')}
                    className={`flex-1 py-3 px-4 rounded-[12px] border-2 font-body-medium transition-all ${
                      formData.companyType === 'CONTRACTOR'
                        ? 'border-[#003087] bg-[#e7f1ff] text-[#003087]'
                        : 'border-[#dee2e6] bg-white text-[#868e96] hover:border-[#adb5bd]'
                    }`}
                  >
                    협력업체
                  </button>
                </div>
              </div>

              {/* Business Number */}
              <div className="flex flex-col gap-2">
                <label className="font-title-small text-[#212529]">사업자등록번호</label>
                <input
                  type="text"
                  value={formData.businessNumber}
                  onChange={(e) => handleBusinessNumberChange(e.target.value)}
                  placeholder="000-00-00000"
                  maxLength={12}
                  className={`w-full px-4 py-3 rounded-[12px] border font-body-medium text-[#212529] placeholder:text-[#adb5bd] focus:outline-none ${
                    formErrors.businessNumber ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#dee2e6] focus:border-[#003087]'
                  }`}
                />
                {formErrors.businessNumber && (
                  <p className="font-detail-small text-[#dc3545]">{formErrors.businessNumber}</p>
                )}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="font-title-small text-[#212529]">주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="회사 주소를 입력해주세요"
                  className={`w-full px-4 py-3 rounded-[12px] border font-body-medium text-[#212529] placeholder:text-[#adb5bd] focus:outline-none ${
                    formErrors.address ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#dee2e6] focus:border-[#003087]'
                  }`}
                />
                {formErrors.address && <p className="font-detail-small text-[#dc3545]">{formErrors.address}</p>}
              </div>

              {/* Contact Email */}
              <div className="flex flex-col gap-2">
                <label className="font-title-small text-[#212529]">담당자 이메일</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                  className={`w-full px-4 py-3 rounded-[12px] border font-body-medium text-[#212529] placeholder:text-[#adb5bd] focus:outline-none ${
                    formErrors.contactEmail ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#dee2e6] focus:border-[#003087]'
                  }`}
                />
                {formErrors.contactEmail && (
                  <p className="font-detail-small text-[#dc3545]">{formErrors.contactEmail}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div className="flex flex-col gap-2">
                <label className="font-title-small text-[#212529]">담당자 연락처</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="02-0000-0000"
                  maxLength={13}
                  className={`w-full px-4 py-3 rounded-[12px] border font-body-medium text-[#212529] placeholder:text-[#adb5bd] focus:outline-none ${
                    formErrors.contactPhone ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#dee2e6] focus:border-[#003087]'
                  }`}
                />
                {formErrors.contactPhone && (
                  <p className="font-detail-small text-[#dc3545]">{formErrors.contactPhone}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseModal}
                disabled={registerMutation.isPending}
                className="flex-1 py-3.5 px-4 rounded-[12px] border border-[#dee2e6] font-body-medium text-[#495057] hover:bg-[#f8f9fa] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={registerMutation.isPending}
                className="flex-1 py-3.5 px-4 rounded-[12px] bg-[#003087] font-body-medium text-white hover:bg-[#002266] transition-colors disabled:opacity-50"
              >
                {registerMutation.isPending ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
