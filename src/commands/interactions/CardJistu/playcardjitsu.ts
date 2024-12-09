import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    DMChannel,
    GuildMember,
    InteractionCollector,
    Message,
    MessageComponentInteraction,
    TextChannel,
} from 'discord.js';
import Bank from '../../../classes/Bank';
import Card from '../../../classes/Card';
import Deck from '../../../classes/Deck';
import Game from '../../../classes/Game';
import Hand from '../../../classes/Hand';
import Client from '../../../client';
import language from '../../../lang/language';
import { getPlayerById } from '../../../models/Players.model';
import { ChatInputCommand } from '../../../types/Command';
const stopGameMsg = 'STOP_GAME';
const chooseCardMsg = 'CHOOSE_CARD';

export const command: ChatInputCommand = {
    name: 'playcardjitsu',
    description: 'Plays a Card Jitsu game against the bot or opponent',
    type: ApplicationCommandType.ChatInput,
    test: false,
    dmPermission: true,
    options: [
        {
            name: 'opponent',
            type: ApplicationCommandOptionType.User,
            description: "If you want to play against your friend, you should mention him/her here! (Enable DM's from servers)",
            required: false,
        },
    ],
    execute: async (client, interaction) => {
        await interaction.deferReply();

        const game = client.games.get(interaction.channel?.id!)!;
        if (game) {
            interaction.editReply(language(interaction.guildId ?? 'null', 'ALREADY_GAME')).then(() =>
                setTimeout(() => {
                    interaction.deleteReply();
                }, 5000),
            );
            return;
        }

        const opponent = (interaction.options.getMember('opponent') as GuildMember) ?? null;
        if (!game) await ifNoGame(client, interaction, interaction.channel! as TextChannel, opponent, game);
    },
};

async function ifNoGame(client: Client, interaction: ChatInputCommandInteraction, channel: TextChannel, opponent: GuildMember, game: Game) {
    const getTranslated = (textId: string) => {
        return language(interaction.guildId ?? 'null', textId);
    };

    const playerDB = await getPlayerById(interaction.user.id);

    // Player
    const playerDeck = new Deck(interaction.user);
    playerDeck.createCards();
    playerDeck.shuffle();

    const playerHand = new Hand();
    playerHand.createHand(playerDeck);

    const playerBank = new Bank();

    // Opponent || Bot
    const opponentDeck = new Deck(opponent ? opponent.user : null);
    opponentDeck.createCards();
    opponentDeck.shuffle();

    const opponentHand = new Hand();
    opponentHand.createHand(opponentDeck);

    const opponentBank = new Bank();

    const playerChannel = await interaction.user.createDM();

    if (!playerChannel) {
        interaction.editReply(getTranslated('COULDNT_DM'));
        return;
    }

    const opponentChannel = opponent ? await opponent.user.createDM() : null;
    if (opponent && !opponentChannel) {
        interaction.editReply(getTranslated('COULDNT_DM_OPPONENT'));
        return;
    }

    const playerComponents = playerHand.hand.map((card) => {
        return new ButtonBuilder()
            .setCustomId(playerHand.hand.indexOf(card).toString())
            .setLabel(`${card.getArticle()} ${card.getValue()}`)
            .setEmoji(card.getEmoji())
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);
    });

    const stopButton = new ButtonBuilder({
        label: getTranslated('STOP_BUTTON'),
        customId: 'stop',
        style: ButtonStyle.Danger,
    });

    const playerButtonRow = new ActionRowBuilder<ButtonBuilder>().setComponents(...playerComponents);
    const stopButtonRow = new ActionRowBuilder<ButtonBuilder>().setComponents([stopButton]);
    const currentPlayerCard: Card | null = null;
    const currentOpponentCard: Card | null = null;
    const secForRound = 25;

    const playerFilter = (btnInt: MessageComponentInteraction) =>
        (btnInt.customId === '0' ||
            btnInt.customId === '1' ||
            btnInt.customId === '2' ||
            btnInt.customId === '3' ||
            btnInt.customId === '4' ||
            btnInt.customId === 'stop' ||
            btnInt.customId === 'sure_stop') &&
        btnInt.user.id === game?.player.id;

    game = new Game({
        playerChannel,
        playerHand,
        playerDeck,
        playerBank,
        opponent,
        opponentHand,
        opponentDeck,
        opponentBank,
        client,
        playerButtonRow,
        playerDB,
        currentPlayerCard,
        currentOpponentCard,
        secForRound,
        textChannel: channel,
        player: interaction.user,
        opponentChannel: opponent ? opponentChannel : null,
        playerCollector: null,
        opponentCollector: null,
        playerMessage: null,
        playerBankMessage: null,
        playerTime: null,
        opponentMessage: null,
        opponentBankMessage: null,
        opponentTime: null,
        playerStop: null,
        playerSureStop: null,
        opponentStop: null,
        opponentSureStop: null,
        playerResponse: null,
        opponentResponse: null,
        opponentDB: null,
        timer: null,
        opponentButtonRow: null,
        sensei: false,
        nextEffect: null,
    });

    client.games.set(interaction.channel?.id!, game);

    if (opponent) {
        await opponentInit(game, playerChannel, opponent, playerButtonRow, interaction, opponentChannel!, stopButtonRow, playerFilter);
    } else {
        await playerInit(channel, game, playerBank, playerButtonRow, interaction, secForRound, stopButtonRow, playerFilter);
    }
}

