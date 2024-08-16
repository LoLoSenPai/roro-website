import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import connectToDatabase from '@/lib/mongodb';
import Claim from '@/models/Claim';

export default async function handler(req, res) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const twitterHandle = session.user.handle;

    try {
        await connectToDatabase();

        const claim = await Claim.findOne({ twitterHandle });

        if (claim && claim.claimed) {
            return res.status(200).json({ eligible: false });
        } else {
            return res.status(200).json({ eligible: true, tokens: 1000 });
        }
    } catch (error) {
        console.error('Failed to check eligibility:', error);
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
}