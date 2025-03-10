import { FieldContainer } from '../../components/FieldContainer';
import { FieldDescription } from '../../components/FieldDescription';
import { FieldLabel } from '../../components/FieldLabel';
import { TextInput } from '../../components/TextInput';
import { CellContainer } from '../../components/CellContainer';
import { CellLink } from '../../components/CellLink';
import { IntegerInput } from "./IntegerInput";

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation
}) => {
  const message = validate(
    value,
    field.validation,
    field.label,
    field.hasAutoIncrementDefault
  )

  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      {onChange ? (
        <span>
          <IntegerInput
            id={field.path}
            autoFocus={autoFocus}
            onChange={val => {
              onChange({ ...value, value: val })
            }}
            value={value.value}
            forceValidation={forceValidation}
            placeholder={
              field.hasAutoIncrementDefault && value.kind === "create"
                ? "Defaults to an incremented number"
                : undefined
            }
            validationMessage={message}
            aria-describedby={
              field.description === null
                ? undefined
                : `${field.path}-description`
            }
          />
        </span>
      ) : (
        value.value
      )}
    </FieldContainer>
  )
}

export const Cell = ({ item, field, linkTo }) => {
  let value = item[field.path] + ""
  return linkTo ? (
    <CellLink {...linkTo}>{value}</CellLink>
  ) : (
    <CellContainer>{value}</CellContainer>
  )
}
Cell.supportsLinkTo = true

export const CardValue = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path] === null ? "" : item[field.path]}
    </FieldContainer>
  )
}

function validate(value, validation, label, hasAutoIncrementDefault) {
  const val = value.value
  if (typeof val === "string") {
    return `${label} must be a whole number`
  }

  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === "update" && value.initial === null && val === null) {
    return undefined
  }

  if (
    value.kind === "create" &&
    value.value === null &&
    hasAutoIncrementDefault
  ) {
    return undefined
  }

  if (validation.isRequired && val === null) {
    return `${label} is required`
  }
  if (typeof val === "number") {
    if (val < validation.min) {
      return `${label} must be greater than or equal to ${validation.min}`
    }
    if (val > validation.max) {
      return `${label} must be less than or equal to ${validation.max}`
    }
  }

  return undefined
}

export const controller = config => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: {
      kind: "create",
      value:
        config.fieldMeta.defaultValue === "autoincrement"
          ? null
          : config.fieldMeta.defaultValue
    },
    deserialize: data => ({
      kind: "update",
      value: data[config.path],
      initial: data[config.path]
    }),
    serialize: value => ({ [config.path]: value.value }),
    hasAutoIncrementDefault: config.fieldMeta.defaultValue === "autoincrement",
    validate: value =>
      validate(
        value,
        config.fieldMeta.validation,
        config.label,
        config.fieldMeta.defaultValue === "autoincrement"
      ) === undefined,
    filter: {
      Filter({ autoFocus, type, onChange, value }) {
        return (
          <TextInput
            type="text"
            onChange={event => {
              if (type === "in" || type === "not_in") {
                onChange(event.target.value.replace(/[^\d,\s-]/g, ""))
                return
              }

              onChange(event.target.value.replace(/[^\d\s-]/g, ""))
            }}
            value={value}
            autoFocus={autoFocus}
          />
        )
      },

      graphql: ({ type, value }) => {
        const valueWithoutWhitespace = value.replace(/\s/g, "")
        const parsed =
          type === "in" || type === "not_in"
            ? valueWithoutWhitespace.split(",").map(x => parseInt(x))
            : parseInt(valueWithoutWhitespace)
        if (type === "not") {
          return { [config.path]: { not: { equals: parsed } } }
        }
        const key =
          type === "is" ? "equals" : type === "not_in" ? "notIn" : type
        return { [config.path]: { [key]: parsed } }
      },
      Label({ label, value, type }) {
        let renderedValue = value
        if (["in", "not_in"].includes(type)) {
          renderedValue = value
            .split(",")
            .map(value => value.trim())
            .join(", ")
        }
        return `${label.toLowerCase()}: ${renderedValue}`
      },
      types: {
        is: {
          label: "Is exactly",
          initialValue: ""
        },
        not: {
          label: "Is not exactly",
          initialValue: ""
        },
        gt: {
          label: "Is greater than",
          initialValue: ""
        },
        lt: {
          label: "Is less than",
          initialValue: ""
        },
        gte: {
          label: "Is greater than or equal to",
          initialValue: ""
        },
        lte: {
          label: "Is less than or equal to",
          initialValue: ""
        },
        in: {
          label: "Is one of",
          initialValue: ""
        },
        not_in: {
          label: "Is not one of",
          initialValue: ""
        }
      }
    }
  }
}
