import { MaybeCls } from '@nutgaard/maybe-ts';
import { put, spawn, take } from 'redux-saga/effects';
import { ContextvalueState, EnhetContextvalueState, isEnabled } from '../internal-domain';
import { forkApiWithErrorhandling, selectFromInitializedState } from './utils';
import { EnhetChanged, ReduxActionTypes, SagaActionTypes } from './actions';
import * as Api from './api';
import { PredefiniertFeilmeldinger } from './feilmeldinger/domain';

export function* updateEnhetState(updated: Partial<EnhetContextvalueState>) {
    const data: EnhetContextvalueState = yield selectFromInitializedState((state) => state.enhet);
    if (isEnabled(data)) {
        const newData: EnhetContextvalueState = {
            ...data,
            ...updated
        };

        yield put({
            type: ReduxActionTypes.UPDATESTATE,
            data: {
                enhet: newData
            },
            scope: 'initialSyncEnhet - by props'
        });
    }
}

export function* updateEnhetValue(onsketEnhet: MaybeCls<string>) {
    yield* updateEnhetState({
        value: onsketEnhet
    });
}

export function* updateWSRequestedEnhet(onsketEnhet: MaybeCls<string>) {
    const data: EnhetContextvalueState = yield selectFromInitializedState((state) => state.enhet);
    if (isEnabled(data) && !data.ignoreWsEvents) {
        const enhet = data.value.withDefault('');
        const onsket = onsketEnhet.withDefault('');
        const showModal = enhet !== onsket;

        if (data.skipModal) {
            yield* updateEnhetValue(onsketEnhet);
            yield spawn(data.onChange, onsketEnhet.withDefault(null));
            return;
        }

        yield updateEnhetState({
            wsRequestedValue: onsketEnhet,
            showModal
        });

        const resolution: { type: SagaActionTypes } = yield take([
            SagaActionTypes.WS_ENHET_ACCEPT,
            SagaActionTypes.WS_ENHET_DECLINE
        ]);
        if (resolution.type === SagaActionTypes.WS_ENHET_ACCEPT) {
            yield* updateEnhetState({
                showModal: false,
                value: onsketEnhet
            });
            yield spawn(data.onChange, onsketEnhet.withDefault(null));
        } else {
            yield* forkApiWithErrorhandling(
                PredefiniertFeilmeldinger.OPPDATER_ENHET_CONTEXT_FEILET,
                Api.oppdaterAktivEnhet,
                enhet
            );
            yield* updateEnhetState({
                showModal: false
            });
        }
    }
}

export function* updateEnhet(action: EnhetChanged) {
    const props: ContextvalueState<any> = yield selectFromInitializedState((state) => state.enhet);
    if (isEnabled(props)) {
        yield* forkApiWithErrorhandling(
            PredefiniertFeilmeldinger.OPPDATER_ENHET_CONTEXT_FEILET,
            Api.oppdaterAktivEnhet,
            action.data
        );
        yield* updateEnhetValue(MaybeCls.of(action.data));
        yield spawn(props.onChange, action.data);
    }
}
