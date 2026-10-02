import type { Metadata } from "next";
import "./globals.css";
import "./public-pass.css";
import { StoreProvider } from "@/store";
export const metadata: Metadata = {
  title: "AVENZA · Rent a Car",
  description:
    "Una forma más cercana de moverte. Empresa ficticia · Concept Project by MORAN STUDIO.",
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
