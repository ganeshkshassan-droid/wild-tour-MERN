import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import BookingModal from '../components/BookingModal';
import StayCard from '../components/StayCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Hotel, Search, SlidersHorizontal, MapPin } from 'lucide-react';

const Stays = () => {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(25000);

  // Booking Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState(null);

  useEffect(() => {
    fetchStays();
  }, []);

  const fetchStays = async () => {
    try {
      const res = await api.getStays();
      if (res.success) {
        setStays(res.data);
      }
    } catch (error) {
      console.error('Error fetching stays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (stay) => {
    setSelectedStay(stay);
    setModalOpen(true);
  };

  const filteredStays = stays.filter((stay) => {
    const price = stay.price_per_night || stay.price || 0;
    const matchesPrice = price <= maxPrice;
    const matchesSearch =
      searchTerm === '' ||
      stay.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stay.location && stay.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesPrice && matchesSearch;
  });

  return (
    <div className="stays-page container section-padding">
      <div className="section-header text-left mb-4">
        <span className="section-eyebrow">
          <Hotel size={16} />
          <span>LUXURY RAINFOREST SANCTUARIES</span>
        </span>
        <h1 className="section-title">Rainforest Lodges & Waterfront Stays</h1>
        <p className="section-subtitle">
          Wake up to panoramic Kabini backwater views, wild elephant herds grazing on the banks, and birdsong.
        </p>
      </div>

      {/* Filter and Price Slider Bar */}
      <div className="discovery-filter-bar mb-5">
        <div className="discovery-search-wrap">
          <Search size={18} className="search-input-icon text-muted" />
          <input
            type="text"
            placeholder="Search by resort name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="discovery-search-input"
          />
        </div>

        <div className="price-slider-group">
          <SlidersHorizontal size={16} className="text-forest-primary" />
          <span className="slider-label">Max Tariff: <strong>₹{maxPrice.toLocaleString()}</strong> / night</span>
          <input
            type="range"
            min="4000"
            max="30000"
            step="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="tariff-range-slider"
          />
        </div>
      </div>

      {/* Stays Grid */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : filteredStays.length === 0 ? (
        <div className="empty-results-box text-center py-5">
          <Hotel size={44} className="text-muted mb-2" />
          <h3 className="text-heading text-xl mb-1">No accommodations matched your criteria</h3>
          <p className="text-secondary">Try adjusting the price slider or clearing search terms.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredStays.map((stay) => (
            <StayCard
              key={stay._id || stay.id}
              stay={stay}
              onBook={handleBook}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedStay}
        itemType="Stay"
      />

      <style>{`
        .discovery-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          background: #ffffff;
          padding: 1.2rem 1.6rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .price-slider-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.88rem;
          color: var(--text-heading);
        }
        .tariff-range-slider {
          accent-color: var(--forest-primary);
          cursor: pointer;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }

        @media (max-width: 800px) {
          .discovery-filter-bar { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </div>
  );
};

export default Stays;
