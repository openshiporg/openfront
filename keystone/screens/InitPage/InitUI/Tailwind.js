import Link from "next/link";
import { Fields } from "@keystone/components/Fields";
import { GraphQLErrorNotice } from "@keystone/components/GraphQLErrorNotice";

export function Tailwind({
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
    <div mih="100vh" miw="100vw" ai="center" jc="center" p="$2">
      <div width={500} maw={"100%"} jc="space-between" p="$2" space="$4">
        <Link href="/takeout/purchase" passHref legacyBehavior>
          <div tag="a" mb="$4">
            {/* <LogoIcon /> */}
          </div>
        </Link>

        <div elevate size="$4" bordered backgroundColor={"$gray2"}>
          <div padded>
            <h3 ml="$1">Welcome to Openfront</h3>
            <h6 mb="$4" ml="$1">
              Create an Admin Account
            </h6>
            <form onSubmit={onSubmit}>
              <div space="$2">
                <Fields
                  fields={fields}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  onChange={setValue}
                  value={value}
                />
                <div>
                  <button
                    // @ts-ignore
                    type="submit"
                    theme="blue"
                    marginTop="$2"
                    size="$5"
                  >
                    {loading ||
                    data?.authenticate?.__typename ===
                      `${listKey}AuthenticationWithPasswordSuccess` ? (
                      <div size="small" color="$green10" />
                    ) : (
                      "Create Admin"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {error && (
          <GraphQLErrorNotice
            errors={error?.graphQLErrors}
            networkError={error?.networkError}
          />
        )}
      </div>
    </div>
  );
}
