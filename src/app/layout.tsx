import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AssistantWidget } from "@/components/voxide/assistant-widget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meri | Your business, guided by voice.",
  description: "Meri guides your business operations with voice and clear text workflows.",
  applicationName: "Meri",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Voxide voice widget. Stays mounted across navigations when a
            public key is configured. Renders nothing when the key is absent.
            See src/lib/voxide/client.ts for the registered capabilities. */}
        <AssistantWidget />
      </body>
    </html>
  );
}
