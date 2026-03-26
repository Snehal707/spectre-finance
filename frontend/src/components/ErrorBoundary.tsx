import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Spectre Finance render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "2rem",
            background: "#05050a",
            color: "#e5e7eb",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.85, marginBottom: "1rem" }}>
            The app hit a runtime error. Check the browser console for details.
          </p>
          <pre
            style={{
              padding: "1rem",
              background: "#111827",
              borderRadius: "8px",
              overflow: "auto",
              fontSize: "0.8rem",
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
