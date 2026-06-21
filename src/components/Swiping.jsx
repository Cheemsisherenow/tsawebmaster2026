import { useRef, useState, useCallback, useLayoutEffect, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { pageNavigation } from "../store";

gsap.registerPlugin(Draggable);

const API_URL = "https://volunteer-api-x37c.onrender.com/api/opportunities";

const SWIPE_THRESHOLD = 100;
const TINT_THRESHOLD = 60;

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

const selectClass =
  "w-full rounded-lg border border-[#D4D3D3] bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#286A6C]/30 cursor-pointer";
const inputClass =
  "w-full rounded-lg border border-[#D4D3D3] bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#286A6C]/30";

export default function Discover() {
  const [all, setAll] = useState([]);
  const [matched, setMatched] = useState([]);
  const [lastSwiped, setLastSwiped] = useState(null); // { item, dir }
  const [passedIds, setPassedIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);

  // filters
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [nameQuery, setNameQuery] = useState("");

  const savedResources = pageNavigation((s) => s.savedResources);
  const addSaved = pageNavigation((s) => s.addSaved);
  const removeSaved = pageNavigation((s) => s.removeSaved);

  const topRef = useRef(null);
  const flingRef = useRef(null);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((data) => { setAll(data); setIsLoading(false); })
      .catch((err) => { console.error("Failed to fetch opportunities:", err); setIsLoading(false); });
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

  // the visible deck: not liked, not passed, matches the filters
  const deck = useMemo(() => {
    const name = nameQuery.trim().toLowerCase();
    return all.filter((e) => {
      if (savedIds.has(String(e.id))) return false;     // already liked -> never reappears
      if (passedIds.has(String(e.id))) return false;    // passed this session
      if (cityFilter && getCity(e.location) !== cityFilter) return false;
      if (categoryFilter && e.tag !== categoryFilter) return false;
      if (name && !(e.title || "").toLowerCase().includes(name)) return false;
      return true;
    });
  }, [all, savedIds, passedIds, cityFilter, categoryFilter, nameQuery]);

  const topCard = deck[deck.length - 1];
  const anyFilterActive = cityFilter || categoryFilter || nameQuery;

  const commitSwipe = useCallback((dir, item) => {
    setLastSwiped({ item, dir });
    if (dir === "right") {
      setMatched((m) => [...m, item]);
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
    setNameQuery("");
  };

  useLayoutEffect(() => {
    const el = topRef.current;
    if (!el || !topCard) return;

    const keepEl = el.querySelector('[data-stamp="keep"]');
    const passEl = el.querySelector('[data-stamp="pass"]');

    gsap.set(el, { x: 0, y: 0, rotation: 0, opacity: 1, borderColor: "#286A6C" });
    gsap.set([keepEl, passEl], { opacity: 0 });

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
    <section className="min-h-screen bg-[#F7F8F3] pt-[18vh] text-[#1F3D2B]">
      <div className="mx-auto max-w-sm px-7 pb-24">
        {isLoading ? (
          <div className="flex h-[32rem] flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-[#286A6C]/20 border-t-[#286A6C] animate-spin" />
            <p className="font-semibold tracking-wide text-[#286A6C]">Loading opportunities…</p>
          </div>
        ) : (
          <>
            {all.length > 0 && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#D4D3D3] bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <select className={selectClass} value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                    <option value="">All cities</option>
                    {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className={selectClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All categories</option>
                    {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Search by name"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span><span className="font-semibold text-[#286A6C]">{deck.length}</span> to swipe</span>
                  {anyFilterActive && (
                    <button
                      onClick={clearFilters}
                      className="rounded-md border border-[#D4D3D3] px-2 py-1 font-medium text-gray-500 hover:border-[#286A6C] hover:text-[#286A6C]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {deck.length === 0 ? (
              anyFilterActive ? (
                <div className="rounded-3xl border border-[#D4D3D3] bg-white px-8 py-16 text-center shadow-sm">
                  <div className="text-5xl">🔍</div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">Nothing matches those filters</h3>
                  <p className="mt-2 text-sm text-[#1F3D2B]/70">Try a different city or category.</p>
                  <button onClick={clearFilters} className="mt-6 rounded-lg bg-[#286A6C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1F5557]">
                    Clear filters
                  </button>
                </div>
              ) : (
                <EndScreen count={matched.length} onReset={reset} />
              )
            ) : (
              <>
                <CardStack deck={deck} topRef={topRef} />

                <Controls
                  onSkip={() => flingRef.current?.("left")}
                  onSave={() => flingRef.current?.("right")}
                  onUndo={undo}
                  canUndo={!!lastSwiped}
                />

                {matched.length > 0 && (
                  <p className="mt-6 text-center text-base font-bold text-[#2F6B4F]">
                    <span aria-hidden>🌱</span> {matched.length} kept so far
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function CardStack({ deck, topRef }) {
  return (
    <div className="relative mb-8 h-[32rem]">
      {deck.map((o, i) => {
        const depth = deck.length - 1 - i;
        const isTop = depth === 0;
        const lift = Math.min(depth, 2);

        const z = depth === 0 ? "z-30" : depth === 1 ? "z-20" : "z-10";
        const pose =
          depth === 0 ? "" : lift === 1 ? "scale-[0.965] translate-y-3" : "scale-[0.93] translate-y-6";

        return (
          <article
            key={o.id}
            ref={isTop ? topRef : null}
            className={`group absolute inset-x-0 top-0 h-[30rem] select-none overflow-hidden rounded-3xl border border-[#286A6C] bg-[#F7F8F3] shadow-md ${z} ${pose} ${
              isTop
                ? "cursor-grab touch-none transition-shadow duration-300 hover:ring-4 hover:ring-[#286A6C]/40 active:cursor-grabbing"
                : "pointer-events-none transition-transform duration-300"
            }`}
          >
            <img
              src={o.img_url}
              alt={o.title}
              className="h-2/5 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => (e.target.src = "https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found")}
            />

            <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5">
              <div className="flex h-3/4 flex-col rounded-lg bg-[#F7F8F3] p-5 shadow-lg">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold leading-tight text-gray-900 line-clamp-2">{o.title}</h2>
                  {o.tag && (
                    <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {o.tag}
                    </span>
                  )}
                </div>

                <div className="mb-4 flex flex-col gap-1">
                  <div className="text-sm font-medium text-gray-800">{o.org}</div>

                  <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#1F3D2B]/65">
                    <Meta icon="📅">{formatDate(o.event_date)}</Meta>
                    {o.location && <Meta icon="📍">{o.location}</Meta>}
                  </dl>

                  <div className="flex flex-col items-start gap-4 pt-4">
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">{o.description}</p>
                    <hr className="w-full" />
                  </div>
                </div>

                <div className="mt-auto flex w-full justify-start">
                  <button className="rounded-md border border-[#286A6C] bg-transparent px-3 py-1.5 text-[#286A6C] shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#286A6C] hover:text-white hover:shadow-lg">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <span data-stamp="keep" className="absolute left-5 top-6 z-20 -rotate-12 rounded-lg border-2 border-[#2F6B4F] bg-[#FFFDF6]/90 px-3 py-1 text-lg font-black uppercase tracking-wider text-[#2F6B4F] opacity-0">
              Keep
            </span>
            <span data-stamp="pass" className="absolute right-5 top-6 z-20 rotate-12 rounded-lg border-2 border-[#C2603A] bg-[#FFFDF6]/90 px-3 py-1 text-lg font-black uppercase tracking-wider text-[#C2603A] opacity-0">
              Pass
            </span>
          </article>
        );
      })}
    </div>
  );
}

function Meta({ icon, children }) {
  return (
    <dd className="flex items-center gap-1.5">
      <span aria-hidden>{icon}</span>
      {children}
    </dd>
  );
}

/* ------------------------------------------------------------------ */

function Controls({ onSkip, onSave, onUndo, canUndo }) {
  return (
    <div className="flex items-end justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <RoundBtn onClick={onSkip} label="Pass" className="h-16 w-16 bg-[#F3E2D6] text-[#C2603A] hover:bg-[#ECD3C2]">✕</RoundBtn>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#C2603A]">Pass</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <RoundBtn onClick={onUndo} label="Undo last" disabled={!canUndo} className="h-12 w-12 bg-[#EADFC6] text-[#1F3D2B]/70 hover:bg-[#E0D3B5] disabled:opacity-40">↻</RoundBtn>
        <span className={`text-xs font-semibold uppercase tracking-wide transition-opacity ${canUndo ? "text-[#1F3D2B]/70" : "text-[#1F3D2B]/30"}`}>Undo</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <RoundBtn onClick={onSave} label="Keep" className="h-16 w-16 bg-[#286A6C] text-[#F7F8F3] hover:bg-[#1F5557]">♥</RoundBtn>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#286A6C]">Keep</span>
      </div>
    </div>
  );
}

function RoundBtn({ children, label, className = "", ...props }) {
  return (
    <button
      aria-label={label}
      className={`flex items-center justify-center rounded-full text-2xl leading-none shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286A6C] enabled:hover:scale-110 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

function EndScreen({ count, onReset }) {
  return (
    <div className="rounded-3xl border-2 border-[#286A6C] bg-[#F7F8F3] px-8 py-16 text-center shadow-xl">
      <div className="text-6xl">🌻</div>
      <h3 className="mt-4 text-3xl font-black text-gray-900">That&apos;s the whole stack</h3>
      <p className="mt-3 text-base text-[#1F3D2B]/70">
        You kept <span className="font-bold text-[#286A6C]">{count}</span>{" "}
        {count === 1 ? "opportunity" : "opportunities"}.
      </p>
      <button
        onClick={onReset}
        className="mt-8 rounded-xl bg-[#286A6C] px-7 py-3 text-sm font-bold text-[#F7F8F3] transition hover:bg-[#1F5557] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286A6C]"
      >
        Browse again
      </button>
    </div>
  );
}