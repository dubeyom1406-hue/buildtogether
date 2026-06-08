import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

/**
 * Make an authenticated API call.
 * Automatically attaches the Firebase ID token to every request.
 */
async function request(method, path, body = null) {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const token = await user.getIdToken()

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, options)

  if (res.status === 204) return null  // No Content

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.detail || `API error ${res.status}`)
  }

  return data
}

// ── Convenience wrappers ──────────────────────
const get  = (path)         => request('GET',    path)
const post = (path, body)   => request('POST',   path, body)
const patch= (path, body)   => request('PATCH',  path, body)
const del  = (path)         => request('DELETE', path)


// ── User ─────────────────────────────────────
export const api = {

  // User
  getMe:            ()       => get('/users/me'),
  createOrUpdateMe: (data)   => post('/users/me', data),
  updateMe:         (data)   => patch('/users/me', data),
  getUser:          (uid)    => get(`/users/${uid}`),
  getUsers:         ()       => get('/users'),
  rateUser:         (uid, rating) => post(`/users/${uid}/rate`, { rating }),

  // Ideas
  getIdeas:     (params = {}) => {
    const q = new URLSearchParams()
    if (params.category && params.category !== 'All') q.set('category', params.category)
    if (params.stage    && params.stage    !== 'All') q.set('stage',    params.stage)
    if (params.skill    && params.skill    !== 'All') q.set('skill',    params.skill)
    return get(`/ideas${q.toString() ? '?' + q : ''}`)
  },
  createIdea:   (data)       => post('/ideas', data),
  updateIdea:   (id, data)   => patch(`/ideas/${id}`, data),
  deleteIdea:   (id)         => del(`/ideas/${id}`),

  // Join Requests
  getRequests:    ()         => get('/requests'),
  createRequest:  (data)     => post('/requests', data),
  acceptRequest:  (id)       => patch(`/requests/${id}/accept`),
  rejectRequest:  (id)       => patch(`/requests/${id}/reject`),

  // Feed Posts
  getPosts:       ()         => get('/posts'),
  createPost:     (data)     => post('/posts', data),
  likePost:       (id)       => post(`/posts/${id}/like`),
  savePost:       (id)       => post(`/posts/${id}/save`),
  commentPost:    (id, text) => post(`/posts/${id}/comment`, { text }),
  deletePost:     (id)       => del(`/posts/${id}`),

  // Notifications
  getNotifications:  ()      => get('/notifications'),
  markRead:          (id)    => patch(`/notifications/${id}/read`),
  markAllRead:       ()      => patch('/notifications/read-all'),

  // Messages
  getMessages:    (withUid)  => get(`/messages${withUid ? '?with_uid=' + withUid : ''}`),
  sendMessage:    (data)     => post('/messages', data),
  getContacts:    ()         => get('/messages/contacts'),

  // Events
  getEvents:  (params = {}) => {
    const q = new URLSearchParams()
    if (params.area)     q.set('area',     params.area)
    if (params.category) q.set('category', params.category)
    return get(`/events${q.toString() ? '?' + q : ''}`)
  },
  createEvent: (data)        => post('/events', data),
}
