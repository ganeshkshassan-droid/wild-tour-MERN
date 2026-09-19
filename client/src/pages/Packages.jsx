import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PackageCard from '../components/PackageCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';
import { Layers, Calendar, CheckCircle2 } from 'lucide-react';

const Packages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.getPackages();
      if (res.success) {
        setPackages(res.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (pkg) => {
    navigate(`/booking/Package/${pkg._id || pkg.id}`, {
      state: { item: pkg, itemType: 'Package' },
    });
  };

  return (
    <div className="packages-page container section-padding">
      <div className="section-header text-left mb-5">
        <span className="section-eyebrow">
          <Layers size={16} />
          <span>ALL-INCLUSIVE HOLIDAYS</span>
        </span>
        <h1 className="section-title">Curated Wildlife Tour Packages</h1>
        <p className="section-subtitle">
          Complete holiday packages combining luxury riverfront accommodations, multiple morning & evening safaris, gourmet South Indian dining, and certified naturalist escorts.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} />
      ) : (
        <ScrollReveal className="cards-grid stagger-group">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg._id || pkg.id}
              pkg={pkg}
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

export default Packages;
