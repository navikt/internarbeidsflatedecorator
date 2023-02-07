import { call, put } from 'redux-saga/effects';
import { MaybeCls } from '@nutgaard/maybe-ts';
import * as Api from './api';
import { FetchResponse, hasError } from './api';
import { AktivBruker } from '../internal-domain';
import { lagFnrFeilmelding } from '../utils/fnr-utils';
import {
    getContextvalueValue,
    RESET_VALUE,
    spawnConditionally,
    forkApiWithErrorhandling,
    callApiWithErrorhandling
} from './utils';
import { FnrContextvalue } from '../domain';
import { updateFnrValue } from './fnr-update-sagas';
import { leggTilFeilmelding } from './feilmeldinger/reducer';
import { PredefiniertFeilmeldinger } from './feilmeldinger/domain';
import Logger from '../utils/Logger';

export default function* initialSyncFnr(props: FnrContextvalue) {
    Logger.log('Initial sync fnr', props);
    if (getContextvalueValue(props) === RESET_VALUE) {
        Logger.log('Initial sync fnr: Reset value');
        yield callApiWithErrorhandling(
            PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
            Api.nullstillAktivBruker
        );
    }

    const response: FetchResponse<AktivBruker> = yield call(Api.hentAktivBruker);
    Logger.log('Hent aktiv bruker slutt ', response.data);
    const onsketFnr = MaybeCls.of(getContextvalueValue(props))
        .map((fnr) => (fnr === RESET_VALUE ? '' : fnr))
        .map((fnr) => fnr.trim())
        .filter((fnr) => fnr.length > 0);
    const feilFnr = onsketFnr.flatMap(lagFnrFeilmelding);
    const contextholderFnr: MaybeCls<string> = MaybeCls.of(response.data)
        .flatMap((data) => MaybeCls.of(data.aktivBruker))
        .map((fnr) => fnr.trim())
        .filter((fnr) => fnr.length > 0);

    Logger.log(
        `Onsket fnr ${onsketFnr}, feil fnr ${feilFnr}, contextHolderFnr ${contextholderFnr}`
    );
    if (hasError(response)) {
        yield put(leggTilFeilmelding(PredefiniertFeilmeldinger.HENT_BRUKER_CONTEXT_FEILET));
    }

    if (feilFnr.isJust()) {
        const feilmelding = feilFnr.withDefault(PredefiniertFeilmeldinger.FNR_UKJENT_FEIL);
        yield put(leggTilFeilmelding(feilmelding));
    }

    if (onsketFnr.isJust() && feilFnr.isNothing()) {
        // Gyldig fnr via props, oppdaterer contextholder og kaller onSok med fnr
        const erUlikContextholderFnr =
            onsketFnr.withDefault('') !== contextholderFnr.withDefault('');
        if (erUlikContextholderFnr) {
            Logger.log(
                `Er ulik context holder fnr, ${onsketFnr.withDefault(
                    ''
                )} vs ${contextholderFnr.withDefault('')}`
            );
            yield* forkApiWithErrorhandling(
                PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
                Api.oppdaterAktivBruker,
                onsketFnr.withDefault('')
            );
        }
        Logger.log(`Oppdater fnr value til: ${onsketFnr}`);
        yield* updateFnrValue(onsketFnr);
        Logger.log(`Kaller onChange`);
        yield spawnConditionally(props.onChange, onsketFnr.withDefault(''));
    } else if (onsketFnr.isNothing() && contextholderFnr.isJust()) {
        // Ikke noe fnr via props, bruker fnr fra contextholder og kaller onSok med dette
        Logger.log(`Ikke noe fnr via props, henter fnr fra contextholder`);
        yield* updateFnrValue(contextholderFnr);
        Logger.log(`Kaller onChange`);
        yield spawnConditionally(props.onChange, contextholderFnr.withDefault(''));
    } else {
        Logger.log(`Oppdaterer fnr til onskerFnr: ${onsketFnr}`);
        yield* updateFnrValue(onsketFnr);
    }
}
