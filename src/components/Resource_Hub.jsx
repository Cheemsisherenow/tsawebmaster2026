import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';

const Resource_Hub = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date_asc');
  const ITEMS_PER_PAGE = 8; 

  const gridRef = useRef(null);
  const topRef = useRef(null);

  const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';

  const SORT_OPTIONS = [
    { value: 'date_asc',  label: 'Date — Soonest' },
    { value: 'date_desc', label: 'Date — Latest' },
    { value: 'category',  label: 'Category (A–Z)' },
    { value: 'area',      label: 'Area / Location (A–Z)' },
    { value: 'title',     label: 'Title (A–Z)' },
    { value: 'org',       label: 'Organization (A–Z)' },
  ];

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setEvents(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch opportunities:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const sortedEvents = useMemo(() => {
    const copy = [...events];
    const byText = (a, b, key) => (a[key] || '').localeCompare(b[key] || '');
    switch (sortBy) {
      case 'date_desc': return copy.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      case 'category':  return copy.sort((a, b) => byText(a, b, 'tag'));
      case 'area':      return copy.sort((a, b) => byText(a, b, 'location'));
      case 'title':     return copy.sort((a, b) => byText(a, b, 'title'));
      case 'org':       return copy.sort((a, b) => byText(a, b, 'org'));
      case 'date_asc':
      default:          return copy.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }
  }, [events, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedEvents = sortedEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (isLoading || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.event-card');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
      );
    }
  }, [currentPage, isLoading, sortBy, events]);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedEvent]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
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
    const dateObj = new Date(dateString);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const SkeletonCard = () => (
    <div className="h-[480px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-5 flex flex-col flex-grow space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16 shrink-0"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Oops! We couldn't load the events.</h3>
          <p className="text-red-600 mb-4">Make sure your backend API is running and the API_URL in the code is correct.</p>
          <div className="bg-white/50 inline-block px-4 py-2 rounded-lg text-sm font-mono text-red-700">
            Error details: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-[18vh]" ref={topRef}>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Resources in Gwinnett</h1>
        <p className="text-gray-600">
          Search and filter 45+ verified community organizations, support services, and programs
        </p>
      </div>

      <div className="container mx-[4vw] max-w-[92vw] mb-12">
        {!isLoading && (
          <div className="flex items-center justify-end mb-6">
            <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by</label>
            <div className="relative">
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="appearance-none bg-white border border-gray-200 text-gray-800 text-sm rounded-lg pl-4 pr-10 py-2.5 font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {isLoading
            ? Array(ITEMS_PER_PAGE).fill(0).map((_, index) => <SkeletonCard key={index} />)
            : displayedEvents.map((event) => (
                <div
                  className="event-card opacity-0 min-h-[480px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.img_url}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.target.src = 'https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found')}
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">{event.title}</h2>
                      <span className="shrink-0 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 uppercase tracking-wide">
                        {event.tag}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                      <div className="text-sm font-medium text-gray-800">{event.org}</div>
                      <div className="text-sm text-gray-500 flex items-center justify-between">
                        <span>{event.location}</span>
                        <span className="font-medium text-indigo-600">{formatDate(event.event_date)}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>

            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img
              src={selectedEvent.img_url}
              alt={selectedEvent.title}
              className="w-full h-64 sm:h-80 object-cover"
              onError={(e) => (e.target.src = 'https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found')}
            />

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight flex-1">{selectedEvent.title}</h2>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 uppercase tracking-wide">
                  {selectedEvent.tag}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-y border-gray-100 mb-6 bg-gray-50/50 rounded-lg px-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Organization</div>
                  <div className="font-semibold text-gray-900">{selectedEvent.org}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</div>
                  <div className="font-semibold text-indigo-600">{formatDate(selectedEvent.event_date)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
                  <div className="font-semibold text-gray-900">{selectedEvent.location}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">About this opportunity</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Resource_Hub;