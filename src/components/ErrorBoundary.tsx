import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-sky-100 to-amber-100 p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg text-center">
            <h1 className="text-2xl font-extrabold text-pink-500 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-600 mb-6">
              Harper's calendar encountered an unexpected error. Don't worry, Daddy will fix it soon!
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white font-semibold shadow-lg hover:scale-105 transition"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500">Error Details</summary>
                <pre className="mt-2 text-xs bg-slate-100 p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

