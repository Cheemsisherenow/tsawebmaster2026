import { pageNavigation } from "../store";
import {React, useEffect} from "react";

const formatDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Saved_Resources() {
  const savedResources = pageNavigation((s) => s.savedResources);
  const markSavedSeen = pageNavigation((s)=>s.markSavedSeen);
  const removeSaved = pageNavigation((s) => s.removeSaved);
  const setSelectedOpportunityId = pageNavigation((s) => s.setSelectedOpportunityId);
  const changeCurrentPage = pageNavigation((s) => s.changeCurrentPage);

  const openInHub = (id) => {
    setSelectedOpportunityId(id);
    changeCurrentPage("Resource Hub");
  };

  useEffect(()=>{
    markSavedSeen()
  },[]);

  return (
    <section className="mt-[18vh] mx-[4vw] max-w-[92vw]">
      <div className="text-center mb-10">
        <h1 className="text-7xl font-bold text-gray-900 mb-4">Saved Resources</h1>
        <p className="text-gray-600 text-2xl">The opportunities you've bookmarked.</p>
      </div>

      {savedResources.length === 0 ? (
        <div className="text-center bg-white border border-gray-100 rounded-xl shadow-sm py-16 px-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No saved resources yet</h3>
          <p className="text-gray-600 mb-6">Tap the heart on any card in the hub to save it here.</p>
          <button
            onClick={() => changeCurrentPage("Resource Hub")}
            className="px-5 py-2.5 rounded-lg bg-[#286A6C] text-white font-medium hover:bg-[#1f5456] transition-colors"
          >
            Browse the hub
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-16">
          {savedResources.map((event) => (
            <div
              key={event.id}
              onClick={() => openInHub(event.id)}
              className="relative bg-[#F7F8F3] border border-[#286A6C] rounded-lg overflow-hidden shadow-[4px_4px_6px_rgba(0,0,0,.1)] cursor-pointer transition-all hover:-translate-y-1 hover:ring-4 hover:ring-[#286A6C]/40 flex flex-col"
            >
              <img
                src={event.img_url} alt={event.title}
                className="w-full h-40 object-cover"
                onError={(e) => (e.target.src = 'https://placehold.co/800x500/e2e8f0/475569?text=Image+Not+Found')}
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeSaved(event.id); }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 shadow hover:bg-white transition-colors"
                aria-label="Remove"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#286A6C" stroke="#286A6C" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">{event.title}</h2>
                  <span className="shrink-0 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 uppercase tracking-wide">
                    {event.tag}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800">{event.org}</div>
                <div className="text-sm text-gray-500 flex items-center justify-between">
                  <span>{event.location}</span>
                  <span className="font-medium text-[#286A6C]">{formatDate(event.event_date) || 'Flexible'}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}