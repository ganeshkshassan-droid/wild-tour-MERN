import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import BookingModal from '../components/BookingModal';
import GuideCard from '../components/GuideCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Award, ShieldCheck, Languages, Compass } from 'lucide-react';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await api.getGuides();
      if (res.success) {
        setGuides(res.data);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (guide) => {
    setSelectedGuide(guide);
    setModalOpen(true);
  };

  return (
    <div className="guides-page container section-padding">
      <div className="section-header text-left mb-5">
        <span className="section-eyebrow gold">
          <Award size={16} />
          <span>FOREST NATURALISTS & TRACKERS</span>
        </span>
        <h1 className="section-title">Certified Wildlife Naturalists</h1>
        <p className="section-subtitle">
          Hire experienced naturalists with deep knowledge of animal behavior, tiger pugmarks, bird calls, and rainforest trails.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} />
      ) : (
        <div className="cards-grid">
          {guides.map((guide) => (
            <GuideCard
              key={guide._id || guide.id}
              guide={guide}
              onBook={handleBook}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedGuide}
        itemType="Guide"
      />

      <style>{`
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Guides;
