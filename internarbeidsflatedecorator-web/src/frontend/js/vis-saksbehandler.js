import { fetchToJson } from './rest-utils';

const VEILEDER_URL = `/veilarbveileder/tjenester/veileder`;

const visSaksbehandler = (data) => {
    if (!data.navn || !data.ident) {
        return;
    }
    document.getElementById('js-dekorator-saksbehandler-navn').innerHTML = data.navn;
    document.getElementById('js-dekorator-saksbehandler-ident').innerHTML = `(${data.ident})`;
};

const visEnhet = (data) => {
    if (!data.enhetliste || data.enhetliste.length === 0 || !data.enhetliste[0].navn) {
        return;
    }
    document.getElementById('js-dekorator-enhet-navn').innerHTML = data.enhetliste[0].navn;
};

const handterFeil = (error) => {
    console.error(error, error.stack); //eslint-disable-line no-console
};

export const hentSaksbehandler = () => {
    return fetchToJson(`${VEILEDER_URL}/me`)
        .then(
            visSaksbehandler,
            handterFeil
        );
};

export const hentEnheter = () => {
    return fetchToJson(`${VEILEDER_URL}/enheter`)
        .then(
            visEnhet,
            handterFeil
        );
};

