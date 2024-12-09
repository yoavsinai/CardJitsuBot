import { ApplicationCommandType } from 'discord.js';
import { ChatInputCommand } from '../../../types/Command';

export const command: ChatInputCommand = {
    name: 'activegames',
    description: 'active games',
    test: true,
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: 'Administrator',
    execute: async (client, interaction) => {
        const owner = (await client.application?.fetch()!).owner;
        if (owner?.id !== interaction.user.id) return;

        const gamesFormatted: string[] = [];
        for (const game of client.games) {
            const gameFormatted = `Guild ID: ${game[1].textChannel.guildId}\nPlayer ID: ${game[1].player.id}\nOpponent ID: ${game[1].opponent ? game[1].opponent.id : 'null'}`;
            gamesFormatted.push(gameFormatted);
        }
        await interaction.reply(`Active Games:\n${gamesFormatted.toString()}`);

        setTimeout(async () => {
            await interaction.deleteReply();
        }, 10000);
    },
};
