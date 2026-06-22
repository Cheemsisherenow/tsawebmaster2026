import { pageNavigation } from "../store";
import React, { useEffect, useState, useMemo } from "react";
import ExpandedCard from "./Globe/ExpandedCard";

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
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};
const colorFor = (value) => BADGE_COLORS[hashString(String(value)) % BADGE_COLORS.length];

const formatDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getCity = (loc) => {
  if (!loc) return "";
  const parts = String(loc).split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  if (/^[A-Za-z]{2}$/.test(last)) return parts[parts.length - 2];
  return parts[0];
};

export default function Saved_Resources() {
  const savedResources = pageNavigation((s) => s.savedResources);
  const markSavedSeen = pageNavigation((s) => s.markSavedSeen);
  const removeSaved = pageNavigation((s) => s.removeSaved);
  const changeCurrentPage = pageNavigation((s) => s.changeCurrentPage);

  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { markSavedSeen(); }, []);

  const cityOptions = useMemo(
    () => Array.from(new Set(savedResources.map((e) => getCity(e.location)).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [savedResources]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(savedResources.map((e) => e.tag).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [savedResources]
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(savedResources.map((e) => e.type).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [savedResources]
  );

  const visibleSaved = useMemo(() => {
    const name = nameQuery.trim().toLowerCase();
    return savedResources.filter((e) => {
      if (cityFilter && getCity(e.location) !== cityFilter) return false;
      if (categoryFilter && e.tag !== categoryFilter) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      if (name && !(e.title || "").toLowerCase().includes(name)) return false;
      return true;
    });
  }, [savedResources, cityFilter, categoryFilter, typeFilter, nameQuery]);

  const anyFilterActive = cityFilter || categoryFilter || typeFilter || nameQuery;
  const clearFilters = () => {
    setCityFilter("");
    setCategoryFilter("");
    setTypeFilter("");
    setNameQuery("");
  };

  const unsaveAll = () => {
    if (!savedResources.length) return;
    if (window.confirm("Remove all saved resources?")) {
      savedResources.forEach((e) => removeSaved(e.id));
    }
  };

  return (
    <section id="saved_resources">
      <div className="sr-header">
        <h1 className="sr-title">Keep Track of the <span className="text-[#286A6C]"> Resources</span> you  <span className="text-[#286A6C]"> Saved</span></h1>
        <p className="sr-subtitle">Browse through the resources you saved earlier.</p>
      </div>

      {savedResources.length === 0 ? (
        <div className="sr-empty">
          <h3>No saved resources yet</h3>
          <p>Tap the heart on any card in the hub to save it here.</p>
          <button onClick={() => changeCurrentPage("Resource Hub")} className="sr-empty-btn">Browse the hub</button>
        </div>
      ) : (
        <>
          <div className="sr-filters">
            <div className="sr-filter-selects">
              <div className="sr-field">
                <label className="sr-label">City</label>
                <select className="sr-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                  <option value="">All cities</option>
                  {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sr-field">
                <label className="sr-label">Category</label>
                <select className="sr-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">All categories</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sr-field">
                <label className="sr-label">Type</label>
                <select className="sr-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All types</option>
                  {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <input
              type="text"
              className="sr-input"
              placeholder="Search by name"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
            />
            <div className="sr-filter-meta">
              <span><span className="sr-count">{visibleSaved.length}</span> of {savedResources.length} saved</span>
              <div className="sr-meta-actions">
                {anyFilterActive && (
                  <button onClick={clearFilters} className="sr-clear">Clear</button>
                )}
                <button onClick={unsaveAll} className="sr-unsave-all">Unsave all</button>
              </div>
            </div>
          </div>

          {visibleSaved.length === 0 ? (
            <div className="sr-nomatch">
              <h3>Nothing matches those filters</h3>
              <p>Try a different city, category, or type.</p>
              <button onClick={clearFilters} className="sr-nomatch-btn">Clear filters</button>
            </div>
          ) : (
            <div className="sr-grid">
              {visibleSaved.map((event) => {
                const typeColor = typeColorFor(event.type);
                const tagColor = colorFor(event.tag);
                return (
                  <div key={event.id} onClick={() => setExpanded(event)} className="sr-card">
                    <img
                      src={event.img_url} alt={event.title}
                      className="sr-card-img"
                      onError={(e) => (e.target.src = 'https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found')}
                    />
                    {event.type && (
                      <div className="sr-type-badge">
                        <span className={`sr-type-pill ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>{event.type}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSaved(event.id); }}
                      className="sr-card-remove"
                      aria-label="Remove"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#286A6C" stroke="#286A6C" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    <div className="sr-card-body">
                      <div className="sr-card-head">
                        <h2 className="sr-card-title">{event.title}</h2>
                        <span className={`sr-card-tag ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}>{event.tag}</span>
                      </div>
                      <div className="sr-card-org">{event.org}</div>
                      <div className="sr-card-locrow">
                        <span>{event.location}</span>
                        <span className="sr-card-date">{formatDate(event.event_date) || 'Flexible'}</span>
                      </div>
                      <p className="sr-card-desc">{event.description}</p>
                      <div className="sr-card-actions">
                        <button
                          className="sr-card-btn"
                          onClick={(e) => { e.stopPropagation(); setExpanded(event); }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <ExpandedCard card={expanded} onClose={() => setExpanded(null)} />
    </section>
  );
}