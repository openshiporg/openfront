import { AdminLink } from "@keystone/components/AdminLink";
import { Button } from "../../primitives/default/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export const CreateButtonLink = (props) => {
  return (
    <AdminLink href={`/${props.list.path}/create`}>
      <Button color="blue">
        <PlusCircledIcon className="mr-2 h-4 w-4" /> Create{" "}
        {props.list.singular}
      </Button>
    </AdminLink>
  );
};
