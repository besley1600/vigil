import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vigil — The autonomous AI agent platform',
  description: 'Run 119 pre-built skills or build your own. Deploy instantly. No servers to manage.',
  openGraph: {
    title: 'Vigil — The autonomous AI agent platform',
    description: 'Run 119 pre-built skills or build your own. Deploy instantly. No servers to manage.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  )
}
