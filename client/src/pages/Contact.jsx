import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import ScrollReveal from '../components/ScrollReveal';
import { Mail, Phone, MapPin, Send, Clock, ChevronDown } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Safari Booking Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { showToast } = useToast();

  const faqs = [
    {
      q: 'What is the best season to spot the Black Panther (Saya) in Kabini?',
      a: 'The dry summer months (February through May) offer the highest big cat sighting probabilities as leopards and black panthers frequent waterholes along the Kabini backwaters.',
    },
    {
      q: 'Do I need a separate camera permit fee for high-zoom lenses?',
      a: 'Personal DSLR/Mirrorless cameras with standard lenses are permitted. Heavy professional video rigs and cinema cameras require clearance at the forest gate counter.',
    },
    {
      q: 'Can children participate in open 4x4 gypsies and boat safaris?',
      a: 'Yes, children above 3 years are permitted with guardian supervision. Booster seating and child ear protection are available upon request.',
    },
    {
      q: 'What happens in case of heavy monsoon rains during our scheduled safari?',
      a: 'Safaris operate with waterproof gypsy hoods. In rare events of extreme weather alerts, dates can be rescheduled at no extra charge.',
    },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.submitContact(formData);
      if (res.success) {
        showToast(res.message || 'Inquiry sent! A representative will contact you shortly.', 'success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Safari Booking Inquiry',
          message: '',
        });
      }
    } catch (error) {
      showToast(error.message || 'Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page container section-padding">
      <div className="section-header text-left mb-5">
        <span className="section-eyebrow">
          <Phone size={16} />
          <span>HELP DESK & SUPPORT</span>
        </span>
        <h1 className="section-title">Get in Touch with Wild Tour</h1>
        <p className="section-subtitle">
          Have questions regarding safari permit quotas, luxury lodge reservations, or custom tour itineraries? Our team is at your service.
        </p>
      </div>

      <ScrollReveal className="contact-layout-grid mb-5">
        {/* Contact Info Sidebar */}
        <div className="white-card contact-info-card">
          <h3 className="card-title">Dammanakatte Range Office</h3>
          <p className="card-desc">
            Directly connected to the Kabini forest gate reception.
          </p>

          <div className="contact-items-list">
            <div className="contact-item-row">
              <div className="contact-icon-box"><MapPin size={20} className="text-forest-primary" /></div>
              <div>
                <span className="contact-item-label">Range Office Address</span>
                <p className="contact-item-val">Dammanakatte Forest Gate, Kabini Range, HD Kote, Karnataka 571114</p>
              </div>
            </div>

            <div className="contact-item-row">
              <div className="contact-icon-box"><Phone size={20} className="text-forest-primary" /></div>
              <div>
                <span className="contact-item-label">Helpline Numbers</span>
                <p className="contact-item-val">+91 94808 05000 / +91 821 248000</p>
              </div>
            </div>

            <div className="contact-item-row">
              <div className="contact-icon-box"><Mail size={20} className="text-forest-primary" /></div>
              <div>
                <span className="contact-item-label">Email Inquiries</span>
                <p className="contact-item-val">ranger@wildtour.karnataka.gov.in</p>
              </div>
            </div>

            <div className="contact-item-row">
              <div className="contact-icon-box"><Clock size={20} className="text-forest-primary" /></div>
              <div>
                <span className="contact-item-label">Gate Permit Timings</span>
                <p className="contact-item-val">05:30 AM - 09:30 AM & 03:00 PM - 06:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="white-card contact-form-card">
          <h3 className="card-title mb-1">Send an Inquiry</h3>
          <p className="card-desc mb-4">We typically respond within 2-4 hours during forest operating times.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="E.g., Priya Nair"
                  value={formData.name}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="modern-input"
                >
                  <option value="Safari Booking Inquiry">Safari Booking Inquiry</option>
                  <option value="Resort & Lodge Reservation">Resort & Lodge Reservation</option>
                  <option value="Custom Tour Package">Custom Tour Package</option>
                  <option value="Gate Permit Clearance Question">Gate Permit Clearance Question</option>
                  <option value="Other Assistance">Other Assistance</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Message or Dates</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Let us know your travel dates, number of travelers, preferred safari zone..."
                value={formData.message}
                onChange={handleChange}
                className="modern-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ width: '100%' }}
            >
              <span>{loading ? 'Sending Message...' : 'Submit Inquiry'}</span>
              <Send size={18} />
            </button>
          </form>
        </div>
      </ScrollReveal>

      {/* Frequently Asked Questions */}
      <ScrollReveal className="faq-section mt-5">
        <div className="section-header text-left mb-4">
          <span className="section-eyebrow gold">FREQUENT QUESTIONS</span>
          <h2 className="section-title">Permit & Expedition Guidelines</h2>
        </div>

        <div className="faq-list stagger-group">
          {faqs.map((faq, index) => (
            <div key={index} className="white-card faq-item">
              <button
                className="faq-question-btn"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`faq-arrow ${openFaq === index ? 'rotated' : ''}`}
                />
              </button>
              {openFaq === index && (
                <div className="faq-answer animate-fade-in">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollReveal>

      <style>{`
        .contact-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 2.5rem;
        }
        .contact-info-card {
          padding: 2.2rem;
        }
        .contact-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .contact-item-row {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .contact-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .contact-item-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: block;
        }
        .contact-item-val {
          font-size: 0.92rem;
          color: var(--text-heading);
          margin-top: 2px;
          font-weight: 500;
        }
        .contact-form-card {
          padding: 2.2rem;
        }
        /* FAQ */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .faq-item {
          overflow: hidden;
        }
        .faq-question-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.2rem 1.6rem;
          background: transparent;
          color: var(--text-heading);
          font-size: 1.05rem;
          font-weight: 600;
          text-align: left;
        }
        .faq-arrow {
          transition: transform 0.3s ease;
          color: var(--forest-primary);
        }
        .faq-arrow.rotated {
          transform: rotate(180deg);
        }
        .faq-answer {
          padding: 0 1.6rem 1.4rem 1.6rem;
          color: var(--text-secondary);
          font-size: 0.94rem;
          line-height: 1.65;
        }

        @media (max-width: 900px) {
          .contact-layout-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Contact;
