// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "fluffy choy | Premium Mochi Brownies",
  description: "Indulge in premium mochi brownies, handcrafted daily with love. The perfect fusion of chewy Japanese mochi and rich, fudgy brownies baked to golden perfection.",
  keywords: "mochi brownies, premium brownies, Japanese mochi, artisan brownies, handcrafted desserts, golden brownies, fluffy choy",
  authors: [{ name: "fluffy choy" }],
  openGraph: {
    title: "fluffy choy | Premium Mochi Brownies",
    description: "Premium comfort in every bite. Handcrafted mochi brownies baked fresh daily.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "fluffy choy | Premium Mochi Brownies",
    description: "Premium comfort in every bite. Handcrafted mochi brownies baked fresh daily.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}