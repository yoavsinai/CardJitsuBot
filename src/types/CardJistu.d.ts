import { ButtonInteraction, DMChannel, GuildMember, Message, TextBasedChannel, TextChannel, User } from 'discord.js';
import Bank from '../classes/Bank';
import Deck from '../classes/Deck';
import Game from '../classes/Game';
import Hand from '../classes/Hand';

type Colors = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

type ElementName = 'fire' | 'snow' | 'water';

type ElementColor = `${ElementName} ${Colors}`;

interface CardsConstructor {
    name: string;
    value: number;
    element: ElementName;
    color: Colors;
    power?: PowerEffect;
}

interface GameObject {
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
    playerBankMessage: Message | null;
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
    playerButtonRow: MessageActionRow;
    opponentButtonRow: MessageActionRow | null;
    sensei: boolean;
    nextEffect: NextEffect;
}

interface config {
    maxHand: number;
}

interface ColorsObject {
    red: ElementName[];
    orange: ElementName[];
    yellow: ElementName[];
    green: ElementName[];
    blue: ElementName[];
    purple: ElementName[];
}
interface ColorsBank {
    red: number;
    orange: number;
    yellow: number;
    green: number;
    blue: number;
    purple: number;
}

interface ElementObject extends Object<ElementName> {
    fire: Colors[];
    snow: Colors[];
    water: Colors[];
}

interface CardObject {
    value: number;
    element: string;
    color: string;
    getElement: any;
    getValue: any;
    getColor: any;
    getArticle: any;
    toString: any;
}

interface PlayerButtons {
    playerButtonRow: MessageActionRow;
    playerButton1: MessageButton;
    playerButton2: MessageButton;
    playerButton3: MessageButton;
    playerButton4: MessageButton;
    playerButton5: MessageButton;
}

interface Buttons extends PlayerButtons {
    opponentButton1: MessageButton | null;
    opponentButton2: MessageButton | null;
    opponentButton3: MessageButton | null;
    opponentButton4: MessageButton | null;
    opponentButton5: MessageButton | null;
    opponentButtonRow: MessageActionRow | null;
}

interface Timer extends TimerHits0 {
    time: number;
}

interface TimerHits0 extends Buttons {
    client: Client;
    game: Game;
    playerCollector: InteractionCollector<MessageComponentInteraction>;
    opponentCollector: InteractionCollector<MessageComponentInteraction>;
    playerMessage: Message;
    playerBankMessage: Message;
    playerTime: Message;
    opponentMessage: Message | null;
    opponentBankMessage: Message | null;
    opponentTime: Message | null;
    playerStop: Message;
    opponentStop: Message | null;
    currentPlayerCard: null | Card;
    currentOpponentCard: null | Card;
    time: number;
    playerDB: PlayerDocument;
    opponentDB: PlayerDocument | null;
}

interface Collector extends Timer {
    timer: NodeJS.Timer;
}

interface changeButtons extends PlayerButtons {
    game: Game;
    opponentButton1: MessageButton | null;
    opponentButton2: MessageButton | null;
    opponentButton3: MessageButton | null;
    opponentButton4: MessageButton | null;
    opponentButton5: MessageButton | null;
    opponentButtonRow: MessageActionRow | null;
    playerMessage: Message;
    opponentMessage: Message | null;
    currentPlayerCard: Card | null;
    currentOpponentCard: Card | null;
    playerResponse: string;
    opponentResponse: string | null;
}

interface ifWon {
    client: Client;
    game: Game | undefined;
    playerCollector: InteractionCollector<MessageComponentInteraction>;
    opponentCollector: InteractionCollector<MessageComponentInteraction> | null;
    playerMessage: Message;
    playerBankMessage: Message;
    playerTime: Message;
    opponentMessage: Message | null;
    opponentBankMessage: Message | null;
    opponentTime: Message | null;
    playerStop: Message;
    opponentStop: Message | null;
    currentPlayerCard: null | Card;
    currentOpponentCard: null | Card;
    timer: NodeJS.Timer;
    playerDB: PlayerDocument;
    opponentDB: PlayerDocument | null | undefined;
    playerResponse: string | undefined;
    opponentResponse: string | undefined | null;
}

interface Stop {
    client: Client;
    game: Game;
    playerCollector: InteractionCollector<MessageComponentInteraction>;
    opponentCollector: InteractionCollector<MessageComponentInteraction>;
    playerMessage: Message;
    playerBankMessage: Message;
    playerTime: Message;
    opponentMessage: Message | null;
    opponentBankMessage: Message | null;
    opponentTime: Message | null;
    playerStop: Message;
    opponentStop: Message | null;
    currentPlayerCard: null | Card;
    currentOpponentCard: null | Card;
    timer: NodeJS.Timer;
}

interface GameObject {
    playerChannel: DMChannel | TextBasedChannel | null;
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
    playerCollector: InteractionCollector<MessageComponentInteraction>;
    opponentCollector: InteractionCollector<MessageComponentInteraction>;
    playerMessage: Message;
    playerBankMessage: Message;
    playerTime: Message;
    opponentMessage: Message | null;
    opponentBankMessage: Message | null;
    opponentTime: Message | null;
    playerStop: Message;
    opponentStop: Message | null;
    currentPlayerCard: null | Card;
    currentOpponentCard: null | Card;
    timer: NodeJS.Timer;
}

export type PowerEffect = NumberChange | DiscardElement | DiscardColor | DiscardAllColors | ElementChange | BlockElement;

type NumberChange = 'plus2' | 'minus2' | 'reversal';

type DiscardElement = `discard_${ElementName}`;

type DiscardColor = `discard_${Colors}`;

type DiscardAllColors = `discard_all_${Colors}`;

type ElementChange = 'fire_snow' | 'snow_water' | 'water_fire';

type BlockElement = `block_${ElementName}`;

type PlayerOpponent = 'player' | 'opponent';

type playeropponent2 = `plus2_${PlayerOpponent}` | `minus2_${PlayerOpponent}`

export type NextEffect = ElementName | playeropponent2 | null;

