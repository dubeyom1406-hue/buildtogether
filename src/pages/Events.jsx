import { useState, useEffect } from 'react'
import { 
  MapPin, Calendar, Clock, Users, Search, SlidersHorizontal, 
  Plus, Check, Award, Sparkles, Navigation, Globe, ArrowRight,
  Info, Compass, ChevronRight, X
} from 'lucide-react'
import { api } from '../api'

export default function Events() {
  const [selectedArea, setSelectedArea] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(null)

  // Areas dataset
  const areas = [
    { id: 'dtu', name: 'IIT Patna Campus', coordinates: { x: 120, y: 110 }, eventCount: 3, desc: 'IIT Patna campus grounds' },
    { id: 'cp', name: 'Connaught Place Hub', coordinates: { x: 280, y: 240 }, eventCount: 2, desc: 'Central Delhi student incubation zone' },
    { id: 'noida', name: 'Noida Tech Zone', coordinates: { x: 420, y: 310 }, eventCount: 4, desc: 'Noida Sector 62 tech incubation campus' },
    { id: 'gurgaon', name: 'Gurgaon Cyber City', coordinates: { x: 180, y: 380 }, eventCount: 1, desc: 'DLF CyberCity co-working spaces' }
  ]

  const mapSources = {
    All: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d448196.2238475058!2d76.76357065961685!3d28.643689408669527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sDelhi!5e0!3m2!1sen!2sin!4v1717833400000!5m2!1sen!2sin',
    dtu: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3497.904874288078!2d77.11497917634284!3d28.74948837560155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0138a0000001%3A0x864032d8bc983995!2sDelhi%20Technological%20University!5e0!3m2!1sen!2sin!4v1717833000000!5m2!1sen!2sin',
    cp: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.9967673552086!2d77.21672107633785!3d28.629864275664536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37e2a6a113%3A0x4c55ec36511b0e35!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1717833100000!5m2!1sen!2sin',
    noida: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.4042858485257!2d77.36224167633742!3d28.617634275670845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce549daab1949%3A0x334460d3d52d9294!2sSector%2062%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1717833200000!5m2!1sen!2sin',
    gurgaon: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3508.067469792612!2d77.08643807633096!3d28.49257617574304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d193855555555%3A0x53970b55ec74f51d!2sDLF%20Cyber%20City%2C%20Gurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1717833300000!5m2!1sen!2sin'
  }

  const [eventsList, setEventsList] = useState([])

  useEffect(() => {
    const fetchRealEvents = async () => {
      try {
        const data = await api.getEvents()
        setEventsList(data)
      } catch (err) {
        console.warn('Failed to fetch events:', err)
      }
    }
    fetchRealEvents()
  }, [])

  const categories = ['All', 'Hackathon', 'Meetup', 'Workshop', 'Seminar']

  const handleRegister = (id) => {
    if (registeredEvents.includes(id)) {
      setRegisteredEvents(registeredEvents.filter(e => e !== id))
    } else {
      setRegisteredEvents([...registeredEvents, id])
      alert('Registration successful! Confirmation details sent to email.')
    }
  }

  // Filter logic
  const filteredEvents = eventsList.filter((event) => {
    const matchesArea = selectedArea === 'All' || event.areaId === selectedArea
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.areaName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesArea && matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 select-none pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#EFEFEF] p-6 rounded-[28px] shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-brand-primary">
            <Compass className="w-5 h-5 text-brand-primary animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[10px] font-bold tracking-wider uppercase">Event Finder Map</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#1A1D1F]">Events & Meetups</h1>
          <p className="text-xs text-[#6F767E] font-semibold">Explore local tech hackathons, designs sprints, and developer workshops across Delhi NCR.</p>
        </div>

        {/* Global Stats */}
        <div className="flex gap-4 shrink-0">
          <div className="bg-brand-light border border-brand-primary/10 rounded-2xl px-4 py-2.5 flex flex-col items-center">
            <span className="text-[9px] text-[#9A9FA5] font-bold uppercase">Total Events</span>
            <span className="text-base font-extrabold text-[#1A1D1F] mt-0.5">{eventsList.length}</span>
          </div>
          <div className="bg-[#EBF7FF] border border-sky-100 rounded-2xl px-4 py-2.5 flex flex-col items-center">
            <span className="text-[9px] text-sky-600 font-bold uppercase">Active Hubs</span>
            <span className="text-base font-extrabold text-sky-700 mt-0.5">{areas.length} Areas</span>
          </div>
        </div>
      </div>

      {/* Main Events Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 3 Columns: Map and area selector */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Real Google Map Box */}
          <div className="bg-white border border-[#EFEFEF] rounded-[32px] overflow-hidden shadow-sm h-[460px] flex flex-col justify-between p-1.5 relative bg-[#FAF6F0]/20">
            {/* Embedded Google Map iframe */}
            <div className="w-full h-full rounded-[26px] overflow-hidden border border-[#EFEFEF] relative">
              <iframe
                src={mapSources[selectedArea]}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
                className="w-full h-full"
              ></iframe>


              {/* Floating Bottom details selector status */}
              <div className="absolute right-4 bottom-4 bg-white/95 backdrop-blur-sm px-3.5 py-2 border border-[#EFEFEF] rounded-2xl flex items-center justify-between gap-3 shadow-md max-w-[300px] z-10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-[#9A9FA5] font-bold uppercase tracking-wider">Active Selector</span>
                  <span className="text-[10px] font-extrabold text-[#1A1D1F] truncate max-w-[130px]">
                    {selectedArea === 'All' ? 'Showing All Hubs' : areas.find(a => a.id === selectedArea)?.name}
                  </span>
                </div>
                {selectedArea !== 'All' && (
                  <button
                    onClick={() => setSelectedArea('All')}
                    className="bg-brand-primary hover:bg-brand-hover text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Incubation Area quick list shortcuts */}
          <div className="grid grid-cols-4 gap-3">
            {areas.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedArea(selectedArea === a.id ? 'All' : a.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedArea === a.id
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-white text-[#1A1D1F] border-[#EFEFEF] hover:border-[#D1D5DB]'
                }`}
              >
                <MapPin className={`w-4.5 h-4.5 ${selectedArea === a.id ? 'text-white' : 'text-brand-primary'}`} />
                <span className="text-[10px] font-bold mt-1 block truncate w-full">{a.name}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${
                  selectedArea === a.id ? 'bg-white/20 text-white' : 'bg-brand-bg text-brand-primary border border-brand-primary/10'
                }`}>
                  {a.eventCount} Events
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Right 2 Columns: Search, categories and events display lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Search and Category filters card */}
          <div className="bg-white border border-[#EFEFEF] rounded-[24px] p-5 flex flex-col gap-4 shadow-sm">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9FA5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event title or area..."
                className="w-full pl-11 pr-4 py-2.5 bg-brand-bg border border-[#EFEFEF] rounded-xl text-xs text-[#1A1D1F] focus:outline-none focus:border-brand-primary focus:bg-white font-semibold"
              />
            </div>

            {/* Event Category pills */}
            <div className="flex flex-col gap-1.5 border-t border-[#F4F4F4] pt-3">
              <span className="text-[9px] font-bold text-[#6F767E] uppercase">Category filter</span>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'bg-brand-bg text-[#6F767E] border-slate-100 hover:border-[#D1D5DB]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtered events list container */}
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setShowEventModal(event)}
                className={`bg-white border rounded-[24px] p-5 flex flex-col gap-3 group hover:border-[#D1D5DB] transition-all duration-200 cursor-pointer relative ${
                  event.featured ? 'border-l-4 border-l-brand-primary' : 'border-[#EFEFEF]'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <span className="bg-brand-bg text-[#6F767E] border border-slate-100 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {event.category}
                  </span>
                  
                  <span className="text-[9px] text-brand-primary font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.areaName.split(' ')[0]}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <h3 className="text-xs font-extrabold text-[#1A1D1F] leading-snug group-hover:text-brand-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-[10px] text-[#9A9FA5] font-semibold mt-0.5">by {event.organizer}</p>
                </div>

                <p className="text-[11px] text-[#6F767E] font-medium leading-relaxed line-clamp-2">
                  {event.desc}
                </p>

                {/* Footer details row */}
                <div className="border-t border-[#F4F4F4] pt-3 flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3 text-[9px] text-[#6F767E] font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {event.date.replace(', 2026', '')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {event.attendees} going
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRegister(event.id)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      registeredEvents.includes(event.id)
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-brand-primary text-white hover:bg-brand-hover shadow-sm'
                    }`}
                  >
                    {registeredEvents.includes(event.id) ? (
                      <>
                        <Check className="w-3 h-3" />
                        Joined
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Join
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="py-12 text-center text-xs font-bold text-[#9A9FA5] bg-white border border-[#EFEFEF] rounded-3xl">
                No events found matching filters.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* EVENT DETAILED SPEC OVERLAY MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EFEFEF] w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-2xl relative p-6 flex flex-col gap-5">
            <button
              onClick={() => setShowEventModal(null)}
              className="absolute right-6 top-6 p-2 bg-brand-bg hover:bg-slate-100 border border-[#EFEFEF] rounded-full text-slate-500 hover:text-slate-950 transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col gap-1 pr-10 border-b border-[#F4F4F4] pb-4">
              <span className="text-[9px] bg-brand-light text-brand-primary border border-brand-primary/10 text-brand-primary font-bold px-2.5 py-0.5 rounded-full w-fit uppercase tracking-widest">
                {showEventModal.category} Event
              </span>
              <h2 className="text-sm font-extrabold text-[#1A1D1F] mt-2.5 leading-snug">
                {showEventModal.title}
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Organized by {showEventModal.organizer}</span>
            </div>

            {/* Meta details list */}
            <div className="grid grid-cols-2 gap-3 bg-brand-bg border border-[#F4F4F4] p-3 rounded-2xl text-xs text-[#1A1D1F] font-bold">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                <span>{showEventModal.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                <span>11 AM - 3 PM</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 border-t border-slate-200/50 pt-2.5 mt-0.5">
                <MapPin className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                <span className="truncate">{showEventModal.areaName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-[#6F767E] uppercase">About this Event</span>
              <p className="text-xs text-[#6F767E] font-semibold leading-relaxed">
                {showEventModal.desc}
              </p>
            </div>

            {/* Attendees avatars preview */}
            <div className="flex justify-between items-center border-t border-[#F4F4F4] pt-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2.5">
                  {showEventModal.avatars ? showEventModal.avatars.map((av, avIdx) => (
                    <img key={avIdx} src={av} alt="user profile" className="w-7 h-7 rounded-full border-2 border-white object-cover shadow" />
                  )) : (
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" className="w-7 h-7 rounded-full border-2 border-white object-cover shadow" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-bold ml-1">{showEventModal.attendees} student builder registrations</span>
              </div>

              <button
                onClick={() => handleRegister(showEventModal.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  registeredEvents.includes(showEventModal.id)
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-brand-primary text-white hover:bg-brand-hover shadow-sm'
                }`}
              >
                {registeredEvents.includes(showEventModal.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Registered
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Register Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
