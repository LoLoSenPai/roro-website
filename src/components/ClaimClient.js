'use client';

import { Transaction } from '@solana/web3.js';
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
            const response = await fetch('/api/sign-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: publicKey.toString(),
                    amount: eligibility.tokens,
                    mintAddress: 'EraznuWFJbuZUMkMpEMfLJpDX4X8b68JohmKucbDgc5r',
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
            }

            if (response.ok) {
                const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));

                try {
                    const signedTransaction = await signTransaction(transaction);

                    const sendResponse = await fetch('/api/send-transaction', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            transaction: signedTransaction.serialize().toString('base64'),
                        }),
                    });

                    let sendData;
                    try {
                        sendData = await sendResponse.json();
                    } catch (jsonError) {
                        throw new Error(`Failed to parse JSON response from send-transaction: ${jsonError.message}`);
                    }

                    if (sendResponse.ok) {
                        const updateResponse = await fetch('/api/update-claim-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                handle: session.user.handle,
                            }),
                        });

                        if (updateResponse.ok) {
                            alert('Tokens claimed successfully!');
                            setEligibility((prev) => ({ ...prev, claimed: true }));
                        } else {
                            console.error('Failed to update claim status:', await updateResponse.text());
                        }
                    } else {
                        console.error('Failed to send transaction:', sendData.error);
                    }
                } catch (walletError) {
                    if (walletError.message.includes("User rejected the request")) {
                        return;
                    } else {
                        console.error('Transaction failed:', walletError);
                        alert('An error occurred while processing your transaction.');
                    }
                }
            } else {
                console.error('Failed to claim tokens:', data.error);
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