import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

type UserRole = 'receiver' | 'drafter' | 'approver' | 'guest' | null;

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const getUserRole = () => localStorage.getItem('userRole') as UserRole;

  return (
    <BrowserRouter>
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
               {/* Only receiver should access this in real app, but for now allow logged in users or add role check */}
              <PermissionManagementPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HomePage userRole={(getUserRole() as 'receiver' | 'drafter' | 'approver' | null) || 'receiver'} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/safety"
          element={
            <ProtectedRoute>
              <SafetyPage userRole={(getUserRole() as 'receiver' | 'drafter' | 'approver' | null) || 'receiver'} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/compliance"
          element={
            <ProtectedRoute>
              <CompliancePage userRole={(getUserRole() as 'receiver' | 'drafter' | 'approver' | null) || 'receiver'} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/esg"
          element={
            <ProtectedRoute>
              <ESGPage userRole={(getUserRole() as 'receiver' | 'drafter' | 'approver' | null) || 'receiver'} />
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
              <DocumentReviewPage userRole={(getUserRole() as 'receiver' | 'drafter' | 'approver' | null) || 'receiver'} />
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
              <DocumentReviewPage userRole={(getUserRole() as 'receiver' | 'drafter' | 'approver' | null) || 'receiver'} />
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
              <DocumentReviewPage userRole={(getUserRole() as 'receiver' | 'drafter' | 'approver' | null) || 'receiver'} />
            </ProtectedRoute>
          }
        />
        
        {/* Default Route */}
        <Route path="/" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
