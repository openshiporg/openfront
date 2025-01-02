import { getProductsForSearch } from "./data/products"
import FlexSearch from "flexsearch"

const index = new FlexSearch.Index({
  preset: "match",
  tokenize: "forward",
  cache: true,
  context: true
})

let initialized = false
let productsMap = new Map()

async function initializeSearch() {
  if (initialized) return productsMap
  
  const products = await getProductsForSearch()
  
  // Create a map for efficient lookups
  productsMap = new Map(products.map(product => [product.id, product]))
  
  // Index the products
  products.forEach(product => {
    const searchableText = [
      product.title,
      product.description,
      product.handle,
      product.productTags?.map(t => t.value).join(" "),
      product.productVariants?.map(v => v.title).join(" "),
      product.productVariants?.map(v => v.sku).join(" ")
    ].filter(Boolean).join(" ")

    index.add(product.id, searchableText)
  })

  initialized = true
  return productsMap
}

export const searchClient = {
  search: async (queries) => {
    const productsData = await initializeSearch()
    
    const results = await Promise.all(
      queries.map(async ({ params }) => {
        if (!params.query) {
          return { hits: [] }
        }

        const ids = await index.search(params.query, {
          limit: params.hitsPerPage || 20,
          suggest: true
        })

        const hits = ids
          .map(id => {
            const product = productsData.get(id)
            return product ? {
              objectID: id,
              ...product
            } : null
          })
          .filter(Boolean)

        return { hits }
      })
    )
    return { results }
  }
}

export const SEARCH_INDEX_NAME = "products"
