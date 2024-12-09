import Bank from '../src/Classes/Bank';

test('Same Element: 1', async () => {
    const bank = new Bank();
    bank.bank.snow.blue = 2;
    bank.bank.snow.green = 2;
    bank.bank.snow.orange = 2;
    expect(bank.hasWon()).toEqual(true);
});

test('Same Color: 1', async () => {
    const bank = new Bank();
    bank.bank.snow.blue = 2;
    bank.bank.fire.blue = 2;
    bank.bank.water.blue = 1;
    expect(bank.hasWon()).toEqual(true);
});
test('Unique: 1', async () => {
    const bank = new Bank();
    bank.bank.snow.blue = 2;
    bank.bank.fire.green = 2;
    bank.bank.water.orange = 1;
    bank.bank.fire.orange = 2;
    bank.bank.water.blue = 1;
    expect(bank.hasWon()).toEqual(true);
});
test('Unique: 2', async () => {
    const bank = new Bank();
    bank.bank.snow.blue = 2;
    bank.bank.water.green = 2;
    bank.bank.fire.green = 1;
    expect(bank.hasWon()).toEqual(false);
});
test('Same Element: 2', async () => {
    const bank = new Bank();
    bank.bank.snow.blue = 2;
    bank.bank.snow.green = 2;
    bank.bank.snow.orange = 1;
    bank.bank.fire.blue = 1;
    bank.bank.snow.purple = 3;
    expect(bank.hasWon()).toEqual(true);
});
test('Same Color: 2', async () => {
    const bank = new Bank();
    bank.bank.fire.blue = 2;
    bank.bank.snow.blue = 2;
    bank.bank.snow.orange = 1;
    bank.bank.water.orange = 2;
    expect(bank.hasWon()).toEqual(false);
});
test('Same Color: 3', async () => {
    const bank = new Bank();
    bank.bank.fire.blue = 2;
    bank.bank.snow.blue = 2;
    expect(bank.hasWon()).toEqual(false);
});