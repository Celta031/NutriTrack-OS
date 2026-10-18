import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriTrack OS | Gestão Inteligente de Dieta & Estoque Vivo",
  description:
    "Sistema inteligente de controle nutricional, cardápio cíclico mensal, estoque vivo (39 itens), alerta preventivo por e-mail e relatório executivo para nutricionista.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
