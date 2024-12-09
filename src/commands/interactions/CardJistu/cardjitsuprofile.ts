import { ApplicationCommandType, ContextMenuCommandInteraction, EmbedBuilder } from 'discord.js';
import Card from '../../../classes/Card';
import { beltsEmojis } from '../../../util/belts';
import { getPlayerById } from '../../../models/Players.model';
import { ContextMenuCommand } from '../../../types/Command';

export const command: ContextMenuCommand = {
    name: 'cardjitsuprofile',
    test: false,
    type: ApplicationCommandType.User,
    execute: async (client, interaction: ContextMenuCommandInteraction) => {
        await interaction.deferReply({ ephemeral: true });

        const member = await interaction.guild!.members.fetch(interaction.targetId);
        const player = await getPlayerById(member.user.id);
        if (!player)
            return interaction.editReply({
                content: `${member.user} has no Card Jitsu profile!`,
            });

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
            .setTitle(`${member.user.username}'s Card Jitsu Profile`)
            .setDescription(`Wins: \`${player.won}\` Loses: \`${player.lost}\` W/L: \`${(player.won / player.lost).toFixed(4)}\``)
            .setThumbnail(member.user.avatarURL())
            .setTimestamp()
            .setAuthor({
                name: player.patreon ? `${member.user.username} Patreon Supporter!` : member.user.username,
                iconURL: member.user.avatarURL()!,
            })
            .setFooter({
                text: 'Card Jitsu',
                iconURL: client.user?.avatarURL()!,
            })
            .setColor('Random')
            .addFields({ name: 'Special Cards', value: cards }, { name: 'Belt:', value: player.belt === 'NinjaMask' ? 'Ninja <:NInjaMask:939884539256389652>' : beltsEmojis(player.belt) });
        return interaction.editReply({
            embeds: [embed],
        });
    },
};
