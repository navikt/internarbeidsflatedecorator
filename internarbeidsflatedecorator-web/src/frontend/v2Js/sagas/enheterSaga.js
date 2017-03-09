import { call, put, fork } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';
import { get } from './api/index';
import * as actions from '../actions/enheter_actions';
import { HENT_ENHETER_FORESPURT } from '../actions/actiontyper';

export function* enheterSaga() {
    yield put(actions.henterEnheter());
    try {
        //TODO URL...mulig man må ha miljø som et parameter i config'en som sender til renderDecorator og så bruke den her
        //Kontekst-relative vil ikke fungere om klienten ligger på app-adeo.no/app
        const data = yield call(get, `https://modapp.adeo.no/enheterendepunktet/`);
        yield put(actions.enheterHentet(data));
    } catch (e) {
        yield put(actions.hentEnheterFeilet());
    }
}

function* watchHentEnheter() {
    yield* takeEvery(HENT_ENHETER_FORESPURT, enheterSaga);
}

export default function* enheterSagas() {
    yield [
        fork(watchHentEnheter),
    ];
}
