import { MaybeCls } from '@nutgaard/maybe-ts';
import { urls } from './api';
import { AktivBruker } from '../internal-domain';
import { State } from './index';
import { RecursivePartial } from './utils';
import { run } from './saga-test-utils';
import { hentAktorId } from './fnr-update-sagas';
import { rest } from 'msw';
import { handlers, urlPrefix } from '../mock';
import { MatcherUtils, setSpy, spyMiddleware } from '../mock/mockUtils';
import { setupServer } from 'msw/node';

const MOCK_FNR_1 = '16012050147';
const MOCK_AKTOR_ID = '00016012050147000';
const FAILING_MOCK_FNR_1 = '07860198775';

const worker = setupServer(...handlers);

function setupContextHolderMock() {
    worker.use(
        rest.get(
            urlPrefix + `/modiacontextholder/api/decorator/aktor/${FAILING_MOCK_FNR_1}`,
            (_, res, ctx) => res(ctx.status(500))
        )
    );
    worker.use(
        rest.get(
            urlPrefix + `/modiacontextholder/api/decorator/aktor/${MOCK_FNR_1}`,
            (_, res, ctx) =>
                res(
                    ctx.json({
                        aktorId: MOCK_AKTOR_ID
                    })
                )
        )
    );
}

type ContextholderValue = AktivBruker;

interface Context {
    contextholder: ContextholderValue;
}

function gittInitialState(fnr?: string | null): RecursivePartial<State> {
    return {
        appdata: {
            initialized: true,
            fnr: {
                enabled: true,
                value: fnr ? MaybeCls.just(fnr) : MaybeCls.nothing()
            },
            data: {
                aktorId: MaybeCls.nothing()
            }
        }
    };
}

describe('Saga: hentAktorId', () => {
    let spy: ReturnType<typeof spyMiddleware>;
    const context: Context = { contextholder: { aktivBruker: null } };

    beforeAll(() => {
        setupContextHolderMock();
        worker.listen();
    });

    beforeEach(() => {
        spy = spyMiddleware();
        setSpy(worker, spy);
        context.contextholder.aktivBruker = null;
    });

    it('henter aktorId for fnr', async () => {
        const state = gittInitialState(MOCK_FNR_1);
        const dispatched = await run(hentAktorId as any, state);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/AKTORIDDATA',
            data: {
                aktorId: MOCK_AKTOR_ID
            }
        });
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktorIdUrl(MOCK_FNR_1)))).toBeTruthy();
    });

    it('klarer ikke å hente aktorId, viser feilmelding', async () => {
        const state = gittInitialState(FAILING_MOCK_FNR_1);
        const dispatched = await run(hentAktorId as any, state);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/FEILMELDING/LEGG_TIL',
            data: {
                kode: 'A400',
                melding: 'Kunne ikke hente aktør-identifikator for bruker'
            }
        });
        expect(spy.size()).toBe(1);
        expect(spy.called(MatcherUtils.get(urls.aktorIdUrl(FAILING_MOCK_FNR_1)))).toBeTruthy();
    });

    it('nullstiller aktorId når fnr er null', async () => {
        const state = gittInitialState();
        const dispatched = await run(hentAktorId as any, state);
        expect(dispatched[0]).toMatchObject({
            type: 'REDUX/AKTORIDDATA',
            data: null
        });
        expect(spy.size()).toBe(0);
    });
});
