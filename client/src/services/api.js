const RAW_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? '/api'
        : 'http://localhost:5000/api');

const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';
  if (typeof error === 'string') return error;
  if (error.data && error.data.message) return error.data.message;
  if (error.message) return error.message;
  return 'Operation could not be completed';
};

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('wildtour_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.data = data;
      error.status = res.status;
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`[API Error on ${endpoint}]:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  googleAuth: (payload) => request('/auth/google', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmailToken: (token) => request('/auth/verify-email-token', { method: 'POST', body: JSON.stringify({ token }) }),
  verifyEmailOtp: (payload) => request('/auth/verify-email-otp', { method: 'POST', body: JSON.stringify(payload) }),
  resendVerificationLink: (email) => request('/auth/resend-verification-link', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyResetOtp: (payload) => request('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify(payload) }),
  verifyOtp: (payload) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resendOtp: (email, purpose = 'signup') => request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email, purpose }) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  changePassword: (payload) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  getAllUsers: () => request('/auth/users'),

  // Safaris & Availability
  getSafaris: (params = '') => request(`/safaris${params ? `?${params}` : ''}`),
  getAdminSafaris: () => request('/safaris/admin/all'),
  getSafariById: (id) => request(`/safaris/${id}`),
  getSafariAvailability: (safariId, date, shift = 'Morning') =>
    request(`/bookings/availability?safari_id=${safariId}&date=${date}&shift=${shift}`),
  createSafari: (data) => request('/safaris', { method: 'POST', body: JSON.stringify(data) }),
  updateSafari: (id, data) => request(`/safaris/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSafari: (id) => request(`/safaris/${id}`, { method: 'DELETE' }),

  // Stays
  getStays: (params = '') => request(`/stays${params ? `?${params}` : ''}`),
  getAdminStays: () => request('/stays/admin/all'),
  getStayById: (id) => request(`/stays/${id}`),
  createStay: (data) => request('/stays', { method: 'POST', body: JSON.stringify(data) }),
  updateStay: (id, data) => request(`/stays/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStay: (id) => request(`/stays/${id}`, { method: 'DELETE' }),

  // Packages
  getPackages: (params = '') => request(`/packages${params ? `?${params}` : ''}`),
  getAdminPackages: () => request('/packages/admin/all'),
  getPackageById: (id) => request(`/packages/${id}`),
  createPackage: (data) => request('/packages', { method: 'POST', body: JSON.stringify(data) }),
  updatePackage: (id, data) => request(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePackage: (id) => request(`/packages/${id}`, { method: 'DELETE' }),

  // Guides
  getGuides: (params = '') => request(`/guides${params ? `?${params}` : ''}`),
  getAdminGuides: () => request('/guides/admin/all'),
  getGuideById: (id) => request(`/guides/${id}`),
  createGuide: (data) => request('/guides', { method: 'POST', body: JSON.stringify(data) }),
  updateGuide: (id, data) => request(`/guides/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGuide: (id) => request(`/guides/${id}`, { method: 'DELETE' }),

  // Bookings & Gate Operations
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getMyBookings: () => request('/bookings/my'),
  getBookingById: (id) => request(`/bookings/${id}`),
  cancelBooking: (id, reason) => request(`/bookings/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  checkInBooking: (idOrTicket) => request(`/bookings/check-in/${idOrTicket}`, { method: 'POST' }),
  getAllBookings: (params = '') => request(`/bookings/admin/all${params ? `?${params}` : ''}`),
  updateBookingStatus: (id, data) => request(`/bookings/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBooking: (id) => request(`/bookings/admin/${id}`, { method: 'DELETE' }),
  getAdminAnalytics: () => request('/bookings/admin/analytics'),
  getAdminBookingPerformance: (range = '30d') => request(`/bookings/admin/performance?range=${range}`),
  getExportCsvUrl: () => `${API_BASE_URL}/bookings/admin/export-csv`,

  // Verified Reviews
  getItemReviews: (itemId) => request(`/reviews/item/${itemId}`),
  createReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),

  // Admin Audit Logs
  getAdminAuditLogs: (params = '') => request(`/admin/audit${params ? `?${params}` : ''}`),

  // Wildlife
  getWildlife: () => request('/wildlife'),
  getWildlifeBySlug: (slug) => request(`/wildlife/${slug}`),

  // Contact
  submitContact: (data) => request('/contact', { method: 'POST', body: JSON.stringify(data) }),
  getAllContacts: () => request('/contact/admin/all'),

  // Wishlist / Saved Experiences
  getWishlist: () => request('/wishlist'),
  addToWishlist: (item_id, item_type) => request('/wishlist', { method: 'POST', body: JSON.stringify({ item_id, item_type }) }),
  toggleWishlist: (item_id, item_type) => request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ item_id, item_type }) }),
  removeFromWishlist: (itemId) => request(`/wishlist/${itemId}`, { method: 'DELETE' }),
};

