import { Component, ErrorInfo, ReactNode } from 'react';
import { resetTemplateStyling } from '../lib/templateStyling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class TemplateErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Template error boundary caught an error:', error, errorInfo);

    // Reset template styling to prevent corrupted state
    try {
      resetTemplateStyling();
    } catch (resetError) {
      console.error('Failed to reset template styling:', resetError);
    }

    // Could send error to analytics service here
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Theme Error</h2>
            <p className="text-gray-600 mb-4">
              There was a problem loading the calendar theme. The calendar will work with default styling.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TemplateErrorBoundary;