import { Heading, Text } from "@medusajs/ui";
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link";
import { DocumentRenderer } from "./DocumentRenderer";

const renderers = {
  inline: {
    link: ({ children, href }) => {
      if (href.startsWith("/")) {
        return (
          <LocalizedClientLink
            href={href}
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
          >
            {children}
          </LocalizedClientLink>
        )
      }

      return (
        <a
          href={href}
          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
        >
          {children}
        </a>
      )
    },
    bold: ({ children }) => {
      return <span className="font-semibold">{children}</span>
    }
  },
  block: {
    heading: ({ children, level }) => {
      const sizes = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
        5: "text-base",
        6: "text-sm"
      }
      
      return (
        <Heading 
          level={`h${level}`} 
          className={`${sizes[level]} leading-tight text-ui-fg-base mb-2`}
        >
          {children}
        </Heading>
      )
    },
    paragraph: ({ children, textAlign }) => {
      return (
        <Text 
          className={`text-ui-fg-subtle mb-4 leading-relaxed ${
            textAlign ? `text-${textAlign}` : ''
          }`}
        >
          {children}
        </Text>
      )
    },
    blockquote: ({ children }) => {
      return (
        <blockquote className="border-l-4 border-ui-border-base pl-4 italic my-4">
          <Text className="text-ui-fg-subtle">{children}</Text>
        </blockquote>
      )
    },
    list: ({ children, type }) => {
      const List = type === "ordered" ? "ol" : "ul"

      return (
        <List className={`${type === "ordered" ? "list-decimal" : "list-disc"} pl-4`}>
          {children.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </List>
      )
    },
  }
}

const ProductInfo = ({ product }) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.productCollections[0] && (
          <LocalizedClientLink
            href={`/collections/${product.productCollections[0].handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.productCollections[0].title}
          </LocalizedClientLink>
        )}
        <Heading level="h2" className="text-3xl leading-10 text-ui-fg-base">
          {product.title}
        </Heading>

        <DocumentRenderer document={product.description.document} renderers={renderers} />
      </div>
    </div>
  );
};

export default ProductInfo;
