import { useRef, useState, useCallback, useLayoutEffect, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { pageNavigation } from "../store";
import ExpandedCard from "./Globe/ExpandedCard";

gsap.registerPlugin(Draggable);

const API_URL = "https://volunteer-api-x37c.onrender.com/api/opportunities";
const SWIPE_THRESHOLD = 100;
const TINT_THRESHOLD = 60;

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
  if (!s) return "Flexible";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "Flexible";
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

export default function Discover() {
  const [all, setAll] = useState([]);
  const [matched, setMatched] = useState([]);
  const [lastSwiped, setLastSwiped] = useState(null);
  const [passedIds, setPassedIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [nameQuery, setNameQuery] = useState("");

  const savedResources = pageNavigation((s) => s.savedResources);
  const addSaved = pageNavigation((s) => s.addSaved);
  const removeSaved = pageNavigation((s) => s.removeSaved);

  const topRef = useRef(null);
  const flingRef = useRef(null);
  const lockRef = useRef(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((data) => { setAll(data); setIsLoading(false); })
      .catch((err) => { console.error("Failed to fetch resources:", err); setIsLoading(false); });
  }, []);

  const savedIds = useMemo(() => new Set(savedResources.map((r) => String(r.id))), [savedResources]);

  const cityOptions = useMemo(
    () => Array.from(new Set(all.map((e) => getCity(e.location)).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [all]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(all.map((e) => e.tag).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [all]
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(all.map((e) => e.type).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [all]
  );

  const deck = useMemo(() => {
    const name = nameQuery.trim().toLowerCase();
    return all.filter((e) => {
      if (savedIds.has(String(e.id))) return false;
      if (passedIds.has(String(e.id))) return false;
      if (cityFilter && getCity(e.location) !== cityFilter) return false;
      if (categoryFilter && e.tag !== categoryFilter) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      if (name && !(e.title || "").toLowerCase().includes(name)) return false;
      return true;
    });
  }, [all, savedIds, passedIds, cityFilter, categoryFilter, typeFilter, nameQuery]);

  const topCard = deck[deck.length - 1];
  const anyFilterActive = cityFilter || categoryFilter || typeFilter || nameQuery;

  const commitSwipe = useCallback((dir, item) => {
    setLastSwiped({ item, dir });
    if (dir === "right") {
      setMatched((m) => (m.some((x) => x.id === item.id) ? m : [...m, item]));
      addSaved(item);
    } else {
      setPassedIds((s) => new Set(s).add(String(item.id)));
    }
  }, [addSaved]);

  const undo = useCallback(() => {
    if (!lastSwiped) return;
    const { item, dir } = lastSwiped;
    if (dir === "right") {
      removeSaved(item.id);
      setMatched((m) => m.filter((x) => x.id !== item.id));
    } else {
      setPassedIds((s) => { const n = new Set(s); n.delete(String(item.id)); return n; });
    }
    setLastSwiped(null);
  }, [lastSwiped, removeSaved]);

  const reset = useCallback(() => {
    setPassedIds(new Set());
    setMatched([]);
    setLastSwiped(null);
  }, []);

  const clearFilters = () => {
    setCityFilter("");
    setCategoryFilter("");
    setTypeFilter("");
    setNameQuery("");
  };

  useLayoutEffect(() => {
    const el = topRef.current;
    if (!el || !topCard) return;

    const keepEl = el.querySelector('[data-stamp="keep"]');
    const passEl = el.querySelector('[data-stamp="pass"]');

    gsap.set(el, { x: 0, y: 0, rotation: 0, opacity: 1, borderColor: "#286A6C" });
    gsap.set([keepEl, passEl], { opacity: 0 });
    lockRef.current = false;

    const drag = Draggable.create(el, {
      type: "x,y",
      onDrag() {
        gsap.set(el, {
          rotation: this.x / 14,
          borderColor:
            this.x > TINT_THRESHOLD ? "#2F6B4F"
            : this.x < -TINT_THRESHOLD ? "#C2603A"
            : "#286A6C",
        });
        gsap.set(keepEl, { opacity: this.x > TINT_THRESHOLD ? 1 : 0 });
        gsap.set(passEl, { opacity: this.x < -TINT_THRESHOLD ? 1 : 0 });
      },
      onDragEnd() {
        if (this.x > SWIPE_THRESHOLD) fling("right");
        else if (this.x < -SWIPE_THRESHOLD) fling("left");
        else snapBack();
      },
    })[0];

    const fling = (dir) => {
      if (lockRef.current) return;
      lockRef.current = true;
      drag.disable();
      gsap.to(el, {
        x: dir === "right" ? 600 : -600,
        rotation: dir === "right" ? 30 : -30,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => commitSwipe(dir, topCard),
      });
    };

    const snapBack = () => {
      gsap.to(el, { x: 0, y: 0, rotation: 0, duration: 0.4, ease: "power3.out" });
      gsap.to([keepEl, passEl], { opacity: 0, duration: 0.2 });
      gsap.set(el, { borderColor: "#286A6C" });
    };

    flingRef.current = fling;
    return () => drag.kill();
  }, [topCard?.id, commitSwipe]);

  return (
    <section id="discover">
      <div className="discover-header">
          <h1 className="discover-title">Swipe and Discover <span className="text-[#286A6C]"> Your Match</span></h1>
          <p className="discover-subtitle">Swipe right to keep an opportunity, left to pass.</p>
        </div>
      <div className="discover-inner">

        {isLoading ? (
          <div className="discover-loading">
            <div className="discover-spinner" />
            <p className="discover-loading-text">Loading resources</p>
          </div>
        ) : (
          <>
            {all.length > 0 && (
              <div className="discover-filters">
                <div className="discover-filter-selects">
                  <div className="discover-field">
                    <label className="discover-label">City</label>
                    <select className="discover-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                      <option value="">All cities</option>
                      {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="discover-field">
                    <label className="discover-label">Category</label>
                    <select className="discover-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                      <option value="">All categories</option>
                      {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="discover-field">
                    <label className="discover-label">Type</label>
                    <select className="discover-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                      <option value="">All types</option>
                      {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <label className="discover-label">Name</label>
                <input
                  type="text"
                  className="discover-input"
                  placeholder="Search by name"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                />
                <div className="discover-filter-meta">
                  <span><span className="discover-count">{deck.length}</span> to swipe</span>
                  {anyFilterActive && (
                    <button onClick={clearFilters} className="discover-clear">Clear</button>
                  )}
                </div>
              </div>
            )}

            {deck.length === 0 ? (
              anyFilterActive ? (
                <div className="discover-nomatch">
                  <div className="discover-nomatch-emoji">🔍</div>
                  <h3 className="discover-nomatch-title">Nothing matches those filters</h3>
                  <p className="discover-nomatch-text">Try a different city, category, or type.</p>
                  <button onClick={clearFilters} className="discover-nomatch-btn">Clear filters</button>
                </div>
              ) : (
                <EndScreen count={matched.length} onReset={reset} />
              )
            ) : (
              <>
                <CardStack deck={deck} topRef={topRef} onView={setExpanded} />
                <Controls
                  onSkip={() => flingRef.current?.("left")}
                  onSave={() => flingRef.current?.("right")}
                  onUndo={undo}
                  canUndo={!!lastSwiped}
                />
              </>
            )}
          </>
        )}
      </div>

      <ExpandedCard card={expanded} onClose={() => setExpanded(null)} />
    </section>
  );
}

function CardStack({ deck, topRef, onView }) {
  const visible = deck.slice(-4);

  return (
    <div className="discover-stack">
      {visible.map((o, i) => {
        const depth = visible.length - 1 - i;
        const isTop = depth === 0;
        const lift = Math.min(depth, 2);
        const z = depth === 0 ? "z-30" : depth === 1 ? "z-20" : "z-10";
        const pose = depth === 0 ? "" : lift === 1 ? "scale-[0.965] translate-y-3" : "scale-[0.93] translate-y-6";
        const typeColor = typeColorFor(o.type);
        const tagColor = colorFor(o.tag);

        return (
          <article
            key={o.id}
            ref={isTop ? topRef : null}
            className={`discover-card ${isTop ? "is-top" : "is-under"} ${z} ${pose}`}
          >
            <img
              src={o.img_url}
              alt={o.title}
              className="discover-card-img"
              onError={(e) => (e.target.src = "https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found")}
            />
            {o.type && (
              <div className="discover-type-badge">
                <span className={`discover-type-pill ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>{o.type}</span>
              </div>
            )}

            <div className="discover-card-overlay">
              <div className="discover-card-panel">
                <div className="discover-card-head">
                  <h2 className="discover-card-title">{o.title}</h2>
                  {o.tag && (
                    <span className={`discover-card-tag ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}>{o.tag}</span>
                  )}
                </div>

                <div className="discover-card-meta">
                  <div className="discover-card-org">{o.org}</div>
                  <dl className="discover-card-metarow">
                    <Meta icon="📅">{formatDate(o.event_date)}</Meta>
                    {o.location && <Meta icon="📍">{o.location}</Meta>}
                  </dl>
                  <div className="discover-card-descwrap">
                    <p className="discover-card-desc">{o.description}</p>
                    <hr className="w-full" />
                  </div>
                </div>

                <div className="discover-card-actions">
                  <button
                    className="discover-card-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onView(o); }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <span data-stamp="keep" className="discover-stamp keep">Keep</span>
            <span data-stamp="pass" className="discover-stamp pass">Pass</span>
          </article>
        );
      })}
    </div>
  );
}

function Meta({ icon, children }) {
  return (
    <dd className="discover-meta"><span aria-hidden>{icon}</span>{children}</dd>
  );
}

function Controls({ onSkip, onSave, onUndo, canUndo }) {
  return (
    <div className="discover-controls">
      <div className="discover-control">
        <button onClick={onSkip} aria-label="Pass" className="discover-round discover-round--pass">✕</button>
        <span className="discover-control-label discover-label--pass">Pass</span>
      </div>
      <div className="discover-control">
        <button onClick={onUndo} aria-label="Undo last" disabled={!canUndo} className="discover-round discover-round--undo">↻</button>
        <span className={`discover-control-label discover-label--undo ${canUndo ? "" : "is-off"}`}>Undo</span>
      </div>
      <div className="discover-control">
        <button onClick={onSave} aria-label="Keep" className="discover-round discover-round--keep">♥</button>
        <span className="discover-control-label discover-label--keep">Keep</span>
      </div>
    </div>
  );
}

function EndScreen({ count, onReset }) {
  return (
    <div className="discover-end">
      <div className="discover-end-emoji">🌻</div>
      <h3 className="discover-end-title">That&apos;s the whole stack</h3>
      <p className="discover-end-text">
        You kept <span className="discover-end-num">{count}</span>{" "}
        {count === 1 ? "opportunity" : "opportunities"}.
      </p>
      <button onClick={onReset} className="discover-end-btn">Browse again</button>
    </div>
  );
}