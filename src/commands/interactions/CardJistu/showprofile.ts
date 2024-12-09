import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import Card from '../../../classes/Card';
import { beltsEmojis } from '../../../util/belts';
import { getPlayerById } from '../../../models/Players.model';
import { ChatInputCommand } from '../../../types/Command';

export const command: ChatInputCommand = {
    name: 'showprofile',
    description: 'Shows your Card Jitsu profile page!',
    test: false,
    dmPermission: true,
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const player = await getPlayerById(interaction.user.id);
        const cards: string =
            player.cards.length !== 0
                ? player.cards
                      .map((c) => {
                          const newCard = new Card(c.name ?? '', c.value, c.element, c.color, c.power);
                          return `\n${newCard.toString()}`;
                      })
                      .toString()
                : 'None';
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Card Jitsu Profile`)
            .setDescription(`Wins: \`${player.won}\` Loses: \`${player.lost}\` W/L: \`${(player.won / player.lost).toFixed(4)}\``)
            .setThumbnail(interaction.user.avatarURL())
            .setTimestamp()
            .setAuthor({
                name: player.patreon ? `${interaction.user.username} Patreon Supporter!` : interaction.user.username,
                iconURL: interaction.user.avatarURL()!,
            })
            .setFooter({
                text: 'Card Jitsu',
                iconURL: client.user!.avatarURL()!,
            })
            .setColor('Random')
            .addFields({ name: 'Special Cards', value: cards }, { name: 'Belt:', value: player.belt === 'NinjaMask' ? 'Ninja <:NInjaMask:939884539256389652>' : beltsEmojis(player.belt) });
        return interaction.editReply({
            embeds: [embed],
        });
    },
};
