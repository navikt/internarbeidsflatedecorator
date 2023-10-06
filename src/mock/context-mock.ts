import { rest, RestHandler, RestRequest } from 'msw';
import { FailureConfig } from './mock-error-config';
import { urlPrefix } from './index';
// import './mock.css';

function controlSignal(data: object | string) {
    return JSON.stringify({ type: 'control', data });
}

function updateContext(body: object) {
    fetch(urlPrefix + '/modiacontextholder/api/context?fromMock', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).catch((error) => {
        console.error(error);
    });
}

function setupControls() {
    const controlDiv = document.createElement('footer');
    controlDiv.id = 'mock-control';
    controlDiv.style.position = 'absolute';
    controlDiv.style.bottom = '0px';
    controlDiv.style.width = 'calc(100% - 4rem)';
    controlDiv.style.marginLeft = '2rem';

    const header = document.createElement('h1');
    header.innerText = 'Controls';
    controlDiv.appendChild(header);

    const buttonDiv = document.createElement('div');

    const guttButton = document.createElement('button');
    guttButton.innerText = 'Sendt FNR 01011950120 (gutt)';
    guttButton.addEventListener('click', () =>
        updateContext({ verdi: '01011950120', eventType: 'NY_AKTIV_BRUKER' })
    );

    const jenteButton = document.createElement('button');
    jenteButton.innerText = 'Sendt FNR 01011950201 (jente)';
    jenteButton.addEventListener('click', () =>
        updateContext({ verdi: '01011950201', eventType: 'NY_AKTIV_BRUKER' })
    );

    const barumEnhet = document.createElement('button');
    barumEnhet.innerText = 'Sendt ENHET 0219';
    barumEnhet.addEventListener('click', () =>
        updateContext({ verdi: '0219', eventType: 'NY_AKTIV_ENHET' })
    );

    const aremarkEnhet = document.createElement('button');
    aremarkEnhet.innerText = 'Sendt ENHET 0118';
    aremarkEnhet.addEventListener('click', () =>
        updateContext({ verdi: '0118', eventType: 'NY_AKTIV_ENHET' })
    );

    const updateFnr = document.createElement('button');
    updateFnr.innerText = 'App update Fnr 01011950120 (gutt)';
    updateFnr.addEventListener('click', () =>
        (window as any).renderDecorator({ fnr: '01011950120' })
    );

    const updateFnrNull = document.createElement('button');
    updateFnrNull.innerText = 'App update Fnr null';
    updateFnrNull.addEventListener('click', () => (window as any).renderDecorator({ fnr: null }));

    const clearBothLogs = document.createElement('button');
    clearBothLogs.innerText = 'Clear both logs';
    clearBothLogs.addEventListener('click', () => {
        const wsTextarea = document.getElementById('mock-control__ws-log')! as HTMLTextAreaElement;
        const contextTextarea = document.getElementById(
            'mock-control__context-log'
        )! as HTMLTextAreaElement;
        wsTextarea.value = '';
        contextTextarea.value = '';
    });

    buttonDiv.appendChild(guttButton);
    buttonDiv.appendChild(jenteButton);
    buttonDiv.appendChild(barumEnhet);
    buttonDiv.appendChild(aremarkEnhet);
    buttonDiv.appendChild(updateFnr);
    buttonDiv.appendChild(updateFnrNull);
    buttonDiv.appendChild(clearBothLogs);

    controlDiv.appendChild(buttonDiv);

    const logs = document.createElement('div');
    logs.id = 'mock-control__logs';
    logs.style.display = 'flex';
    controlDiv.appendChild(logs);

    const wsLog = document.createElement('div');
    wsLog.id = 'mock-control__ws-log-container';
    wsLog.style.flex = '1';
    logs.appendChild(wsLog);

    const wsLogHeader = document.createElement('h2');
    wsLogHeader.id = 'mock-control_ws-log-header';
    wsLogHeader.innerText = 'WS log';

    const wsLogClear = document.createElement('button');
    wsLogClear.id = 'mock-control_ws-log-clear';
    wsLogClear.innerText = 'Clear';
    wsLogClear.addEventListener('click', () => {
        const textarea = document.getElementById('mock-control__ws-log')! as HTMLTextAreaElement;
        textarea.value = '';
    });
    wsLogHeader.appendChild(wsLogClear);

    const WStextarea = document.createElement('textarea');
    WStextarea.id = 'mock-control__ws-log';
    WStextarea.style.width = '100%';
    WStextarea.style.height = '20rem';
    WStextarea.setAttribute('aria-labelledby', 'mock-control_ws-log-header');
    wsLog.appendChild(wsLogHeader);
    wsLog.appendChild(WStextarea);

    const contextLog = document.createElement('div');
    contextLog.id = 'mock-control__context-log-container';
    contextLog.style.flex = '1';
    logs.appendChild(contextLog);

    const contextLogHeader = document.createElement('h2');
    contextLogHeader.id = 'mock-control_context-log-header';
    contextLogHeader.innerText = 'Contextholder log';

    const contextLogClear = document.createElement('button');
    contextLogClear.id = 'mock-control_context-log-clear';
    contextLogClear.innerText = 'Clear';
    contextLogClear.addEventListener('click', () => {
        const textarea = document.getElementById(
            'mock-control__context-log'
        )! as HTMLTextAreaElement;
        textarea.value = '';
    });
    contextLogHeader.appendChild(contextLogClear);

    const contextTextarea = document.createElement('textarea');
    contextTextarea.id = 'mock-control__context-log';
    contextTextarea.style.width = '100%';
    contextTextarea.style.height = '20rem';
    contextTextarea.setAttribute('aria-labelledby', 'mock-control_context-log-header');

    contextLog.appendChild(contextLogHeader);
    contextLog.appendChild(contextTextarea);

    document.body.appendChild(controlDiv);
}

