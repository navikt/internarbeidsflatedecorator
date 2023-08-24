import { MaybeCls } from '@nutgaard/maybe-ts';
import { lagFnrFeilmelding } from '../utils/fnr-utils';
import { finnMiljoStreng, hentMiljoFraUrl, UrlFormat } from '../utils/url-utils';
import { AktivBruker, AktivEnhet, AktorIdResponse, Saksbehandler } from '../internal-domain';
import failureConfig from './../mock/mock-error-config';
import { ProxyConfig } from '../domain';
import { globalMutableApplicationConfig } from '../application';

export enum ContextApiType {
    NY_AKTIV_ENHET = 'NY_AKTIV_ENHET',
    NY_AKTIV_BRUKER = 'NY_AKTIV_BRUKER'
}

let accessToken: MaybeCls<string> = MaybeCls.nothing();
export function setAccessToken(token?: string) {
    accessToken = MaybeCls.of(token);
}
export function setUseProxy(proxyConfig: ProxyConfig) {
    urls = lagUrls(proxyConfig);
}

export function lagModiacontextholderUrl(proxyConfig: ProxyConfig = false): string {
    const urlEnv = hentMiljoFraUrl();
    const envString = urlEnv.envclass === 'p' ? '' : `-${urlEnv.environment}`;

    if (typeof proxyConfig === 'string') {
        return `${proxyConfig}/modiacontextholder`;
    } else if (proxyConfig) {
        return '/modiacontextholder';
    }

    switch (urlEnv.urlformat) {
        case UrlFormat.ADEO:
            return `https://app${envString}.adeo.no/modiacontextholder`;
        case UrlFormat.NAIS:
            if (urlEnv.envclass === 'p') {
                return 'https://modiacontextholder.nais.adeo.no/modiacontextholder';
            } else {
                return `https://modiacontextholder${envString}.nais.preprod.local/modiacontextholder`;
            }
        case UrlFormat.DEV_ADEO:
            return `https://app${envString}.dev.adeo.no/modiacontextholder`;
        case UrlFormat.NAV_NO:
            if (urlEnv.envclass === 'p') {
                return 'https://modiacontextholder.intern.nav.no/modiacontextholder';
            } else {
                return `https://modiacontextholder${envString}.intern.dev.nav.no/modiacontextholder`;
            }
        case UrlFormat.LOCAL:
            return '/modiacontextholder';
    }
}
function lagUrls(proxyConfig: ProxyConfig) {
    const modiacontextholderUrl = lagModiacontextholderUrl(proxyConfig);
    return {
        aktivEnhetUrl: `${modiacontextholderUrl}/api/context/aktivenhet`,
        aktivBrukerUrl: `${modiacontextholderUrl}/api/context/aktivbruker`,
        contextUrl: `${modiacontextholderUrl}/api/context`,
        saksbehandlerUrl: `${modiacontextholderUrl}/api/decorator`,
        aktorIdUrl: (fnr: string) => `${modiacontextholderUrl}/api/decorator/aktor/${fnr}`
    };
}
export let urls = lagUrls(false);

export type ResponseError = { data: undefined; error: string };
export type ResponseOk<T> = { data: T; error: undefined };
export type FetchResponse<T> = ResponseOk<T> | ResponseError;

const navConsumerIdHeaderName = 'Nav-Consumer-Id';
const defaultHeaders = (): HeadersInit => {
    const consumerId = globalMutableApplicationConfig.consumerId;
    if (consumerId) {
        return {
            [navConsumerIdHeaderName]: consumerId
        };
    }
    return {};
};

function withAccessToken(request?: RequestInit): RequestInit | undefined {
    const authHeader = accessToken
        .map((token) => ({ Authorization: `Bearer ${token}` }))
        .getOrElse({});

    const headers: HeadersInit = (request && request.headers) || {};
    const newHeaders = { ...defaultHeaders(), ...headers, ...authHeader };
    return {
        ...(request || {}),
        headers: newHeaders,
        credentials: 'include'
    };
}

export function hasError<T>(response: FetchResponse<T>): response is ResponseError {
    return response.error !== undefined;
}

