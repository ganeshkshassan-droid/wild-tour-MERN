import React from 'react';

const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="white-card skeleton-card-wrap">
          <div className="skeleton skeleton-media" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line-short" />
            <div className="skeleton-footer">
              <div className="skeleton skeleton-price" />
              <div className="skeleton skeleton-btn" />
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
          width: 100%;
        }
        .skeleton-card-wrap {
          height: 420px;
          border: 1px solid var(--border-light);
        }
        .skeleton-media {
          width: 100%;
          height: 220px;
          border-radius: 0;
        }
        .skeleton-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
        }
        .skeleton-title {
          height: 24px;
          width: 70%;
        }
        .skeleton-line {
          height: 14px;
          width: 95%;
        }
        .skeleton-line-short {
          height: 14px;
          width: 60%;
        }
        .skeleton-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .skeleton-price {
          height: 28px;
          width: 35%;
        }
        .skeleton-btn {
          height: 36px;
          width: 35%;
          border-radius: var(--radius-full);
        }
      `}</style>
    </div>
  );
};

export default SkeletonLoader;
