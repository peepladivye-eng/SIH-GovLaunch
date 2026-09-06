import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('GovLaunch caught a render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: 24, textAlign: 'center', background: '#FAFAFA',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>
            Something went wrong.
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 400 }}>
            This screen hit an unexpected error. Try going back or
            reloading the page.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: 8, padding: '8px 16px', borderRadius: 8,
              background: '#1E3A8A', color: '#fff', border: 'none',
              fontSize: 14, cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
