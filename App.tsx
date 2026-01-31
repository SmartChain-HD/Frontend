import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './src/store/authStore';
import { useMe } from './src/hooks/useAuth';
import OnboardingPage from './features/onboarding/OnboardingPage';
import LoginPage from './features/auth/LoginPage';
import SignupStep1Page from './features/auth/SignupStep1Page';
import SignupStep2Page from './features/auth/SignupStep2Page';
import HomePage from './features/dashboard/HomePage';
import SafetyPage from './features/dashboard/SafetyPage';
import CompliancePage from './features/dashboard/CompliancePage';
import ESGPage from './features/dashboard/ESGPage';
import FileUploadPage from './features/documents/FileUploadPage';
import DocumentReviewPage from './features/documents/DocumentReviewPage';
import PermissionRequestPage from './features/permission/PermissionRequestPage';
import PermissionStatusPage from './features/permission/PermissionStatusPage';
import PermissionManagementPage from './features/permission/PermissionManagementPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import ApprovalsListPage from './features/approvals/ApprovalsListPage';
import ApprovalDetailPage from './features/approvals/ApprovalDetailPage';
import DiagnosticsListPage from './features/diagnostics/DiagnosticsListPage';
import DiagnosticDetailPage from './features/diagnostics/DiagnosticDetailPage';
import DiagnosticCreatePage from './features/diagnostics/DiagnosticCreatePage';
import ReviewsListPage from './features/reviews/ReviewsListPage';
import ReviewDetailPage from './features/reviews/ReviewDetailPage';
import UserManagementPage from './features/management/UserManagementPage';
import CompanyManagementPage from './features/management/CompanyManagementPage';

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

function AppRoutes() {
  const { user } = useAuthStore();

  // Fetch user info on app load if authenticated
  useMe();

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
          <ProtectedRoute>
            <PermissionManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Management Routes */}
      <Route
        path="/management/users"
        element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/companies"
        element={
          <ProtectedRoute>
            <CompanyManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Diagnostics */}
      <Route
        path="/diagnostics"
        element={
          <ProtectedRoute>
            <DiagnosticsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diagnostics/new"
        element={
          <ProtectedRoute>
            <DiagnosticCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diagnostics/:id"
        element={
          <ProtectedRoute>
            <DiagnosticDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Approvals */}
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <ApprovalsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals/:id"
        element={
          <ProtectedRoute>
            <ApprovalDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Reviews */}
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <ReviewsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews/:id"
        element={
          <ProtectedRoute>
            <ReviewDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomePage userRole={legacyRole} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/safety"
        element={
          <ProtectedRoute>
            <SafetyPage userRole={legacyRole} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/compliance"
        element={
          <ProtectedRoute>
            <CompliancePage userRole={legacyRole} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/esg"
        element={
          <ProtectedRoute>
            <ESGPage userRole={legacyRole} />
          </ProtectedRoute>
        }
      />

      {/* Document Routes */}
      <Route
        path="/dashboard/safety/upload"
        element={
          <ProtectedRoute>
            <FileUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/safety/review/:id"
        element={
          <ProtectedRoute>
            <DocumentReviewPage userRole={legacyRole} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/compliance/upload"
        element={
          <ProtectedRoute>
            <FileUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/compliance/review/:id"
        element={
          <ProtectedRoute>
            <DocumentReviewPage userRole={legacyRole} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/esg/upload"
        element={
          <ProtectedRoute>
            <FileUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/esg/review/:id"
        element={
          <ProtectedRoute>
            <DocumentReviewPage userRole={legacyRole} />
          </ProtectedRoute>
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
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