async function doFetch(url: RequestInfo, options?: RequestInit): Promise<Response> {
    return await fetch(url, withAccessToken(options));
}

export async function getJson<T>(info: RequestInfo, init?: RequestInit): Promise<FetchResponse<T>> {
    try {
        const response: Response = await doFetch(info, init);
        if (response.status > 299) {
            const content = await response.text();
            return { data: undefined, error: content };
        }
        const data: T = await response.json();
        return { data, error: undefined };
    } catch (error) {
        return { data: undefined, error };
    }
}

async function postJson<T>(url: string, body: T, options?: RequestInit): Promise<FetchResponse<T>> {
    try {
        const response: Response = await doFetch(url, {
            ...(options || {}),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (response.status > 299) {
            const content = await response.text();
            return { data: undefined, error: content };
        }
        return { data: body, error: undefined };
    } catch (error) {
        return { data: undefined, error };
    }
}

async function deleteJson(url: string, options?: RequestInit): Promise<FetchResponse<undefined>> {
    try {
        const response: Response = await doFetch(url, {
            ...(options || {}),
            method: 'DELETE'
        });
        if (response.status > 299) {
            const content = await response.text();
            return { data: undefined, error: content };
        }
        return { data: undefined, error: undefined };
    } catch (error) {
        return { data: undefined, error };
    }
}

export function hentAktorId(fnr: string): Promise<FetchResponse<AktorIdResponse>> {
    const feilmelding = lagFnrFeilmelding(fnr);

    if (feilmelding.isJust()) {
        return Promise.reject('Ugyldig fødselsnummer, kan ikke hente aktørId');
    }

    return getJson<AktorIdResponse>(urls.aktorIdUrl(fnr));
}

export function logError(message: string, extra: { [key: string]: string }) {
    const error = {
        message: message,
        url: document.URL,
        ...extra
    };

    console.error(error);
    if (window.frontendlogger) {
        window.frontendlogger.error(error);
    }
}

export function oppdaterAktivBruker(fnr: string | null | undefined) {
    return postJson(urls.contextUrl, {
        verdi: fnr,
        eventType: ContextApiType.NY_AKTIV_BRUKER
    });
}

export function oppdaterAktivEnhet(enhet: string | null | undefined) {
    return postJson(urls.contextUrl, {
        verdi: enhet,
        eventType: ContextApiType.NY_AKTIV_ENHET
    });
}

export function nullstillAktivBruker() {
    return deleteJson(urls.aktivBrukerUrl).catch(() => {});
}

export function nullstillAktivEnhet() {
    return deleteJson(urls.aktivEnhetUrl).catch(() => {});
}

export function hentAktivBruker(): Promise<FetchResponse<AktivBruker>> {
    return getJson<AktivBruker>(urls.aktivBrukerUrl);
}

export function hentAktivEnhet(): Promise<FetchResponse<AktivEnhet>> {
    return getJson<AktivEnhet>(urls.aktivEnhetUrl);
}

export function hentSaksbehandlerData(): Promise<FetchResponse<Saksbehandler>> {
    return getJson<Saksbehandler>(urls.saksbehandlerUrl);
}

export function getWebSocketUrl(maybeSaksbehandler: MaybeCls<Saksbehandler>): string | null {
    if (process.env.REACT_APP_MOCK === 'true' && failureConfig.websocketConnection) {
        return 'ws://localhost:2999/hereIsWS/failure-url';
    } else if (process.env.NODE_ENV === 'development') {
        return 'ws://localhost:2999/hereIsWS';
    } else {
        return maybeSaksbehandler
            .map((saksbehandler) => saksbehandler.ident)
            .map((ident) => getVeilederflatehendelserUrl(ident))
            .withDefault(null);
    }
}

export function getVeilederflatehendelserUrl(ident: string) {
    let subdomain = hentMiljoFraUrl().envclass === 'dev' ? '.dev' : '';
    return `wss://veilederflatehendelser${finnMiljoStreng()}${subdomain}.adeo.no/modiaeventdistribution/ws/${ident}`;
}
