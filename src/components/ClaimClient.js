'use client';

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function ClaimClient() {
    const { data: session, status } = useSession();
    const [eligibility, setEligibility] = useState(null);
    const [error, setError] = useState(null);
    const { publicKey, signTransaction } = useWallet();
    const [isLoading, setIsLoading] = useState(false);

    const handleClaim = async () => {
        if (!publicKey) {
            alert('Please connect your wallet before claiming.');
            return;
        }

        setIsLoading(true);

        try {
            const connection = new Connection(process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL, 'confirmed');
            const transaction = new Transaction();

            const mintAddress = new PublicKey('EraznuWFJbuZUMkMpEMfLJpDX4X8b68JohmKucbDgc5r');
            const sourceWallet = new PublicKey("GdVg1kKCjYP7moNE3N3W4KEio3ECSTnWqB6iNdzR5eUH");

            const associatedTokenAddress = await getAssociatedTokenAddress(mintAddress, publicKey);

            try {
                await getAccount(connection, associatedTokenAddress);
            } catch (error) {
                const createATAInstruction = createAssociatedTokenAccountInstruction(
                    publicKey,
                    associatedTokenAddress,
                    publicKey,
                    mintAddress
                );
                transaction.add(createATAInstruction);
            }

            const fromTokenAccount = await getAssociatedTokenAddress(mintAddress, sourceWallet);
            const tokensToClaim = BigInt(eligibility.tokens) * BigInt(10 ** 6);

            const transferInstruction = createTransferInstruction(
                fromTokenAccount,
                associatedTokenAddress,
                sourceWallet,
                tokensToClaim,
                [],
                TOKEN_PROGRAM_ID
            );

            transaction.add(transferInstruction);
            transaction.feePayer = publicKey;
            const { blockhash } = await connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;

            try {
                const signedTransaction = await signTransaction(transaction);
                const signature = await connection.sendRawTransaction(signedTransaction.serialize());

                // Utilisation de TransactionConfirmationStrategy
                const confirmationStrategy = {
                    signature,
                    blockhash,
                    lastValidBlockHeight: transaction.lastValidBlockHeight,
                };

                await connection.confirmTransaction(confirmationStrategy, 'confirmed');

                alert('Tokens claimed successfully!');
                setEligibility((prev) => ({ ...prev, claimed: true }));
            } catch (walletError) {
                if (walletError.message.includes("User rejected the request")) {
                    console.log("Transaction cancelled by user.");
                    return; // Ne pas propager l'erreur
                } else {
                    console.error('Transaction failed:', walletError);
                    alert('An error occurred while processing your transaction.');
                }
            }

        } catch (error) {
            console.error('Failed to claim tokens:', error);
            setError('Failed to claim tokens');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const res = await fetch('/api/check-eligibility');
                if (!res.ok) {
                    throw new Error('Failed to fetch eligibility');
                }
                const data = await res.json();
                setEligibility(data);
            } catch (error) {
                setError(error.message);
            }
        };

        if (status === 'authenticated') {
            checkEligibility();
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
                        {eligibility.claimed ? (
                            <p className="text-2xl mb-4">
                                You have already claimed <span className='text-green-500'>{eligibility.tokens || '0'}</span> tokens.
                            </p>
                        ) : (
                            <>
                                <p className="text-2xl mb-4">
                                    You can claim <span className='text-green-500'>{eligibility.tokens || '0'}</span> tokens.
                                </p>
                                {publicKey ? (
                                    <p className="mt-2 text-gray-700">Connected Wallet: <span className="font-mono">{publicKey.toString()}</span></p>
                                ) : (
                                    <p className="mt-2 text-gray-700">No wallet connected</p>
                                )}
                                <div className='flex justify-center items-center space-x-8'>
                                    <button
                                        onClick={handleClaim}
                                        className="h-12 px-4 py-2 bg-green-500 text-white rounded-lg"
                                        disabled={!publicKey || eligibility.claimed || isLoading}
                                    >
                                        {isLoading ? 'Claiming...' : 'Claim Tokens'}
                                    </button>
                                    <WalletMultiButton />
                                </div>
                            </>
                        )}
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