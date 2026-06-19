import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Discover — volunteer opportunity swiper.
 *
 * Same behavior as the original Discover tab (drag/swipe right to save,
 * left to skip, undo, reset, match counter, end screen) but re-skinned with
 * a warm "community postcards" identity instead of the indigo Tinder look.
 *
 * Palette
 *   forest   #1F3D2B  ink / anchor
 *   moss     #2F6B4F  primary actions
 *   clay     #C2603A  accent / "skip"
 *   coral    #E08A5B  "save" warmth
 *   cream    #F7F1E3  page
 *   sand     #EADFC6  card edges
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
  // deck is rendered bottom-up: last item in the array is the top card.
  const [deck, setDeck] = useState(SEED);
  const [matched, setMatched] = useState([]);
  const [lastSwiped, setLastSwiped] = useState(null);
  const [leaving, setLeaving] = useState(null); // { id, dir }

  const topCard = deck[deck.length - 1];
  const isDone = deck.length === 0;

  const commitSwipe = useCallback(
    (dir) => {
      const item = deck[deck.length - 1];
      if (!item) return;
      setLastSwiped(item);
      if (dir === "right") setMatched((m) => [...m, item]);
      setLeaving({ id: item.id, dir });
      window.setTimeout(() => {
        setDeck((d) => d.slice(0, -1));
        setLeaving(null);
      }, 300);
    },
    [deck]
  );

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
    setLeaving(null);
  }, []);

  return (
    <section className="min-h-screen bg-[#F7F1E3] text-[#1F3D2B] antialiased">
      {/* page heading */}
      <header className="mx-auto max-w-2xl px-7 pt-20 pb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#1F3D2B]/15 bg-[#EADFC6] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2F6B4F]">
          Pick your pace
        </span>
        <h1 className="mt-5 font-serif text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          Discover ways to
          <span className="block text-[#C2603A]">show up nearby</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-[#1F3D2B]/70">
          Keep the ones that fit your week, pass on the ones that don&apos;t.
          Everything you keep gets saved to your list.
        </p>
      </header>

      <div className="mx-auto max-w-[460px] px-7 pb-24">
        {isDone ? (
          <EndScreen count={matched.length} onReset={reset} />
        ) : (
          <>
            <CardStack
              deck={deck}
              leaving={leaving}
              onSwipe={commitSwipe}
            />

            <Controls
              onSkip={() => commitSwipe("left")}
              onSave={() => commitSwipe("right")}
              onUndo={undo}
              canUndo={!!lastSwiped}
            />

            {matched.length > 0 && (
              <p className="mt-6 text-center text-[17px] font-bold text-[#2F6B4F]">
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

function CardStack({ deck, leaving, onSwipe }) {
  return (
    <div className="relative mb-8 h-[560px]">
      {deck.map((o, i) => {
        const isTop = i === deck.length - 1;
        const depth = deck.length - 1 - i; // 0 = top
        return (
          <Card
            key={o.id}
            data={o}
            isTop={isTop}
            depth={depth}
            leaving={leaving && leaving.id === o.id ? leaving.dir : null}
            onSwipe={onSwipe}
          />
        );
      })}
    </div>
  );
}

function Card({ data, isTop, depth, leaving, onSwipe }) {
  const ref = useRef(null);
  const drag = useRef({ active: false, startX: 0, dx: 0 });
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Pointer handlers only matter for the top card.
  const onPointerDown = (e) => {
    if (!isTop || leaving) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      dx: 0,
    };
    setDragging(true);
    ref.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const d = e.clientX - drag.current.startX;
    drag.current.dx = d;
    setDx(d);
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    const d = drag.current.dx;
    drag.current.active = false;
    setDragging(false);
    if (d > SWIPE_THRESHOLD) onSwipe("right");
    else if (d < -SWIPE_THRESHOLD) onSwipe("left");
    else setDx(0);
  };

  // Resolve transform: leaving animation > active drag > resting stack pose.
  let transform;
  let transition;
  if (leaving) {
    const x = leaving === "right" ? 600 : -600;
    const rot = leaving === "right" ? 30 : -30;
    transform = `translateX(${x}px) rotate(${rot}deg)`;
    transition = "transform .3s ease, opacity .3s ease";
  } else if (isTop) {
    transform = `translateX(${dx}px) rotate(${dx / 14}deg)`;
    transition = dragging ? "none" : "transform .3s ease, border-color .2s";
  } else {
    // Cards below peek out, gently stacked.
    const lift = Math.min(depth, 2);
    transform = `scale(${1 - lift * 0.035}) translateY(${lift * 12}px)`;
    transition = "transform .3s ease";
  }

  const tintColor =
    isTop && !leaving
      ? dx > TINT_THRESHOLD
        ? "#E08A5B"
        : dx < -TINT_THRESHOLD
        ? "#C2603A"
        : "#EADFC6"
      : "#EADFC6";

  const showLike = isTop && dx > TINT_THRESHOLD;
  const showNope = isTop && dx < -TINT_THRESHOLD;

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform,
        transition,
        opacity: leaving ? 0 : 1,
        zIndex: depth === 0 ? 30 : 30 - depth,
        borderColor: tintColor,
        touchAction: "none",
      }}
      className={`absolute inset-x-0 top-0 select-none overflow-hidden rounded-[26px] border-[3px] bg-[#FFFDF6] shadow-[0_18px_40px_-12px_rgba(31,61,43,0.35)] ${
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
    >
      {/* photo + stamp */}
      <div className="relative h-[270px]">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${data.img}')` }}
        />
        <span className="absolute left-4 top-4 rounded-md border border-white/60 bg-[#1F3D2B]/85 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#F7F1E3] backdrop-blur">
          {data.tag}
        </span>

        {/* drag verdict stamps */}
        <Verdict show={showLike} label="Keep" tone="#2F6B4F" side="left" />
        <Verdict show={showNope} label="Pass" tone="#C2603A" side="right" />
      </div>

      {/* body */}
      <div className="p-6">
        <h3 className="font-serif text-[23px] font-black leading-tight">
          {data.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-[#2F6B4F]">{data.org}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#1F3D2B]/70">
          {data.desc}
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-[#1F3D2B]/65">
          <Meta icon="📅">{data.date}</Meta>
          <Meta icon="⏰">{data.duration}</Meta>
          <Meta icon="📍">{data.loc}</Meta>
        </dl>
      </div>
    </article>
  );
}

function Verdict({ show, label, tone, side }) {
  return (
    <span
      style={{
        color: tone,
        borderColor: tone,
        opacity: show ? 1 : 0,
        transform: `rotate(${side === "left" ? -12 : 12}deg)`,
      }}
      className={`absolute top-6 ${
        side === "left" ? "left-5" : "right-5"
      } rounded-lg border-[3px] bg-[#FFFDF6]/90 px-3 py-1 text-lg font-black uppercase tracking-wider transition-opacity`}
    >
      {label}
    </span>
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
    <div className="flex items-center justify-center gap-5">
      <RoundBtn
        onClick={onSkip}
        label="Pass"
        className="h-[66px] w-[66px] bg-[#F3E2D6] text-[#C2603A] hover:bg-[#ECD3C2]"
      >
        ✕
      </RoundBtn>

      <RoundBtn
        onClick={onUndo}
        label="Undo last"
        disabled={!canUndo}
        className="h-[52px] w-[52px] bg-[#EADFC6] text-[#1F3D2B]/70 hover:bg-[#E0D3B5] disabled:opacity-0"
      >
        ↻
      </RoundBtn>

      <RoundBtn
        onClick={onSave}
        label="Keep"
        className="h-[66px] w-[66px] bg-[#2F6B4F] text-[#F7F1E3] hover:bg-[#255840]"
      >
        ♥
      </RoundBtn>
    </div>
  );
}

function RoundBtn({ children, label, className = "", ...props }) {
  return (
    <button
      aria-label={label}
      className={`flex items-center justify-center rounded-full text-[26px] leading-none shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3D2B] enabled:hover:scale-110 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

function EndScreen({ count, onReset }) {
  return (
    <div className="rounded-[26px] border-[3px] border-[#EADFC6] bg-[#FFFDF6] px-8 py-16 text-center shadow-[0_18px_40px_-12px_rgba(31,61,43,0.35)]">
      <div className="text-6xl">🌻</div>
      <h3 className="mt-4 font-serif text-3xl font-black">
        That&apos;s the whole stack
      </h3>
      <p className="mt-3 text-[17px] text-[#1F3D2B]/70">
        You kept{" "}
        <span className="font-bold text-[#2F6B4F]">{count}</span>{" "}
        {count === 1 ? "opportunity" : "opportunities"}.
      </p>
      <button
        onClick={onReset}
        className="mt-8 rounded-xl bg-[#2F6B4F] px-7 py-3 text-sm font-bold text-[#F7F1E3] transition hover:bg-[#255840] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3D2B]"
      >
        Browse again
      </button>
    </div>
  );
}