/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, useTheme } from "@keystone-ui/core"
import { Trash2Icon } from "@keystone-ui/icons/icons/Trash2Icon"
import { Tooltip } from "@keystone-ui/tooltip"
import { useMemo, useState, useCallback, Fragment } from "react"
import { useSelected } from "slate-react"
import { Stack } from "@keystone-ui/core"
import { Button as UIButton } from "@keystone-ui/button"
import { ToolbarGroup, ToolbarButton, ToolbarSeparator } from "@keystone/primitives"
import { NotEditable } from "./api"
import { clientSideValidateProp } from "./utils"
import { FormValueContentFromPreviewProps } from "./form-from-preview"

export function ChromefulComponentBlockElement(props) {
  const selected = useSelected()
  const { colors, fields, spacing, typography } = useTheme()

  const isValid = useMemo(
    () =>
      clientSideValidateProp(
        { kind: "object", fields: props.componentBlock.schema },
        props.elementProps
      ),
    [props.componentBlock, props.elementProps]
  )

  const [editMode, setEditMode] = useState(false)
  const onCloseEditMode = useCallback(() => {
    setEditMode(false)
  }, [])
  const onShowEditMode = useCallback(() => {
    setEditMode(true)
  }, [])

  const ChromefulToolbar =
    props.componentBlock.toolbar ?? DefaultToolbarWithChrome
  return (
    <div
      {...props.attributes}
      css={{
        marginBottom: spacing.xlarge,
        marginTop: spacing.xlarge,
        paddingLeft: spacing.xlarge,
        position: "relative",
        ":before": {
          content: '" "',
          backgroundColor: selected
            ? colors.focusRing
            : editMode
            ? colors.linkColor
            : colors.border,
          borderRadius: 4,
          width: 4,
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1
        }
      }}
    >
      <NotEditable
        css={{
          color: fields.legendColor,
          display: "block",
          fontSize: typography.fontSize.small,
          fontWeight: typography.fontWeight.bold,
          lineHeight: 1,
          marginBottom: spacing.small,
          textTransform: "uppercase"
        }}
      >
        {props.componentBlock.label}
      </NotEditable>
      {editMode ? (
        <Fragment>
          <FormValue
            isValid={isValid}
            props={props.previewProps}
            onClose={onCloseEditMode}
          />
          <div css={{ display: "none" }}>{props.children}</div>
        </Fragment>
      ) : (
        <Fragment>
          {props.renderedBlock}
          <ChromefulToolbar
            isValid={isValid}
            onRemove={props.onRemove}
            onShowEditMode={onShowEditMode}
            props={props.previewProps}
          />
        </Fragment>
      )}
    </div>
  )
}

function DefaultToolbarWithChrome({ onShowEditMode, onRemove, isValid }) {
  const theme = useTheme()
  return (
    <ToolbarGroup as={NotEditable} marginTop="small">
      <ToolbarButton
        onClick={() => {
          onShowEditMode()
        }}
      >
        Edit
      </ToolbarButton>
      <ToolbarSeparator />
      <Tooltip content="Remove" weight="subtle">
        {attrs => (
          <ToolbarButton
            variant="destructive"
            onClick={() => {
              onRemove()
            }}
            {...attrs}
          >
            <Trash2Icon size="small" />
          </ToolbarButton>
        )}
      </Tooltip>
      {!isValid && (
        <Fragment>
          <ToolbarSeparator />
          <span
            css={{
              color: theme.palette.red500,
              display: "flex",
              alignItems: "center",
              paddingLeft: theme.spacing.small
            }}
          >
            Please edit the form, there are invalid fields.
          </span>
        </Fragment>
      )}
    </ToolbarGroup>
  )
}

function FormValue({ onClose, props, isValid }) {
  const [forceValidation, setForceValidation] = useState(false)

  return (
    <Stack gap="xlarge" contentEditable={false}>
      <FormValueContentFromPreviewProps
        {...props}
        forceValidation={forceValidation}
      />
      <UIButton
        size="small"
        tone="active"
        weight="bold"
        onClick={() => {
          if (isValid) {
            onClose()
          } else {
            setForceValidation(true)
          }
        }}
      >
        Done
      </UIButton>
    </Stack>
  )
}
