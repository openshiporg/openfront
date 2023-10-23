import Providers from "@modules/providers"
import "styles/globals.css"

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="relative">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
