import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import connectToDatabase from '@/lib/mongodb';
import Claim from '@/models/Claim';

export async function POST(req) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
        });
    }

    const { handle } = await req.json();

    try {
        await connectToDatabase();

        // Mettre à jour le statut de claim pour ce twitterHandle
        const result = await Claim.findOneAndUpdate(
            { twitterHandle: handle },
            { claimed: true, claimedAt: new Date() },
            { new: true, upsert: true }
        );

        if (!result) {
            return new Response(JSON.stringify({ error: 'Handle not found' }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
        });
    } catch (error) {
        console.error('Failed to update claim status:', error);
        return new Response(JSON.stringify({ error: 'Failed to update claim status' }), {
            status: 500,
        });
    }
}
