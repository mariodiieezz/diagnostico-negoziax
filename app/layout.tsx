import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Diagnóstico Negoziax',
  description: 'Cuestionario para conocer las herramientas digitales y necesidades de tu negocio',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`bg-background ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <div className="site-bg" aria-hidden="true">
          <div className="site-blob site-blob-1" />
          <div className="site-blob site-blob-2" />
          <div className="site-blob site-blob-3" />
        </div>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
