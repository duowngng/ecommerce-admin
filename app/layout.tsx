import type { Metadata } from "next";
import { Inter } from "next/font/google";

import SignIn from "@/app/(auth)/(routes)/sign-in/page";
import Home from "@/app/(root)/page";
import { Auth } from "firebase-admin/auth";
import { ModalProvider } from "@/providers/modal-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ModalProvider />
          {children}
      </body>
    </html>
  );
}
