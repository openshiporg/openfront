import "../styles/globals.css";
import { Core } from "@keystone-ui/core";
import { ErrorBoundary } from "@keystone-6/core/admin-ui/components";
import { KeystoneProvider } from "@keystone-6/core/admin-ui/context";
// import { createSystem } from "@keystone-6/core/system/dist/keystone-6-core-system.esm";
import {
  executeSync,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  parse,
  FragmentDefinitionNode,
  SelectionNode,
  ExecutionResult,
  Kind,
} from "graphql";

import * as view0 from "@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view";
import * as view1 from "@keystone-6/core/fields/types/text/views";
import * as view2 from "@keystone-6/core/fields/types/password/views";
import * as view3 from "@keystone-6/core/fields/types/relationship/views";
import * as view4 from "@keystone-6/core/fields/types/json/views";
import * as view5 from "@keystone-6/core/fields/types/timestamp/views";
import * as view6 from "@keystone-6/core/fields/types/checkbox/views";
import * as view7 from "@keystone-6/core/fields/types/select/views";
import * as view8 from "@keystone-6/core/fields/types/integer/views";
import * as view9 from "@keystone-6/core/fields/types/float/views";
import * as view10 from "@keystone-6/core/fields/types/image/views";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

var adminConfig = {};

export default function App({ Component, pageProps }) {
  const allViews = [];
  const pathname = usePathname();
  const router = useRouter();

  // big ol' monkey patch below to make all links inside /admin route prepend "/admin"
  // we do this because keystone Admin UI is meant to run on index route
  // useEffect(() => {
  //   if (!pathname?.startsWith('/admin')) return;
  
  //   const adminPathname = (path) => (path.startsWith('/admin') ? path : `/admin${path}`);
  
  //   const handleClick = (event) => {
  //     let target = event.target;
  //     while (target && target.tagName !== 'A' && target.tagName !== 'BODY') {
  //       target = target.parentNode;
  //     }
  //     if (target && target.tagName === 'A') {
  //       event.preventDefault();
  //       const href = target.getAttribute('href');
  //       if (href.startsWith('/')) router.push(adminPathname(href));
  //     }
  //   };
  
  //   const replaceLinks = () => {
  //     const links = document.getElementsByTagName("a");
  //     for (let i = 0; i < links.length; i++) {
  //       const link = links[i];
  //       const isInternalLink = link.getAttribute("href").startsWith("/");
  //       if (isInternalLink) {
  //         link.removeEventListener("click", handleClick);
  //         link.addEventListener("click", handleClick);
  //       }
  //     }
  //   };
  
  //   replaceLinks();
  
  //   const observerOptions = {
  //     childList: true,
  //     subtree: true,
  //   };
  
  //   const observer = new MutationObserver((mutationsList) => {
  //     for (let mutation of mutationsList) {
  //       if (mutation.type === "childList") {
  //         replaceLinks();
  //       }
  //     }
  //   });
  //   observer.observe(document.documentElement, observerOptions);
  
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [pathname, router]);

  useEffect(() => {
    if (!pathname.startsWith("/admin")) return;

    const adminPathname = (path) => (path.startsWith("/admin") ? path : `/admin${path}`);

    const handleClick = (event) => {
      const target = event.target.closest("a");
      if (!target) return;

      event.preventDefault();
      const href = target.getAttribute("href");
      if (href.startsWith("/")) router.push(adminPathname(href));
    };

    const replaceLinks = () => {
      const links = document.querySelectorAll("a[href^='/']");
      links.forEach((link) => {
        link.removeEventListener("click", handleClick);
        link.addEventListener("click", handleClick);
    
        const href = link.getAttribute("href");
        if (!href.startsWith("/admin")) {
          link.setAttribute("href", `/admin${href}`);
        }
      });
    };

    replaceLinks();

    const observer = new MutationObserver(() => replaceLinks());
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname, router]);

  return (
    <Core>
      <KeystoneProvider
        // lazyMetadataQuery={JSON.stringify(
        //   getLazyMetadataQuery(graphQLSchema, adminMeta)
        // )}
        lazyMetadataQuery={{
          kind: "Document",
          definitions: [
            {
              kind: "OperationDefinition",
              operation: "query",
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: {
                      kind: "Name",
                      value: "keystone",
                      loc: { start: 22, end: 30 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "Field",
                          name: {
                            kind: "Name",
                            value: "adminMeta",
                            loc: { start: 39, end: 48 },
                          },
                          arguments: [],
                          directives: [],
                          selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                              {
                                kind: "Field",
                                name: {
                                  kind: "Name",
                                  value: "lists",
                                  loc: { start: 59, end: 64 },
                                },
                                arguments: [],
                                directives: [],
                                selectionSet: {
                                  kind: "SelectionSet",
                                  selections: [
                                    {
                                      kind: "Field",
                                      name: {
                                        kind: "Name",
                                        value: "key",
                                        loc: { start: 77, end: 80 },
                                      },
                                      arguments: [],
                                      directives: [],
                                      loc: { start: 77, end: 80 },
                                    },
                                    {
                                      kind: "Field",
                                      name: {
                                        kind: "Name",
                                        value: "isHidden",
                                        loc: { start: 91, end: 99 },
                                      },
                                      arguments: [],
                                      directives: [],
                                      loc: { start: 91, end: 99 },
                                    },
                                    {
                                      kind: "Field",
                                      name: {
                                        kind: "Name",
                                        value: "fields",
                                        loc: { start: 110, end: 116 },
                                      },
                                      arguments: [],
                                      directives: [],
                                      selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                          {
                                            kind: "Field",
                                            name: {
                                              kind: "Name",
                                              value: "path",
                                              loc: { start: 131, end: 135 },
                                            },
                                            arguments: [],
                                            directives: [],
                                            loc: { start: 131, end: 135 },
                                          },
                                          {
                                            kind: "Field",
                                            name: {
                                              kind: "Name",
                                              value: "createView",
                                              loc: { start: 148, end: 158 },
                                            },
                                            arguments: [],
                                            directives: [],
                                            selectionSet: {
                                              kind: "SelectionSet",
                                              selections: [
                                                {
                                                  kind: "Field",
                                                  name: {
                                                    kind: "Name",
                                                    value: "fieldMode",
                                                    loc: {
                                                      start: 175,
                                                      end: 184,
                                                    },
                                                  },
                                                  arguments: [],
                                                  directives: [],
                                                  loc: { start: 175, end: 184 },
                                                },
                                              ],
                                              loc: { start: 159, end: 198 },
                                            },
                                            loc: { start: 148, end: 198 },
                                          },
                                        ],
                                        loc: { start: 117, end: 210 },
                                      },
                                      loc: { start: 110, end: 210 },
                                    },
                                  ],
                                  loc: { start: 65, end: 220 },
                                },
                                loc: { start: 59, end: 220 },
                              },
                            ],
                            loc: { start: 49, end: 228 },
                          },
                          loc: { start: 39, end: 228 },
                        },
                      ],
                      loc: { start: 31, end: 234 },
                    },
                    loc: { start: 22, end: 234 },
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "authenticatedItem" },
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "InlineFragment",
                          typeCondition: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "User" },
                          },
                          selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "id" },
                              },
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "name" },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }}
        fieldViews={[
          view0,
          view1,
          view2,
          view3,
          view4,
          view5,
          view6,
          view7,
          view8,
          view9,
          view10,
        ]}
        adminMetaHash="p7mmo"
        adminConfig={adminConfig}
        apiPath="/api/graphql"
      >
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </KeystoneProvider>
    </Core>
  );
}

