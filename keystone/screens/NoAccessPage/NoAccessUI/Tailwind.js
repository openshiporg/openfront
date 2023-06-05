import { SignoutButton } from "@keystone/components/SignoutButton";

export function Tailwind({ sessionsEnabled }) {
  return (
    <div mih="100vh" miw="100vw" ai="center" jc="center" p="$2">
      <div miw={300} maw={320} jc="space-between" p="$2" space="$4">
        <div elevate size="$4" bordered backgroundColor={"$gray2"}>
          <div padded>
            <div alignItems="center">
              <h4 mt="$4" ml="$1" textAlign="center">
                You don't have access to this page.
              </h4>
            </div>
            {sessionsEnabled ? <SignoutButton /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
