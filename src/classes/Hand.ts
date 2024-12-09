import Card from './Card';
import Deck from './Deck';
const MAXHAND = 5;

type hand = Card[];

class Hand {
    hand: hand;
    constructor() {
        this.hand = [];
    }

    addCard(card: Card) {
        this.hand.push(card);
    }

    addCards(cards: Card[]) {
        this.hand = this.hand.concat(cards);
    }

    getCard(element: string, value: number) {
        for (const card of this.hand) {
            if (card.getElement() === element && card.getValue() === value) {
                return card;
            }
        }
        return null;
    }

    useCardByCard(card: Card) {
        if (!card) return null;
        const newHand = this.hand.slice(this.hand.indexOf(card), 1);
        this.hand = newHand;
        return card;
    }

    getLength() {
        return this.hand.length;
    }
    useCardBy(element: string, value: number) {
        const card = this.getCard(element, value);
        if (card == null) {
            return null;
        }
        const newHand = this.hand.slice(this.hand.indexOf(card), 1);
        this.hand = newHand;
        return card;
    }

    useCard(index: number) {
        const card = this.hand[index];
        this.hand.splice(index, 1);
        return card;
    }

    toString() {
        let result = '';
        for (const card of this.hand) {
            result += `\n${card.toString()}\n`;
        }
        return result;
    }

    createHand(deck: Deck) {
        for (let i = 0; i < MAXHAND; i++) {
            this.addCard(deck.deal());
        }
    }
}

export default Hand;
