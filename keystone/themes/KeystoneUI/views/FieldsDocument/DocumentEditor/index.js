/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from "@keystone-ui/core";
import { useContext, useState } from "react";
import isHotkey from "is-hotkey";
import { useCallback, useMemo } from "react";
import {
  Editor,
  Node,
  Range,
  Transforms,
  createEditor,
  Element,
  Text,
  Path,
} from "slate";
import { Editable, ReactEditor, Slate, useSlate, withReact } from "slate-react";
import { withHistory } from "slate-history";

import { withParagraphs } from "./paragraphs";
import { withLink, wrapLink } from "./link";
import { withLayouts } from "./layouts";
import { clearFormatting } from "./utils";
import { Toolbar } from "./Toolbar";
import { renderElement } from "./render-element";
import { withHeading } from "./heading";
import { nestList, unnestList, withList } from "./lists";
import { ComponentBlockContext, withComponentBlocks } from "./component-blocks";
import { getPlaceholderTextForPropPath } from "./component-blocks/utils";
import { withBlockquote } from "./blockquote";
import { withRelationship } from "./relationship";
import { withDivider } from "./divider";
import { withCodeBlock } from "./code-block";
import { withMarks } from "./marks";
import { renderLeaf } from "./leaf";
import { withSoftBreaks } from "./soft-breaks";
import { withShortcuts } from "./shortcuts";
import { withDocumentFeaturesNormalization } from "./document-features-normalization";
import { ToolbarStateProvider } from "./toolbar-state";
import { withInsertMenu } from "./insert-menu";
import { withBlockMarkdownShortcuts } from "./block-markdown-shortcuts";
import { withPasting } from "./pasting";

// the docs site needs access to Editor and importing slate would use the version from the content field
// so we're exporting it from here (note that this is not at all visible in the published version)
export { Editor } from "slate";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
};

function isMarkActive(editor, mark) {
  const marks = Editor.marks(editor);
  if (marks?.[mark]) {
    return true;
  }
  // see the stuff about marks in toolbar-state for why this is here
  for (const entry of Editor.nodes(editor, { match: Text.isText })) {
    if (entry[0][mark]) {
      return true;
    }
  }
  return false;
}

const getKeyDownHandler = (editor) => (event) => {
  if (event.defaultPrevented) return;
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event.nativeEvent)) {
      event.preventDefault();
      const mark = HOTKEYS[hotkey];
      const isActive = isMarkActive(editor, mark);
      if (isActive) {
        Editor.removeMark(editor, mark);
      } else {
        Editor.addMark(editor, mark, true);
      }
      return;
    }
  }
  if (isHotkey("mod+\\", event.nativeEvent)) {
    clearFormatting(editor);
    return;
  }
  if (isHotkey("mod+k", event.nativeEvent)) {
    event.preventDefault();
    wrapLink(editor, "");
    return;
  }
  if (event.key === "Tab") {
    const didAction = event.shiftKey ? unnestList(editor) : nestList(editor);
    if (didAction) {
      event.preventDefault();
      return;
    }
  }
  if (event.key === "Tab" && editor.selection) {
    const layoutArea = Editor.above(editor, {
      match: (node) => node.type === "layout-area",
    });
    if (layoutArea) {
      const layoutAreaToEnter = event.shiftKey
        ? Editor.before(editor, layoutArea[1], { unit: "block" })
        : Editor.after(editor, layoutArea[1], { unit: "block" });
      Transforms.setSelection(editor, {
        anchor: layoutAreaToEnter,
        focus: layoutAreaToEnter,
      });
      event.preventDefault();
    }
  }
};

