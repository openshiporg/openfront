import React, { Component } from "react";

export class Tailwind extends Component {
  state = { hasError: false, isReloading: false };

  static getDerivedStateFromError(error) {
    return { error, hasError: true };
  }

  reloadPage = () => {
    this.setState({ isReloading: true });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <div>
            <text>Something went wrong.</text>
            <button
              isLoading={this.state.isReloading}
              onClick={this.reloadPage}
            >
              reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ErrorContainer = ({ children }) => {
  return (
    <div
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
      }}
    >
      <div>{children}</div>
    </div>
  );
};
