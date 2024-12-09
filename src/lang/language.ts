import ExtendedClient from '../client';
import { GuildModel } from '../models/Guilds.model';
import lang from './lang.json';

export const SupportedLang = ['da', 'de', 'fr', 'it', 'hu', 'nl', 'no', 'pl', 'pt', 'ro', 'fi', 'sv', 'vi', 'el', 'bg', 'ru', 'uk', 'hi', 'th', 'zh-CN', 'zh-TW', 'ja', 'ko'];

interface GuildLanguages {
    [guildId: string]: string;
}

const guildLanguages: GuildLanguages = {};

interface Lang {
    languages: string[];
    translations: {
        [any: string]: {
            [language: string]: string;
        };
    };
}
export const loadLanguages = async (client: ExtendedClient) => {
    for (const guild of client.guilds.cache) {
        const guildId = guild[0];

        const result = await getLanguage(guildId);
        guildLanguages[guildId] = result ? result.language : 'en';
    }
};

export default function (guildId: string, textId: string) {
    if (!(lang as Lang).translations[textId]) {
        throw new Error(`Unknown text ID ${textId}`);
    }
    const guildLang = guildLanguages[guildId];
    let selectedLanguagae = guildLang ? guildLang.toLowerCase() : 'en';
    if (!(lang as Lang).languages.find((lan) => lan === selectedLanguagae)) {
        selectedLanguagae = 'en';
    }
    return (lang as Lang).translations[textId][selectedLanguagae];
}

export const setLanguage = async (guildId: string, lang: string) => {
    await GuildModel.findOneAndUpdate({ guildId }, { language: lang }, { upsert: true });
    const guildDB = await GuildModel.findOne({ guildId });
    guildLanguages[guildId] = guildDB?.language!;

    return guildDB;
};

export const getLanguage = async (guildId: string) => {
    const guildDB = await GuildModel.findOne({ guildId });

    return guildDB;
};
