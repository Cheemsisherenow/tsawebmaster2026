import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { pageNavigation } from "../store";
import ExpandedCard from './Globe/ExpandedCard';

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
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const colorFor = (value) => BADGE_COLORS[hashString(String(value)) % BADGE_COLORS.length];

const Resource_Hub = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const savedResources = pageNavigation((s) => s.savedResources);
  const toggleSaved = pageNavigation((s) => s.toggleSaved);

  const [currentPage, setCurrentPage] = useState(1);

  const selectedOpportunityId = pageNavigation((state) => state.selectedOpportunityId);
  const setSelectedOpportunityId = pageNavigation((state) => state.setSelectedOpportunityId);

  // filters + sort
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [sortDir, setSortDir] = useState('az');

  const ITEMS_PER_PAGE = 8;

  const gridRef = useRef(null);
  const topRef = useRef(null);

  const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';

  useEffect(() => {
    const MIN_SKELETON_MS = 800;
    const fetchOpportunities = async () => {
      const start = Date.now();
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const elapsed = Date.now() - start;
        if (elapsed < MIN_SKELETON_MS) {
          await new Promise((res) => setTimeout(res, MIN_SKELETON_MS - elapsed));
        }
        setEvents(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (!selectedOpportunityId || !events.length) return;
    const match = events.find((e) => String(e.id) === String(selectedOpportunityId));
    if (match) {
      setSelectedEvent(match);
      setSelectedOpportunityId(null);
    }
  }, [selectedOpportunityId, events]);

  useEffect(() => {
    if (isLoading || !events.length) return;
    const targetId = new URLSearchParams(window.location.search).get('opportunity');
    if (!targetId) return;
    const match = events.find((e) => String(e.id) === String(targetId));
    if (match) {
      setSelectedEvent(match);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isLoading, events]);

  const getCity = (loc) => {
    if (!loc) return '';
    const parts = String(loc).split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    const last = parts[parts.length - 1];
    if (/^[A-Za-z]{2}$/.test(last)) return parts[parts.length - 2];
    return parts[0];
  };

  const cityOptions = useMemo(() => {
    const set = new Set(events.map((e) => getCity(e.location)).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const categoryOptions = useMemo(() => {
    const set = new Set(events.map((e) => e.tag).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const typeOptions = useMemo(() => {
    const set = new Set(events.map((e) => e.type).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const visibleEvents = useMemo(() => {
    const name = nameQuery.trim().toLowerCase();
    const filtered = events.filter((e) => {
      if (cityFilter && getCity(e.location) !== cityFilter) return false;
      if (categoryFilter && e.tag !== categoryFilter) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      if (name && !(e.title || '').toLowerCase().includes(name)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const cmp = (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
      return sortDir === 'za' ? -cmp : cmp;
    });
  }, [events, cityFilter, categoryFilter, typeFilter, nameQuery, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visibleEvents.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedEvents = visibleEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const anyFilterActive = cityFilter || categoryFilter || typeFilter || nameQuery;

  const clearAll = () => {
    setCityFilter('');
    setCategoryFilter('');
    setTypeFilter('');
    setNameQuery('');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [cityFilter, categoryFilter, typeFilter, nameQuery, sortDir]);

  useLayoutEffect(() => {
    if (isLoading || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.event-card');
    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0, y: 30 });
      gsap.to(cards, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', overwrite: 'auto',
      });
    }
  }, [currentPage, isLoading, visibleEvents]);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedEvent]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    setTimeout(() => {
      if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return null;
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const SkeletonCard = () => (
    <div className="event-card opacity-0 animate-pulse">
      <div className="w-full h-[40%] bg-gray-200"></div>
      <div className="absolute flex flex-col justify-end w-full h-full px-5 pb-5">
        <div className="p-5 bg-[#F7F8F3] flex flex-col h-[75%] rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,.4)]">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="h-6 bg-gray-300 rounded w-2/3"></div>
            <div className="h-6 bg-gray-300 rounded-full w-16 shrink-0"></div>
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="flex justify-between items-center gap-4">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
            <div className="flex flex-col pt-4 gap-2">
              <div className="h-3 bg-gray-300 rounded w-full"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              <div className="h-3 bg-gray-300 rounded w-4/5"></div>
              <hr className="w-full mt-2 border-gray-300"/>
            </div>
          </div>
          <div className="w-full flex mt-auto justify-start">
            <div className="h-9 w-28 bg-gray-300 rounded-md shadow-[4px_4px_12px_rgba(0,0,0,.3)]"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const Chevron = () => (
    <svg className="rh-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  if (error) {
    return (
      <div className="rh-error">
        <div className="rh-error-box">
          <h3 className="rh-error-title">Oops! We couldn't load the events.</h3>
          <p className="rh-error-msg">Try refreshing the page! (For developers: make sure your API is connected correctly.)</p>
          <div className="rh-error-detail">Error details: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <section ref={topRef} id="resource_hub">
      <div className="rh-header">
        <h1 className="rh-title">Discover Resources in <span className="text-[#286A6C]"> Gwinnett</span></h1>
        <p className="rh-subtitle">
          Search and filter 45+ verified community organizations, support services, and programs
        </p>
      </div>

      <div className="rh-container">
        {!isLoading && (
          <div className="rh-filters">
            <div className="rh-filter-fields">
              <div className="rh-filter-row">
                <div className="rh-field">
                  <label htmlFor="city" className="rh-label">City</label>
                  <div className="rh-select-wrap">
                    <select id="city" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="rh-select">
                      <option value="">All cities</option>
                      {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Chevron />
                  </div>
                </div>

                <div className="rh-field">
                  <label htmlFor="category" className="rh-label">Category</label>
                  <div className="rh-select-wrap">
                    <select id="category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rh-select">
                      <option value="">All categories</option>
                      {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Chevron />
                  </div>
                </div>

                <div className="rh-field">
                  <label htmlFor="type" className="rh-label">Type</label>
                  <div className="rh-select-wrap">
                    <select id="type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rh-select">
                      <option value="">All types</option>
                      {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Chevron />
                  </div>
                </div>
              </div>

              <div className="rh-field">
                <label htmlFor="name" className="rh-label">Name</label>
                <input
                  id="name"
                  type="text"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  placeholder="Search by name"
                  className="rh-input"
                />
              </div>
            </div>

            <div className="rh-filter-footer">
              <div className="rh-count-wrap">
                <p className="rh-count">
                  Showing <span className="rh-count-num">{displayedEvents.length}</span> of{' '}
                  <span className="rh-count-num">{events.length}</span> resources
                </p>
                {anyFilterActive && (
                  <button onClick={clearAll} className="rh-clear">Clear all</button>
                )}
              </div>

              <div className="rh-sort">
                <span className="rh-sort-label">Sort Alphabetically</span>
                <div className="rh-sort-toggle">
                  <div className={`rh-sort-thumb ${sortDir === 'za' ? 'is-za' : ''}`} />
                  <button onClick={() => setSortDir('az')} className={`rh-sort-btn ${sortDir === 'az' ? 'is-active' : ''}`}>A–Z</button>
                  <button onClick={() => setSortDir('za')} className={`rh-sort-btn ${sortDir === 'za' ? 'is-active' : ''}`}>Z–A</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={gridRef} className="rh-grid">
          {isLoading
            ? Array(ITEMS_PER_PAGE).fill(0).map((_, index) => <SkeletonCard key={index} />)
            : displayedEvents.map((event) => {
                const typeColor = typeColorFor(event.type);
                const tagColor = colorFor(event.tag);
                return (
                  <div className="event-card" key={event.id} onClick={() => setSelectedEvent(event)}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSaved(event); }}
                      className="rh-card-save"
                      aria-label="Save"
                    >
                      <svg
                        className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="#286A6C"
                        fill={savedResources.some((r) => String(r.id) === String(event.id)) ? '#286A6C' : 'none'}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    <div className="rh-card-media">
                      <img
                        src={event.img_url}
                        alt={event.title}
                        className="rh-card-img"
                        onError={(e) => (e.target.src = 'https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found')}
                      />
                      {event.type && (
                        <div className="rh-type-badge">
                          <span className={`rh-type-pill ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>
                            {event.type}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="rh-card-body">
                      <div className="rh-card-inner">
                        <div className="rh-card-head">
                          <h2 className="rh-card-title">{event.title}</h2>
                          <span className={`rh-tag ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}>
                            {event.tag}
                          </span>
                        </div>

                        <div className="rh-card-meta">
                          <div className="rh-card-org">{event.org}</div>
                          <div className="rh-card-locrow">
                            <span>{event.location}</span>
                            <span className="rh-card-date">{formatDate(event.event_date) || 'Flexible'}</span>
                          </div>
                          <a className="rh-card-link" href={event.link} onClick={(e) => e.stopPropagation()}>
                            {event.link}
                          </a>
                          <div className="rh-card-descwrap">
                            <p className="rh-card-desc">{event.description}</p>
                            <hr className="w-full" />
                          </div>
                        </div>

                        <div className="rh-card-actions">
                          <button className="rh-card-btn">View Details</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {!isLoading && visibleEvents.length === 0 && (
          <div className="rh-empty">
            <h3>No resources match your filters sorry!</h3>
            <p>Try removing a filter or searching a different term.</p>
            {anyFilterActive && (
              <button onClick={clearAll} className="rh-empty-btn">Clear all filters</button>
            )}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="rh-pagination">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="rh-page-btn">&lt;&lt;</button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="rh-page-btn">&lt;</button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="rh-ellipsis">…</span>
              ) : (
                <button key={p} onClick={() => goToPage(p)} className={`rh-page-num ${p === currentPage ? 'is-active' : ''}`}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="rh-page-btn">&gt;</button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="rh-page-btn">&gt;&gt;</button>
          </div>
        )}
      </div>

      <ExpandedCard card={selectedEvent} resource_hub={true} onClose={() => setSelectedEvent(null)} />
    </section>
  );
};

export default Resource_Hub;