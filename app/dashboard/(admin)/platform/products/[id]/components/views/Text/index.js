import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useId, useState } from "react";

function validate(value, validation, fieldLabel) {
  if (value.inner.kind === "null") {
    if (validation?.isRequired) {
      return [`${fieldLabel} is required`];
    }
    return [];
  }

  const val = value.inner.value;
  let messages = [];

  if (validation?.length?.min !== null && val.length < validation.length.min) {
    if (validation.length.min === 1) {
      messages.push(`${fieldLabel} must not be empty`);
    } else {
      messages.push(`${fieldLabel} must be at least ${validation.length.min} characters long`);
    }
  }
  if (validation?.length?.max !== null && val.length > validation.length.max) {
    messages.push(`${fieldLabel} must be no longer than ${validation.length.max} characters`);
  }
  if (validation?.match && !validation.match.regex.test(val)) {
    messages.push(validation.match.explanation || `${fieldLabel} must match ${validation.match.regex}`);
  }
  return messages;
}

export const Field = ({ 
  field, 
  value, 
  onChange, 
  autoFocus,
  forceValidation 
}) => {
  const id = useId();
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const validationMessages = validate(value, field.validation, field.label);
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{field.label}</Label>
      <Input
        id={id}
        autoFocus={autoFocus}
        onChange={event => {
          onChange?.({
            ...value,
            inner: { kind: 'value', value: event.target.value }
          });
        }}
        value={value.inner.kind === 'null' ? '' : value.inner.value}
        disabled={onChange === undefined || value.inner.kind === 'null'}
        placeholder={field.label}
        onBlur={() => setShouldShowErrors(true)}
      />
      {!!validationMessages.length && (shouldShowErrors || forceValidation) && (
        validationMessages.map((message, i) => (
          <span key={i} className="text-red-600 dark:text-red-700 text-sm">
            {message}
          </span>
        ))
      )}
    </div>
  );
};

// We need these exports for Keystone's field system
export const Cell = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return value;
};

export const CardValue = ({ item, field }) => {
  return item[field.path];
};

function deserializeTextValue(value) {
  if (value === null) {
    return { kind: 'null', prev: '' };
  }
  return { kind: 'value', value };
}

export const controller = (config) => {
  const validation = {
    isRequired: config.fieldMeta?.validation?.isRequired,
    length: config.fieldMeta?.validation?.length,
    match: config.fieldMeta?.validation?.match ? {
      regex: new RegExp(
        config.fieldMeta.validation.match.regex.source,
        config.fieldMeta.validation.match.regex.flags
      ),
      explanation: config.fieldMeta.validation.match.explanation,
    } : null,
  };

  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: {
      kind: 'create',
      inner: deserializeTextValue(config.fieldMeta?.defaultValue)
    },
    deserialize: data => {
      const inner = deserializeTextValue(data[config.path]);
      return { kind: 'update', inner, initial: inner };
    },
    serialize: value => ({
      [config.path]: value.inner.kind === 'null' ? null : value.inner.value
    }),
    validation,
  };
}; 