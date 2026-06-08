import { useState, useEffect } from 'react'
import { Clock, Coffee, Play, Square, Award } from 'lucide-react'

export default function Time() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [checkInTime, setCheckInTime] = useState(null)
  const [workSeconds, setWorkSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let workTimer
    if (isCheckedIn) {
      workTimer = setInterval(() => {
        setWorkSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(workTimer)
  }, [isCheckedIn])

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleClockToggle = () => {
    if (!isCheckedIn) {
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      setIsCheckedIn(true)
    } else {
      setIsCheckedIn(false)
      // Save entry to logs (could expand later)
    }
  }

  const logs = [
    { date: '07 Jun 2026', checkIn: '09:28 AM', checkOut: '06:34 PM', total: '9h 06m', status: 'Completed' },
    { date: '06 Jun 2026', checkIn: '09:30 AM', checkOut: '06:05 PM', total: '8h 35m', status: 'Completed' },
    { date: '05 Jun 2026', checkIn: '09:12 AM', checkOut: '06:12 PM', total: '9h 00m', status: 'Completed' },
    { date: '04 Jun 2026', checkIn: '09:32 AM', checkOut: '05:58 PM', total: '8h 26m', status: 'Completed' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Clock Card */}
        <div className="bg-white rounded-[24px] border border-[#EFEFEF] p-6 flex flex-col items-center justify-between min-h-[300px] text-center md:col-span-1">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#9A9FA5] uppercase tracking-wider">
              {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
            <span className="text-3xl font-extrabold text-[#1A1D1F]">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            onClick={handleClockToggle}
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 shadow-md transition-all duration-300 cursor-pointer ${
              isCheckedIn
                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:scale-105'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:scale-105'
            }`}
          >
            {isCheckedIn ? (
              <>
                <Square className="w-8 h-8 fill-current mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Clock Out</span>
              </>
            ) : (
              <>
                <Play className="w-8 h-8 fill-current ml-1 mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Clock In</span>
              </>
            )}
          </button>

          <span className="text-xs font-semibold text-[#6F767E]">
            {isCheckedIn ? `Checked in at ${checkInTime}` : 'Not checked in'}
          </span>
        </div>

        {/* Current Stats Card */}
        <div className="bg-white rounded-[24px] border border-[#EFEFEF] p-6 flex flex-col gap-6 md:col-span-2 justify-between">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[#1A1D1F]">Today's Activity</h2>
            <span className="text-xs bg-[#F4F4F4] text-[#1A1D1F] px-3 py-1 rounded-full font-bold">
              Standard: 8.0 hrs
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col gap-1 border border-[#F4F4F4]">
              <div className="flex items-center gap-2 text-[#6F767E] text-xs font-bold">
                <Clock className="w-4 h-4 text-brand-primary" />
                <span>Working Hours</span>
              </div>
              <span className="text-xl font-extrabold text-[#1A1D1F] font-mono">
                {isCheckedIn ? formatDuration(workSeconds) : '00:00:00'}
              </span>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col gap-1 border border-[#F4F4F4]">
              <div className="flex items-center gap-2 text-[#6F767E] text-xs font-bold">
                <Coffee className="w-4 h-4 text-orange-400" />
                <span>Break Time</span>
              </div>
              <span className="text-xl font-extrabold text-[#1A1D1F] font-mono">00:00:00</span>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col gap-1 border border-[#F4F4F4]">
              <div className="flex items-center gap-2 text-[#6F767E] text-xs font-bold">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Overtime</span>
              </div>
              <span className="text-xl font-extrabold text-[#1A1D1F] font-mono">00:00:00</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex justify-between text-xs font-bold text-[#6F767E]">
              <span>Weekly Progress</span>
              <span>26.5 / 40 hrs</span>
            </div>
            <div className="w-full bg-[#F4F4F4] h-2 rounded-full overflow-hidden">
              <div className="bg-brand-primary h-full rounded-full" style={{ width: '66.2%' }} />
            </div>
          </div>
        </div>

      </div>

      {/* Logs Card */}
      <div className="bg-white rounded-[24px] border border-[#EFEFEF] p-6">
        <h2 className="text-base font-bold text-[#1A1D1F] mb-4">Recent Logs</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F4F4] text-[11px] font-bold text-[#9A9FA5] uppercase">
                <th className="pb-3">Date</th>
                <th className="pb-3">Check In</th>
                <th className="pb-3">Check Out</th>
                <th className="pb-3">Total Time</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className="border-b border-[#F9F9F9] last:border-0 hover:bg-[#FDFDFD] transition-colors">
                  <td className="py-3.5 text-xs font-bold text-[#1A1D1F]">{log.date}</td>
                  <td className="py-3.5 text-xs text-[#6F767E] font-medium">{log.checkIn}</td>
                  <td className="py-3.5 text-xs text-[#6F767E] font-medium">{log.checkOut}</td>
                  <td className="py-3.5 text-xs font-bold text-[#1A1D1F] font-mono">{log.total}</td>
                  <td className="py-3.5 text-right">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
