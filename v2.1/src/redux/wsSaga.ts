import { eventChannel } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { MaybeCls } from '@nutgaard/maybe-ts';
import WebSocketImpl from '../utils/websocket-impl';
import * as Api from './api';
import { ContextApiType, FetchResponse, getWebSocketUrl } from './api';
import { AktivBruker, AktivEnhet } from '../internal-domain';
import { selectFromInitializedState } from './utils';
import { updateWSRequestedEnhet } from './enhet-update-sagas';
import { updateWSRequestedFnr } from './fnr-update-sagas';
import { leggTilFeilmelding } from './feilmeldinger/reducer';
import { FeilmeldingKode } from './feilmeldinger/domain';

enum WsChangeEventType {
    MESSAGE,
    OPEN,
    ERROR,
    CLOSE
}

interface WsChangeEvent {
    type: WsChangeEventType;
    data: string;
}

function createWsChannel(url: string | null | undefined) {
    if (!url) {
        return eventChannel(() => {
            return () => {};
        });
    }

    return eventChannel<WsChangeEvent>((emit) => {
        const ws = new WebSocketImpl(url, {
            onMessage(event: MessageEvent): void {
                const data: string = event.data;
                emit({ type: WsChangeEventType.MESSAGE, data });
            },
            onError(event: Event): void {
                emit({
                    type: WsChangeEventType.ERROR,
                    data: `Feil ved ws-tilkobling til contextholder`
                });
            }
        });
        ws.open();
        return () => ws.close();
    });
}

function* wsChange(event: WsChangeEvent) {
    const { type, data } = event;
    if (type === WsChangeEventType.MESSAGE && data === ContextApiType.NY_AKTIV_BRUKER) {
        const response: FetchResponse<AktivBruker> = yield call(Api.hentAktivBruker);
        const onsketFnr: MaybeCls<string> = MaybeCls.of(response.data).flatMap((data) =>
            MaybeCls.of(data.aktivBruker)
        );
        yield* updateWSRequestedFnr(onsketFnr);
    } else if (type === WsChangeEventType.MESSAGE && data === ContextApiType.NY_AKTIV_ENHET) {
        const response: FetchResponse<AktivEnhet> = yield call(Api.hentAktivEnhet);
        const onsketEnhet: MaybeCls<string> = MaybeCls.of(response.data).flatMap((data) =>
            MaybeCls.of(data.aktivEnhet)
        );
        yield* updateWSRequestedEnhet(onsketEnhet);
    } else if (type === WsChangeEventType.ERROR) {
        yield put(
            leggTilFeilmelding({
                kode: FeilmeldingKode.WS_FEILET,
                melding: data
            })
        );
    }
}

export function* wsListener() {
    const saksbehandler = yield selectFromInitializedState((state) => state.data.saksbehandler);
    const wsUrl = getWebSocketUrl(saksbehandler);
    const wsChannel = yield call(createWsChannel, wsUrl);
    yield takeLatest(wsChannel, wsChange);
}
