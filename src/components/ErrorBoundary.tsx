import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Uncaught error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default premium CU Bazzar error fallback screen
      return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#231942] px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-[#FF6B6B]" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">
            Oops! Something went wrong
          </h1>
          
          <p className="text-white/60 text-sm max-w-sm mb-10 leading-relaxed">
            We encountered an unexpected error while loading this page. 
            This usually happens due to a network glitch.
          </p>
          
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 active:scale-95 transition-all rounded-xl border border-white/20 text-white font-medium shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
