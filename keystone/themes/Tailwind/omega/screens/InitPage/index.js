import { useMemo, useState } from "react";
import isDeepEqual from "fast-deep-equal";
import { useRouter } from "next/navigation";
import {
  serializeValueToObjByFieldKey,
  useInvalidFields,
} from "@keystone-6/core/admin-ui/utils";
import { useRedirect } from "@keystone/utils/useRedirect";
import { Button } from "../../primitives/default/ui/button";
import { GraphQLErrorNotice } from "../../components/GraphQLErrorNotice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../primitives/default/ui/card";
import { Logo } from "../../components/Logo";
import { Fields } from "../../components/Fields";
import { cn } from "@keystone/utils/cn";
import { keystoneClient } from "@keystone/keystoneClient";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../primitives/default/ui/alert";
import { getKeystoneMetadata } from "../../lib/keystoneMetadataQueries";
export async function InitPage({
  fieldPaths = ["name", "email", "password"],
  listKey = "User",
  enableWelcome,
}) {
  const { adminMeta } = await getKeystoneMetadata();
  const fields = useMemo(() => {
    const fields = {};
    fieldPaths.forEach((fieldPath) => {
      fields[fieldPath] = adminMeta.lists[listKey].fields[fieldPath];
    });
    return fields;
  }, [fieldPaths, adminMeta.lists, listKey]);

  const [value, setValue] = useState(() => {
    let state = {};
    Object.keys(fields).forEach((fieldPath) => {
      state[fieldPath] = {
        kind: "value",
        value: fields[fieldPath].controller.defaultValue,
      };
    });
    return state;
  });

  const invalidFields = useInvalidFields(fields, value);
  const [forceValidation, setForceValidation] = useState(false);
  const [mode, setMode] = useState("init");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const router = useRouter();
  const redirect = useRedirect();

  const onSubmit = async (event) => {
    event.preventDefault();
    const newForceValidation = invalidFields.size !== 0;
    setForceValidation(newForceValidation);

    if (newForceValidation) return;

    const formData = {};
    const allSerializedValues = serializeValueToObjByFieldKey(fields, value);

    for (const fieldPath of Object.keys(allSerializedValues)) {
      const { controller } = fields[fieldPath];
      const serialized = allSerializedValues[fieldPath];
      if (
        !isDeepEqual(serialized, controller.serialize(controller.defaultValue))
      ) {
        Object.assign(formData, serialized);
      }
    }

    setLoading(true);
    try {
      const result = await keystoneClient.request(`
        mutation($data: CreateInitial${listKey}Input!) {
          authenticate: createInitial${listKey}(data: $data) {
            ... on ${listKey}AuthenticationWithPasswordSuccess {
              item {
                id
              }
            }
            ... on ${listKey}AuthenticationWithPasswordFailure {
              message
            }
          }
        }
      `, {
        data: formData,
      });

      if (result.authenticate?.__typename === `${listKey}AuthenticationWithPasswordSuccess`) {
        setData(result);
        if (enableWelcome) {
          setMode("welcome");
          return;
        }
        router.push(redirect);
      } else if (result.authenticate?.__typename === `${listKey}AuthenticationWithPasswordFailure`) {
        setError(result.authenticate);
      } else {
        setError(new Error('Invalid response from server'));
      }
    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-screen flex justify-center items-center bg-[#0f172a] heropattern-topography-zinc-500/10 dark:bg-background`}
    >
      <div className="flex flex-col gap-2 md:gap-4 basis-[450px] px-2">
        <form onSubmit={onSubmit}>
          <Card className="overflow-hidden shadow-sm dark:bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-wide text-slate-600 dark:text-white">
                CREATE ADMIN
                <div className="h-1 w-36 mt-0.5 bg-gradient-to-r from-[#9a6a39] to-[#eeba7e] dark:from-[#9a6a39] dark:to-[#9c7952]"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && error.__typename !== `${listKey}AuthenticationWithPasswordFailure` && (
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                className={cn(
                  "w-full text-md tracking-wide h-11 md:h-12 font-semibold text-white uppercase transition-all duration-200 ease-in-out bg-gradient-to-r from-[#8d5e32] to-[#d7a76e] [&:not(:disabled)]:hover:from-[#7d5322] [&:not(:disabled)]:hover:to-[#c79760] dark:from-[#8d5e32] dark:to-[#a37f53] [&:not(:disabled)]:dark:hover:from-[#7d5322] [&:not(:disabled)]:dark:hover:to-[#c79760] dark:text-gray-100",
                  {
                    "opacity-50 dark:from-zinc-800 dark:to-zinc-600 from-zinc-400 to-zinc-600":
                      loading ||
                      data?.authenticate?.__typename ===
                        `${listKey}AuthenticationWithPasswordSuccess`,
                  }
                )}
                isLoading={
                  loading ||
                  data?.authenticate?.__typename ===
                    `${listKey}AuthenticationWithPasswordSuccess`
                }
                type="submit"
                variant="light"
              >
                GET STARTED
              </Button>
            </CardFooter>
          </Card>
        </form>

        {error?.__typename === `${listKey}AuthenticationWithPasswordFailure` && (
          <Alert
            variant="destructive"
            className="mt-4 bg-red-100 dark:bg-red-900"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
