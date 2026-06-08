import { useState, useEffect } from 'react'
import { Search, Mail, MessageSquare, Globe, Briefcase, Users, CheckSquare, Clock } from 'lucide-react'
import { api } from '../api'
import { useApp } from '../context/AppContext'

export default function Team() {
  const { currentUser } = useApp()
  const [activeView, setActiveView] = useState('team')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDept, setActiveDept] = useState('All')
  const [acceptedMembers, setAcceptedMembers] = useState([])
  const [myIdeas, setMyIdeas] = useState([])
  const [selectedIdeaIdx, setSelectedIdeaIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [requests, ideas] = await Promise.all([
          api.getRequests(),
          api.getIdeas()
        ])
        // Team members = people whose join request was accepted
        const accepted = requests.filter(r => r.status === 'accepted')
        setAcceptedMembers(accepted)

        // My ideas = ideas I founded
        const mine = ideas.filter(i => i.founderUid === currentUser?.uid)
        setMyIdeas(mine)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentUser])

  const depts = ['All', 'Design', 'Tech', 'Business', 'HR']

  const filteredMembers = acceptedMembers.filter(m => {
    const name = m.applicantName || ''
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeDept === 'All' || true) // dept filter not available without profile field
    )
  })

  const selectedIdea = myIdeas[selectedIdeaIdx]

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto select-none">

      {/* Top Selector Tabs */}
      <div className="flex justify-between items-center border-b border-[#EFEFEF] pb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveView('team')}
            className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeView === 'team'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-[#6F767E] hover:text-[#1A1D1F]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members</span>
          </button>

          <button
            onClick={() => setActiveView('projects')}
            className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeView === 'projects'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-[#6F767E] hover:text-[#1A1D1F]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>My Projects</span>
          </button>
        </div>

        <span className="text-xs text-[#9A9FA5] font-semibold">
          {activeView === 'team'
            ? `${acceptedMembers.length} Members`
            : `${myIdeas.length} Projects`}
        </span>
      </div>

      {/* VIEW 1: TEAM */}
      {activeView === 'team' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-white border border-[#EFEFEF] p-1 rounded-2xl w-fit">
              {depts.map(dept => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    activeDept === dept
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-[#6F767E] hover:text-[#1A1D1F]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9FA5]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search members"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EFEFEF] rounded-full text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#9A9FA5] text-sm font-semibold">Loading...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Users className="w-12 h-12 text-[#EFEFEF]" />
              <p className="text-sm font-bold text-[#9A9FA5]">No team members yet</p>
              <p className="text-xs text-[#9A9FA5]">Accept join requests to build your team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex flex-col items-center text-center gap-4 hover:border-[#D1D5DB] transition-all duration-200"
                >
                  <div className="relative">
                    {member.applicantAvatar ? (
                      <img
                        src={member.applicantAvatar}
                        alt={member.applicantName}
                        className="w-20 h-20 rounded-full object-cover border border-[#EFEFEF] shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center text-2xl font-bold text-brand-primary border border-[#EFEFEF]">
                        {(member.applicantName || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-[#1A1D1F]">{member.applicantName}</span>
                    <span className="text-[11px] text-[#6F767E] font-semibold">{member.ideaTitle}</span>
                  </div>

                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100">
                    Accepted
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-[#6F767E] font-medium">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{member.applicantEmail}</span>
                  </div>

                  <div className="w-full border-t border-[#F4F4F4] pt-4">
                    <a
                      href={`mailto:${member.applicantEmail}`}
                      className="w-full bg-brand-primary/10 hover:bg-brand-primary hover:text-white text-brand-primary text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Contact
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY PROJECTS */}
      {activeView === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1 flex flex-col gap-3.5">
            <h3 className="text-xs font-bold text-[#9A9FA5] uppercase tracking-wider px-2">Your Ideas</h3>
            {loading ? (
              <div className="text-center py-8 text-[#9A9FA5] text-sm">Loading...</div>
            ) : myIdeas.length === 0 ? (
              <div className="text-center py-10 text-[#9A9FA5] text-sm font-semibold flex flex-col items-center gap-2">
                <Briefcase className="w-10 h-10 text-[#EFEFEF]" />
                No ideas yet. Create one!
              </div>
            ) : (
              myIdeas.map((idea, idx) => (
                <button
                  key={idea.id}
                  onClick={() => setSelectedIdeaIdx(idx)}
                  className={`p-5 rounded-[24px] border text-left transition-all duration-200 cursor-pointer flex flex-col gap-3 bg-white w-full ${
                    selectedIdeaIdx === idx
                      ? 'border-brand-primary ring-1 ring-brand-primary'
                      : 'border-[#EFEFEF] hover:border-[#D1D5DB]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-extrabold text-[#1A1D1F] leading-snug line-clamp-2">
                      {idea.title}
                    </h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
                      {idea.stage}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#9A9FA5] font-semibold pt-1 border-t border-[#F9F9F9]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {idea.teamSize}
                    </span>
                    <span>{idea.category}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Idea Detail */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {selectedIdea ? (
              <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-6 flex flex-col gap-6">
                <div className="border-b border-[#F4F4F4] pb-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-[11px] font-bold tracking-wider uppercase">Project Workspace</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-[#1A1D1F]">{selectedIdea.title}</h2>
                  <p className="text-xs text-[#6F767E] font-medium leading-relaxed mt-1">
                    {selectedIdea.description || 'No description added.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-brand-bg rounded-2xl p-4 flex flex-col gap-1 border border-[#F4F4F4]">
                    <span className="text-[10px] text-[#9A9FA5] font-bold uppercase">Stage</span>
                    <span className="text-base font-extrabold text-[#1A1D1F]">{selectedIdea.stage}</span>
                  </div>
                  <div className="bg-brand-bg rounded-2xl p-4 flex flex-col gap-1 border border-[#F4F4F4]">
                    <span className="text-[10px] text-[#9A9FA5] font-bold uppercase">Team</span>
                    <span className="text-base font-extrabold text-[#1A1D1F]">{selectedIdea.teamSize}</span>
                  </div>
                  <div className="bg-brand-bg rounded-2xl p-4 flex flex-col gap-1 border border-[#F4F4F4]">
                    <span className="text-[10px] text-[#9A9FA5] font-bold uppercase">Category</span>
                    <span className="text-base font-extrabold text-[#1A1D1F]">{selectedIdea.category}</span>
                  </div>
                </div>

                {selectedIdea.skills?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-2 border-b border-[#F4F4F4] pb-2">
                      <CheckSquare className="w-4 h-4 text-brand-primary" />
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedIdea.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIdea.teamRequirement && (
                  <div className="bg-brand-bg border border-[#EFEFEF] rounded-2xl p-4">
                    <p className="text-xs text-[#6F767E] font-medium">{selectedIdea.teamRequirement}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-white border border-[#EFEFEF] rounded-[24px] p-8 flex flex-col justify-center items-center text-center text-[#9A9FA5]">
                <Briefcase className="w-12 h-12 text-[#EFEFEF] mb-3" />
                <span className="text-sm font-bold">Select a project to view details</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
