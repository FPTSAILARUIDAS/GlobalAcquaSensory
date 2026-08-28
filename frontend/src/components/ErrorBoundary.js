import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary-fallback" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 max-w-md w-full text-center space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
            <p className="text-sm text-gray-600">
              The page hit a temporary problem. Your data is safe — please reload to continue.
            </p>
            <button
              data-testid="error-boundary-reload-btn"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
