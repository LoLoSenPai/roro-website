import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import connectToDatabase from '@/lib/mongodb';
import Claim from '@/models/Claim';

export async function GET(req, res) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        console.log('No session found');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
        });
    }

    const twitterHandle = session.user.handle;

    try {
        console.log('Connecting to database...');
        await connectToDatabase();

        console.log('Searching for claim with twitterHandle:', twitterHandle);
        const claim = await Claim.findOne({ twitterHandle }).lean();

        console.log("Claim found:", claim); // Affiche le claim entier

        if (!claim) {
            return new Response(
                JSON.stringify({ eligible: false, tokens: 0, claimed: false }),
                { status: 200 }
            );
        }

        if (claim.claimed) {
            return new Response(
                JSON.stringify({ eligible: true, tokens: claim.amount, claimed: true }),
                { status: 200 }
            );
        }

        const tokens = parseInt(claim.amount, 10);
        console.log("Eligible tokens to be claimed:", tokens);

        return new Response(
            JSON.stringify({ eligible: true, tokens, claimed: false }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to check eligibility:', error);
        return new Response(JSON.stringify({ error: 'Failed to check eligibility' }), {
            status: 500,
        });
    }
}