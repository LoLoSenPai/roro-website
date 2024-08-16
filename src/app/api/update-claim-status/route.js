import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import connectToDatabase from '@/lib/mongodb';
import Claim from '@/models/Claim';

export default async function handler(req, res) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { handle } = req.body;

    try {
        await connectToDatabase();

        // Mettre à jour le statut de claim pour ce twitterHandle
        const result = await Claim.findOneAndUpdate(
            { twitterHandle: handle },
            { claimed: true, claimedAt: new Date() },
            { new: true, upsert: true }
        );

        if (!result) {
            return res.status(404).json({ error: 'Handle not found' });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to update claim status:', error);
        res.status(500).json({ error: 'Failed to update claim status' });
    }
}