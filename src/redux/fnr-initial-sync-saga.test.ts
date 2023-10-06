import { MaybeCls } from '@nutgaard/maybe-ts';
import initialSyncFnr from './fnr-initial-sync-saga';
import { urls, ContextApiType } from './api';
import { FnrContextvalue, FnrDisplay } from '../domain';
import { AktivBruker, AktivEnhet } from '../internal-domain';
import { State } from './index';
import { RecursivePartial } from './utils';
import { PredefiniertFeilmeldinger } from './feilmeldinger/domain';
import { leggTilFeilmelding } from './feilmeldinger/reducer';
import { run } from './saga-test-utils';
import { rest } from 'msw';
import { handlers, urlPrefix } from '../mock';
import { MatcherUtils, setSpy, spyMiddleware } from '../mock/mockUtils';
import { setupServer } from 'msw/node';

function gittContextholder(
    context: Context,
    aktiveContext: AktivEnhet & AktivBruker,
    error: boolean = false
) {
    context.contextholder.aktivBruker = aktiveContext.aktivBruker;
    context.contextholder.aktivEnhet = aktiveContext.aktivEnhet;
    if (error) {
        const handlers = [
            rest.get(urlPrefix + '/modiacontextholder/api/context/aktivenhet', (_, res, ctx) =>
                res(ctx.status(500))
            ),
            rest.get(urlPrefix + '/modiacontextholder/api/context/aktivbruker', (_, res, ctx) =>
                res(ctx.status(500))
            ),
            rest.post(urlPrefix + '/modiacontextholder/api/context', (_, res, ctx) =>
                res(ctx.status(500))
            )
        ];
        worker.use(...handlers);
    } else {
        const handlers = [
            rest.get(urlPrefix + '/modiacontextholder/api/context/aktivenhet', (_, res, ctx) =>
                res(
                    ctx.json({
                        aktivEnhet: aktiveContext.aktivEnhet,
                        aktivBruker: null
                    })
                )
            ),
            rest.get(urlPrefix + '/modiacontextholder/api/context/aktivbruker', (req, res, ctx) =>
                res(
                    ctx.json({
                        aktivEnhet: null,
                        aktivBruker: aktiveContext.aktivBruker
                    })
                )
            ),
            rest.post(urlPrefix + '/modiacontextholder/api/context', async (req, res, ctx) => {
                const { verdi, eventType } = await req.json();
                if (eventType === ContextApiType.NY_AKTIV_BRUKER) {
                    context.contextholder.aktivBruker = verdi;
                } else {
                    context.contextholder.aktivEnhet = verdi;
                }
                return res(ctx.status(200));
            })
        ];
        worker.use(...handlers);
    }
}

type ContextholderValue = AktivEnhet & AktivBruker;

interface Context {
    contextholder: ContextholderValue;
}

function gittOnsketFnr(fnr: string | null): FnrContextvalue {
    return {
        initialValue: fnr,
        onChange: jest.fn(),
        display: FnrDisplay.SOKEFELT
    };
}

function gittInitialState(): RecursivePartial<State> {
    return {
        appdata: {
            initialized: true,
            fnr: {
                enabled: true,
                value: MaybeCls.nothing(),
                wsRequestedValue: MaybeCls.nothing(),
                display: FnrDisplay.SOKEFELT,
                showModal: false,
                onChange(): void {},
                skipModal: false,
                ignoreWsEvents: false
            }
        }
    };
}

const MOCK_FNR_1 = '16012050147';
const MOCK_FNR_2 = '19012050073';

const worker = setupServer(...handlers);

