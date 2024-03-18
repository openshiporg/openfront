import React from "react"

import Footer from "@storefront/modules/layout/templates/footer"
import Nav from "@storefront/modules/layout/templates/nav"

const Layout = ({ children }) => {
  return (
    <div>
      <Nav />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout
