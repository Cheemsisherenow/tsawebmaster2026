import { useState } from "react";
import emailjs from "@emailjs/browser";
const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';
/**
 * SubmitResource — "Know a Resource We're Missing?" form.
 *
 * Self-contained: all styling via inline styles + one injected <style> block,
 * so it renders identically with or without Tailwind. No external CSS/config.
 *
 * Same behavior/fields as the original Submit a Resource page: org name +
 * category required, website/phone optional, address + description required,
 * optional submitter name/email, client-side required validation, and a
 * success panel with "Submit Another".
 *
 * Palette (matches Discover)
 *   forest #1F3D2B · moss #2F6B4F · clay #C2603A · cream #F7F1E3
 *   sand #EADFC6 · paper #FFFDF6
 */

const C = {
  forest: "#1F3D2B",
  moss: "#2F6B4F",
  mossDark: "#255840",
  clay: "#C2603A",
  cream: "#F7F1E3",
  sand: "#EADFC6",
  paper: "#FFFDF6",
};

const CATEGORIES = [
  "Food",
  "Education",
  "Environment",
  "Housing",
  "Health",
  "Youth",
  "Seniors",
  "Other",
];

const EMPTY = {
  org: "",
  category: "",
  website: "",
  phone: "",
  address: "",
  description: "",
  name: "",
  email: "",
  title: "",        // added field
  imageUrl: "",     // added field
};

const STYLE_ID = "submit-resource-styles";
const CSS = `


.sbr-root *{box-sizing:border-box;}
/* Respect a top nav if present. Consumers can set --topbar-height (px) on :root. */
/* Make the root transparent so overscroll shows the site/nav background instead of the component cream.
   Keep a small offset so fixed nav doesn't overlap content. */
.sbr-root{position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
background:transparent;color:${C.forest};-webkit-font-smoothing:antialiased;
  /* slightly smaller top padding and explicit extra so overscroll shows site bg */
  padding-top:calc(var(--topbar-height, 88px) + 0.5rem);
  min-height:calc(100vh - var(--topbar-height, 88px));
  padding-bottom:6rem;z-index:0;}
/* header participates in normal flow and gets a gentle internal padding */
.sbr-top{position:relative;max-width:100%;margin:0 auto;padding:1.25rem 1.5rem .9rem;text-align:center;z-index:0;}
/* tighten label and heading spacing so header doesn't become too tall */
.sbr-label{display:inline-flex;align-items:center;gap:.5rem;border:1px solid rgba(31,61,43,.15);
  background:${C.sand};color:${C.moss};border-radius:999px;padding:.25rem .9rem;
  font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.18em;}
.sbr-top h1{margin:.6rem 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:900;
  font-size:clamp(2rem,6.5vw,3rem);line-height:1.06;letter-spacing:-.02em;}
.sbr-top p{max-width:48rem;margin:.5rem auto 0;font-size:15px;line-height:1.5;
  color:rgba(31,61,43,.7);}

/* give the form wrapper breathing room so it doesn't feel squished under the title */
.sbr-wrap{max-width:640px;margin:2.25rem auto 0;padding:0 1.75rem;} /* increased top margin */
/* keep rest of styles unchanged */
.sbr-form{border:3px solid ${C.sand};background:${C.paper};border-radius:26px;
  padding:1.5rem;box-shadow:0 18px 40px -12px rgba(31,61,43,.25);
  display:flex;flex-direction:column;gap:1rem;}
.sbr-row{display:flex;gap:1.25rem;}
.sbr-row .sbr-group{flex:1;}
@media (max-width:540px){.sbr-row{flex-direction:column;}}
.sbr-group{display:flex;flex-direction:column;gap:.4rem;}
.sbr-group label{font-size:13px;font-weight:700;letter-spacing:.01em;}
.sbr-group .req{color:${C.clay};}
.sbr-input,.sbr-select,.sbr-textarea{width:100%;border:2px solid ${C.sand};
  background:${C.cream};color:${C.forest};border-radius:12px;padding:.65rem .85rem;
  font-size:15px;font-family:inherit;transition:border-color .15s,box-shadow .15s;}
.sbr-select{appearance:none;padding-right:2.5rem;}
.sbr-textarea{resize:vertical;min-height:120px;line-height:1.5;}
.sbr-input::placeholder,.sbr-textarea::placeholder{color:rgba(31,61,43,.4);}
.sbr-input:focus,.sbr-select:focus,.sbr-textarea:focus{outline:none;
  border-color:${C.moss};box-shadow:0 0 0 3px rgba(47,107,79,.12);}
.sbr-input.invalid,.sbr-select.invalid,.sbr-textarea.invalid{border-color:${C.clay};
  box-shadow:0 0 0 3px rgba(194,96,58,.12);}
.sbr-err{font-size:12px;font-weight:600;color:${C.clay};}

.sbr-submit{margin-top:.25rem;align-self:flex-start;border:none;border-radius:12px;
  background:${C.moss};color:${C.cream};padding:.75rem 1.5rem;font-size:15px;
  font-weight:800;cursor:pointer;transition:background .2s,transform .15s;
  box-shadow:0 2px 8px rgba(31,61,43,.18);}
.sbr-submit:hover{background:${C.mossDark};transform:translateY(-1px);}
.sbr-submit:focus-visible{outline:2px solid ${C.forest};outline-offset:2px;}

.sbr-success{border:3px solid ${C.sand};background:${C.paper};border-radius:26px;
  padding:3rem 1.5rem;text-align:center;box-shadow:0 18px 40px -12px rgba(31,61,43,.25);}
.sbr-success .icon{font-size:3.5rem;}
.sbr-success h3{margin:1rem 0 0;font-family:Georgia,serif;font-weight:900;font-size:1.75rem;}
.sbr-success p{max-width:28rem;margin:.75rem auto 0;font-size:16px;line-height:1.6;
  color:rgba(31,61,43,.7);}
.sbr-again{margin-top:2rem;border:none;border-radius:12px;background:${C.moss};
  color:${C.cream};padding:.75rem 1.6rem;font-size:14px;font-weight:700;cursor:pointer;
  transition:background .2s;}
.sbr-again:hover{background:${C.mossDark};}
.sbr-again:focus-visible{outline:2px solid ${C.forest};outline-offset:2px;}
`;

