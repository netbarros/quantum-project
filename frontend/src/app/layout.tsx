import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import PWARegistration from "./PWARegistration";
import Providers from "./Providers";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantum Project — Transformação Comportamental",
  description:
    "Plataforma de transformação comportamental movida por IA. Sua jornada de 365 dias de evolução de identidade começa aqui.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Quantum" },
  openGraph: {
    title: "Quantum Project",
    description: "Sistema de Transformação Comportamental com IA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${instrumentSerif.variable} ${dmSans.variable}`}
    >
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <Providers>
            {children}
            <PWARegistration />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
