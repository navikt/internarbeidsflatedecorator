import { rest } from 'msw';
import { AktorIdResponse, Saksbehandler } from '../internal-domain';
import { setupWsControlAndMock } from './context-mock';
import failureConfig from './mock-error-config';

// const originalLoggingMiddleware = MiddlewareUtils.loggingMiddleware()
// const loggingMiddleWare: Middleware = (request, response) => {
//     if (request.url.endsWith('fromMock')) {
//         return response;
//     }
//     return originalLoggingMiddleware(request, response);
// };

// const mock = FetchMock.configure({
//     enableFallback: false,
//     middleware: MiddlewareUtils.combine(MiddlewareUtils.delayMiddleware(200), loggingMiddleWare)
// });

const me: Saksbehandler = {
    ident: 'Z999999',
    navn: 'Fornavn Ettersen',
    fornavn: 'Fornavn',
    etternavn: 'Ettersen',
    enheter: [
        { enhetId: '0219', navn: 'NAV Bærum' },
        { enhetId: '0118', navn: 'NAV Aremark' },
        { enhetId: '0604', navn: 'NAV Kongsberg' },
        { enhetId: '0602', navn: 'NAV Drammer' }
    ]
};

export const urlPrefix = 'http://localhost:8080';
const defaultHandlers = [
    rest.get(urlPrefix + '/modiacontextholder/api/decorator', (req, res, ctx) =>
        res(
            ctx.status(
                failureConfig.meEndpoint ? 500 : 200,
                failureConfig.meEndpoint ? 'Internal Server Error' : 'Ok'
            ),
            ctx.json(failureConfig.meEndpoint ? null : me)
        )
    ),
    rest.get(urlPrefix + '/modiacontextholder/api/decorator/aktor/:fnr', (req, res, ctx) => {
        const fnr = req.url.searchParams.get('fnr')!!;
        const data: AktorIdResponse = {
            fnr,
            aktorId: `000${fnr}000`
        };

        return res(
            ctx.status(
                failureConfig.aktorIdEndpoint ? 500 : 200,
                failureConfig.aktorIdEndpoint ? 'Internal Server Error' : 'Ok'
            ),
            ctx.json(failureConfig.aktorIdEndpoint ? null : data)
        );
    })
];

export const handlers = [...defaultHandlers, ...setupWsControlAndMock(failureConfig)];
