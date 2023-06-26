import { medusaClient } from "@storefront/config"
import { IS_BROWSER } from "@storefront/constants"
import { getCollectionIds } from "@storefront/util/get-collection-ids"
import CollectionTemplate from "@modules/collections/templates"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import SkeletonCollectionPage from "@modules/skeletons/templates/skeleton-collection-page"
import { useRouter } from "next/router"
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query"

const fetchCollection = async id => {
  return await medusaClient.collections.retrieve(id).then(({ collection }) => ({
    id: collection.id,
    title: collection.title
  }))
}

export const fetchCollectionProducts = async ({
  pageParam = 0,
  id,
  cartId
}) => {
  const { products, count, offset } = await medusaClient.products.list({
    limit: 12,
    offset: pageParam,
    collection_id: [id],
    cart_id: cartId
  })

  return {
    response: { products, count },
    nextPage: count > offset + 12 ? offset + 12 : null
  }
}

const CollectionPage = ({ notFound }) => {
  const { query, isFallback, replace } = useRouter()
  const id = typeof query.id === "string" ? query.id : ""

  const { data, isError, isSuccess, isLoading } = useQuery(
    ["get_collection", id],
    () => fetchCollection(id)
  )

  if (notFound) {
    if (IS_BROWSER) {
      replace("/404")
    }

    return <SkeletonCollectionPage />
  }

  if (isError) {
    replace("/404")
  }

  if (isFallback || isLoading || !data) {
    return <SkeletonCollectionPage />
  }

  if (isSuccess) {
    return (
      <>
        <Head title={data.title} description={`${data.title} collection`} />
        <CollectionTemplate collection={data} />
      </>
    )
  }

  return <></>
}

CollectionPage.getLayout = page => {
  return <Layout>{page}</Layout>
}

// export const getStaticPaths = async () => {
//   const ids = await getCollectionIds()

//   return {
//     paths: ids.map(id => ({ params: { id } })),
//     fallback: true
//   }
// }

// export const getStaticProps = async context => {
//   const queryClient = new QueryClient()
//   const id = context.params?.id

//   await queryClient.prefetchQuery(["get_collection", id], () =>
//     fetchCollection(id)
//   )

//   await queryClient.prefetchInfiniteQuery(
//     ["get_collection_products", id],
//     ({ pageParam }) => fetchCollectionProducts({ pageParam, id }),
//     {
//       getNextPageParam: lastPage => lastPage.nextPage
//     }
//   )

//   const queryData = await queryClient.getQueryData([`get_collection`, id])

//   if (!queryData) {
//     return {
//       props: {
//         notFound: true
//       }
//     }
//   }

//   return {
//     props: {
//       // Work around see – https://github.com/TanStack/query/issues/1458#issuecomment-747716357
//       dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
//       notFound: false
//     }
//   }
// }

export default CollectionPage
