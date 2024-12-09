import { ApplicationCommandType } from "discord.js";
import { ChatInputCommand } from "../../../types/Command";

export const command: ChatInputCommand = {
    name: 'restart',
    description: 'restarts the bot',
    dmPermission: false,
    test: true,
    defaultMemberPermissions: "Administrator",
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction) => {
        const owner = (await client.application?.fetch()!).owner;
        if (owner?.id !== interaction.user.id) return;
        const body = {
            ref: 'main',
        };
        await interaction.reply('Operation succeeded ✅, I will now restart.\nPlease wait a couple of minutes.');
        await fetch(`https://api.github.com/repos/SiniMini876/CardJitsu/actions/workflows/${process.env.WORKFLOW_ID}}/dispatches`, {
            method: 'POST',
            headers: {
                Authorization: `token ${process.env.GITHUB_PKEY}`,
                Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify(body),
        });
    },
};
