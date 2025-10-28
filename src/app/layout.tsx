import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

const adigiana = localFont({
  src: '../../public/fonts/AdigianaExtreme.ttf',
  variable: '--font-adigiana',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Fluffychoo | Premium Soft Desserts",
  description: "Indulge in premium mochi brownies, handcrafted daily with love at Fluffychoo. The perfect fusion of chewy Japanese mochi and rich, fudgy brownies baked to golden perfection.",
  keywords: "mochi brownies, premium brownies, Japanese mochi, artisan brownies, handcrafted desserts, golden brownies, fluffychoo",
  authors: [{ name: "Fluffychoo" }],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Fluffychoo | Premium Soft Desserts",
    description: "Premium softness in every bite. Handcrafted mochi brownies baked fresh daily at Fluffychoo.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fluffychoo | Premium Soft Desserts",
    description: "Premium softness in every bite. Handcrafted mochi brownies baked fresh daily at Fluffychoo.",
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