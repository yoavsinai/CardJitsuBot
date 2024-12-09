import { Webhook } from '@top-gg/sdk';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import ExtendedClient from '../client';
import PlayerModel, { getPlayerById } from '../models/Players.model';
import { threeUSDPatreonCards, voteCards } from './cards';
const app = express();
const PORT = parseInt(process.env.PORT!, 10) || 3000;

export const web = {
    execute: async (client: ExtendedClient) => {
        app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
        app.get('*', (req: any, res: any) => {
            res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
        });

        const webhook = new Webhook(process.env.topggAuth);

        app.post(
            '/dblwebhook',
            webhook.listener(async (vote) => {
                const player = await getPlayerById(vote.user);
                await PlayerModel.updateOne({ userId: vote.user }, { gamesTillVote: 0, cards: [...player.cards, ...voteCards], lastVote: Date.now() });
            }),
        );
        app.use('/subscriptiondonatepat', bodyParser.raw({ type: 'application/json' }));

        app.post('/subscriptiondonatepat', async (req: any, res: any) => {
            const hash = crypto.createHmac('md5', process.env.PATREON_WEBHOOK_SECRET!).update(req.body).digest('hex');
            const success = req.header('x-patreon-signature') === hash;
            if (success) {
                const payload = JSON.parse(req.body);
                const discord = payload.included[1].attributes.social_connections.discord.user_id as string;
                if (payload.data.attributes.patron_status === 'active_patron') {
                    const player = await getPlayerById(discord);
                    if (player) await PlayerModel.updateOne({ userId: discord }, { gamesTillVote: 0, cards: [...player.cards, ...threeUSDPatreonCards], lastVote: Date.now() });
                }
                if (payload.data.attributes.patron_status === 'former_patron') {
                    const player = await getPlayerById(discord);
                    if (player) await PlayerModel.updateOne({ userId: discord }, { gamesTillVote: 0, cards: player.cards.filter((c) => !threeUSDPatreonCards.includes(c)), lastVote: Date.now() });
                }
            }
            res.status(200).end();
        });

        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`${client.user?.username} is running on port ${PORT}`);
        });
    },
};
