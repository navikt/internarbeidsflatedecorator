import { finnMiljoStreng, finnNaisInternNavMiljoStreng, finnNaisMiljoStreng, NAIS_PREPROD_SUFFIX } from './sagas/util';
import { post } from './sagas/api';

const modappDomain = `https://modapp${finnMiljoStreng()}.adeo.no`;
const appDomain = `https://app${finnMiljoStreng()}.adeo.no`;
const naisDomain = `.nais.${finnNaisMiljoStreng()}`;
const naisInternNavDomain = `${finnNaisInternNavMiljoStreng()}.intern.nav.no`;
const frontendLoggerApiEvent = '/frontendlogger/api/event';
const arbeidstreningDomain = `https://arbeidsgiver.nais.${finnNaisMiljoStreng()}`;
const arenaLink = () => `http://arena${finnMiljoStreng()}.adeo.no/forms/arenaMod${finnMiljoStreng().replace('-', '_')}.html`;

function getArenaConfigParameter(miljø) {
    if (miljø === '') {
        return 'arena';
    } else if (miljø === 'q0') {
        return 'areq0';
    }
    return `are${miljø.charAt(0)}${miljø.substring(1).padStart(2, '0')}`;
}

function getArenaStartsideLink() {
    const miljø = finnMiljoStreng().replace('-', '');
    return `http://arena${finnMiljoStreng()}.adeo.no/forms/frmservlet?config=${getArenaConfigParameter(miljø)}`;
}

function byggArbeidssokerregistreringsURL(fnr, enhet) {
    return `https://arbeidssokerregistrering${finnMiljoStreng()}${naisDomain}?${fnr ? `fnr=${fnr}` : ''}${fnr && enhet ? '&' : ''}${enhet ? `enhetId=${enhet}` : ''}`;
}

export const funksjonsomradeLenker = (fnr, enhet) => [
    {
        tittel: 'Personoversikt',
        lenker: [
            {
                tittel: 'Oversikt',
                url: `${appDomain}/modiapersonoversikt/${fnr ? `person/${fnr}` : ''}`,
            },
            {
                tittel: 'Saksoversikt',
                url: `${appDomain}/modiapersonoversikt/${fnr ? `person/${fnr}/saker` : ''}`,
            },
            {
                tittel: 'Meldinger',
                url: `${appDomain}/modiapersonoversikt/${fnr ? `person/${fnr}/meldinger` : ''}`,
            },
            {
                tittel: 'Varslinger',
                url: `${appDomain}/modiapersonoversikt/${fnr ? `person/${fnr}/varsler` : ''}`,
            },
            {
                tittel: 'Utbetalinger',
                url: `${appDomain}/modiapersonoversikt/${fnr ? `person/${fnr}/utbetaling` : ''}`,
            },
            {
                tittel: 'Oppfølging',
                url: `${appDomain}/modiapersonoversikt/${fnr ? `person/${fnr}/oppfolging` : ''}`,
            },
            {
                tittel: 'Ytelser',
                url: `${appDomain}/modiapersonoversikt/${fnr ? `person/${fnr}/ytelser` : ''}`,
            },
        ],
    },
    {
        tittel: 'Arbeidsrettet oppfølging',
        lenker: [
            {
                tittel: 'Enhetens oversikt',
                url: `${appDomain}/veilarbportefoljeflatefs/enhet?enhet=${enhet}&clean`,
            },
            {
                tittel: 'Min oversikt',
                url: `${appDomain}/veilarbportefoljeflatefs/portefolje?enhet=${enhet}&clean`,
            },
            {
                tittel: 'Kvalitetssikring 14a',
                url: `${appDomain}/beslutteroversikt`,
            },
            {
                tittel: 'Aktivitetsplan',
                // Feil i eslint, fnr kan være undefined og da havner det i urlen, og det vil vi ikke
                // eslint-disable-next-line no-unneeded-ternary
                url: `${appDomain}/veilarbpersonflatefs/${fnr ? fnr : ''}?enhet=${enhet}`,
            },
            {
                tittel: 'Registrer arbeidssøker',
                // gå mot endepunkt i veilarblogin som setter cookie på nais-domene i preprod
                url: window.location.hostname.indexOf('-q') === -1 ?
                    byggArbeidssokerregistreringsURL(fnr, enhet) :
                    `https://veilarblogin${finnMiljoStreng()}${naisDomain}veilarblogin/api/start?url=${encodeURIComponent(byggArbeidssokerregistreringsURL(fnr, enhet))}`,
                onClick: () => post(`${frontendLoggerApiEvent}`, {
                    url: window.location.href,
                    userAgent: window.navigator.userAgent,
                    appName: 'internarbeidsflatedecorator',
                    name: 'internarbeidsflatedecorator.metrikker.registrering',
                    fields: {},
                    tags: {},
                }),
            },
            {
                tittel: 'Tiltaksgjennomføring - avtaler',
                url: `${arbeidstreningDomain}tiltaksgjennomforing`,
                target: '_blank',
            },
        ],
    },
    {
        tittel: 'Sykefraværsoppfølging',
        lenker: [
            {
                tittel: 'Enhetens oversikt',
                url: `https://syfooversikt${naisInternNavDomain}enhet`,
            },
            {
                tittel: 'Min oversikt ',
                url: `https://syfooversikt${naisInternNavDomain}minoversikt`,
            },
            {
                tittel: 'Dialogmøteoversikt',
                url: `https://syfomoteoversikt${naisInternNavDomain}`,
            },
            {
                tittel: 'Finn fastlege',
                url: `https://finnfastlege${naisInternNavDomain}fastlege/`,
            },
            {
                tittel: 'Sykmeldt enkeltperson',
                // eslint-disable-next-line no-unneeded-ternary
                url: `https://syfomodiaperson${naisDomain}sykefravaer/${fnr ? fnr : ''}`,
            },
        ],
    },
];

