import { MuseoModerno } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/context/AuthProvider';
import WalletProvider from '@/context/WalletProvider';
// import Navbar from "@components/Navbar";

const museoModerno = MuseoModerno({ subsets: ["latin"] });

export const metadata = {
  title: "$RORO WEBSITE",
  description: "RoroLand on Solana",
  openGraph: {
    title: '$RORO WEBSITE',
    description: 'RoroLand on Solana.',
    type: 'website',
    locale: 'en_US',
    url: 'https://roro-token.lololabs.xyz',
    siteName: '$RORO WEBSITE',
    images: [
      {
        url: 'https://roro-token.lololabs.xyz/overview-website.png',
        width: 1200,
        height: 630,
        alt: '$RORO WEBSITE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '$RORO WEBSITE',
    description: 'RoroLand on Solana.',
    image: 'https://roro-token.lololabs.xyz/overview-website.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="$RORO WEBSITE" />
        <meta name="twitter:description" content="RoroLand on Solana." />
        <meta name="twitter:image" content="https://roro-token.lololabs.xyz/overview-website.png" />
        <meta name="keywords" content="airdrop, solana, crypto airdrop, roroland, roro, land" />
      </head>
      <body className={museoModerno.className}>
        <AuthProvider>
          <WalletProvider>
            {/* <Navbar /> */}
            {children}
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
