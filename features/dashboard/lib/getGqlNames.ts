/**
 * Get GraphQL names - Following Keystone's approach from types/utils.ts
 */

import pluralize from 'pluralize'

export function humanize(str: string) {
  return str
    .replace(/([a-z])([A-Z]+)/g, '$1 $2')
    .split(/\s|_|-/)
    .filter(i => i)
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ')
}

export type GraphQLNames = ReturnType<typeof getGqlNames>

export function getGqlNames({
  listKey,
  pluralGraphQLName,
}: {
  listKey: string
  pluralGraphQLName: string
}) {
  const lowerPluralName = pluralGraphQLName.charAt(0).toLowerCase() + pluralGraphQLName.slice(1)
  const lowerSingularName = listKey.charAt(0).toLowerCase() + listKey.slice(1)
  return {
    outputTypeName: listKey,
    whereInputName: `${listKey}WhereInput`,
    whereUniqueInputName: `${listKey}WhereUniqueInput`,

    // create
    createInputName: `${listKey}CreateInput`,
    createMutationName: `create${listKey}`,
    createManyMutationName: `create${pluralGraphQLName}`,
    relateToOneForCreateInputName: `${listKey}RelateToOneForCreateInput`,
    relateToManyForCreateInputName: `${listKey}RelateToManyForCreateInput`,

    // read
    itemQueryName: lowerSingularName,
    listQueryName: lowerPluralName,
    listQueryCountName: `${lowerPluralName}Count`,
    listOrderName: `${listKey}OrderByInput`,

    // update
    updateInputName: `${listKey}UpdateInput`,
    updateMutationName: `update${listKey}`,
    updateManyInputName: `${listKey}UpdateArgs`,
    updateManyMutationName: `update${pluralGraphQLName}`,
    relateToOneForUpdateInputName: `${listKey}RelateToOneForUpdateInput`,
    relateToManyForUpdateInputName: `${listKey}RelateToManyForUpdateInput`,

    // delete
    deleteMutationName: `delete${listKey}`,
    deleteManyMutationName: `delete${pluralGraphQLName}`,
  }
}

// Helper function to properly generate names with pluralization
// Following Keystone's __getNames pattern from types/utils.ts
export function getGraphQLNames(listKey: string, listMeta: { plural?: string }) {
  // First humanize the listKey to get a readable form
  const computedSingular = humanize(listKey)
  const computedPlural = pluralize.plural(computedSingular)
  
  // Use the plural from listMeta if provided, otherwise use computed
  const pluralGraphQLName = listMeta.plural || computedPlural
  
  return getGqlNames({ listKey, pluralGraphQLName })
}