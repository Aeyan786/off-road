import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Off Road Performance",
  description: "High quality auto and ATV parts at an affordable price.",
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