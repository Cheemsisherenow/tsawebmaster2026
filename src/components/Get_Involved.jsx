import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const REQUIRED = ["name", "email", "reason"];

export default function Get_Involved() {
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { value: "volunteer", label: "I want to volunteer" },
    { value: "partner", label: "I want to partner" },
    { value: "feedback", label: "I have feedback" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    for (const k of REQUIRED) {
      if (!form[k].trim()) next[k] = "This field is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await emailjs.send(
        "service_1d0iguh",
        "template_u84796c",
        {
          name: form.name,
          email: form.email,
          reason: form.reason,
          message: form.message,
        },
        "ZjMpFzBaeqBM-ZXP0"
      );
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Sorry, something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrors({});
    setForm({ name: "", email: "", reason: "", message: "" });
  };

  const fieldClass = (key) =>
    `w-full rounded-md px-4 py-3 text-sm border focus:outline-none focus:ring-2 transition ${
      errors[key]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-[#286A6C] focus:ring-[#286A6C]/30"
    }`;

  return (
    <main className="w-full px-4 sm:w-[92vw] sm:mx-[4vw] mt-20 pt-[5vh]">
      <div className="max-w-full text-start">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
          Ready to Make a Difference?
        </h1>
        <p className="text-gray-500 max-w-2xl text-start text-sm sm:text-base">
          Whether you want to volunteer, partner with us, or say hi, we would love to receive feedback from you!
        </p>
      </div>

      <section className="flex flex-col lg:flex-row w-full py-8 sm:py-12 gap-6 sm:gap-8 justify-between">
        {/* Left: Contact Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full lg:min-w-[65%] flex items-center justify-center">
          {submitted ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Submitted!</h3>
                <p className="text-gray-600 text-sm sm:text-base">Thanks for reaching out. We'll be in touch soon!</p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 bg-[#286A6C] hover:bg-[#1F5557] text-white font-semibold rounded-lg px-6 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#286A6C] disabled:opacity-60 text-sm sm:text-base"
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What should we call you? <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={fieldClass("name")}
                />
                {errors.name && <span className="block text-xs font-medium text-red-500 mt-1.5">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Where can we reach you? <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  type="email"
                  className={fieldClass("email")}
                />
                {errors.email && <span className="block text-xs font-medium text-red-500 mt-1.5">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What brings you here? <span className="text-red-500">*</span>
                </label>
                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className={`${fieldClass("reason")} bg-white`}
                >
                  <option value="">Choose a category...</option>
                  {reasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {errors.reason && <span className="block text-xs font-medium text-red-500 mt-1.5">{errors.reason}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what's up..."
                  rows={5}
                  className={fieldClass("message")}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#286A6C] hover:bg-[#1F5557] text-white font-semibold rounded-lg px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#286A6C]/40 disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send It →"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: FAQ Card */}
        <aside className="bg-gray-50 rounded-2xl shadow-inner p-6 sm:p-8 w-full lg:flex-grow">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4">Quick FAQs</h2>

          <dl className="divide-y divide-gray-200 text-xs sm:text-sm text-gray-600">
            <div className="py-4">
              <dt className="font-semibold text-gray-800">Is this free?</dt>
              <dd className="mt-1">Yep. Always will be.</dd>
            </div>

            <div className="py-4">
              <dt className="font-semibold text-gray-800">Do I need to commit long-term?</dt>
              <dd className="mt-1">Nope. One-time events are totally fine.</dd>
            </div>

            <div className="py-4">
              <dt className="font-semibold text-gray-800">Can I bring friends?</dt>
              <dd className="mt-1">Please do! Most events love groups.</dd>
            </div>

            <div className="py-4">
              <dt className="font-semibold text-gray-800">How do I add my org?</dt>
              <dd className="mt-1">Use the "Submit a Resource" tab — it takes 2 minutes.</dd>
            </div>
          </dl>

          <div className="mt-6 text-xs sm:text-sm text-gray-500">
            <div>hello@volunteergwinnett.org</div>
            <div className="mt-2 font-medium text-gray-700">Gwinnett County, GA</div>
            <div className="mt-1">Mon–Fri, 9am–5pm EST</div>
          </div>
        </aside>
      </section>
    </main>
  );
}