import Client from './client';
import { GatewayIntentBits, Partials } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

client.init();
