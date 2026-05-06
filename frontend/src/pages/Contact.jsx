import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Check, Loader } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Contact.css';

// ── EmailJS credentials (VITE ENV) ─────────────────────
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
// ───────────────────────────────────────────────────────

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [status, setStatus] = useState('idle');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('sending');
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject,
          message:    form.message,
        },
        PUBLIC_KEY
      );
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <main className="contact page-enter">

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1423807634016-5b4529327cc8?w=1400&q=80"
            alt="Contact"
          />
          <div className="page-hero__overlay" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Reach Us</p>
          <h1 className="page-hero__title">Get in Touch</h1>
        </div>
      </div>

      <div className="contact__body container">
        <div className="contact__grid">

          {/* Info */}
          <div className="contact__info">
            <p className="section-label">Contact Details</p>
            <h2 className="contact__heading">We'd Love to Hear From You</h2>
            <div className="gold-line-left" style={{ margin: '20px 0 28px' }}></div>
            <p className="contact__intro">
              Whether you have a question about a product, need help with an order, or simply wish
              to share your experience — our team is here to assist you with warmth and care.
            </p>

            <div className="contact__details">
              {[
                { icon: <Mail size={18} />,  label: "Email",            value: "support@zarvenza.in" },
                { icon: <Phone size={18} />, label: "WhatsApp Support", value: "+91 77018 58673" },
                { icon: <MapPin size={18} />,label: "Address",          value: "Sarita Vihar, New Delhi – 110076" },
                { icon: <Clock size={18} />, label: "Hours",            value: "Mon – Sat: 10 AM – 07:00 PM IST" },
              ].map((d, i) => (
                <div key={i} className="contact__detail">
                  <div className="contact__detail-icon">{d.icon}</div>
                  <div>
                    <p className="contact__detail-label">{d.label}</p>
                    <p className="contact__detail-value">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact__note">
              <p className="section-label" style={{ marginBottom: '10px' }}>Response Time</p>
              <p>We aim to respond to all enquiries within 24–48 hours. For urgent order matters,
                please include your order number in the subject line.</p>
            </div>
          </div>

          {/* Form */}
          <div className="contact__form-wrap">

            {/* Success */}
            {status === 'sent' && (
              <div className="contact__success">
                <div className="contact__success-icon"><Check size={32} /></div>
                <h3>Message Sent</h3>
                <p>Thank you for reaching out. We'll be in touch within 24–48 hours.</p>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="contact__error">
                <p>Something went wrong. Please try again or email us directly at{' '}
                  <strong>support@zarvenza.in</strong>
                </p>
              </div>
            )}

            {/* Form */}
            {(status === 'idle' || status === 'sending') && (
              <form className="contact__form" onSubmit={handleSubmit}>
                <h3 className="contact__form-title">Send a Message</h3>

                <div className="contact__form-row">
                  <div className="contact__field">
                    <label>Full Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      disabled={status === 'sending'}
                    />
                  </div>
                  <div className="contact__field">
                    <label>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      disabled={status === 'sending'}
                    />
                  </div>
                </div>

                <div className="contact__field">
                  <label>Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    disabled={status === 'sending'}
                  />
                </div>

                <div className="contact__field">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={6}
                    required
                    disabled={status === 'sending'}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    opacity: status === 'sending' ? 0.7 : 1
                  }}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <><Loader size={16} className="spin" /><span>Sending…</span></>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}