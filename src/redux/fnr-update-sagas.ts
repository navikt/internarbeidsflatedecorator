import { call, fork, put, spawn, take } from 'redux-saga/effects';
import { MaybeCls } from '@nutgaard/maybe-ts';
import { InitializedState } from './reducer';
import { forkApiWithErrorhandling, selectFromInitializedState } from './utils';
import {
    AktorIdResponse,
    ContextvalueState,
    FnrContextvalueState,
    isDisabled,
    isEnabled
} from '../internal-domain';
import { lagFnrFeilmelding } from '../utils/fnr-utils';
import * as Api from './api';
import { FetchResponse, hasError } from './api';
import { FnrReset, FnrSubmit, ReduxActionTypes, SagaActionTypes } from './actions';
import { leggTilFeilmelding } from './feilmeldinger/reducer';
import { PredefiniertFeilmeldinger } from './feilmeldinger/domain';

export function* hentAktorId() {
    const state: InitializedState = yield selectFromInitializedState((state) => state);

    if (isDisabled(state.fnr)) {
        return;
    }

    if (state.fnr.value.isJust()) {
        const fnr = state.fnr.value.withDefaultLazy(() => {
            throw new Error(`'state.fnr' was NOTHING while expecting JUST`);
        });

        const hasLoadedAktorIdForFnr = state.data.aktorId
            .filter((data) => data.fnr === fnr)
            .isJust();
        if (hasLoadedAktorIdForFnr) {
            return;
        }

        const feilFnr = state.fnr.value.flatMap(lagFnrFeilmelding);
        if (feilFnr.isNothing()) {
            const response: FetchResponse<AktorIdResponse> = yield call(Api.hentAktorId, fnr);
            if (hasError(response)) {
                yield fork(Api.logError, response.error, { fnr });
                yield put(leggTilFeilmelding(PredefiniertFeilmeldinger.HENT_AKTORID_FEILET));
            } else {
                yield put({ type: ReduxActionTypes.AKTORIDDATA, data: response.data });
            }
        }
    } else {
        yield put({ type: ReduxActionTypes.AKTORIDDATA, data: null });
    }
}

export function* updateFnrValue(onsketFnr: MaybeCls<string>) {
    yield* updateFnrState({
        value: onsketFnr
    });
}

function* updateFnrState(updated: Partial<FnrContextvalueState>) {
    const data: FnrContextvalueState = yield selectFromInitializedState((state) => state.fnr);

    if (isEnabled(data)) {
        const newData: FnrContextvalueState = {
            ...data,
            ...updated
        };
        yield put({
            type: ReduxActionTypes.UPDATESTATE,
            data: {
                fnr: newData
            },
            scope: 'initialSyncFnr - by props'
        });

        yield fork(hentAktorId);
    }
}

export function* updateWSRequestedFnr(onsketFnr: MaybeCls<string>) {
    const data: FnrContextvalueState = yield selectFromInitializedState((state) => state.fnr);
    if (isEnabled(data) && !data.ignoreWsEvents) {
        const fnr = data.value.withDefault('');
        const onsket = onsketFnr.withDefault('');
        const showModal = fnr !== onsket;

        if (data.skipModal) {
            yield* updateFnrValue(onsketFnr);
            yield spawn(data.onChange, onsketFnr.withDefault(null));
            return;
        }

        yield* updateFnrState({
            wsRequestedValue: onsketFnr,
            showModal
        });

        const resolution: { type: SagaActionTypes } = yield take([
            SagaActionTypes.WS_FNR_ACCEPT,
            SagaActionTypes.WS_FNR_DECLINE
        ]);
        if (resolution.type === SagaActionTypes.WS_FNR_ACCEPT) {
            yield* updateFnrState({
                showModal: false,
                value: onsketFnr
            });
            yield spawn(data.onChange, onsketFnr.withDefault(null));
        } else {
            yield forkApiWithErrorhandling(
                PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                Api.oppdaterAktivBruker,
                fnr
            );
            yield* updateFnrState({
                showModal: false
            });
        }
    }
}

export function* updateFnr(action: FnrSubmit | FnrReset) {
    const props: ContextvalueState<any> = yield selectFromInitializedState((state) => state.fnr);
    if (isEnabled(props)) {
        if (action.type === SagaActionTypes.FNRRESET) {
            yield forkApiWithErrorhandling(
                PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                Api.nullstillAktivBruker
            );
            yield* updateFnrValue(MaybeCls.nothing());
            yield spawn(props.onChange, null);
        } else {
            const fnr = MaybeCls.of(action.data).filter((v) => v.length > 0);
            if (fnr.isNothing()) {
                yield forkApiWithErrorhandling(
                    PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                    Api.nullstillAktivBruker
                );
            } else {
                yield forkApiWithErrorhandling(
                    PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                    Api.oppdaterAktivBruker,
                    fnr.withDefault('')
                );
            }

            yield* updateFnrValue(fnr);
            yield spawn(props.onChange, fnr.withDefault(''));
        }
    }
}
