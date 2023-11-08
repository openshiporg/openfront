import { Fragment } from "react";
import { Stack, Text } from "@keystone-ui/core";
import { Popover } from "@keystone-ui/popover";
import { MoreHorizontalIcon } from "@keystone-ui/icons/icons/MoreHorizontalIcon";
import { ChevronRightIcon } from "@keystone-ui/icons/icons/ChevronRightIcon";
import { useKeystone } from "@keystone/keystoneProvider";
import { AdminLink } from "@keystone/components/AdminLink";

import { SignoutButton } from "@keystone/components/SignoutButton";
import { usePathname } from "next/navigation";
import { Button } from "../../primitives/default/ui/button";

export const NavItem = ({ href, children, isSelected: _isSelected }) => {
  const pathname = usePathname();

  const isSelected =
    _isSelected !== undefined ? _isSelected : pathname === href;
  return (
    <li>
      <AdminLink
        aria-current={isSelected ? "location" : false}
        href={href}
        className="rounded-r-md bg-transparent rounded-br-xs rounded-tr-xs text-foreground block font-medium mb-1 mr-8 p-2 px-8 relative no-underline hover:bg-blue-200 hover:text-blue-700"
      >
        {children}
      </AdminLink>
    </li>
  );
};

const AuthenticatedItemDialog = ({ item }) => {
  const { apiPath } = useKeystone();
  return (
    <div className="items-center flex justify-between m-8 mb-0">
      {item && item.state === "authenticated" ? (
        <div className="text-sm">
          Signed in as <strong className="block">{item.label}</strong>
        </div>
      ) : (
        process.env.NODE_ENV !== "production" && (
          <div className="text-sm">GraphQL Playground and Docs</div>
        )
      )}

      {process.env.NODE_ENV === "production" ? (
        item && item.state === "authenticated" && <SignoutButton />
      ) : (
        <Popover
          placement="bottom"
          triggerRenderer={({ triggerProps }) => (
            <Button
              size="sm"
              variant="secondary"
              style={{ padding: 0, width: 36 }}
              aria-label="Links and signout"
              {...triggerProps}
            >
              <MoreHorizontalIcon />
            </Button>
          )}
        >
          <Stack gap="medium" padding="large" dividers="between">
            <PopoverLink target="_blank" href={apiPath}>
              API Explorer
            </PopoverLink>
            <PopoverLink
              target="_blank"
              href="https://github.com/keystonejs/keystone"
            >
              GitHub Repository
            </PopoverLink>
            <PopoverLink target="_blank" href="https://keystonejs.com">
              Keystone Documentation
            </PopoverLink>
            {item && item.state === "authenticated" && <SignoutButton />}
          </Stack>
        </Popover>
      )}
    </div>
  );
};

const PopoverLink = ({ children, ...props }) => {
  return (
    <a className="items-center flex text-sm no-underline" {...props}>
      {children}
      <ChevronRightIcon size="small" />
    </a>
  );
};

export const NavigationContainer = ({ authenticatedItem, children }) => {
  return (
    <div className="flex flex-col justify-center relative border-r">
      <AuthenticatedItemDialog item={authenticatedItem} />
      <nav role="navigation" aria-label="Side Navigation" className="mt-10">
        <ul className="p-0 m-0">{children}</ul>
      </nav>
    </div>
  );
};

export const ListNavItem = ({ list }) => {
  const pathname = usePathname();

  return (
    <NavItem
      isSelected={pathname.split("/")[1] === `/${list.path}`.split("/")[1]}
      href={`/${list.path}${list.isSingleton ? "/1" : ""}`}
    >
      {list.label}
    </NavItem>
  );
};

export const ListNavItems = ({ lists = [], include = [] }) => {
  const renderedList =
    include.length > 0 ? lists.filter((i) => include.includes(i.key)) : lists;

  return (
    <Fragment>
      {renderedList.map((list) => {
        return <ListNavItem key={list.key} list={list} />;
      })}
    </Fragment>
  );
};

export const Navigation = () => {
  const {
    adminMeta: { lists },
    adminConfig,
    authenticatedItem,
    visibleLists,
  } = useKeystone();

  if (visibleLists.state === "loading") return null;
  // This visible lists error is critical and likely to result in a server restart
  // if it happens, we'll show the error and not render the navigation component/s
  if (visibleLists.state === "error") {
    return (
      <Text as="span" paddingLeft="xlarge" className="text-red-500">
        {visibleLists.error instanceof Error
          ? visibleLists.error.message
          : visibleLists.error[0].message}
      </Text>
    );
  }
  const renderableLists = Object.keys(lists)
    .map((key) => {
      if (!visibleLists.lists.has(key)) return null;
      return lists[key];
    })
    .filter((x) => Boolean(x));

  if (adminConfig?.components?.Navigation) {
    return (
      <adminConfig.components.Navigation
        authenticatedItem={authenticatedItem}
        lists={renderableLists}
      />
    );
  }

  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      <ListNavItems lists={renderableLists} />
    </NavigationContainer>
  );
};