function getINST2NaisUrl() {
    const naisMiljo = finnNaisMiljoStreng();
    if (naisMiljo === NAIS_PREPROD_SUFFIX) {
        return 'https://inst2-web.nais.preprod.local';
    }
    return 'https://inst2-web.nais.adeo.no/';
}

function getGosysNaisUrl() {
    const naisMiljo = finnNaisMiljoStreng();
    if (naisMiljo === NAIS_PREPROD_SUFFIX) {
        return 'https://gosys-nais-q1.nais.preprod.local';
    }
    return 'https://gosys-nais.nais.adeo.no';
}

function getGosysUrl(fnr) {
    const domain = getGosysNaisUrl();
    if (fnr) {
        return `${domain}/gosys/personoversikt/fnr=${fnr}`;
    }
    return `${domain}/gosys/`;
}

export function gosysLenke(fnr) {
    const url = getGosysUrl(fnr);
    return {
        tittel: 'Gosys',
        url,
    };
}
function getPesysNaisUrl() {
    const naisMiljo = finnNaisMiljoStreng();
    if (naisMiljo === NAIS_PREPROD_SUFFIX) {
        return 'https://pensjon-psak-q1.nais.preprod.local';
    }
    return 'https://pensjon-psak.nais.adeo.no';
}
function getPesysUrl(fnr) {
    const domain = getPesysNaisUrl();
    if (fnr) {
        return `${domain}/psak/brukeroversikt/fnr=${fnr}`;
    }
    return `${domain}/psak/`;
}

export function pesysLenke(fnr) {
    const url = getPesysUrl(fnr);
    return {
        tittel: 'Pesys',
        url,
    };
}

export function arenaLenke(fnr) {
    let url = '';
    if (!fnr) {
        url = getArenaStartsideLink();
    } else {
        url = `${arenaLink()}?oppstart_skj=AS_REGPERSONALIA&fodselsnr=${fnr}`;
    }

    return {
        tittel: 'Arena personmappen',
        url,
    };
}

function aaRegister(fnr) {
    return {
        tittel: 'AA register',
        url: `${modappDomain}/aareg-web/?rolle=arbeidstaker&${fnr ? `ident=${fnr}` : ''}`,
    };
}

export function foreldrepengerLenke(aktorId) {
    return {
        tittel: 'Foreldrepenger',
        url: (aktorId && aktorId.data && aktorId.data.length > 0 ? `${appDomain}/fpsak/aktoer/${aktorId.data}` : `${appDomain}/fpsak/`),
    };
}

export function rekrutteringsBistandLenke() {
    return {
        tittel: 'Rekrutteringsbistand',
        url: `https://rekrutteringsbistand${naisDomain}`,
    };
}

export function sokEtterStillingLenke() {
    return {
        tittel: 'Søk etter stilling',
        url: `https://rekrutteringsbistand${naisDomain}stillingssok?standardsok`,
    };
}

export function k9Lenke(aktorId) {
    const domain = finnMiljoStreng() === '' ? 'https://k9-los-web.nais.adeo.no/' : 'https://k9-los-web.dev.adeo.no/';
    return {
        tittel: 'K9-sak',
        url: (aktorId && aktorId.data && aktorId.data.length > 0 ? `${domain}aktoer/${aktorId.data}` : domain),
    };
}
export function inst2() {
    return {
        tittel: 'INST2',
        url: getINST2NaisUrl(),
    };
}
export function salesforce() {
    const url = finnMiljoStreng() === '' ? 'https://navdialog.lightning.force.com' : 'https://navdialog--preprod.lightning.force.com';
    return {
        tittel: 'Salesforce',
        url,
    };
}

export const andreSystemerLenker = (fnr, aktorId, enhet) => ({ // eslint-disable-line no-unused-vars
    tittel: 'Andre systemer',
    lenker: [
        arenaLenke(fnr),
        aaRegister(fnr),
        pesysLenke(fnr),
        gosysLenke(fnr),
        foreldrepengerLenke(aktorId),
        rekrutteringsBistandLenke(),
        sokEtterStillingLenke(),
        k9Lenke(aktorId),
        inst2(),
    ],
});
