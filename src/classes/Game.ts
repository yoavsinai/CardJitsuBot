import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, DMChannel, EmbedBuilder, GuildMember, InteractionCollector, Message, TextChannel, User } from 'discord.js';
import { voteCards } from '../api/cards';
import Client from '../client';
import language from '../lang/language';
import PlayerModel, { getPlayerById } from '../models/Players.model';
import { Colors, ElementName, GameObject, NextEffect } from '../types/CardJistu';
import { PlayerDocument } from '../types/Mongodb';
import { belts, beltsEmojis } from '../util/belts';
import { effectToEmoji } from '../util/powerEffects';
import Bank from './Bank';
import Card from './Card';
import Deck from './Deck';
import Hand from './Hand';

const MAXHAND = 5;
const CARD_JITSU_EMOJI = '<:cardjitsu:936608116353662997>';
const VOTE_FOR = '[bot on the top.gg page](https://top.gg/bot/933071368789065799)';
const TIME_UP = "**Time's up! I chose a card for you!**";
const upvoteembed = new EmbedBuilder().setDescription(`Upvote the ${VOTE_FOR}!`).setColor('Random');
const NINJA_MASK = 'NinjaMask';
const BLACK_BELT = 'Black';
type PlayerType = 'player' | 'opponent' | 'sensei';
class Game {
    GameObject: GameObject;
    playerChannel: DMChannel | null;
    opponentChannel: DMChannel | null;
    player: User | GuildMember;
    playerHand: Hand;
    playerDeck: Deck;
    playerBank: Bank;
    opponent: User | GuildMember | null;
    opponentHand: Hand;
    opponentDeck: Deck;
    opponentBank: Bank;
    textChannel: TextChannel;
    client: Client;
    playerCollector: InteractionCollector<ButtonInteraction>;
    opponentCollector: InteractionCollector<ButtonInteraction>;
    playerMessage: Message | null;
    playerBankMessage?: Message | null;
    playerTime: Message | null;
    opponentMessage: Message | null;
    opponentBankMessage: Message | null;
    opponentTime: Message | null;
    playerStop: Message | null;
    playerSureStop: Message | null;
    opponentStop: Message | null;
    opponentSureStop: Message | null;
    currentPlayerCard: null | Card;
    currentOpponentCard: null | Card;
    playerResponse: string | null;
    opponentResponse: string | null;
    playerDB: PlayerDocument;
    opponentDB: PlayerDocument;
    timer: NodeJS.Timer | null;
    secForRound: number | null;
    playerButtonRow: ActionRowBuilder<ButtonBuilder>;
    opponentButtonRow: ActionRowBuilder<ButtonBuilder> | null;
    sensei: boolean;
    nextEffect: NextEffect;
    constructor(game: GameObject) {
        this.GameObject = game;
        const {
            playerChannel,
            opponentChannel,
            player,
            playerHand,
            playerDeck,
            playerBank,
            opponent,
            opponentHand,
            opponentDeck,
            opponentBank,
            textChannel,
            client,
            playerCollector,
            opponentCollector,
            playerMessage,
            playerBankMessage,
            playerTime,
            opponentMessage,
            opponentBankMessage,
            opponentTime,
            playerStop,
            playerSureStop,
            opponentStop,
            opponentSureStop,
            currentPlayerCard,
            currentOpponentCard,
            playerResponse,
            opponentResponse,
            playerDB,
            opponentDB,
            timer,
            secForRound,
            playerButtonRow,
            opponentButtonRow,
            sensei,
            nextEffect,
        } = game;
        this.playerChannel = playerChannel;
        this.opponentChannel = opponentChannel ? opponentChannel : null;
        this.player = player;
        this.playerHand = playerHand;
        this.playerDeck = playerDeck;
        this.playerBank = playerBank;
        this.opponent = opponent;
        this.opponentHand = opponentHand;
        this.opponentDeck = opponentDeck;
        this.opponentBank = opponentBank;
        this.textChannel = textChannel;
        this.client = client;
        this.playerCollector = playerCollector;
        this.opponentCollector = opponentCollector;
        this.playerMessage = playerMessage;
        this.playerBankMessage = playerBankMessage;
        this.playerTime = playerTime;
        this.opponentMessage = opponentMessage;
        this.opponentBankMessage = opponentBankMessage;
        this.opponentTime = opponentTime;
        this.playerStop = playerStop;
        this.playerSureStop = playerSureStop;
        this.opponentStop = opponentStop;
        this.opponentSureStop = opponentSureStop;
        this.currentPlayerCard = currentPlayerCard;
        this.currentOpponentCard = currentOpponentCard;
        this.playerResponse = playerResponse;
        this.opponentResponse = opponentResponse;
        this.playerDB = playerDB;
        this.opponentDB = opponentDB;
        this.timer = timer;
        this.secForRound = secForRound;
        this.playerButtonRow = playerButtonRow;
        this.opponentButtonRow = opponentButtonRow;
        this.sensei = sensei;
        this.nextEffect = nextEffect;
    }

