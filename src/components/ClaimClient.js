'use client';

import { PublicKey, Transaction, Connection, Keypair } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import secret from './guideSecret.json';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function ClaimClient() {
    const { data: session, status } = useSession();
    const [eligibility, setEligibility] = useState(null);
    const [error, setError] = useState(null);
    const { publicKey, sendTransaction } = useWallet();

    const handleClaim = async () => {
        if (!publicKey) {
            alert('Please connect your wallet before claiming.');
            return;
        }

        try {
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

            // Adresse du token mint et du wallet source
            const tokenMintAddress = new PublicKey('DjP92poeVf2tXkAF4WVusBRywm8q3Dqd8thUhBjjMzWK');
            const sourceWallet = Keypair.fromSecretKey(Uint8Array.from(secret)); // Charger la clé privée
            const sourceWalletAddress = sourceWallet.publicKey;

            console.log("Claim process started");
            console.log("Source Wallet Address:", sourceWalletAddress.toString());
            console.log("Public Key of Connected Wallet:", publicKey.toString());

            // Obtenir ou créer le compte token de l'utilisateur
            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                publicKey,  // L'utilisateur paie les frais
                tokenMintAddress,
                publicKey
            );
            console.log("Destination Token Account Address:", toTokenAccount.address.toString());

            // Vérifier ou créer le compte token source
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                sourceWallet.publicKey,
                tokenMintAddress,
                sourceWallet.publicKey
            );
            console.log("Source Token Account Address:", fromTokenAccount.address.toString());

            // Récupérer le recentBlockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

            // Créer l'instruction de transfert
            const transaction = new Transaction().add(
                createTransferInstruction(
                    fromTokenAccount.address,
                    toTokenAccount.address,
                    sourceWallet.publicKey,
                    eligibility.tokens * 10 ** 8,  // Ajuster selon les décimales du token
                    [],
                    TOKEN_PROGRAM_ID
                )
            );

            // Ajouter le recentBlockhash et spécifier l'utilisateur comme fee payer
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            console.log("Transaction created:", transaction);

            // Signer la transaction avec la clé privée du wallet source
            transaction.sign(sourceWallet);

            // Envoyer la transaction, l'utilisateur paie les frais
            const signature = await sendTransaction(transaction, connection);

            // Nouvelle méthode pour confirmer la transaction
            const confirmationStrategy = {
                signature,
                blockhash,
                lastValidBlockHeight
            };

            const confirmation = await connection.confirmTransaction(confirmationStrategy, 'confirmed');

            if (confirmation.value.err) {
                throw new Error('Transaction confirmation failed');
            }

            alert('Tokens claimed successfully!');
        } catch (error) {
            console.error('Failed to claim tokens:', error);
            setError('Failed to claim tokens');
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/check-eligibility')
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch eligibility');
                    }
                    return res.json();
                })
                .then((data) => {
                    setEligibility(data);
                    console.log("Eligibility data fetched:", data);
                })
                .catch((error) => {
                    setError(error.message);
                    console.error("Error fetching eligibility:", error);
                });
        }
    }, [status]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p>You need to connect with Twitter to check your eligibility.</p>
                <button
                    onClick={() => signIn("twitter", { callbackUrl: '/claim' })}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Connect with Twitter
                </button>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-600">There was an error checking your eligibility: {error}</p>;
    }

    if (!eligibility) {
        return <p className="text-center text-gray-600">Checking your eligibility...</p>;
    }

    return (
        <WalletModalProvider>
            <div className="flex flex-col items-center justify-center h-screen">
                {eligibility.eligible ? (
                    <div className="text-center">
                        <p className="text-2xl mb-4">You can claim <span className='text-green-500'>{eligibility.tokens}</span> tokens</p>
                        <p className="mt-2 text-gray-700">Connected Wallet: <span className="font-mono">{publicKey.toString()}</span></p>
                        <div className='flex justify-center items-center space-x-8'>
                            <button
                                onClick={handleClaim}
                                className="h-12 px-4 py-2 bg-green-500 text-white rounded-lg"
                            >
                                Claim Tokens
                            </button>
                            <WalletMultiButton />
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">You're not eligible for this claim phase.</p>
                )}
                <button
                    onClick={() => signOut("twitter", { callbackUrl: '/claim' })}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                    Sign Out
                </button>
            </div>
        </WalletModalProvider>
    );
}
