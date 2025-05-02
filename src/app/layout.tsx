import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import AdminLogin from "./LoginPage";

export const metadata: Metadata = {
  title: "Welcome Travel Accommodation",
  description: "The warmest rooms in Metro Vancouver",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const isAuthenticated = await new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(!!user);
    });
  });

  if (false) { //Originally: if (!isAuthenticated) {
    return (
      <html lang="en">
      <body>
        <AdminLogin/>
      </body>
    </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header/>
          <div className="flex flex-1">
            <Sidebar/>
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
