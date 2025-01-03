import { Field as ClientField, Cell as ClientCell, CardValue as ClientCardValue } from "./RelationshipField";
import { getFormattedList } from "../../data/lists";
import { getAuthenticatedItem } from "../../data/auth";
import { RelationshipSelect } from "../../components/RelationshipSelect";

async function RelationshipField(props) {
  const [list, foreignList] = await Promise.all([
    getFormattedList(props.field.listKey),
    getFormattedList(props.field.refListKey)
  ]);
  const authenticatedItem = await getAuthenticatedItem();

  return (
    <ClientField
      {...props}
      list={list}
      foreignList={foreignList}
      authenticatedItem={{
        state: authenticatedItem ? "authenticated" : "unauthenticated",
        ...authenticatedItem,
        listKey: props.field.refListKey
      }}
    />
  );
}

async function RelationshipCell(props) {
  const list = await getFormattedList(props.field.refListKey);
  return <ClientCell {...props} list={list} />;
}

async function RelationshipCardValue(props) {
  const list = await getFormattedList(props.field.refListKey);
  return <ClientCardValue {...props} list={list} />;
}

async function RelationshipFilter({ onChange, value, config }) {
  const foreignList = await getFormattedList(config.fieldMeta.refListKey);
  const filterValues = value ? value.split(",").map(id => ({ id, label: id })) : [];
  
  return (
    <RelationshipSelect
      controlShouldRenderValue
      list={foreignList}
      labelField={config.fieldMeta.refLabelField}
      searchFields={config.fieldMeta.refSearchFields}
      isDisabled={onChange === undefined}
      state={{
        kind: "many",
        value: filterValues,
        onChange(newItems) {
          onChange(newItems.map((item) => item.id).join(","));
        },
      }}
    />
  );
}

export const Field = RelationshipField;
export const Cell = RelationshipCell;
export const CardValue = RelationshipCardValue;

