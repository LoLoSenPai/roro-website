'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const network = WalletAdapterNetwork.Mainnet;

const wallets = [
  new PhantomWalletAdapter(),
];

export default function WalletProvider({ children }) {
  return (
    <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