function getLazyMetadataQuery(graphqlSchema, adminMeta) {
  const selections = parse(`fragment x on y {
    keystone {
      adminMeta {
        lists {
          key
          isHidden
          fields {
            path
            createView {
              fieldMode
            }
          }
        }
      }
    }
  }`).definitions[0].selectionSet.selections;

  const queryType = graphqlSchema.getQueryType();
  if (queryType) {
    const getListByKey = (name) =>
      adminMeta.lists.find(({ key }) => key === name);
    const fields = queryType.getFields();
    if (fields["authenticatedItem"] !== undefined) {
      const authenticatedItemType = fields["authenticatedItem"].type;
      if (
        !(authenticatedItemType instanceof GraphQLUnionType) ||
        authenticatedItemType.name !== "AuthenticatedItem"
      ) {
        throw new Error(
          `The type of Query.authenticatedItem must be a type named AuthenticatedItem and be a union of types that refer to Keystone lists but it is "${authenticatedItemType.toString()}"`
        );
      }
      for (const type of authenticatedItemType.getTypes()) {
        const fields = type.getFields();
        const list = getListByKey(type.name);
        if (list === undefined) {
          throw new Error(
            `All members of the AuthenticatedItem union must refer to Keystone lists but "${type.name}" is in the AuthenticatedItem union but is not a Keystone list`
          );
        }
        let labelGraphQLField = fields[list.labelField];
        if (labelGraphQLField === undefined) {
          throw new Error(
            `The labelField for the list "${list.key}" is "${list.labelField}" but the GraphQL type does not have a field named "${list.labelField}"`
          );
        }
        let labelGraphQLFieldType = labelGraphQLField.type;
        if (labelGraphQLFieldType instanceof GraphQLNonNull) {
          labelGraphQLFieldType = labelGraphQLFieldType.ofType;
        }
        if (!(labelGraphQLFieldType instanceof GraphQLScalarType)) {
          throw new Error(
            `Label fields must be scalar GraphQL types but the labelField "${list.labelField}" on the list "${list.key}" is not a scalar type`
          );
        }
        const requiredArgs = labelGraphQLField.args.filter(
          (arg) =>
            arg.defaultValue === undefined && arg.type instanceof GraphQLNonNull
        );
        if (requiredArgs.length) {
          throw new Error(
            `Label fields must have no required arguments but the labelField "${list.labelField}" on the list "${list.key}" has a required argument "${requiredArgs[0].name}"`
          );
        }
      }

      selections.push({
        kind: Kind.FIELD,
        name: { kind: Kind.NAME, value: "authenticatedItem" },
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: authenticatedItemType.getTypes().map(({ name }) => ({
            kind: Kind.INLINE_FRAGMENT,
            typeCondition: {
              kind: Kind.NAMED_TYPE,
              name: { kind: Kind.NAME, value: name },
            },
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "id" } },
                {
                  kind: Kind.FIELD,
                  name: {
                    kind: Kind.NAME,
                    value: getListByKey(name).labelField,
                  },
                },
              ],
            },
          })),
        },
      });
    }
  }

  // We're returning the complete query AST here for explicit-ness
  return {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "query",
        selectionSet: { kind: "SelectionSet", selections },
      },
    ],
  };
}
