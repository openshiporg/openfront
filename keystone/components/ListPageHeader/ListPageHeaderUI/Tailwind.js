import { Fragment } from "react";
import { Heading } from "@keystone-ui/core";
import { useList } from "@keystone/keystoneProviderNoUI";

export const Tailwind = ({ listKey }) => {
  const list = useList(listKey);
  return (
    <Fragment>
      <div
        css={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "space-between"
        }}
      >
        <Heading type="h3">{list.label}</Heading>
      </div>
    </Fragment>
  );
};
