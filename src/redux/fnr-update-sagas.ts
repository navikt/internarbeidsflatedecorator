import { call, fork, put, spawn, take } from 'redux-saga/effects';
import { MaybeCls } from '@nutgaard/maybe-ts';
import { InitializedState } from './reducer';
import { forkApiWithErrorhandling, selectFromInitializedState } from './utils';
import { AktorIdResponse, FnrContextvalueState, isDisabled, isEnabled } from '../internal-domain';
import { lagFnrFeilmelding } from '../utils/fnr-utils';
import * as Api from './api';
import { FetchResponse, hasError } from './api';
import { FnrReset, FnrSubmit, ReduxActionTypes, SagaActionTypes } from './actions';
import { leggTilFeilmelding } from './feilmeldinger/reducer';
import { PredefiniertFeilmeldinger } from './feilmeldinger/domain';
import Logger from '../utils/Logger';

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
    Logger.log('Oppdaterer fnr til ', onsketFnr);
    yield* updateFnrState({
        value: onsketFnr
    });
}

function* updateFnrState(updated: Partial<FnrContextvalueState>) {
    const data: FnrContextvalueState = yield selectFromInitializedState((state) => state.fnr);
    Logger.log('updateFnrState med data: ', data);
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
    Logger.log('updateWSRequestedFnr med data: ', data);
    if (isEnabled(data) && !data.ignoreWsEvents) {
        Logger.log(`Data er enabled og websocket blir ikke ignorert`);
        const fnr = data.value.withDefault('');
        const onsket = onsketFnr.withDefault('');
        const showModal = fnr !== onsket;

        Logger.log(`Sjekker fnr: ${fnr}, onsket: ${onsket} og showModal: ${showModal}`);

        if (data.skipModal) {
            yield* updateFnrValue(onsketFnr);
            yield spawn(data.onChange, onsketFnr.withDefault(null));
            return;
        }

        yield* updateFnrState({
            wsRequestedValue: onsketFnr,
            showModal
        });

        const resolution = yield take([
            SagaActionTypes.WS_FNR_ACCEPT,
            SagaActionTypes.WS_FNR_DECLINE
        ]);

        Logger.log('Fikk følgende resolution: ', resolution);

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
    Logger.log('Oppdaterer fnr pga: ', action);
    const props = yield selectFromInitializedState((state) => state.fnr);
    Logger.log('Fikk følgende props: ', props);
    if (isEnabled(props)) {
        Logger.log('Props er enabled: ', props);
        if (action.type === SagaActionTypes.FNRRESET) {
            Logger.log(`Resetter fnr`);
            yield forkApiWithErrorhandling(
                PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                Api.nullstillAktivBruker
            );
            yield* updateFnrValue(MaybeCls.nothing());
            Logger.log(`Kaller onChange med null`);
            yield spawn(props.onChange, null);
        } else {
            const fnr = MaybeCls.of(action.data).filter((v) => v.length > 0);
            Logger.log('Oppdaterer fnr til: ', fnr);
            if (fnr.isNothing()) {
                Logger.log(`Fnr var null, nullstiller kontekst.`);
                yield forkApiWithErrorhandling(
                    PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                    Api.nullstillAktivBruker
                );
            } else {
                Logger.log('Oppdaterer kontekst til fnr: ', fnr);
                yield forkApiWithErrorhandling(
                    PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                    Api.oppdaterAktivBruker,
                    fnr.withDefault('')
                );
            }

            yield* updateFnrValue(fnr);
            Logger.log('Kaller onChange med fnr: ', fnr);
            yield spawn(props.onChange, fnr.withDefault(''));
        }
    }
}
