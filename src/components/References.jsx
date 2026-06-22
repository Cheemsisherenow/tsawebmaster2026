import React from 'react';
import { useMediaQuery } from 'react-responsive';

// Put your PDFs in the project's /public folder and reference them with a leading slash.
// e.g. public/pdfs/volunteer-handbook.pdf  ->  url: '/pdfs/volunteer-handbook.pdf'
const references = [
  {
    title: 'Volunteer Handbook',
    description: 'Everything you need to know before getting started in the community.',
    url: '/pdfs/volunteer-handbook.pdf',
  },
  {
    title: 'Resource Directory',
    description: 'A full directory of partner organizations across Gwinnett County.',
    url: '/pdfs/resource-directory.pdf',
  },
  {
    title: 'Community Impact Report',
    description: 'Our latest report on local volunteer impact and outcomes.',
    url: '/pdfs/community-impact-report.pdf',
  },
];

const PdfIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6M9 17h6M9 9h1" />
  </svg>
);

const Reference = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <section id="reference" className="mx-[4vw] mt-[14vh] max-w-[92vw] md:mt-[18vh]">
      <div className="mb-8 text-center md:mb-10">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:mb-4 md:text-7xl">References</h1>
        <p className="text-base text-gray-600 md:text-2xl">View our guides and reports — tap any one to open it in a new tab.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-16 md:grid-cols-3 md:gap-8">
        {references.map((ref) => (
          <a
            key={ref.title}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#286A6C] bg-[#F7F8F3] shadow-[4px_4px_6px_rgba(0,0,0,.1)] transition-all hover:-translate-y-1 hover:ring-4 hover:ring-[#286A6C]/40"
          >
            <div className="relative h-64 w-full overflow-hidden border-b border-[#D4D3D3] bg-white">
              {isMobile ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#D8EAE8] text-[#286A6C]">
                  <PdfIcon />
                  <span className="text-sm font-semibold">Tap to open PDF</span>
                </div>
              ) : (
                <>
                  <iframe
                    src={`${ref.url}#toolbar=0&navpanes=0&view=FitH`}
                    title={ref.title}
                    className="pointer-events-none h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#286A6C]/0 opacity-0 transition-all duration-300 group-hover:bg-[#286A6C]/40 group-hover:opacity-100">
                    <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#286A6C] shadow">Open PDF ↗</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="text-lg font-bold text-gray-900">{ref.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{ref.description}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-[#286A6C]">
                Open in new tab ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Reference;