function addWSLogEntry() {
    return (message: MessageEvent) => {
        const textarea = document.getElementById('mock-control__ws-log')! as HTMLTextAreaElement;
        const now = new Date().toLocaleTimeString('en-GB');

        if (['NY_AKTIV_ENHET', 'NY_AKTIV_BRUKER'].includes(message.data)) {
            fetch(urlPrefix + '/modiacontextholder/api/context?fromMock')
                .then((resp) => resp.json())
                .then((json) => {
                    textarea.value = `${now} ${message.data}\n(${JSON.stringify(json)})\n${
                        textarea.value
                    }`;
                })
                .catch(() => {});
        }
    };
}

function addContextholderLogEntry(req: RestRequest, message: string) {
    if (!req.url.searchParams.get('fromMock')) {
        const textarea = document.getElementById(
            'mock-control__context-log'
        )! as HTMLTextAreaElement;
        const now = new Date().toLocaleTimeString('en-GB');

        const current = textarea.value;
        const newEntry = `${now} ${message}`;
        textarea.value = `${newEntry}\n${current}`;
    }
}

type Context = { aktivEnhet: string | null; aktivBruker: string | null };
const context: Context = { aktivEnhet: '0118', aktivBruker: '10108000398' };

export function setupWsControlAndMock(errorConfig: FailureConfig): RestHandler[] {
    let handlers: RestHandler[] = [];
    if (window.location.hostname.includes('localhost')) {
        // setupControls();
        const ws = new WebSocket('ws://localhost:2999/hereIsWS');

        ws.addEventListener('message', addWSLogEntry());

        handlers = [
            rest.post(urlPrefix + '/modiacontextholder/api/context', async (req, res, ctx) => {
                const queryParams = req.url.searchParams;
                const body = await req.json();
                const isRealCall = queryParams.get('fromMock') === undefined;

                if (body.eventType === 'NY_AKTIV_ENHET') {
                    if (isRealCall && errorConfig.contextholder.updateEnhet) {
                        return res(ctx.status(500));
                    }
                    context.aktivEnhet = body.verdi;
                    ws.send(controlSignal('NY_AKTIV_ENHET'));
                    addContextholderLogEntry(req, `POST NY_AKTIV_ENHET ${body.verdi}`);
                    return res(ctx.status(200));
                } else if (body.eventType === 'NY_AKTIV_BRUKER') {
                    if (isRealCall && errorConfig.contextholder.updateBruker) {
                        return res(ctx.status(500));
                    }
                    context.aktivBruker = body.verdi;
                    ws.send(controlSignal('NY_AKTIV_BRUKER'));
                    addContextholderLogEntry(req, `POST NY_AKTIV_BRUKER ${body.verdi}`);
                    return res(ctx.status(200));
                } else {
                    addContextholderLogEntry(req, `POST UKJENT_ENDEPUNKT`);
                    return res(ctx.status(500));
                }
            }),
            rest.delete(
                urlPrefix + '/modiacontextholder/api/context/aktivenhet',
                (req, res, ctx) => {
                    if (errorConfig.contextholder.deleteEnhet) {
                        return res(ctx.status(500));
                    }
                    context.aktivEnhet = null;
                    ws.send(controlSignal('NY_AKTIV_ENHET'));
                    addContextholderLogEntry(req, `DELETE NY_AKTIV_ENHET`);
                    return res(ctx.status(200));
                }
            ),
            rest.delete(
                urlPrefix + '/modiacontextholder/api/context/aktivbruker',
                (req, res, ctx) => {
                    if (errorConfig.contextholder.deleteBruker) {
                        return res(ctx.status(500));
                    }
                    context.aktivBruker = null;
                    ws.send(controlSignal('NY_AKTIV_BRUKER'));
                    addContextholderLogEntry(req, `DELETE NY_AKTIV_BRUKER`);
                    return res(ctx.status(200));
                }
            )
        ];
    }

    handlers = [
        ...handlers,
        rest.get(urlPrefix + '/modiacontextholder/api/context/aktivenhet', (req, res, ctx) => {
            if (errorConfig.contextholder.getEnhet) {
                return res(ctx.status(500));
            }
            addContextholderLogEntry(req, `GET NY_AKTIV_ENHET ${context.aktivEnhet || '<null>'}`);
            return res(
                ctx.status(200),
                ctx.json({
                    aktivEnhet: context.aktivEnhet,
                    aktivBruker: null
                })
            );
        }),
        rest.get(urlPrefix + '/modiacontextholder/api/context/aktivbruker', (req, res, ctx) => {
            if (errorConfig.contextholder.getBruker) {
                return res(ctx.status(500));
            }
            addContextholderLogEntry(req, `GET NY_AKTIV_BRUKER ${context.aktivBruker || '<null>'}`);
            return res(
                ctx.status(200),
                ctx.json({
                    aktivEnhet: null,
                    aktivBruker: context.aktivBruker
                })
            );
        }),
        rest.get(urlPrefix + '/modiacontextholder/api/context', (req, res, ctx) => {
            const isRealCall = req.url.searchParams.get('fromMock') === undefined;
            if (isRealCall && errorConfig.contextholder.get) {
                return res(ctx.status(500));
            }
            addContextholderLogEntry(req, `GET BOTH\n${JSON.stringify(context)}`);
            return res(
                ctx.status(200),
                ctx.json({
                    aktivEnhet: context.aktivEnhet,
                    aktivBruker: context.aktivBruker
                })
            );
        })
    ];
    return handlers;
}
