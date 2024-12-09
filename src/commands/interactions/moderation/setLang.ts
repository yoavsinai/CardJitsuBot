import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { setLanguage } from '../../../lang/language';
import { ChatInputCommand } from '../../../types/Command';

export const command: ChatInputCommand = {
    name: 'setlang',
    test: false,
    description: 'Sets the guilds language for the cardjitsu bot',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'language',
            type: ApplicationCommandOptionType.String,
            description: 'Select if you want to set a different language to play the game, the default is your locale language',
            required: true,
            choices: [
                {
                    name: 'Danish',
                    value: 'da',
                },
                {
                    name: 'German',
                    value: 'de',
                },
                {
                    name: 'English',
                    value: 'en',
                },
                {
                    name: 'Spanish',
                    value: 'es',
                },
                {
                    name: 'France',
                    value: 'fr',
                },
                {
                    name: 'Italian',
                    value: 'it',
                },
                {
                    name: 'Hungarian',
                    value: 'hu',
                },
                {
                    name: 'Dutch',
                    value: 'nl',
                },
                {
                    name: 'Norwegian',
                    value: 'no',
                },
                {
                    name: 'Polish',
                    value: 'pl',
                },
                {
                    name: 'Portuguese',
                    value: 'pt',
                },

                {
                    name: 'Romanian',
                    value: 'ro',
                },
                {
                    name: 'Finnish',
                    value: 'fi',
                },
                {
                    name: 'Swedish',
                    value: 'sv',
                },
                {
                    name: 'Vietnamese',
                    value: 'vi',
                },
                {
                    name: 'Greek',
                    value: 'el',
                },

                {
                    name: 'Bulgarian',
                    value: 'bg',
                },
                {
                    name: 'Russian',
                    value: 'ru',
                },
                {
                    name: 'Ukrainian',
                    value: 'uk',
                },
                {
                    name: 'Hindi',
                    value: 'hi',
                },
                {
                    name: 'Thai',
                    value: 'th',
                },
                {
                    name: 'Chinese (Simplified)',
                    value: 'zh-CN',
                },
                {
                    name: 'Chinese (Traditional)',
                    value: 'zh-TW',
                },
                {
                    name: 'Japanese',
                    value: 'ja',
                },
                {
                    name: 'Korean',
                    value: 'ko',
                },
            ],
        },
    ],
    defaultMemberPermissions: 'Administrator',
    dmPermission: false,
    execute: async (client, interaction) => {
        const owner = (await client.application?.fetch()!).owner;
        if (owner?.id !== interaction.user.id) return;

        const lang = interaction.options.getString('language');

        const guildDB = await setLanguage(interaction.guildId!, lang!);
        await interaction.reply(`Operation succeeded ✅, The language of the server is \`${guildDB?.language}\``);

        setTimeout(async () => {
            await interaction.deleteReply();
        }, 5000);
    },
};
