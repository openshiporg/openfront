import { useMemo, useState } from "react";

import isDeepEqual from "fast-deep-equal";
import { useRouter } from "next/navigation";

import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import {
  serializeValueToObjByFieldKey,
  useInvalidFields,
} from "@keystone-6/core/admin-ui/utils";
import { useRedirect } from "@keystone/utils/useRedirect";
import { useReinitContext, useKeystone } from "@keystone/keystoneProviderNoUI";
import { InitUI } from "./InitUI";

export function InitPage({
  fieldPaths = ["name", "email", "password"],
  listKey = "User",
  enableWelcome,
}) {
  const { adminMeta } = useKeystone();
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

  const [createFirstItem, { loading, error, data }] =
    useMutation(gql`mutation($data: CreateInitial${listKey}Input!) {
    authenticate: createInitial${listKey}(data: $data) {
      ... on ${listKey}AuthenticationWithPasswordSuccess {
        item {
          id
        }
      }
    }
  }`);
  const reinitContext = useReinitContext();
  const router = useRouter();
  const redirect = useRedirect();

  const onSubmit = async (event) => {
    event.preventDefault();
    // Check if there are any invalidFields
    const newForceValidation = invalidFields.size !== 0;
    setForceValidation(newForceValidation);

    // if yes, don't submit the form
    if (newForceValidation) return;

    // If not we serialize the data
    const data = {};
    const allSerializedValues = serializeValueToObjByFieldKey(fields, value);

    for (const fieldPath of Object.keys(allSerializedValues)) {
      const { controller } = fields[fieldPath];
      const serialized = allSerializedValues[fieldPath];
      // we check the serialized values against the default values on the controller
      if (
        !isDeepEqual(serialized, controller.serialize(controller.defaultValue))
      ) {
        // if they're different add them to the data object.
        Object.assign(data, serialized);
      }
    }

    try {
      await createFirstItem({
        variables: {
          data,
        },
      });
    } catch (e) {
      console.error(e);
      return;
    }

    await reinitContext();

    if (enableWelcome) return setMode("welcome");
    router.push(redirect);
  };

  const onComplete = () => {
    router.push(redirect);
  };

  const appTheme = process.env.NEXT_PUBLIC_APP_THEME || "KeystoneUI";
  const InitTemplate = InitUI[appTheme];

  return (
    <InitTemplate
      onSubmit={onSubmit}
      error={error}
      fields={fields}
      forceValidation={forceValidation}
      invalidFields={invalidFields}
      setValue={setValue}
      value={value}
      loading={loading}
      data={data}
      listKey={listKey}
    />
  );
}
