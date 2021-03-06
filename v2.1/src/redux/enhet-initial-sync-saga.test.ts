import FetchMock, { MatcherUrl, MatcherUtils, SpyMiddleware } from 'yet-another-fetch-mock';
import { MaybeCls } from '@nutgaard/maybe-ts';
import initialSyncEnhet from './enhet-initial-sync-saga';
import { urls, ContextApiType } from './api';
import { AktivBruker, AktivEnhet, AktorIdResponse, Enhet, Saksbehandler } from '../internal-domain';
import { EnhetContextvalue, EnhetDisplay } from '../domain';
import { RecursivePartial } from './utils';
import { State } from './index';
import { leggTilFeilmelding } from './feilmeldinger/reducer';
import { PredefiniertFeilmeldinger } from './feilmeldinger/domain';
import { run } from './saga-test-utils';

const mockSaksbehandler: Omit<Saksbehandler, 'enheter'> = {
    ident: '',
    navn: '',
    fornavn: '',
    etternavn: ''
};

function gittGyldigeEnheter(enheter: Array<Enhet>): RecursivePartial<State> {
    const data = {
        aktorId: MaybeCls.nothing<AktorIdResponse>(),
        saksbehandler: MaybeCls.just({ ...mockSaksbehandler, enheter })
    };
    return {
        appdata: {
            initialized: true,
            enhet: {
                enabled: true,
                value: MaybeCls.nothing(),
                wsRequestedValue: MaybeCls.nothing(),
                display: EnhetDisplay.ENHET_VALG,
                showModal: false,
                onChange(): void {},
                skipModal: false,
                ignoreWsEvents: false
            },
            data
        }
    };
}

function gittOnsketEnhet(enhet: string | null): EnhetContextvalue {
    return {
        initialValue: enhet,
        onChange: jest.fn(),
        display: EnhetDisplay.ENHET
    };
}

function gittContextholder(context: Context, aktiveContext: ContextholderValue) {
    context.contextholder.aktivBruker = aktiveContext.aktivBruker;
    context.contextholder.aktivEnhet = aktiveContext.aktivEnhet;
    context.mock.get('/modiacontextholder/api/context/aktivenhet', (req, res, ctx) =>
        res(
            ctx.json({
                aktivEnhet: aktiveContext.aktivEnhet,
                aktivBruker: null
            })
        )
    );
    context.mock.get('/modiacontextholder/api/context/aktivbruker', (req, res, ctx) =>
        res(
            ctx.json({
                aktivEnhet: null,
                aktivBruker: aktiveContext.aktivBruker
            })
        )
    );
    context.mock.delete('/modiacontextholder/api/context/aktivbruker', (req, res, ctx) => {
        context.contextholder.aktivBruker = null;
        return res(ctx.status(200));
    });
    context.mock.post('/modiacontextholder/api/context', ({ body }, res, ctx) => {
        const { verdi, eventType } = body;
        if (eventType === ContextApiType.NY_AKTIV_BRUKER) {
            context.contextholder.aktivBruker = verdi;
        } else {
            context.contextholder.aktivEnhet = verdi;
        }
        return res(ctx.status(200));
    });
}

type ContextholderValue = AktivEnhet & AktivBruker;

interface Context {
    mock: FetchMock;
    spy: SpyMiddleware;
    contextholder: ContextholderValue;
}

