import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopScript",
  description: "Premium E-commerce Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <AuthModal />
              <Navbar />
              <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
              </main>
              <footer className="bg-card border-t border-border py-8 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
                  &copy; 2024 ShopScript. All rights reserved.
                </div>
              </footer>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

