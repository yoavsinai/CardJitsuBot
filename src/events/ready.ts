import { ActivityType } from 'discord.js';
import Client from '../client';
import { Event } from '../types/Event';
import { loadLanguages } from '../lang/language';
import { web } from '../api/api';
import { handler } from '../util/commands_handlers';

export const event: Event = {
    name: 'ready',
    once: true,
    execute: async (client: Client) => {
        // list slash commands
        console.log("Slash commands:");
        await handler.execute(client);
        await web.execute(client);
        await loadLanguages(client);

        client.user!.setActivity({
            name: 'to win! -- /playcardjitsu',
            type: ActivityType.Playing,
        });
    },
};
