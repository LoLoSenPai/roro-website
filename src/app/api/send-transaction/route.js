import { Connection } from '@solana/web3.js';

export async function POST(req) {
    try {
        const { transaction, twitterHandle } = await req.json();
        const connection = new Connection(process.env.QUICKNODE_RPC_URL, 'confirmed');

        const transactionBuffer = Buffer.from(transaction, 'base64');
        const signature = await connection.sendRawTransaction(transactionBuffer);
        await connection.confirmTransaction(signature);

        // Appeler l'API pour mettre à jour le statut du claim
        const updateResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/update-claim-status`, {
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
        });
    } catch (error) {
        console.error('Failed to send transaction:', error);
        return new Response(JSON.stringify({ success: false, error: 'Detailed error message' }), {
            status: 500,
        });
    }
}