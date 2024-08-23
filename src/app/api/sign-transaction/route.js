import { Keypair, Transaction, PublicKey, Connection } from '@solana/web3.js';
import { createTransferInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';

export async function POST(req) {
    const headers = {
        'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || 'https://roro-token.lololabs.xyz',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: headers,
        });
    }

    try {
        const { destination, amount, mintAddress } = await req.json();

        // Connexion au réseau Solana
        const connection = new Connection(process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL, 'confirmed');

        // Accéder à la clé privée depuis une variable d'environnement sécurisée
        const seedArray = JSON.parse(process.env.SEEDPHRASE);
        const sourceWallet = Keypair.fromSecretKey(Uint8Array.from(seedArray));

        const tokenMintAddress = new PublicKey(mintAddress);
        const destinationPublicKey = new PublicKey(destination);
        const transaction = new Transaction();

        // Vérifie si l'utilisateur a déjà un compte token associé
        const associatedTokenAddress = await getAssociatedTokenAddress(
            tokenMintAddress,
            destinationPublicKey
        );

        try {
            await getAccount(connection, associatedTokenAddress);
        } catch (error) {
            const createATAInstruction = createAssociatedTokenAccountInstruction(
                destinationPublicKey,
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

        const accountInfo = await connection.getParsedAccountInfo(tokenMintAddress);
        const decimals = accountInfo.value.data.parsed.info.decimals;
        const tokensToClaim = BigInt(amount) * BigInt(10 ** decimals);

        const transferInstruction = createTransferInstruction(
            fromTokenAccount,
            associatedTokenAddress,
            sourceWallet.publicKey,
            tokensToClaim,
            [],
            TOKEN_PROGRAM_ID
        );

        transaction.add(transferInstruction);
        transaction.feePayer = destinationPublicKey;
        const { blockhash } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;

        // Signer la transaction avec la clé privée du backend
        transaction.partialSign(sourceWallet);

        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
        }).toString('base64');

        return new Response(JSON.stringify({ transaction: serializedTransaction }), {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error('Failed to create transaction:', error);
        return new Response(JSON.stringify({ error: 'Failed to create transaction' }), {
            status: 500,
            headers: headers,
        });
    }
}