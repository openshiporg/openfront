import { medusaClient } from "@storefront/config";
import { IS_BROWSER } from "@storefront/constants";
import { getProductHandles } from "@storefront/util/get-product-handles";
import Head from "@modules/common/components/head";
import Layout from "@modules/layout/templates";
import ProductTemplate from "@modules/products/templates";
import SkeletonProductPage from "@modules/skeletons/templates/skeleton-product-page";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

const fetchProduct = async (handle) => {
  return await medusaClient.products
    .list({ handle })
    .then(({ products }) => products[0]);
};

const ProductPage = ({ notFound }) => {
  const { query, isFallback, replace } = useRouter();
  const handle = typeof query.handle === "string" ? query.handle : "";

  const { data, isError, isLoading, isSuccess } = useQuery(
    [`get_product`, handle],
    () => fetchProduct(handle),
    {
      enabled: handle.length > 0,
      keepPreviousData: true,
    }
  );

  if (notFound) {
    if (IS_BROWSER) {
      replace("/404");
    }

    return <SkeletonProductPage />;
  }

  if (isFallback || isLoading || !data) {
    return <SkeletonProductPage />;
  }

  if (isError) {
    replace("/404");
  }

  if (isSuccess) {
    return (
      <>
        <Head
          description={data.description}
          title={data.title}
          image={data.thumbnail}
        />
        <ProductTemplate product={data} />
      </>
    );
  }

  return <></>;
};

ProductPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

// export const getStaticPaths = async () => {
//   const handles = await getProductHandles();
//   return {
//     paths: handles.map((handle) => ({ params: { handle } })),
//     fallback: true,
//   };
// };

// export const getStaticProps = async (context) => {
//   const handle = context.params?.handle;
//   const queryClient = new QueryClient();

//   await queryClient.prefetchQuery([`get_product`, handle], () =>
//     fetchProduct(handle)
//   );

//   const queryData = await queryClient.getQueryData([`get_product`, handle]);

//   if (!queryData) {
//     return {
//       props: {
//         notFound: true,
//       },
//     };
//   }

//   return {
//     props: {
//       dehydratedState: dehydrate(queryClient),
//       notFound: false,
//     },
//   };
// };

export default ProductPage;
