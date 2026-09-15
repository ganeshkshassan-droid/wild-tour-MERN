import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import BookingModal from '../components/BookingModal';
import SafariCard from '../components/SafariCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search, Compass, Filter, Sparkles } from 'lucide-react';

const Safaris = () => {
  const [safaris, setSafaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Booking Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSafari, setSelectedSafari] = useState(null);

  useEffect(() => {
    fetchSafaris();
  }, []);

  const fetchSafaris = async () => {
    try {
      const res = await api.getSafaris();
      if (res.success) {
        setSafaris(res.data);
      }
    } catch (error) {
      console.error('Error fetching safaris:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (safari) => {
    setSelectedSafari(safari);
    setModalOpen(true);
  };

  const categories = ['All', 'Jeep', 'Boat', 'Night', 'Elephant'];
  const categoryLabels = {
    All: 'All Safaris',
    Jeep: '4x4 Gypsy Safari',
    Boat: 'Kabini Riverboat',
    Night: 'Night Trail',
    Elephant: 'Elephant Safari',
  };

  const filteredSafaris = safaris.filter((safari) => {
    const matchesCategory =
      categoryFilter === 'All' ||
      safari.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      safari.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (safari.description && safari.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="safaris-page container section-padding">
      <div className="section-header text-left mb-4">
        <span className="section-eyebrow">
          <Compass size={16} />
          <span>EXPEDITIONS & JUNGLE TRAILS</span>
        </span>
        <h1 className="section-title">Official Nagarhole Safari Permits</h1>
        <p className="section-subtitle">
          Choose from morning dawn tracking, afternoon predator trails, or twilight boat safaris across Nagarhole core sanctuary zones.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="discovery-filter-bar mb-5">
        <div className="filter-categories-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`filter-pill-btn ${categoryFilter === cat ? 'active' : ''}`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        <div className="discovery-search-wrap">
          <Search size={18} className="search-input-icon text-muted" />
          <input
            type="text"
            placeholder="Search by safari name, zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="discovery-search-input"
          />
        </div>
      </div>

      {/* Safari Cards Grid */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : filteredSafaris.length === 0 ? (
        <div className="empty-results-box text-center py-5">
          <Compass size={44} className="text-muted mb-2" />
          <h3 className="text-heading text-xl mb-1">No safaris matched your filter</h3>
          <p className="text-secondary">Try switching categories or clearing search keywords.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredSafaris.map((safari) => (
            <SafariCard
              key={safari._id || safari.id}
              safari={safari}
              onBook={handleBook}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedSafari}
        itemType="Safari"
      />

      <style>{`
        .discovery-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          background: #ffffff;
          padding: 1.2rem 1.6rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .filter-categories-pills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
        }
        .filter-pill-btn {
          padding: 0.5rem 1.15rem;
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-light);
          white-space: nowrap;
        }
        .filter-pill-btn.active {
          background-color: var(--forest-primary);
          color: #ffffff;
          border-color: var(--forest-primary);
        }
        .discovery-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 260px;
        }
        .search-input-icon {
          position: absolute;
          left: 1rem;
        }
        .discovery-search-input {
          width: 100%;
          padding: 0.55rem 1rem 0.55rem 2.6rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
          font-size: 0.88rem;
          background: #ffffff;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .discovery-filter-bar { flex-direction: column; align-items: stretch; }
          .discovery-search-wrap { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Safaris;
