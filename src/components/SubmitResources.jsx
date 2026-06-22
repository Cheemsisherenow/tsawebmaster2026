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
  "w-full bg-white text-gray-800 text-sm rounded-md px-4 py-3 border placeholder:text-gray-400 focus:outline-none focus:ring-2 transition";
const okBorder = "border-gray-200 focus:border-[#286A6C] focus:ring-[#286A6C]/30";
const errBorder = "border-red-400 focus:ring-red-200";
const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

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
      <main className="w-full px-4 sm:w-[92vw] sm:mx-[4vw] mt-20 sm:mt-[18vh]">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center max-w-2xl">
          <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Got it! Thanks for contributing.</h3>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto mb-6">
            We'll review your submission and add it to the hub within 48 hours. You're helping make Gwinnett better.
          </p>
          <button
            onClick={submitAnother}
            className="inline-flex items-center justify-center gap-2 bg-[#286A6C] hover:bg-[#1F5557] text-white font-semibold rounded-lg px-6 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#286A6C] text-sm sm:text-base"
          >
            Submit another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-4 sm:w-[92vw] sm:mx-[4vw] mt-20 pt-[5vh]">
      <div className="max-w-full text-start mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
          Know a Resource We're Missing?
        </h1>
        <p className="text-gray-500 max-w-2xl text-start text-sm sm:text-base">
          Submit it here and we'll review it within 48 hours. Help us keep the hub complete.
        </p>
      </div>

      {/* Review Process */}
      <section ref={root} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-12 border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8">Review process</h2>
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-2">
          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1;
            return (
              <div key={s.title} className="rp-step flex-1 flex flex-col w-full sm:w-auto">
                <div className="flex items-center">
                  <div
                    className="rp-circle flex items-center justify-center h-9 w-9 rounded-full text-white font-bold text-sm shrink-0 shadow-sm"
                    style={{ backgroundColor: "#286A6C" }}
                  >
                    {i + 1}
                  </div>
                  {!last && (
                    <div className="hidden sm:flex flex-1 items-center px-2">
                      <div className="rp-shaft h-0.5 flex-1 origin-left rounded-full" style={{ backgroundColor: "#286A6C", opacity: 0.55 }} />
                      <svg className="rp-head h-4 w-4 -ml-0.5" style={{ color: "#286A6C" }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="rp-content pt-3 pl-4 sm:pl-0 sm:pr-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Form and Criteria Container */}
      <section className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-[20px]">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full lg:min-w-[65%] flex items-center justify-center border border-gray-200">
          <form className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
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

            <div className="flex flex-col sm:flex-row gap-6">
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

            <div className="flex flex-col sm:flex-row gap-6">
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

            <Field
              label="Phone Number" type="tel" placeholder="(770) 000-0000"
              value={form.phone} onChange={update("phone")}
            />

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

            <div className="flex flex-col sm:flex-row gap-6">
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
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#286A6C] hover:bg-[#1F5557] text-white font-semibold rounded-lg px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#286A6C]/40 text-sm sm:text-base"
            >
              Submit Resource →
            </button>
          </form>
        </div>

        {/* Criteria Sidebar */}
        <aside className="bg-gray-50 rounded-2xl shadow-lg p-6 sm:p-8 w-full lg:flex-grow border border-gray-200 ">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">Our Criteria</h2>
          <p className="text-gray-600 text-xs sm:text-sm border-b border-gray-200 pb-4 mb-6">
            What we look for
          </p>
          <div className="flex flex-col gap-6">
            {CRITERIA.map((criteria, index) => (
              <div key={criteria.title}>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  {index + 1}. {criteria.title}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {criteria.desc}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Field({ label, required, error, type = "text", placeholder, value, onChange }) {
  return (
    <div className="flex flex-col flex-1">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
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