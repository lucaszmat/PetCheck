import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import AuthGate from "@/components/AuthGate"

export const metadata: Metadata = {
  title: "PetCheck - Gerenciamento de Saúde do seu Pet",
  description: "Sistema completo para gerenciar a saúde e bem-estar do seu pet",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  )
}
