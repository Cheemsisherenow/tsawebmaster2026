import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import clsx from "clsx";
import { pageNavigation } from '../store';

const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';

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

const hashString = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};
const colorFor = (value) => BADGE_COLORS[hashString(String(value)) % BADGE_COLORS.length];
const typeColorFor = (value) => {
  const key = String(value).trim().toLowerCase();
  return TYPE_COLOR_MAP[key];
};

// same parser the Resource Hub uses: "Duluth, GA" -> "Duluth"
const getCity = (loc) => {
  if (!loc) return '';
  const parts = String(loc).split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  if (/^[A-Za-z]{2}$/.test(last)) return parts[parts.length - 2];
  return parts[0];
};

const Location = () => {
    const [events, setEvents] = useState([]);
    const [active, setActive] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const isAnimating = useRef(false);
    const listRef = useRef(null);
    const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage);
    const setSelectedOpportunityId = pageNavigation((state) => state.setSelectedOpportunityId);

    useEffect(() => {
        fetch(API_URL)
            .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(setEvents)
            .catch((err) => console.error('Failed to fetch resources:', err));
    }, []);

    const handleClick = (tabKey) => {
        if (active === tabKey || isAnimating.current) return;

        isAnimating.current = true;
        setCategoryFilter(null);

        const cards = listRef.current?.querySelectorAll('.resource-card') || [];

        const tl = gsap.timeline({
            onComplete: () => {
                setActive(tabKey);
            }
        });
        if (cards.length > 0) {
            tl.to(cards, {
                opacity: 0,
                y: -30,
                stagger: 0.05,
                duration: 0.25,
                ease: 'power2.in'
            });
        } else {
            tl.to({}, { duration: 0.1 });
        }
    };

    const handleCategoryClick = (category) => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const cards = listRef.current?.querySelectorAll('.resource-card') || [];

        const tl = gsap.timeline({
            onComplete: () => {
                setCategoryFilter(categoryFilter === category ? null : category);
            }
        });

        if (cards.length > 0) {
            tl.to(cards, { opacity: 0, scale: 0.95, duration: 0.15, ease: 'power2.in' });
        } else {
            tl.to({}, { duration: 0.05 });
        }
    };

    const learnMore = (card) => {
        setSelectedOpportunityId(card.id);
        changeCurrentPage("Resource Hub");
    };

    useGSAP(() => {
        const cards = listRef.current?.querySelectorAll('.resource-card');

        if (!active || !cards || cards.length === 0) {
            isAnimating.current = false;
            return;
        }

        gsap.fromTo(cards,
            { opacity: 0, y: 30, scale: 1 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                    isAnimating.current = false;
                }
            }
        );
    }, [active, categoryFilter]);

    const categoryOptions = useMemo(
        () => Array.from(new Set(events.map((e) => e.tag).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [events]
    );

    const displayedCards = useMemo(() => {
        if (!active) return [];
        return events.filter((e) => {
            if (getCity(e.location) !== active) return false;
            if (categoryFilter && e.tag !== categoryFilter) return false;
            return true;
        });
    }, [events, active, categoryFilter]);

    return (
        <section id="location">
            <div className="heading">
                <p className="title">
                    Community Resources Made Easy for You
                </p>
                <p className="subtitle">
                    Find community resources closest to your location
                </p>
            </div>

            <div className="map_container">
                <div className="gwinnett_map">
                    <div className="coordinate_map">
                        {[
                            { name: "Buford", top: "7.4%", left: "63.5%" },
                            { name: "Suwanee", top: "24.6%", left: "44.6%" },
                            { name: "Duluth", top: "36.8%", left: "26.3%" },
                            { name: "Norcross", top: "52.2%", left: "9.1%" },
                            { name: "Lilburn", top: "65.0%", left: "26.7%" },
                            { name: "Lawrenceville", top: "48.5%", left: "65.5%" },
                            { name: "Grayson", top: "63.9%", left: "88.6%" },
                            { name: "Snellville", top: "73.2%", left: "61.3%" },
                            { name: "Dacula", top: "33.1%", left: "89.2%" }
                        ].map((city) => (
                            <button
                                key={city.name}
                                onClick={() => handleClick(city.name)}
                                style={{ top: city.top, left: city.left }}
                                className="absolute flex items-center gap-2 group -translate-x-1/2 -translate-y-1/2 z-10"
                            >
                               <span className={clsx("w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-sm transition-all duration-200",
                                {"bg-[#286A6C] scale-125": active === city.name,"bg-slate-500 group-hover:bg-[#286A6C]": active !== city.name})} />
                                <span className={clsx("text-sm md:text-lg font-bold transition-colors duration-200 select-none",
                                {'text-[#286A6C]': active === city.name, 'text-gray-700 group-hover:text-[#286A6C]': active !== city.name})}
                                >
                                    {city.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="right_column">
                    <div>
                        <p className="title">
                            {active ? active : "Select Location"}
                        </p>
                        <p className="amount">
                            {displayedCards.length} Resources
                        </p>
                    </div>

                    <div className="category_selection">
                        {categoryOptions.map((cat) => {
                            const c = colorFor(cat);
                            const isActive = categoryFilter === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={clsx("category_button", c.bg, c.text, c.border,
                                        isActive ? "font-bold ring-2 ring-current" : "opacity-60 hover:opacity-100"
                                    )}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    <div ref={listRef} className="w-full flex-1 overflow-y-auto flex flex-col gap-4">
                        {!active ? (
                            <p className="text-center text-gray-400 my-auto text-lg font-medium">Click a city map location to start exploration.</p>
                        ) : displayedCards.length === 0 ? (
                            <p className="text-center text-gray-400 my-auto text-lg font-medium">No resources here yet, try another city or category.</p>
                        ) : (
                            displayedCards.map((card) => {
                                const typeColor = typeColorFor(card.type);
                                const tagColor = colorFor(card.tag);
                                return (
                                    <div key={card.id} className="resource-card opacity-0 w-full md:min-h-[45%] bg-[#D8EAE8] p-5 rounded-2xl shrink-0 shadow-sm flex flex-col">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {card.type && (
                                                <span className={clsx("rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", typeColor.bg, typeColor.text, typeColor.border)}>
                                                    {card.type}
                                                </span>
                                            )}
                                            {card.tag && (
                                                <span className={clsx("rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", tagColor.bg, tagColor.text, tagColor.border)}>
                                                    {card.tag}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-2xl font-bold text-[#286A6C] mt-2">{card.title}</h4>
                                        <p className="text-gray-600 mt-2 font-medium leading-relaxed">{card.description}</p>
                                        <button
                                            onClick={() => learnMore(card)}
                                            className="mt-3 self-start rounded-md border border-[#286A6C] bg-transparent px-3 py-1.5 text-sm font-semibold text-[#286A6C] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#286A6C] hover:text-white"
                                        >
                                            Learn more
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="flex w-full mt-10 md:mt-16">
                <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
                    <button onClick={() => changeCurrentPage("Match Me")} className="w-full md:w-auto bg-[#286A6C] text-lg md:text-3xl text-white rounded-2xl py-3 px-6 md:py-4 md:px-8 shadow-[4px_4px_8px_rgba(0,0,0,.4)] transition-all duration-300 hover:bg-[#33878a] hover:-translate-y-1 hover:shadow-[4px_4px_8px_#286A6C]">
                        Find Your Match
                    </button>
                    <p className="text-lg md:text-3xl md:mx-8">or</p>
                    <button onClick={() => changeCurrentPage("Submit Resources")} className="w-full md:w-auto text-lg md:text-3xl rounded-2xl py-3 px-6 md:py-4 md:px-8 bg-transparent border border-2 border-[#286A6C] text-[#286A6C] hover:bg-[#286A6C] transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_8px_#286A6C] hover:text-white">
                        Submit New Resources
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Location;