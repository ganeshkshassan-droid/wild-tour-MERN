import React from 'react';
import { Calendar, Check, ArrowRight, Star, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const PackageCard = ({ pkg, onBook }) => {
  const { isSaved, toggleWishlist } = useWishlist();
  const id = pkg._id || pkg.id;
  const saved = isSaved(id);

  const price = pkg.price || 24000;
  const rating = pkg.rating || 4.9;

  return (
    <div className="white-card package-card">
      <div className="card-media-wrap">
        <img
          src={pkg.image_url || pkg.image || '/images/luxury-overwater-bungalow.jpg'}
          alt={pkg.name}
          className="card-media-img"
          loading="lazy"
        />
        <span className="card-tag-pill">{pkg.duration || 'All-Inclusive Tour'}</span>

        {/* Heart Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(pkg, 'Package');
          }}
          className={`card-wishlist-heart-btn ${saved ? 'active' : ''}`}
          title={saved ? 'Remove from Saved Experiences' : 'Save Expedition Package'}
          aria-label={saved ? 'Remove from Saved' : 'Save Package'}
        >
          <Heart size={16} fill={saved ? '#ef4444' : 'none'} className={saved ? 'text-danger' : 'text-slate'} />
        </button>

        <span className="card-rating-pill">
          <Star size={13} fill="currentColor" />
          <span>{rating}</span>
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{pkg.name}</h3>
        <p className="card-desc">{pkg.description || 'Comprehensive holiday itinerary covering stays, safaris, and dining.'}</p>

        {pkg.inclusions && (
          <div className="inclusions-list mb-3">
            {pkg.inclusions.slice(0, 3).map((inc, i) => (
              <div key={i} className="inclusion-item">
                <Check size={14} className="text-forest-accent flex-shrink-0" />
                <span>{inc}</span>
              </div>
            ))}
          </div>
        )}

        <div className="card-footer-row">
          <div className="price-box">
            <span className="price-label">All-inclusive package</span>
            <span className="price-amount">₹{price.toLocaleString()}</span>
          </div>

          <button
            onClick={() => onBook(pkg)}
            className="btn-primary btn-sm"
          >
            <span>Book Journey</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .card-wishlist-heart-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .card-wishlist-heart-btn:hover {
          transform: scale(1.12);
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .card-wishlist-heart-btn.active {
          background: #ffffff;
        }
        .card-wishlist-heart-btn.active svg {
          animation: heartPop 0.3s ease;
        }
        @keyframes heartPop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .inclusions-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .inclusion-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default PackageCard;
