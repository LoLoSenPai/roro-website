'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const network = WalletAdapterNetwork.Devnet;

const wallets = [
  new PhantomWalletAdapter(), // Ajoute ici les wallets que tu veux supporter
];

export default function WalletProvider({ children }) {
  return (
    <ConnectionProvider endpoint={`https://api.${network}.solana.com`}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
