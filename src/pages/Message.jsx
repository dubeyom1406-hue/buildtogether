import { useState, useEffect } from 'react'
import { Send, Search, Phone, Video, Info } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api } from '../api'

export default function Message() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const { currentUser, refreshMessages } = useApp()
  const params = new URLSearchParams(search)
  const withUid = params.get('with_uid')

  const [contacts, setContacts] = useState([])
  const [activeConvUid, setActiveConvUid] = useState(withUid || null)
  const [messages, setMessages] = useState([])
  const [typedMessage, setTypedMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Fetch contacts list on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        let contactsData = await api.getContacts()
        
        // If we are starting a chat with a specific user not yet in contacts list,
        // fetch their profile and prepend them as a temporary contact
        if (withUid && !contactsData.some(c => c.uid === withUid)) {
          try {
            const newUser = await api.getUser(withUid)
            contactsData = [
              {
                uid: newUser.uid,
                name: newUser.name,
                avatar: newUser.avatar,
                lastMessage: 'Start a new conversation...',
                lastMessageTime: new Date().toISOString(),
                isTemp: true
              },
              ...contactsData
            ]
          } catch (e) {
            console.warn('Failed to fetch temporary contact profile:', e)
          }
        }
        
        setContacts(contactsData)
        if (!activeConvUid && contactsData.length > 0) {
          setActiveConvUid(contactsData[0].uid)
        }
      } catch (err) {
        console.warn('Failed to fetch contacts:', err)
      }
    }
    if (currentUser) {
      fetchContacts()
    }
  }, [currentUser, withUid])

  // 2. Fetch messages for the active conversation partner & poll every 3 seconds
  useEffect(() => {
    if (!activeConvUid) return
    
    const fetchConversationMessages = async () => {
      try {
        const data = await api.getMessages(activeConvUid)
        setMessages(data)
        // Refresh global messages state to update the sidebar unread badges
        refreshMessages()
      } catch (err) {
        console.warn('Failed to fetch conversation messages:', err)
      }
    }

    fetchConversationMessages()
    const interval = setInterval(fetchConversationMessages, 3000)
    return () => clearInterval(interval)
  }, [activeConvUid, refreshMessages])

  // 3. Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!typedMessage.trim() || !activeConvUid) return

    try {
      const sent = await api.sendMessage({
        receiver_uid: activeConvUid,
        text: typedMessage
      })
      setTypedMessage('')
      
      // Prepend message to UI instantly for responsiveness
      setMessages(prev => [...prev, sent])
      
      // Update contacts list last message details
      setContacts(prev => prev.map(c => {
        if (c.uid === activeConvUid) {
          return {
            ...c,
            lastMessage: typedMessage,
            lastMessageTime: new Date().toISOString(),
            isTemp: false
          }
        }
        return c
      }))
      
      // Clean up URL parameter since convo has started
      if (withUid) {
        navigate('/message', { replace: true })
      }
    } catch (err) {
      alert('Failed to send message: ' + err.message)
    }
  }

  // Get currently active conversation details
  const activeContact = contacts.find(c => c.uid === activeConvUid)

  // Filter contacts by search query
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="bg-white border border-[#EFEFEF] rounded-[24px] h-[calc(100vh-120px)] flex overflow-hidden select-none">
      {/* Left Contacts Sidebar */}
      <div className="w-[320px] border-r border-[#EFEFEF] flex flex-col shrink-0">
        {/* Search */}
        <div className="p-4 border-b border-[#EFEFEF] relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9FA5]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations"
            className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-transparent rounded-full text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary font-semibold"
          />
        </div>

        {/* List of Contacts */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredContacts.map((conv) => (
            <button
              key={conv.uid}
              onClick={() => {
                setActiveConvUid(conv.uid)
                if (withUid && conv.uid !== withUid) {
                  navigate('/message', { replace: true })
                }
              }}
              className={`flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                activeConvUid === conv.uid ? 'bg-[#F4F4F4]' : 'hover:bg-[#F9F9F9]'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={conv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                  alt={conv.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#EFEFEF]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-bold text-[#1A1D1F] truncate">{conv.name || 'Builder'}</span>
                  <span className="text-[9px] text-[#9A9FA5] font-semibold shrink-0">
                    {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-[11px] text-[#6F767E] truncate font-medium">{conv.lastMessage}</p>
              </div>
            </button>
          ))}

          {contacts.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-400 font-semibold italic">
              No conversations started yet.<br />Explore People and click Connect to start a chat!
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Pane */}
      <div className="flex-1 flex flex-col bg-brand-bg/30">
        {activeContact ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-[#EFEFEF] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeContact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                  alt={activeContact.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#EFEFEF]"
                />
                <div>
                  <h3 className="text-xs font-bold text-[#1A1D1F]">{activeContact.name || 'Builder'}</h3>
                  <span className="text-[10px] text-[#6F767E] font-semibold">IIT Patna partner</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[#6F767E]">
                <button 
                  onClick={() => alert('Voice calling feature coming soon!')}
                  className="hover:text-[#1A1D1F] p-1.5 rounded-full hover:bg-brand-bg transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => alert('Video calling feature coming soon!')}
                  className="hover:text-[#1A1D1F] p-1.5 rounded-full hover:bg-brand-bg transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button className="hover:text-[#1A1D1F] p-1.5 rounded-full hover:bg-brand-bg transition-all cursor-pointer">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map((msg) => {
                const isMe = msg.senderUid === currentUser?.uid
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-brand-primary text-white rounded-tr-none'
                          : 'bg-white text-[#1A1D1F] border border-[#EFEFEF] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              {messages.length === 0 && (
                <div className="text-center py-12 text-xs text-slate-400 font-semibold italic">
                  No messages yet. Send a message to start the chat!
                </div>
              )}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-[#EFEFEF] flex gap-3">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={`Type a message to ${activeContact.name || 'Builder'}`}
                className="flex-1 px-4 py-2.5 bg-brand-bg border border-transparent rounded-full text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="bg-brand-primary text-white p-2.5 rounded-full hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col text-center p-8 text-[#9A9FA5] justify-center items-center font-semibold text-sm">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  )
}
