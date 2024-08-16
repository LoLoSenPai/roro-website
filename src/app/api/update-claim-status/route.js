import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import connectToDatabase from '@/lib/mongodb';
import Claim from '@/models/Claim';

export async function POST(req) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            return NextResponse.json({ error: 'Handle not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update claim status:', error);
        return NextResponse.json({ error: 'Failed to update claim status' }, { status: 500 });
    }
}