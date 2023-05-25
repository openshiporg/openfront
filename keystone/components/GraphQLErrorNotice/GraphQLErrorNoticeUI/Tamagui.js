import React from "react";
import { Stack } from "tamagui";
import { Notice } from "@components/Notice";

export function Tamagui({ errors, networkError }) {
  if (networkError) {
    return (
      <Notice tone="negative" marginBottom="large">
        {networkError.message}
      </Notice>
    );
  }
  if (errors?.length) {
    return (
      <Stack gap="small" marginBottom="large">
        {errors.map((err, idx) => (
          <Notice tone="negative" key={idx}>
            {err.message}
          </Notice>
        ))}
      </Stack>
    );
  }
  return null;
}
