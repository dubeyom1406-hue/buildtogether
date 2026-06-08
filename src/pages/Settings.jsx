import { useState } from 'react'
import { User, Bell, Shield, Check, Save } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account')
  const [firstName, setFirstName] = useState('Jayson')
  const [lastName, setLastName] = useState('Smith')
  const [email, setEmail] = useState('jayson@ofspace.co')
  const [role, setRole] = useState('Product Manager')
  const [bio, setBio] = useState('Passionate about designing and shipping premium digital products at OFSPACE.CO')
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    weeklyDigest: false,
    newMemberAlerts: true
  })

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    alert('Settings updated successfully!')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-[1000px] mx-auto select-none">
      
      {/* Left Settings Sidebar */}
      <div className="md:col-span-1 bg-white border border-[#EFEFEF] rounded-[24px] p-4 flex flex-col gap-1.5 h-fit">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeTab === 'account'
              ? 'bg-brand-light text-brand-primary'
              : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-[#F9F9F9]'
          }`}
        >
          <User className="w-4 h-4" />
          Account
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-brand-light text-brand-primary'
              : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-[#F9F9F9]'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
            activeTab === 'security'
              ? 'bg-brand-light text-brand-primary'
              : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-[#F9F9F9]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* Right Content Panel */}
      <div className="md:col-span-3 bg-white border border-[#EFEFEF] rounded-[24px] p-6">
        
        {activeTab === 'account' && (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-[#1A1D1F]">Profile Information</h2>
              <p className="text-xs text-[#9A9FA5] font-semibold mt-0.5">Update your photo and personal details.</p>
            </div>

            {/* Avatar Row */}
            <div className="flex items-center gap-4 py-2 border-b border-[#F4F4F4] pb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="Jayson"
                className="w-16 h-16 rounded-full object-cover border border-[#EFEFEF]"
              />
              <div className="flex gap-2">
                <button type="button" className="bg-brand-primary text-white text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-brand-hover cursor-pointer">
                  Upload Photo
                </button>
                <button type="button" className="bg-[#F4F4F4] hover:bg-zinc-200 text-[#1A1D1F] text-[11px] font-bold px-4 py-2 rounded-xl cursor-pointer">
                  Remove
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6F767E] uppercase">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6F767E] uppercase">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6F767E] uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6F767E] uppercase">Job Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6F767E] uppercase">Biography</label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-primary text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 cursor-pointer w-fit px-6 shadow-sm self-end"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </form>
        )}

        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-[#1A1D1F]">Notification Preferences</h2>
              <p className="text-xs text-[#9A9FA5] font-semibold mt-0.5">Control how and when you receive updates.</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Toggle Rows */}
              <div className="flex items-center justify-between py-3 border-b border-[#F4F4F4]">
                <div>
                  <h3 className="text-xs font-bold text-[#1A1D1F]">Email Notifications</h3>
                  <p className="text-[11px] text-[#6F767E] font-medium mt-0.5">Get emails for direct messages and announcements.</p>
                </div>
                <button
                  onClick={() => handleToggle('emailAlerts')}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                    notifications.emailAlerts ? 'bg-brand-primary' : 'bg-zinc-200'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#F4F4F4]">
                <div>
                  <h3 className="text-xs font-bold text-[#1A1D1F]">Push Notifications</h3>
                  <p className="text-[11px] text-[#6F767E] font-medium mt-0.5">Receive immediate screen alerts for updates.</p>
                </div>
                <button
                  onClick={() => handleToggle('pushAlerts')}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                    notifications.pushAlerts ? 'bg-brand-primary' : 'bg-zinc-200'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    notifications.pushAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#F4F4F4]">
                <div>
                  <h3 className="text-xs font-bold text-[#1A1D1F]">Weekly Digest</h3>
                  <p className="text-[11px] text-[#6F767E] font-medium mt-0.5">A summary report of activities, leaves, and milestones.</p>
                </div>
                <button
                  onClick={() => handleToggle('weeklyDigest')}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                    notifications.weeklyDigest ? 'bg-brand-primary' : 'bg-zinc-200'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    notifications.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-xs font-bold text-[#1A1D1F]">New Member Alerts</h3>
                  <p className="text-[11px] text-[#6F767E] font-medium mt-0.5">Get notified when a new team member joins the directory.</p>
                </div>
                <button
                  onClick={() => handleToggle('newMemberAlerts')}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                    notifications.newMemberAlerts ? 'bg-brand-primary' : 'bg-zinc-200'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    notifications.newMemberAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => alert('Notification settings saved!')}
              className="bg-brand-primary text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 cursor-pointer w-fit px-6 shadow-sm self-end"
            >
              <Check className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-[#1A1D1F]">Security Settings</h2>
              <p className="text-xs text-[#9A9FA5] font-semibold mt-0.5">Manage your password and authentication factors.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6F767E] uppercase">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6F767E] uppercase">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6F767E] uppercase">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="px-3.5 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
                />
              </div>
            </div>

            <button
              onClick={() => alert('Password updated successfully!')}
              className="bg-brand-primary text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 cursor-pointer w-fit px-6 shadow-sm self-end"
            >
              Update Password
            </button>
          </div>
        )}

      </div>

    </div>
  )
}
