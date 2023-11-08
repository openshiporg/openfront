import { Component } from "react";
import { Box, Center, Stack, useTheme } from "@keystone-ui/core";
import { AlertTriangleIcon } from "@keystone-ui/icons/icons/AlertTriangleIcon";
import { Button } from "../../primitives/default/ui/button";

export class ErrorBoundary extends Component {
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
        <ErrorContainer>
          <Stack align="center" gap="medium">
            <AlertTriangleIcon size="large" />
            <div>Something went wrong.</div>
            <Button
              size="sm"
              isLoading={this.state.isReloading}
              onClick={this.reloadPage}
            >
              reload page
            </Button>
          </Stack>
        </ErrorContainer>
      );
    }
    return this.props.children;
  }
}

export const ErrorContainer = ({ children }) => {
  const { colors, shadow } = useTheme();
  return (
    <Center rounding="medium">
      <Box margin="medium" padding="xlarge" rounding="medium">
        {children}
      </Box>
    </Center>
  );
};
