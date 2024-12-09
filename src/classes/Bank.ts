import { Colors, ColorsBank, ColorsObject, ElementColor, ElementName, ElementObject } from '../types/CardJistu';
import Card from './Card';

class Bank {
    bank: Record<ElementName, ColorsBank>;
    winningElements: ElementName[];
    winningColors: Colors[];
    mixed: ElementColor[];
    sameScore: number;
    constructor() {
        this.bank = {
            fire: {
                red: 0,
                orange: 0,
                yellow: 0,
                green: 0,
                blue: 0,
                purple: 0,
            },
            snow: {
                red: 0,
                orange: 0,
                yellow: 0,
                green: 0,
                blue: 0,
                purple: 0,
            },
            water: {
                red: 0,
                orange: 0,
                yellow: 0,
                green: 0,
                blue: 0,
                purple: 0,
            },
        };
        // eslint-disable-next-line no-unused-expressions
        this.winningElements = [];
        this.winningColors = [];
        this.mixed = [];
        this.sameScore = 0;
    }

    toString(): string {
        let result = '';
        const elements = Object.keys(this.bank) as ElementName[];

        for (const element of elements) {
            const colors = Object.keys(this.bank[element]) as Colors[];
            for (const color of colors) {
                if (this.bank[element][color] >= 1) {
                    result += `\n${this.color(color)} ${this.element(element)}`;
                }
            }
        }

        return result;
    }

    uniqueToString(): string {
        let result = '';
        for (const card of this.mixed) {
            const args = card.split(' ');
            result += `${this.element(args[0] as ElementName)}${this.color(args[1] as Colors)} `;
        }

        return result;
    }

    colorsToString(): string {
        let result = '';

        for (const color of this.winningColors) {
            result += `${this.color(color)} `;
        }

        return result;
    }

    elementsToString(): string {
        let result = '';
        for (const element of this.winningElements) {
            result += `${this.element(element)} `;
        }

        return result;
    }

    getCards() {
        const elements = Object.keys(this.bank) as ElementName[];
        const colors = Object.keys(this.bank.fire) as Colors[];
        const result = [];

        for (const element of elements) {
            for (const color of colors) {
                if (this.bank[element][color] >= 1) {
                    result.push({ element, color });
                }
            }
        }
        return result;
    }

    removeCard(card: { element: ElementName; color: Colors }) {
        this.bank[card.element][card.color]--;
    }
    removeCards(card: { element: ElementName; color: Colors }) {
        this.bank[card.element][card.color] = 0;
    }

    element(element: ElementName) {
        if (element === 'fire') return '<:Fire:933120860691247144>';
        if (element === 'water') return '<:Water:933117273152057384>';
        if (element === 'snow') return '<:Snow:933117272409657414>';
        return '';
    }

    color(color: Colors) {
        if (color === 'red') return '🟥';
        if (color === 'orange') return '🟧';
        if (color === 'yellow') return '🟨';
        if (color === 'green') return '🟩';
        if (color === 'blue') return '🟦';
        if (color === 'purple') return '🟪';
        return '';
    }

    addCard(card: Card): void {
        if (!this.containsColor(card)) {
            const element: ElementName = card.getElement();
            const color: Colors = card.getColor();
            this.bank[element][color] = +1;
        }
    }
    containsColor(card: Card) {
        if (this.bank[card.getElement()][card.getColor()] >= 1) return true;
        return false;
    }
    async hasWon() {
        const elements = Object.keys(this.bank) as ElementName[];

        const cardsInBank: ColorsObject = {
            red: [] as ElementName[],
            orange: [] as ElementName[],
            yellow: [] as ElementName[],
            green: [] as ElementName[],
            blue: [] as ElementName[],
            purple: [] as ElementName[],
        };

        const colors = Object.keys(cardsInBank) as Colors[];

        const elementsInBank = {
            fire: [] as Colors[],
            water: [] as Colors[],
            snow: [] as Colors[],
        };

        for (const c of colors) {
            if (this.bank.fire[c] >= 1) {
                elementsInBank.fire.push(c);
            }
            if (this.bank.water[c] >= 1) {
                elementsInBank.water.push(c);
            }
            if (this.bank.snow[c] >= 1) {
                elementsInBank.snow.push(c);
            }
        }

        for (const element of elements) {
            if (this.sameScore < 3) {
                this.sameScore = 0;
                this.winningColors = [];
                this.winningElements = [];
            }

            if (await this.winningConditions(element, colors, cardsInBank, elementsInBank)) return true;
        }
        return false;
    }

    async winningConditions(element: ElementName, colors: Colors[], cardsInBank: ColorsObject, elementsInBank: ElementObject) {
        for (const color of colors) {
            // different elements, same colors

            if (this.bank[element][color] >= 1) cardsInBank[color].push(element);

            if (this.bank[element][color] === 1 && (await this.towOtherWinConditions(element, color, elementsInBank))) return true;
        }
        for (const color of colors) {
            if (cardsInBank[color].length === 3) {
                this.winningColors = [color];
                this.winningElements = ['fire', 'snow', 'water'];
                return true;
            }
        }

        return false;
    }

    async towOtherWinConditions(element: ElementName, color: Colors, elementsInBank: ElementObject) {
        // different elements, different colors

        const uniqueCards = Unique(elementsInBank);

        if (uniqueCards.length >= 3) {
            for (const card of uniqueCards) {
                this.mixed.push(`${card.element} ${card.color}`);
            }
            return true;
        }

        // same elements, different colors

        this.winningColors.push(color);
        this.sameScore += this.bank[element][color];
        if (this.sameScore === 3) {
            this.winningElements = [element];
            return true;
        }

        return false;
    }
}

export default Bank;

function Unique(bank: ElementObject) {
    for (const fireColor of bank.fire) {
        for (const snowColor of bank.snow) {
            for (const waterColor of bank.water) {
                if (fireColor !== snowColor && snowColor !== waterColor && waterColor !== fireColor) {
                    return [
                        { element: 'fire' as ElementName, color: fireColor },
                        { element: 'snow' as ElementName, color: snowColor },
                        { element: 'water' as ElementName, color: waterColor },
                    ];
                }
            }
        }
    }

    return [];
}