export function createDocumentEditor(
  documentFeatures,
  componentBlocks,
  relationships
) {
  return withPasting(
    withSoftBreaks(
      withBlocksSchema(
        withLink(
          documentFeatures,
          componentBlocks,
          withList(
            withHeading(
              withRelationship(
                withInsertMenu(
                  withComponentBlocks(
                    componentBlocks,
                    documentFeatures,
                    relationships,
                    withParagraphs(
                      withShortcuts(
                        withDivider(
                          withLayouts(
                            withMarks(
                              documentFeatures,
                              componentBlocks,
                              withCodeBlock(
                                withBlockMarkdownShortcuts(
                                  documentFeatures,
                                  componentBlocks,
                                  withBlockquote(
                                    withDocumentFeaturesNormalization(
                                      documentFeatures,
                                      relationships,
                                      withHistory(withReact(createEditor()))
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}

export function DocumentEditor({
  onChange,
  value,
  componentBlocks,
  relationships,
  documentFeatures,
  initialExpanded = false,
  ...props
}) {
  const { radii, colors, spacing, fields } = useTheme();
  const [expanded, setExpanded] = useState(initialExpanded);
  const editor = useMemo(
    () =>
      createDocumentEditor(documentFeatures, componentBlocks, relationships),
    [documentFeatures, componentBlocks, relationships]
  );

  return (
    <DocumentEditorProvider
      componentBlocks={componentBlocks}
      documentFeatures={documentFeatures}
      relationships={relationships}
      editor={editor}
      value={value}
      onChange={(value) => {
        onChange?.(value);
        // this fixes a strange issue in Safari where the selection stays inside of the editor
        // after a blur event happens but the selection is still in the editor
        // so the cursor is visually in the wrong place and it inserts text backwards
        const selection = window.getSelection();
        if (selection && !ReactEditor.isFocused(editor)) {
          const editorNode = ReactEditor.toDOMNode(editor, editor);
          if (selection.anchorNode === editorNode) {
            ReactEditor.focus(editor);
          }
        }
      }}
    >
      {useMemo(
        () =>
          onChange !== undefined && (
            <Toolbar
              documentFeatures={documentFeatures}
              viewState={{
                expanded,
                toggle: () => {
                  setExpanded((v) => !v);
                },
              }}
            />
          ),
        [expanded, documentFeatures, onChange]
      )}

      <DocumentEditorEditable
        css={[
          {
            borderRadius: "inherit",
            background: fields.focus.inputBackground,
            borderColor: fields.inputBorderColor,
            paddingLeft: spacing.medium,
            paddingRight: spacing.medium,
            minHeight: 120,
            scrollbarGutter: "stable",
            // the !important is necessary to override the width set by resizing as an inline style
            height: expanded ? "auto !important" : 224,
            resize: expanded ? undefined : "vertical",
            overflowY: "auto",
          },
        ]}
        {...props}
        readOnly={onChange === undefined}
      />
      {
        // for debugging
        false && <Debugger />
      }
    </DocumentEditorProvider>
  );
}

export function DocumentEditorProvider({
  children,
  editor,
  onChange,
  value,
  componentBlocks,
  documentFeatures,
  relationships,
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const identity = useMemo(() => Math.random().toString(36), [editor]);
  return (
    <Slate
      // this fixes issues with Slate crashing when a fast refresh occcurs
      key={identity}
      editor={editor}
      value={value}
      onChange={(value) => {
        onChange(value);
        // this fixes a strange issue in Safari where the selection stays inside of the editor
        // after a blur event happens but the selection is still in the editor
        // so the cursor is visually in the wrong place and it inserts text backwards
        const selection = window.getSelection();
        if (selection && !ReactEditor.isFocused(editor)) {
          const editorNode = ReactEditor.toDOMNode(editor, editor);
          if (selection.anchorNode === editorNode) {
            ReactEditor.focus(editor);
          }
        }
      }}
    >
      <ToolbarStateProvider
        componentBlocks={componentBlocks}
        editorDocumentFeatures={documentFeatures}
        relationships={relationships}
      >
        {children}
      </ToolbarStateProvider>
    </Slate>
  );
}

export function DocumentEditorEditable(props) {
  const editor = useSlate();
  const componentBlocks = useContext(ComponentBlockContext);

  const onKeyDown = useMemo(() => getKeyDownHandler(editor), [editor]);

  return (
    <Editable
      decorate={useCallback(
        ([node, path]) => {
          let decorations = [];
          if (node.type === "component-block") {
            if (
              node.children.length === 1 &&
              Element.isElement(node.children[0]) &&
              node.children[0].type === "component-inline-prop" &&
              node.children[0].propPath === undefined
            ) {
              return decorations;
            }
            node.children.forEach((child, index) => {
              if (
                Node.string(child) === "" &&
                Element.isElement(child) &&
                (child.type === "component-block-prop" ||
                  child.type === "component-inline-prop") &&
                child.propPath !== undefined
              ) {
                const start = Editor.start(editor, [...path, index]);
                const placeholder = getPlaceholderTextForPropPath(
                  child.propPath,
                  componentBlocks[node.component].schema,
                  node.props
                );
                if (placeholder) {
                  decorations.push({
                    placeholder,
                    anchor: start,
                    focus: start,
                  });
                }
              }
            });
          }
          return decorations;
        },
        [editor, componentBlocks]
      )}
      css={styles}
      onKeyDown={onKeyDown}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      {...props}
    />
  );
}

function Debugger() {
  const editor = useSlate();
  return (
    <pre>
      {JSON.stringify(
        {
          selection:
            editor.selection && Range.isCollapsed(editor.selection)
              ? editor.selection.anchor
              : editor.selection,
          marksWithoutCall: editor.marks,
          marks: Editor.marks(editor),
          children: editor.children,
        },
        null,
        2
      )}
    </pre>
  );
}

const orderedListStyles = ["lower-roman", "decimal", "lower-alpha"];
const unorderedListStyles = ["square", "disc", "circle"];

let styles = {
  flex: 1,
};

let listDepth = 10;

while (listDepth--) {
  let arr = Array.from({ length: listDepth });
  if (arr.length) {
    styles[arr.map(() => `ol`).join(" ")] = {
      listStyle: orderedListStyles[listDepth % 3],
    };
    styles[arr.map(() => `ul`).join(" ")] = {
      listStyle: unorderedListStyles[listDepth % 3],
    };
  }
}

const blockquoteChildren = [
  "paragraph",
  "code",
  "heading",
  "ordered-list",
  "unordered-list",
  "divider",
];

const paragraphLike = [...blockquoteChildren, "blockquote"];

const insideOfLayouts = [...paragraphLike, "component-block"];

function blockContainer(args) {
  return {
    kind: "blocks",
    allowedChildren: new Set(args.allowedChildren),
    blockToWrapInlinesIn: args.allowedChildren[0],
    invalidPositionHandleMode: args.invalidPositionHandleMode,
  };
}

function inlineContainer(args) {
  return {
    kind: "inlines",
    invalidPositionHandleMode: args.invalidPositionHandleMode,
  };
}

// a user land version of https://github.com/microsoft/TypeScript/issues/47920
function satisfies() {
  return function (value) {
    return value;
  };
}

export const editorSchema = satisfies()({
  editor: blockContainer({
    allowedChildren: [...insideOfLayouts, "layout"],
    invalidPositionHandleMode: "move",
  }),
  layout: blockContainer({
    allowedChildren: ["layout-area"],
    invalidPositionHandleMode: "move",
  }),
  "layout-area": blockContainer({
    allowedChildren: insideOfLayouts,
    invalidPositionHandleMode: "unwrap",
  }),
  blockquote: blockContainer({
    allowedChildren: blockquoteChildren,
    invalidPositionHandleMode: "move",
  }),
  paragraph: inlineContainer({ invalidPositionHandleMode: "unwrap" }),
  code: inlineContainer({ invalidPositionHandleMode: "move" }),
  divider: inlineContainer({ invalidPositionHandleMode: "move" }),
  heading: inlineContainer({ invalidPositionHandleMode: "unwrap" }),
  "component-block": blockContainer({
    allowedChildren: ["component-block-prop", "component-inline-prop"],
    invalidPositionHandleMode: "move",
  }),
  "component-inline-prop": inlineContainer({
    invalidPositionHandleMode: "unwrap",
  }),
  "component-block-prop": blockContainer({
    allowedChildren: paragraphLike,
    invalidPositionHandleMode: "unwrap",
  }),
  "ordered-list": blockContainer({
    allowedChildren: ["list-item"],
    invalidPositionHandleMode: "move",
  }),
  "unordered-list": blockContainer({
    allowedChildren: ["list-item"],
    invalidPositionHandleMode: "move",
  }),
  "list-item": blockContainer({
    allowedChildren: ["list-item-content", "ordered-list", "unordered-list"],
    invalidPositionHandleMode: "unwrap",
  }),
  "list-item-content": inlineContainer({ invalidPositionHandleMode: "unwrap" }),
});

const inlineContainerTypes = new Set(
  Object.entries(editorSchema)
    .filter(([, value]) => value.kind === "inlines")
    .map(([type]) => type)
);

export function isInlineContainer(node) {
  return node.type !== undefined && inlineContainerTypes.has(node.type);
}

const blockTypes = new Set(
  Object.keys(editorSchema).filter((x) => x !== "editor")
);

export function isBlock(node) {
  return blockTypes.has(node.type);
}

function withBlocksSchema(editor) {
  const { normalizeNode } = editor;
  editor.normalizeNode = ([node, path]) => {
    if (
      !Text.isText(node) &&
      node.type !== "link" &&
      node.type !== "relationship"
    ) {
      const nodeType = Editor.isEditor(node) ? "editor" : node.type;
      if (
        typeof nodeType !== "string" ||
        editorSchema[nodeType] === undefined
      ) {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
      const info = editorSchema[nodeType];

      if (
        info.kind === "blocks" &&
        node.children.length !== 0 &&
        node.children.every((child) => !Editor.isBlock(editor, child))
      ) {
        Transforms.wrapNodes(
          editor,
          { type: info.blockToWrapInlinesIn, children: [] },
          { at: path, match: (node) => !Editor.isBlock(editor, node) }
        );
        return;
      }

      for (const [index, childNode] of node.children.entries()) {
        const childPath = [...path, index];
        if (info.kind === "inlines") {
          if (!Text.isText(childNode) && !Editor.isInline(editor, childNode)) {
            handleNodeInInvalidPosition(editor, [childNode, childPath], path);
            return;
          }
        } else {
          if (
            !Editor.isBlock(editor, childNode) ||
            // these checks are implicit in Editor.isBlock
            // but that isn't encoded in types so these will make TS happy
            childNode.type === "link" ||
            childNode.type === "relationship"
          ) {
            Transforms.wrapNodes(
              editor,
              { type: info.blockToWrapInlinesIn, children: [] },
              { at: childPath }
            );
            return;
          }
          if (!info.allowedChildren.has(childNode.type)) {
            handleNodeInInvalidPosition(editor, [childNode, childPath], path);
            return;
          }
        }
      }
    }
    normalizeNode([node, path]);
  };
  return editor;
}

function handleNodeInInvalidPosition(editor, [node, path], parentPath) {
  const nodeType = node.type;
  const childNodeInfo = editorSchema[nodeType];
  // the parent of a block will never be an inline so this casting is okay
  const parentNode = Node.get(editor, parentPath);

  const parentNodeType = Editor.isEditor(parentNode)
    ? "editor"
    : parentNode.type;

  const parentNodeInfo = editorSchema[parentNodeType];

  if (!childNodeInfo || childNodeInfo.invalidPositionHandleMode === "unwrap") {
    if (
      parentNodeInfo.kind === "blocks" &&
      parentNodeInfo.blockToWrapInlinesIn
    ) {
      Transforms.setNodes(
        editor,
        {
          type: parentNodeInfo.blockToWrapInlinesIn,
          ...Object.fromEntries(
            Object.keys(node)
              .filter((key) => key !== "type" && key !== "children")
              .map((key) => [key, null])
          ), // the Slate types don't understand that null is allowed and it will unset properties with setNodes
        },
        { at: path }
      );
      return;
    }
    Transforms.unwrapNodes(editor, { at: path });
    return;
  }

  const info = editorSchema[parentNode.type || "editor"];
  if (info?.kind === "blocks" && info.allowedChildren.has(nodeType)) {
    if (parentPath.length === 0) {
      Transforms.moveNodes(editor, { at: path, to: [path[0] + 1] });
    } else {
      Transforms.moveNodes(editor, { at: path, to: Path.next(parentPath) });
    }
    return;
  }
  if (Editor.isEditor(parentNode)) {
    Transforms.moveNodes(editor, { at: path, to: [path[0] + 1] });
    Transforms.unwrapNodes(editor, { at: [path[0] + 1] });
    return;
  }
  handleNodeInInvalidPosition(editor, [node, path], parentPath.slice(0, -1));
}

// to print the editor schema in Graphviz if you want to visualize it
// function printEditorSchema(editorSchema: EditorSchema) {
//   return `digraph G {
//   concentrate=true;
//   ${Object.keys(editorSchema)
//     .map(key => {
//       let val = editorSchema[key];
//       if (val.kind === 'inlines') {
//         return `"${key}" -> inlines`;
//       }
//       if (val.kind === 'blocks') {
//         return `"${key}" -> {${[...val.allowedChildren].map(x => JSON.stringify(x)).join(' ')}}`;
//       }
//     })
//     .join('\n  ')}
// }`;
// }
