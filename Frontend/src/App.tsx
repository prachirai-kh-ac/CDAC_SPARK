import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { authService } from './services/authService'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentPractice from './pages/student/Practice'
import StudentMockTest from './pages/student/MockTest'
import PreExamVerification from './pages/student/PreExamVerification'
import ExamPortal from './pages/student/ExamPortal'
import ExamResults from './pages/student/ExamResults'
import AttemptHistory from './pages/student/AttemptHistory'
import Leaderboard from './pages/student/Leaderboard'
import StudentProfile from './pages/student/Profile'

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherPractice from './pages/teacher/TeacherPractice'
import CreateExam from './pages/teacher/CreateExam'
import EditExam from './pages/teacher/EditExam'
import QuestionBank from './pages/teacher/QuestionBank'
import ExamAnalytics from './pages/teacher/ExamAnalytics'
import TeacherProfile from './pages/teacher/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import StudentManagement from './pages/admin/StudentManagement'
import TeacherManagement from './pages/admin/TeacherManagement'
import BatchManagement from './pages/admin/BatchManagement'
import AdminPracticeMcq from './pages/teacher/TeacherPractice'
import AuditLogs from './pages/admin/AuditLogs'

// Layouts
import StudentLayout from './layouts/StudentLayout'
import TeacherLayout from './layouts/TeacherLayout'
import AdminLayout from './layouts/AdminLayout'

// Protected Route
function ProtectedRoute({ children, role }: { children: React.ReactNode, role: string }) {
  const { user } = useAuth()
  
  // localStorage se load hone ka wait karo
  const stored = authService.getStoredUser()
  
  if (!user && !stored) return <Navigate to="/login" replace />
  
  const currentUser = user || stored
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role.toLowerCase() !== role.toLowerCase()) 
    return <Navigate to="/login" replace />
    
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="practice" element={<StudentPractice />} />
            <Route path="mock-test" element={<StudentMockTest />} />
            <Route path="exam/verify" element={<PreExamVerification />} />
            <Route path="exam/portal" element={<ExamPortal />} />
            <Route path="exam/results" element={<ExamResults />} />
            <Route path="history" element={<AttemptHistory />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="practice" element={<TeacherPractice />} />
            <Route path="create-exam" element={<CreateExam />} />
            <Route path="edit-exam/:id" element={<EditExam />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="analytics" element={<ExamAnalytics />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="modules" element={<AdminPracticeMcq />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
