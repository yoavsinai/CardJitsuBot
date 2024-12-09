import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ChatInputCommand } from '../../../types/Command';
import { sleep } from '../../../util/sleep';

export const command: ChatInputCommand = {
    name: 'abort',
    description: 'abort the bot',
    test: true,
    dmPermission: false,
    options: [
        {
            name: 'maxmembers',
            required: true,
            description: 'Maximum members to abort',
            type: ApplicationCommandOptionType.Number,
        },
    ],
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: 'Administrator',
    execute: async (client, interaction) => {
        const owner = (await client.application?.fetch()!).owner;
        if (owner?.id !== interaction.user.id) return;
        const maxMembers = interaction.options.getNumber('maxmembers');

        const guilds = client.guilds.cache.filter((g) => g.memberCount <= maxMembers!);
        const yesBtn = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Yes').setCustomId('yes');
        const noBtn = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('No').setCustomId('no');
        const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents([yesBtn, noBtn]);
        const replyAbort = await interaction.reply({
            content: `Are you sure you want to abort ${guilds.size} guilds?`,
            components: [btnRow],
        });
        const filter = (i: any) => i.user.id === owner.id;
        const collector = replyAbort.createMessageComponentCollector({ filter });

        collector.on('collect', async (i) => {
            if (i.customId === 'yes') {
                await i.update({ content: `Aborting ${guilds.size} guilds...`, components: [] });
                for (const guild of guilds.values()) {
                    await guild.leave();
                    await sleep(1000);
                }
                await i.editReply({ content: `Aborted ${guilds.size} guilds!`, components: [] });
            } else if (i.customId === 'no') {
                await i.update({ content: `Aborting aborted!`, components: [] });
            } else return;
        });
    },
};
