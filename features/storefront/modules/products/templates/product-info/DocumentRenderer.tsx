import React, { Fragment } from "react"

export const defaultRenderers = {
  inline: {
    bold: "strong",
    code: "code",
    keyboard: "kbd",
    strikethrough: "s",
    italic: "em",
    link: "a",
    subscript: "sub",
    superscript: "sup",
    underline: "u",
    relationship: ({ data }: { data?: { label?: string; id?: string } }) => {
      return <span>{data?.label || data?.id}</span>
    }
  },

  block: {
    block: "div",
    blockquote: "blockquote",
    paragraph: ({ children, textAlign }: { children: React.ReactNode; textAlign?: string }) => {
      return <p style={{ textAlign: textAlign as any }}>{children}</p>
    },
    divider: "hr",
    heading: ({ level, children, textAlign }: { level: number; children: React.ReactNode; textAlign?: string }) => {
      let Heading = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

      return <Heading style={{ textAlign: textAlign as any }} children={children} />
    },
    code: "pre",
    list: ({ children, type }: { children: React.ReactNode[]; type: "ordered" | "unordered" }) => {
      const List = type === "ordered" ? "ol" : "ul"

      return (
        <List>
          {children.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </List>
      )
    },
    layout: ({ children, layout }: { children: React.ReactNode[]; layout: number[] }) => {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: layout.map(x => `${x}fr`).join(" ")
          }}
        >
          {children.map((element, i) => (
            <div key={i}>{element}</div>
          ))}
        </div>
      )
    }
  }
}

type DocumentNodeProps = {
  node: any;
  componentBlocks?: Record<string, React.ComponentType<any>>;
  renderers: {
    inline: Record<string, any>;
    block: Record<string, any>;
  };
}

function DocumentNode({ node: _node, componentBlocks, renderers }: DocumentNodeProps) {
  if (typeof _node.text === "string") {
    let child = <Fragment>{_node.text}</Fragment>

    Object.keys(renderers.inline).forEach(markName => {
      if (
        markName !== "link" &&
        markName !== "relationship" &&
        _node[markName]
      ) {
        const Mark = renderers.inline[markName]

        child = <Mark>{child}</Mark>
      }
    })

    return child
  }

  const node = _node

  const children = node.children.map((x: any, i: number) => (
    <DocumentNode
      node={x}
      componentBlocks={componentBlocks}
      renderers={renderers}
      key={i}
    />
  ))

  switch (node.type) {
    case "blockquote": {
      return <renderers.block.blockquote children={children} />
    }

    case "paragraph": {
      return (
        <renderers.block.paragraph
          textAlign={node.textAlign}
          children={children}
        />
      )
    }

    case "code": {
      if (
        node.children.length === 1 &&
        node.children[0] &&
        typeof node.children[0].text === "string"
      ) {
        return (
          <renderers.block.code>{node.children[0].text}</renderers.block.code>
        )
      }

      break
    }

    case "layout": {
      return <renderers.block.layout layout={node.layout} children={children} />
    }

    case "divider": {
      return <renderers.block.divider />
    }

    case "heading": {
      return (
        <renderers.block.heading
          textAlign={node.textAlign}
          level={node.level}
          children={children}
        />
      )
    }

    case "component-block": {
      const Comp = componentBlocks?.[node.component]

      if (Comp) {
        const props = createComponentBlockProps(node, children)

        return (
          <renderers.block.block>
            <Comp {...props} />
          </renderers.block.block>
        )
      }

      break
    }

    case "ordered-list":
    case "unordered-list": {
      return (
        <renderers.block.list
          children={children}
          type={node.type === "ordered-list" ? "ordered" : "unordered"}
        />
      )
    }

    case "relationship": {
      const data = node.data

      return (
        <renderers.inline.relationship
          relationship={node.relationship}
          data={
            data ? { id: data.id, label: data.label, data: data.data } : null
          }
        />
      )
    }

    case "link": {
      return (
        <renderers.inline.link href={node.href}>
          {children}
        </renderers.inline.link>
      )
    }
  }

  return <Fragment>{children}</Fragment>
}

function set(obj: any, propPath: string[], value: any) {
  if (propPath.length === 1) {
    obj[propPath[0]] = value
  } else {
    let firstElement = propPath.shift()
    if (firstElement) {
      set(obj[firstElement], propPath, value)
    }
  }
}

function createComponentBlockProps(node: any, children: React.ReactNode[]) {
  const formProps = JSON.parse(JSON.stringify(node.props))

  node.children.forEach((child: any, i: number) => {
    if (child.propPath) {
      const propPath = [...child.propPath]

      set(formProps, propPath, children[i])
    }
  })

  return formProps
}

type DocumentRendererProps = {
  document: any;
  componentBlocks?: Record<string, React.ComponentType<any>>;
  renderers?: {
    inline?: Record<string, any>;
    block?: Record<string, any>;
  };
}

export function DocumentRenderer(props: DocumentRendererProps) {
  const renderers = {
    inline: { ...defaultRenderers.inline, ...props.renderers?.inline },
    block: { ...defaultRenderers.block, ...props.renderers?.block }
  }

  const componentBlocks = props.componentBlocks || {}

  return (
    <Fragment>
      {props.document.map((x: any, i: number) => (
        <DocumentNode
          node={x}
          componentBlocks={componentBlocks}
          renderers={renderers}
          key={i}
        />
      ))}
    </Fragment>
  )
}

export default DocumentRenderer