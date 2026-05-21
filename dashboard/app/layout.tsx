import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vigil HQ',
  description: 'Background agent runtime for AI builders',
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  )
}
