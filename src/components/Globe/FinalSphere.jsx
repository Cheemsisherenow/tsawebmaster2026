import Sphere from "./Sphere";
import React, { useRef, useState, useEffect } from 'react';
import { pageNavigation } from "../../store";
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import clsx from "clsx";

const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';

const formatDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const FinalSphere = () => {
    const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage);
    const setSelectedOpportunityId = pageNavigation((state) => state.setSelectedOpportunityId);
  
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hovered, setHovered] = useState(null);
    const [selected, setSelected] = useState(null);
    const panelRef = useRef(null);

  useEffect(() => {
    const MIN_MS = 800;
    const start = Date.now();
    fetch(API_URL)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(async (data) => {
        const wait = MIN_MS - (Date.now() - start);
        if (wait > 0) await new Promise((res) => setTimeout(res, wait));
        setResources(data);
        setIsLoading(false);
      })
      .catch((err) => { console.error('Failed to fetch opportunities:', err); setIsLoading(false); });
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : 'unset';
    const onKey = (e) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    if (selected && panelRef.current) {
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
    }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = 'unset'; };
  }, [selected]);

  const openInHub = () => {
    if (!selected) return;
    setSelectedOpportunityId(selected.id);   // remember which card to open
    setSelected(null);                        // close the sphere overlay
    changeCurrentPage("Resource Hub");        // switch pages
  };

  return (
    <div className="sphere">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1} />
        <Sphere resources={resources} onHover={setHovered} onSelect={setSelected} />
      </Canvas>

      <div className={clsx('title', { 'opacity-100': hovered && !selected, 'opacity-0': !hovered || selected })}>
        {hovered ?? ''}
      </div>

      {/* loading animation */}
      {isLoading && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-[#FBFBF6]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-[#286A6C]/20 border-t-[#286A6C] animate-spin" />
            <p className="text-[#286A6C] font-semibold tracking-wide">Loading resources…</p>
          </div>
        </div>
      )}

      {/* fullscreen expanded card */}
      {selected && (
        <div ref={panelRef} className="fixed inset-0 z-50 overflow-y-auto bg-[#FBFBF6]">
          <button
            onClick={() => setSelected(null)}
            className="fixed top-5 right-5 z-50 p-2.5 bg-[#286A6C] hover:bg-[#1f5456] text-white rounded-full shadow-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={selected.img_url}
            alt={selected.title}
            className="w-full h-[45vh] object-cover"
            onError={(e) => (e.target.src = 'https://placehold.co/1200x600/e2e8f0/475569?text=Image+Not+Found')}
          />

          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight flex-1">{selected.title}</h1>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 uppercase tracking-wide">
                {selected.tag}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 py-6 border-y border-gray-200 mb-8 bg-[#F7F8F3] rounded-lg px-6">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Organization</div>
                <div className="font-semibold text-gray-900">{selected.org}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</div>
                <div className="font-semibold text-[#286A6C]">{formatDate(selected.event_date) || 'Flexible'}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
                <div className="font-semibold text-gray-900">{selected.location}</div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3">About this opportunity</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg mb-10">{selected.description}</p>

            <button
              onClick={openInHub}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#286A6C] hover:bg-[#1f5456] text-white font-semibold shadow-md transition-colors"
            >
              Open in Resource Hub
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalSphere;