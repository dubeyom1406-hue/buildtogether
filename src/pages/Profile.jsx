import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Github, Linkedin, Briefcase, Award, GraduationCap, Code, FolderGit, 
  MapPin, Calendar, Mail, Link as LinkIcon, MessageSquare, Heart, Share2, 
  Plus, Edit, ChevronRight, CheckCircle2, Star, Sparkles, BookOpen, Clock,
  FileText, Globe, Bookmark, Eye, ThumbsUp, Users2, Trash2
} from 'lucide-react'

// Profile default work experience fallbacks
const defaultExperience = []

// Profile default certifications fallbacks
const defaultCertifications = []

export default function Profile() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const viewUid = params.get('uid')

  const { 
    currentUser, 
    updateProfile, 
    feedPosts, 
    ideas,
    likePost, 
    savePost, 
    addComment, 
    rateUser,
    changePassword, 
    deactivateAccount, 
    deleteAccount 
  } = useApp()

  const [viewUser, setViewUser] = useState(null)

  useEffect(() => {
    if (viewUid && viewUid !== currentUser?.uid) {
      const fetchUserData = async () => {
        try {
          const u = await api.getUser(viewUid)
          setViewUser(u)
        } catch (err) {
          console.warn('Failed to fetch user profile:', err)
        }
      }
      fetchUserData()
    } else {
      setViewUser(null)
    }
  }, [viewUid, currentUser])
  const [activeTab, setActiveTab] = useState('experience') // 'experience', 'projects', 'posts', 'saved'
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false)
  const [modalTab, setModalTab] = useState('basic') // 'basic', 'experience', 'certs', 'security'

  // Edit fields state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [expandedComments, setExpandedComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert('All password fields are required.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match.')
      return
    }
    const res = changePassword(currentPassword, newPassword)
    if (res.success) {
      alert('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } else {
      alert(res.message)
    }
  }
  const [editName, setEditName] = useState('')
  const [editField, setEditField] = useState('Tech/Developer')
  const [editRole, setEditRole] = useState('Student')
  const [editCollegeOrCompany, setEditCollegeOrCompany] = useState('')
  const [editGithub, setEditGithub] = useState('')
  const [editLinkedin, setEditLinkedin] = useState('')
  const [editPortfolio, setEditPortfolio] = useState('')
  const [editExperience, setEditExperience] = useState([])
  const [editCertifications, setEditCertifications] = useState([])
  const [editSkills, setEditSkills] = useState([])
  const [editBio, setEditBio] = useState('')

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '')
      setEditField(currentUser.field || 'Tech/Developer')
      setEditRole(currentUser.role || 'Student')
      setEditCollegeOrCompany(currentUser.college || currentUser.company || 'IIT Patna')
      setEditGithub(currentUser.github || '')
      setEditLinkedin(currentUser.linkedin || '')
      setEditPortfolio(currentUser.portfolio || '')
      setEditExperience(currentUser.experience || defaultExperience)
      setEditCertifications(currentUser.certifications || defaultCertifications)
      setEditSkills(currentUser.skills || [])
      setEditBio(currentUser.bio || '')
    }
  }, [currentUser, isEditOpen])

  const handleExperienceChange = (index, key, value) => {
    const updated = [...editExperience]
    updated[index] = { ...updated[index], [key]: value }
    setEditExperience(updated)
  }

  const handleAddExperience = () => {
    setEditExperience([
      ...editExperience,
      { company: '', role: '', period: '', location: '', description: '', type: 'Full-time' }
    ])
  }

  const handleRemoveExperience = (index) => {
    setEditExperience(editExperience.filter((_, i) => i !== index))
  }

  const handleCertChange = (index, key, value) => {
    const updated = [...editCertifications]
    updated[index] = { ...updated[index], [key]: value }
    setEditCertifications(updated)
  }

  const handleAddCert = () => {
    setEditCertifications([
      ...editCertifications,
      { name: '', issuer: '', date: '' }
    ])
  }

  const handleRemoveCert = (index) => {
    setEditCertifications(editCertifications.filter((_, i) => i !== index))
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const updatedData = {
      name: editName,
      field: editField,
      role: editRole,
      college: editRole === 'Student' ? editCollegeOrCompany : '',
      company: editRole !== 'Student' ? editCollegeOrCompany : '',
      bio: editBio,
      github: editGithub,
      linkedin: editLinkedin,
      portfolio: editPortfolio,
      experience: editExperience,
      certifications: editCertifications,
      skills: editSkills
    }
    updateProfile(updatedData)
    setIsEditOpen(false)
  }

  const renderPostCard = (post) => {
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
        className="bg-white rounded-[24px] border border-[#EFEFEF] p-5 flex flex-col gap-4 shadow-sm hover:border-[#D1D5DB] transition-all text-left"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={post.avatar} alt={post.author} className="w-9 h-9 rounded-full object-cover border border-[#EFEFEF]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1A1D1F]">{post.author}</span>
              <span className="text-[10px] text-[#9A9FA5] font-semibold">{post.time}</span>
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold text-[#1A1D1F] leading-relaxed">{post.content}</p>
        
        {post.image && (
          <div className="w-full rounded-2xl overflow-hidden border border-[#F4F4F4] max-h-[260px]">
            {post.image.startsWith('data:video/') ? (
              <video src={post.image} controls className="w-full object-cover max-h-[220px]" />
            ) : post.image.startsWith('data:audio/') ? (
              <audio src={post.image} controls className="w-full px-3 py-1.5" />
            ) : post.image.startsWith('data:image/') || post.image.startsWith('http') ? (
              <img src={post.image} alt="Post media link" className="w-full object-cover" />
            ) : (
              <a href={post.image} download="attachment" className="flex items-center gap-2 p-3 bg-brand-bg rounded-xl text-xs font-bold text-slate-800 border border-[#EFEFEF] hover:bg-slate-200 transition-colors">
                <FileText className="w-4 h-4 text-brand-primary" />
                <span>Download Attachment File</span>
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-5 border-t border-[#F4F4F4] pt-3 text-[#6F767E] text-[11px] font-bold">
          <button 
            onClick={() => likePost(post.id)}
            className={`flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer ${isLiked ? 'text-red-500 font-bold' : ''}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likes || 0} Likes</span>
          </button>
          <button 
            onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !isCommentsExpanded })}
            className={`flex items-center gap-1.5 hover:text-brand-primary transition-colors cursor-pointer ${isCommentsExpanded ? 'text-brand-primary font-bold' : ''}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.comments?.length || 0} Comments</span>
          </button>
          <button 
            onClick={() => savePost(post.id)}
            className={`flex items-center gap-1.5 hover:text-brand-primary transition-colors cursor-pointer ${isSaved ? 'text-brand-primary font-bold' : ''}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-primary text-brand-primary' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button 
            onClick={() => handleShare(post.id)}
            className="flex items-center gap-1.5 hover:text-[#1A1D1F] transition-colors cursor-pointer ml-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Comments Panel */}
        {isCommentsExpanded && (
          <div className="border-t border-[#F4F4F4] pt-3 mt-1 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Comments</span>
            
            {post.comments && post.comments.length > 0 ? (
              <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 bg-brand-bg p-2.5 rounded-xl border border-[#F4F4F4]">
                    <img src={comment.avatar} alt={comment.author} className="w-6.5 h-6.5 rounded-full object-cover shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#1A1D1F]">{comment.author}</span>
                        <span className="text-[8px] text-[#9A9FA5] font-semibold">{comment.time}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#1A1D1F] leading-snug">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-semibold italic text-center py-1">No comments yet.</p>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const text = commentInputs[post.id] || ''
                if (!text.trim()) return
                addComment(post.id, text)
                setCommentInputs({ ...commentInputs, [post.id]: '' })
              }}
              className="flex gap-2 items-center mt-1"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                className="flex-1 bg-brand-bg px-3.5 py-2 text-xs font-semibold rounded-lg text-[#1A1D1F] placeholder-[#9A9FA5] border border-[#EFEFEF] focus:outline-none focus:bg-white focus:border-brand-primary"
              />
              <button 
                type="submit"
                disabled={!(commentInputs[post.id] || '').trim()}
                className="bg-brand-primary text-white text-[10px] font-bold px-3.5 py-2 rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    )
  }

  const targetUser = viewUser || currentUser
  const isMyProfile = !viewUid || viewUid === currentUser?.uid

  const avgRating = targetUser?.rating_count 
    ? (targetUser?.rating_sum / targetUser?.rating_count).toFixed(1) 
    : '0.0'
  const ratingCount = targetUser?.rating_count || 0
  const myExistingRating = targetUser?.rated_by?.find(r => r.uid === currentUser?.uid)?.rating || 0

  const handleRate = async (val) => {
    if (isRatingSubmitting) return
    setIsRatingSubmitting(true)
    const res = await rateUser(targetUser.uid, val)
    setIsRatingSubmitting(false)
    if (res.success) {
      setViewUser(res.user)
    } else {
      alert(res.message || 'Failed to submit rating.')
    }
  }

  // Reactive user profile values derived from Context
  const userProfile = {
    name: targetUser?.name || 'User',
    role: targetUser?.role || targetUser?.field || 'Builder',
    college: targetUser?.college || 'IIT Patna',
    avatar: targetUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bannerGradient: 'from-[#E3A376] to-[#CE5A3B]',
    bio: targetUser?.bio || 'No bio added yet.',
    location: 'IIT Patna',
    email: targetUser?.email || '',
    reputationScore: targetUser?.reputation ?? 0,
    rank: 'Builder',
    skills: targetUser?.skills || [],
    socials: {
      github: targetUser?.github || '',
      linkedin: targetUser?.linkedin || '',
      portfolio: targetUser?.portfolio || ''
    },
    stats: {
      projectsCount: (ideas || []).filter(idea => idea.founderUid === targetUser?.uid).length,
      postsCount: feedPosts.filter(post => post.authorUid === targetUser?.uid).length,
      viewsCount: 0,
      likesCount: feedPosts.filter(post => post.authorUid === targetUser?.uid).reduce((acc, p) => acc + (p.likes || 0), 0)
    },
    experience: targetUser?.experience || defaultExperience,
    certifications: targetUser?.certifications || defaultCertifications,
    projects: (ideas || []).filter(idea => idea.founderUid === targetUser?.uid).map(idea => ({
      name: idea.title,
      role: 'Creator / Founder',
      desc: idea.description,
      status: idea.stage,
      tech: idea.skills || [],
      stars: 0,
      forks: 0
    })),
    posts: feedPosts.filter(post => post.authorUid === targetUser?.uid)
  }

  if (viewUid && viewUid !== currentUser?.uid && !viewUser) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-white border border-[#EFEFEF] rounded-[32px] text-xs font-bold text-[#6F767E]">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto flex flex-col gap-6 select-none pb-12">
      
      {/* 1. Profile Header Hero Card */}
      <div className="bg-white border border-[#EFEFEF] rounded-[32px] overflow-hidden shadow-sm flex flex-col">
        {/* Banner with modern pattern/gradient */}
        <div className={`h-40 bg-gradient-to-r ${userProfile.bannerGradient} relative flex items-end p-6`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-white/5 skew-x-12 translate-x-20 pointer-events-none" />
          <div className="absolute left-6 bottom-0 translate-y-1/2 z-10 flex gap-4 items-end">
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-lg"
              />
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow" />
            </div>
          </div>
        </div>

        {/* User Quick info details bar */}
        <div className="pt-16 pb-6 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#1A1D1F]">{userProfile.name}</h2>
              <span className="bg-brand-light text-brand-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-primary/10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                {userProfile.rank}
              </span>
            </div>
            <p className="text-xs text-brand-primary font-bold">{userProfile.role}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6F767E] font-medium mt-1">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-brand-primary" />
                {userProfile.college}
              </span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#9A9FA5]" />
                {userProfile.location}
              </span>
            </div>
          </div>

          {/* Call to Actions & Social Links */}
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <div className="flex gap-2">
              {isMyProfile ? (
                <>
                  <button 
                    onClick={() => alert('Feature coming soon!')}
                    className="flex-1 md:flex-none bg-brand-primary text-white text-xs font-bold px-5 py-3 rounded-2xl hover:bg-brand-hover transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Collaborate
                  </button>
                  <button 
                    onClick={() => { setModalTab('basic'); setIsEditOpen(true); }}
                    className="flex-1 md:flex-none border border-[#EFEFEF] hover:border-[#D1D5DB] text-[#1A1D1F] bg-white text-xs font-bold px-4 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Edit className="w-4 h-4 text-[#6F767E]" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => navigate(`/message?with_uid=${targetUser?.uid}`)}
                  className="flex-1 md:w-36 bg-brand-primary text-white text-xs font-bold px-5 py-3 rounded-2xl hover:bg-brand-hover transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Connect
                </button>
              )}
            </div>

            {/* Socials */}
            <div className="flex gap-2.5 justify-center md:justify-end">
              <a href={userProfile.socials.github} target="_blank" rel="noreferrer" className="p-2.5 bg-brand-bg hover:bg-slate-200 rounded-xl text-slate-700 transition-colors border border-[#EFEFEF]">
                <Github className="w-4 h-4" />
              </a>
              <a href={userProfile.socials.linkedin} target="_blank" rel="noreferrer" className="p-2.5 bg-brand-bg hover:bg-slate-200 rounded-xl text-slate-700 transition-colors border border-[#EFEFEF]">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={userProfile.socials.portfolio} target="_blank" rel="noreferrer" className="p-2.5 bg-brand-bg hover:bg-slate-200 rounded-xl text-slate-700 transition-colors border border-[#EFEFEF]">
                <Globe className="w-4 h-4" />
              </a>
              <a href={`mailto:${userProfile.email}`} className="p-2.5 bg-brand-bg hover:bg-slate-200 rounded-xl text-slate-700 transition-colors border border-[#EFEFEF]">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row (Reputation, Joined Projects, Active Requests) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex items-center gap-4 hover:shadow-sm hover:border-[#D1D5DB] transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#9A9FA5] font-bold uppercase tracking-wider">Reputation</span>
            <span className="text-sm font-extrabold text-[#1A1D1F] mt-0.5">{userProfile.reputationScore}%</span>
            <span className="text-[9px] text-[#6F767E] font-semibold">Milestone success</span>
          </div>
        </div>

        <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex items-center gap-4 hover:shadow-sm hover:border-[#D1D5DB] transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
            <FolderGit className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#9A9FA5] font-bold uppercase tracking-wider">Joined Projects</span>
            <span className="text-sm font-extrabold text-[#1A1D1F] mt-0.5">3 Projects</span>
            <span className="text-[9px] text-[#6F767E] font-semibold">Active workspace</span>
          </div>
        </div>

        <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex items-center gap-4 hover:shadow-sm hover:border-[#D1D5DB] transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-teal-50 text-teal-600">
            <Users2 className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#9A9FA5] font-bold uppercase tracking-wider">Active Requests</span>
            <span className="text-sm font-extrabold text-[#1A1D1F] mt-0.5">2 Pending</span>
            <span className="text-[9px] text-[#6F767E] font-semibold">Sent applications</span>
          </div>
        </div>
      </div>

      {/* 2. Main Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Meta details, stats, skills) */}
        <div className="md:col-span-1 flex flex-col gap-6">
          
          <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-1.5">
              <Star className="w-4.5 h-4.5 text-brand-primary" />
              Overview Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="bg-brand-bg border border-[#F4F4F4] rounded-2xl p-3.5 flex flex-col">
                <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Projects</span>
                <span className="text-base font-extrabold text-[#1A1D1F] mt-1">{userProfile.stats.projectsCount} Total</span>
                <span className="text-[8px] text-[#6F767E] font-medium mt-0.5">{userProfile.projects.length} Showcased</span>
              </div>
              <div className="bg-brand-bg border border-[#F4F4F4] rounded-2xl p-3.5 flex flex-col">
                <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Posts</span>
                <span className="text-base font-extrabold text-[#1A1D1F] mt-1">{userProfile.stats.postsCount} Published</span>
                <span className="text-[8px] text-[#6F767E] font-medium mt-0.5">{userProfile.posts.length} Active Feed</span>
              </div>
              <div className="bg-brand-bg border border-[#F4F4F4] rounded-2xl p-3.5 flex flex-col">
                <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Likes received</span>
                <span className="text-base font-extrabold text-[#1A1D1F] mt-1">{userProfile.stats.likesCount}</span>
                <span className="text-[8px] text-[#6F767E] font-medium mt-0.5">High Engagement</span>
              </div>
              <div className="bg-brand-bg border border-[#F4F4F4] rounded-2xl p-3.5 flex flex-col">
                <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Profile Views</span>
                <span className="text-base font-extrabold text-[#1A1D1F] mt-1">{userProfile.stats.viewsCount}</span>
                <span className="text-[8px] text-[#6F767E] font-medium mt-0.5">Last 30 days</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex flex-col items-center justify-center text-center gap-4">
            <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-1.5 self-start">
              <Award className="w-4.5 h-4.5 text-brand-primary" />
              Reputation & Credibility
            </h3>

            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-primary"
                  strokeWidth="3.5"
                  strokeDasharray={`${userProfile.reputationScore}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-[#1A1D1F]">{userProfile.reputationScore}%</span>
                <span className="text-[8px] text-[#9A9FA5] font-bold uppercase">Success Score</span>
              </div>
            </div>

            <p className="text-[10px] text-[#6F767E] font-semibold leading-relaxed">
              Calculated based on ratings from other builders, peer feedback, and community interactions.
            </p>

            {/* Star Rating Section */}
            <div className="flex flex-col gap-2 w-full border-t border-[#F4F4F4] pt-4 mt-1 items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-[#1A1D1F]">{avgRating}</span>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || myExistingRating || Math.round(Number(avgRating)))
                    return (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    )
                  })}
                </div>
                <span className="text-[10px] text-[#9A9FA5] font-bold">({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</span>
              </div>

              {!isMyProfile && (
                <div className="flex flex-col gap-1 items-center mt-1">
                  <span className="text-[9px] text-[#9A9FA5] font-bold uppercase tracking-wider">
                    {myExistingRating ? 'Update your rating' : 'Rate this builder'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHighlighted = star <= (hoverRating || myExistingRating)
                      return (
                        <button
                          key={star}
                          disabled={isRatingSubmitting}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRate(star)}
                          className="p-0.5 hover:scale-125 transition-transform disabled:opacity-50 cursor-pointer"
                        >
                          <Star 
                            className={`w-4.5 h-4.5 transition-colors ${
                              isHighlighted 
                                ? 'fill-amber-400 text-amber-400 shadow-sm' 
                                : 'text-slate-300 hover:text-amber-300'
                            }`} 
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center justify-between border-b border-[#F4F4F4] pb-2 w-full">
              <span className="flex items-center gap-1.5">
                <Code className="w-4.5 h-4.5 text-brand-primary" />
                Skills & Tech Stack
              </span>
              {isMyProfile && (
                <button
                  onClick={() => { setModalTab('skills'); setIsEditOpen(true); }}
                  className="text-[#6F767E] hover:text-brand-primary transition-all p-1 hover:bg-brand-bg rounded-lg cursor-pointer"
                  title="Edit Skills"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              )}
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {userProfile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-brand-bg hover:bg-brand-light text-[#1A1D1F] hover:text-brand-primary font-bold px-3 py-1.5 rounded-xl border border-slate-100/80 transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Tabs for Work Experience, Projects, and Posts) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          <div className="flex bg-white border border-[#EFEFEF] p-1.5 rounded-2xl shadow-sm w-full">
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'experience'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-[#6F767E] hover:text-[#1A1D1F]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Work & Experience</span>
            </button>
            
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-[#6F767E] hover:text-[#1A1D1F]'
              }`}
            >
              <FolderGit className="w-4 h-4" />
              <span>Projects ({userProfile.projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'posts'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-[#6F767E] hover:text-[#1A1D1F]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>My Posts ({userProfile.posts.length})</span>
            </button>

            {isMyProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'saved'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-[#6F767E] hover:text-[#1A1D1F]'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved ({feedPosts.filter(p => p.savedBy?.includes(currentUser?.email)).length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: WORK & EXPERIENCE DETAILS */}
          {activeTab === 'experience' && (
            <div className="flex flex-col gap-6">
              
              {/* Biography Section */}
              <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-6 flex flex-col gap-3.5">
                <h3 className="text-xs font-bold text-[#1A1D1F] uppercase tracking-wider text-slate-400">About Me</h3>
                <p className="text-xs font-semibold text-[#1A1D1F] leading-relaxed">
                  {userProfile.bio}
                </p>
                <div className="grid grid-cols-2 gap-4 border-t border-[#F4F4F4] pt-4 mt-1 text-[11px] text-[#6F767E]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-brand-primary shrink-0" />
                    <a href={userProfile.socials.portfolio} target="_blank" rel="noreferrer" className="hover:underline font-bold text-slate-800">{userProfile.socials.portfolio.replace('https://', '')}</a>
                  </div>
                </div>
              </div>

              {/* Work History timeline */}
              <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-[#F4F4F4] pb-3">
                  <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-1.5">
                    <Briefcase className="w-4.5 h-4.5 text-brand-primary" />
                    Employment & Roles History
                  </h3>
                  <span className="text-[10px] text-brand-primary font-bold flex items-center gap-1 bg-brand-light px-2.5 py-1 rounded-lg">
                    {userProfile.experience.length} Jobs
                  </span>
                </div>

                {userProfile.experience.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                    No work experience details added to this profile yet.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-3.5 pl-6 flex flex-col gap-6">
                    {userProfile.experience.map((exp, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-white border-[3px] border-brand-primary rounded-full group-hover:scale-125 transition-transform" />
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0.5">
                              <h4 className="text-xs font-extrabold text-[#1A1D1F] group-hover:text-brand-primary transition-colors">
                                {exp.role || 'Builder'}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-bold">
                                {exp.company || 'Campus Startup'} • <span className="text-slate-400 font-semibold">{exp.type || 'Full-time'}</span>
                              </span>
                            </div>
                            <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md self-start">
                              {exp.period || 'Duration'}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-[#6F767E] font-medium leading-relaxed mt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications and credentials list */}
              <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-6 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-1.5 border-b border-[#F4F4F4] pb-3">
                  <Award className="w-4.5 h-4.5 text-brand-primary" />
                  Certifications & Badges
                </h3>
                {userProfile.certifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                    No certifications or credentials listed yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {userProfile.certifications.map((cert, idx) => (
                      <div key={idx} className="p-3 bg-brand-bg rounded-xl border border-slate-100/80 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-[#1A1D1F]">{cert.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{cert.issuer} • {cert.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS PORTFOLIO */}
          {activeTab === 'projects' && (
            <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-6 flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-[#F4F4F4] pb-3">
                <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-1.5">
                  <FolderGit className="w-4.5 h-4.5 text-brand-primary" />
                  Startup & Project Portfolio
                </h3>
                {isMyProfile && (
                  <button 
                    onClick={() => alert('Project creation is managed from the Dashboard.')}
                    className="text-[10px] bg-brand-primary text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-brand-hover transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Project
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {userProfile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-brand-bg rounded-2xl border border-[#F4F4F4] flex flex-col gap-3 group hover:border-[#D1D5DB] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-extrabold text-[#1A1D1F] group-hover:text-brand-primary transition-colors">
                          {proj.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">{proj.role}</span>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#6F767E] font-medium leading-relaxed">
                      {proj.desc}
                    </p>

                    <div className="flex justify-between items-center border-t border-slate-200/50 pt-3 mt-1.5">
                      <div className="flex gap-1.5">
                        {proj.tech.map((t, tIdx) => (
                          <span key={tIdx} className="text-[8px] bg-white border border-[#EFEFEF] text-slate-600 font-bold px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-[#6F767E] font-bold">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          {proj.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" />
                          {proj.forks}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: USER POSTS LIST */}
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-4">
              {isMyProfile && (
                <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-[#1A1D1F] flex items-center gap-1.5 pb-1">
                    <MessageSquare className="w-4 h-4 text-brand-primary" />
                    Quick Social Update
                  </h3>
                  <div className="flex gap-3.5">
                    <img src={userProfile.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <input
                      type="text"
                      placeholder="What's on your mind? Share updates on projects..."
                      onClick={() => alert('Posting is done from the Feed tab on the Dashboard.')}
                      className="flex-1 bg-brand-bg px-4 py-2 text-xs font-semibold rounded-xl text-[#1A1D1F] placeholder-[#9A9FA5] border border-[#EFEFEF] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {userProfile.posts.length > 0 ? (
                  userProfile.posts.map((post) => renderPostCard(post))
                ) : (
                  <p className="text-xs text-[#9A9FA5] font-semibold italic text-center py-8 bg-white border border-[#EFEFEF] rounded-[24px]">No posts published yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SAVED POSTS LIST */}
          {activeTab === 'saved' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {feedPosts.filter(post => post.savedBy?.includes(currentUser?.email)).length > 0 ? (
                  feedPosts.filter(post => post.savedBy?.includes(currentUser?.email)).map((post) => renderPostCard(post))
                ) : (
                  <div className="text-center py-12 bg-white border border-[#EFEFEF] rounded-[24px] flex flex-col items-center gap-2 shadow-sm">
                    <Bookmark className="w-8 h-8 text-slate-300" />
                    <p className="text-xs text-[#9A9FA5] font-semibold italic">You haven't saved any posts yet. Go to Dashboard and click Save on a post to see it here!</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-[#EFEFEF] w-full max-w-[620px] max-h-[90vh] overflow-y-auto p-8 shadow-2xl flex flex-col gap-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-[#F4F4F4]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-lg font-extrabold text-[#1A1D1F]">Edit Profile Settings</h2>
                </div>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Modal Tab Switcher */}
              <div className="flex border-b border-[#F4F4F4] pb-1 gap-4 text-xs font-bold text-slate-400">
                <button
                  type="button"
                  onClick={() => setModalTab('basic')}
                  className={`pb-2.5 px-1 relative transition-colors cursor-pointer ${
                    modalTab === 'basic' ? 'text-brand-primary' : 'hover:text-[#1A1D1F]'
                  }`}
                >
                  <span>Basic Details</span>
                  {modalTab === 'basic' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('experience')}
                  className={`pb-2.5 px-1 relative transition-colors cursor-pointer ${
                    modalTab === 'experience' ? 'text-brand-primary' : 'hover:text-[#1A1D1F]'
                  }`}
                >
                  <span>Work Experience ({editExperience.length})</span>
                  {modalTab === 'experience' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('certs')}
                  className={`pb-2.5 px-1 relative transition-colors cursor-pointer ${
                    modalTab === 'certs' ? 'text-brand-primary' : 'hover:text-[#1A1D1F]'
                  }`}
                >
                  <span>Certifications ({editCertifications.length})</span>
                  {modalTab === 'certs' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('skills')}
                  className={`pb-2.5 px-1 relative transition-colors cursor-pointer ${
                    modalTab === 'skills' ? 'text-brand-primary' : 'hover:text-[#1A1D1F]'
                  }`}
                >
                  <span>Skills & Tech ({editSkills.length})</span>
                  {modalTab === 'skills' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('security')}
                  className={`pb-2.5 px-1 relative transition-colors cursor-pointer ${
                    modalTab === 'security' ? 'text-brand-primary' : 'hover:text-[#1A1D1F]'
                  }`}
                >
                  <span>Account & Security</span>
                  {modalTab === 'security' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                
                {/* 1. BASIC DETAILS TAB */}
                {modalTab === 'basic' && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#6F767E] uppercase">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all"
                        />
                      </div>

                      {/* Field */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#6F767E] uppercase">Field / Domain *</label>
                        <select
                          value={editField}
                          onChange={(e) => setEditField(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-bold transition-all"
                        >
                          <option value="Tech/Developer">Tech & Development</option>
                          <option value="UI/UX Designer">UI/UX & Design</option>
                          <option value="Product Manager">Product & Management</option>
                          <option value="AI & Web3 Specialist">AI & Web3 Research</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Role/Status */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#6F767E] uppercase">Status *</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-bold transition-all"
                        >
                          <option value="Student">University Student</option>
                          <option value="Professional">Working Professional</option>
                          <option value="Freelancer">Freelancer / Independent</option>
                        </select>
                      </div>

                      {/* College or Company */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#6F767E] uppercase">
                          {editRole === 'Student' ? 'College / University *' : 'Company / Workplace *'}
                        </label>
                        {editRole === 'Student' ? (
                          <select
                            value={editCollegeOrCompany}
                            onChange={(e) => setEditCollegeOrCompany(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-bold transition-all"
                          >
                            <option value="IIT Patna">IIT Patna</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            required
                            value={editCollegeOrCompany}
                            onChange={(e) => setEditCollegeOrCompany(e.target.value)}
                            placeholder="e.g. Google, Stripe, self-employed"
                            className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all"
                          />
                        )}
                      </div>
                    </div>

                    {/* Bio Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#6F767E] uppercase">Bio / Description</label>
                      <textarea
                        rows={3}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Tell others about your interests, project goals, and what you are building..."
                        className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all resize-none"
                      />
                    </div>

                    {/* Socials section inside basic details tab */}
                    <div className="border-t border-[#F4F4F4] pt-4 mt-2 flex flex-col gap-3.5">
                      <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Social Links</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#6F767E] uppercase">GitHub Link</label>
                          <input
                            type="text"
                            value={editGithub}
                            onChange={(e) => setEditGithub(e.target.value)}
                            placeholder="github.com/profile"
                            className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#6F767E] uppercase">LinkedIn Link</label>
                          <input
                            type="text"
                            value={editLinkedin}
                            onChange={(e) => setEditLinkedin(e.target.value)}
                            placeholder="linkedin.com/in/profile"
                            className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#6F767E] uppercase">Portfolio URL</label>
                          <input
                            type="text"
                            value={editPortfolio}
                            onChange={(e) => setEditPortfolio(e.target.value)}
                            placeholder="my-portfolio.dev"
                            className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. WORK EXPERIENCE TAB */}
                {modalTab === 'experience' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-[#F4F4F4] pb-2">
                      <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Employment History</span>
                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="text-[10px] bg-brand-primary text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-brand-hover transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Experience
                      </button>
                    </div>

                    {editExperience.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-xs text-[#9A9FA5] font-semibold">
                        No experience items added yet. Click 'Add Experience' to list your roles.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                        {editExperience.map((exp, idx) => (
                          <div key={idx} className="border border-[#EFEFEF] rounded-2xl p-4 flex flex-col gap-3 relative bg-[#F8F9FA]/40">
                            <button
                              type="button"
                              onClick={() => handleRemoveExperience(idx)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-[9px] font-bold text-brand-primary uppercase">Experience Item #{idx + 1}</span>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Company *</label>
                                <input
                                  type="text"
                                  required
                                  value={exp.company}
                                  onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Role / Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={exp.role}
                                  onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Period *</label>
                                <input
                                  type="text"
                                  required
                                  value={exp.period}
                                  placeholder="e.g. Jan 2025 - Present"
                                  onChange={(e) => handleExperienceChange(idx, 'period', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Location</label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  placeholder="e.g. Remote"
                                  onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Type</label>
                                <select
                                  value={exp.type || 'Full-time'}
                                  onChange={(e) => handleExperienceChange(idx, 'type', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-[11px] font-bold focus:outline-none focus:border-brand-primary"
                                >
                                  <option value="Full-time">Full-time</option>
                                  <option value="Part-time">Part-time</option>
                                  <option value="Contract">Contract</option>
                                  <option value="Internship">Internship</option>
                                  <option value="Club Lead">Club Lead</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-[#6F767E] uppercase">Description / Deliverables</label>
                              <textarea
                                rows={2}
                                value={exp.description}
                                onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CERTIFICATIONS TAB */}
                {modalTab === 'certs' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-[#F4F4F4] pb-2">
                      <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Credentials & Badges</span>
                      <button
                        type="button"
                        onClick={handleAddCert}
                        className="text-[10px] bg-brand-primary text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-brand-hover transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Credential
                      </button>
                    </div>

                    {editCertifications.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-xs text-[#9A9FA5] font-semibold">
                        No certifications added yet. Click 'Add Credential' to list your certificates.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                        {editCertifications.map((cert, idx) => (
                          <div key={idx} className="border border-[#EFEFEF] rounded-2xl p-4 flex flex-col gap-3 relative bg-[#F8F9FA]/40">
                            <button
                              type="button"
                              onClick={() => handleRemoveCert(idx)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-[9px] font-bold text-brand-primary uppercase">Credential Item #{idx + 1}</span>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Credential Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={cert.name}
                                  onChange={(e) => handleCertChange(idx, 'name', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Issuer / Organization *</label>
                                <input
                                  type="text"
                                  required
                                  value={cert.issuer}
                                  onChange={(e) => handleCertChange(idx, 'issuer', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-[#6F767E] uppercase">Date Issued *</label>
                                <input
                                  type="text"
                                  required
                                  value={cert.date}
                                  placeholder="e.g. Oct 2024"
                                  onChange={(e) => handleCertChange(idx, 'date', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3.5. SKILLS & TECH TAB */}
                {modalTab === 'skills' && (
                  <div className="flex flex-col gap-4 text-left">
                    <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Skills & Tech Stack</span>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="new-skill-input"
                        placeholder="Add a skill (e.g. React, Python, Solidity)"
                        className="flex-1 px-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-bold transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val && !editSkills.includes(val)) {
                              setEditSkills([...editSkills, val]);
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-skill-input');
                          const val = input.value.trim();
                          if (val && !editSkills.includes(val)) {
                            setEditSkills([...editSkills, val]);
                            input.value = '';
                          }
                        }}
                        className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 border border-[#EFEFEF] p-4 rounded-2xl bg-[#F8F9FA] min-h-[100px]">
                      {editSkills.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic font-semibold">No skills added yet. Add skills above.</span>
                      ) : (
                        editSkills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="bg-white border border-[#EFEFEF] text-[#1A1D1F] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => setEditSkills(editSkills.filter(s => s !== skill))}
                              className="text-red-500 hover:text-red-700 font-bold ml-1.5 focus:outline-none"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 4. ACCOUNT & SECURITY TAB */}
                {modalTab === 'security' && (
                  <div className="flex flex-col gap-6 text-left">
                    {/* Password Change Section */}
                    <div className="flex flex-col gap-4 border-b border-[#F4F4F4] pb-6">
                      <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-wider">Change Password</span>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-[#6F767E] uppercase">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-[#6F767E] uppercase">New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary focus:bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-[#6F767E] uppercase">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#EFEFEF] rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePasswordChange}
                        className="bg-brand-primary text-white text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-brand-hover self-start transition-all cursor-pointer shadow-sm"
                      >
                        Update Password
                      </button>
                    </div>

                    {/* Deactivate & Delete Section */}
                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Danger Zone</span>
                      
                      <div className="flex justify-between items-center bg-rose-50/20 border border-rose-100 rounded-2xl p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800">Deactivate Account</span>
                          <span className="text-[10px] text-slate-500 font-semibold">Temporarily disable your profile session.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to deactivate your session and log out?')) {
                              deactivateAccount()
                              navigate('/login')
                            }
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Deactivate
                        </button>
                      </div>

                      <div className="flex justify-between items-center bg-red-50/20 border border-red-100 rounded-2xl p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-red-700">Delete Account</span>
                          <span className="text-[10px] text-red-500 font-semibold">Permanently delete your profile and registry. This action is irreversible.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('WARNING: Are you sure you want to PERMANENTLY delete your account? This cannot be undone.')) {
                              deleteAccount()
                              navigate('/login')
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Action Buttons */}
                {modalTab !== 'security' && (
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#F4F4F4]">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <span>Save Changes</span>
                      <Sparkles className="w-4 h-4 text-brand-light" />
                    </button>
                  </div>
                )}

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
