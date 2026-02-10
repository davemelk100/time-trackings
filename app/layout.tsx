import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { cookies } from "next/headers"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: "Melkonian Industries - Time Tracking",
  description:
    "Time tracking and invoicing dashboard for Melkonian Industries LLC.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#111419" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const raw = cookieStore.get("session")?.value
  let session = null
  if (raw) {
    try {
      session = JSON.parse(raw)
    } catch {
      // invalid cookie — treat as unauthenticated
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${_inter.variable} ${_jetbrains.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider session={session}>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
