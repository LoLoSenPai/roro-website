import mongoose from 'mongoose';

const ClaimSchema = new mongoose.Schema({
    twitterHandle: { type: String, required: true, unique: true },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
});

export default mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);