describe('saga - root', () => {
    let spy = spyMiddleware();
    setSpy(worker, spy);
    const context: Context = { contextholder: { aktivBruker: null, aktivEnhet: null } };

    beforeAll(() => {
        worker.listen();
    });

    beforeEach(() => {
        spy = spyMiddleware();
        setSpy(worker, spy);
        context.contextholder.aktivEnhet = null;
        context.contextholder.aktivBruker = null;
    });

    it('onsketFnr: null, aktivBruker: error => gi feilmelding og stateFnr: Nothing', async () => {
        const state = gittInitialState();
        const props = gittOnsketFnr(null);
        gittContextholder(context, { aktivBruker: null, aktivEnhet: null }, true);

        const dispatched = await run(initialSyncFnr as any, state, props);

        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.HENT_BRUKER_CONTEXT_FEILET)
        );
        expect(dispatched[1]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { fnr: { value: MaybeCls.nothing() } }
        });

        expect(props.onChange).toBeCalledTimes(0);
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktivBrukerUrl))).toBeTruthy();
    });

    it('onsketFnr: null, aktivBruker: null => stateFnr: Nothing', async () => {
        const state = gittInitialState();
        const props = gittOnsketFnr(null);
        gittContextholder(context, { aktivBruker: null, aktivEnhet: null });

        const dispatched = await run(initialSyncFnr as any, state, props);

        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { fnr: { value: MaybeCls.nothing() } }
        });
        expect(props.onChange).toBeCalledTimes(0);
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktivBrukerUrl))).toBeTruthy();
    });

    it(`onsketFnr: null, aktivBruker: ${MOCK_FNR_1} => stateFnr: Just(${MOCK_FNR_1})`, async () => {
        const state = gittInitialState();
        const props = gittOnsketFnr('');
        gittContextholder(context, { aktivBruker: MOCK_FNR_1, aktivEnhet: null });

        const dispatched = await run(initialSyncFnr as any, state, props);

        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { fnr: { value: MaybeCls.just(MOCK_FNR_1) } }
        });
        expect(props.onChange).toBeCalledTimes(1);
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktivBrukerUrl))).toBeTruthy();
    });

    it(`onsketFnr: ${MOCK_FNR_2}, aktivBruker: ${MOCK_FNR_1} => stateFnr: Just(${MOCK_FNR_2})`, async () => {
        const state = gittInitialState();
        const props = gittOnsketFnr(MOCK_FNR_2);
        gittContextholder(context, { aktivBruker: MOCK_FNR_1, aktivEnhet: null });

        const dispatched = await run(initialSyncFnr as any, state, props);

        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { fnr: { value: MaybeCls.just(MOCK_FNR_2) } }
        });
        expect(props.onChange).toBeCalledTimes(1);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivBrukerUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.post(urls.contextUrl))).toBeTruthy();
        expect(context.contextholder.aktivBruker).toBe(MOCK_FNR_2);
    });

    it(`onsketFnr: ${MOCK_FNR_1}, aktivBruker: ${MOCK_FNR_1} => stateFnr: Just(${MOCK_FNR_1}), ikke oppdater contextholder`, async () => {
        const state = gittInitialState();
        const props = gittOnsketFnr(MOCK_FNR_1);
        gittContextholder(context, { aktivBruker: MOCK_FNR_1, aktivEnhet: null });

        const dispatched = await run(initialSyncFnr as any, state, props);

        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { fnr: { value: MaybeCls.just(MOCK_FNR_1) } }
        });
        expect(props.onChange).toBeCalledTimes(1);
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktivBrukerUrl))).toBeTruthy();
        expect(context.contextholder.aktivBruker).toBe(MOCK_FNR_1);
    });

    it(`onsketFnr: invalid, aktivBruker: ${MOCK_FNR_1} => stateFnr: Just(invalid), ikke kall onChange eller oppdater contextholder`, async () => {
        const state = gittInitialState();
        const props = gittOnsketFnr('12345678910');
        gittContextholder(context, { aktivBruker: MOCK_FNR_1, aktivEnhet: null });

        const dispatched = await run(initialSyncFnr as any, state, props);

        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.FNR_KONTROLL_SIFFER)
        );
        expect(dispatched[1]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { fnr: { value: MaybeCls.just('12345678910') } }
        });
        expect(props.onChange).toBeCalledTimes(0);
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktivBrukerUrl))).toBeTruthy();
        expect(context.contextholder.aktivBruker).toBe(MOCK_FNR_1);
    });

    it(`onsketFnr: ${MOCK_FNR_1}, aktivBruker: error => stateFnr: Just(${MOCK_FNR_1})`, async () => {
        const state = gittInitialState();
        const props = gittOnsketFnr(MOCK_FNR_1);
        gittContextholder(context, { aktivBruker: MOCK_FNR_1, aktivEnhet: null }, true);

        const dispatched = await run(initialSyncFnr as any, state, props);

        expect(dispatched[0]).toMatchObject(
            leggTilFeilmelding(PredefiniertFeilmeldinger.HENT_BRUKER_CONTEXT_FEILET)
        );
        expect(dispatched[1]).toMatchObject({
            type: 'REDUX/UPDATESTATE',
            data: { fnr: { value: MaybeCls.just(MOCK_FNR_1) } }
        });
        expect(props.onChange).toBeCalledTimes(1);
        expect(spy.size()).toBe(2);
        expect(spy.called(MatcherUtils.get(urls.aktivBrukerUrl))).toBeTruthy();
        expect(spy.called(MatcherUtils.post(urls.contextUrl))).toBeTruthy();
        expect(context.contextholder.aktivBruker).toBe(MOCK_FNR_1);
    });
});
