import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { NotificationProvider } from "./context/NotificationContext";
import { GlobalVarProvider } from "./context/VariableContext";
import { getSession } from "@/lib/auth";
import AdminLogin from "./LoginPage";
import { AuthProvider } from "./context/AuthProvider";

export const metadata: Metadata = {
  title: "Welcome Travel Accommodation",
  description: "The warmest rooms in Metro Vancouver",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getSession();
  let name = "";
  let email = "";

  if (!session) {
    return (
      <AdminLogin />
    );
  }else{
    name = session.displayName;
    email = session.email;
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider isAuth={true} name={name} email={email} >
          <GlobalVarProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex flex-1">
                  <Sidebar className={"hidden md:flex md:w-64 md:flex-col"}/>
                  <main className="flex-1 p-6 overflow-auto">
                    {children}
                  </main>
                </div>
                <Footer />
              </div>
            </NotificationProvider>
          </GlobalVarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
