import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenHerd - Model Registry & Deployment Platform",
  description: "Open-source model registry and deployment platform with Ollama integration, benchmarking, fine-tuning, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#e5e7eb",
              border: "1px solid #374151",
            },
          }}
        />
      </body>
    </html>
  );
}