async function playerInit(
    channel: TextChannel,
    game: Game,
    playerBank: Bank,
    playerButtonRow: ActionRowBuilder<ButtonBuilder>,
    interaction: ChatInputCommandInteraction,
    secForRound: number,
    stopButtonRow: ActionRowBuilder<ButtonBuilder>,
    // eslint-disable-next-line no-unused-vars
    playerFilter: (btnInt: MessageComponentInteraction) => boolean,
) {
    const getTranslated = (textId: string) => {
        return language(interaction.guildId ?? 'null', textId);
    };

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

    const playerCollector = channel.createMessageComponentCollector({ filter: playerFilter }) as InteractionCollector<ButtonInteraction>;

    game.playerCollector = playerCollector;
    game.playerMessage = playerMessage;
    game.playerBankMessage = playerBankMessage;
    game.playerStop = playerStop;
    game.playerTime = playerTime;

    await game.startGame();
}

async function opponentInit(
    game: Game,
    playerChannel: DMChannel,
    opponent: GuildMember,
    playerButtonRow: ActionRowBuilder<ButtonBuilder>,
    interaction: ChatInputCommandInteraction,
    opponentChannel: DMChannel,
    stopButtonRow: ActionRowBuilder<ButtonBuilder>,
    // eslint-disable-next-line no-unused-vars
    playerFilter: (btnInt: MessageComponentInteraction) => boolean,
) {
    const getTranslated = (textId: string) => {
        return language(interaction.guildId ?? 'null', textId);
    };
    const opponentDB = await getPlayerById(opponent.user.id);

    interaction.editReply(getTranslated('GAME_STARTED'));

    const playerStop = (await playerChannel.send({
        content: getTranslated(stopGameMsg),
        components: [stopButtonRow],
    })) as Message;
    const playerMessage = await playerChannel.send({
        content: getTranslated(chooseCardMsg),
        components: [playerButtonRow],
    });
    const playerBankMsg = `__**${getTranslated('YOUR_BANK_CONTAINS')}:**__\n${game.playerBank.toString()}`;
    const playerBankMessage = await playerChannel.send({
        content: playerBankMsg,
    });
    const playerTimeMsg = `**${game.secForRound} ${getTranslated('SECONDS_LEFT')}!**`;
    const playerTime = await playerChannel.send({
        content: playerTimeMsg,
    });

    const opponentComponents = game.opponentHand.hand.map((card) => {
        return new ButtonBuilder()
            .setCustomId(game.opponentHand.hand.indexOf(card).toString())
            .setLabel(`${card.getArticle()} ${card.getValue()}`)
            .setEmoji(card.getEmoji())
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);
    });

    const opponentButtonRow = new ActionRowBuilder<ButtonBuilder>().setComponents(...opponentComponents);

    const opponentStop = await opponentChannel.send({
        content: getTranslated(stopGameMsg),
        components: [stopButtonRow],
    });
    const opponentMessage = await opponentChannel.send({
        content: getTranslated(chooseCardMsg),
        components: [opponentButtonRow],
    });
    const opponentBankMsg = `__**${getTranslated('YOUR_BANK_CONTAINS')}**__\n${game.opponentBank.toString()}`;
    const opponentBankMessage = await opponentChannel.send({
        content: opponentBankMsg,
    });
    const opponentTimeMsg = `**${game.secForRound} ${getTranslated('SECONDS_LEFT')}!**`;
    const opponentTime = await opponentChannel.send({
        content: opponentTimeMsg,
    });

    const opponentFilter = (btnInt: MessageComponentInteraction) =>
        (btnInt.customId === '0' ||
            btnInt.customId === '1' ||
            btnInt.customId === '2' ||
            btnInt.customId === '3' ||
            btnInt.customId === '4' ||
            btnInt.customId === 'stop' ||
            btnInt.customId === 'sure_stop') &&
        btnInt.user.id === game?.opponent!.id;

    const playerCollector = playerChannel.createMessageComponentCollector({ filter: playerFilter }) as InteractionCollector<ButtonInteraction>;
    const opponentCollector = opponentChannel.createMessageComponentCollector({ filter: opponentFilter }) as InteractionCollector<ButtonInteraction>;

    game.playerCollector = playerCollector;
    game.playerMessage = playerMessage;
    game.playerBankMessage = playerBankMessage;
    game.playerStop = playerStop;
    game.playerTime = playerTime;

    game.opponentCollector = opponentCollector;
    game.opponentButtonRow = opponentButtonRow;
    game.opponentMessage = opponentMessage;
    game.opponentBankMessage = opponentBankMessage;
    game.opponentStop = opponentStop;
    game.opponentTime = opponentTime;
    game.opponentDB = opponentDB;

    await game.startGame();
}