export const controller = (config) => {
  const cardsDisplayOptions =
    config.fieldMeta.displayMode === "cards"
      ? {
          cardFields: config.fieldMeta.cardFields,
          inlineCreate: config.fieldMeta.inlineCreate,
          inlineEdit: config.fieldMeta.inlineEdit,
          linkToItem: config.fieldMeta.linkToItem,
          removeMode: config.fieldMeta.removeMode,
          inlineConnect: config.fieldMeta.inlineConnect,
        }
      : undefined;

  const refLabelField = config.fieldMeta.refLabelField;
  const refSearchFields = config.fieldMeta.refSearchFields;

  return {
    refFieldKey: config.fieldMeta.refFieldKey,
    many: config.fieldMeta.many,
    listKey: config.listKey,
    path: config.path,
    label: config.label,
    description: config.description,
    display:
      config.fieldMeta.displayMode === "count" ? "count" : "cards-or-select",
    refLabelField,
    refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    graphqlSelection:
      config.fieldMeta.displayMode === "count"
        ? `${config.path}Count`
        : `${config.path} {
              id
              label: ${refLabelField}
            }`,
    hideCreate: config.fieldMeta.hideCreate,
    // note we're not making the state kind: 'count' when ui.displayMode is set to 'count'.
    // that ui.displayMode: 'count' is really just a way to have reasonable performance
    // because our other UIs don't handle relationships with a large number of items well
    // but that's not a problem here since we're creating a new item so we might as well them a better UI
    defaultValue:
      cardsDisplayOptions !== undefined
        ? {
            kind: "cards-view",
            currentIds: new Set(),
            id: null,
            initialIds: new Set(),
            itemBeingCreated: false,
            itemsBeingEdited: new Set(),
            displayOptions: cardsDisplayOptions,
          }
        : config.fieldMeta.many
        ? {
            id: null,
            kind: "many",
            initialValue: [],
            value: [],
          }
        : { id: null, kind: "one", value: null, initialValue: null },
    deserialize: (data) => {
      if (config.fieldMeta.displayMode === "count") {
        return {
          id: data.id,
          kind: "count",
          count: data[`${config.path}Count`] ?? 0,
        };
      }
      if (cardsDisplayOptions !== undefined) {
        const initialIds = new Set(
          (Array.isArray(data[config.path])
            ? data[config.path]
            : data[config.path]
            ? [data[config.path]]
            : []
          ).map((x) => x.id)
        );
        return {
          kind: "cards-view",
          id: data.id,
          itemsBeingEdited: new Set(),
          itemBeingCreated: false,
          initialIds,
          currentIds: initialIds,
          displayOptions: cardsDisplayOptions,
        };
      }
      if (config.fieldMeta.many) {
        let value = (data[config.path] || []).map((x) => ({
          id: x.id,
          label: x.label || x.id,
        }));
        return {
          kind: "many",
          id: data.id,
          initialValue: value,
          value,
        };
      }
      let value = data[config.path];
      if (value) {
        value = {
          id: value.id,
          label: value.label || value.id,
        };
      }
      return {
        kind: "one",
        id: data.id,
        value,
        initialValue: value,
      };
    },
    filter: {
      Filter: ({ onChange, value }) => {
        const foreignList = useList(config.fieldMeta.refListKey);
        const { filterValues, loading } = useRelationshipFilterValues({
          value,
          list: foreignList,
        });
        const state = {
          kind: "many",
          value: filterValues,
          onChange(newItems) {
            onChange(newItems.map((item) => item.id).join(","));
          },
        };
        console.log({refLabelField, refSearchFields, value})
        return (
          <RelationshipSelect
            controlShouldRenderValue
            list={foreignList}
            labelField={refLabelField}
            searchFields={refSearchFields}
            isLoading={loading}
            isDisabled={onChange === undefined}
            state={state}
          />
        );
      },
      graphql: ({ value }) => {
        const foreignIds = getForeignIds(value);
        if (config.fieldMeta.many) {
          return {
            [config.path]: {
              some: {
                id: {
                  in: foreignIds,
                },
              },
            },
          };
        }
        return {
          [config.path]: {
            id: {
              in: foreignIds,
            },
          },
        };
      },
      Label({ value }) {
        const foreignList = useList(config.fieldMeta.refListKey);
        const { filterValues } = useRelationshipFilterValues({
          value,
          list: foreignList,
        });

        if (!filterValues.length) {
          return `has no value`;
        }
        if (filterValues.length > 1) {
          const values = filterValues.map((i) => i.label).join(", ");
          return `is in [${values}]`;
        }
        const optionLabel = filterValues[0].label;
        return `is ${optionLabel}`;
      },
      types: {
        matches: {
          label: "Matches",
          initialValue: "",
        },
      },
    },
    validate(value) {
      return (
        value.kind !== "cards-view" ||
        (value.itemsBeingEdited.size === 0 && !value.itemBeingCreated)
      );
    },
    serialize: (state) => {
      if (state.kind === "many") {
        const newAllIds = new Set(state.value.map((x) => x.id));
        const initialIds = new Set(state.initialValue.map((x) => x.id));
        let disconnect = state.initialValue
          .filter((x) => !newAllIds.has(x.id))
          .map((x) => ({ id: x.id }));
        let connect = state.value
          .filter((x) => !initialIds.has(x.id))
          .map((x) => ({ id: x.id }));
        if (disconnect.length || connect.length) {
          let output = {};

          if (disconnect.length) {
            output.disconnect = disconnect;
          }

          if (connect.length) {
            output.connect = connect;
          }

          return {
            [config.path]: output,
          };
        }
      } else if (state.kind === "one") {
        if (state.initialValue && !state.value) {
          return { [config.path]: { disconnect: true } };
        } else if (state.value && state.value.id !== state.initialValue?.id) {
          return {
            [config.path]: {
              connect: {
                id: state.value.id,
              },
            },
          };
        }
      } else if (state.kind === "cards-view") {
        let disconnect = [...state.initialIds]
          .filter((id) => !state.currentIds.has(id))
          .map((id) => ({ id }));
        let connect = [...state.currentIds]
          .filter((id) => !state.initialIds.has(id))
          .map((id) => ({ id }));

        if (config.fieldMeta.many) {
          if (disconnect.length || connect.length) {
            return {
              [config.path]: {
                connect: connect.length ? connect : undefined,
                disconnect: disconnect.length ? disconnect : undefined,
              },
            };
          }
        } else if (connect.length) {
          return {
            [config.path]: {
              connect: connect[0],
            },
          };
        } else if (disconnect.length) {
          return { [config.path]: { disconnect: true } };
        }
      }
      return {};
    },
  };
};

function getForeignIds(value) {
  if (typeof value === "string" && value.length > 0) {
    return value.split(",");
  }
  return [];
}
