import React, { Component } from 'react';
import { Compass, RefreshCw, Home, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Wild Tour Client Crash Caught by ErrorBoundary]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#0d1f18',
          color: '#f8faf6',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'rgba(27, 67, 50, 0.65)',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            borderRadius: '20px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706'
            }}>
              <Compass size={36} />
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={14} />
              WILDLIFE TRAIL INTERRUPTED
            </span>

            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              marginBottom: '0.75rem',
              color: '#f8faf6'
            }}>
              Something Unexpected Happened
            </h2>

            <p style={{
              color: 'rgba(248, 250, 246, 0.75)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              Our forest navigation radar encountered an unexpected detour. Rest assured, your account, bookings, and saved experiences are secure.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#d97706',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#f8faf6',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              >
                <Home size={16} />
                Return to Sanctuary Home
              </button>
            </div>

            {/* Developer Diagnostic Details (Only if error exists) */}
            {import.meta.env.DEV && this.state.error && (
              <div style={{
                marginTop: '2rem',
                textAlign: 'left',
                background: 'rgba(0,0,0,0.4)',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#fca5a5',
                overflowX: 'auto'
              }}>
                <strong>Dev Diagnostic:</strong> {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
