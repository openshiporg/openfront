import { Card, Input, Button, YStack, Paragraph, H3, Spinner } from "tamagui";
import Link from "next/link";
import { Notice } from "@components/Notice";

export function Tamagui({
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
            <H3 mb="$4" ml="$1">
              Sign In
            </H3>
            <form onSubmit={onSubmit}>
              <YStack space="$2">
                <Input
                  id="identity"
                  name="identity"
                  value={state.identity}
                  onChange={(e) =>
                    setState({ ...state, identity: e.target.value })
                  }
                  placeholder={identityField}
                  ref={identityFieldRef}
                  required
                />
                <Input
                  id="password"
                  name="password"
                  value={state.secret}
                  onChange={(e) =>
                    setState({ ...state, secret: e.target.value })
                  }
                  placeholder={secretField}
                  secureTextEntry
                  required
                />
                <div>
                  <Button
                    // @ts-ignore
                    type="submit"
                    theme="green"
                    marginTop="$2"
                    size="$5"
                  >
                    {loading ||
                    // this is for while the page is loading but the mutation has finished successfully
                    data?.authenticate?.__typename === successTypename ? (
                      <Spinner size="small" color="$green10" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </YStack>
            </form>
          </Card.Header>
        </Card>
        {error && (
          <Notice>
            <Paragraph>{error.message}</Paragraph>
          </Notice>
        )}
        {data?.authenticate?.__typename === failureTypename && (
          <Notice>
            <Paragraph> {data?.authenticate.message}</Paragraph>
          </Notice>
        )}
      </YStack>
    </YStack>
  );
}
