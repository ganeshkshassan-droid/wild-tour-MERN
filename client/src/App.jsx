import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Safaris from './pages/Safaris';
import Stays from './pages/Stays';
import Packages from './pages/Packages';
import Guides from './pages/Guides';
import WildlifeSightings from './pages/WildlifeSightings';
import PhotographyGuide from './pages/PhotographyGuide';
import MyTrips from './pages/MyTrips';
import BoardingPass from './pages/BoardingPass';
import SavedExperiences from './pages/SavedExperiences';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import VerifyEmailLink from './pages/VerifyEmailLink';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTripManagement from './pages/admin/AdminTripManagement';
import AdminCheckpost from './pages/admin/AdminCheckpost';

// Protected Admin Route Guard
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="container section-padding text-center" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-secondary">Loading Chief Warden Dashboard...</p>
      </div>
    );
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Protected User Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container section-padding text-center" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <Router>
              <div className="app-layout">
                <Navbar />
                <main className="app-main-content">
                  <Routes>
                    {/* Public & Visitor Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/safaris" element={<Safaris />} />
                    <Route path="/stays" element={<Stays />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/guides" element={<Guides />} />
                    <Route path="/wildlife" element={<WildlifeSightings />} />
                    <Route path="/photography" element={<PhotographyGuide />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Authentication Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/verify-email" element={<VerifyEmailLink />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* User Protected Routes */}
                    <Route path="/my-trips" element={<MyTrips />} />
                    <Route path="/trips" element={<MyTrips />} />
                    <Route path="/boarding-pass/:bookingId" element={<BoardingPass />} />
                    <Route path="/saved" element={<SavedExperiences />} />
                    <Route path="/wishlist" element={<SavedExperiences />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Protected Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/trips"
                      element={
                        <AdminRoute>
                          <AdminTripManagement />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/checkpost"
                      element={
                        <AdminRoute>
                          <AdminCheckpost />
                        </AdminRoute>
                      }
                    />

                    {/* Fallback to Home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

