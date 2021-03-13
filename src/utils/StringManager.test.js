import StringManager from './StringManager';

describe('StringManager', () => {
    test('string manager is immutable', () => {
        expect(() => {
            StringManager.get = 'foo';
        }).toThrow();
    });
});