function useInjectedStyles() {
  if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }
}

// Fields that are required (matches the original asterisked fields).
const REQUIRED = ["org", "category", "address", "description"];

export default function Submit_Resources({ onSubmit }) {
  useInjectedStyles();

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
    const API_BASE = 'https://volunteer-api-x37c.onrender.com';

// Map form fields -> DB columns, then URL-encode each
const params = new URLSearchParams({
    title:       form.title,
    org:         form.org,
    description: form.description,
    img_url:     form.imageUrl,

    location:    form.address,
    tag:         form.category,
});

const approveLink = `${API_BASE}/api/add?${params.toString()}`;
console.log("approveLink:", approveLink);
  try {
    await emailjs.send(
    "service_1d0iguh",
    "template_43ja1d8",
    {
        org: form.org,
        category: form.category,
        website: form.website,
        phone: form.phone,
        address: form.address,
        description: form.description,
        name: form.name,
        email: form.email,
        title: form.title,
        imageUrl: form.imageUrl,
        approveLink,          // <-- new
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

  if (submitted) {
    return (
      <div className="sbr-root">
        <div className="sbr-wrap">
          <div className="sbr-success">
            <div className="icon">✅</div>
            <h3>Got it! Thanks for contributing.</h3>
            <p>
              We&apos;ll review your submission and add it to the hub within 48
              hours. You&apos;re helping make Gwinnett better.
            </p>
            <button className="sbr-again" onClick={submitAnother}>
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sbr-root">
      <header className="sbr-top">
        <span className="sbr-label">➕ Add a resource</span>
        <h1>Know a Resource We&apos;re Missing?</h1>
        <p>
          Submit it here and we&apos;ll review it within 48 hours. Help us keep
          the hub complete.
        </p>
      </header>

      <div className="sbr-wrap">
        <div className="sbr-form">
          <div className="sbr-row">
            <Field
              label="Organization Name"
              required
              error={errors.org}
              placeholder="e.g. Gwinnett County Food Bank"
              value={form.org}
              onChange={update("org")}
            />
            <div className="sbr-group">
              <label>
                Category <span className="req">*</span>
              </label>
              <select
                className={`sbr-select${errors.category ? " invalid" : ""}`}
                value={form.category}
                onChange={update("category")}
              >
                <option value="">Choose a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="sbr-err">{errors.category}</span>
              )}
            </div>
          </div>

          {/* New row: Title + Relevant Image URL */}
          <div className="sbr-row">
            <Field
              label="Title"
              placeholder="Short title or headline for this listing"
              value={form.title}
              onChange={update("title")}
            />
            <Field
              label="Relevant Image URL"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={update("imageUrl")}
            />
          </div>

          <div className="sbr-row">
            <Field
              label="Website"
              type="url"
              placeholder="https://..."
              value={form.website}
              onChange={update("website")}
            />
            <Field
              label="Phone Number"
              type="tel"
              placeholder="(770) 000-0000"
              value={form.phone}
              onChange={update("phone")}
            />
          </div>

          <Field
            label="Address / Location"
            required
            error={errors.address}
            placeholder="City, GA or full address"
            value={form.address}
            onChange={update("address")}
          />

          <div className="sbr-group">
            <label>
              Describe what this organization does{" "}
              <span className="req">*</span>
            </label>
            <textarea
              className={`sbr-textarea${
                errors.description ? " invalid" : ""
              }`}
              rows={5}
              placeholder="What services do they provide? Who do they help? What can volunteers expect?"
              value={form.description}
              onChange={update("description")}
            />
            {errors.description && (
              <span className="sbr-err">{errors.description}</span>
            )}
          </div>

          <div className="sbr-row">
            <Field
              label="Your Name"
              placeholder="So we can credit you"
              value={form.name}
              onChange={update("name")}
            />
            <Field
              label="Your Email"
              type="email"
              placeholder="In case we have questions"
              value={form.email}
              onChange={update("email")}
            />
          </div>

          <button
            type="button"
            className="sbr-submit"
            onClick={handleSubmit}
          >
            Submit Resource →
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="sbr-group">
      <label>
        {label} {required && <span className="req">*</span>}
      </label>
      <input
        className={`sbr-input${error ? " invalid" : ""}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error && <span className="sbr-err">{error}</span>}
    </div>
  );
}