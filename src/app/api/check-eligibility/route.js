import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import connectToDatabase from '@/lib/mongodb';
import Claim from '@/models/Claim';

export async function GET(req) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
        });
    }

    const twitterHandle = session.user.handle;

    try {
        await connectToDatabase();

        // Vérifier si l'utilisateur a déjà claim
        const claim = await Claim.findOne({ twitterHandle });

        if (claim && claim.claimed) {
            return new Response(
                JSON.stringify({ eligible: false, message: "Already claimed." }),
                { status: 200 }
            );
        }

        // Récupérer l'éligibilité de la base de données
        const distribution = await Claim.findOne({ twitterHandle });

        if (distribution) {
            return new Response(
                JSON.stringify({ eligible: true, tokens: distribution.tokens }),
                { status: 200 }
            );
        } else {
            return new Response(
                JSON.stringify({ eligible: false, message: "Not eligible for this phase." }),
                { status: 200 }
            );
        }
    } catch (error) {
        console.error('Error fetching eligibility:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch eligibility' }), {
            status: 500,
        });
    }
}
