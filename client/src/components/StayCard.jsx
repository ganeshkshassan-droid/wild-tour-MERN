import React from 'react';
import { MapPin, Star, ArrowRight, BedDouble, Check, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const StayCard = ({ stay, onBook }) => {
  const { isSaved, toggleWishlist } = useWishlist();
  const id = stay._id || stay.id;
  const saved = isSaved(id);

  const price = stay.price_per_night || stay.price || 6500;
  const rating = stay.rating || 4.9;

  return (
    <div className="white-card stay-card">
      <div className="card-media-wrap">
        <img
          src={stay.image_url || stay.image || '/images/waterfront-villa-stay.jpg'}
          alt={stay.name}
          className="card-media-img"
          loading="lazy"
        />
        <span className="card-tag-pill">{stay.property_type || 'Luxury Resort'}</span>

        {/* Heart Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(stay, 'Stay');
          }}
          className={`card-wishlist-heart-btn ${saved ? 'active' : ''}`}
          title={saved ? 'Remove from Saved Experiences' : 'Save Lodge & Stay'}
          aria-label={saved ? 'Remove from Saved' : 'Save Stay'}
        >
          <Heart size={16} fill={saved ? '#ef4444' : 'none'} className={saved ? 'text-danger' : 'text-slate'} />
        </button>

        <span className="card-rating-pill">
          <Star size={13} fill="currentColor" />
          <span>{rating}</span>
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{stay.name}</h3>
        <p className="card-desc">{stay.description || 'Riverfront sanctuary with views of the backwaters and forest canopy.'}</p>

        <div className="card-meta-row">
          <div className="card-meta-item">
            <MapPin size={15} className="text-forest-primary" />
            <span>{stay.location || 'Kabini Riverfront'}</span>
          </div>
          {stay.amenities && stay.amenities.length > 0 && (
            <div className="card-meta-item">
              <Check size={15} className="text-forest-accent" />
              <span>{stay.amenities.slice(0, 2).join(' • ')}</span>
            </div>
          )}
        </div>

        <div className="card-footer-row">
          <div className="price-box">
            <span className="price-label">Tariff per night</span>
            <span className="price-amount">₹{price.toLocaleString()}</span>
          </div>

          <button
            onClick={() => onBook(stay)}
            className="btn-primary btn-sm"
          >
            <span>Reserve Stay</span>
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
      `}</style>
    </div>
  );
};

export default StayCard;
