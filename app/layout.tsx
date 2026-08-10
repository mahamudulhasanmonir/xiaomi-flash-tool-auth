import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Xiaomi Flash Tool Auth',
  description: 'Auth Backend for Xiaomi Flash Tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
