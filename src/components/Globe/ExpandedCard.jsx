import React, { useRef, useEffect } from 'react'
import { pageNavigation } from '../../store'
import { gsap } from 'gsap'

// fixed palette — full literal class names so Tailwind keeps them
const BADGE_COLORS = [
  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' },
  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  { bg: 'bg-lime-50',    text: 'text-lime-700',    border: 'border-lime-200' },
  { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200' },
  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200' },
  { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200' },
];

const TYPE_COLOR_MAP = {
  'nonprofit/volunteer':{ bg: 'bg-teal-100/60',  text: 'border-teal-700', border: 'border-teal-200' },
  'community/support service':   { bg: 'bg-amber-100/60', text: 'border-teal-700', border: 'border-amber-200' },
  'community event': { bg: 'bg-rose-100/60',  text: 'border-teal-700', border: 'border-rose-200' },
};

const typeColorFor = (value) => {
  const key = String(value).trim().toLowerCase();
  return TYPE_COLOR_MAP[key]
};

const hashString = (str = '') => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const colorFor = (value) => BADGE_COLORS[hashString(String(value)) % BADGE_COLORS.length]

export default function ExpandedCard({ card, onClose, resource_hub = false }) {
  const changeCurrentPage = pageNavigation((s) => s.changeCurrentPage)
  const setSelectedOpportunityId = pageNavigation((s) => s.setSelectedOpportunityId)
  const savedResources = pageNavigation((s) => s.savedResources)
  const toggleSaved = pageNavigation((s) => s.toggleSaved)

  const overlayRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = card ? 'hidden' : 'unset'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

    if (card && overlayRef.current && cardRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      gsap.fromTo(
        cardRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)', delay: 0.05 }
      )
    }

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = 'unset'
    }
  }, [card, onClose])

  if (!card) return null

  const isSaved = savedResources.some((r) => String(r.id) === String(card.id))
  const typeColor = typeColorFor(card.type)
  const tagColor = colorFor(card.tag)

  const openInHub = () => {
    setSelectedOpportunityId(card.id)
    onClose()
    changeCurrentPage('Resource Hub')
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        className="relative w-[92vw] sm:w-[90vw] h-[90dvh] overflow-y-auto overflow-x-hidden bg-[#F7F8F3] rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* type badge — top left, color per type */}
        {card.type && (
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-[50]">
            <span className={`inline-block ${typeColor.bg} ${typeColor.text} border ${typeColor.border} text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-lg`}>
              {card.type}
            </span>
          </div>
        )}

        {/* heart + close — top right */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-[50] flex items-center gap-2">
          <button
            onClick={() => toggleSaved(card)}
            aria-label="Save"
            className="p-2.5 bg-white text-[#286A6C] rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="#286A6C"
              fill={isSaved ? '#286A6C' : 'none'}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 bg-[#286A6C] hover:bg-[#1f5456] text-white rounded-full shadow-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <img
          src={card.img_url}
          alt={card.title}
          className="w-full h-[30vh] sm:h-[45vh] object-cover"
          onError={(e) => (e.target.src = 'https://placehold.co/1200x600/e2e8f0/475569?text=Image+Not+Found')}
        />

        <div className="max-w-4xl mx-auto px-5 sm:px-10 py-8 sm:py-12">
          <div className="flex flex-wrap justify-between items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-5xl font-bold text-gray-900 leading-tight flex-1">{card.title}</h1>
            <span className={`px-3 py-1 sm:px-4 sm:py-1.5 ${tagColor.bg} ${tagColor.text} text-xs sm:text-sm font-semibold rounded-full border ${tagColor.border} uppercase tracking-wide`}>
              {card.tag}
            </span>
          </div>

          {/* three stacked rows: link, organization, location */}
          <div className="flex flex-col gap-4 py-4 sm:py-6 border-y border-gray-200 mb-6 sm:mb-8 bg-white rounded-lg px-4 sm:px-6">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Link</div>
              {card.link ? (
                <a
                  href={card.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#286A6C] hover:underline break-all"
                >
                  {card.link}
                </a>
              ) : (
                <div className="font-semibold text-gray-400">—</div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Organization</div>
              <div className="font-semibold text-gray-900">{card.org}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
              <div className="font-semibold text-gray-900">{card.location}</div>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">About this opportunity</h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap mb-8 sm:mb-10">{card.description}</p>

          {!resource_hub && (
            <button
            onClick={openInHub}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#286A6C] hover:bg-[#1f5456] text-white font-semibold shadow-md transition-colors"
          >
            Open in Resource Hub
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          )}
        </div>
      </div>
    </div>
  )
}