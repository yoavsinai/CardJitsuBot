import { type } from 'os';
import { belt } from '../util/belts';
import { CardsConstructor, Colors, Element } from './CardJistu';
import { Document, Types } from 'mongoose';

interface PlayerObject {
    userId: string;
    username: string;
    won: number;
    lost: number;
    belt: belt;
    cards: Array<CardsConstructor>;
    gamesTillVote: number;
    lastVote: number;
    patreon: false;
}

interface GuildObject {
    guildId: string;
    language: string;
}

interface GuildDocument extends Document, GuildObject {}

interface PlayerDocument extends Document, PlayerObject {}
