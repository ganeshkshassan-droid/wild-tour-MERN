import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import BookingModal from '../components/BookingModal';
import PackageCard from '../components/PackageCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Layers, Calendar, CheckCircle2 } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);

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
    setSelectedPkg(pkg);
    setModalOpen(true);
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
        <div className="cards-grid">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg._id || pkg.id}
              pkg={pkg}
              onBook={handleBook}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedPkg}
        itemType="Package"
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

export default Packages;
