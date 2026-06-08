import { Check, X, Github, Linkedin, Briefcase, Sparkles, UserCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function JoinRequests() {
  const { requests, acceptRequest, rejectRequest } = useApp()

  const pendingRequests = requests.filter(r => r.status === 'pending')

  const handleAction = async (id, action) => {
    const applicant = requests.find(r => r.id === id)
    if (!applicant) return

    try {
      if (action === 'accept') {
        await acceptRequest(id)
      } else {
        await rejectRequest(id)
      }
      alert(`${applicant.name || applicant.applicantName}'s request was ${action === 'accept' ? 'Accepted' : 'Rejected'}!`)
    } catch (err) {
      alert("Error handling request: " + err.message)
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto select-none flex flex-col gap-6">
      
      {/* Header */}
      <div className="bg-white border border-[#EFEFEF] p-5 rounded-[24px] flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-brand-primary">
          <UserCheck className="w-5 h-5" />
          <span className="text-[11px] font-bold tracking-wider uppercase">Applications</span>
        </div>
        <h1 className="text-lg font-extrabold text-[#1A1D1F]">Join Teammate Requests</h1>
        <p className="text-xs text-[#6F767E] font-medium mt-0.5">
          Review incoming applications from developers and designers seeking to join your projects.
        </p>
      </div>

      {/* Requests Feed */}
      <div className="flex flex-col gap-4">
        {pendingRequests.map((req) => (
          <div
            key={req.id}
            className="bg-white border border-[#EFEFEF] rounded-[24px] p-6 flex flex-col md:flex-row gap-6 justify-between group hover:border-[#D1D5DB] transition-all duration-200"
          >
            {/* Left Portion: Details & Cover Letter */}
            <div className="flex-1 flex flex-col gap-3.5">
              
              {/* Applicant Name & Match Score */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F9F9F9] pb-3">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-extrabold text-[#1A1D1F]">{req.name || req.applicantName}</h3>
                  <span className="text-[10px] bg-brand-light text-brand-primary font-bold px-2.5 py-0.5 rounded-full">
                    Applied to: {req.ideaTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>{req.matchScore}% Match Score</span>
                </div>
              </div>

              {/* Cover Pitch */}
              <div className="flex flex-col gap-1.5 bg-brand-bg/60 p-4 rounded-2xl border border-[#F9F9F9]">
                <span className="text-[9px] font-bold text-[#6F767E] uppercase">Quick Pitch</span>
                <p className="text-xs text-[#1A1D1F] font-semibold leading-relaxed">
                  "{req.coverNotes}"
                </p>
              </div>

              {/* Skills required */}
              <div className="flex flex-wrap gap-1.5">
                {(req.skills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-brand-bg border border-[#EFEFEF] text-slate-700 font-bold px-2 py-0.5 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Portion: Action Buttons & Socials links */}
            <div className="flex md:flex-col justify-between items-center md:items-end gap-4 md:border-l md:border-[#F4F4F4] md:pl-6 shrink-0">
              
              {/* Social Links */}
              <div className="flex gap-2">
                <a
                  href={req.github || 'https://github.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-brand-bg hover:bg-slate-200 border border-[#EFEFEF] text-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={req.linkedin || 'https://linkedin.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-brand-bg hover:bg-slate-200 border border-[#EFEFEF] text-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={req.portfolio || 'https://portfolio.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-brand-bg hover:bg-slate-200 border border-[#EFEFEF] text-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                </a>
              </div>

              {/* Action triggers */}
              <div className="flex gap-2 w-full md:w-fit">
                <button
                  onClick={() => handleAction(req.id, 'reject')}
                  className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => handleAction(req.id, 'accept')}
                  className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept
                </button>
              </div>

            </div>

          </div>
        ))}

        {pendingRequests.length === 0 && (
          <div className="bg-white border border-[#EFEFEF] rounded-[24px] py-16 text-center text-xs font-bold text-[#9A9FA5]">
            No pending teammate applications.
          </div>
        )}
      </div>

    </div>
  )
}
