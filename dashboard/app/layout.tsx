import type { Metadata } from 'next'
import { Young_Serif, Space_Mono } from 'next/font/google'
import './globals.css'

const youngSerif = Young_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Vigil HQ',
  description: 'Background agent runtime for AI builders',
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${youngSerif.variable} ${spaceMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
