import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { NotificationProvider } from "./context/NotificationContext";
import { GlobalVarProvider } from "./context/VariableContext";

export const metadata: Metadata = {
  title: "Welcome Travel Accommodation",
  description: "The warmest rooms in Metro Vancouver",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body>
        <GlobalVarProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">
                  {children}
                </main>
              </div>
              <Footer />
            </div>
          </NotificationProvider>
        </GlobalVarProvider>
      </body>
    </html>
  );
}
