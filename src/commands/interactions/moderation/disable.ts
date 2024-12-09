import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { sleep } from '../../../util/sleep';
import { ChatInputCommand } from '../../../types/Command';

export const command: ChatInputCommand = {
    name: 'disable',
    description: 'disables the bot',
    test: true,
    dmPermission: false,
    options: [
        {
            name: 'howlong',
            required: true,
            description: "For how long you wan't to disable (in seconds)",
            type: ApplicationCommandOptionType.Number,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: "Administrator",
    execute: async (client, interaction) => {
        const owner = (await client.application?.fetch()!).owner;
        if (owner?.id !== interaction.user.id) return;
        const numSec = interaction.options.getNumber('howlong');
        interaction.reply("I wen't to sleep for " + numSec);
        await sleep(numSec! * 1000);
        interaction.followUp('I got reenabled!');
    },
};
