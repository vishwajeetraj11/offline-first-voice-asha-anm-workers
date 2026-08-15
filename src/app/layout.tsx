import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SyncEngineProvider } from "@/components/SyncEngineProvider";
import { ConnectivityBanner } from "@/components/ui/ConnectivityBanner";
import { Toast } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Voice Register",
  description: "Offline voice register for ASHA/ANM field visits",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Voice Register",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#176b5b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#f7f3e9]">
        <SyncEngineProvider>
          <ConnectivityBanner />
          {children}
          <Toast />
        </SyncEngineProvider>
      </body>
    </html>
  );
}
