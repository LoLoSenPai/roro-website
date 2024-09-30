'use client';

import { Transaction } from '@solana/web3.js';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FaWallet, FaCheckCircle } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

function ClaimClient() {
    const { data: session, status } = useSession();
    const [eligibility, setEligibility] = useState(null);
    const { publicKey, signTransaction } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEligibility, setIsLoadingEligibility] = useState(true);
    const [step, setStep] = useState(1);
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            checkEligibility();
        } else {
            setIsLoadingEligibility(false);
        }
    }, [status]);

    useEffect(() => {
        if (publicKey) {
            setIsWalletConnected(true);
        } else {
            setIsWalletConnected(false);
        }
    }, [publicKey]);

    const checkEligibility = async () => {
        try {
            const res = await fetch('/api/check-eligibility');
            if (!res.ok) {
                throw new Error('Failed to fetch eligibility');
            }
            const data = await res.json();
            setEligibility(data);
            if (data.claimed) {
                setStep(5); // Déjà claimé
            } else if (status === 'authenticated' && step === 1) {
                // L'utilisateur est authentifié mais reste au step 1 jusqu'à ce qu'il clique sur Next
            }
        } catch (error) {
            console.error('Failed to check eligibility:', error);
        } finally {
            setIsLoadingEligibility(false);
        }
    };

    const handleNextStep = () => {
        if (step === 1 && status === 'authenticated') {
            setStep(2);
        } else if (step === 2 && isWalletConnected) {
            setStep(3);
        }
    };

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
                credentials: 'include',
                body: JSON.stringify({
                    destination: publicKey.toString(),
                    amount: eligibility.tokens,
                    mintAddress: 'EraznuWFJbuZUMkMpEMfLJpDX4X8b68JohmKucbDgc5r',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));

                try {
                    const signedTransaction = await signTransaction(transaction);

                    const sendResponse = await fetch('/api/send-transaction', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            transaction: signedTransaction.serialize().toString('base64'),
                        }),
                    });

                    if (sendResponse.ok) {
                        setIsLoading(false);
                        setStep(4);

                        setTimeout(() => {
                            setStep(5);
                            setEligibility((prev) => ({ ...prev, claimed: true }));
                        }, 3000);
                    } else {
                        console.error('Failed to send transaction:', await sendResponse.text());
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
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingEligibility) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full bg-[#FFECA9]">
                <div className="loader"></div>
                <p>Fetching your eligibility...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#FFECA9] justify-between">
            <div>

            </div>
            <Timeline step={step} />
            <MainText step={step} eligibility={eligibility} session={session} handleNextStep={handleNextStep} handleClaim={handleClaim} isWalletConnected={isWalletConnected} isLoading={isLoading} />
            <BottomImage step={step} />
        </div>
    );
}

