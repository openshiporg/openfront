import Footer from "@storefront/modules/layout/templates/footer"
import Nav from "@storefront/modules/layout/templates/nav"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"

export const metadata = {
  metadataBase: new URL(BASE_URL),
}

export default async function PageLayout(props) {
  return <>
    <Nav />
    {props.children}
    <Footer />
  </>;
}
