import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { auth } from "@/auth";
import { getSiteSettings, getNavigationLinks, getSocialLinks, getSEOSettings } from "@/lib/settings";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Dynamic metadata generation from SEOSettings model
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("home");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Load CMS settings on server
  const [settings, links, socials] = await Promise.all([
    getSiteSettings(),
    getNavigationLinks(),
    getSocialLinks(),
  ]);

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isConnectPage = pathname === "/connect" || pathname === "/links";

  const navbarLinks = links.filter((l) => l.type === "NAVBAR" && l.isVisible);
  const footerLinks = links.filter((l) => l.type === "FOOTER" && l.isVisible);

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {!isConnectPage && (
            <Navbar 
              session={session} 
              links={navbarLinks} 
              siteName={settings.siteName} 
              siteLogo={settings.siteLogo} 
            />
          )}
          <main className="flex-grow flex flex-col">{children}</main>
          {!isConnectPage && (
            <Footer 
              links={footerLinks} 
              socials={socials} 
              settings={{
                siteName: settings.siteName,
                siteDescription: settings.siteDescription,
                copyrightText: settings.copyrightText,
              }} 
            />
          )}
        </Providers>
      </body>
    </html>
  );
}
