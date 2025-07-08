import React, { Component } from "react";

// Error Boundary component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    // Update state to indicate an error occurred
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, info) {
    // Log the error (you can also send it to a logging service)
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
          <h1>Something went wrong!</h1>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }

    return this.props.children; // Render children if no error
  }
}

export default ErrorBoundary;
