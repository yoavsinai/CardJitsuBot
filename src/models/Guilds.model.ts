import mongoose from 'mongoose';
import { GuildDocument } from '../types/Mongodb';

const reqString = {
    type: String,
    required: true,
};

export const GuildSchema = new mongoose.Schema({
    guildId: reqString,
    language: reqString,
});

export const GuildModel = mongoose.model<GuildDocument>('Guild', GuildSchema, 'Guilds');
