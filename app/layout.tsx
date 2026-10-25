import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Shell from "@/components/Shell";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: { default: "Sarah | Captación en Mobilia", template: "%s | Sarah" },
  description: "Cada propiedad nueva dada de alta en Mobilia según el manual de la agencia, con la fuente de cada dato, la relectura de cada guardado y tu aprobación antes de publicar.",
};

export const viewport: Viewport = {
  themeColor: "#1e5a8a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={nunito.className}>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
