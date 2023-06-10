/** @jsxRuntime classic */
/** @jsx jsx */

import { Heading, jsx, useTheme, Box } from "@keystone-ui/core";
import { ChevronRightIcon } from "@keystone-ui/icons/icons/ChevronRightIcon";
import { Button } from "@keystone-ui/button";
import { Fields } from "@keystone/components/Fields";
import { PageContainer } from "@keystone/components/PageContainer";
import { useKeystone, useList } from "@keystone/keystoneProviderNoUI";
import { GraphQLErrorNotice } from "@keystone/components/GraphQLErrorNotice";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { Container } from "@keystone/components/Container";
import Link from "next/link";
import { Fragment } from "react";
import { useRouter } from "next/navigation";

export function ItemPageHeader(props) {
  const { palette, spacing } = useTheme();

  return (
    <Container
      css={{
        alignItems: "center",
        display: "flex",
        flex: 1,
        justifyContent: "space-between",
      }}
    >
      <div
        css={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          minWidth: 0,
        }}
      >
        {props.list.isSingleton ? (
          <Heading type="h3">{props.list.label}</Heading>
        ) : (
          <Fragment>
            <Heading type="h3">
              <Link
                href={`/${props.list.path}`}
                css={{ textDecoration: "none" }}
              >
                {props.list.label}
              </Link>
            </Heading>
            <div
              css={{
                color: palette.neutral500,
                marginLeft: spacing.xsmall,
                marginRight: spacing.xsmall,
              }}
            >
              <ChevronRightIcon />
            </div>
            <Heading
              as="h1"
              type="h3"
              css={{
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                flex: 1,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {props.label}
            </Heading>
          </Fragment>
        )}
      </div>
    </Container>
  );
}

export function ColumnLayout(props) {
  const { spacing } = useTheme();

  return (
    // this container must be relative to catch absolute children
    // particularly the "expanded" document-field, which needs a height of 100%
    <Container css={{ position: "relative", height: "100%" }}>
      <div
        css={{
          alignItems: "start",
          display: "grid",
          gap: spacing.xlarge,
          gridTemplateColumns: `2fr 1fr`,
        }}
        {...props}
      />
    </Container>
  );
}

export function BaseToolbar(props) {
  const { colors, spacing } = useTheme();

  return (
    <div
      css={{
        background: colors.background,
        borderTop: `1px solid ${colors.border}`,
        bottom: 0,
        display: "flex",
        justifyContent: "space-between",
        marginTop: spacing.xlarge,
        paddingBottom: spacing.xlarge,
        paddingTop: spacing.xlarge,
        position: "sticky",
        zIndex: 20,
      }}
    >
      {props.children}
    </div>
  );
}

function CreatePageForm(props) {
  const createItem = useCreateItem(props.list);
  const router = useRouter();
  return (
    <Box paddingTop="xlarge">
      {createItem.error && (
        <GraphQLErrorNotice
          networkError={createItem.error?.networkError}
          errors={createItem.error?.graphQLErrors}
        />
      )}

      <Fields {...createItem.props} />
      <BaseToolbar>
        <Button
          isLoading={createItem.state === "loading"}
          weight="bold"
          tone="active"
          onClick={async () => {
            const item = await createItem.create();
            if (item) {
              router.push(`/${props.list.path}/${item.id}`);
            }
          }}
        >
          Create {props.list.singular}
        </Button>
      </BaseToolbar>
    </Box>
  );
}

export function KeystoneUI(props) {
  const list = useList(props.listKey);
  const { createViewFieldModes } = useKeystone();

  return (
    <PageContainer
      title={`Create ${list.singular}`}
      header={<ItemPageHeader list={list} label="Create" />}
    >
      <ColumnLayout>
        <Box>
          {createViewFieldModes.state === "error" && (
            <GraphQLErrorNotice
              networkError={
                createViewFieldModes.error instanceof Error
                  ? createViewFieldModes.error
                  : undefined
              }
              errors={
                createViewFieldModes.error instanceof Error
                  ? undefined
                  : createViewFieldModes.error
              }
            />
          )}
          {createViewFieldModes.state === "loading" && (
            <div label="Loading create form" />
          )}
          <CreatePageForm list={list} />
        </Box>
      </ColumnLayout>
    </PageContainer>
  );
}
