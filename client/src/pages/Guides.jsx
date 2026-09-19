import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import GuideCard from '../components/GuideCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';
import { Award, ShieldCheck, Languages, Compass } from 'lucide-react';

const Guides = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

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
    navigate(`/booking/Guide/${guide._id || guide.id}`, {
      state: { item: guide, itemType: 'Guide' },
    });
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
        <ScrollReveal className="cards-grid stagger-group">
          {guides.map((guide) => (
            <GuideCard
              key={guide._id || guide.id}
              guide={guide}
              onBook={handleBook}
            />
          ))}
        </ScrollReveal>
      )}

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
