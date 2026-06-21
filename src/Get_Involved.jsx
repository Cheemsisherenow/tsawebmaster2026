import React, { useState } from "react";
import emailjs from "@emailjs/browser";
const C = {
  forest: "#1F3D2B",
  moss: "#2F6B4F",
  mossDark: "#255840",
  clay: "#C2603A",
  cream: "#F7F1E3",
  sand: "#EADFC6",
  paper: "#FFFDF6",
};
export default function Get_Involved() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: "volunteer",
    message: "",
  });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    setForm({ name: "", email: "", reason: "volunteer", message: "" });
  };

  return (
    <main className="w-full">
      <div className="max-w-100% mx-auto px-6 pt-35 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
          Ready to Make a Difference?
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Whether you want to volunteer, partner with us, or say hi, we would love to receive feedback from you!
        </p>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Contact Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
          {submitted ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Submitted!</h3>
                <p className="text-gray-600">Thanks for reaching out. We'll be in touch soon!</p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 bg-[#286A6C] hover:bg-[#1F5557] text-white font-semibold rounded-lg px-6 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#286A6C] disabled:opacity-60"
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What should we call you?
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Where can we reach you?
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  type="email"
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What brings you here?
                </label>
                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {reasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
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
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#286A6C] hover:bg-[#1F5557] text-white font-semibold rounded-lg px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send It →"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: FAQ Card */}
        <aside className="bg-gray-50 rounded-2xl shadow-inner p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Quick FAQs</h2>

          <dl className="divide-y divide-gray-200 text-sm text-gray-600">
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

          <div className="mt-6 text-sm text-gray-500">
            <div>hello@volunteergwinnett.org</div>
            <div className="mt-2 font-medium text-gray-700">Gwinnett County, GA</div>
            <div className="mt-1">Mon–Fri, 9am–5pm EST</div>
          </div>
        </aside>
      </section>
    </main>
  );
}
