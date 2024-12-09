import { PowerEffect } from '../types/CardJistu';

const emojis = [
    '<:CJ_reversal:1018120796914323546>',
    '<:CJ_plus2:1018120793676324905>',
    '<:CJ_minus2:1018120794997530706>',
    '<:CJ_block_fire:1018115802706214985>',
    '<:CJ_block_snow:1018115804803371038>',
    '<:CJ_block_water:1018115806875373609>',
    '<:CJ_fire_snow:1018115808523722762>',
    '<:CJ_snow_water:1018115809958182972>',
    '<:CJ_water_fire:1018115811224854549>',
    '<:CJ_discard_blue:1018115812655120514>',
    '<:CJ_discard_all_blue:1018115814165073992>',
    '<:CJ_discard_green:1018115816245428284>',
    '<:CJ_discard_all_green:1018115817700855878>',
    '<:CJ_discard_orange:1018115819256950834>',
    '<:CJ_discard_all_orange:1018115820716556369>',
    '<:CJ_discard_purple:1018115822423646288>',
    '<:CJ_discard_all_purple:1018115823937802320>',
    '<:CJ_discard_red:1018115825493884999>',
    '<:CJ_discard_all_red:1018115826953490462>',
    '<:CJ_discard_yellow:1018115828383748137>',
    '<:CJ_discard_all_yellow:1018115830061477908>',
];

export function effectToEmoji(powerEffect: PowerEffect) {
    if(!powerEffect) return '';
    return emojis.find((emoji) => emoji.search(powerEffect) >= 0) ?? "";
}
