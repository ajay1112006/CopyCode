import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DotField from "@/components/ui/DotField";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CopyCode | Secure Text Sharing",
  description: "Secure, password-protected rooms for sharing code and text across devices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ position: 'relative', minHeight: '100vh', margin: 0 }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
          <DotField
            dotRadius={2.2}
            dotSpacing={16}
            bulgeStrength={67}
            glowRadius={160}
            sparkle={true}
            waveAmplitude={2}
          />
        </div>
        <main style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
