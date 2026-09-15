import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, ArrowUp, Send, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please provide a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed to Nagarhole Wildlife Bulletin!', 'success');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-root">
      {/* Newsletter Strip */}
      <div className="footer-newsletter-strip">
        <div className="container newsletter-inner">
          <div className="newsletter-text-col">
            <h3 className="newsletter-title">Receive the Nagarhole Weekly Wildlife Bulletin</h3>
            <p className="newsletter-desc">
              Curated seasonal migration reports, big cat sighting frequencies, and safari permit quota updates delivered to your inbox.
            </p>
          </div>
          <div className="newsletter-form-col">
            {subscribed ? (
              <div className="subscribed-box">
                <CheckCircle2 size={18} className="text-forest-primary" />
                <span>You are subscribed to the wildlife bulletin.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-input-group">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                />
                <button type="submit" className="btn-primary btn-sm">
                  <span>Subscribe</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container footer-main-grid section-padding-sm">
        {/* Col 1: Brand Info */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-brand-link">
            <div className="footer-brand-icon">
              <Compass size={22} className="text-forest-primary" />
            </div>
            <div>
              <span className="brand-title">WILD<span className="brand-highlight">TOUR</span></span>
              <span className="brand-subtitle">KABINI & NAGARHOLE</span>
            </div>
          </Link>
          <p className="footer-brand-desc">
            Official expedition booking platform connecting wildlife enthusiasts with ethical 4x4 safaris, riverboat cruises, and luxury rainforest lodges in Nagarhole.
          </p>
          <div className="ranger-quick-box">
            <Phone size={16} className="text-forest-primary" />
            <div>
              <span className="ranger-label">Ranger Field Office</span>
              <p className="ranger-phone">+91 94808 05000 / 0821-248000</p>
            </div>
          </div>
        </div>

        {/* Col 2: Experiences */}
        <div className="footer-col">
          <h4 className="footer-heading">Expeditions</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Wild Tour Home</Link></li>
            <li><Link to="/safaris">Open 4x4 Gypsy Safaris</Link></li>
            <li><Link to="/safaris">Kabini Riverboat Safaris</Link></li>
            <li><Link to="/stays">Luxury Waterfront Lodges</Link></li>
            <li><Link to="/packages">All-Inclusive Tour Packages</Link></li>
            <li><Link to="/guides">Certified Naturalist Guides</Link></li>
          </ul>
        </div>

        {/* Col 3: Flora & Fauna */}
        <div className="footer-col">
          <h4 className="footer-heading">Sanctuary Guide</h4>
          <ul className="footer-links-list">
            <li><Link to="/wildlife">Fauna Directory & Radar</Link></li>
            <li><Link to="/photography">Photography Masterclass</Link></li>
            <li><Link to="/about">Conservation Ethics</Link></li>
            <li><Link to="/contact">Dammanakatte Gate Info</Link></li>
            <li><Link to="/my-trips">E-Permit Verification</Link></li>
          </ul>
        </div>

        {/* Col 4: Gate Location */}
        <div className="footer-col">
          <h4 className="footer-heading">Range Headquarters</h4>
          <p className="footer-address">
            <MapPin size={16} className="text-forest-primary flex-shrink-0 mt-1" />
            <span>Dammanakatte Forest Reception, Kabini Range, HD Kote, Karnataka 571114</span>
          </p>
          <p className="footer-hours">
            Permit Counter: 05:30 AM - 09:30 AM & 03:00 PM - 06:30 PM
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container bottom-bar-inner">
          <p className="copyright-text">
            © {new Date().getFullYear()} Wild Tour Karnataka. All rights reserved. Ethical wildlife tourism in the Nilgiri Biosphere.
          </p>
          <button onClick={scrollToTop} className="back-to-top-btn" title="Back to top">
            <span>Back to top</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .footer-root {
          background-color: #ffffff;
          border-top: 1px solid var(--border-light);
          margin-top: auto;
        }
        .footer-newsletter-strip {
          background-color: var(--bg-surface-subtle);
          border-bottom: 1px solid var(--border-light);
          padding: 2.5rem 0;
        }
        .newsletter-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2.5rem;
        }
        .newsletter-title {
          font-size: 1.35rem;
          color: var(--text-heading);
          margin-bottom: 0.35rem;
        }
        .newsletter-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 540px;
        }
        .newsletter-input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1px solid var(--border-light);
          padding: 0.35rem 0.35rem 0.35rem 1rem;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-sm);
        }
        .newsletter-input {
          border: none;
          background: transparent;
          font-size: 0.9rem;
          color: var(--text-heading);
          width: 240px;
        }
        .subscribed-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--forest-primary);
        }
        .footer-main-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 3rem;
        }
        .footer-brand-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .footer-brand-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background-color: var(--forest-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-brand-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.4rem;
        }
        .ranger-quick-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--bg-surface-subtle);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
        }
        .ranger-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          display: block;
        }
        .ranger-phone {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-heading);
        }
        .footer-heading {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 1.2rem;
        }
        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .footer-links-list a {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .footer-links-list a:hover {
          color: var(--forest-primary);
          transform: translateX(3px);
        }
        .footer-address {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 0.85rem;
        }
        .footer-hours {
          font-size: 0.82rem;
          color: var(--text-muted);
          background: var(--bg-surface-subtle);
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
        }
        .footer-bottom-bar {
          border-top: 1px solid var(--border-light);
          padding: 1.5rem 0;
          background-color: var(--bg-canvas);
        }
        .bottom-bar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.84rem;
          color: var(--text-muted);
        }
        .back-to-top-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.84rem;
          font-weight: 600;
        }
        .back-to-top-btn:hover {
          color: var(--forest-primary);
        }

        @media (max-width: 1024px) {
          .newsletter-inner { flex-direction: column; text-align: center; }
          .footer-main-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }
        @media (max-width: 640px) {
          .footer-main-grid { grid-template-columns: 1fr; }
          .newsletter-input-group { flex-direction: column; background: transparent; border: none; padding: 0; box-shadow: none; }
          .newsletter-input { background: #ffffff; border: 1px solid var(--border-light); padding: 0.75rem 1rem; border-radius: var(--radius-md); width: 100%; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
