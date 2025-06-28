/**
 * ProductCreatePage - Server Component
 * Following the dashboard CreatePage pattern but adapted for platform products
 */

import { notFound } from 'next/navigation'
import { ProductCreatePageClient } from './ProductCreatePageClient'
import { getListByPath } from '../../../dashboard/actions/getListByPath'

export async function ProductCreatePage() {
  // Hardcode the list key for products
  const listKeyPath = 'products'

  const list = await getListByPath(listKeyPath)

  if (!list) {
    notFound()
  }

  return <ProductCreatePageClient listKey={listKeyPath} list={list} />
}

export default ProductCreatePage 