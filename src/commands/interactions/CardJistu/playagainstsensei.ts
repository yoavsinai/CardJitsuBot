import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, Message, MessageComponentInteraction, TextChannel } from 'discord.js';
import Bank from '../../../classes/Bank';
import Deck from '../../../classes/Deck';
import Game from '../../../classes/Game';
import Hand from '../../../classes/Hand';
import language from '../../../lang/language';
import { getPlayerById } from '../../../models/Players.model';
import { ChatInputCommand } from '../../../types/Command';

const stopGameMsg = 'STOP_GAME';
const chooseCardMsg = 'CHOOSE_CARD';

export const command: ChatInputCommand = {
    name: 'playagainstsensei',
    test: false,
    dmPermission: true,
    description: "Plays a Card Jitsu game against the Sensei -- note: You can't beat him :)",
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction) => {
        await interaction.deferReply();

        let game = client.games.get(interaction.channel?.id!);
        if (game) {
            interaction.editReply(language(interaction.guildId ?? 'null', 'ALREADY_GAME')).then(() =>
                setTimeout(() => {
                    interaction.deleteReply();
                }, 5000),
            );
            return;
        }

        if (!game) {
            const getTranslated = (textId: string) => language(interaction.guildId ?? 'null', textId);

            const playerDB = await getPlayerById(interaction.user.id);

            // Player
            const playerDeck = new Deck(interaction.user);
            playerDeck.createCards();
            playerDeck.shuffle();

            const playerHand = new Hand();
            playerHand.createHand(playerDeck);

            const playerBank = new Bank();

            // Opponent || Bot
            const opponentDeck = new Deck(null);
            opponentDeck.createCards();
            opponentDeck.shuffle();

            const opponentHand = new Hand();
            opponentHand.createHand(opponentDeck);

            const opponentBank = new Bank();

            const stopButton = new ButtonBuilder({
                label: getTranslated('STOP_BUTTON'),
                customId: 'stop',
                style: ButtonStyle.Danger,
            });

            const playerComponents = playerHand.hand.map((card) => {
                return new ButtonBuilder()
                    .setCustomId(playerHand.hand.indexOf(card).toString())
                    .setLabel(`${card.getArticle()} ${card.getValue()}`)
                    .setEmoji(card.getEmoji())
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false);
            });

            const playerButtonRow = new ActionRowBuilder<ButtonBuilder>().setComponents(...playerComponents);
            const stopButtonRow = new ActionRowBuilder<ButtonBuilder>().setComponents([stopButton]);

            const secForRound = 25;

            const playerStop = (await interaction.channel?.send({
                content: getTranslated(stopGameMsg),
                components: [stopButtonRow],
            })) as Message;
            const playerMessage = await interaction.editReply({
                content: getTranslated(chooseCardMsg),
                components: [playerButtonRow],
            });
            const playerBankMsg = `__**${getTranslated('YOUR_BANK_CONTAINS')}:**__\n${playerBank.toString()}`;
            const playerBankMessage = await interaction.channel!.send({
                content: playerBankMsg,
            });
            const playerTimeMsg = `**${secForRound} ${getTranslated('SECONDS_LEFT')}!**`;
            const playerTime = await interaction.channel!.send({
                content: playerTimeMsg,
            });

            const filter = (btnInteraction: MessageComponentInteraction) =>
                (btnInteraction.customId === '1' ||
                    btnInteraction.customId === '2' ||
                    btnInteraction.customId === '3' ||
                    btnInteraction.customId === '4' ||
                    btnInteraction.customId === '5' ||
                    btnInteraction.customId === 'stop' ||
                    btnInteraction.customId === 'sure_stop') &&
                btnInteraction.user.id === game?.player.id;

            const playerCollector = interaction.channel!.createMessageComponentCollector({ filter });

            game = new Game({
                playerHand,
                playerDeck,
                playerBank,
                opponentHand,
                opponentDeck,
                opponentBank,
                client,
                playerCollector,
                playerMessage,
                playerBankMessage,
                playerTime,
                playerStop,
                playerDB,
                playerButtonRow,
                secForRound,
                playerSureStop: null,
                player: interaction.user,
                textChannel: interaction.channel as TextChannel,
                opponentChannel: null,
                playerChannel: null,
                opponent: null,
                opponentCollector: null,
                opponentDB: null,
                timer: null,
                opponentStop: null,
                opponentSureStop: null,
                opponentMessage: null,
                opponentBankMessage: null,
                opponentTime: null,
                currentPlayerCard: null,
                currentOpponentCard: null,
                playerResponse: null,
                opponentResponse: null,
                opponentButtonRow: null,
                sensei: true,
                nextEffect: null,
            });

            client.games.set(interaction.channel?.id!, game);

            await game.startGame();
        }
    },
};
