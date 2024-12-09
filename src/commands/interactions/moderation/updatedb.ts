import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import Player, { getPlayerById } from '../../../models/Players.model';
import { ChatInputCommand } from '../../../types/Command';

export const command: ChatInputCommand = {
    name: 'updatedb',
    test: true,
    description: 'update the db',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'user',
            required: true,
            description: "For how long you wan't to disable (in seconds)",
            type: ApplicationCommandOptionType.User,
        },
        {
            name: 'field',
            required: true,
            description: 'Specify who is the player that you want to update.',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'belt',
                    value: 'belt',
                },
                {
                    name: 'wins',
                    value: 'wins',
                },
                {
                    name: 'lost',
                    value: 'lost',
                },
                {
                    name: 'cards',
                    value: 'cards',
                },
                {
                    name: 'lastVote',
                    value: 'lastVote',
                },
            ],
        },
        {
            name: 'towhat',
            description: 'to what you want to update.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    defaultMemberPermissions: 'Administrator',
    dmPermission: false,
    execute: async (client, interaction) => {
        const owner = (await client.application?.fetch()!).owner;
        if (owner?.id !== interaction.user.id) return;

        const user = interaction.options.getUser('user');
        const field = interaction.options.getString('field');
        const towhat = interaction.options.getString('towhat');
        await Player.updateOne({ userId: user!.id }, { [field!]: towhat! });
        const player_db = await getPlayerById(interaction.user.id);
        await interaction.reply(`Operation succeeded ✅, The stats of the player are \n\`\`\`${player_db}\`\`\``);

        setTimeout(async () => {
            await interaction.deleteReply();
        }, 5000);
    },
};
