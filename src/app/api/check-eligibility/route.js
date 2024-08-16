import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import fs from 'fs';
import path from 'path';

export async function GET(req) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
        });
    }

    const twitterHandle = session.user.handle;

    const filePath = path.join(process.cwd(), 'distribution.json');
    const distributionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const tokens = distributionData[twitterHandle];

    if (tokens) {
        return new Response(
            JSON.stringify({ eligible: true, tokens }),
            { status: 200 }
        );
    } else {
        return new Response(
            JSON.stringify({ eligible: false }),
            { status: 200 }
        );
    }
}
