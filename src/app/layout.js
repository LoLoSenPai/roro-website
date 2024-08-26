import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/context/AuthProvider';
import WalletProvider from '@/context/WalletProvider';
// import Navbar from "@components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "$RORO WEBSITE",
  description: "RoroLand on Solana",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