function Timeline({ step }) {
    return (
        <>
            {/* Desktop version */}
            <div className={`flex flex-col items-center justify-center w-1/4 h-full text-black max-md:hidden`}>
                <div className="flex flex-col justify-center h-full">

                    {/* Step 1 */}
                    <div className="flex items-start">
                        <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step > 1 ? 'bg-green-500' : step === 1 ? 'bg-green-500' : 'bg-gray-400'}`}>
                                <FaXTwitter className="w-6 h-6 text-white" />
                            </div>
                            <div className={`w-[2px] h-16 ${step >= 2 ? 'bg-gray-300' : ''} my-4`}></div>
                        </div>
                        <div className="ml-4 flex-grow">
                            <p className="text-gray-500 text-xs">Step 1</p>
                            <p className="font-bold">Connect Twitter</p>
                            <p className={`text-xs text-center ${step > 1 ? 'text-white bg-green-500 p-1 rounded-full' : step === 1 ? 'text-black bg-gray-200 p-1 rounded-full' : 'text-gray-400'}`}>
                                {step === 1 ? 'In progress' : 'Completed'}
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start mt-0">
                        <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step > 2 ? 'bg-green-500' : step === 2 ? 'bg-green-500' : 'bg-gray-400'}`}>
                                <FaWallet className="w-6 h-6 text-white" />
                            </div>
                            <div className={`w-[2px] h-16 ${step >= 3 ? 'bg-gray-300' : ''} my-4`}></div>
                        </div>
                        <div className="ml-4 flex-grow">
                            <p className="text-gray-500 text-xs">Step 2</p>
                            <p className="font-bold">Connect Wallet</p>
                            <p className={`text-xs text-center ${step > 2 ? 'text-white bg-green-500 p-1 rounded-full' : step === 2 ? 'text-black bg-gray-200 p-1 rounded-full' : 'text-gray-400 bg-gray-100 p-1 rounded-full'}`}>
                                {step === 2 ? 'In progress' : step > 2 ? 'Completed' : 'Upcoming'}
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center mt-0">
                        <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-400'}`}>
                                <FaCheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="ml-4 flex-grow">
                            <p className="text-gray-500 text-xs">Step 3</p>
                            <p className="font-bold">Claim</p>
                            <p className={`text-xs text-center ${step >= 5 ? 'text-white bg-green-500 p-1 rounded-full' : step === 3 ? 'text-black bg-gray-200 p-1 rounded-full' : 'text-gray-400 bg-gray-100 p-1 rounded-full'}`}>
                                {step === 3 ? 'In progress' : step >= 5 ? 'Completed' : 'Upcoming'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile version */}
            <div className='flex justify-between items-start w-full p-4 md:hidden text-black'>
                <div className="flex flex-col items-center">
                    {/* Step 1 */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step > 1 ? 'bg-green-500' : step === 1 ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <FaXTwitter className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">Step 1</p>
                    <p className="font-bold text-center max-sm:text-sm">Connect Twitter</p>
                    <p className={`text-xs ${step > 1 ? 'text-white bg-green-500 p-1 rounded-full' : step === 1 ? 'text-black bg-gray-200 p-1 rounded-full' : 'text-gray-400'}`}>
                        {step === 1 ? 'In progress' : 'Completed'}
                    </p>
                </div>

                <div className="flex items-start flex-grow">
                    <div className={`h-[2px] bg-gray-300 ${step >= 2 ? '' : 'hidden'} mt-5 mx-2`} style={{ maxWidth: '250px', flexGrow: 1 }}></div>
                </div>

                <div className="flex flex-col items-center">
                    {/* Step 2 */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step > 2 ? 'bg-green-500' : step === 2 ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <FaWallet className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">Step 2</p>
                    <p className="font-bold text-center max-sm:text-sm">Connect Wallet</p>
                    <p className={`text-xs ${step > 2 ? 'text-white bg-green-500 p-1 rounded-full' : step === 2 ? 'text-black bg-gray-200 p-1 rounded-full' : 'text-gray-400 bg-gray-100 p-1 rounded-full'}`}>
                        {step === 2 ? 'In progress' : step > 2 ? 'Completed' : 'Upcoming'}
                    </p>
                </div>

                <div className="flex items-start flex-grow">
                    <div className={`h-[2px] bg-gray-300 ${step >= 3 ? '' : 'hidden'} mt-5 mx-2`} style={{ maxWidth: '250px', flexGrow: 1 }}></div>
                </div>

                <div className="flex flex-col items-center">
                    {/* Step 3 */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <FaCheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">Step 3</p>
                    <p className="font-bold text-center max-sm:text-sm">Claim</p>
                    <p className={`text-xs ${step >= 5 ? 'text-white bg-green-500 p-1 rounded-full' : step === 3 ? 'text-black bg-gray-200 p-1 rounded-full' : 'text-gray-400 bg-gray-100 p-1 rounded-full'}`}>
                        {step === 3 ? 'In progress' : step >= 5 ? 'Completed' : 'Upcoming'}
                    </p>
                </div>
            </div>
        </>
    );
}

function MainText({ step, eligibility, session, handleNextStep, handleClaim, isWalletConnected, isLoading }) {
    if (step === 4) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-[#FFECA9] animate-slide-down">
                <img
                    src="/assets/4-image.png"
                    alt="Claim success animation"
                    className="object-contain w-full max-w-md"
                />
            </div>
        );
    }

    if (step === 5) {
        return (
            <div className="flex flex-col justify-center items-center text-center w-full md:w-1/2 space-y-4 animate-fade-in">
                <p className="text-4xl md:text-4xl font-bold mb-4">Congrats!!!</p>
                <p className="text-2xl mb-4"><span className='text-amber-500 font-bold'>{eligibility.tokens}</span> coins have been added to your wallet!</p>
                <button
                    className="px-4 py-2 md:px-6 md:py-3 bg-black text-white rounded-full"
                    onClick={() => window.location.href = '/'}
                >
                    Home
                </button>
                <button
                    onClick={() => signOut("twitter", { callbackUrl: '/claim' })}
                    className="px-4 py-2 md:px-6 md:py-3 bg-black text-white rounded-full"
                >
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <WalletModalProvider>
            <div className={`flex flex-col justify-center items-center text-center text-black max-md:h-full w-full md:w-1/2 ${step === 4 ? 'animate-fade-out' : ''}`}>
                {!session || step < 2 ? (
                    // Le contenu d'avant la claim (connexion Twitter)
                    <>
                        <div className="text-center z-10 space-y-10">
                            <p className="text-5xl font-bold mb-4">Ready to claim? First...</p>
                            <p className="text-2xl mb-4">Connect your Twitter to check your eligibility.</p>
                            <div className='flex justify-center items-center'>
                                <button
                                    onClick={!session ? () => signIn("twitter", { callbackUrl: '/claim' }) : null}
                                    className={`px-4 py-2 md:px-6 md:py-3 rounded-full w-40 bg-black text-white`}
                                    disabled={!!session}
                                >
                                    <div className='flex flex-row justify-around'>
                                        <FaXTwitter className="w-6 h-6" />
                                        <span className="truncate w-full text-center">
                                            {session ? session.user.name : 'Connect'}
                                        </span>
                                    </div>
                                </button>
                                <button
                                    className={`ml-4 px-4 py-2 md:px-6 md:py-3 ${session ? 'bg-white text-black font-bold' : 'bg-gray-300 text-black'} rounded-full`}
                                    onClick={handleNextStep}
                                    disabled={!session}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                        {session && (
                            <div className="flex justify-center items-center w-full mt-10">
                                <button
                                    onClick={() => signOut("twitter", { callbackUrl: '/claim' })}
                                    className="px-4 py-2 md:px-6 md:py-3 text-gray-700 hover:text-black"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="text-center z-10 space-y-10">
                            {eligibility?.eligible ? (
                                <>
                                    <p className="text-5xl font-bold mb-4">
                                        {step === 2 ? 'Now...' : 'And finally...'}
                                    </p>
                                    {step === 2 ? (
                                        <>
                                            <p className="mb-4 text-2xl">Link your wallet to claim your coins.</p>
                                            <div className='flex justify-center space-x-3'>
                                                <WalletMultiButton className="!bg-blue-500" />
                                                <button
                                                    className={`px-4 py-2 md:px-6 md:py-3 font-bold ${isWalletConnected ? 'bg-white text-black' : 'bg-gray-300 text-black'} rounded-full `}
                                                    disabled={!isWalletConnected}
                                                    onClick={handleNextStep}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="mb-4 text-2xl">Claim your well-deserved</p>
                                                <p className='text-2xl text-amber-500 font-bold'>{eligibility.tokens} tokens.</p>
                                            </div>
                                            <button
                                                className={`px-4 py-2 md:px-6 md:py-3 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={handleClaim}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <div className="loader"></div>
                                                ) : (
                                                    'Claim'
                                                )}
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-600 text-2xl">You're not eligible for this claim phase.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </WalletModalProvider >
    );
}

function BottomImage({ step }) {
    return (
        <div className={`relative w-full md:w-auto flex justify-center md:justify-end items-end md:items-end h-full ${step === 4 ? 'animate-fade-out' : step === 4 ? 'animate-slide-down' : 'animate-fade-in'}`}>
            <img
                src={`/assets/${step}-image.png`}
                alt={`Step ${step} image`}
                className="object-contain w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-4xl"
                style={{
                    height: 'auto',
                    maxHeight: '100vh',
                    bottom: 0,
                }}
            />
        </div>
    );
}

export default ClaimClient;
