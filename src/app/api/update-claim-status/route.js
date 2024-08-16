import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
        });
    }

    const { handle } = await req.json();
    const filePath = path.join(process.cwd(), 'distribution.json');
    const distributionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (distributionData[handle]) {
        distributionData[handle].claimed = true;
        fs.writeFileSync(filePath, JSON.stringify(distributionData, null, 2));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
}
