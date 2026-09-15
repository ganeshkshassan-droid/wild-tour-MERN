import React from 'react';
import { Award, Languages, Star, ArrowRight, ShieldCheck } from 'lucide-react';

const GuideCard = ({ guide, onBook }) => {
  const price = guide.price_per_day || guide.price || 2200;
  const rating = guide.rating || 4.95;

  return (
    <div className="white-card guide-card">
      <div className="card-media-wrap guide-media-wrap">
        <img
          src={guide.avatar || guide.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'}
          alt={guide.name}
          className="card-media-img"
          loading="lazy"
        />
        <span className="card-tag-pill">{guide.experience_years ? `${guide.experience_years}+ Years Experience` : 'Senior Naturalist'}</span>
        <span className="card-rating-pill">
          <Star size={13} fill="currentColor" />
          <span>{rating}</span>
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{guide.name}</h3>
        <p className="guide-specialty">{guide.specialty || 'Big Cat Tracking & Birdwatching'}</p>
        <p className="card-desc">{guide.bio || 'Generational forest tracking specialist with deep knowledge of animal trails.'}</p>

        <div className="card-meta-row">
          <div className="card-meta-item">
            <Languages size={15} className="text-forest-primary" />
            <span>{guide.languages ? guide.languages.join(', ') : 'Kannada, English, Hindi'}</span>
          </div>
        </div>

        <div className="card-footer-row">
          <div className="price-box">
            <span className="price-label">Daily naturalist fee</span>
            <span className="price-amount">₹{price.toLocaleString()}</span>
          </div>

          <button
            onClick={() => onBook(guide)}
            className="btn-primary btn-sm"
          >
            <span>Hire Guide</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .guide-media-wrap {
          padding-top: 75%;
        }
        .guide-specialty {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--forest-primary);
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default GuideCard;
