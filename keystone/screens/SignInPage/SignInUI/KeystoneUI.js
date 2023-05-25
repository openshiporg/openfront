/** @jsxRuntime classic */
/** @jsx jsx */

import {
  jsx,
  H1,
  Stack,
  VisuallyHidden,
  useTheme,
  Center,
  Box,
} from "@keystone-ui/core";
import { Button } from "@keystone-ui/button";
import { TextInput } from "@keystone-ui/fields";
import { Notice } from "@keystone-ui/notice";
import { Head } from "@keystone-6/core/admin-ui/router";
import { Fragment } from "react";

export function KeystoneUI({
  onSubmit,
  state,
  setState,
  identityField,
  identityFieldRef,
  secretField,
  loading,
  data,
  successTypename,
  error,
  failureTypename,
  mode,
}) {
  return (
    <SigninContainer title="Keystone - Sign in">
      <Stack gap="xlarge" as="form" onSubmit={onSubmit}>
        <H1>Sign In</H1>
        {error && (
          <Notice title="Error" tone="negative">
            {error.message}
          </Notice>
        )}
        {data?.authenticate?.__typename === failureTypename && (
          <Notice title="Error" tone="negative">
            {data?.authenticate.message}
          </Notice>
        )}
        <Stack gap="medium">
          <VisuallyHidden as="label" htmlFor="identity">
            {identityField}
          </VisuallyHidden>
          <TextInput
            id="identity"
            name="identity"
            value={state.identity}
            onChange={(e) => setState({ ...state, identity: e.target.value })}
            placeholder={identityField}
            ref={identityFieldRef}
          />
          {mode === "signin" && (
            <Fragment>
              <VisuallyHidden as="label" htmlFor="password">
                {secretField}
              </VisuallyHidden>
              <TextInput
                id="password"
                name="password"
                value={state.secret}
                onChange={(e) => setState({ ...state, secret: e.target.value })}
                placeholder={secretField}
                type="password"
              />
            </Fragment>
          )}
        </Stack>

        {mode === "forgot password" ? (
          <Stack gap="medium" across>
            <Button type="submit" weight="bold" tone="active">
              Log reset link
            </Button>
            <Button
              weight="none"
              tone="active"
              onClick={() => setMode("signin")}
            >
              Go back
            </Button>
          </Stack>
        ) : (
          <Stack gap="medium" across>
            <Button
              weight="bold"
              tone="active"
              isLoading={
                loading ||
                // this is for while the page is loading but the mutation has finished successfully
                data?.authenticate?.__typename === successTypename
              }
              type="submit"
            >
              Sign in
            </Button>
            {/* Disabled until we come up with a complete password reset workflow */}
            {/* <Button weight="none" tone="active" onClick={() => setMode('forgot password')}>
            Forgot your password?
          </Button> */}
          </Stack>
        )}
      </Stack>
    </SigninContainer>
  );
}

const SigninContainer = ({ children, title }) => {
  const { colors, shadow } = useTheme();
  return (
    <div>
      <Head>
        <title>{title || "Keystone"}</title>
      </Head>
      <Center
        css={{
          minWidth: "100vw",
          minHeight: "100vh",
          backgroundColor: colors.backgroundMuted,
        }}
        rounding="medium"
      >
        <Box
          css={{
            background: colors.background,
            width: 600,
            boxShadow: shadow.s100,
          }}
          margin="medium"
          padding="xlarge"
          rounding="medium"
        >
          {children}
        </Box>
      </Center>
    </div>
  );
};
