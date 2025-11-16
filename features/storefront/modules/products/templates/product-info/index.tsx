import LocalizedClientLink from "../../../common/components/localized-client-link"
import { DocumentRenderer } from "./DocumentRenderer"

type ProductDescription = {
  document?: any;
} | string | null;

type ProductCollectionInfo = {
  handle?: string | null;
  title?: string | null;
};

type ProductInfoType = {
  title?: string | null;
  description?: ProductDescription;
  productCollections?: ProductCollectionInfo[] | null;
};

type ProductInfoProps = {
  product: ProductInfoType;
};
const renderers = {
  inline: {
    link: ({ children, href }: { children: React.ReactNode, href: string }) => {
      if (href.startsWith("/")) {
        return (
          <LocalizedClientLink
            href={href}
            className="text-primary hover:text-primary/90 underline"
          >
            {children}
          </LocalizedClientLink>
        )
      }

      return (
        <a
          href={href}
          className="text-primary hover:text-primary/90 underline"
        >
          {children}
        </a>
      )
    },
    bold: ({ children }: { children: React.ReactNode }) => {
      return <span className="font-semibold">{children}</span>
    }
  },
  block: {
    heading: ({ children, level }: { children: React.ReactNode, level: number }) => {
      const sizes: Record<number, string> = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
        5: "text-base",
        6: "text-sm"
      }

      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <HeadingTag
          className={`${sizes[level]} leading-tight text-foreground mb-2`}
        >
          {children}
        </HeadingTag>
      )
    },
    paragraph: ({ children, textAlign }: { children: React.ReactNode, textAlign?: string }) => {
      return (
        <p // Replaced Text with p
          className={`text-muted-foreground mb-4 leading-relaxed ${
            textAlign ? `text-${textAlign}` : ''
          }`}
        >
          {children}
        </p>
      )
    },
    blockquote: ({ children }: { children: React.ReactNode }) => {
      return (
        <blockquote className="border-l-4 border-border pl-4 italic my-4">
          <p className="text-muted-foreground">{children}</p>
        </blockquote>
      )
    },
    list: ({ children, type }: { children: React.ReactNode[], type: "ordered" | "unordered" }) => {
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

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.productCollections && product.productCollections.length > 0 && (
          <LocalizedClientLink
            href={`/collections/${product.productCollections[0].handle}`}
            className="text-base text-muted-foreground hover:text-muted-foreground/80"
          >
            {product.productCollections[0].title}
          </LocalizedClientLink>
        )}
        <h2
          className="text-3xl leading-10 text-foreground"
          data-testid="product-title"
        >
          {product.title}
        </h2>

        {typeof product.description === 'string' ? (
          <p
            className="text-base text-muted-foreground whitespace-pre-line"
            data-testid="product-description"
          >
            {product.description}
          </p>
        ) : product.description?.document ? (
          <DocumentRenderer document={product.description.document} renderers={renderers} />
        ) : null}
      </div>
    </div>
  )
}

export default ProductInfo
