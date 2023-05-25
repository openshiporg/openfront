import AccountLayout from "@modules/account/templates/account-layout"
import OverviewTemplate from "@modules/account/templates/overview-template"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"

const Account = () => {
  return (
    <>
      <Head title="Account" description="Overview of your account activity." />
      <OverviewTemplate />
    </>
  )
}

Account.getLayout = page => {
  return (
    <Layout>
      <AccountLayout>{page}</AccountLayout>
    </Layout>
  )
}

export default Account
