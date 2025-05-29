'use client'

import { toast } from 'sonner';

const contractAddress = '0x1234567890abcdef1234567890abcdef12345678';

export default function CopyContractAddress() {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(contractAddress);
            toast.success('Address copied!');
        } catch (err) {
            toast.error('Error copying address');
        }
    };

    return (
        <button onClick={handleCopy} className="text-white text-3xl hover:text-blue-500 hover:scale-110 transition-all duration-200">
            CA
        </button>
    );
}
