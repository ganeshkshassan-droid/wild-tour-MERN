import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Image, DollarSign, FileText } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const AdminItemModal = ({ isOpen, onClose, itemType, item, onSaved }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        price: item.price || item.price_per_day || item.price_per_seat || item.price_per_night || 0,
        price_per_seat: item.price_per_seat || item.price || 1850,
        price_per_night: item.price_per_night || item.price || 6500,
        image_url: item.image_url || item.image || item.avatar || '',
        image: item.image || item.avatar || item.image_url || '',
        duration: item.duration || (item.duration_days ? `${item.duration_days} Days` : '3 - 4 Hours'),
        category: item.category || 'Jeep',
        room_type: item.room_type || item.property_type || 'Luxury Cottage',
        location: item.location || 'Kabini Riverfront',
        specialty: item.specialty || 'Big Cat Tracking',
        bio: item.bio || item.description || '',
        description: item.description || item.bio || '',
      });
    } else {
      if (itemType === 'Safari') {
        setFormData({
          name: '',
          image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1000&q=80',
          price_per_seat: 1850,
          description: '',
          duration: '3 - 4 Hours',
          category: 'Jeep',
          vehicle_type: '4x4 Open Top Gypsy',
          sighting_rating: 4.8,
        });
      } else if (itemType === 'Stay') {
        setFormData({
          name: '',
          image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
          price_per_night: 6500,
          description: '',
          location: 'Kabini Riverfront',
          room_type: 'Luxury Pool Villa / Riverfront Cottage',
          rating: 4.9,
        });
      } else if (itemType === 'Package') {
        setFormData({
          name: '',
          image_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80',
          price: 24000,
          description: '',
          duration: '2 Days / 1 Night',
        });
      } else if (itemType === 'Guide') {
        setFormData({
          name: '',
          bio: '',
          price: 2200,
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
          languages: ['English', 'Kannada', 'Hindi'],
          experience_years: 8,
          rating: 4.9,
          specialty: 'Big Cat Tracking & Birding',
        });
      }
    }
  }, [item, itemType, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      const isEditing = !!(item && (item._id || item.id));
      const id = item?._id || item?.id;

      // Prepare clean canonical payloads
      let payload = { ...formData };
      if (itemType === 'Safari') {
        payload = {
          name: formData.name?.trim(),
          image_url: formData.image_url?.trim(),
          price_per_seat: Number(formData.price_per_seat),
          description: formData.description?.trim() || '',
          duration: formData.duration?.trim() || '3 - 4 Hours',
          category: formData.category || 'Jeep',
          vehicle_type: formData.vehicle_type || '4x4 Open Top Gypsy',
        };
        res = isEditing ? await api.updateSafari(id, payload) : await api.createSafari(payload);
      } else if (itemType === 'Stay') {
        payload = {
          name: formData.name?.trim(),
          image_url: formData.image_url?.trim(),
          price_per_night: Number(formData.price_per_night),
          description: formData.description?.trim() || '',
          location: formData.location?.trim() || 'Kabini Riverfront',
          room_type: formData.room_type?.trim() || 'Luxury Cottage',
        };
        res = isEditing ? await api.updateStay(id, payload) : await api.createStay(payload);
      } else if (itemType === 'Package') {
        payload = {
          name: formData.name?.trim(),
          image_url: formData.image_url?.trim(),
          price: Number(formData.price),
          description: formData.description?.trim() || '',
          duration: formData.duration?.trim() || '2 Days / 1 Night',
        };
        res = isEditing ? await api.updatePackage(id, payload) : await api.createPackage(payload);
      } else if (itemType === 'Guide') {
        payload = {
          name: formData.name?.trim(),
          image: (formData.image || formData.image_url || formData.avatar)?.trim(),
          price: Number(formData.price || formData.price_per_day),
          bio: (formData.bio || formData.description)?.trim(),
          specialty: formData.specialty?.trim() || 'Big Cat Tracking',
          languages: formData.languages || ['English', 'Kannada', 'Hindi'],
          experience_years: Number(formData.experience_years) || 8,
        };
        res = isEditing ? await api.updateGuide(id, payload) : await api.createGuide(payload);
      }

      if (res && res.success) {
        showToast(res.message || `${itemType} saved successfully!`, 'success');
        onSaved();
        onClose();
      }
    } catch (error) {
      showToast(error.message || `Failed to save ${itemType}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <h2 className="section-title text-xl text-left mb-1">
          {item ? `Edit ${itemType} Details` : `Add New ${itemType}`}
        </h2>
        <p className="text-secondary text-sm mb-4">Update directory details and tariff.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{itemType} Name / Title</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name || ''}
              onChange={handleChange}
              className="modern-input"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                {itemType === 'Safari' ? 'Tariff (₹ / Seat)' : itemType === 'Stay' ? 'Tariff (₹ / Night)' : itemType === 'Guide' ? 'Fee (₹ / Day)' : 'Total Price (₹)'}
              </label>
              <input
                type="number"
                name={itemType === 'Safari' ? 'price_per_seat' : itemType === 'Stay' ? 'price_per_night' : itemType === 'Guide' ? 'price' : 'price'}
                required
                min="0"
                value={itemType === 'Safari' ? (formData.price_per_seat || '') : itemType === 'Stay' ? (formData.price_per_night || '') : (formData.price || '')}
                onChange={handleChange}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {itemType === 'Safari' ? 'Category / Mode' : itemType === 'Stay' ? 'Room / Property Type' : itemType === 'Guide' ? 'Specialty' : 'Duration Schedule'}
              </label>
              {itemType === 'Safari' ? (
                <select
                  name="category"
                  value={formData.category || 'Jeep'}
                  onChange={handleChange}
                  className="modern-input"
                >
                  <option value="Jeep">Jeep (4x4 Gypsy)</option>
                  <option value="Boat">Boat (Kabini Riverboat)</option>
                  <option value="Night">Night (Buffer Trail)</option>
                  <option value="Elephant">Elephant Safari</option>
                  <option value="Walking">Walking Eco-Trail</option>
                </select>
              ) : itemType === 'Stay' ? (
                <input
                  type="text"
                  name="room_type"
                  placeholder="e.g. Luxury Pool Villa"
                  value={formData.room_type || ''}
                  onChange={handleChange}
                  className="modern-input"
                />
              ) : itemType === 'Guide' ? (
                <input
                  type="text"
                  name="specialty"
                  placeholder="e.g. Big Cat Tracking & Birding"
                  value={formData.specialty || ''}
                  onChange={handleChange}
                  className="modern-input"
                />
              ) : (
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 2 Days / 1 Night"
                  value={formData.duration || ''}
                  onChange={handleChange}
                  className="modern-input"
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image Cover URL</label>
            <input
              type="url"
              name={itemType === 'Guide' ? 'image' : 'image_url'}
              required
              value={itemType === 'Guide' ? (formData.image || formData.image_url || formData.avatar || '') : (formData.image_url || formData.image || '')}
              onChange={handleChange}
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{itemType === 'Guide' ? 'Bio & Tracking Background' : 'Description'}</label>
            <textarea
              name={itemType === 'Guide' ? 'bio' : 'description'}
              required
              rows="3"
              value={itemType === 'Guide' ? (formData.bio || formData.description || '') : (formData.description || formData.bio || '')}
              onChange={handleChange}
              className="modern-input"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminItemModal;
