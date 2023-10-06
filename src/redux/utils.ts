import { Action } from 'redux';
import { fork, call, select, spawn, put } from 'redux-saga/effects';
import { InitializedState, isInitialized, State as AppdataState } from './reducer';
import { State } from './index';
import { Contextvalue, ControlledContextvalue } from '../domain';
import { PredefiniertFeilmelding } from './feilmeldinger/domain';
import { hasError } from './api';
import { leggTilFeilmelding } from './feilmeldinger/reducer';

export const RESET_VALUE = '\u0000';

export function* forkApiWithErrorhandling<Fn extends (...args: any[]) => any>(
    error: PredefiniertFeilmelding,
    fn: Fn,
    ...args: Parameters<Fn>
) {
    yield fork(function* () {
        yield callApiWithErrorhandling(error, fn, ...args);
    });
}

export function* callApiWithErrorhandling<Fn extends (...args: any[]) => any>(
    error: PredefiniertFeilmelding,
    fn: Fn,
    ...args: Parameters<Fn>
) {
    const result: ReturnType<Fn> = yield call(fn, ...args);
    if (hasError(result)) {
        yield put(leggTilFeilmelding(error));
    }
    return result;
}

export function* spawnConditionally<Fn extends (...args: any[]) => any>(
    callback?: Fn,
    ...args: Parameters<Fn>
) {
    if (callback) {
        yield spawn(callback, ...args);
    }
}

export function* selectFromInitializedState<T, Fn extends (state: InitializedState) => T>(
    selector: Fn
) {
    const state: AppdataState = yield select((state: State) => state.appdata);
    if (isInitialized(state)) {
        return selector(state);
    }
    throw new Error('Could not get data from state since it is not initialized yet.');
}

export function isContextvalueControlled<T>(
    contextValue?: Contextvalue<T>
): contextValue is ControlledContextvalue<T> {
    if (contextValue === undefined) {
        return false;
    }
    return (contextValue as any).value !== undefined;
}

export function getContextvalueValue(contextValue?: Contextvalue<any>): string | null {
    if (contextValue === undefined) {
        return null;
    } else if (isContextvalueControlled(contextValue)) {
        return contextValue.value;
    } else {
        return contextValue.initialValue;
    }
}

export interface DataAction<TYPE, DATA> extends Action<TYPE> {
    data: DATA;
}

export type Required<T> = {
    [P in keyof T]-?: T[P];
};

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
