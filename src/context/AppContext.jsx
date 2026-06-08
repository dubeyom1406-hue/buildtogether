import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, googleProvider } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from 'firebase/auth'
import { signInWithPopup } from 'firebase/auth'
import { api } from '../api'

const AppContext = createContext()

export function AppProvider({ children }) {
  // Instant load from cache — no loading flash
  const cachedUser = (() => {
    try { return JSON.parse(localStorage.getItem('app_user')) } catch { return null }
  })()

  const [currentUser, setCurrentUser]     = useState(cachedUser)
  const [isLoadingUser, setIsLoadingUser] = useState(!cachedUser)

  // Data states
  const [ideas,         setIdeas]         = useState([])
  const [requests,      setRequests]      = useState([])
  const [notifications, setNotifications] = useState([])
  const [messages,      setMessages]      = useState([])
  const [feedPosts,     setFeedPosts]     = useState([])

  // Explore filters
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSkill,    setSelectedSkill]    = useState('All')
  const [selectedStage,    setSelectedStage]    = useState('All')

  // ── Auth state listener ────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to fetch/create user profile from our backend
          let userData
          try {
            userData = await api.getMe()
          } catch {
            // First time — create the profile
            userData = await api.createOrUpdateMe({
              name:   firebaseUser.displayName || '',
              avatar: firebaseUser.photoURL    || '',
              email:  firebaseUser.email       || '',
            })
          }
          localStorage.setItem('app_user', JSON.stringify(userData))
          setCurrentUser(userData)
        } catch (err) {
          // Backend unreachable — use Firebase data as fallback
          console.warn('Backend unreachable, using Firebase fallback:', err)
          const fallback = {
            uid:                  firebaseUser.uid,
            email:                firebaseUser.email,
            name:                 firebaseUser.displayName || '',
            avatar:               firebaseUser.photoURL   || '',
            onboarding_completed: false,
            skills: [], experience: [], certifications: [],
            reputation: 0,
          }
          localStorage.setItem('app_user', JSON.stringify(fallback))
          setCurrentUser(fallback)
        }
      } else {
        localStorage.removeItem('app_user')
        setCurrentUser(null)
      }
      setIsLoadingUser(false)
    })
    return () => unsub()
  }, [])

  // ── Data fetchers ──────────────────────────────────────────────────
  const fetchIdeas = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await api.getIdeas({
        category: selectedCategory,
        stage:    selectedStage,
        skill:    selectedSkill,
      })
      setIdeas(data)
    } catch (err) { console.warn('fetchIdeas failed:', err) }
  }, [currentUser, selectedCategory, selectedStage, selectedSkill])

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await api.getPosts()
      // Normalise field names to match what pages expect
      setFeedPosts(data.map(p => ({
        ...p,
        author: p.author || '',
        time:   p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
        comments: (p.comments || []).map(c => ({
          ...c,
          author: c.author || '',
          time:   c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
        })),
      })))
    } catch (err) { console.warn('fetchPosts failed:', err) }
  }, [currentUser])

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await api.getRequests()
      setRequests(data.map(r => ({
        ...r,
        name:           r.applicantName  || '',
        ideaTitle:      r.ideaTitle      || '',
        applicantEmail: r.applicantEmail || '',
      })))
    } catch (err) { console.warn('fetchRequests failed:', err) }
  }, [currentUser])

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await api.getNotifications()
      setNotifications(data.map(n => ({
        ...n,
        time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
      })))
    } catch (err) { console.warn('fetchNotifications failed:', err) }
  }, [currentUser])

  const fetchMessages = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await api.getMessages()
      setMessages(data)
    } catch (err) { console.warn('fetchMessages failed:', err) }
  }, [currentUser])

  // Load data when user is ready
  useEffect(() => { fetchIdeas() },         [fetchIdeas])
  useEffect(() => { fetchPosts() },         [fetchPosts])
  useEffect(() => { fetchRequests() },      [fetchRequests])
  useEffect(() => { fetchNotifications() }, [fetchNotifications])
  useEffect(() => { fetchMessages() },      [fetchMessages])

  // ── Auth methods ───────────────────────────────────────────────────
  const loginUser = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      // Fetch profile from backend to check onboarding
      try {
        const userData = await api.getMe()
        return { success: true, onboardingCompleted: userData.onboarding_completed }
      } catch {
        return { success: true, onboardingCompleted: false }
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const loginWithGoogle = async (email, name, avatar, uid) => {
    try {
      let userData
      try {
        userData = await api.getMe()
      } catch {
        // New user — create profile in backend
        userData = await api.createOrUpdateMe({ name, avatar })
      }
      return { success: true, onboardingCompleted: userData.onboarding_completed }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const registerUser = async (name, email, password, college) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Create profile in backend
      await api.createOrUpdateMe({ name, college })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const completeOnboarding = async (onboardingData) => {
    try {
      const updated = await api.updateMe({ ...onboardingData, onboarding_completed: true })
      localStorage.setItem('app_user', JSON.stringify(updated))
      setCurrentUser(updated)
    } catch (err) { console.error(err) }
  }

  const updateProfile = async (profileData) => {
    try {
      const updated = await api.updateMe(profileData)
      localStorage.setItem('app_user', JSON.stringify(updated))
      setCurrentUser(updated)
    } catch (err) { console.error(err) }
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword)
        return { success: true }
      }
      return { success: false, message: 'No user logged in.' }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const logoutUser = () => {
    signOut(auth).catch(console.error)
    localStorage.removeItem('app_user')
    setCurrentUser(null)
  }

  const deactivateAccount = () => logoutUser()

  const deleteAccount = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.delete()
        localStorage.removeItem('app_user')
        setCurrentUser(null)
      }
    } catch (err) { console.error(err) }
  }

  // ── Data actions ───────────────────────────────────────────────────
  const addIdea = async (newIdea) => {
    try {
      await api.createIdea({
        title:            newIdea.title,
        description:      newIdea.description   || '',
        category:         newIdea.category      || 'General',
        stage:            newIdea.stage         || 'Idea',
        team_size:        newIdea.teamSizeLimit || 3,
        team_requirement: newIdea.teamRequirement || '',
        skills:           newIdea.skills        || [],
        private_details:  newIdea.privateDetails || {},
      })
      await fetchIdeas()
    } catch (err) { console.error('addIdea failed:', err) }
  }

  const addRequest = async (req) => {
    try {
      await api.createRequest({
        idea_id:     req.ideaId,
        cover_notes: req.coverNotes || "I'd like to join!",
      })
      await fetchRequests()
    } catch (err) { console.error('addRequest failed:', err) }
  }

  const acceptRequest = async (reqId) => {
    try {
      await api.acceptRequest(reqId)
      await fetchRequests()
      await fetchNotifications()
    } catch (err) { console.error('acceptRequest failed:', err) }
  }

  const rejectRequest = async (reqId) => {
    try {
      await api.rejectRequest(reqId)
      await fetchRequests()
      await fetchNotifications()
    } catch (err) { console.error('rejectRequest failed:', err) }
  }

  const likePost = async (postId) => {
    try {
      const updated = await api.likePost(postId)
      setFeedPosts(prev => prev.map(p =>
        p.id === postId ? {
          ...updated,
          author: updated.author || '',
          time:   updated.createdAt ? new Date(updated.createdAt).toLocaleString() : '',
          comments: (updated.comments || []).map(c => ({
            ...c, author: c.author || '',
            time: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
          })),
        } : p
      ))
    } catch (err) { console.error('likePost failed:', err) }
  }

  const savePost = async (postId) => {
    try {
      const updated = await api.savePost(postId)
      setFeedPosts(prev => prev.map(p =>
        p.id === postId ? {
          ...updated,
          author: updated.author || '',
          time:   updated.createdAt ? new Date(updated.createdAt).toLocaleString() : '',
          comments: (updated.comments || []).map(c => ({
            ...c, author: c.author || '',
            time: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
          })),
        } : p
      ))
    } catch (err) { console.error('savePost failed:', err) }
  }

  const addComment = async (postId, text) => {
    try {
      const updated = await api.commentPost(postId, text)
      setFeedPosts(prev => prev.map(p =>
        p.id === postId ? {
          ...updated,
          author: updated.author || '',
          time:   updated.createdAt ? new Date(updated.createdAt).toLocaleString() : '',
          comments: (updated.comments || []).map(c => ({
            ...c, author: c.author || '',
            time: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
          })),
        } : p
      ))
    } catch (err) { console.error('addComment failed:', err) }
  }

  const addFeedPost = async (content, image = null) => {
    try {
      await api.createPost({ content, image })
      await fetchPosts()
    } catch (err) { console.error('addFeedPost failed:', err) }
  }

  const deleteFeedPost = async (postId) => {
    try {
      await api.deletePost(postId)
      await fetchPosts()
    } catch (err) { console.error('deleteFeedPost failed:', err) }
  }

  const rateUser = async (uid, rating) => {
    try {
      const updated = await api.rateUser(uid, rating)
      return { success: true, user: updated }
    } catch (err) {
      console.error('rateUser failed:', err)
      return { success: false, message: err.message }
    }
  }

  // Manual refresh handlers (exposed to pages that need pull-to-refresh)
  const refreshIdeas         = fetchIdeas
  const refreshFeed          = fetchPosts
  const refreshRequests      = fetchRequests
  const refreshNotifications = fetchNotifications
  const refreshMessages      = fetchMessages

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoadingUser,
        ideas,
        requests,
        notifications,
        messages,
        feedPosts,
        addIdea,
        addRequest,
        acceptRequest,
        rejectRequest,
        setMessages,
        setNotifications,
        loginUser,
        loginWithGoogle,
        registerUser,
        completeOnboarding,
        updateProfile,
        logoutUser,
        likePost,
        savePost,
        addComment,
        addFeedPost,
        deleteFeedPost,
        rateUser,
        changePassword,
        deactivateAccount,
        deleteAccount,
        selectedCategory, setSelectedCategory,
        selectedSkill,    setSelectedSkill,
        selectedStage,    setSelectedStage,
        refreshIdeas,
        refreshFeed,
        refreshRequests,
        refreshNotifications,
        refreshMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
