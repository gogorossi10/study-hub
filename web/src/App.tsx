import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { StudyHelpAIPage } from './pages/StudyHelpAIPage'
import { SummarizerPage } from './pages/SummarizerPage'
import { AnalyzerPage } from './pages/AnalyzerPage'
import { BuilderPage } from './pages/BuilderPage'
import { TrackerPage } from './pages/TrackerPage'
import { JobsPage } from './pages/JobsPage'
import { DashboardPage } from './pages/DashboardPage'
import { WorkspacePage } from './pages/WorkspacePage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/study-help"
                  element={
                    <ProtectedRoute>
                      <StudyHelpAIPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/sgpa" element={<Navigate to="/study-help" replace />} />
                <Route
                  path="/workspace"
                  element={
                    <ProtectedRoute>
                      <WorkspacePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/summarizer"
                  element={
                    <ProtectedRoute>
                      <SummarizerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analyzer"
                  element={
                    <ProtectedRoute>
                      <AnalyzerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/builder"
                  element={
                    <ProtectedRoute>
                      <BuilderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tracker"
                  element={
                    <ProtectedRoute>
                      <TrackerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <JobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
