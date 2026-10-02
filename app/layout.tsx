import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Warsheh | كل ورشتك بـ app واحد',
  description: 'The digital home for renovation, plumbing, electrical, and handyman repairs in Lebanon.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        {children}
      </body>
    </html>
  )
}