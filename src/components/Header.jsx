import React, { useState, useRef, useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import { pageNavigation } from '../store'
import { headerLinks } from '../constants'

function Header() {
  const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage);
  const hasUnseenSaved = pageNavigation((state) => state.hasUnseenSaved);
  const [open, setOpen] = useState(false);            // desktop "Get Involved" dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // mobile hamburger menu
  const dropdownRef = useRef(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const go = (label) => {
    changeCurrentPage(label);
    setOpen(false);
    setMobileOpen(false);
  };

  return (
    <header>
      <nav className={isMobile ? "nav-mobile" : ""}>
        <div className="logo">
          <p>VolunteerGwinnett</p>
        </div>

        {isMobile ? (
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="hamburger"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="hamburger-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        ) : (
          <>
            <ul>
              {headerLinks.map((link) => (
                <li key={link.label} className="nav-link-item">
                  <button onClick={() => changeCurrentPage(link.label)}>
                    {link.label}
                  </button>
                  {link.label === "Saved Resources" && hasUnseenSaved && (
                    <span className="saved-dot saved-dot--corner">
                      <span className="saved-dot__ping" />
                      <span className="saved-dot__core" />
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="dropdown" ref={dropdownRef}>
              <button onClick={() => setOpen((o) => !o)}>
                Get Involved
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`chevron ${open ? 'chevron--open' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className={`dropdown-panel ${open ? 'dropdown-panel--open' : ''}`}>
                <button onClick={() => go("Submit Resources")} className="dropdown-item">
                  <span>Submit Resources</span>
                </button>
                <button onClick={() => go("Get Involved")} className="dropdown-item dropdown-item--divided">
                  Message Us
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      {isMobile && (
        <div className={`mobile-menu ${mobileOpen ? 'mobile-menu--open' : ''}`}>
          <div className="mobile-menu-inner">
            {headerLinks.map((link) => (
              <button key={link.label} onClick={() => go(link.label)} className="mobile-link mobile-link--row">
                <span>{link.label}</span>
                {link.label === "Saved Resources" && hasUnseenSaved && (
                  <span className="saved-dot saved-dot--inline">
                    <span className="saved-dot__ping" />
                    <span className="saved-dot__core" />
                  </span>
                )}
              </button>
            ))}

            <div className="mobile-menu-section">
              <button onClick={() => go("Submit Resources")} className="mobile-link">
                Submit Resources
              </button>
              <button onClick={() => go("Get Involved")} className="mobile-link">
                Message Us
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header