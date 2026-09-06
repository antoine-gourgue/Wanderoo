import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wanderoo — comparateur de voyages",
  description:
    "Comparez vols, hôtels et location de voiture sur des dizaines de sites et trouvez le meilleur prix. Gratuit, sans frais cachés.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${manrope.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
