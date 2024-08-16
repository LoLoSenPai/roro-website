'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function ClaimClient() {
    const { data: session, status } = useSession();
    const [eligibility, setEligibility] = useState(null);
    const [error, setError] = useState(null);
    const { publicKey } = useWallet();

    const handleClaim = () => {
        if (!publicKey) {
            alert('Please connect your wallet before claiming.');
            return;
        }
        // Logic to interact with the smart contract to claim tokens
        alert(`Claiming ${eligibility.tokens} tokens with wallet ${publicKey.toString()}...`);
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
                })
                .catch((error) => {
                    setError(error.message);
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
