import { medusaClient } from "@storefront/config";
import { IS_BROWSER } from "@storefront/constants";
import Head from "@modules/common/components/head";
import Layout from "@modules/layout/templates";
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template";
import SkeletonOrderConfirmed from "@modules/skeletons/templates/skeleton-order-confirmed";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";

const fetchOrder = async (id) => {
  return await medusaClient.orders.retrieve(id).then(({ order }) => order);
};

const Confirmed = () => {
  const router = useRouter();

  const id = typeof router.query?.id === "string" ? router.query.id : "";

  const { isSuccess, data, isLoading, isError } = useQuery(
    ["get_order_confirmed", id],
    () => fetchOrder(id),
    {
      enabled: id.length > 0,
      staleTime: Infinity,
    }
  );

  if (isLoading) {
    return <SkeletonOrderConfirmed />;
  }

  if (isError) {
    if (IS_BROWSER) {
      router.replace("/404");
    }

    return <SkeletonOrderConfirmed />;
  }

  if (isSuccess) {
    return (
      <>
        <Head
          title="Order Confirmed"
          description="You purchase was successful"
        />

        <OrderCompletedTemplate order={data} />
      </>
    );
  }

  return <></>;
};

Confirmed.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

// export const getStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: "blocking",
//   };
// };

// export const getStaticProps = async (context) => {
//   const id = context.params?.id;
//   const queryClient = new QueryClient();

//   await queryClient.prefetchQuery(["get_order_confirmed", id], () =>
//     fetchOrder(id)
//   );

//   return {
//     props: {
//       dehydratedState: dehydrate(queryClient),
//     },
//   };
// };

export default Confirmed;
