/* eslint-disable no-console */
import { ApplicationCommandData, ApplicationCommandType, ChatInputApplicationCommandData, MessageApplicationCommandData, REST, Routes, UserApplicationCommandData } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import Client from '../client';
import { Command } from '../types/Command';

export const handler = {
    async execute(client: Client) {
        // Commands Handler

        await CommandHandler(client);
    },
};

async function CommandHandler(client: Client) {
    const interactionsPath = path.join(__dirname, '../', 'commands/interactions');
    const interactionsdirs = readdirSync(interactionsPath);
    const guilds = ['720226309267259432' /*demo*/];

    const data: ApplicationCommandData[] = [];
    const testdata: ApplicationCommandData[] = [];

    await client.application!.fetch();

    for (const dir of interactionsdirs) {
        const commands_files = readdirSync(`${interactionsPath}/${dir}`).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
        for (const file of commands_files) {
            console.log("Loading command: " + file);
            const { command } = (await import(`../commands/interactions/${dir}/${file}`)) as { command: Command };

            const cmd = getApplicationCommand(command);

            if (command.defaultMemberPermissions) cmd.defaultMemberPermissions = command.defaultMemberPermissions;
            if (command.dmPermission) cmd.dmPermission = command.dmPermission;

            if (command.test) testdata.push(cmd);
            else data.push(cmd);

            client.interactions.set(command.name, command);
        }
    }

    await registerCommands(data, testdata, guilds);
}

function getApplicationCommand(command: Command) {
    if (command.type === ApplicationCommandType.ChatInput) {
        return {
            name: command.name,
            description: command.description!,
            options: command.options ?? undefined,
            type: command.type ?? ApplicationCommandType.ChatInput,
        } as ChatInputApplicationCommandData;
    } else {
        return {
            name: command.name,
            type: command.type,
        } as UserApplicationCommandData | MessageApplicationCommandData;
    }
}

async function registerCommands(data: ApplicationCommandData[], testdata: ApplicationCommandData[], guilds: string[]) {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

    try {
        console.log(`Started refreshing ${data.length} application (/) commands.`);

        for (const guild of guilds) {
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guild), { body: testdata });
        }

        const commandsData = (await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: data })) as ApplicationCommandData[];

        console.log(`Successfully reloaded ${commandsData.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}
