// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../src/components/Navbar";
import { CompareProvider } from "../src/context/CompareContext";
import { AlertsProvider } from "../src/context/AlertsContext";
import { Toaster } from 'sonner';
import { CommandMenu } from "../src/components/CommandMenu"; // <--- Импорт
import { getAllActiveIPs } from "../src/services/nodes"; // <--- Импорт данных

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xandeum pNode Explorer",
  description: "Analytics dashboard for Xandeum storage network",
};

// Layout теперь асинхронный, чтобы получить данные
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Получаем список нод один раз при загрузке
  const nodes = await getAllActiveIPs();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <AlertsProvider>
          <CompareProvider>
            <Navbar />
            
            {/* Меню команд доступно везде */}
            <CommandMenu nodes={nodes} />
            
            {children}
            <Toaster position="bottom-right" theme="dark" richColors />
          </CompareProvider>
        </AlertsProvider>
      </body>
    </html>
  );
}