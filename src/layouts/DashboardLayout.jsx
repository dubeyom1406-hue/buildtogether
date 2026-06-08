import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import RightWidgets from '../components/RightWidgets'

export default function DashboardLayout() {
  const location = useLocation()
  
  // Resizable panel states
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  // Drag handlers for Left Resizer
  const startResizingLeft = (e) => {
    e.preventDefault()
    setIsResizingLeft(true)
    const startX = e.clientX
    const startWidth = sidebarWidth

    const doDrag = (moveEvent) => {
      const delta = moveEvent.clientX - startX
      const newWidth = startWidth + delta
      if (newWidth < 80) {
        setSidebarWidth(0)
      } else {
        setSidebarWidth(Math.min(Math.max(160, newWidth), 400))
      }
    }

    const stopDrag = (stopEvent) => {
      setIsResizingLeft(false)
      window.removeEventListener('mousemove', doDrag)
      window.removeEventListener('mouseup', stopDrag)
      
      const endX = stopEvent.clientX
      if (Math.abs(endX - startX) < 5) {
        // Toggle collapse/expand on click
        setSidebarWidth(prev => prev === 0 ? 256 : 0)
      }
    }

    window.addEventListener('mousemove', doDrag)
    window.addEventListener('mouseup', stopDrag)
  }

  // Drag handlers for Right Resizer
  const startResizingRight = (e) => {
    e.preventDefault()
    setIsResizingRight(true)
    const startX = e.clientX
    const startWidth = rightSidebarWidth

    const doDrag = (moveEvent) => {
      const delta = moveEvent.clientX - startX
      const newWidth = startWidth - delta
      if (newWidth < 80) {
        setRightSidebarWidth(0)
      } else {
        setRightSidebarWidth(Math.min(Math.max(200, newWidth), 500))
      }
    }

    const stopDrag = (stopEvent) => {
      setIsResizingRight(false)
      window.removeEventListener('mousemove', doDrag)
      window.removeEventListener('mouseup', stopDrag)
      
      const endX = stopEvent.clientX
      if (Math.abs(endX - startX) < 5) {
        // Toggle collapse/expand on click
        setRightSidebarWidth(prev => prev === 0 ? 320 : 0)
      }
    }

    window.addEventListener('mousemove', doDrag)
    window.addEventListener('mouseup', stopDrag)
  }

  return (
    <div className={`h-screen bg-brand-bg flex overflow-hidden ${isResizingLeft || isResizingRight ? 'select-none' : ''}`}>
      {/* Left Navigation Sidebar */}
      <Sidebar width={sidebarWidth} collapsed={sidebarWidth === 0} transitionEnabled={!isResizingLeft} />

      {/* Left Resizer Handle */}
      <div
        onMouseDown={startResizingLeft}
        className={`w-1.5 hover:w-2 bg-transparent hover:bg-brand-primary/20 cursor-col-resize z-30 transition-all self-stretch relative flex items-center justify-center group ${
          sidebarWidth === 0 ? 'border-l-4 border-brand-primary/40 bg-brand-primary/10 w-3 hover:w-3.5' : ''
        }`}
        style={{ borderRight: sidebarWidth > 0 ? '1px solid #E8C9A8' : 'none' }}
        title={sidebarWidth === 0 ? "Click or drag right to open Sidebar" : "Drag to resize / Click to close Sidebar"}
      >
        {/* Visual grab capsule */}
        <div className={`w-1 h-8 rounded-full bg-brand-primary/50 transition-opacity ${
          sidebarWidth === 0 ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'
        }`} />
      </div>

      {/* Main workspace container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Content row: Middle and Right columns */}
        <div className="flex-1 flex flex-row gap-6 px-8 pb-8 overflow-hidden w-full mx-auto">
          
          {/* Main Content Area (Scrolls vertically) */}
          <main className="flex-1 min-w-0 overflow-y-auto py-2 pr-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Right Resizer Handle */}
          <div
            onMouseDown={startResizingRight}
            className={`w-1.5 hover:w-2 bg-transparent hover:bg-brand-primary/20 cursor-col-resize z-30 transition-all self-stretch relative flex items-center justify-center group ${
              rightSidebarWidth === 0 ? 'border-r-4 border-brand-primary/40 bg-brand-primary/10 w-3 hover:w-3.5' : ''
            }`}
            style={{ borderLeft: rightSidebarWidth > 0 ? '1px solid #E8C9A8' : 'none' }}
            title={rightSidebarWidth === 0 ? "Click or drag left to open Widgets" : "Drag to resize / Click to close Widgets"}
          >
            {/* Visual grab capsule */}
            <div className={`w-1 h-8 rounded-full bg-brand-primary/50 transition-opacity ${
              rightSidebarWidth === 0 ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'
            }`} />
          </div>

          {/* Right Sidebar Widgets Panel */}
          <div 
            className={`shrink-0 overflow-y-auto py-2 hide-scrollbar overflow-hidden ${!isResizingRight ? 'transition-all duration-300 ease-out' : ''}`}
            style={{ 
              width: rightSidebarWidth === 0 ? 0 : `${rightSidebarWidth}px`,
              opacity: rightSidebarWidth === 0 ? 0 : 1,
            }}
          >
            <div style={{ width: `${Math.max(320, rightSidebarWidth)}px` }}>
              <RightWidgets />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
