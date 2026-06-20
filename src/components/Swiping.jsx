import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

/**
 * Discover — volunteer opportunity swiper.
 *
 * Drag/swipe right to keep, left to pass; undo, reset, match counter,
 * end screen. Swipe mechanics run on GSAP Draggable. Cards use the teal
 * Resource_Hub design. All styling is Tailwind utilities (no inline CSS,
 * no px-based arbitrary values).
 */

const SEED = [
  {
    id: "s1",
    title: "Food Bank Sorting Drive",
    org: "Gwinnett County Food Bank",
    desc: "Help sort donated food items for families in need. Great for groups and first-timers!",
    img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=500&fit=crop",
    date: "Feb 15, 2026",
    duration: "3 hours",
    loc: "Lawrenceville, GA",
    tag: "Food",
  },
  {
    id: "s2",
    title: "Community Tree Planting",
    org: "Gwinnett Parks & Recreation",
    desc: "Plant native trees and beautify local parks. Tools and gloves provided!",
    img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=500&fit=crop",
    date: "Feb 22, 2026",
    duration: "3 hours",
    loc: "Duluth, GA",
    tag: "Environment",
  },
  {
    id: "s3",
    title: "After-School Tutoring",
    org: "Gwinnett Public Library",
    desc: "Tutor elementary students in reading and math. Super rewarding, we promise.",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop",
    date: "Every Tuesday",
    duration: "2 hours",
    loc: "Suwanee, GA",
    tag: "Education",
  },
  {
    id: "s4",
    title: "Neighborhood Cleanup Day",
    org: "Keep Gwinnett Beautiful",
    desc: "Pick up litter and beautify public spaces together. Trash bags provided.",
    img: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&h=500&fit=crop",
    date: "Mar 1, 2026",
    duration: "3 hours",
    loc: "Lilburn, GA",
    tag: "Environment",
  },
  {
    id: "s5",
    title: "Soup Kitchen Service",
    org: "Gwinnett Hope Shelter",
    desc: "Prepare and serve meals to those experiencing homelessness. Meaningful work.",
    img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=500&fit=crop",
    date: "Every Saturday",
    duration: "3 hours",
    loc: "Duluth, GA",
    tag: "Food",
  },
];

const SWIPE_THRESHOLD = 100;
const TINT_THRESHOLD = 60;

export default function Discover() {
  // Deck renders bottom-up: last item in the array is the top card.
  const [deck, setDeck] = useState(SEED);
  const [matched, setMatched] = useState([]);
  const [lastSwiped, setLastSwiped] = useState(null);

  const topRef = useRef(null);   // the current top <article>
  const flingRef = useRef(null); // lets the buttons trigger the same swipe

  const topCard = deck[deck.length - 1];
  const isDone = deck.length === 0;

  const commitSwipe = useCallback((dir, item) => {
    setLastSwiped(item);
    if (dir === "right") setMatched((m) => [...m, item]);
    setDeck((d) => d.filter((x) => x.id !== item.id));
  }, []);

  const undo = useCallback(() => {
    if (!lastSwiped) return;
    setDeck((d) => [...d, lastSwiped]);
    setMatched((m) => m.filter((x) => x.id !== lastSwiped.id));
    setLastSwiped(null);
  }, [lastSwiped]);

  const reset = useCallback(() => {
    setDeck(SEED);
    setMatched([]);
    setLastSwiped(null);
  }, []);

  // Wire up Draggable on whichever card is currently on top.
  useLayoutEffect(() => {
    const el = topRef.current;
    if (!el || !topCard) return;

    const keepEl = el.querySelector('[data-stamp="keep"]');
    const passEl = el.querySelector('[data-stamp="pass"]');

    // Reset the new top card to a clean resting pose.
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
        {isDone ? (
          <EndScreen count={matched.length} onReset={reset} />
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
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function CardStack({ deck, topRef }) {
  return (
    <div className="relative mb-8 h-[32rem]">
      {deck.map((o, i) => {
        const depth = deck.length - 1 - i; // 0 = top
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
            {/* image strip */}
            <img
              src={o.img}
              alt={o.title}
              className="h-2/5 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => (e.target.src = "https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found")}
            />

            {/* floating content card */}
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
                    <Meta icon="📅">{o.date}</Meta>
                    <Meta icon="⏰">{o.duration}</Meta>
                    <Meta icon="📍">{o.loc}</Meta>
                  </dl>

                  <div className="flex flex-col items-start gap-4 pt-4">
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">{o.desc}</p>
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

            {/* drag verdict stamps — opacity driven by GSAP */}
            <span
              data-stamp="keep"
              className="absolute left-5 top-6 z-20 -rotate-12 rounded-lg border-2 border-[#2F6B4F] bg-[#FFFDF6]/90 px-3 py-1 text-lg font-black uppercase tracking-wider text-[#2F6B4F] opacity-0"
            >
              Keep
            </span>
            <span
              data-stamp="pass"
              className="absolute right-5 top-6 z-20 rotate-12 rounded-lg border-2 border-[#C2603A] bg-[#FFFDF6]/90 px-3 py-1 text-lg font-black uppercase tracking-wider text-[#C2603A] opacity-0"
            >
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
          <RoundBtn
            onClick={onSkip}
            label="Pass"
            className="h-16 w-16 bg-[#F3E2D6] text-[#C2603A] hover:bg-[#ECD3C2]"
          >
            ✕
          </RoundBtn>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#C2603A]">Pass</span>
        </div>
  
        <div className="flex flex-col items-center gap-2">
          <RoundBtn
            onClick={onUndo}
            label="Undo last"
            disabled={!canUndo}
            className="h-12 w-12 bg-[#EADFC6] text-[#1F3D2B]/70 hover:bg-[#E0D3B5] disabled:opacity-40"
          >
            ↻
          </RoundBtn>
          <span
            className={`text-xs font-semibold uppercase tracking-wide transition-opacity ${
              canUndo ? "text-[#1F3D2B]/70" : "text-[#1F3D2B]/30"
            }`}
          >
            Undo
          </span>
        </div>
  
        <div className="flex flex-col items-center gap-2">
          <RoundBtn
            onClick={onSave}
            label="Keep"
            className="h-16 w-16 bg-[#286A6C] text-[#F7F8F3] hover:bg-[#1F5557]"
          >
            ♥
          </RoundBtn>
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