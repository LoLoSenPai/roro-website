import { Connection } from '@solana/web3.js';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';

export async function POST(req) {
    try {
        const session = await getServerSession({ req, ...authOptions });

        if (!session) {
            console.error('No session found');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
            });
        }

        const twitterHandle = session.user.handle;

        // Log the twitterHandle for debugging
        console.log("Session twitterHandle:", twitterHandle);

        const allowedOrigin = process.env.NEXTAUTH_URL || 'https://roroland.xyz';

        const headers = {
            'Access-Control-Allow-Origin': allowedOrigin,
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

        const { transaction } = await req.json();
        const connection = new Connection(process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL, 'confirmed');

        const transactionBuffer = Buffer.from(transaction, 'base64');
        const signature = await connection.sendRawTransaction(transactionBuffer);
        await connection.confirmTransaction({
            signature,
            blockhash: transaction.recentBlockhash,
            lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
        });

        // Appeler l'API pour mettre à jour le statut du claim
        const updateResponse = await fetch(`${allowedOrigin}/api/update-claim-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': req.headers.get('cookie'),
            },
            body: JSON.stringify({ handle: twitterHandle }),
        });

        if (!updateResponse.ok) {
            console.error('Failed to update claim status:', await updateResponse.text());
            throw new Error('Failed to update claim status');
        }

        return new Response(JSON.stringify({ success: true, signature }), {
            status: 200,
            headers: headers,
        });
    } catch (error) {
        console.error('Failed to send transaction:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to send transaction' }), {
            status: 500,
            headers: headers,
        });
    }
}
