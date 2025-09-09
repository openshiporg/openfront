import "@/features/storefront/styles/globals.css";
import QueryProvider from "@/features/storefront/lib/providers/query-client-provider";

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {props.children}
    </QueryProvider>
  );
}
