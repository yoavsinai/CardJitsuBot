import { User } from 'discord.js';
import { getPlayerById } from '../models/Players.model';
import Card from './Card';

const defaultCards: Card[] = [
    new Card('Paint By Letters', 2, 'fire', 'red'),
    new Card('Construction Worker', 2, 'fire', 'yellow'),
    new Card('Cart Surfer', 3, 'fire', 'blue'),
    new Card('Pizza Chef', 6, 'fire', 'purple'),
    new Card('Gary', 6, 'fire', 'blue'),
    new Card('Hot Sauce', 7, 'fire', 'yellow'),
    new Card('Jackhammer', 10, 'fire', 'yellow', 'reversal'),
    new Card('Night Vision Goggles', 11, 'fire', 'green', 'discard_yellow'),
    new Card('Baseball', 2, 'water', 'green'),
    new Card('Cadence and The Keeper', 3, 'water', 'green'),
    new Card('Manhole Cover', 4, 'water', 'purple'),
    new Card('Coins!', 5, 'water', 'yellow'),
    new Card('Football', 5, 'water', 'blue'),
    new Card('The Migrator', 6, 'water', 'blue'),
    new Card('Firefighter', 10, 'water', 'yellow', 'reversal'),
    new Card('Octopus', 11, 'water', 'purple', 'discard_all_blue'),
    new Card('Blue Puffle', 2, 'snow', 'blue'),
    new Card('Ski Hill', 2, 'snow', 'red'),
    new Card('Pet Shop', 3, 'snow', 'orange'),
    new Card('Snowball Fight', 6, 'snow', 'red'),
    new Card('Soccer', 7, 'snow', 'yellow'),
    new Card('Aunt Arctic', 7, 'snow', 'green'),
    new Card('Sled Racing', 10, 'snow', 'green', 'reversal'),
    new Card('AC 3000', 11, 'snow', 'purple', 'discard_green'),
];

class Deck {
    deck: Card[];
    player: User | null;
    constructor(player: User | null) {
        this.deck = [];
        this.player = player ?? null;
    }

    async createCards() {
        // default deck
        this.deck.push(...defaultCards);

        // special cards
        if (this.player) {
            const playerDB = await getPlayerById(this.player.id);
            if (playerDB && playerDB.cards.length > 0) {
                for (const card of playerDB.cards) {
                    this.deck.push(new Card(card.name ?? "", card.value, card.element, card.color));
                }
            }
        }

        this.shuffle();
    }
    getCards() {
        return this.deck;
    }
    deal() {
        return this.deck.splice(0, 1)[0];
    }
    shuffle() {
        for (let i = 0; i < this.deck.length; i++) {
            const index = Math.floor(Math.random() * this.deck.length);
            const x = this.deck[i];
            const y = this.deck[index];
            this.deck[i] = y;
            this.deck[index] = x;
        }
    }
}

export default Deck;
