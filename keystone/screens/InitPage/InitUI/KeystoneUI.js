import { Box, Center, H1, Stack, useTheme } from "@keystone-ui/core";
import { Button } from "@keystone-ui/button";
import Head from "next/head";
import { Fields } from "@keystone/components/Fields";
import { GraphQLErrorNotice } from "@keystone/components/GraphQLErrorNotice";

export function KeystoneUI({
  onSubmit,
  error,
  fields,
  forceValidation,
  invalidFields,
  setValue,
  value,
  loading,
  data,
  listKey,
}) {
  return (
    <SigninContainer title="Welcome to KeystoneJS">
      <H1>Welcome to KeystoneJS</H1>
      <p>Create your first user to get started</p>
      <form onSubmit={onSubmit}>
        <Stack gap="large">
          {error && (
            <GraphQLErrorNotice
              errors={error?.graphQLErrors}
              networkError={error?.networkError}
            />
          )}
          <Fields
            fields={fields}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            onChange={setValue}
            value={value}
          />
          <Button
            isLoading={
              loading ||
              data?.authenticate?.__typename ===
                `${listKey}AuthenticationWithPasswordSuccess`
            }
            type="submit"
            weight="bold"
            tone="active"
          >
            Get started
          </Button>
        </Stack>
      </form>
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        rounding="medium"
      >
        <Box
          css={{
            background: colors.background,
            width: 600,
            boxShadow: shadow.s100,
            margin: 12,
            padding: 24,
            borderRadius: 8,
          }}
          margin="medium"
          rounding="medium"
        >
          {children}
        </Box>
      </Center>
    </div>
  );
};
