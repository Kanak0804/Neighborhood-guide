import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import AIChatbox from "@/components/AIChatbox";
import { TranslationProvider } from "@/i18n/TranslationContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Localite | Your Local City Guide",
  description: "Discover the best cafes, restaurants, parks, and hidden gems anywhere in the world.",
  icons: {
    icon: "/favicon.ico",
  }
};

export const viewport: Viewport = {
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} font-inter antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden`}>
        {/* Subtle Ambient Glows */}
        <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] bg-rose-400/10 dark:bg-rose-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-[150px]"></div>
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider>
            <Navigation />
            <main className="flex-1 flex flex-col relative w-full">
              {children}
            </main>
            <Footer />
            <AIChatbox />
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
