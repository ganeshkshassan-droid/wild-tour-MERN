import React from 'react';
import { Clock, Users, Star, ArrowRight, Compass, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const SafariCard = ({ safari, onBook }) => {
  const { isSaved, toggleWishlist } = useWishlist();
  const id = safari._id || safari.id;
  const saved = isSaved(id);

  const price = safari.price_per_seat || safari.price || 1850;
  const rating = safari.sighting_rating || safari.rating || 4.9;

  return (
    <div className="white-card safari-card">
      <div className="card-media-wrap">
        <img
          src={safari.image_url || safari.image || '/images/tiger.jpg'}
          alt={safari.name}
          className="card-media-img"
          loading="lazy"
        />
        <span className="card-tag-pill">{safari.category || '4x4 Gypsy Safari'}</span>
        
        {/* Heart Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(safari, 'Safari');
          }}
          className={`card-wishlist-heart-btn ${saved ? 'active' : ''}`}
          title={saved ? 'Remove from Saved Experiences' : 'Save Safari Experience'}
          aria-label={saved ? 'Remove from Saved' : 'Save Safari'}
        >
          <Heart size={16} fill={saved ? '#ef4444' : 'none'} className={saved ? 'text-danger' : 'text-slate'} />
        </button>

        <span className="card-rating-pill">
          <Star size={13} fill="currentColor" />
          <span>{rating}</span>
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{safari.name}</h3>
        <p className="card-desc">{safari.description || 'Open top high-clearance jungle trail through Nagarhole core zones.'}</p>

        <div className="card-meta-row">
          <div className="card-meta-item">
            <Clock size={15} className="text-forest-primary" />
            <span>{safari.duration || '3.5 Hours'}</span>
          </div>
          <div className="card-meta-item">
            <Compass size={15} className="text-forest-primary" />
            <span>{safari.zone || 'Dammanakatte Zone'}</span>
          </div>
        </div>

        <div className="card-footer-row">
          <div className="price-box">
            <span className="price-label">Tariff per seat</span>
            <span className="price-amount">₹{price.toLocaleString()}</span>
          </div>

          <button
            onClick={() => onBook(safari)}
            className="btn-primary btn-sm"
          >
            <span>Book Safari</span>
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

export default SafariCard;
