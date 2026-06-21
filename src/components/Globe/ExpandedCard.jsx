import React, { useRef, useEffect } from 'react'
import { pageNavigation } from '../../store'
import { gsap } from 'gsap'

const formatDate = (s) => {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ExpandedCard({ card, onClose }) {
  const changeCurrentPage = pageNavigation((s) => s.changeCurrentPage)
  const setSelectedOpportunityId = pageNavigation((s) => s.setSelectedOpportunityId)
  const panelRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = card ? 'hidden' : 'unset'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    if (card && panelRef.current) {
      gsap.fromTo(panelRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = 'unset' }
  }, [card])

  if (!card) return null

  const openInHub = () => {
    setSelectedOpportunityId(card.id)
    onClose()
    changeCurrentPage('Resource Hub')
  }

  return (
    <div ref={panelRef} className="fixed inset-0 z-[9999] w-screen h-[100dvh] overflow-y-auto bg-[#F7F8F3]">
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-[9999] p-2.5 bg-[#286A6C] hover:bg-[#1f5456] text-white rounded-full shadow-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <img
        src={card.img_url}
        alt={card.title}
        className="w-full h-[45vh] object-cover"
        onError={(e) => (e.target.src = 'https://placehold.co/1200x600/e2e8f0/475569?text=Image+Not+Found')}
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight flex-1">{card.title}</h1>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 uppercase tracking-wide">
            {card.tag}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 py-6 border-y border-gray-200 mb-8 bg-white rounded-lg px-6">
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Organization</div>
            <div className="font-semibold text-gray-900">{card.org}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</div>
            <div className="font-semibold text-[#286A6C]">{formatDate(card.event_date) || 'Flexible'}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
            <div className="font-semibold text-gray-900">{card.location}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3">About this opportunity</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg mb-10">{card.description}</p>

        <button
          onClick={openInHub}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#286A6C] hover:bg-[#1f5456] text-white font-semibold shadow-md transition-colors"
        >
          Open in Resource Hub
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}