describe('saga - root', () => {
    const spy = new SpyMiddleware();
    const mock = FetchMock.configure({
        middleware: spy.middleware
    });
    const context: Context = { mock, spy, contextholder: { aktivBruker: null, aktivEnhet: null } };

    beforeEach(() => {
        mock.reset();
        spy.reset();
        context.contextholder.aktivEnhet = null;
        context.contextholder.aktivBruker = null;
    });

    it('onsketEnhet: null, gyldigeEnheter: [], aktivEnhet: null => gi feilmelding (nullstill contextholder)', async () => {
        const state = gittGyldigeEnheter([]);
        const props = gittOnsketEnhet(null);
        gittContextholder(context, { aktivEnhet: null, aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET)
        );

        expect(props.onChange).toBeCalledTimes(0);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.del(urls.aktivBrukerUrl as MatcherUrl))).toBeTruthy();
        expect(context.contextholder.aktivEnhet).toBe(null);
    });

    it('onsketEnhet: null, gyldigeEnheter: [], aktivEnhet: 1234 => gi feilmelding (nullstill contextholder)', async () => {
        const state = gittGyldigeEnheter([]);
        const props = gittOnsketEnhet(null);
        gittContextholder(context, { aktivEnhet: null, aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET)
        );

        expect(props.onChange).toBeCalledTimes(0);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.del(urls.aktivBrukerUrl as MatcherUrl))).toBeTruthy();
        expect(context.contextholder.aktivEnhet).toBe(null);
    });

    it('onsketEnhet: null, gyldigeEnheter: [1234, 1235], aktivEnhet: null => velg 1234 (oppdater contextholder og onEnhetChange)', async () => {
        const state = gittGyldigeEnheter([
            { navn: 'test', enhetId: '1234' },
            { navn: 'test2', enhetId: '1235' }
        ]);
        const props = gittOnsketEnhet(null);
        gittContextholder(context, { aktivEnhet: null, aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { enhet: { value: MaybeCls.just('1234') } }
        });

        expect(props.onChange).toBeCalledWith('1234');
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.post(urls.contextUrl as MatcherUrl))).toBeTruthy();
        expect(context.contextholder.aktivEnhet).toBe('1234');
    });

    it('onsketEnhet: null, gyldigeEnheter: [1234, 1235], aktivEnhet: 1235 => velg 1235 (onEnhetChange)', async () => {
        const state = gittGyldigeEnheter([
            { navn: 'test', enhetId: '1234' },
            { navn: 'test2', enhetId: '1235' }
        ]);
        const props = gittOnsketEnhet(null);
        gittContextholder(context, { aktivEnhet: '1235', aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { enhet: { value: MaybeCls.just('1235') } }
        });

        expect(props.onChange).toBeCalledWith('1235');
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.post(urls.contextUrl as MatcherUrl))).toBeFalsy();
        expect(context.contextholder.aktivEnhet).toBe('1235');
    });

    it('onsketEnhet: 1234, gyldigeEnheter: [], aktivEnhet: null => gi feilmelding (nullstill contextholder)', async () => {
        const state = gittGyldigeEnheter([]);
        const props = gittOnsketEnhet('1234');
        gittContextholder(context, { aktivEnhet: null, aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET)
        );
        expect(props.onChange).toBeCalledTimes(0);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.del(urls.aktivBrukerUrl as MatcherUrl))).toBeTruthy();
        expect(context.contextholder.aktivEnhet).toBe(null);
    });

    it('onsketEnhet: 1234, gyldigeEnheter: [], aktivEnhet: 1234 => gi feilmelding (nullstill contextholder)', async () => {
        const state = gittGyldigeEnheter([]);
        const props = gittOnsketEnhet('1234');
        gittContextholder(context, { aktivEnhet: null, aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET)
        );
        expect(props.onChange).toBeCalledTimes(0);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.del(urls.aktivBrukerUrl as MatcherUrl))).toBeTruthy();
        expect(context.contextholder.aktivEnhet).toBe(null);
    });

    it('onsketEnhet: 1235, gyldigeEnheter: [1234, 1235], aktivEnhet: null => velg enhet2 (oppdater contextholder og onEnhetChange)', async () => {
        const state = gittGyldigeEnheter([
            { navn: 'test', enhetId: '1234' },
            { navn: 'test2', enhetId: '1235' }
        ]);
        const props = gittOnsketEnhet('1235');
        gittContextholder(context, { aktivEnhet: null, aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { enhet: { value: MaybeCls.just('1235') } }
        });
        expect(props.onChange).toBeCalledTimes(1);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.post(urls.contextUrl as MatcherUrl))).toBeTruthy();
        expect(context.contextholder.aktivEnhet).toBe('1235');
    });

    it('onsketEnhet: 1234, gyldigeEnheter: [1234, 1235], aktivEnhet: 1234 => bruk onsket enhet (onEnhetChange)', async () => {
        const state = gittGyldigeEnheter([
            { navn: 'test', enhetId: '1234' },
            { navn: 'test2', enhetId: '1235' }
        ]);
        const props = gittOnsketEnhet('1234');
        gittContextholder(context, { aktivEnhet: '1234', aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { enhet: { value: MaybeCls.just('1234') } }
        });
        expect(props.onChange).toBeCalledTimes(1);
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.post(urls.contextUrl as MatcherUrl))).toBeFalsy();
        expect(context.contextholder.aktivEnhet).toBe('1234');
    });

    it('onsketEnhet: 1235, gyldigeEnheter: [1234, 1235], aktivEnhet: 1234 => bruk onsket enhet (oppdater contextholder og onEnhetChange)', async () => {
        const state = gittGyldigeEnheter([
            { navn: 'test', enhetId: '1234' },
            { navn: 'test2', enhetId: '1235' }
        ]);
        const props = gittOnsketEnhet('1235');
        gittContextholder(context, { aktivEnhet: '1234', aktivBruker: null });

        const dispatched = await run(initialSyncEnhet, state, props);

        expect(dispatched).toHaveLength(1);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { enhet: { value: MaybeCls.just('1235') } }
        });
        expect(props.onChange).toBeCalledTimes(1);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivEnhetUrl as MatcherUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.post(urls.contextUrl as MatcherUrl))).toBeTruthy();
        expect(context.contextholder.aktivEnhet).toBe('1235');
    });
});
