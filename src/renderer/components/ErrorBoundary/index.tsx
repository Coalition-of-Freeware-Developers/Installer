import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, ButtonType } from '../Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    // Reload the window if electronAPI is available
    if (window.electronAPI?.reloadWindow) {
      window.electronAPI.reloadWindow();
    } else {
      window.location.reload();
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-y-5 bg-navy text-gray-100">
          <div className="flex max-w-2xl flex-col items-center gap-y-4 text-center">
            <h1 className="text-4xl font-semibold text-red-400">Something went wrong</h1>
            <p className="text-xl">
              An unexpected error occurred in the application. This might be due to a temporary issue.
            </p>

            {this.state.error && (
              <details className="mt-4 w-full rounded-lg bg-gray-800 p-4">
                <summary className="cursor-pointer text-lg font-medium">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="mt-6 flex gap-4">
              <Button type={ButtonType.Neutral} onClick={this.handleReset}>
                Try Again
              </Button>
              <Button type={ButtonType.Emphasis} onClick={this.handleReload}>
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
