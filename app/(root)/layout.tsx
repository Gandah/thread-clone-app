import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs"
import Topbar from "@/components/shared/Topbar";
import RightSidebar from "@/components/shared/RightSidebar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Bottombar from "@/components/shared/Bottombar";

import { Inter } from "next/font/google";
import "../globals.css";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Threads",
  description: "A threads clone application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
   <ClerkProvider>
     <html lang="en">
      <body className={inter.className}>
        <Topbar/>
        <main className="flex flex-row">
          <LeftSidebar/>
          <section className="main-container">
            <div className="w-full max-w-4xl">
              {children}
            </div>
          </section>
          <RightSidebar/>
        </main>
        <Bottombar/>
      </body>
     </html>
   </ClerkProvider>
  );
}
