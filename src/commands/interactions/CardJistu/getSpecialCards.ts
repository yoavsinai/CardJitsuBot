import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import { ChatInputCommand } from '../../../types/Command';
const VOTE_FOR = '[bot on the top.gg page](https://top.gg/bot/933071368789065799)';

export const command: ChatInputCommand = {
    name: 'getspecialcards',
    description: 'Sends a link to the patreon page to get special cards! (and a link to vote to get even more cards!)',
    test: false,
    dmPermission: true,
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle(`Get 6 OP cards + 3 more cards for voting!`)
            .setThumbnail(
                'https://c10.patreonusercontent.com/4/patreon-media/p/reward/9059572/1fda081e6c8d42b5bbb4ce45581fb469/eyJ3Ijo0MDB9/3.png?token-time=2145916800&token-hash=HKiVodmtlyKTnQabRheYjZVsodYx2fd994DQvU6AeVM%3D',
            )
            .setTimestamp()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL()!,
            })
            .setFooter({
                text: 'Card Jitsu',
                iconURL: client.user!.avatarURL()!,
            })
            .setColor('Random')
            .addFields({ name: '6 OP CARDS!', value: `[Donate on the Patreon page](https://www.patreon.com/join/cardjitsubot)\n(*You need to integrate discord with patreon. If you didn't please contact me on the patreon website)` }, { name: '3 more OP CARDS!', value: `Vote the ${VOTE_FOR}!` });
        return interaction.editReply({
            embeds: [embed],
        });
    },
};
