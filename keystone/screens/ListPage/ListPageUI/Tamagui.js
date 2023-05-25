import { SignoutButton } from "@keystone/components/SignoutButton";
import { AlertTriangle } from "@tamagui/lucide-icons";
import { Card, H4, H5, YStack } from "tamagui";

export function Tamagui({ sessionsEnabled }) {
  return (
    <YStack mih="100vh" miw="100vw" ai="center" jc="center" p="$2">
      <YStack miw={300} maw={320} jc="space-between" p="$2" space="$4">
        <Card elevate size="$4" bordered backgroundColor={"$gray2"}>
          <Card.Header padded>
            <YStack alignItems="center">
              <AlertTriangle />
              <H4 my="$4" ml="$1" textAlign="center">
                You don't have access to this page.
              </H4>
            </YStack>
            {!sessionsEnabled ? <SignoutButton /> : null}
          </Card.Header>
        </Card>
      </YStack>
    </YStack>
  );
}
