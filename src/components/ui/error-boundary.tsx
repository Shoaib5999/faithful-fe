import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function isChunkLoadError(error: Error): boolean {
  return (
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Importing a module script failed") ||
    error.message.includes("error loading dynamically imported module") ||
    error.name === "ChunkLoadError"
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);

    // Auto-reload on chunk load errors (stale deployment)
    if (isChunkLoadError(error)) {
      const reloadKey = "chunk_reload_" + window.location.pathname;
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      // Only auto-reload once per path per 30 seconds to avoid infinite loops
      if (!lastReload || now - Number(lastReload) > 30000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
        return;
      }
    }
  }

  handleRetry = () => {
    if (this.state.error && isChunkLoadError(this.state.error)) {
      // Force a full reload to get fresh chunks
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error && isChunkLoadError(this.state.error);

      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[40vh] p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {isChunkError
                  ? "A new version is available. Please reload the page."
                  : this.state.error?.message}
              </p>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm"
                onClick={this.handleRetry}
              >
                {isChunkError ? "Reload Page" : "Try Again"}
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
