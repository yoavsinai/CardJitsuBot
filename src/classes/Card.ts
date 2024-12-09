import { Colors, ElementName, PowerEffect } from '../types/CardJistu';
import { effectToEmoji } from '../util/powerEffects';

class Card {
    name: string;
    value: number;
    element: ElementName;
    color: Colors;
    power?: PowerEffect;

    constructor(name: string, value: number, element: ElementName, color: Colors, power?: PowerEffect) {
        this.name = name;
        this.value = value;
        this.element = element;
        this.color = color;
        this.power = power;
    }

    getElement() {
        return this.element;
    }

    getValue() {
        return this.value;
    }
    getColor() {
        return this.color;
    }

    getArticle() {
        if (this.color === 'red') return '🟥';
        if (this.color === 'orange') return '🟧';
        if (this.color === 'yellow') return '🟨';
        if (this.color === 'green') return '🟩';
        if (this.color === 'blue') return '🟦';
        if (this.color === 'purple') return '🟪';
        return '';
    }
    getEmoji() {
        if (this.getElement() === 'fire') return '<:Fire:933120860691247144>';
        if (this.getElement() === 'water') return '<:Water:933117273152057384>';
        if (this.getElement() === 'snow') return '<:Snow:933117272409657414>';
        return '';
    }

    toString() {
        let emoji_id;

        if (this.getElement() === 'fire') emoji_id = '<:Fire:933120860691247144>';
        if (this.getElement() === 'water') emoji_id = '<:Water:933117273152057384>';
        if (this.getElement() === 'snow') emoji_id = '<:Snow:933117272409657414>';
        const name = `\`${this.name}\``;

        return `${this.getArticle()} ${emoji_id} **\`${this.getValue()}\`** ${effectToEmoji(this.power!) ?? ''} ${this.name ? name : ''}`.trim();
    }
}

export default Card;
