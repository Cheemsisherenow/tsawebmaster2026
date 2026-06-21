import React, { useState, useRef, useEffect } from 'react'
import { pageNavigation } from '../store'
import { headerLinks } from '../constants'

function Header() {
  const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage);
  const hasUnseenSaved = pageNavigation((state) => state.hasUnseenSaved);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header>
      <nav>
        <div className="logo">
          <p>VolunteerGwinnett</p>
        </div>

        <ul>
          {headerLinks.map((link) => (
            <li key={link.label} className="relative">
                <button onClick={() => changeCurrentPage(link.label)}>
                {link.label}
                </button>
                {link.label == "Saved Resources" && hasUnseenSaved && (
                <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFFFFF] opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FFFFFF]" />
                </span>
                )}
            </li>
        ))}
        </ul>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2"
          >
            Get Involved
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`absolute right-0 mt-2 w-full bg-[#F7F8F3] text-lg rounded-xl shadow-[4px_4px_12px_rgba(0,0,0,.2)] border border-[#286A6C] overflow-hidden z-50 transition-all duration-300 ease-out origin-top ${open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}`}>
            <button
              onClick={() => changeCurrentPage("Submit Resources")}
              className="w-full text-left px-4 py-3 text-gray-800 hover:bg-[#286A6C] hover:text-white"
            >
              <span>Submit Resources</span>
            </button>
            <button
              onClick={() => changeCurrentPage("Get Involved")}
              className="w-full text-left px-4 py-3 text-gray-800 hover:bg-[#286A6C] hover:text-white transition-colors border-t border-[#286A6C]"
            >
              Message Us
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header