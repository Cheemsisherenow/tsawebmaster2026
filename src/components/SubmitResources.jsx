import { useState, useRef, useLayoutEffect } from "react";
import emailjs from "@emailjs/browser";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ["Food", "Education", "Environment", "Housing", "Health", "Youth", "Seniors", "Other"];
const TYPE_OPTIONS = ["Nonprofit/Volunteer", "Community/Support Service", "Community Event"];

const EMPTY = {
  org: "", category: "", website: "", phone: "", address: "",
  description: "", name: "", email: "", title: "", imageUrl: "", type: "",
};

const STEPS = [
  { title: 'Submission received', desc: 'We log your suggestion and confirm receipt.' },
  { title: 'Initial check', desc: 'We verify the org serves Gwinnett County and meets our criteria.' },
  { title: 'Verification', desc: 'We confirm details via website, public registries, or direct contact.' },
  { title: 'Goes live', desc: 'Approved listings appear in the directory within a few business days.' },
];

const CRITERIA = [
    { title: "Serves Gwinnett County", desc: "The resource must actually serve the residents in the area." },
    { title: "Legitimate and Still Active", desc: "The resource must be a real and currently operated organization." },
    { title: "Free and Accessible", desc: "The services are either free or low-cost, so they're actually avaliable for the people." },
    { title: "Verifiable Contact Information", desc: "The resource must have either a working phone, website, or address so people can actually connect and explore them." },
    { title: "Fits a Resource and Type Category", desc: "The resource provides and fits under a clear community role that maps to one of the categories (Food, Education, Environment, Housing, Health, Youth, Seniors, Other) and type (Nonprofit/Volunteer, Community/Support Service, Community Event)." },
]

const REQUIRED = ["org", "category", "address", "description"];

// shared field styling
const baseField =
  "w-full bg-white text-gray-800 text-sm rounded-lg px-4 py-2.5 border placeholder:text-gray-400 focus:outline-none focus:ring-2 transition";
const okBorder = "border-[#D4D3D3] focus:border-[#286A6C] focus:ring-[#286A6C]/30";
const errBorder = "border-red-400 focus:ring-red-200";
const labelClass = "block text-sm font-semibold text-[#286A6C] uppercase tracking-wide mb-1.5";

