import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ApprovedGuard from './components/ApprovedGuard';
import DashboardLayout from './components/DashboardLayout';
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';

// Public Lazy Pages
const PublicHome = lazy(() => import('./pages/public/PublicHome'));
const JobsListing = lazy(() => import('./pages/public/JobsListing'));
const JobDetail = lazy(() => import('./pages/public/JobDetail'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Unauthorized = lazy(() => import('./pages/public/Unauthorized'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

// Candidate Lazy Pages
const CandidateDashboard = lazy(() => import('./pages/candidate/CandidateDashboard'));
const CandidateProfile = lazy(() => import('./pages/candidate/CandidateProfile'));
const MyApplications = lazy(() => import('./pages/candidate/MyApplications'));
const SavedJobs = lazy(() => import('./pages/candidate/SavedJobs'));

// Recruiter Lazy Pages
const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const CompanyProfile = lazy(() => import('./pages/recruiter/CompanyProfile'));
const PostJob = lazy(() => import('./pages/recruiter/PostJob'));
const EditJob = lazy(() => import('./pages/recruiter/EditJob'));
const MyJobs = lazy(() => import('./pages/recruiter/MyJobs'));
const ApplicantsList = lazy(() => import('./pages/recruiter/ApplicantsList'));
const PipelineBoard = lazy(() => import('./pages/recruiter/PipelineBoard'));
const Analytics = lazy(() => import('./pages/recruiter/Analytics'));

// Admin Lazy Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UsersTable = lazy(() => import('./pages/admin/UsersTable'));
const JobsModeration = lazy(() => import('./pages/admin/JobsModeration'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

const SuspenseLoading = () => (
  <div className="min-h-[60vh] w-full flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Suspense fallback={<SuspenseLoading />}>
              <Routes>
                
                {/* Public General Routes */}
                <Route path="/" element={<><Navbar /><PublicHome /></>} />
                <Route path="/jobs" element={<><Navbar /><JobsListing /></>} />
                <Route path="/jobs/:id" element={<><Navbar /><JobDetail /></>} />
                <Route path="/login" element={<><Navbar /><Login /></>} />
                <Route path="/register" element={<><Navbar /><Register /></>} />

                {/* Candidate Dashboard Portal */}
                <Route
                  path="/candidate"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<CandidateDashboard />} />
                  <Route path="profile" element={<CandidateProfile />} />
                  <Route path="applications" element={<MyApplications />} />
                  <Route path="saved" element={<SavedJobs />} />
                </Route>

                {/* Recruiter Dashboard Portal */}
                <Route
                  path="/recruiter"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Recruiter pages wrapped in ApprovedGuard */}
                  <Route path="dashboard" element={<ApprovedGuard><RecruiterDashboard /></ApprovedGuard>} />
                  <Route path="jobs" element={<ApprovedGuard><MyJobs /></ApprovedGuard>} />
                  <Route path="jobs/new" element={<ApprovedGuard><PostJob /></ApprovedGuard>} />
                  <Route path="jobs/:id/edit" element={<ApprovedGuard><EditJob /></ApprovedGuard>} />
                  <Route path="jobs/:id/applicants" element={<ApprovedGuard><ApplicantsList /></ApprovedGuard>} />
                  <Route path="pipeline" element={<ApprovedGuard><PipelineBoard /></ApprovedGuard>} />
                  <Route path="analytics" element={<ApprovedGuard><Analytics /></ApprovedGuard>} />
                  
                  {/* Company profile doesn't require approval so recruiter can input detail for verification */}
                  <Route path="company" element={<CompanyProfile />} />
                </Route>

                {/* Admin Dashboard Portal */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UsersTable />} />
                  <Route path="jobs" element={<JobsModeration />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                {/* Status Page Routes */}
                <Route path="/unauthorized" element={<><Navbar /><Unauthorized /></>} />
                <Route path="/not-found" element={<><Navbar /><NotFound /></>} />
                
                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/not-found" replace />} />

              </Routes>
            </Suspense>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
