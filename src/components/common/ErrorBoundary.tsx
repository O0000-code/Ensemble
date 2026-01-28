import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
              <span className="text-zinc-400 text-xl">!</span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Something went wrong</h2>
            <p className="text-sm text-zinc-500">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800"
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

export default ErrorBoundary;
