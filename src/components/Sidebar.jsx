import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { 
  LayoutGrid, 
  ClipboardCheck, 
  MessageSquare, 
  Briefcase, 
  User, 
  Settings, 
  Clock, 
  LogOut,
  Map,
  ChevronDown,
  ChevronUp,
  FolderGit
} from 'lucide-react'

export default function Sidebar({ width = 256, collapsed = false, transitionEnabled = true }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logoutUser, requests, currentUser, messages } = useApp()

  const incomingRequestsCount = (requests || []).filter(
    r => r.founderUid === currentUser?.uid && r.status === 'pending'
  ).length

  const unreadMessagesCount = (messages || []).filter(
    m => m.receiverUid === currentUser?.uid && !m.read
  ).length

  // State to manage expanded groups
  const [expandedGroups, setExpandedGroups] = useState({
    workspace: true,
    account: false
  })

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  // Helper to check if any child routes are active so the parent can be highlighted or open
  const isWorkspaceActive = ['/requests', '/team', '/events'].includes(location.pathname)
  const isAccountActive = ['/profile', '/settings'].includes(location.pathname)

  return (
    <aside 
      className={`h-screen flex flex-col justify-between z-20 select-none shrink-0 overflow-y-auto overflow-x-hidden ${transitionEnabled ? 'transition-all duration-300 ease-out' : ''}`}
      style={{ 
        width: collapsed ? 0 : `${width}px`,
        minWidth: collapsed ? 0 : `${width}px`,
        padding: collapsed ? 0 : '1.5rem 1rem',
        opacity: collapsed ? 0 : 1,
        borderRight: collapsed ? 'none' : '1px solid #E8C9A8',
        background: '#F4F4F4' // Very clean off-white / light grey background like the screenshot
      }}
    >
      {/* Top Logo and Navigation */}
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 py-1">
          <img src="/logo_icon.png" alt="Built 2gether Logo" className="w-9 h-9 object-contain shrink-0" />
          <div className="flex flex-col">
            <span className="font-sans font-black text-[15px] tracking-tight leading-none text-[#0E1C33]">
              BUILT <span className="text-[#F18D58]">2</span>GETHER
            </span>
            <span className="text-[7px] text-[#F18D58] font-bold tracking-tight mt-0.5">FIND. CONNECT. BUILD.</span>
          </div>
          <span className="bg-[#CE5A3B]/10 text-[#CE5A3B] text-[7px] font-extrabold px-1.5 py-0.5 rounded-full border border-[#CE5A3B]/20 ml-auto shrink-0">
            v1.2
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-extrabold tracking-widest text-[#8B7665] uppercase px-3">
            Navigation
          </span>
          
          <nav className="flex flex-col gap-1">
            {/* Dashboard (Flat/Raised Card layout matching screenshot) */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                    : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-5 h-5 text-current transition-colors" />
                <span className="text-xs font-semibold">Dashboard</span>
              </div>
            </NavLink>

            {/* Workspace Category */}
            <div className="flex flex-col">
              <button
                onClick={() => toggleGroup('workspace')}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40 transition-all duration-200 cursor-pointer ${
                  isWorkspaceActive ? 'text-[#1A1D1F] font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderGit className="w-5 h-5 text-current" />
                  <span className="text-xs font-semibold">Workspace</span>
                </div>
                {expandedGroups.workspace ? (
                  <ChevronUp className="w-4 h-4 text-[#8B7665]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8B7665]" />
                )}
              </button>

              {/* Sub-items list with connector lines */}
              {expandedGroups.workspace && (
                <div className="relative flex flex-col gap-0.5 mt-0.5">
                  {/* Continuous vertical line starting from the parent's icon center */}
                  {/* Center of parent icon is at padding-left(12px) + half of icon(10px) = 22px */}
                  <div className="absolute left-[22px] top-0 bottom-5 w-[1.5px] bg-[#E8C9A8]/50" />

                  {/* Join Requests */}
                  <NavLink
                    to="/requests"
                    className={({ isActive }) =>
                      `flex items-center justify-between ml-8 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                          : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Curve branching line connecting to vertical line */}
                        <div className="absolute left-[-10px] top-0 bottom-1/2 w-[10px] border-l-[1.5px] border-b-[1.5px] border-[#E8C9A8]/50 rounded-bl-lg pointer-events-none" />
                        <span className="text-xs font-semibold z-10">Join Requests</span>
                        {incomingRequestsCount > 0 && (
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border relative z-10 transition-all duration-200 ${
                            isActive 
                              ? 'bg-[#FCECD8] text-[#CE5A3B] border-[#FCECD8]' 
                              : 'bg-[#FCECD8]/60 text-[#CE5A3B] border-[#E8C9A8]/20 group-hover:bg-[#FCECD8]'
                          }`}>
                            {incomingRequestsCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Teams & Projects */}
                  <NavLink
                    to="/team"
                    className={({ isActive }) =>
                      `flex items-center justify-between ml-8 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                          : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                      }`
                    }
                  >
                    {/* Curve branching line */}
                    <div className="absolute left-[-10px] top-0 bottom-1/2 w-[10px] border-l-[1.5px] border-b-[1.5px] border-[#E8C9A8]/50 rounded-bl-lg pointer-events-none" />
                    <span className="text-xs font-semibold z-10">Teams & Projects</span>
                  </NavLink>

                  {/* Events */}
                  <NavLink
                    to="/events"
                    className={({ isActive }) =>
                      `flex items-center justify-between ml-8 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                          : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                      }`
                    }
                  >
                    {/* Curve branching line */}
                    <div className="absolute left-[-10px] top-0 bottom-1/2 w-[10px] border-l-[1.5px] border-b-[1.5px] border-[#E8C9A8]/50 rounded-bl-lg pointer-events-none" />
                    <span className="text-xs font-semibold z-10">Events</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Messages */}
            <NavLink
              to="/message"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                    : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-current transition-colors" />
                    <span className="text-xs font-semibold">Messages</span>
                  </div>
                  {unreadMessagesCount > 0 && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#FEE2E2] text-[#EF4444] border-[#FEE2E2]' 
                        : 'bg-[#FEE2E2]/60 text-[#EF4444] border-[#E8C9A8]/20 group-hover:bg-[#FEE2E2]'
                    }`}>
                      {unreadMessagesCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>

            {/* Time Tracker */}
            <NavLink
              to="/time"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                    : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-current transition-colors" />
                <span className="text-xs font-semibold">Time Tracker</span>
              </div>
            </NavLink>

            {/* Account Category */}
            <div className="flex flex-col">
              <button
                onClick={() => toggleGroup('account')}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40 transition-all duration-200 cursor-pointer ${
                  isAccountActive ? 'text-[#1A1D1F] font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-current" />
                  <span className="text-xs font-semibold">Account</span>
                </div>
                {expandedGroups.account ? (
                  <ChevronUp className="w-4 h-4 text-[#8B7665]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8B7665]" />
                )}
              </button>

              {/* Sub-items list with connector lines */}
              {expandedGroups.account && (
                <div className="relative flex flex-col gap-0.5 mt-0.5">
                  <div className="absolute left-[22px] top-0 bottom-5 w-[1.5px] bg-[#E8C9A8]/50" />

                  {/* My Profile */}
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `flex items-center justify-between ml-8 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                          : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                      }`
                    }
                  >
                    <div className="absolute left-[-10px] top-0 bottom-1/2 w-[10px] border-l-[1.5px] border-b-[1.5px] border-[#E8C9A8]/50 rounded-bl-lg pointer-events-none" />
                    <span className="text-xs font-semibold z-10">My Profile</span>
                  </NavLink>

                  {/* Settings */}
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center justify-between ml-8 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-white text-[#1A1D1F] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white'
                          : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-white/40'
                      }`
                    }
                  >
                    <div className="absolute left-[-10px] top-0 bottom-1/2 w-[10px] border-l-[1.5px] border-b-[1.5px] border-[#E8C9A8]/50 rounded-bl-lg pointer-events-none" />
                    <span className="text-xs font-semibold z-10">Settings</span>
                  </NavLink>
                </div>
              )}
            </div>

          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-1">
        <div className="h-px bg-[#E8C9A8]/40 mb-3" />
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#6F767E] hover:text-red-600 hover:bg-red-50/60 transition-all duration-200 group w-full text-left cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-current group-hover:text-red-600" />
          <span className="text-xs font-semibold">Log out</span>
        </button>
      </div>
    </aside>
  )
}
