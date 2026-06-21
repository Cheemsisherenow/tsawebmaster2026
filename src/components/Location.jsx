import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import clsx from "clsx";

const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';

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

    // pull the same data the Resource Hub uses
    useEffect(() => {
        fetch(API_URL)
            .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(setEvents)
            .catch((err) => console.error('Failed to fetch opportunities:', err));
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

    // real data: filter by the selected city, then by category (tag)
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
                    Volunteer Made Easy for You
                </p>
                <p className="subtitle">
                    Find volunteer opportunities closest to your location
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
                               <span className={clsx("w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-200",
                                {"bg-[#286A6C] scale-125": active === city.name,"bg-slate-500 group-hover:bg-[#286A6C]": active !== city.name})} />
                                <span className={clsx("text-lg font-bold transition-colors duration-200 select-none",
                                {'text-[#286A6C]': active === city.name, 'text-gray-7xl group-hover:text-[#286A6C]': active !== city.name})}
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
                            {displayedCards.length} Opportunities
                        </p>
                    </div>

                    <div className="category_selection">
                        <button
                        onClick={() => handleCategoryClick('Food')}
                        className={clsx("category_button",
                            {"bg-[#286A6C] text-white border-[#286A6C]": categoryFilter === 'Food', "bg-gray-100 text-gray-600 border-transparent": categoryFilter !== 'Food'}
                            )}
                        >
                            Food
                        </button>

                        <button
                            onClick={() => handleCategoryClick('Environment')}
                            className={clsx("category_button",
                                {"bg-[#286A6C] text-white border-[#286A6C]": categoryFilter === 'Environment',"bg-gray-100 text-gray-600 border-transparent": categoryFilter !== 'Environment'}
                            )}
                        >
                            Environment
                        </button>
                    </div>

                    <div ref={listRef} className="w-full flex-1 overflow-y-auto flex flex-col gap-4">
                        {!active ? (
                            <p className="text-center text-gray-400 my-auto text-lg font-medium">Click a city map location to start exploration.</p>
                        ) : displayedCards.length === 0 ? (
                            <p className="text-center text-gray-400 my-auto text-lg font-medium">No opportunities here yet — try another city or category.</p>
                        ) : (
                            displayedCards.map((card) => (
                                <div key={card.id} className="resource-card opacity-0 w-full min-h-[45%] bg-[#D8EAE8] p-5 rounded-2xl shrink-0 shadow-sm">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">{card.tag || "General"}</span>
                                    <h4 className="text-2xl font-bold text-[#286A6C] mt-0.5">{card.title}</h4>
                                    <p className="text-gray-6xl mt-2 font-medium leading-relaxed">{card.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-start w-full mt-16">
                <div className="flex items-center">
                <button className="bg-[#286A6C] text-3xl text-white rounded-2xl py-4 px-8">
                    Find Your Match
                </button>
                <p className="mx-8 text-3xl">or</p>
                <button className="text-3xl rounded-2xl py-4 px-8 bg-transparent border border-2 border-[#286A6C] text-[#286A6C]">
                    Submit New Resources
                </button>
                </div>
            </div>
        </section>
    );
};

export default Location;