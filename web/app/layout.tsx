import type { Metadata } from 'next'
import { Oxanium, Source_Code_Pro } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import { WalletProvider } from '@/components/wallet-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'FlowShield | Privacy-focused DeFi Protocol',
  description: 'Privacy-focused DeFi protocol for secure transactions on Ethereum and Optimism. Break the link between your wallets with FlowShield.',
  generator: 'FlowShield',
  keywords: ['flowshield', 'privacy', 'defi', 'ethereum', 'optimism', 'web3', 'zero-knowledge', 'cryptocurrency'],
  authors: [{ name: 'pintoinfant', url: 'https://github.com/pintoinfant' }],
  creator: 'pintoinfant',
  publisher: 'FlowShield',
  metadataBase: new URL(process.env.APP_URL || 'https://github.com/pintoinfant/flowshield'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'FlowShield',
    title: 'FlowShield | Privacy-focused DeFi Protocol',
    description: 'Privacy-focused DeFi protocol for secure transactions on Ethereum and Optimism',
    url: process.env.APP_URL || 'https://github.com/pintoinfant/flowshield',
    images: [
      {
        url: '/image.png',
        width: 1200,
        height: 630,
        alt: 'FlowShield - Privacy-focused DeFi Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowShield | Privacy-focused DeFi Protocol',
    description: 'Privacy-focused DeFi protocol for secure transactions on Ethereum and Optimism',
    images: ['/image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const oxanium = Oxanium({
  subsets: ['latin'],
  variable: '--font-sans',
})

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${oxanium.variable} ${sourceCodePro.variable}`}>
        <WalletProvider>{children}</WalletProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
