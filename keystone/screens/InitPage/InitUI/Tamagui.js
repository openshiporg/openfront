import { Card, Input, Button, YStack, Paragraph, H3, Spinner, H6 } from "tamagui";
import Link from "next/link";
import { Fields } from "@keystone/components/Fields";
import { GraphQLErrorNotice } from "@keystone/components/GraphQLErrorNotice";

export function Tamagui({
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
    <YStack mih="100vh" miw="100vw" ai="center" jc="center" p="$2">
      <YStack width={500} maw={"100%"} jc="space-between" p="$2" space="$4">
        <Link href="/takeout/purchase" passHref legacyBehavior>
          <YStack tag="a" mb="$4">
            {/* <LogoIcon /> */}
          </YStack>
        </Link>

        <Card elevate size="$4" bordered backgroundColor={"$gray2"}>
          <Card.Header padded>
            <H3 ml="$1">
              Welcome to Openfront
            </H3>
            <H6 mb="$4" ml="$1">
              Create an Admin Account
            </H6>
            <form onSubmit={onSubmit}>
              <YStack space="$2">
                <Fields
                  fields={fields}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  onChange={setValue}
                  value={value}
                />
                <div>
                  <Button
                    // @ts-ignore
                    type="submit"
                    theme="blue"
                    marginTop="$2"
                    size="$5"
                  >
                    {loading ||
                    data?.authenticate?.__typename ===
                      `${listKey}AuthenticationWithPasswordSuccess` ? (
                      <Spinner size="small" color="$green10" />
                    ) : (
                      "Create Admin"
                    )}
                  </Button>
                </div>
              </YStack>
            </form>
          </Card.Header>
        </Card>
        {error && (
          <GraphQLErrorNotice
            errors={error?.graphQLErrors}
            networkError={error?.networkError}
          />
        )}
      </YStack>
    </YStack>
  );
}