    getTranslated(textId: string) {
        return language(this.textChannel.guildId ?? 'null', textId);
    }

    async whoWonTheRound(playerCard: Card, opponentCard: Card) {
        const pCard = playerCard;
        const oCard = opponentCard;
        if (playerCard.power === 'reversal' || opponentCard.power === 'reversal') {
            pCard.value = 13 - playerCard.value;
            oCard.value = 13 - opponentCard.value;
        }

        if (this.isTypeAdvantage(playerCard.getElement(), opponentCard.getElement())) {
            this.playerBank.addCard(playerCard);
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('BEAT')} ${opponentCard.toString()}.`;
        }
        if (this.isTypeAdvantage(opponentCard.getElement(), playerCard.getElement())) {
            this.opponentBank.addCard(opponentCard);
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('LOST')} ${opponentCard.toString()}.`;
        }
        //elements must be the same (i hope)
        if (playerCard.getValue() === opponentCard.getValue()) {
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('TIED')} ${opponentCard.toString()}.`;
        }
        if (playerCard.getValue() > opponentCard.getValue()) {
            this.playerBank.addCard(playerCard);
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('BEAT')} ${opponentCard.toString()}.`;
        } else {
            this.opponentBank.addCard(opponentCard);
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('LOST')} ${opponentCard.toString()}.`;
        }
    }

    isTypeAdvantage(elementX: ElementName, elementY: ElementName) {
        return (elementX === 'fire' && elementY === 'snow') || (elementX === 'water' && elementY === 'fire') || (elementX === 'snow' && elementY === 'water');
    }

    async opponentWonRound(playerCard: Card, opponentCard: Card) {
        if (this.isTypeAdvantage(playerCard.getElement(), opponentCard.getElement())) {
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('BEAT')} ${opponentCard.toString()}.`;
        }
        if (this.isTypeAdvantage(opponentCard.getElement(), playerCard.getElement())) {
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('LOST')} ${opponentCard.toString()}.`;
        }
        //elements must be the same (i hope)
        if (playerCard.getValue() === opponentCard.getValue()) {
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('TIED')} ${opponentCard.toString()}.`;
        }
        if (playerCard.getValue() > opponentCard.getValue()) {
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('BEAT')} ${opponentCard.toString()}.`;
        } else {
            return `${this.getTranslated('YOUR')} ${playerCard.toString()} ${this.getTranslated('LOST')} ${opponentCard.toString()}.`;
        }
    }

    async onPlayerWinning(i: ButtonInteraction | null = null) {
        clearInterval(this.timer!);
        const winMsg = `${this.playerResponse}\n\n${this.getTranslated('YOU_WON_WITH')} ${this.playerBank.mixed.length >= 3 ? this.playerBank.uniqueToString() : this.playerBank.colorsToString()} ${
            this.playerBank.mixed.length >= 3 ? CARD_JITSU_EMOJI : this.playerBank.elementsToString() + CARD_JITSU_EMOJI
        }!\n${this.getTranslated('FEEL_FREE')}`;
        await this.playerMessage?.edit({
            content: winMsg,
            components: [],
            embeds: [upvoteembed],
        });
        const playerResponseMsg = `${this.playerResponse}\n${this.getTranslated('CHOOSING')} ${this.currentPlayerCard?.toString()}`;

        if (!this.opponent) {
            const playerResponseMessage = await this.textChannel.send(playerResponseMsg);

            setTimeout(() => {
                playerResponseMessage.delete();
            }, 5000);
        }

        if (this.opponent) {
            const playerLostMsg = `${this.playerResponse}\n\n${this.getTranslated('YOU_LOST_OPPONENT')} ${
                this.playerBank.mixed.length >= 3 ? this.playerBank.uniqueToString() : this.playerBank.colorsToString()
            } ${this.playerBank.mixed.length >= 3 ? CARD_JITSU_EMOJI : this.playerBank.elementsToString() + CARD_JITSU_EMOJI}!\n${this.getTranslated('FEEL_FREE')}`;

            const playerResponseMessage = await this.playerChannel?.send(playerResponseMsg);
            await this.opponentMessage?.edit({
                content: playerLostMsg,
                components: [],
                embeds: [upvoteembed],
            });
            this.opponentCollector.stop();
            this.opponentTime?.delete();
            this.opponentStop?.delete();
            this.opponentBankMessage?.delete();
            await PlayerModel.updateOne({ userId: this.opponent?.id }, { lost: this.opponentDB.lost + 1 });
            const opponentResponseMsg = `${this.opponentResponse}\n${this.getTranslated('CHOOSING')} ${this.currentOpponentCard?.toString()}`;
            const opponentResponseMessage = await this.opponentChannel!.send(opponentResponseMsg);

            setTimeout(() => {
                playerResponseMessage?.delete();
                opponentResponseMessage.delete();
            }, 5000);
        }
        if (i) {
            await i.editReply(this.getTranslated('PROCCESSING'));
            await i.deleteReply();
        }

        this.playerCollector.stop();
        this.playerTime?.delete();
        this.playerStop?.delete();
        this.playerBankMessage?.delete();
        await PlayerModel.updateOne({ userId: this.player.id }, { won: this.playerDB.won + 1 });
        const { belt } = await getPlayerById(this.player.id);
        const { won } = await getPlayerById(this.player.id);
        if (belts(won) !== belt) {
            const newBeltMsg = `${this.getTranslated('NEW_BELT')} - ${beltsEmojis(belts(won))}`;
            this.playerMessage?.channel.send(newBeltMsg);
            await PlayerModel.updateOne({ userId: this.player.id }, { belt: belts(won) });
        }
        if (this.sensei && belt === 'Black') {
            await PlayerModel.updateOne({ userId: this.player.id }, { belt: NINJA_MASK });
            this.playerMessage?.channel.send(`${this.getTranslated('CONGRATS_SENSEI')} - ${beltsEmojis(NINJA_MASK)}`);
        }
        this.client.games.delete(this.playerMessage!.channel.id);

        this.currentOpponentCard = null;
        this.currentPlayerCard = null;
    }

    async onOpponentWinning(i: ButtonInteraction | null = null) {
        clearInterval(this.timer!);
        await PlayerModel.updateOne({ userId: this.player.id }, { lost: this.playerDB.lost + 1 });
        const playerLostMsg = `${this.playerResponse}\n\n${this.getTranslated('YOU_LOST_OPPONENT')} ${
            this.opponentBank.mixed.length >= 3 ? this.opponentBank.uniqueToString() : this.opponentBank.colorsToString()
        } ${this.opponentBank.mixed.length >= 3 ? CARD_JITSU_EMOJI : this.opponentBank.elementsToString() + CARD_JITSU_EMOJI}!\n${this.getTranslated('FEEL_FREE')}`;
        await this.playerMessage?.edit({
            content: playerLostMsg,
            components: [],
            embeds: [upvoteembed],
        });

        const playerResponseMsg = `${this.playerResponse}\n${this.getTranslated('CHOOSING')} ${this.currentPlayerCard?.toString()}`;

        if (!this.opponent) {
            const playerResponseMessage = await this.textChannel.send(playerResponseMsg);
            setTimeout(() => {
                playerResponseMessage.delete();
            }, 5000);
        }

        if (this.opponent) {
            const playerResponseMessage = await this.playerChannel?.send(playerResponseMsg);

            const opponentWonMsg = `${this.opponentResponse}\n\n${this.getTranslated('YOU_WON_WITH')} ${
                this.opponentBank.mixed.length >= 3 ? this.opponentBank.uniqueToString() : this.opponentBank.colorsToString()
            } ${this.opponentBank.mixed.length >= 3 ? CARD_JITSU_EMOJI : this.opponentBank.elementsToString() + CARD_JITSU_EMOJI}!\n${this.getTranslated('FEEL_FREE')}`;

            await this.opponentMessage?.edit({
                content: opponentWonMsg,
                components: [],
                embeds: [upvoteembed],
            });

            this.opponentCollector.stop();
            this.opponentTime?.delete();
            this.opponentStop?.delete();
            this.opponentBankMessage?.delete();
            await PlayerModel.updateOne({ userId: this.opponent.id }, { won: this.opponentDB.won + 1 });
            const { belt } = await getPlayerById(this.opponent.id);
            const { won } = await getPlayerById(this.opponent.id);
            if (belts(won) !== belt) {
                const newBeltMsg = `${this.getTranslated('NEW_BELT')} - ${beltsEmojis(belts(won))}`;
                this.opponentMessage?.channel.send(newBeltMsg);
                await PlayerModel.updateOne({ userId: this.opponent?.id }, { belt: belts(won) });
            }
            const opponentResponseMessage = await this.opponentChannel!.send(`${this.opponentResponse}\n${this.getTranslated('CHOOSING')} ${this.currentOpponentCard?.toString()}`);
            setTimeout(() => {
                playerResponseMessage?.delete();
                opponentResponseMessage.delete();
            }, 5000);
        }
        if (i) {
            await i.editReply(this.getTranslated('PROCCESSING'));
            await i.deleteReply();
        }

        this.playerCollector.stop();
        this.playerTime?.delete();
        this.playerStop?.delete();
        this.playerBankMessage?.delete();
        this.client.games.delete(this.playerMessage!.channel.id);

        this.currentOpponentCard = null;
        this.currentPlayerCard = null;
    }

    async reloadButtonsToHand() {
        const playerComponents = this.playerHand.hand.map((card) => {
            return new ButtonBuilder()
                .setCustomId(this.playerHand.hand.indexOf(card).toString())
                .setLabel(`${card.getArticle()} ${card.getValue()}`)
                .setEmoji(card.getEmoji() + card.getEmoji())
                .setStyle(ButtonStyle.Primary)
                .setDisabled(card.element === this.nextEffect ? true : false);
        });

        this.playerButtonRow.setComponents(...playerComponents);

        const playerChoosingCardMsg = `${this.getTranslated('CHOOSING')} ${this.currentPlayerCard!.toString()}\n${this.playerResponse}\n${this.getTranslated('CHOOSE_CARD')}`;

        await this.playerMessage?.edit({
            content: playerChoosingCardMsg,
            components: [this.playerButtonRow],
        });

        if (this.opponent) {
            const opponentComponents = this.opponentHand.hand.map((card) => {
                return new ButtonBuilder()
                    .setCustomId(this.opponentHand.hand.indexOf(card).toString())
                    .setLabel(`${card.getArticle()} ${card.getValue()}`)
                    .setEmoji(card.getEmoji())
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(card.element === this.nextEffect ? true : false);
            });
            this.opponentButtonRow?.setComponents(...opponentComponents);

            const opponentChoosingCardMsg = `${this.getTranslated('CHOOSING')} ${this.currentOpponentCard!.toString()}\n${this.opponentResponse}\n${this.getTranslated('CHOOSE_CARD')}`;

            await this.opponentMessage?.edit({
                content: opponentChoosingCardMsg,
                components: [this.opponentButtonRow!],
            });
        }
    }

    async opponentDisableButtons() {
        if (this.opponent) {
            for (const button of this.opponentButtonRow!.components) {
                button.setDisabled(true);
            }
            await this.opponentMessage?.edit({ content: this.opponentMessage?.content, components: [this.opponentButtonRow!] });
        }
    }

    async playerDisableButtons() {
        for (const button of this.playerButtonRow.components) {
            button.setDisabled(true);
        }
        await this.playerMessage?.edit({ content: this.playerMessage?.content, components: [this.playerButtonRow] });
    }

    async collectorInit(buttonInteraction: ButtonInteraction, byWho: PlayerType) {
        if (await this.checkForStopEvent(buttonInteraction, byWho)) return;

        if (buttonInteraction.message.id !== this.playerMessage?.id && byWho === 'player') return;
        if (buttonInteraction.message.id !== this.opponentMessage?.id && byWho === 'opponent') return;

        await buttonInteraction.deferReply();

        if (byWho === 'opponent' && (await this.byOpponent(buttonInteraction))) return;

        if (byWho === 'player' && (await this.byPlayer(buttonInteraction))) return;

        if (byWho === 'sensei') await this.bySensei(buttonInteraction);

        await this.handlePowerCards();

        this.playerResponse = await this.whoWonTheRound(this.currentPlayerCard!, this.currentOpponentCard!)!;
        this.opponentResponse = null;

        const powerEffect = await this.getPowerEffect();

        if (this.opponent) await this.opponentCollectorHandler(powerEffect);

        const playerBankMsg = `${this.getTranslated('POWER_EFFECT')} ${powerEffect}\n__**${this.getTranslated('YOUR_BANK_CONTAINS')}**__${this.playerBank.toString()}\n__**${this.getTranslated(
            'OPPONENTS_BANK',
        )}**__ ${this.opponentBank.toString()}`;
        await this.playerBankMessage?.edit(playerBankMsg);

        if (await this.checkForWinner(buttonInteraction)) return;

        await buttonInteraction.editReply(this.getTranslated('PROCCESSING'));
        await buttonInteraction.deleteReply();

        await this.reloadButtonsToHand();

        this.currentOpponentCard = null;
        this.currentPlayerCard = null;
    }

    async checkForStopEvent(buttonInteraction: ButtonInteraction, byWho: PlayerType) {
        if (buttonInteraction.customId === 'stop') {
            await this.doStop(buttonInteraction, byWho);
            return true;
        }
        if (buttonInteraction.customId === 'sure_stop') {
            await this.doSureStop(buttonInteraction, byWho);
            return true;
        }
        return false;
    }

    async checkForWinner(buttonInteraction: ButtonInteraction) {
        if (await this.playerBank.hasWon()) {
            await this.onPlayerWinning(buttonInteraction);
            return true;
        }

        if (await this.opponentBank.hasWon()) {
            await this.onOpponentWinning(buttonInteraction);
            return true;
        }
        return false;
    }

    async getPowerEffect() {
        const powerEffect = `${effectToEmoji(this.currentPlayerCard!.power!) ?? ''}${effectToEmoji(this.currentOpponentCard!.power!) ?? ''}`;
        return powerEffect;
    }

    async handlePowerCards() {
        if (this.currentPlayerCard?.power) {
            this.handlePlayerPower();
        } else if (this.currentOpponentCard?.power) {
            this.handleOpponentPower();
            return;
        } else return;
    }

    async handlePlayerPower() {
        if (this.currentPlayerCard!.power!.search('all')) await this.discardAllCardsFromBank();
        else if (this.currentPlayerCard!.power! === 'reversal') return;
        else if (this.currentPlayerCard!.power!.search('discard')) await this.discardCardFromBank();
        else if (this.currentPlayerCard!.power!.search('block')) await this.blockElement();
        else if (this.currentPlayerCard!.power! === 'plus2') await this.cardPlusTwo();
        else if (this.nextEffect?.search('2')) await this.cardPlusMinusTwoAction();
        else if (this.currentPlayerCard!.power! === 'minus2') await this.cardMinusTwo();
        else await this.changeElementToElement();
    }

    async handleOpponentPower() {
        if (this.currentOpponentCard!.power!.search('all')) await this.discardAllCardsFromBank();
        else if (this.currentOpponentCard!.power! === 'reversal') return;
        else if (this.currentOpponentCard!.power!.search('discard')) await this.discardCardFromBank();
        else if (this.currentOpponentCard!.power!.search('block')) await this.blockElement();
        else if (this.currentOpponentCard!.power! === 'plus2') await this.cardPlusTwo();
        else if (this.nextEffect?.search('2')) await this.cardPlusMinusTwoAction();
        else if (this.currentOpponentCard!.power! === 'minus2') await this.cardMinusTwo();
        else await this.changeElementToElement();
    }
    async cardPlusMinusTwoAction() {
        const args = this.nextEffect!.split('_');
        if (args[1] === 'player') {
            if (args[0] === 'plus2') this.currentPlayerCard!.value = +2;
            if (args[0] === 'minus2') this.currentOpponentCard!.value = -2;
        } else {
            if (args[0] === 'plus2') this.currentOpponentCard!.value = +2;
            if (args[0] === 'minus2') this.currentPlayerCard!.value = -2;
        }
    }

    async discardAllCardsFromBank() {
        if (this.currentPlayerCard?.power) await this.discardAllCardsFromBankPlayer();
        if (this.currentOpponentCard?.power) await this.discardAllCardsFromBankOpponent();
    }

    async discardAllCardsFromBankPlayer() {
        const args = this.currentPlayerCard!.power!.split('_');

        for (const card of this.opponentBank.getCards()) {
            if (card.element === args[1]) this.opponentBank.removeCard(card);
            if (card.color === args[1]) this.opponentBank.removeCard(card);
        }
    }
    async discardAllCardsFromBankOpponent() {
        const args = this.currentOpponentCard!.power!.split('_');

        for (const card of this.playerBank.getCards()) {
            if (card.element === args[1]!) this.playerBank.removeCard(card);
            if (card.color === args[1]!) this.playerBank.removeCard(card);
        }
    }
    async discardCardFromBank() {
        const elements: ElementName[] = ['fire', 'water', 'snow'];
        const colors: Colors[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

        if (this.currentPlayerCard?.power) await this.discardCardFromBankPlayer(elements, colors);
        if (this.currentOpponentCard?.power) await this.discardCardFromBankOpponent(elements, colors);
    }
    async discardCardFromBankPlayer(elements: ElementName[], colors: Colors[]) {
        const args = this.currentPlayerCard!.power!.split('_');
        if (elements.find((element) => element === args[1])) {
            const card = this.opponentBank.getCards().find((c) => c.element === args[1]);
            if (card) this.opponentBank.removeCard(card);
        }
        if (colors.find((color) => color === args[1])) {
            const card = this.opponentBank.getCards().find((c) => c.color === args[1]);
            if (card) this.opponentBank.removeCard(card);
        }
    }
    async discardCardFromBankOpponent(elements: ElementName[], colors: Colors[]) {
        const args = this.currentOpponentCard!.power!.split('_');
        if (elements.find((element) => element === args[1])) {
            const card = this.playerBank.getCards().find((c) => c.element === args[1]);
            if (card) this.playerBank.removeCard(card);
        }
        if (colors.find((color) => color === args[1])) {
            const card = this.playerBank.getCards().find((c) => c.color === args[1]);
            if (card) this.playerBank.removeCard(card);
        }
    }

    async blockElement() {
        if (this.currentPlayerCard?.power) {
            const args = this.currentPlayerCard.power!.split('_');
            this.nextEffect = args[1] as ElementName;
        } else {
            const args = this.currentOpponentCard!.power!.split('_');
            this.nextEffect = args[1] as ElementName;
        }
    }
    async cardPlusTwo() {
        if (this.currentPlayerCard?.power) this.nextEffect = `plus2_player`;
        else this.nextEffect = `plus2_opponent`;
    }
    async cardMinusTwo() {
        if (this.currentPlayerCard?.power) this.nextEffect = `minus2_player`;
        else this.nextEffect = `minus2_opponent`;
    }
    async changeElementToElement() {
        const args = this.currentPlayerCard!.power!.split('_');
        if (this.currentPlayerCard?.element === args[0]) this.currentPlayerCard.element = args[1] as ElementName;
        if (this.currentOpponentCard?.element === args[0]) this.currentOpponentCard.element = args[1] as ElementName;
    }

    async doStop(buttonInteraction: ButtonInteraction, byWho: PlayerType) {
        if (buttonInteraction.message.id !== this.playerStop?.id && byWho === 'player') return;
        if (buttonInteraction.message.id !== this.opponentStop?.id && byWho === 'opponent') return;
        await this.onStopAction(buttonInteraction, byWho);
    }

    async doSureStop(buttonInteraction: ButtonInteraction, byWho: PlayerType) {
        if (buttonInteraction.message.id !== this.playerSureStop?.id && byWho === 'player') return;
        if (buttonInteraction.message.id !== this.opponentSureStop?.id && byWho === 'opponent') return;
        await buttonInteraction.reply(this.getTranslated('PROCCESSING'));
        await buttonInteraction.deleteReply();
        await this.stopGame(byWho);
    }

    async opponentCollectorHandler(powerEffect: string) {
        this.opponentResponse = await this.opponentWonRound(this.currentOpponentCard!, this.currentPlayerCard!)!;
        const opponentBankMsg = `${this.getTranslated('POWER_EFFECT')} ${powerEffect}\n__**${this.getTranslated('YOUR_BANK_CONTAINS')}**__${this.opponentBank.toString()}\n__**${this.getTranslated(
            'OPPONENTS_BANK',
        )}**__ ${this.playerBank.toString()}`;
        this.opponentBankMessage = await this.opponentBankMessage?.edit(opponentBankMsg)!;
    }

    async byPlayer(buttonInteraction: ButtonInteraction) {
        this.currentPlayerCard = this.playerHand.useCard(parseInt(buttonInteraction.customId, 10));
        this.playerHand.addCard(this.playerDeck.deal());

        if (this.opponent && !this.currentOpponentCard) {
            buttonInteraction.editReply(this.getTranslated('PLS_WAIT'));
            await this.playerDisableButtons();
            setTimeout(() => {
                buttonInteraction.deleteReply();
            }, this.secForRound! * 1000);
            // Returnes if the opponent is not ready
            return true;
        }
        if (!this.opponent) {
            this.currentOpponentCard = this.opponentHand.useCard(Math.floor(Math.random() * MAXHAND));
            if (this.opponentDeck.getCards().length >= 2) this.opponentDeck.createCards();
            this.opponentHand.addCard(this.opponentDeck.deal());
            await this.playerDisableButtons();
        }
        return false;
    }

    async bySensei(buttonInteraction: ButtonInteraction | null = null) {
        await this.playerDisableButtons();
        if (buttonInteraction) {
            this.currentPlayerCard = this.playerHand.useCard(parseInt(buttonInteraction.customId, 10));
            if (this.playerDeck.getCards().length >= 2) this.playerDeck.createCards();
            this.playerHand.addCard(this.playerDeck.deal());
        }

        if (!buttonInteraction) {
            this.playerTime?.edit(TIME_UP);
            this.currentPlayerCard = this.playerHand.useCard(Math.floor(Math.random() * MAXHAND));
            if (this.playerDeck.getCards().length >= 2) this.playerDeck.createCards();
            this.playerHand.addCard(this.playerDeck.deal());
        }

        this.currentOpponentCard = null;
        this.opponentHand.addCards(this.opponentDeck.deck);

        if (this.playerDB.belt === BLACK_BELT || this.playerDB.belt === NINJA_MASK) {
            this.currentOpponentCard = this.opponentHand.useCard(Math.floor(Math.random() * MAXHAND));
        } else {
            await this.getOPCard(this.currentPlayerCard!.element);
        }
        if (!this.currentOpponentCard) {
            if (this.opponentDeck.getCards().length >= 2) this.opponentDeck.createCards();
            this.opponentHand.addCard(this.opponentDeck.deal());
            this.currentOpponentCard = this.opponentHand.useCard(Math.floor(Math.random() * MAXHAND));
        }

        this.opponentHand.useCardByCard(this.currentOpponentCard);
        if (this.opponentDeck.getCards().length >= 2) this.opponentDeck.createCards();
        this.opponentHand.addCard(this.opponentDeck.deal());
    }

    async byOpponent(i: ButtonInteraction) {
        this.currentOpponentCard = this.opponentHand.useCard(parseInt(i.customId, 10));
        if (this.opponentDeck.getCards().length >= 2) this.opponentDeck.createCards();
        this.opponentHand.addCard(this.opponentDeck.deal());

        if (!this.currentPlayerCard) {
            i.editReply(this.getTranslated('PLS_WAIT'));
            setTimeout(() => {
                i.deleteReply();
            }, this.secForRound! * 1000);
            await this.opponentDisableButtons();
            // Returnes if the player is not ready
            return true;
        }
        return false;
    }
    async stopGame(byWho: PlayerType) {
        clearInterval(this.timer!);
        if (this.opponent) {
            if (byWho === 'player') this.onOpponentWinning();
            if (byWho === 'opponent') this.onPlayerWinning();
            this.opponentCollector.stop();
            this.opponentMessage?.delete();
            this.opponentBankMessage?.delete();
            this.opponentTime?.delete();
            this.opponentStop?.delete();
            this.opponentSureStop?.delete();
        }
        this.playerCollector.stop();
        this.playerMessage?.delete();
        this.playerBankMessage?.delete();
        this.playerTime?.delete();
        this.playerStop?.delete();
        this.playerSureStop?.delete();
        this.currentOpponentCard = null;
        this.currentPlayerCard = null;
        this.client.games.delete(this.playerMessage?.channel.id!);
    }
    async onStopAction(i: ButtonInteraction, byWho: PlayerType) {
        const sureStopButton = new ButtonBuilder({
            label: this.getTranslated('SURE_STOP_BTN'),
            customId: 'sure_stop',
            style: ButtonStyle.Danger,
        });
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([sureStopButton]);
        await i.reply({
            content: this.getTranslated('SURE_STOP'),
            components: [row],
        });
        if (byWho === 'player' || byWho === 'sensei') this.playerSureStop = await i.fetchReply();
        if (byWho === 'opponent') this.opponentSureStop = await i.fetchReply();
    }

    async startGame() {
        this.playerDB = await getPlayerById(this.player.id);
        if (this.opponent) this.opponentDB = await getPlayerById(this.opponent.id);
        await this.extraCardsInit();

        this.timer = await this.timerInit();

        this.startPlayerCollector();

        if (this.opponent) this.startOpponentCollector();
    }

    startPlayerCollector() {
        this.playerCollector.on('collect', async (i: ButtonInteraction) => {
            if (this.currentOpponentCard && i.customId !== 'stop') this.secForRound = 25;
            this.timer?.unref();
            if (!this.opponent && i.customId !== 'stop') this.secForRound = 25;
            if (!this.sensei) await this.collectorInit(i, 'player');
            if (this.sensei) await this.collectorInit(i, 'sensei');
            setImmediate(() => {
                this.timer?.ref();
            });
        });
    }

    startOpponentCollector() {
        this.opponentCollector.on('collect', async (i: ButtonInteraction) => {
            this.timer?.unref();
            if (this.currentPlayerCard && i.customId !== 'stop') this.secForRound = 25;
            await this.collectorInit(i, 'opponent');
            setImmediate(() => {
                this.timer?.ref();
            });
        });
    }

    async extraCardsInit() {
        const howLongElapsedForPlayer = Date.now() - this.playerDB.lastVote;
        let howLongElapsedForOpponent = 0;
        if (this.opponent) {
            howLongElapsedForOpponent = Date.now() - this.opponentDB.lastVote;
        }
        const getEmbedMsg = `${this.getTranslated('GET_3_OP')} ${VOTE_FOR}`;
        const getEmbed = new EmbedBuilder().setDescription(getEmbedMsg).setColor('Random');

        const reEmbedMsg = `${this.getTranslated('REUSE_OP')} ${VOTE_FOR}`;
        const reEmbed = new EmbedBuilder().setDescription(reEmbedMsg).setColor('Random');

        if (this.playerDB.cards.length === 0 && howLongElapsedForPlayer > 86400000) {
            this.playerStop?.edit({ content: this.playerStop.content, embeds: [getEmbed] });
        }
        if (this.opponent && this.opponentDB.cards.length === 0 && howLongElapsedForOpponent > 86400000) {
            this.opponentStop?.edit({ content: this.opponentStop.content, embeds: [getEmbed] });
        }

        if (this.playerDB.gamesTillVote > 10 && howLongElapsedForPlayer > 86400000 && this.playerDB.cards.length !== 0) {
            this.playerStop?.edit({ content: this.playerStop.content, embeds: [reEmbed] });
            await PlayerModel.updateOne({ userId: this.player.id }, { cards: this.playerDB.cards.filter((c) => !voteCards.includes(c)) });
        }
        if (this.opponent && this.opponentDB.gamesTillVote > 10 && howLongElapsedForOpponent > 86400000 && this.opponentDB.cards.length !== 0) {
            this.opponentStop?.edit({ content: this.opponentStop.content, embeds: [reEmbed] });
            await PlayerModel.updateOne({ userId: this.opponent.id }, { cards: this.opponentDB.cards.filter((c) => !voteCards.includes(c)) });
        }

        await PlayerModel.updateOne({ userId: this.player.id }, { gamesTillVote: this.playerDB.gamesTillVote + 1 });
        if (this.opponent) await PlayerModel.updateOne({ userId: this.opponent.id }, { gamesTillVote: this.playerDB.gamesTillVote + 1 });
    }

    async timerInit() {
        return setInterval(async () => {
            this.secForRound! -= 5;
            if (this.secForRound === 0) {
                this.timer?.unref();
                this.secForRound = 25;
                await this.timerHits0();
                setImmediate(() => {
                    this.timer?.ref();
                });
            } else {
                const playerTimeMsg = `**${this.secForRound} ${this.getTranslated('SECONDS_LEFT')}!**`;
                this.playerTime?.edit(playerTimeMsg);
                if (this.opponent) this.opponentTime?.edit(playerTimeMsg);
            }
        }, 5000);
    }

    async timerHits0() {
        if (!this.currentPlayerCard && !this.sensei) {
            this.playerTime?.edit(TIME_UP);
            this.currentPlayerCard = this.playerHand.useCard(Math.floor(Math.random() * MAXHAND));
            if (this.playerDeck.getCards().length >= 2) this.playerDeck.createCards();
            this.playerHand.addCard(this.playerDeck.deal());
        }

        if (!this.currentOpponentCard && !this.sensei) {
            if (this.opponent) this.opponentTime?.edit(TIME_UP);
            this.currentOpponentCard = this.opponentHand.useCard(Math.floor(Math.random() * MAXHAND));
            if (this.opponentDeck.getCards().length >= 2) this.opponentDeck.createCards();
            this.opponentHand.addCard(this.opponentDeck.deal());
        }

        if (this.sensei) {
            await this.bySensei();
        }

        await this.playerDisableButtons();
        await this.opponentDisableButtons();

        this.playerResponse = await this.whoWonTheRound(this.currentPlayerCard!, this.currentOpponentCard!);

        if (this.opponent) {
            this.opponentResponse = await this.opponentWonRound(this.currentOpponentCard!, this.currentPlayerCard!);
            const opponentBankMsg = `__**${this.getTranslated('YOUR_BANK_CONTAINS')}**__${this.opponentBank.toString()}\n__**${this.getTranslated('OPPONENTS_BANK')}**__ ${this.playerBank.toString()}`;
            await this.opponentBankMessage?.edit(opponentBankMsg);
        }

        const playerBankMsg = `__**${this.getTranslated('YOUR_BANK_CONTAINS')}**__${this.playerBank.toString()}\n__**${this.getTranslated('OPPONENTS_BANK')}**__ ${this.opponentBank.toString()}`;
        await this.playerBankMessage?.edit(playerBankMsg);

        if (await this.playerBank.hasWon()) {
            await this.onPlayerWinning();
        }

        if (await this.opponentBank.hasWon()) {
            await this.onOpponentWinning();
        }

        await this.reloadButtonsToHand();

        this.currentOpponentCard = null;
        this.currentPlayerCard = null;
    }

    async getOPCard(playerElement: ElementName) {
        const elementsToWin = {
            fire: 'water',
            water: 'snow',
            snow: 'fire',
        };

        const elementsWinner = this.opponentHand.hand.find((c) => c.element === elementsToWin[playerElement]);
        if (elementsWinner) {
            this.currentOpponentCard = elementsWinner;
            this.opponentHand.useCardByCard(elementsWinner);
        } else await this.findOPCard(playerElement);
        if (!this.currentOpponentCard) {
            this.opponentDeck.createCards();
            this.opponentHand.addCard(this.opponentDeck.deal());
            await this.findOPCard(playerElement);
        }
        if (this.opponentDeck.getCards().length === 0) this.opponentDeck.createCards();
        this.opponentHand.addCard(this.opponentDeck.deal());
    }

    async findOPCard(playerElement: ElementName) {
        for (const card of this.opponentHand.hand) {
            if (card.element === playerElement) continue;
            if (card.value > this.currentPlayerCard!.value) {
                this.opponentHand.useCardByCard(card);
                this.currentOpponentCard = card;
            }
        }
    }
}

export default Game;
