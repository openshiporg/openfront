import { Fragment } from "react";
import { Heading } from "@keystone-ui/core";
import { useList } from "@keystone/keystoneProvider";

export const ListPageHeader = ({ listKey }) => {
  const list = useList(listKey);
  return (
    <Fragment>
      <div
        css={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <h3>{list.label}</h3>
      </div>
    </Fragment>
  );
};
