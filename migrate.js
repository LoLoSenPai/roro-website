import connectToDatabase from '@/lib/mongodb.js';
import fs from 'fs';
import path from 'path';
import Claim from '@/models/Claim.js';

async function migrateData() {
    try {
        // Connexion à MongoDB
        await connectToDatabase();

        // Lire le fichier distribution.json
        const filePath = path.join(process.cwd(), 'distribution.json');
        const distributionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Insérer chaque entrée dans la collection MongoDB
        for (const twitterHandle in distributionData) {
            const tokens = distributionData[twitterHandle];

            await Claim.create({
                twitterHandle,
                claimed: false,
                claimedAt: null
            });

            console.log(`Migrated: ${twitterHandle}`);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error migrating data:', error);
        process.exit(1);
    }
}

migrateData();