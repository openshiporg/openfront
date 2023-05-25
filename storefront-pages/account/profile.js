import AccountLayout from "@modules/account/templates/account-layout";
import ProfileTemplate from "@modules/account/templates/profile-template";
import Head from "@modules/common/components/head";
import Layout from "@modules/layout/templates";

const Profile = () => {
  return (
    <>
      <Head title="Profile" description="View and edit your ACME profile." />
      <ProfileTemplate />
    </>
  );
};

Profile.getLayout = (page) => {
  return (
    <Layout>
      <AccountLayout>{page}</AccountLayout>
    </Layout>
  );
};

export default Profile;
