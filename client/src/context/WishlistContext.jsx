import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Link } from 'react-router-dom';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [pendingSaveItem, setPendingSaveItem] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setSavedIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const res = await api.getWishlist();
      if (res && res.success) {
        const items = res.data || [];
        setWishlistItems(items);
        const idSet = new Set(items.map((i) => String(i.item_id || i.item?._id || i.item?.id)));
        setSavedIds(idSet);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isSaved = useCallback((itemId) => {
    if (!itemId) return false;
    return savedIds.has(String(itemId));
  }, [savedIds]);

  const toggleWishlist = async (item, itemType = 'Safari') => {
    const itemId = item._id || item.id || item.item_id;
    if (!itemId) return;

    // Guest protection
    if (!user) {
      setPendingSaveItem({ item, itemType });
      setGuestPromptOpen(true);
      return;
    }

    const idStr = String(itemId);
    const currentlySaved = savedIds.has(idStr);

    // Optimistic UI update
    if (currentlySaved) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(idStr);
        return next;
      });
      setWishlistItems((prev) => prev.filter((i) => String(i.item_id || i.item?._id || i.item?.id) !== idStr));
      showToast(`Removed "${item.name || 'Experience'}" from Saved Experiences`, 'info');
    } else {
      setSavedIds((prev) => new Set(prev).add(idStr));
      const optimisticDoc = {
        _id: 'temp-' + Date.now(),
        item_id: itemId,
        item_type: itemType,
        item: item,
        createdAt: new Date().toISOString(),
      };
      setWishlistItems((prev) => [optimisticDoc, ...prev]);
      showToast(`Saved "${item.name || 'Experience'}" to your Wishlist!`, 'success');
    }

    // Server sync
    try {
      const res = await api.toggleWishlist(itemId, itemType);
      if (!res.success) {
        // Revert on failure
        fetchWishlist();
        showToast(res.message || 'Failed to update saved experiences', 'error');
      }
    } catch (error) {
      // Revert on error
      fetchWishlist();
      showToast(error.message || 'Failed to update saved experiences', 'error');
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (!itemId || !user) return;
    const idStr = String(itemId);

    // Optimistic
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(idStr);
      return next;
    });
    setWishlistItems((prev) => prev.filter((i) => String(i.item_id || i.item?._id || i.item?.id) !== idStr));
    showToast('Removed from Saved Experiences', 'info');

    try {
      await api.removeFromWishlist(itemId);
    } catch (error) {
      fetchWishlist();
      showToast(error.message || 'Failed to remove item', 'error');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        isSaved,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}

      {/* Clean Guest Sign In Modal */}
      {guestPromptOpen && (
        <div className="modal-overlay" onClick={() => setGuestPromptOpen(false)}>
          <div className="modal-content-box guest-save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-inner text-center p-4">
              <div className="guest-heart-icon-box mb-3">
                <span className="heart-emoji">❤️</span>
              </div>
              <h3 className="guest-modal-title">Sign in to Save Experiences</h3>
              <p className="guest-modal-desc text-secondary">
                Create a free traveler account or log in to keep track of your favorite safaris, river cruises, and luxury lodges.
              </p>
              <div className="guest-modal-actions mt-4">
                <Link
                  to="/login"
                  onClick={() => setGuestPromptOpen(false)}
                  className="action-btn primary w-full"
                >
                  Sign In to Continue
                </Link>
                <button
                  onClick={() => setGuestPromptOpen(false)}
                  className="action-btn secondary w-full mt-2"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
          <style>{`
            .guest-save-modal {
              max-width: 400px;
              border-radius: 16px;
              background: #ffffff;
            }
            .guest-heart-icon-box {
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: #fef2f2;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              margin: 0 auto;
            }
            .guest-modal-title {
              font-size: 1.25rem;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 6px 0;
            }
            .guest-modal-desc {
              font-size: 0.88rem;
              color: #64748b;
              line-height: 1.5;
            }
          `}</style>
        </div>
      )}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
