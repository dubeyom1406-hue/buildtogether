import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, MessageSquare, ChevronDown, UserPlus, CheckCircle, ClipboardCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Header() {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'request_received',
      text: 'Royal Ahmed has applied to join your project: Decentralized Campus Cafe Payments.',
      time: '5m ago',
      read: false,
      icon: UserPlus,
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      id: 2,
      type: 'request_accepted',
      text: 'Sanjoy Roy accepted your request to join: AI Study Planner & Notes Synthesizer.',
      time: '1h ago',
      read: false,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 3,
      type: 'message',
      text: 'Sanjoy Roy sent you a message: "Let\'s plan for the weekend trip!"',
      time: '2h ago',
      read: true,
      icon: MessageSquare,
      color: 'text-brand-primary bg-brand-light'
    },
    {
      id: 4,
      type: 'update',
      text: 'Koyes Sha completed the milestone: "Build PDF parsing engine".',
      time: '1d ago',
      read: true,
      icon: ClipboardCheck,
      color: 'text-amber-600 bg-amber-50'
    }
  ])

  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-[70px] bg-transparent px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      
      {/* Brand Label */}
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => navigate('/dashboard')}
      >
        <img src="/logo_icon.png" alt="Built 2gether Logo" className="w-8 h-8 object-contain shrink-0" />
        <span className="font-sans font-black text-xl tracking-tight text-[#0E1C33]">
          BUILT <span className="text-[#F18D58]">2</span>GETHER
        </span>
      </div>

      {/* Right Icons Profile Dropdown */}
      <div className="flex items-center gap-6">
        
        {/* Messages Shortcut */}
        <button 
          onClick={() => navigate('/message')}
          className="relative p-2 text-[#6F767E] hover:text-[#1A1D1F] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full" />
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-[#6F767E] hover:text-[#1A1D1F] transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-[#EFEFEF] rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-[#F4F4F4] flex justify-between items-center">
                <span className="text-xs font-extrabold text-[#1A1D1F]">Notifications</span>
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notif) => {
                  const Icon = notif.icon
                  return (
                    <div 
                      key={notif.id}
                      className={`px-4 py-3 border-b border-[#F4F4F4] last:border-none flex gap-3 hover:bg-[#F8F9FA] transition-colors ${
                        !notif.read ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${notif.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <p className="text-[11px] text-[#1A1D1F] font-semibold leading-relaxed">
                          {notif.text}
                        </p>
                        <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                      </div>

                      {/* Unread circle marker */}
                      {!notif.read && (
                        <span className="w-2 h-2 bg-brand-primary rounded-full shrink-0 self-center" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 pl-2 border-l border-[#EFEFEF] cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EFEFEF]">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
              alt={currentUser?.name || "Jayson"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#1A1D1F]">
              {currentUser?.name?.split(' ')[0] || "Jayson"}
            </span>
            <ChevronDown className="w-4 h-4 text-[#6F767E] group-hover:text-[#1A1D1F] transition-colors" />
          </div>
        </div>

      </div>
    </header>
  )
}
