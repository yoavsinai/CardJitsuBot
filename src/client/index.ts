/* eslint-disable no-console */
import { Client, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import Game from '../classes/Game';
import { Command } from '../types/Command';
dotenv.config({ path: `./.env.${process.env.NODE_ENV ?? 'production'}` });

class ExtendedClient extends Client {
    public interactions: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public games: Map<string, Game> = new Map();

    public async init() {
        // Make connection with mongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI!);

        // Event Handler

        const eventsPath = path.join(__dirname, '..', 'events');

        const event_files = readdirSync(`${eventsPath}`).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

        for (const file of event_files) {
            const { event } = await import(`../events/${file}`);
            if (event.once) this.once(event.name, (...args) => event.execute(this, ...args));
            else this.on(event.name, (...args) => event.execute(this, ...args));
        }
        console.log(`Loaded all of the events!`);

        this.login(process.env.BOT_TOKEN);
    }
}

export default ExtendedClient;
