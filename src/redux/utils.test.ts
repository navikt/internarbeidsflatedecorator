import { callApiWithErrorhandling, forkApiWithErrorhandling } from './utils';
import { run } from './saga-test-utils';
import { PredefiniertFeilmeldinger } from './feilmeldinger/domain';
import { put } from 'redux-saga/effects';
import { leggTilFeilmelding } from './feilmeldinger/reducer';
import { Saga } from 'redux-saga';

const dummyAsyncCall = (config: { ms: number; error: boolean }) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: undefined, error: config.error ? 'error' : undefined });
        }, config.ms);
    });

describe('api with error handling', () => {
    it('forkApiWithErrorhandling ved feil', async () => {
        const dispatched = await run(function* () {
            yield* forkApiWithErrorhandling(
                PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET,
                dummyAsyncCall,
                { ms: 20, error: true }
            );
            yield put({ type: 'DUMMY' });
        }, undefined);

        expect(dispatched).toHaveLength(2);
        expect(dispatched[0]).toMatchObject({
            type: 'DUMMY'
        });
        expect(dispatched[1]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET)
        );
    });

    it('forkApiWithErrorhandling uten feil', async () => {
        const dispatched = await run(function* () {
            yield* forkApiWithErrorhandling(
                PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET,
                dummyAsyncCall,
                { ms: 20, error: false }
            );
            yield put({ type: 'DUMMY' });
        }, undefined);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject({
            type: 'DUMMY'
        });
    });

    it('callApiWithErrorhandling med feil', async () => {
        const dispatched = await run(
            function* () {
                yield* callApiWithErrorhandling(
                    PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET,
                    dummyAsyncCall,
                    { ms: 20, error: true }
                );
                yield put({ type: 'DUMMY' });
            } as Saga,
            undefined
        );

        expect(dispatched).toHaveLength(2);
        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET)
        );
        expect(dispatched[1]).toMatchObject({
            type: 'DUMMY'
        });
    });

    it('callApiWithErrorhandling uten feil', async () => {
        const dispatched = await run(
            function* () {
                yield* callApiWithErrorhandling(
                    PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET,
                    dummyAsyncCall,
                    { ms: 20, error: false }
                );
                yield put({ type: 'DUMMY' });
            } as Saga,
            undefined
        );

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject({
            type: 'DUMMY'
        });
    });
});
