import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { siteUrl, STORE_NAME } from "@/lib/site";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(siteUrl()),
  // Pages set just their own title; "| Off Road Performance" is added here.
  title: { default: STORE_NAME, template: `%s | ${STORE_NAME}` },
  description: "High quality auto and ATV parts at an affordable price.",
  openGraph: { siteName: STORE_NAME, type: "website", locale: "en_GB" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${baiJamjuree.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}