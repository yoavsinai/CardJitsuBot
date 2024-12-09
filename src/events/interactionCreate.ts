const cooldowns = new Map();
import Discord, { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import Client from '../client';
import { Command } from '../types/Command';
import { Event } from '../types/Event';

export const event: Event = {
    name: 'interactionCreate',
    once: false,
    execute: async (client: Client, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) => {
        if (!interaction.isChatInputCommand() || !interaction.isContextMenuCommand()) {
            if (!client.interactions.has(interaction.commandName)) return;
            const command = client.interactions.get(interaction.commandName);
            if (!command) return;

            if (!interaction.guild) await cooldownHandler(client, command, interaction);

            try {
                client.interactions.get(interaction.commandName)!.execute(client, interaction);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            }
        } else return;
    },
};

async function cooldownHandler(client: Client, command: Command, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const current_time = Date.now();
    const time_stamps = cooldowns.get(command.name);
    const cooldown_amount = command.cooldown! * 1000 || 5000;

    if (time_stamps.has(interaction.user.id)) {
        const expiration_time = time_stamps.get(interaction.user.id) + cooldown_amount;

        if (current_time < expiration_time) {
            const time_left = (expiration_time - current_time) / 1000;

            interaction.reply({
                content: `Please wait ${time_left.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
                ephemeral: true,
            });
            return;
        }
    }
    if (!client.application?.owner) await client.application?.fetch();
    if (interaction.user.id !== client.application?.owner?.id) {
        time_stamps.set(interaction.user.id, current_time);
        setTimeout(() => time_stamps.delete(interaction.user.id), cooldown_amount);
    }
}
