import { test, describe, expect, vi } from 'vitest';
import { updateProxy } from '../../src/utils/updateProxy';
import { deleteSymbol, resetSymbol, setSymbol, updateAllSymbol, updateSymbol, } from '../../src/utils/proxySymbol';
describe('updateProxy', () => {
    test('setSymbol', () => {
        const proxy = updateProxy();
        const cb = vi.fn();
        proxy['foo'] = { code: setSymbol, cb };
        expect(proxy.s.get('foo')).toEqual(cb);
    });
    test('deleteSymbol', () => {
        const proxy = updateProxy();
        const cb = vi.fn();
        proxy['foo'] = { code: setSymbol, cb };
        proxy['foo'] = { code: deleteSymbol };
        expect(proxy.s.get('foo')).toBeUndefined();
    });
    test('updateSymbol', () => {
        const proxy = updateProxy();
        const cb = vi.fn();
        proxy['foo'] = { code: setSymbol, cb };
        proxy['foo'] = { code: updateSymbol };
        expect(cb).toHaveBeenCalledOnce();
    });
    test('UPDATE_ALL', () => {
        const proxy = updateProxy();
        const cb = vi.fn();
        proxy['foo'] = { code: setSymbol, cb };
        proxy['bar'] = { code: setSymbol, cb };
        proxy[''] = { code: updateAllSymbol };
        expect(cb).toHaveBeenCalledTimes(2);
    });
    test('resetSymbol', () => {
        const proxy = updateProxy();
        const cb = vi.fn();
        proxy['foo'] = { code: setSymbol, cb };
        proxy['bar'] = { code: setSymbol, cb };
        proxy[''] = { code: resetSymbol };
        expect(proxy.s.size).toEqual(0);
    });
});
