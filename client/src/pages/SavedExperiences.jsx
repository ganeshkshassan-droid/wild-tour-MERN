import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  Heart,
  Compass,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  Trash2,
  Ticket,
  Search,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Home
} from 'lucide-react';

const SavedExperiences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems, loading, removeFromWishlist, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Safari' | 'Stay' | 'Package'
  const [searchQuery, setSearchQuery] = useState('');

  // Category counts
  const counts = useMemo(() => {
    const all = wishlistItems.length;
    const safaris = wishlistItems.filter((w) => w.item_type === 'Safari').length;
    const stays = wishlistItems.filter((w) => w.item_type === 'Stay').length;
    const packages = wishlistItems.filter((w) => w.item_type === 'Package').length;
    return { all, safaris, stays, packages };
  }, [wishlistItems]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return wishlistItems.filter((w) => {
      // Category filter
      if (activeTab !== 'All' && w.item_type !== activeTab) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const item = w.item || {};
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const loc = (item.location || item.category || '').toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !loc.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [wishlistItems, activeTab, searchQuery]);

  const handleBookItem = (item, itemType) => {
    const type = itemType || 'Safari';
    navigate(`/booking/${type}/${item._id || item.id}`, {
      state: { item, itemType: type },
    });
  };

  if (!user) {
    return (
      <div className="saved-unauth-wrap">
        <div className="saved-unauth-box text-center">
          <div className="unauth-heart-circle mb-3">
            <Heart size={36} className="text-danger" fill="#ef4444" />
          </div>
          <h2 className="unauth-title">Sign In to View Your Saved Expeditions</h2>
          <p className="unauth-desc">
            Save your favorite Nagarhole safaris, riverfront stays, and wildlife packages to book whenever you are ready.
          </p>
          <div className="unauth-btn-row">
            <Link to="/login" className="action-btn primary">
              Sign In to Wild Tour
            </Link>
            <Link to="/safaris" className="action-btn secondary">
              Explore Safaris First
            </Link>
          </div>
        </div>
        <style>{`
          .saved-unauth-wrap {
            min-height: calc(100vh - 80px);
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
          }
          .saved-unauth-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px 32px;
            max-width: 480px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          }
          .unauth-heart-circle {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background: #fef2f2;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
          }
          .unauth-title {
            font-size: 1.35rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px 0;
          }
          .unauth-desc {
            font-size: 0.88rem;
            color: #64748b;
            line-height: 1.5;
            margin: 0 0 24px 0;
          }
          .unauth-btn-row {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 9px 18px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.86rem;
            text-decoration: none;
            cursor: pointer;
            border: none;
          }
          .action-btn.primary { background: #1b4332; color: #ffffff; }
          .action-btn.secondary { background: #ffffff; color: #334155; border: 1px solid #cbd5e1; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="saved-page-root">
      <div className="saved-container">

        {/* 1. Header & Navigation */}
        <header className="saved-header-bar">
          <div className="saved-header-left">
            <div className="saved-breadcrumbs">
              <Link to="/" className="breadcrumb-link">
                <Home size={13} />
                <span>Home</span>
              </Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Saved Experiences</span>
            </div>

            <div className="saved-eyebrow-row">
              <span className="saved-eyebrow-pill">
                <Heart size={13} className="text-danger" fill="#ef4444" />
                <span>SAVED EXPERIENCES & EXPEDITIONS</span>
              </span>
            </div>

            <h1 className="saved-main-title">Your Saved Adventures</h1>
            <p className="saved-main-subtitle">
              Your personal collection of sanctuary safaris, riverfront lodges, and holiday packages saved for future travel.
            </p>
          </div>

          <div className="saved-header-actions">
            <Link to="/safaris" className="action-btn secondary">
              <Compass size={15} />
              <span>Explore More Safaris</span>
            </Link>
          </div>
        </header>

        {/* 2. Horizontal Filter Tabs & Search Bar */}
        <section className="saved-controls-bar mb-5">
          <div className="saved-tabs-group">
            {[
              { key: 'All', label: 'All Saved', count: counts.all },
              { key: 'Safari', label: 'Safaris', count: counts.safaris },
              { key: 'Stay', label: 'Luxury Stays', count: counts.stays },
              { key: 'Package', label: 'Packages', count: counts.packages },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`saved-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="saved-tab-count font-mono">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="saved-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="saved-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                ×
              </button>
            )}
          </div>
        </section>

        {/* 3. Main Grid / Cards */}
        {loading ? (
          <div className="saved-grid-layout">
            {[1, 2, 3].map((i) => (
              <div key={i} className="saved-skeleton-card">
                <div className="skeleton-img shimmer mb-3" />
                <div className="skeleton-line shimmer h-6 w-3/4 mb-2" />
                <div className="skeleton-line shimmer h-4 w-1/2 mb-4" />
                <div className="skeleton-line shimmer h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="saved-empty-card">
            <div className="empty-heart-ring mb-3">
              <Heart size={38} className="text-forest-primary" />
            </div>
            <h3 className="empty-title">
              {activeTab === 'All'
                ? 'Your Adventure Wishlist is Empty'
                : `No Saved ${activeTab} Experiences Found`}
            </h3>
            <p className="empty-desc">
              {activeTab === 'All'
                ? 'Click the heart icon on any safari, luxury lodge, or tour package to save it here for easy booking later.'
                : searchQuery
                ? `No saved items match your search for "${searchQuery}".`
                : `You haven't saved any ${activeTab.toLowerCase()} experiences yet.`}
            </p>
            <div className="empty-actions">
              {searchQuery || activeTab !== 'All' ? (
                <button
                  onClick={() => {
                    setActiveTab('All');
                    setSearchQuery('');
                  }}
                  className="action-btn secondary"
                >
                  <RotateCcw size={15} />
                  <span>Reset Filters</span>
                </button>
              ) : (
                <Link to="/safaris" className="action-btn primary">
                  <Compass size={15} />
                  <span>Discover Nagarhole Safaris</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Responsive Cards Grid */
          <div className="saved-grid-layout">
            {filteredItems.map((w) => {
              const item = w.item;
              if (!item) return null;

              const itemId = w.item_id || item._id;
              const type = w.item_type || 'Safari';

              const price =
                item.price_per_seat ||
                item.price_per_night ||
                item.price_per_day ||
                item.price ||
                0;

              const priceUnit =
                type === 'Safari' ? '/ seat' :
                type === 'Stay' ? '/ night' :
                type === 'Package' ? '/ package' : '/ day';

              const typeBadge =
                type === 'Safari' ? '🐘 SAFARI' :
                type === 'Stay' ? '🏕️ LUXURY STAY' :
                type === 'Package' ? '🧭 PACKAGE' : '🌿 GUIDE';

              return (
                <div key={w._id || itemId} className="saved-exp-card">
                  {/* Card Image Wrap */}
                  <div className="saved-card-img-wrap">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="saved-card-img"
                    />
                    <span className={`saved-type-pill ${type.toLowerCase()}`}>
                      {typeBadge}
                    </span>

                    {/* Quick Remove Heart Button */}
                    <button
                      onClick={() => removeFromWishlist(itemId)}
                      className="saved-heart-btn active"
                      title="Remove from Saved Experiences"
                      aria-label="Remove from Saved"
                    >
                      <Heart size={17} fill="#ef4444" className="text-danger" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="saved-card-body">
                    <div className="saved-card-top-info">
                      <div className="saved-rating-badge">
                        <Star size={13} fill="#f59e0b" className="text-amber" />
                        <span>{item.sighting_rating || item.rating || 4.9}</span>
                      </div>
                      <span className="saved-location-text">
                        {item.duration || item.location || 'Nagarhole Sanctuary'}
                      </span>
                    </div>

                    <h3 className="saved-item-title">{item.name}</h3>

                    <p className="saved-item-desc">
                      {item.description
                        ? item.description.length > 95
                          ? `${item.description.substring(0, 95)}...`
                          : item.description
                        : 'Authentic wildlife expedition with certified naturalist guides in Nagarhole National Park.'}
                    </p>

                    {/* Price and Actions */}
                    <div className="saved-card-footer">
                      <div className="saved-price-box">
                        <span className="saved-price-val font-mono">
                          ₹{price.toLocaleString()}
                        </span>
                        <span className="saved-price-unit">{priceUnit}</span>
                      </div>

                      <div className="saved-card-btns">
                        <button
                          onClick={() => handleBookItem(item, type)}
                          className="action-btn primary btn-sm"
                        >
                          <Ticket size={14} />
                          <span>Book Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        .saved-page-root {
          background-color: #f8fafc;
          min-height: calc(100vh - 72px);
          padding: 32px 24px 64px 24px;
          color: #1e293b;
        }

        .saved-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        /* Header */
        .saved-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 24px;
        }

        .saved-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          margin-bottom: 6px;
        }

        .breadcrumb-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
        }

        .breadcrumb-link:hover { color: #1b4332; }
        .breadcrumb-sep { color: #cbd5e1; }
        .breadcrumb-current { color: #0f172a; font-weight: 700; }

        .saved-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #991b1b;
          background: #fef2f2;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid #fee2e2;
          margin-bottom: 6px;
        }

        .saved-main-title {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
          line-height: 1.2;
          margin: 0 0 4px 0;
        }

        .saved-main-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          line-height: 1.45;
        }

        /* Controls */
        .saved-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          flex-wrap: wrap;
        }

        .saved-tabs-group {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
        }

        .saved-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.84rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .saved-tab-btn:hover {
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .saved-tab-btn.active {
          background: #1b4332;
          border-color: #1b4332;
          color: #ffffff;
        }

        .saved-tab-count {
          font-size: 0.74rem;
          padding: 1px 6px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.06);
        }

        .saved-tab-btn.active .saved-tab-count {
          background: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }

        .saved-search-box {
          position: relative;
          min-width: 220px;
        }

        .saved-search-input {
          width: 100%;
          height: 38px;
          padding: 0 28px 0 34px;
          font-size: 0.84rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          font-family: inherit;
        }

        .saved-search-input:focus {
          border-color: #1b4332;
          box-shadow: 0 0 0 2px rgba(27, 67, 50, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .clear-search-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 16px;
          color: #94a3b8;
          cursor: pointer;
        }

        /* Cards Grid */
        .saved-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .saved-exp-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .saved-exp-card:hover {
          transform: translateY(-3px);
          border-color: #cbd5e1;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }

        .saved-card-img-wrap {
          position: relative;
          height: 190px;
          overflow: hidden;
          background: #0f172a;
        }

        .saved-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .saved-exp-card:hover .saved-card-img {
          transform: scale(1.05);
        }

        .saved-type-pill {
          position: absolute;
          left: 12px;
          top: 12px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 6px;
          color: #ffffff;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
        }

        .saved-heart-btn {
          position: absolute;
          right: 12px;
          top: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease;
        }

        .saved-heart-btn:hover {
          transform: scale(1.1);
        }

        .saved-card-body {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .saved-card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .saved-rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.76rem;
          font-weight: 800;
          color: #0f172a;
          background: #fef3c7;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .saved-location-text {
          font-size: 0.76rem;
          color: #64748b;
          font-weight: 600;
        }

        .saved-item-title {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .saved-item-desc {
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 16px 0;
          flex: 1;
        }

        .saved-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }

        .saved-price-val {
          font-size: 1.3rem;
          font-weight: 800;
          color: #1b4332;
        }

        .saved-price-unit {
          font-size: 0.72rem;
          color: #64748b;
          margin-left: 2px;
        }

        .saved-card-btns {
          display: flex;
          gap: 6px;
        }

        /* Empty State */
        .saved-empty-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 56px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-heart-ring {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #e8f5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .empty-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .empty-desc {
          font-size: 0.88rem;
          color: #64748b;
          max-width: 440px;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .empty-actions {
          display: flex;
          gap: 10px;
        }

        /* Skeletons */
        .saved-skeleton-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
        }

        .skeleton-img {
          height: 160px;
          border-radius: 10px;
        }

        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @media (max-width: 768px) {
          .saved-page-root {
            padding: 20px 14px 48px 14px;
          }
          .saved-header-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .saved-controls-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .saved-search-box {
            width: 100%;
          }
          .saved-grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SavedExperiences;
