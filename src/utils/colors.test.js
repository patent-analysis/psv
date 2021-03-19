import { assignColors } from './colors';

describe('colors', () => {
    test('asignColors returns an object', () => {
        const colors = assignColors(['my', 'set', 'of', 'values']);
        expect(typeof colors).toBe('object');
    });

    test('asignColors never duplicates hexadecimal values', () => {
        // Array from 1 to 100
        const colors = assignColors([...Array(100).keys()]);
        const hexas = Object.values(colors);
        const hexaUniq = new Set(hexas);
        expect(hexaUniq.size).toEqual(hexas.length);
    });
});