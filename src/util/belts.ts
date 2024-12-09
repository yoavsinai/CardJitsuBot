const emojis = [
    'None',
    '<:White:939862069501648937>' /*0*/,
    '<:Yellow:939863024251072593>' /*1*/,
    '<:Orange:939863024594984990>' /*2*/,
    '<:Green:939863024003596320>' /*3*/,
    '<:Blue:939863024246853642>' /*4*/,
    '<:Red:939863024456581170>' /*5*/,
    '<:Purple:939863024360103956>' /*6*/,
    '<:Brown:939863022984384554>' /*7*/,
    '<:Black:939863022866923571>' /*8*/,
];

const beltsNames: belt[] = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Red', 'Purple', 'Brown', 'Black'];

export type belt = 'White' | 'Yellow' | 'Orange' | 'Green' | 'Blue' | 'Red' | 'Purple' | 'Brown' | 'Black' | 'NinjaMask' | 'None';

export function belts(won: number) {
    // The amount of wins you needed to get increased by 1 for each belt
    let result: belt = 'None';

    if (won === 5) return 'White';
    for (const belt of beltsNames) {
        let addUP = 5;
        let total = 0;

        for (let i = 0; i < beltsNames.indexOf(belt) + 1; i++) {
            if (addUP >= 10) {
                addUP = 12;
                total += addUP;
                continue;
            }
            addUP += 1;
            total += addUP;
        }

        if (won >= total) {
            result = belt;
        }
    }

    return result;
}

export function beltsEmojis(belt: belt): string {
    if (belt === 'NinjaMask') {
        return '<:NInjaMask:939884539256389652>';
    }
    for (const emoji of emojis) {
        if (emoji.search(belt) >= 0) {
            return emoji;
        }
    }
    return '';
}
