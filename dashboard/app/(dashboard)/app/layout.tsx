import { Young_Serif, Space_Mono } from 'next/font/google'

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

export default function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`vigil-app ${youngSerif.variable} ${spaceMono.variable} antialiased h-screen`}>
      {children}
    </div>
  )
}
