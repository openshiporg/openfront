import React, { Component } from "react";
import { Button, Box, Text, YStack } from "tamagui";
import { AlertTriangle } from "@tamagui/lucide-icons";

export class Tamagui extends Component {
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
          <YStack align="center" gap="medium">
            <AlertTriangle size="large" />
            <Text>Something went wrong.</Text>
            <Button
              isLoading={this.state.isReloading}
              onClick={this.reloadPage}
            >
              reload page
            </Button>
          </YStack>
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
