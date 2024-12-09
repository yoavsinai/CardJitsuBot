import { beltsEmojis } from '../../../util/belts';
import Player from '../../../models/Players.model';
import { ChatInputCommand } from '../../../types/Command';
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';

export const command: ChatInputCommand = {
    name: 'leaderboard',
    test: false,
    description: 'Shows the leaderboard',
    dmPermission: true,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'which',
            description: 'Which Leaderboard do you want to see?',
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'guild',
                    value: 'guild',
                },
                {
                    name: 'global',
                    value: 'global',
                },
            ],
        },
    ],
    execute: async (client, interaction) => {
        await interaction.deferReply();

        const which = interaction.options.getString('which');
        if (which === 'guild') {
            const guild = interaction.guild;
            let leaderboardofguild = [];
            for (const member of guild!.members.cache.values()) {
                const player = await Player.findOne({ userId: member.id });
                if (player) {
                    leaderboardofguild.push(player);
                }
            }
            const leadernew = [...leaderboardofguild].sort((a, b) => b.won - a.won).slice(0, 5);
            leaderboardofguild = leadernew;
            const embd = new EmbedBuilder().setTitle(`${guild!.name}'s Leaderboard`);
            let descrip1 = '';
            for (const player of leaderboardofguild) {
                descrip1 += `**${leaderboardofguild.indexOf(player) + 1}.** <@${player.userId}>\nWins: \`${player.won}\` Loses: \`${player.lost}\` W/L: \`${(player.won / player.lost).toFixed(4)}\` Belt: ${beltsEmojis(
                    player.belt,
                )}\n\n`;
            }
            embd.setDescription(descrip1);
            interaction.editReply({
                embeds: [embd],
            });
            return;
        }
        const totalGuilds = client.guilds.cache.size;
        const players = await Player.find({});
        const leaderboard = [...players].sort((a, b) => b.won - a.won).slice(0, 5);
        const embed = new EmbedBuilder().setTitle('Global Leaderboard');
        let descrip = `In ${totalGuilds} servers:\n`;
        for (const player of leaderboard) {
            descrip += `**${leaderboard.indexOf(player) + 1}.** <@${player.userId}>\nWins: \`${player.won}\` Loses: \`${player.lost}\` W/L: \`${(player.won / player.lost).toFixed(4)}\` Belt: ${beltsEmojis(
                player.belt,
            )}\n\n`;
        }
        embed.setDescription(descrip);
        interaction.editReply({
            embeds: [embed],
        });
    },
};
