import AccountLayout from "@modules/account/templates/account-layout";
import AddressesTemplate from "@modules/account/templates/addresses-template";
import Head from "@modules/common/components/head";
import Layout from "@modules/layout/templates";

const Addresses = () => {
  return (
    <>
      <Head title="Addresses" description="View your addresses" />
      <AddressesTemplate />
    </>
  );
};

Addresses.getLayout = (page) => {
  return (
    <Layout>
      <AccountLayout>{page}</AccountLayout>
    </Layout>
  );
};

export default Addresses;
