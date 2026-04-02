import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/account/", "/cart/", "/checkout/"],
    },
    sitemap: "https://sysmoai.com/sitemap.xml",
  }
}
