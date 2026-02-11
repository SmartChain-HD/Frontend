import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './src/store/authStore';
import { useMe } from './src/hooks/useAuth';
import type { DomainCode } from './src/types/api.types';
import OnboardingPage from './features/onboarding/OnboardingPage';
import LoginPage from './features/auth/LoginPage';
import SignupStep1Page from './features/auth/SignupStep1Page';
import SignupStep2Page from './features/auth/SignupStep2Page';
import HomePage from './features/dashboard/HomePage';
import FileUploadPage from './features/documents/FileUploadPage';
import DocumentReviewPage from './features/documents/DocumentReviewPage';
import PermissionRequestPage from './features/permission/PermissionRequestPage';
import PermissionStatusPage from './features/permission/PermissionStatusPage';
import PermissionManagementPage from './features/permission/PermissionManagementPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import ApprovalDetailPage from './features/approvals/ApprovalDetailPage';
import DiagnosticsListPage from './features/diagnostics/DiagnosticsListPage';
import DiagnosticDetailPage from './features/diagnostics/DiagnosticDetailPage';
import DiagnosticCreatePage from './features/diagnostics/DiagnosticCreatePage';
import DiagnosticFilesPage from './features/diagnostics/DiagnosticFilesPage';
import ReviewsListPage from './features/reviews/ReviewsListPage';
import AiAnalysisPage from './features/documents/AiAnalysisPage';
import UserManagementPage from './features/management/UserManagementPage';
import CompanyManagementPage from './features/management/CompanyManagementPage';
import ActivityLogPage from './features/management/ActivityLogPage';
import ChangePasswordPage from './features/auth/ChangePasswordPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function MemberRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isGuest } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isGuest()) {
    return <Navigate to="/permission/request" replace />;
  }

  return <>{children}</>;
}

interface DomainProtectedRouteProps {
  children: React.ReactNode;
  domainCode: DomainCode;
}

function DomainProtectedRoute({ children, domainCode }: DomainProtectedRouteProps) {
  const { isAuthenticated, isGuest, hasDomainAccess } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isGuest()) {
    return <Navigate to="/permission/request" replace />;
  }

  if (!hasDomainAccess(domainCode)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(useAuthStore.persist.hasHydrated());

  // Wait for persist hydration to complete
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  // Fetch user info on app load if authenticated
  useMe();

  // Show loading until hydration is complete
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-[32px] h-[32px] border-[3px] border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getUserRoleForLegacy = (): 'receiver' | 'drafter' | 'approver' => {
    if (!user?.role) return 'drafter';
    const code = user.role.code;
    if (code === 'REVIEWER') return 'receiver';
    if (code === 'APPROVER') return 'approver';
    return 'drafter';
  };

  const legacyRole = getUserRoleForLegacy();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/step1" element={<SignupStep1Page />} />
      <Route path="/signup/step2" element={<SignupStep2Page />} />

      {/* Change Password */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Permission Routes */}
      <Route
        path="/permission/request"
        element={
          <ProtectedRoute>
            <PermissionRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permission/status"
        element={
          <ProtectedRoute>
            <PermissionStatusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/permission"
        element={
          <MemberRoute>
            <PermissionManagementPage />
          </MemberRoute>
        }
      />

      {/* Management Routes */}
      <Route
        path="/management/users"
        element={
          <MemberRoute>
            <UserManagementPage />
          </MemberRoute>
        }
      />
      <Route
        path="/management/companies"
        element={
          <MemberRoute>
            <CompanyManagementPage />
          </MemberRoute>
        }
      />
      <Route
        path="/management/activity-logs"
        element={
          <MemberRoute>
            <ActivityLogPage />
          </MemberRoute>
        }
      />

      {/* Diagnostics */}
      <Route
        path="/diagnostics"
        element={
          <MemberRoute>
            <DiagnosticsListPage />
          </MemberRoute>
        }
      />
      <Route
        path="/diagnostics/new"
        element={
          <MemberRoute>
            <DiagnosticCreatePage />
          </MemberRoute>
        }
      />
      <Route
        path="/diagnostics/:id"
        element={
          <MemberRoute>
            <DiagnosticDetailPage />
          </MemberRoute>
        }
      />
      <Route
        path="/diagnostics/:id/files"
        element={
          <MemberRoute>
            <DiagnosticFilesPage />
          </MemberRoute>
        }
      />

      {/* Approvals - 결재 상세 페이지만 유지 (전체 결재 목록 페이지는 제거됨, #276) */}
      <Route
        path="/approvals/:id"
        element={
          <MemberRoute>
            <ApprovalDetailPage />
          </MemberRoute>
        }
      />

      {/* Reviews */}
      <Route
        path="/reviews"
        element={
          <MemberRoute>
            <ReviewsListPage />
          </MemberRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <MemberRoute>
            <NotificationsPage />
          </MemberRoute>
        }
      />

      {/* Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <MemberRoute>
            <HomePage userRole={legacyRole} />
          </MemberRoute>
        }
      />
      {/* Document Routes - Safety */}
      <Route
        path="/dashboard/safety/upload"
        element={
          <DomainProtectedRoute domainCode="SAFETY">
            <FileUploadPage />
          </DomainProtectedRoute>
        }
      />
      <Route
        path="/dashboard/safety/review/:id"
        element={
          <DomainProtectedRoute domainCode="SAFETY">
            <DocumentReviewPage userRole={legacyRole} />
          </DomainProtectedRoute>
        }
      />

      {/* Document Routes - Compliance */}
      <Route
        path="/dashboard/compliance/upload"
        element={
          <DomainProtectedRoute domainCode="COMPLIANCE">
            <FileUploadPage />
          </DomainProtectedRoute>
        }
      />
      <Route
        path="/dashboard/compliance/review/:id"
        element={
          <DomainProtectedRoute domainCode="COMPLIANCE">
            <DocumentReviewPage userRole={legacyRole} />
          </DomainProtectedRoute>
        }
      />
      <Route
        path="/dashboard/compliance/review/:id/ai-analysis"
        element={
          <DomainProtectedRoute domainCode="COMPLIANCE">
            <AiAnalysisPage />
          </DomainProtectedRoute>
        }
      />

      {/* Document Routes - ESG */}
      <Route
        path="/dashboard/esg/upload"
        element={
          <DomainProtectedRoute domainCode="ESG">
            <FileUploadPage />
          </DomainProtectedRoute>
        }
      />
      <Route
        path="/dashboard/esg/review/:id"
        element={
          <DomainProtectedRoute domainCode="ESG">
            <DocumentReviewPage userRole={legacyRole} />
          </DomainProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<OnboardingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" richColors offset={72} duration={3000} />
    </QueryClientProvider>
  );
}
