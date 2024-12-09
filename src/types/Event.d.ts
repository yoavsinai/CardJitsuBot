import Client from "../client";
import { ClientEvents } from "discord.js";

interface execute {
    (client: Client, ...args: any[]): any;
}

interface Event {
    name: keyof ClientEvents;
    once: boolean;
    execute: execute;
}
