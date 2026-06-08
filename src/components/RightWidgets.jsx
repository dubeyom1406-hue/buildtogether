import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, Send, Users, Grid, Palette, Code, Briefcase, UserCheck, Search, MessageSquare, SlidersHorizontal, RotateCcw
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api } from '../api'

export default function RightWidgets() {
  const navigate = useNavigate()
  // View state switcher: 'ai', 'team', 'filters'
  const [activeView, setActiveView] = useState('ai')

  // Search & filter state for Team Directory
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDept, setActiveDept] = useState('All')

  // AI assistant state
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hey! I'm your Campus AI. Ask me to find collaborators in your field, suggest teams, or get concept advice!",
      timestamp: 'Just now'
    }
  ])

  // Explore Filters from global context
  const { ideas, selectedCategory, setSelectedCategory, selectedSkill, setSelectedSkill, selectedStage, setSelectedStage } = useApp()

  const categories = ['All', 'EdTech', 'FinTech', 'GreenTech', 'HealthTech']
  const skillsList = ['All', 'React', 'Python', 'Node', 'UI/UX', 'AI/ML', 'Solidity', 'Firebase']
  const stages = ['All', 'Idea', 'Prototype', 'MVP']

  const handleResetFilters = () => {
    setSelectedCategory('All')
    setSelectedSkill('All')
    setSelectedStage('All')
  }

  const hasActiveFilters = selectedCategory !== 'All' || selectedSkill !== 'All' || selectedStage !== 'All'

  const [members, setMembers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers()
        setMembers(data.map(u => ({
          uid: u.uid,
          name: u.name,
          role: u.role || u.field || 'Builder',
          dept: u.role === 'Student' ? 'Tech' : 'Business',
          email: u.email,
          skills: u.skills || [],
          avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
        })))
      } catch (err) {
        console.warn('Failed to fetch team members:', err)
      }
    }
    fetchUsers()
  }, [])

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeDept === 'All' || m.dept === activeDept
    return matchesSearch && matchesTab
  })

  const handleAISubmit = (e, customQuery = null) => {
    if (e) e.preventDefault()
    const finalQuery = (customQuery || query).trim()
    if (!finalQuery) return

    const userMsg = { sender: 'user', text: finalQuery, timestamp: 'Just now' }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setLoading(true)

    setTimeout(() => {
      let botResponseText = ""
      let suggestedPeople = []
      let suggestedIdeas = []
      const qLower = finalQuery.toLowerCase()
      const words = qLower.split(/[\s,?.!]+/).filter(w => w.length > 2)

      const isLookingForIdeas = qLower.includes('idea') || qLower.includes('project') || qLower.includes('pitch') || qLower.includes('startup')
      const isLookingForPeople = qLower.includes('people') || qLower.includes('collaborator') || qLower.includes('member') || qLower.includes('developer') || qLower.includes('designer') || qLower.includes('builder') || qLower.includes('coder') || qLower.includes('find') || qLower.includes('need') || qLower.includes('show') || qLower.includes('search') || words.length > 0

      // Match users based on words/skills
      if (isLookingForPeople) {
        members.forEach(m => {
          let score = 0
          const mSkills = (m.skills || []).map(s => s.toLowerCase())
          const mRole = (m.role || '').toLowerCase()
          const mName = m.name.toLowerCase()

          words.forEach(w => {
            if (mSkills.includes(w) || mSkills.some(s => s.includes(w))) {
              score += 40
            }
            if (mRole.includes(w)) {
              score += 30
            }
            if (mName.includes(w)) {
              score += 20
            }
          })

          if (mSkills.includes(qLower) || mSkills.some(s => s.includes(qLower))) {
            score += 50
          }
          if (mRole.includes(qLower)) {
            score += 40
          }

          if (score > 0) {
            suggestedPeople.push({
              uid: m.uid,
              name: m.name,
              role: m.role,
              match: `${Math.min(95, 60 + score)}%`,
              avatar: m.avatar
            })
          }
        })
      }

      // Match ideas based on words
      if (isLookingForIdeas) {
        (ideas || []).forEach(idea => {
          let score = 0
          const titleLower = idea.title.toLowerCase()
          const descLower = (idea.description || '').toLowerCase()
          const catLower = (idea.category || '').toLowerCase()
          const iSkills = (idea.skills || []).map(s => s.toLowerCase())

          words.forEach(w => {
            if (titleLower.includes(w)) score += 40
            if (descLower.includes(w)) score += 20
            if (catLower.includes(w)) score += 30
            if (iSkills.includes(w)) score += 30
          })

          if (score > 0) {
            suggestedIdeas.push({
              id: idea.id,
              title: idea.title,
              category: idea.category,
              stage: idea.stage,
              founder: idea.founderName || idea.founderEmail || 'Founder'
            })
          }
        })
      }

      suggestedPeople = suggestedPeople.filter((v, i, a) => a.findIndex(t => t.uid === v.uid) === i)
      suggestedPeople.sort((a, b) => parseInt(b.match) - parseInt(a.match))

      if (suggestedPeople.length > 0 && suggestedIdeas.length > 0) {
        botResponseText = "I searched the campus database and found both matching builders and startup ideas:"
      } else if (suggestedPeople.length > 0) {
        botResponseText = "Found the following matching builders in the campus database ready to collaborate:"
      } else if (suggestedIdeas.length > 0) {
        botResponseText = "Found these matching startup concepts currently open for team members:"
      } else {
        botResponseText = "Not found. No matching builders or projects were found in the database for your query. Try searching for specific skills (e.g. React, Python, Solidity) or depts."
      }

      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: botResponseText, 
          people: suggestedPeople, 
          ideas: suggestedIdeas, 
          timestamp: 'Just now' 
        }
      ])
      setLoading(false)
    }, 800)
  }

  const handleQuickPrompt = (promptText) => handleAISubmit(null, promptText)

  return (
    <div className="w-full flex flex-col gap-5 select-none">
      
      {/* Central Tabbed Container */}
      <div className="bg-white rounded-[24px] border border-[#EFEFEF] p-5 flex flex-col gap-3.5 shadow-sm">
        
        {/* Title and Badge */}
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-sm text-[#1A1D1F]">Campus Dashboard</span>
          {hasActiveFilters && (
            <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Filters Active
            </span>
          )}
        </div>

        {/* Logo Shortcuts Tab Switcher — 3 tabs now */}
        <div className="flex bg-[#F8F9FA] border border-[#EFEFEF] p-1 rounded-xl w-full justify-between gap-1 mt-0.5">
          <button
            onClick={() => setActiveView('ai')}
            title="Campus AI Assistant"
            className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeView === 'ai'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveView('team')}
            title="Team Directory"
            className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeView === 'team'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveView('filters')}
            title="Explore Filters"
            className={`flex-1 py-2 rounded-lg flex items-center justify-center relative transition-all cursor-pointer ${
              activeView === 'filters'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-slate-200/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && activeView !== 'filters' && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Separator line */}
        <div className="border-b border-[#F4F4F4] my-0.5" />

        {/* RENDER VIEW 1: CAMPUS AI CHAT */}
        {activeView === 'ai' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1 text-[11px]">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-brand-primary text-white rounded-tr-none' 
                        : 'bg-brand-bg text-[#1A1D1F] border border-[#EFEFEF] rounded-tl-none'
                    }`}
                  >
                    <p className="font-semibold">{msg.text}</p>
                    {msg.people && msg.people.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-200/50">
                        {msg.people.map((p, pIdx) => (
                          <div 
                            key={pIdx} 
                            onClick={() => p.uid && navigate(`/profile?uid=${p.uid}`)}
                            className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-left"
                            title="View Profile"
                          >
                            <div className="flex items-center gap-2">
                              <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                              <div className="flex flex-col">
                                <span className="font-bold text-[#1A1D1F]">{p.name}</span>
                                <span className="text-[9px] text-[#6F767E] font-medium">{p.role}</span>
                              </div>
                            </div>
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded shrink-0">{p.match}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.ideas && msg.ideas.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-200/50">
                        <span className="text-[8px] font-bold text-[#9A9FA5] uppercase tracking-wider self-start">Projects Found:</span>
                        {msg.ideas.map((idea, iIdx) => (
                          <div 
                            key={iIdx} 
                            onClick={() => navigate('/dashboard')}
                            className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1 text-left cursor-pointer hover:bg-slate-50 transition-colors"
                            title="Go to explore"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#1A1D1F] text-[10px]">{idea.title}</span>
                              <span className="text-[8px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">{idea.stage}</span>
                            </div>
                            <span className="text-[8px] text-slate-500 font-semibold">Category: {idea.category} · Founder: {idea.founder}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 font-semibold px-1">{msg.timestamp}</span>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[#6F767E] font-bold px-2 py-1 bg-brand-bg rounded-full w-fit">
                  <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>Analyzing database...</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-0.5">
              <button onClick={() => handleQuickPrompt("Find collaborators in my field")} disabled={loading} className="text-[9px] bg-slate-100 hover:bg-brand-light hover:text-brand-primary border border-transparent hover:border-brand-primary/10 text-slate-600 font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50">People in my field</button>
              <button onClick={() => handleQuickPrompt("Find Solidity developers")} disabled={loading} className="text-[9px] bg-slate-100 hover:bg-brand-light hover:text-brand-primary border border-transparent hover:border-brand-primary/10 text-slate-600 font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50">Solidity Developers</button>
              <button onClick={() => handleQuickPrompt("Startup advice")} disabled={loading} className="text-[9px] bg-slate-100 hover:bg-brand-light hover:text-brand-primary border border-transparent hover:border-brand-primary/10 text-slate-600 font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50">Pitch advice</button>
            </div>

            <form onSubmit={handleAISubmit} className="flex gap-2 border-t border-[#F4F4F4] pt-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                placeholder="Ask AI: e.g. Need developers..."
                className="flex-1 bg-brand-bg px-3.5 py-2 text-xs font-semibold rounded-xl text-[#1A1D1F] placeholder-[#9A9FA5] border border-[#EFEFEF] focus:outline-none focus:bg-white focus:border-brand-primary transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-brand-primary text-white p-2.5 rounded-xl hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* RENDER VIEW 2: TEAM DIRECTORY */}
        {activeView === 'team' && (
          <div className="flex flex-col gap-3 py-1">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9FA5]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search team members..."
                className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-semibold"
              />
            </div>

            <div className="flex bg-[#F8F9FA] border border-[#EFEFEF] p-1 rounded-xl w-full justify-between gap-1 mt-1">
              {[
                { name: 'All', icon: Grid, label: 'All Depts' },
                { name: 'Design', icon: Palette, label: 'Design' },
                { name: 'Tech', icon: Code, label: 'Tech' },
                { name: 'Business', icon: Briefcase, label: 'Business' },
                { name: 'HR', icon: UserCheck, label: 'HR' }
              ].map((dept) => {
                const Icon = dept.icon
                const isActive = activeDept === dept.name
                return (
                  <button
                    key={dept.name}
                    onClick={() => setActiveDept(dept.name)}
                    title={dept.label}
                    className={`flex-1 py-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-[#6F767E] hover:text-[#1A1D1F] hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold px-1 mt-0.5">
              <span>Dept: {activeDept === 'All' ? 'All' : activeDept}</span>
              <span>{filteredMembers.length} Found</span>
            </div>

            <div className="border-b border-[#F4F4F4] my-0.5" />

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#F8F9FA] p-2.5 rounded-xl border border-[#EFEFEF] hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-[#EFEFEF]" />
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-[#1A1D1F] truncate">{member.name}</span>
                        <span className="text-[9px] text-[#6F767E] font-semibold truncate">{member.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Opening chat with ${member.name}`)}
                      className="text-brand-primary hover:text-white bg-brand-primary/10 hover:bg-brand-primary p-2 rounded-lg transition-all cursor-pointer shrink-0"
                      title={`Message ${member.name}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[11px] text-slate-400 font-semibold italic bg-[#F8F9FA] border border-dashed border-slate-200 rounded-xl">
                  No matching members found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* RENDER VIEW 3: EXPLORE FILTERS */}
        {activeView === 'filters' && (
          <div className="flex flex-col gap-4 py-1">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-extrabold text-[#1A1D1F]">Explore Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[10px] text-[#9A9FA5] hover:text-brand-primary font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <p className="text-[10px] text-[#9A9FA5] font-semibold -mt-2">
              Filters apply to the <strong className="text-brand-primary">Explore</strong> tab in the main feed.
            </p>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-[#6F767E] uppercase tracking-wider">Category</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                      selectedCategory === c
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-[#F8F9FA] text-[#6F767E] border-[#EFEFEF] hover:border-brand-primary/40 hover:text-brand-primary'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-[#6F767E] uppercase tracking-wider">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSkill(s)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                      selectedSkill === s
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-[#F8F9FA] text-[#6F767E] border-[#EFEFEF] hover:border-brand-primary/40 hover:text-brand-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-[#6F767E] uppercase tracking-wider">Stage</span>
              <div className="flex flex-wrap gap-1.5">
                {stages.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedStage(s)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                      selectedStage === s
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-[#F8F9FA] text-[#6F767E] border-[#EFEFEF] hover:border-brand-primary/40 hover:text-brand-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter summary */}
            {hasActiveFilters && (
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider">Active Filters</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedCategory !== 'All' && <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">{selectedCategory}</span>}
                  {selectedSkill !== 'All' && <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">{selectedSkill}</span>}
                  {selectedStage !== 'All' && <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">{selectedStage}</span>}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  )
}
