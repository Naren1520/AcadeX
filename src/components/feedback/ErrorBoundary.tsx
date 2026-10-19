"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

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

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="rounded p-6 text-center"
            style={{ border: "1px solid #fecaca", backgroundColor: "#fef2f2" }}
            role="alert"
          >
            <p className="text-sm font-semibold text-red-800">
              Something went wrong.
            </p>
            <p className="mt-1 text-xs text-red-600">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button
              className="mt-3 text-xs text-red-700 underline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
