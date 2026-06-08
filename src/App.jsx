import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import DashboardLayout from './layouts/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import JoinRequests from './pages/JoinRequests'
import Message from './pages/Message'
import Time from './pages/Time'
import Team from './pages/Team'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Events from './pages/Events'

function PrivateRoute({ children }) {
  const { currentUser, isLoadingUser } = useApp()
  if (isLoadingUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDF1E4] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-brand-light border-t-brand-primary animate-spin"></div>
          <img src="/logo_icon.png" alt="Logo" className="w-7 h-7 absolute object-contain" />
        </div>
        <span className="text-xs font-bold text-brand-muted uppercase tracking-widest animate-pulse">
          Loading BUILT 2GETHER...
        </span>
      </div>
    )
  }
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Login Page */}
        <Route path="login" element={<Login />} />

        {/* Onboarding Page */}
        <Route path="onboarding" element={<Onboarding />} />

        {/* Authenticated Dashboard layout routes — all protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="requests" element={<JoinRequests />} />
          <Route path="message" element={<Message />} />
          <Route path="time" element={<Time />} />
          <Route path="team" element={<Team />} />
          <Route path="events" element={<Events />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
