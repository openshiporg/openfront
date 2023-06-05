import { Notice } from "@keystone-ui/notice";
import Link from "next/link";

export function Tailwind({
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
    <div mih="100vh" miw="100vw" ai="center" jc="center" p="$2">
      <div width={500} maw={"100%"} jc="space-between" p="$2" space="$4">
        <Link href="/takeout/purchase" passHref legacyBehavior>
          <div tag="a" mb="$4">
            {/* <LogoIcon /> */}
          </div>
        </Link>

        <div elevate size="$4" bordered backgroundColor={"$gray2"}>
          <div padded>
            <h3 mb="$4" ml="$1">
              Sign In
            </h3>
            <form onSubmit={onSubmit}>
              <div space="$2">
                <input
                  size="$5"
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
                <input
                  size="$5"
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
                  <button
                    // @ts-ignore
                    type="submit"
                    theme="green"
                    marginTop="$2"
                    size="$5"
                  >
                    {loading ||
                    // this is for while the page is loading but the mutation has finished successfully
                    data?.authenticate?.__typename === successTypename ? (
                      <div size="small" color="$green10" />
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {error && (
          <Notice>
            <p>{error.message}</p>
          </Notice>
        )}
        {data?.authenticate?.__typename === failureTypename && (
          <Notice>
            <p> {data?.authenticate.message}</p>
          </Notice>
        )}
      </div>
    </div>
  );
}
