import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, ArrowRight, Award, FolderGit, Users2, Code, Flame, 
  MoreHorizontal, Image as ImageIcon, Video, Music, Heart, MessageSquare, 
  Share2, Search, SlidersHorizontal, UserPlus, Check, X, Shield, 
  GraduationCap, FileText, ChevronRight, Info, UploadCloud, UserCheck, Play,
  Bookmark, Globe, Lock, Users, Link2, Hash, AtSign, Smile, BarChart2, Send
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api } from '../api'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, ideas, addIdea, addRequest, feedPosts, likePost, savePost, addComment, addFeedPost, selectedCategory, setSelectedCategory, selectedSkill, setSelectedSkill, selectedStage, setSelectedStage } = useApp()
  const [activeTab, setActiveTab] = useState('feed') // 'feed', 'explore', 'post'
  const [postText, setPostText] = useState('')
  const [expandedComments, setExpandedComments] = useState({}) // postId -> boolean
  const [commentInputs, setCommentInputs] = useState({}) // postId -> string
  const [postImage, setPostImage] = useState(null)

  const [requestedIdeaIds, setRequestedIdeaIds] = useState([])

  // Modal spec details
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [isModalApprovedView, setIsModalApprovedView] = useState(false)
  const [modalApplyNotes, setModalApplyNotes] = useState('')
  const [modalApplied, setModalApplied] = useState(false)

  // Form states for Post Idea
  const [formTitle, setFormTitle] = useState('')
  const [formProblem, setFormProblem] = useState('')
  const [formSolution, setFormSolution] = useState('')
  const [formCategory, setFormCategory] = useState('EdTech')
  const [formSkills, setFormSkills] = useState([])
  const [formTeamSize, setFormTeamSize] = useState(3)
  const [formStage, setFormStage] = useState('Idea')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [postType, setPostType] = useState('update') // 'update' or 'idea'

  // Post composer extended state
  const [postAudience, setPostAudience] = useState('public')   // 'public' | 'college' | 'team'
  const [postLooking, setPostLooking] = useState([])           // multiple: 'cofounder','feedback','collab','beta'
  const [selectedPostTag, setSelectedPostTag] = useState('')   // single active tag
  const MAX_POST_CHARS = 500

  const categories = ['All', 'EdTech', 'FinTech', 'GreenTech', 'HealthTech']
  const skillsList = ['All', 'React', 'Python', 'Node', 'UI/UX', 'AI/ML', 'Solidity']
  const availableSkills = ['React', 'React Native', 'Node', 'Python', 'UI/UX', 'AI/ML', 'Solidity', 'Firebase']
  const stages = ['All', 'Idea', 'Prototype', 'MVP']

  // Explore filter pill (all / ideas / people / teams)
  const [exploreFilter, setExploreFilter] = useState('all')
  const [exploreSortBy, setExploreSortBy] = useState('latest')
  const [searchTerm, setSearchTerm] = useState('')

  // People and Teams for Explore
  const [explorePeople, setExplorePeople] = useState([])
  const exploreTeams = []

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers()
        setExplorePeople(data.filter(u => u.uid !== currentUser?.uid))
      } catch (err) {
        console.warn('Failed to fetch explore people:', err)
      }
    }
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])


  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPostImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!postText.trim() && !postImage) return
    addFeedPost(postText, postImage)
    setPostText('')
    const hadImage = !!postImage
    setPostImage(null)
    setActiveTab(hadImage ? 'feed' : 'explore')
  }

  const handleJoinRequest = async (id, e) => {
    e.stopPropagation()
    if (requestedIdeaIds.includes(id)) return
    const idea = ideas.find(i => i.id === id)
    if (!idea) return
    setRequestedIdeaIds([...requestedIdeaIds, id])
    await addRequest({
      ideaId: idea.id,
      ideaTitle: idea.title,
      founderEmail: idea.founder_email || idea.founderEmail || '',
      coverNotes: "I'd like to join!"
    })
    alert('Join request submitted to project founder successfully!')
  }

  const handleModalJoinRequest = async (id) => {
    if (requestedIdeaIds.includes(id)) return
    const idea = ideas.find(i => i.id === id)
    if (!idea) return
    setRequestedIdeaIds([...requestedIdeaIds, id])
    setModalApplied(true)
    await addRequest({
      ideaId: idea.id,
      ideaTitle: idea.title,
      founderEmail: idea.founder_email || idea.founderEmail || '',
      coverNotes: modalApplyNotes || "Hi, I would like to collaborate on this project."
    })
    alert('Cover notes pitch submitted successfully!')
  }

  const handleFormSkillToggle = (skill) => {
    if (formSkills.includes(skill)) {
      setFormSkills(formSkills.filter(s => s !== skill))
    } else {
      setFormSkills([...formSkills, skill])
    }
  }

  const handlePublishIdea = async (e) => {
    e.preventDefault()
    if (!formTitle || !formProblem || !formSolution || formSkills.length === 0) {
      alert('Please fill out all required fields and select at least one skill.')
      return
    }

    setFormSubmitting(true)
    try {
      const newIdea = {
        title: formTitle,
        category: formCategory,
        skills: formSkills,
        teamSize: `1/${formTeamSize} members`,
        teamSizeLimit: formTeamSize,
        stage: formStage,
        description: formProblem,
        teamRequirement: 'Need skilled developers with ' + formSkills.join(', ') + ' to form team.',
        privateDetails: {
          problemStatement: formProblem,
          solution: formSolution,
          roadmap: [
            { phase: 'Phase 1', task: 'Concept framing & wireframe specs', status: 'Completed' },
            { phase: 'Phase 2', task: 'Alpha product coding sprint', status: 'In Progress' }
          ],
          resources: [
            { name: 'Initial product brief', type: 'Document' }
          ]
        }
      }

      await addIdea(newIdea)
      setFormSubmitting(false)
      setFormTitle('')
      setFormProblem('')
      setFormSolution('')
      setFormSkills([])
      setFormTeamSize(3)
      setFormStage('Idea')
      setActiveTab('explore')
      alert('Startup Concept Pitch published on board successfully!')
    } catch (err) {
      setFormSubmitting(false)
      alert('Error publishing idea: ' + err.message)
    }
  }

  // Filter Ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          idea.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory
    const matchesSkill = selectedSkill === 'All' || idea.skills.includes(selectedSkill)
    const matchesStage = selectedStage === 'All' || idea.stage === selectedStage
    return matchesSearch && matchesCategory && matchesSkill && matchesStage
  })

  return (
    <div className="flex flex-col gap-6 select-none">
        


        {/* Tabs Controller */}
        <div className="flex bg-white border border-[#EFEFEF] p-1.5 rounded-2xl w-full shadow-sm">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-[#6F767E] hover:text-[#1A1D1F]'
            }`}
          >
            Feed
          </button>
          
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-[#6F767E] hover:text-[#1A1D1F]'
            }`}
          >
            Explore
          </button>

          <button
            onClick={() => setActiveTab('post')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'post'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-[#6F767E] hover:text-[#1A1D1F]'
            }`}
          >
            Post
          </button>
        </div>

        {/* RENDER VIEW 1: CAMPUS FEED */}
        {activeTab === 'feed' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {feedPosts.map((post) => {
                  const isLiked = post.likedBy?.includes(currentUser?.uid)
                  const isSaved = post.savedBy?.includes(currentUser?.uid)
                  const isCommentsExpanded = expandedComments[post.id]

                  const handleShare = (postId) => {
                    const url = `${window.location.origin}/post/${postId}`
                    navigator.clipboard.writeText(url)
                      .then(() => alert('Post link copied to clipboard!'))
                      .catch(() => alert('Failed to copy post link.'))
                  }

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-[24px] border border-[#EFEFEF] p-5 flex flex-col gap-4 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img 
                            src={post.avatar} 
                            alt={post.author} 
                            className="w-10 h-10 rounded-full object-cover border border-[#EFEFEF] cursor-pointer hover:scale-105 transition-transform duration-200" 
                            onClick={() => navigate(`/profile?uid=${post.authorUid}`)}
                          />
                          <div className="flex flex-col">
                            <span 
                              className="text-xs font-bold text-[#1A1D1F] cursor-pointer hover:underline"
                              onClick={() => navigate(`/profile?uid=${post.authorUid}`)}
                            >
                              {post.author}
                            </span>
                            <span className="text-[10px] text-[#9A9FA5] font-semibold">{post.time}</span>
                          </div>
                        </div>
                        <button className="text-[#9A9FA5] hover:text-[#1A1D1F] p-1.5 rounded-full transition-colors"><MoreHorizontal className="w-4.5 h-4.5" /></button>
                      </div>
                      <p className="text-xs font-semibold text-[#1A1D1F] leading-snug">{post.content}</p>
                      {post.image && (
                        <div className="w-full rounded-[20px] overflow-hidden border border-[#F4F4F4]">
                          {post.image.startsWith('data:video/') ? (
                            <video src={post.image} controls className="w-full object-cover max-h-[300px]" />
                          ) : post.image.startsWith('data:audio/') ? (
                            <audio src={post.image} controls className="w-full px-4 py-2" />
                          ) : post.image.startsWith('data:image/') || post.image.startsWith('http') ? (
                            <img src={post.image} alt="Post attachment" className="w-full object-cover max-h-[300px]" />
                          ) : (
                            <a href={post.image} download="attachment" className="flex items-center gap-2 p-4 bg-brand-bg rounded-xl text-xs font-bold text-slate-800 border border-[#EFEFEF] hover:bg-slate-200 transition-colors">
                              <FileText className="w-4.5 h-4.5 text-brand-primary" />
                              <span>Download Attachment File</span>
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Interactions Row */}
                      <div className="flex items-center gap-6 border-t border-[#F4F4F4] pt-4 text-[#6F767E] text-xs font-semibold">
                        <button 
                          onClick={() => likePost(post.id)}
                          className={`flex items-center gap-2 hover:text-red-500 transition-colors cursor-pointer ${isLiked ? 'text-red-500 font-bold' : ''}`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{post.likes || 0} Likes</span>
                        </button>
                        <button 
                          onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !isCommentsExpanded })}
                          className={`flex items-center gap-2 hover:text-brand-primary transition-colors cursor-pointer ${isCommentsExpanded ? 'text-brand-primary font-bold' : ''}`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments?.length || 0} Comments</span>
                        </button>
                        <button 
                          onClick={() => savePost(post.id)}
                          className={`flex items-center gap-2 hover:text-brand-primary transition-colors cursor-pointer ${isSaved ? 'text-brand-primary font-bold' : ''}`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-primary text-brand-primary' : ''}`} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                        <button 
                          onClick={() => handleShare(post.id)}
                          className="flex items-center gap-2 hover:text-[#1A1D1F] transition-colors cursor-pointer ml-auto"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Comments panel */}
                      {isCommentsExpanded && (
                        <div className="border-t border-[#F4F4F4] pt-4 mt-2 flex flex-col gap-4">
                          <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Comments</span>
                          
                          {post.comments && post.comments.length > 0 ? (
                            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 bg-brand-bg p-3 rounded-2xl border border-[#F4F4F4]">
                                  <img src={comment.avatar} alt={comment.author} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-[#1A1D1F]">{comment.author}</span>
                                      <span className="text-[9px] text-[#9A9FA5] font-semibold">{comment.time}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-[#1A1D1F] leading-snug">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 font-semibold italic text-center py-2">No comments yet. Be the first to start the discussion!</p>
                          )}

                          <form 
                            onSubmit={(e) => {
                              e.preventDefault()
                              const text = commentInputs[post.id] || ''
                              if (!text.trim()) return
                              addComment(post.id, text)
                              setCommentInputs({ ...commentInputs, [post.id]: '' })
                            }}
                            className="flex gap-2.5 items-center mt-1"
                          >
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              className="flex-1 bg-brand-bg px-4 py-2.5 text-xs font-semibold rounded-xl text-[#1A1D1F] placeholder-[#9A9FA5] border border-[#EFEFEF] focus:outline-none focus:bg-white focus:border-brand-primary"
                            />
                            <button 
                              type="submit"
                              disabled={!(commentInputs[post.id] || '').trim()}
                              className="bg-brand-primary text-white text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {feedPosts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[24px] border border-[#EFEFEF] flex flex-col items-center gap-3 shadow-sm">
                  <span className="text-3xl">📝</span>
                  <p className="text-xs font-bold text-[#9A9FA5]">No updates posted on campus yet.</p>
                  <p className="text-[10px] text-slate-400 font-semibold max-w-[280px] leading-relaxed">Go to the Post tab to share your first project update or pitch a startup idea!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RENDER VIEW 2: EXPLORE (Mixed: Ideas + People + Teams) */}
        {activeTab === 'explore' && (
          <div className="flex flex-col gap-5">

            {/* Search bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9FA5]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${exploreFilter === 'all' ? 'everything' : exploreFilter}...`}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EFEFEF] rounded-full text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary font-semibold"
              />
            </div>

            {/* Explore Filters Tab Row */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Updates' },
                { id: 'ideas', label: '💡 Startup Ideas' },
                { id: 'people', label: '👤 People' },
                { id: 'teams', label: '🚀 Teams' },
                { id: 'posts', label: '📝 Campus Posts' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setExploreFilter(pill.id)}
                  className={`px-4 py-2.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                    exploreFilter === pill.id
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                      : 'bg-white text-[#6F767E] border-[#EFEFEF] hover:border-slate-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* ── IDEAS SECTION ── */}
            {(exploreFilter === 'all' || exploreFilter === 'ideas') && (
              <div className="flex flex-col gap-3">
                {exploreFilter === 'all' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">💡 Startup Ideas</span>
                    <button onClick={() => setExploreFilter('ideas')} className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer">See all →</button>
                  </div>
                )}
                {filteredIdeas
                  .filter(i => !searchTerm || i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  .sort((a, b) => {
                    if (exploreSortBy === 'match') return parseInt(b.matchScore) - parseInt(a.matchScore)
                    if (exploreSortBy === 'az') return a.title.localeCompare(b.title)
                    if (exploreSortBy === 'popular') return (b.reputation || 0) - (a.reputation || 0)
                    return 0 // latest = default order
                  })
                  .slice(0, exploreFilter === 'all' ? 2 : undefined)
                  .map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => { setSelectedIdea(idea); setModalApplied(requestedIdeaIds.includes(idea.id)); setIsModalApprovedView(false) }}
                      className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex flex-col gap-3 group hover:border-brand-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className="bg-[#F4F4F4] text-[#1A1D1F] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit">{idea.category}</span>
                          <h3 className="text-sm font-extrabold text-[#1A1D1F] leading-snug group-hover:text-brand-primary transition-colors">{idea.title}</h3>
                        </div>
                        <span className="text-emerald-600 text-xs font-bold shrink-0">{idea.matchScore} Match</span>
                      </div>
                      <p className="text-xs text-[#6F767E] font-medium leading-relaxed">{idea.description}</p>
                      <div className="flex items-center justify-between border-t border-[#F4F4F4] pt-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {idea.skills.map((skill, idx) => (
                            <span key={idx} className="text-[9px] bg-brand-bg border border-[#F4F4F4] text-slate-600 font-bold px-2 py-0.5 rounded-md">{skill}</span>
                          ))}
                        </div>
                        <button
                          onClick={(e) => handleJoinRequest(idea.id, e)}
                          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0 ${
                            requestedIdeaIds.includes(idea.id)
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-brand-primary text-white hover:bg-brand-hover shadow-sm'
                          }`}
                        >
                          {requestedIdeaIds.includes(idea.id) ? <><Check className="w-3 h-3" />Requested</> : <><UserPlus className="w-3 h-3" />Join</>}
                        </button>
                      </div>
                    </div>
                  ))}
                {filteredIdeas.length === 0 && (
                  <p className="text-center text-xs font-bold text-[#9A9FA5] py-8">No ideas match your search.</p>
                )}
              </div>
            )}

            {/* ── PEOPLE SECTION ── */}
            {(exploreFilter === 'all' || exploreFilter === 'people') && (
              <div className="flex flex-col gap-3">
                {exploreFilter === 'all' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">👤 People to Connect</span>
                    <button onClick={() => setExploreFilter('people')} className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer">See all →</button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {explorePeople
                    .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.role && p.role.toLowerCase().includes(searchTerm.toLowerCase())))
                    .slice(0, exploreFilter === 'all' ? 4 : undefined)
                    .map((person) => (
                      <div key={person.uid} className="bg-white border border-[#EFEFEF] rounded-[20px] p-4 flex flex-col items-center gap-3 hover:border-brand-primary/30 hover:shadow-sm transition-all duration-200">
                        <div className="relative">
                          <img 
                            src={person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                            alt={person.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#EFEFEF] cursor-pointer hover:scale-105 transition-transform duration-200" 
                            onClick={() => navigate(`/profile?uid=${person.uid}`)}
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="text-center">
                          <p 
                            className="text-xs font-extrabold text-[#1A1D1F] cursor-pointer hover:underline"
                            onClick={() => navigate(`/profile?uid=${person.uid}`)}
                          >
                            {person.name}
                          </p>
                          <p className="text-[10px] text-[#6F767E] font-semibold">{person.role || person.field || 'Builder'}</p>
                          <p className="text-[9px] text-[#9A9FA5] font-semibold">{person.college || 'Together Builder'}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {(person.skills || []).slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[9px] bg-brand-bg border border-[#F4F4F4] text-slate-600 font-bold px-2 py-0.5 rounded-md">{s}</span>
                          ))}
                        </div>
                        <button 
                          onClick={() => navigate(`/message?with_uid=${person.uid}`)}
                          className="w-full py-1.5 rounded-xl text-[11px] font-bold bg-brand-primary text-white hover:bg-brand-hover transition-colors cursor-pointer"
                        >
                          Connect
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── TEAMS SECTION ── */}
            {(exploreFilter === 'all' || exploreFilter === 'teams') && (
              <div className="flex flex-col gap-3">
                {exploreFilter === 'all' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">🚀 Open Teams</span>
                    <button onClick={() => setExploreFilter('teams')} className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer">See all →</button>
                  </div>
                )}
                {exploreTeams
                  .filter(t => !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.project.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((team) => (
                    <div key={team.id} className="bg-white border border-[#EFEFEF] rounded-[20px] p-4 flex items-center gap-4 hover:border-brand-primary/30 hover:shadow-sm transition-all duration-200">
                      <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center text-2xl shrink-0 border border-[#EFEFEF]">{team.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-extrabold text-[#1A1D1F] truncate">{team.name}</p>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full shrink-0">{team.openSlots} slot{team.openSlots > 1 ? 's' : ''} open</span>
                        </div>
                        <p className="text-[10px] text-[#6F767E] font-semibold truncate">{team.project}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] text-[#9A9FA5] font-semibold">{team.members} members · {team.stage}</span>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {team.skills.map((s, i) => (
                            <span key={i} className="text-[9px] bg-brand-bg border border-[#F4F4F4] text-slate-600 font-bold px-2 py-0.5 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                      <button className="px-3 py-2 rounded-xl text-[11px] font-bold bg-brand-primary text-white hover:bg-brand-hover transition-colors cursor-pointer shrink-0">
                        Apply
                      </button>
                    </div>
                  ))}
              </div>
            )}
 
            {/* ── CAMPUS POSTS SECTION ── */}
            {(exploreFilter === 'all' || exploreFilter === 'posts') && (
              <div className="flex flex-col gap-3">
                {exploreFilter === 'all' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">📝 Campus Updates</span>
                    <button onClick={() => setExploreFilter('posts')} className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer">See all →</button>
                  </div>
                )}
                
                <div className="flex flex-col gap-4">
                  {feedPosts
                    .filter(post => !searchTerm || post.content.toLowerCase().includes(searchTerm.toLowerCase()) || post.author.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, exploreFilter === 'all' ? 2 : undefined)
                    .map((post) => {
                      const isLiked = post.likedBy?.includes(currentUser?.uid)
                      const isSaved = post.savedBy?.includes(currentUser?.uid)
                      const isCommentsExpanded = expandedComments[post.id]

                      const handleShare = (postId) => {
                        const url = `${window.location.origin}/post/${postId}`
                        navigator.clipboard.writeText(url)
                          .then(() => alert('Post link copied to clipboard!'))
                          .catch(() => alert('Failed to copy post link.'))
                      }

                      return (
                        <div
                          key={post.id}
                          className="bg-white rounded-[24px] border border-[#EFEFEF] p-5 flex flex-col gap-4 text-left"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <img 
                                src={post.avatar} 
                                alt={post.author} 
                                className="w-10 h-10 rounded-full object-cover border border-[#EFEFEF] cursor-pointer hover:scale-105 transition-transform duration-200" 
                                onClick={() => navigate(`/profile?uid=${post.authorUid}`)}
                              />
                              <div className="flex flex-col">
                                <span 
                                  className="text-xs font-bold text-[#1A1D1F] cursor-pointer hover:underline"
                                  onClick={() => navigate(`/profile?uid=${post.authorUid}`)}
                                >
                                  {post.author}
                                </span>
                                <span className="text-[10px] text-[#9A9FA5] font-semibold">{post.time}</span>
                              </div>
                            </div>
                            <button className="text-[#9A9FA5] hover:text-[#1A1D1F] p-1.5 rounded-full transition-colors"><MoreHorizontal className="w-4.5 h-4.5" /></button>
                          </div>
                          <p className="text-xs font-semibold text-[#1A1D1F] leading-snug">{post.content}</p>
                          {post.image && (
                            <div className="w-full rounded-[20px] overflow-hidden border border-[#F4F4F4]">
                              {post.image.startsWith('data:video/') ? (
                                <video src={post.image} controls className="w-full object-cover max-h-[300px]" />
                              ) : post.image.startsWith('data:audio/') ? (
                                <audio src={post.image} controls className="w-full px-4 py-2" />
                              ) : post.image.startsWith('data:image/') || post.image.startsWith('http') ? (
                                <img src={post.image} alt="Post attachment" className="w-full object-cover max-h-[300px]" />
                              ) : (
                                <a href={post.image} download="attachment" className="flex items-center gap-2 p-4 bg-brand-bg rounded-xl text-xs font-bold text-slate-800 border border-[#EFEFEF] hover:bg-slate-200 transition-colors">
                                  <FileText className="w-4.5 h-4.5 text-brand-primary" />
                                  <span>Download Attachment File</span>
                                </a>
                              )}
                            </div>
                          )}
                          
                          {/* Interactions Row */}
                          <div className="flex items-center gap-6 border-t border-[#F4F4F4] pt-4 text-[#6F767E] text-xs font-semibold">
                            <button 
                              onClick={() => likePost(post.id)}
                              className={`flex items-center gap-2 hover:text-red-500 transition-colors cursor-pointer ${isLiked ? 'text-red-500 font-bold' : ''}`}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                              <span>{post.likes || 0} Likes</span>
                            </button>
                            <button 
                              onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !isCommentsExpanded })}
                              className={`flex items-center gap-2 hover:text-brand-primary transition-colors cursor-pointer ${isCommentsExpanded ? 'text-brand-primary font-bold' : ''}`}
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.comments?.length || 0} Comments</span>
                            </button>
                            <button 
                              onClick={() => savePost(post.id)}
                              className={`flex items-center gap-2 hover:text-brand-primary transition-colors cursor-pointer ${isSaved ? 'text-brand-primary font-bold' : ''}`}
                            >
                              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-primary text-brand-primary' : ''}`} />
                              <span>{isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                            <button 
                              onClick={() => handleShare(post.id)}
                              className="flex items-center gap-2 hover:text-[#1A1D1F] transition-colors cursor-pointer ml-auto"
                            >
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                          </div>

                          {/* Comments panel */}
                          {isCommentsExpanded && (
                            <div className="border-t border-[#F4F4F4] pt-4 mt-2 flex flex-col gap-4">
                              <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Comments</span>
                              
                              {post.comments && post.comments.length > 0 ? (
                                <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
                                  {post.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 bg-brand-bg p-3 rounded-2xl border border-[#F4F4F4]">
                                      <img src={comment.avatar} alt={comment.author} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                      <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-bold text-[#1A1D1F]">{comment.author}</span>
                                          <span className="text-[9px] text-[#9A9FA5] font-semibold">{comment.time}</span>
                                        </div>
                                        <p className="text-xs font-semibold text-[#1A1D1F] leading-snug">{comment.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 font-semibold italic text-center py-2">No comments yet. Be the first to start the discussion!</p>
                              )}

                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  const text = commentInputs[post.id] || ''
                                  if (!text.trim()) return
                                  addComment(post.id, text)
                                  setCommentInputs({ ...commentInputs, [post.id]: '' })
                                }}
                                className="flex gap-2.5 items-center mt-1"
                              >
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentInputs[post.id] || ''}
                                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                  className="flex-1 bg-brand-bg px-4 py-2.5 text-xs font-semibold rounded-xl text-[#1A1D1F] placeholder-[#9A9FA5] border border-[#EFEFEF] focus:outline-none focus:bg-white focus:border-brand-primary"
                                />
                                <button 
                                  type="submit"
                                  disabled={!(commentInputs[post.id] || '').trim()}
                                  className="bg-brand-primary text-white text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  Send
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  {feedPosts.length === 0 && (
                    <p className="text-center text-xs font-bold text-[#9A9FA5] py-8">No campus posts found.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* RENDER VIEW 3: POST (Create Post / Pitch Idea) */}
        {activeTab === 'post' && (
          <div className="flex flex-col gap-6">
            {/* Post Sub-tab Selector */}
            <div className="flex bg-white border border-[#EFEFEF] p-1.5 rounded-2xl shadow-sm self-start">
              <button
                type="button"
                onClick={() => setPostType('update')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  postType === 'update'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-[#6F767E] hover:text-[#1A1D1F]'
                }`}
              >
                Post Update
              </button>
              <button
                type="button"
                onClick={() => setPostType('idea')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  postType === 'idea'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-[#6F767E] hover:text-[#1A1D1F]'
                }`}
              >
                Pitch Startup Idea
              </button>
            </div>

            {postType === 'update' ? (
              <form 
                onSubmit={handlePostSubmit}
                className="bg-white rounded-[24px] border border-[#EFEFEF] p-6 flex flex-col gap-4 shadow-sm"
              >
                <input 
                  type="file" 
                  id="feed-post-file-input" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                  accept="image/*,video/*,audio/*,application/pdf" 
                />
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EFEFEF] shrink-0">
                    <img
                      src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share an update, call for co-founders, or resource..."
                    className="flex-1 bg-transparent text-xs text-[#1A1D1F] placeholder-[#9A9FA5] border-none focus:outline-none py-2 font-semibold"
                  />
                </div>

                {/* Attachment Preview Container */}
                {postImage && (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-[#EFEFEF] mt-2 self-start bg-slate-50 flex items-center justify-center">
                    {postImage.startsWith('data:image/') ? (
                      <img src={postImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : postImage.startsWith('data:video/') ? (
                      <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                        <Video className="w-8 h-8 text-brand-primary" />
                        <span className="text-[9px] text-[#6F767E] font-bold truncate max-w-[90px]">Video File</span>
                      </div>
                    ) : postImage.startsWith('data:audio/') ? (
                      <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                        <Music className="w-8 h-8 text-brand-primary" />
                        <span className="text-[9px] text-[#6F767E] font-bold truncate max-w-[90px]">Audio File</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                        <FileText className="w-8 h-8 text-brand-primary" />
                        <span className="text-[9px] text-[#6F767E] font-bold truncate max-w-[90px]">Attachment File</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPostImage(null)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-[#F4F4F4] pt-4">
                  <div className="flex items-center gap-6 text-[#6F767E]">
                    <button 
                      type="button" 
                      onClick={() => document.getElementById('feed-post-file-input').click()}
                      className="flex items-center gap-2 text-xs font-semibold hover:text-[#1A1D1F] transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#9A9FA5]" />
                      <span>Image</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => document.getElementById('feed-post-file-input').click()}
                      className="flex items-center gap-2 text-xs font-semibold hover:text-[#1A1D1F] transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-[#9A9FA5]" />
                      <span>Video</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => document.getElementById('feed-post-file-input').click()}
                      className="flex items-center gap-2 text-xs font-semibold hover:text-[#1A1D1F] transition-colors cursor-pointer"
                    >
                      <Music className="w-4 h-4 text-[#9A9FA5]" />
                      <span>Music</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!postText.trim() && !postImage}
                    className="bg-brand-primary text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    Post Update
                  </button>
                </div>
              </form>
            ) : (
              <form 
                onSubmit={handlePublishIdea}
                className="bg-white border border-[#EFEFEF] rounded-[24px] p-6 flex flex-col gap-5 shadow-sm"
              >
                <div className="flex flex-col gap-1 border-b border-[#F4F4F4] pb-4">
                  <h2 className="text-sm font-extrabold text-[#1A1D1F]">Post a Startup Idea</h2>
                  <p className="text-[11px] text-[#9A9FA5] font-semibold">Pitch your startup concept to find co-founders and collaborators at IIT Patna.</p>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#6F767E] uppercase">Idea Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Decentralized Freelance Network"
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all"
                  />
                </div>

                {/* Problem & Solution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6F767E] uppercase">Problem Statement *</label>
                    <textarea
                      rows={4}
                      required
                      value={formProblem}
                      onChange={(e) => setFormProblem(e.target.value)}
                      placeholder="What pain point are you solving?"
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all resize-none leading-relaxed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6F767E] uppercase">Solution *</label>
                    <textarea
                      rows={4}
                      required
                      value={formSolution}
                      onChange={(e) => setFormSolution(e.target.value)}
                      placeholder="How does your concept address the problem?"
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Category & Stage & Team Size */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6F767E] uppercase">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs font-bold text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6F767E] uppercase">Stage</label>
                    <select
                      value={formStage}
                      onChange={(e) => setFormStage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs font-bold text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
                    >
                      {stages.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6F767E] uppercase">Target Team Size</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={formTeamSize}
                      onChange={(e) => setFormTeamSize(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-bold transition-all"
                    />
                  </div>
                </div>

                {/* Skills required */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#6F767E] uppercase">Skills Required *</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map(skill => {
                      const isSelected = formSkills.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleFormSkillToggle(skill)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                              : 'bg-[#F8F9FA] text-[#6F767E] border-[#EFEFEF] hover:border-brand-primary/40 hover:text-brand-primary'
                          }`}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold px-6 py-3 rounded-full self-end transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Publishing...' : 'Publish Concept Pitch'}
                </button>
              </form>
            )}
          </div>
        )}



      {/* DETAILED OVERLAY SPEC MODAL */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-[#EFEFEF] w-full max-w-[800px] rounded-[32px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl relative"
            >
              
              {/* Close Trigger */}
              <button
                onClick={() => setSelectedIdea(null)}
                className="absolute right-6 top-6 p-2 bg-brand-bg hover:bg-slate-100 border border-[#EFEFEF] rounded-full text-slate-500 hover:text-slate-950 transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Body (Scrollable) */}
              <div className="overflow-y-auto p-8 flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex flex-col gap-2 border-b border-[#F4F4F4] pb-5">
                  <div className="flex items-center justify-between pr-10">
                    <div className="flex items-center gap-2 text-brand-primary">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold tracking-wider uppercase">{selectedIdea.category} Concept</span>
                    </div>
                    
                    {/* View Switcher toggle */}
                    <div className="flex items-center bg-brand-bg border border-[#EFEFEF] p-1 rounded-xl shrink-0">
                      <button
                        onClick={() => setIsModalApprovedView(false)}
                        className={`px-3 py-1 text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          !isModalApprovedView ? 'bg-white text-brand-primary shadow-sm' : 'text-[#6F767E]'
                        }`}
                      >
                        Public specs
                      </button>
                      <button
                        onClick={() => setIsModalApprovedView(true)}
                        className={`px-3 py-1 text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          isModalApprovedView ? 'bg-white text-brand-primary shadow-sm' : 'text-[#6F767E]'
                        }`}
                      >
                        Roadmap (Teammate)
                      </button>
                    </div>
                  </div>

                  <h2 className="text-base font-extrabold text-[#1A1D1F] mt-2 pr-10">
                    {selectedIdea.title}
                  </h2>
                  <p className="text-xs text-[#6F767E] font-medium leading-relaxed mt-1">
                    {selectedIdea.description}
                  </p>
                </div>

                {/* Grid Overview Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-brand-bg rounded-xl p-3 flex flex-col border border-[#F4F4F4]">
                    <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Stage</span>
                    <span className="text-xs font-extrabold text-[#1A1D1F] mt-0.5">{selectedIdea.stage}</span>
                  </div>
                  <div className="bg-brand-bg rounded-xl p-3 flex flex-col border border-[#F4F4F4]">
                    <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Match Score</span>
                    <span className="text-xs font-extrabold text-emerald-600 mt-0.5">{selectedIdea.matchScore}</span>
                  </div>
                  <div className="bg-brand-bg rounded-xl p-3 flex flex-col border border-[#F4F4F4]">
                    <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Target Team</span>
                    <span className="text-xs font-extrabold text-[#1A1D1F] mt-0.5">{selectedIdea.teamSize}</span>
                  </div>
                </div>

                {/* RENDER VIEW A: PUBLIC SPECS */}
                {!isModalApprovedView && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left details */}
                    <div className="md:col-span-2 flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-[#1A1D1F] uppercase">Teammate Requirements</h4>
                        <p className="text-xs text-[#6F767E] font-semibold leading-relaxed">
                          {selectedIdea.teamRequirement}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-[#1A1D1F] uppercase">Core Tech Stack</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedIdea.skills.map((sk, sIdx) => (
                            <span key={sIdx} className="text-xs bg-[#F4F4F4] text-[#1A1D1F] font-bold px-3 py-1 rounded-full border border-slate-100">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Locked alert */}
                      <div className="bg-brand-light/40 border border-brand-primary/10 rounded-2xl p-4 flex gap-3 text-brand-primary text-xs font-semibold mt-1">
                        <Lock className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                        <p className="leading-relaxed text-[11px] text-[#6F767E]">
                          Submit a join request pitch. Once approved by the founder, the project specifications, roadmap tasks, and files will unlock automatically.
                        </p>
                      </div>
                    </div>

                    {/* Right apply box */}
                    <div className="md:col-span-1 flex flex-col gap-5">
                      <div className="bg-brand-bg rounded-[20px] p-4 border border-[#F4F4F4] flex flex-col items-center gap-3 text-center">
                        <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Idea Founder</span>
                        <img src={selectedIdea.avatar} alt={selectedIdea.founder} className="w-12 h-12 rounded-full object-cover border border-[#EFEFEF]" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#1A1D1F]">{selectedIdea.founder}</span>
                          <span className="text-[8px] text-[#9A9FA5] font-semibold leading-tight">{selectedIdea.college}</span>
                        </div>
                        <span className="bg-[#FAF6F0] text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Reputation: {selectedIdea.reputation}%
                        </span>
                      </div>

                      <div className="bg-white border border-[#EFEFEF] rounded-[20px] p-4">
                        <h4 className="text-[10px] font-bold text-[#1A1D1F] mb-2 uppercase">Apply to Team</h4>
                        {modalApplied ? (
                          <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold p-3 rounded-xl text-center">
                            Request Sent Successfully!
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <textarea
                              rows="2"
                              value={modalApplyNotes}
                              onChange={(e) => setModalApplyNotes(e.target.value)}
                              placeholder="Brief cover notes pitch..."
                              className="w-full bg-brand-bg px-2.5 py-2 border border-[#EFEFEF] rounded-xl text-[10px] text-[#1A1D1F] focus:outline-none focus:bg-white resize-none font-semibold"
                            />
                            <button
                              onClick={() => handleModalJoinRequest(selectedIdea.id)}
                              className="w-full bg-brand-primary text-white text-xs font-bold py-2 rounded-xl hover:bg-brand-hover cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Apply Request
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* RENDER VIEW B: TEAMMATE ROADMAP */}
                {isModalApprovedView && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-[18px] text-[11px] font-bold flex items-center gap-2">
                      <UserCheck className="w-4.5 h-4.5" />
                      <span>Workspace spec details unlocked for co-founding builders!</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: Problem & Solutions */}
                      <div className="md:col-span-2 flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">Problem Statement</h4>
                          <p className="text-xs text-[#6F767E] font-semibold leading-relaxed">
                            {selectedIdea.privateDetails.problemStatement}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 border-t border-[#F4F4F4] pt-4">
                          <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">Solution Mechanics</h4>
                          <p className="text-xs text-[#6F767E] font-semibold leading-relaxed">
                            {selectedIdea.privateDetails.solution}
                          </p>
                        </div>

                        {/* Milestone List */}
                        <div className="flex flex-col gap-3 border-t border-[#F4F4F4] pt-4">
                          <h4 className="text-[10px] font-bold text-[#1A1D1F] uppercase tracking-wide">Milestones Checklist</h4>
                          <div className="flex flex-col gap-2">
                            {selectedIdea.privateDetails.roadmap.map((st, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-3 bg-brand-bg px-3.5 py-2.5 rounded-xl border border-transparent">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                  st.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-primary/10 text-brand-primary'
                                }`}>
                                  {st.phase}
                                </span>
                                <span className="text-xs font-bold text-[#1A1D1F] flex-1">{st.task}</span>
                                <span className="text-[9px] text-[#9A9FA5] font-semibold">{st.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Files & Documents resources */}
                      <div className="md:col-span-1 flex flex-col gap-4">
                        <h4 className="text-[10px] font-bold text-[#1A1D1F] uppercase border-b border-[#F4F4F4] pb-2">Shared Documents</h4>
                        <div className="flex flex-col gap-2.5">
                          {selectedIdea.privateDetails.resources.map((res, rIdx) => (
                            <div key={rIdx} className="p-3 bg-brand-bg rounded-xl border border-transparent flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-[#1A1D1F] truncate">{res.name}</span>
                                  <span className="text-[9px] text-[#9A9FA5] font-semibold">{res.type}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#9A9FA5]" />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
