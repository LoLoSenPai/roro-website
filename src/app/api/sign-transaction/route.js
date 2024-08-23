import { Keypair, Transaction, PublicKey, Connection } from '@solana/web3.js';
import { createTransferInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

const seedArray = JSON.parse(process.env.SEEDPHRASE);
const sourceWallet = Keypair.fromSecretKey(Uint8Array.from(seedArray));

export async function POST(req) {
    try {
        const { destination, amount, mintAddress } = await req.json();

        const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');
        const transaction = new Transaction();

        const fromTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            sourceWallet.publicKey
        );
        const toTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            new PublicKey(destination)
        );

        const transferInstruction = createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            sourceWallet.publicKey,
            BigInt(amount) * BigInt(10 ** 6),
            [],
            TOKEN_PROGRAM_ID
        );

        transaction.add(transferInstruction);
        transaction.feePayer = new PublicKey(destination);
        const { blockhash } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;

        transaction.partialSign(sourceWallet);

        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        }).toString('base64');

        return new Response(JSON.stringify({ transaction: serializedTransaction }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Failed to create transaction:', error);
        return new Response(JSON.stringify({ error: 'Failed to create transaction' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
