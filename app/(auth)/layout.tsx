import { ClerkProvider } from "@clerk/nextjs"
import { Lato } from "next/font/google"

import type { Metadata } from "next";
import "../globals.css"

export const metadata: Metadata = {
    title: 'Threads',
    description: 'A  Threads clone application'
}

const lato = Lato({
    weight: ['400', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
  });

export default function RootLayout({
    children
} : Readonly<{
    children: React.ReactNode;
  }>){
    return (
    <ClerkProvider>
        <html lang="en">
            <body className={`${lato.className} bg-dark-1`}>
                <div className="w-full flex 
                justify-center items-center min-h-screen">
                    {children}
                </div>        
            </body>
        </html>
    </ClerkProvider>
    )
}