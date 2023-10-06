import { MockedRequest, SetupWorker } from 'msw';
import { SetupServer } from 'msw/node';

export const spyMiddleware = () => {
    const requests = [] as MockedRequest[];
    return {
        requests,
        size: () => requests.length,
        called: (isMatching: (req: MockedRequest) => boolean) =>
            requests.some((req) => isMatching(req))
    };
};
export const setSpy = (worker: SetupServer | SetupWorker, spy: { requests: MockedRequest[] }) => {
    (worker as SetupWorker).events.on('request:start', (req) => {
        spy.requests.push(req);
    });
};

export const MatcherUtils = {
    del: (urlString: string) => (req: MockedRequest) => {
        const url = new URL(urlString);
        return req.method === 'DELETE' && req.url.pathname === url.pathname;
    },
    get: (urlString: string) => (req: MockedRequest) => {
        const url = new URL(urlString);
        return req.method === 'GET' && req.url.pathname === url.pathname;
    },
    post: (urlString: string) => (req: MockedRequest) => {
        const url = new URL(urlString);
        return req.method === 'POST' && req.url.pathname === url.pathname;
    }
};