const Chevron = () => (
  <svg
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function Submit_Resources() {
  const root = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    for (const k of REQUIRED) {
      if (!form[k].trim()) next[k] = "This field is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const API_BASE = "https://volunteer-api-x37c.onrender.com";
    const params = new URLSearchParams({
      title: form.title,
      org: form.org,
      description: form.description,
      img_url: form.imageUrl,
      location: form.address,
      tag: form.category,
      link: form.website,
      type: form.type,
    });
    const approveLink = `${API_BASE}/api/add?${params.toString()}`;
    console.log("approveLink:", approveLink);

    try {
      await emailjs.send(
        "service_1d0iguh",
        "template_43ja1d8",
        {
          org: form.org, category: form.category, website: form.website,
          phone: form.phone, address: form.address, description: form.description,
          name: form.name, email: form.email, title: form.title,
          imageUrl: form.imageUrl, type: form.type, approveLink,
        },
        "ZjMpFzBaeqBM-ZXP0"
      );
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to send submission.");
    }
  };

  const submitAnother = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitted(false);
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // one master timeline so each step + arrow plays one after another
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 75%' } });

      gsap.utils.toArray('.rp-step').forEach((step) => {
        const circle = step.querySelector('.rp-circle');
        const content = step.querySelector('.rp-content');
        const shaft = step.querySelector('.rp-shaft');
        const head = step.querySelector('.rp-head');

        tl.from(circle, { scale: 0, opacity: 0, duration: 0.35, ease: 'back.out(1.7)' })
          .from(content, { y: 16, opacity: 0, duration: 0.35 }, '-=0.15');
        if (shaft) {
          tl.from(shaft, { scaleX: 0, transformOrigin: 'left center', duration: 0.4, ease: 'power2.out' })
            .from(head, { opacity: 0, x: -8, duration: 0.25, ease: 'power2.out' }, '-=0.1');
        }
      });
    }, root);
    return () => ctx.revert();
  }, []);

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto pt-[18vh] pb-24 px-4">
        <div className="bg-[#F7F8F3] border border-[#D4D3D3] rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,.2)] p-10 sm:p-12 text-center">
          <div className="text-6xl">✅</div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">Got it! Thanks for contributing.</h3>
          <p className="text-gray-600 max-w-md mx-auto mt-3 leading-relaxed">
            We'll review your submission and add it to the hub within 48 hours. You're helping make Gwinnett better.
          </p>
          <button
            onClick={submitAnother}
            className="mt-8 bg-[#286A6C] hover:bg-[#1f5456] text-white font-semibold rounded-lg px-6 py-3 transition-colors"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[92%] mx-[4vw] pt-[18vh] pb-24 px-4">
      <div className="text-start mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-4 mb-3 leading-tight">
          Know a Resource We're Missing?
        </h1>
        <p className="text-gray-600 text-lg max-w-xl leading-relaxed">
          Submit it here and we'll review it within 48 hours. Help us keep the hub complete.
        </p>
      </div>

      {/* horizontal review process — moved to the top */}
      <div ref={root} className="w-full mb-8 border p-8 rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,.2)] border-[#D4D3D3]">
        <h2 className="font-serif text-4xl font-bold text-gray-900 mb-10">Review process</h2>
        <div className="flex items-start">
          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1;
            return (
              <div key={s.title} className="rp-step flex-1 flex flex-col">
                <div className="flex items-center">
                  <div
                    className="rp-circle flex items-center justify-center h-9 w-9 rounded-full text-white font-bold text-sm shrink-0 shadow"
                    style={{ backgroundColor: "#286A6C" }}
                  >
                    {i + 1}
                  </div>
                  {!last && (
                    <div className="flex-1 flex items-center px-2">
                      <div className="rp-shaft h-0.5 flex-1 origin-left rounded-full" style={{ backgroundColor: "#286A6C", opacity: 0.55 }} />
                      <svg className="rp-head h-4 w-4 -ml-0.5" style={{ color: "#286A6C" }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="rp-content pt-4 pr-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-[2.5%]">
        <div className="bg-[#F7F8F3] w-[70%] border border-[#D4D3D3] rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,.2)] p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <Field
              label="Organization Name" required error={errors.org}
              placeholder="e.g. Gwinnett County Food Bank"
              value={form.org} onChange={update("org")}
            />
            <div className="flex flex-col flex-1">
              <label className={labelClass}>Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  className={`${baseField} appearance-none pr-10 cursor-pointer ${errors.category ? errBorder : okBorder}`}
                  value={form.category} onChange={update("category")}
                >
                  <option value="">Choose a category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Chevron />
              </div>
              {errors.category && <span className="text-xs font-medium text-red-500 mt-1.5">{errors.category}</span>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <Field
              label="Title"
              placeholder="Short title or headline for this listing"
              value={form.title} onChange={update("title")}
            />
            <Field
              label="Relevant Image URL" type="url"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl} onChange={update("imageUrl")}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col flex-1">
              <label className={labelClass}>Type</label>
              <div className="relative">
                <select
                  className={`${baseField} appearance-none pr-10 cursor-pointer ${okBorder}`}
                  value={form.type} onChange={update("type")}
                >
                  <option value="">Choose a type...</option>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
            <Field
              label="Website" type="url" placeholder="https://..."
              value={form.website} onChange={update("website")}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <Field
              label="Phone Number" type="tel" placeholder="(770) 000-0000"
              value={form.phone} onChange={update("phone")}
            />
          </div>

          <Field
            label="Address / Location" required error={errors.address}
            placeholder="City, GA or full address"
            value={form.address} onChange={update("address")}
          />

          <div className="flex flex-col">
            <label className={labelClass}>Describe what this organization does <span className="text-red-500">*</span></label>
            <textarea
              rows={5}
              className={`${baseField} resize-y min-h-32 leading-relaxed ${errors.description ? errBorder : okBorder}`}
              placeholder="What services do they provide? Who do they help? What can volunteers expect?"
              value={form.description} onChange={update("description")}
            />
            {errors.description && <span className="text-xs font-medium text-red-500 mt-1.5">{errors.description}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <Field
              label="Your Name" placeholder="So we can credit you"
              value={form.name} onChange={update("name")}
            />
            <Field
              label="Your Email" type="email" placeholder="In case we have questions"
              value={form.email} onChange={update("email")}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="self-start mt-1 inline-flex items-center gap-2 bg-[#286A6C] hover:bg-[#1f5456] text-white font-semibold rounded-lg px-6 py-3 shadow-md transition-all hover:-translate-y-0.5"
          >
            Submit Resource →
          </button>
        </div>

        {/* empty space on the side, preserved */}
        <div className="w-[27.5%] flex flex-col gap-2 rounded-2xl border rounded-2xl border-[#D4D3D3] shadow-[4px_4px_8px_rgba(0,0,0,.2)] p-8" >
            <div>
                <p className="text-4xl">
                    Our Criteria
                </p>
                <p className="border-b pb-2">
                    blah blah blah
                </p>
            </div>
            <div className="flex flex-col gap-4">
                {CRITERIA.map((criteria, index) => (
                    <div>
                        <p className="text-2xl">
                            {index+1}. {criteria.title}
                        </p>
                        <p className="text-md">
                            {criteria.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, error, type = "text", placeholder, value, onChange }) {
  return (
    <div className="flex flex-col flex-1">
      <label className="block text-sm font-semibold text-[#286A6C] uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        className={`${baseField} ${error ? errBorder : okBorder}`}
      />
      {error && <span className="text-xs font-medium text-red-500 mt-1.5">{error}</span>}
    </div>
  );
}