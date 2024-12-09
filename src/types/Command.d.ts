/* eslint-disable no-unused-vars */
import Client from '../client';
import {
    ApplicationCommandOptionBase,
    ApplicationCommandType,
    BaseApplicationCommandData,
    ApplicationCommandOptionData,
    BaseApplicationCommandOptionsData,
    BaseInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
} from 'discord.js';

interface execute {
    (client: Client, interaction: BaseInteraction): void;
}
interface Command extends BaseApplicationCommandData {
    options?: ApplicationCommandOptionData[];
    cooldown?: number;
    test?: boolean;
    description?: string;
    type?: ApplicationCommandType;
    execute: execute;
}

interface ContextMenuCommand extends Command {
    execute: (client: Client, interaction: ContextMenuCommandInteraction) => void;
}

interface ChatInputCommand extends Command {
    description: string;
    options?: ApplicationCommandOptionData[];
    execute: (client: Client, interaction: ChatInputCommandInteraction) => void;
}
