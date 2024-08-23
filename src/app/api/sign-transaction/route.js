import { Keypair, Transaction, PublicKey, Connection } from '@solana/web3.js';
import { createTransferInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';

const seedArray = JSON.parse(process.env.SEEDPHRASE);
const sourceWallet = Keypair.fromSecretKey(Uint8Array.from(seedArray));

export async function POST(req) {
    try {
        const { destination, amount, mintAddress } = await req.json();

        const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');
        const tokenMintAddress = new PublicKey(mintAddress);
        const destinationPublicKey = new PublicKey(destination);
        const transaction = new Transaction();

        // Obtenir l'adresse du compte associé
        const associatedTokenAddress = await getAssociatedTokenAddress(
            tokenMintAddress,
            destinationPublicKey
        );

        try {
            // Vérifier si le compte associé existe
            await getAccount(connection, associatedTokenAddress);
            console.log("Associated Token Account already exists, no need to create it.");
        } catch (error) {
            console.log("Associated Token Account does not exist, creating it.");
            const createATAInstruction = createAssociatedTokenAccountInstruction(
                destinationPublicKey, // Le compte qui recevra les tokens et qui paie les frais
                associatedTokenAddress,
                destinationPublicKey,
                tokenMintAddress
            );
            transaction.add(createATAInstruction);
        }

        const fromTokenAccount = await getAssociatedTokenAddress(
            tokenMintAddress,
            sourceWallet.publicKey
        );

        const tokensToClaim = BigInt(amount) * BigInt(10 ** 6);

        const transferInstruction = createTransferInstruction(
            fromTokenAccount,
            associatedTokenAddress,
            sourceWallet.publicKey,
            tokensToClaim,
            [],
            TOKEN_PROGRAM_ID
        );

        transaction.add(transferInstruction);

        transaction.feePayer = destinationPublicKey; // Le wallet de l'utilisateur paie les frais
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