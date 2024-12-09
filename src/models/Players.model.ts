import mongoose from 'mongoose';
import { PlayerDocument } from '../types/Mongodb';

const reqString = {
    type: String,
    required: true,
};
const reqNumber = {
    type: Number,
    required: true,
};

const PlayerSchema = new mongoose.Schema({
    userId: reqString,
    won: reqNumber,
    lost: reqNumber,
    belt: reqString,
    cards: {
        type: [Object],
        required: true,
    },
    gamesTillVote: reqNumber,
    lastVote: Number,
    patreon: Boolean,
});

export const getPlayerById = async (userId: string) => {
    let user = await PlayerModel.findOne({ userId });
    if (!user) {
        user = await PlayerModel.create({
            userId,
            won: 0,
            lost: 0,
            belt: 'White',
            cards: [],
            gamesTillVote: 0,
            lastVote: 0,
            patreon: false,
        });
    }
    return user;
};

const PlayerModel = mongoose.model<PlayerDocument>('Player', PlayerSchema, 'Players');

export default PlayerModel;
