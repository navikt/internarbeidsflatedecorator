import { createWsChannel, wsChange, wsListener, requiresWebsocket } from './wsSaga';
import { MaybeCls } from '@nutgaard/maybe-ts';
import { eventChannel } from 'redux-saga';
import { call, takeLatest } from 'redux-saga/effects';
import { getWebSocketUrl } from './api';
import { ContextvalueState } from '../internal-domain';

const mockEventChannel = eventChannel(() => () => {});
const saksbehandler = MaybeCls.of({
    ident: 'Z999999',
    navn: '',
    fornavn: '',
    etternavn: '',
    enheter: []
});

function stepThroughSaga(
    useWSForFnr: boolean,
    useWSForEnhet: boolean
): { channel: any; listener: any } {
    const saga = wsListener();
    // Run through saga by providing responses to yield-commands
    saga.next();
    saga.next(saksbehandler as any);
    saga.next(useWSForFnr as any);
    const createWsChannelCall = saga.next(useWSForEnhet as any).value;
    if (createWsChannelCall === undefined) {
        return { channel: undefined, listener: undefined };
    }
    const wsChangeListener = saga.next(mockEventChannel as any).value;

    return { channel: createWsChannelCall, listener: wsChangeListener };
}

describe('wsSaga', () => {
    describe('wsListener', () => {
        it('should not create WS if not needed', () => {
            const { channel, listener } = stepThroughSaga(false, false);
            expect(channel).toBeUndefined();
            expect(listener).toBeUndefined();
        });

        it('should not create WS if listening for fnr-changes', () => {
            const { channel, listener } = stepThroughSaga(true, false);
            expect(channel).toEqual(call(createWsChannel, getWebSocketUrl(saksbehandler)));
            expect(listener).toEqual(takeLatest(mockEventChannel, wsChange));
        });

        it('should not create WS if listening for enhet-changes', () => {
            const { channel, listener } = stepThroughSaga(false, true);
            expect(channel).toEqual(call(createWsChannel, getWebSocketUrl(saksbehandler)));
            expect(listener).toEqual(takeLatest(mockEventChannel, wsChange));
        });

        it('should not create WS if listening for changes', () => {
            const { channel, listener } = stepThroughSaga(true, true);
            expect(channel).toEqual(call(createWsChannel, getWebSocketUrl(saksbehandler)));
            expect(listener).toEqual(takeLatest(mockEventChannel, wsChange));
        });
    });

    describe('requiresWebsocket', () => {
        const context: ContextvalueState<any> = {
            enabled: true,
            value: MaybeCls.nothing(),
            wsRequestedValue: MaybeCls.nothing(),
            display: '',
            showModal: false,
            onChange(value: string | null) {},
            skipModal: false,
            ignoreWsEvents: true
        };
        it('should respect enabled flag', () => {
            expect(requiresWebsocket({ enabled: false })).toBe(false);
        });

        it('should respect ignoreWs flag', () => {
            expect(requiresWebsocket({ ...context, ignoreWsEvents: true })).toBe(false);
            expect(requiresWebsocket({ ...context, ignoreWsEvents: false })).toBe(true);
        });
    });
});
