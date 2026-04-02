import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sysmoai.com"
  const now = new Date()

  return [
    { url: `${baseUrl}/bd`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/bd/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/bd/services/agencies`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/bd/services/ecommerce`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/bd/services/coaching`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/bd/services/accounting`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/bd/services/clinics`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/bd/services/trading`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/bd/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/bd/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/bd/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/bd/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/bd/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/bd/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]
}
