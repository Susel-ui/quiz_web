import { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to error monitoring (Sentry etc.)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-4">
          <span className="text-5xl" aria-hidden="true">⚠️</span>
          <h2 className="text-heading-2 text-slate-800 dark:text-slate-100">Something went wrong</h2>
          <p className="text-body-sm text-slate-500 max-w-md">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <Button onClick={this.reset} variant="outline" size="md">
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
