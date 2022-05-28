;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { describe, test, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from '../../src/useForm';
import userEvent from '@testing-library/user-event';
describe('useForm', () => {
    describe('watch', () => {
        test('update on type', async () => {
            let watched;
            const Component = () => {
                const { watch, register } = useForm();
                watched = watch('a.b');
                return React.createElement("input", { ...register('a.b') });
            };
            render(React.createElement(Component, null));
            expect(watched).toBeUndefined();
            await userEvent.type(screen.getByRole('textbox'), 'a');
            expect(watched).toEqual('a');
            await userEvent.type(screen.getByRole('textbox'), 'b');
            expect(watched).toEqual('ab');
        });
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
        // test('', () => {})
    });
});
