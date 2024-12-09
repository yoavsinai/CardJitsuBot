/* eslint-disable no-console */
import googleTranslateApi from '@vitalets/google-translate-api';
import fs from 'fs';
import lang from './lang.json';
import { SupportedLang } from './language';

interface Lang {
    languages: string[];
    translations: {
        [any: string]: {
            [language: string]: string;
        };
    };
}
const newLang = lang as Lang;

const run = async () => {
    const keys = Object.keys(lang.translations);
    for (const languageTo of SupportedLang) {
        for (const key of keys) {
            // const key = "POWER_CARD"
            const src = (lang as Lang).translations[key]['en'];
            const translatedSrc = (await googleTranslateApi.translate(src, { to: languageTo, from: 'en' })).text;
            newLang.translations[key][languageTo] = translatedSrc;
        }
    }

    const jsonContent = JSON.stringify(newLang);

    fs.writeFile(__dirname + '/lang.json', jsonContent, 'utf-8', (err) => {
        if (err) {
            console.log('An error occured while writing JSON Object to File.');
            console.log(err);
            return;
        }

        console.log('JSON file has been saved.');
    });
};

run();
