import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import { Toaster } from "sonner";
import GlobalNavbar from "@/components/GlobalNavbar";
import GlobalFooter from "@/components/GlobalFooter";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Family Love Built.",
  description: "Bearers of the seal of the Universal Monarch.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  openGraph: {
    title: "The Family Love Built.",
    description: "Bearers of the seal of the Universal Monarch.",
    images: [
      {
        url: "/apple-touch-icon.png",
        width: 180,
        height: 180,
        alt: "The Family Love Built",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "The Family Love Built.",
    description: "Bearers of the seal of the Universal Monarch.",
    images: ["/apple-touch-icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <GlobalNavbar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <GlobalFooter />
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: "12px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
            },
          }}
        />
      </body>
    </html>
  );
}