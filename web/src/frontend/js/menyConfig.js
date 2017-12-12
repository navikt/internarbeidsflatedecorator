import { finnMiljoStreng } from './sagas/util';

const modappDomain = `https://modapp${finnMiljoStreng()}.adeo.no`;
const wasappDomain = `https://wasapp${finnMiljoStreng()}.adeo.no`;
const appDomain = `https://app${finnMiljoStreng()}.adeo.no`;
const arenaLink = `http://arena${finnMiljoStreng()}.adeo.no/forms/arenaMod${finnMiljoStreng().replace('-', '_')}.html`;

export const funksjonsomradeLenker = (fnr, enhet) => [
    {
        tittel: 'Oppfølging',
        lenker: [
            {
                tittel: 'Arbeidsmarkedet',
                url: `${appDomain}/mia/ledigestillinger`,
            },
            {
                tittel: 'Enhetens oversikt',
                url: `${appDomain}/veilarbportefoljeflatefs/enhet?${enhet}&clean`,
            },
            {
                tittel: 'Min oversikt',
                url: `${appDomain}/veilarbportefoljeflatefs/portefolje?enhet=${enhet}&clean`,
            },
            {
                tittel: 'Aktivitetsplan',
                url: `${appDomain}/veilarbpersonflatefs/${fnr}`,
            },
            {
                tittel: 'Sykefraværshendelser',
                url: `${appDomain}/sykefravaersoppfoelging`,
            },
            {
                tittel: 'Dialogmøter',
                url: `${appDomain}/moteoversikt`,
            },
            {
                tittel: 'Finn fastlege',
                url: `${appDomain}/fastlege`,
            },
        ],
    },
    {
        tittel: 'Personoversikt',
        lenker: [
            {
                tittel: 'Avansert søk',
                url: `${modappDomain}/modiabrukerdialog/${fnr ? `person/${fnr}` : ''}`,
            },
            {
                tittel: 'Saksoversikt',
                url: `${modappDomain}/modiabrukerdialog/${fnr ? `person/${fnr}#!saksoversikt` : ''}`,
            },
            {
                tittel: 'Meldinger',
                url: `${modappDomain}/modiabrukerdialog/${fnr ? `person/${fnr}#!meldinger` : ''}`,
            },
            {
                tittel: 'Varslinger',
                url: `${modappDomain}/modiabrukerdialog/${fnr ? `person/${fnr}#!varsling` : ''}`,
            },
            {
                tittel: 'Utbetalinger',
                url: `${modappDomain}/modiabrukerdialog/${fnr ? `person/${fnr}#!utbetalinger` : ''}`,
            },
            {
                tittel: 'Oppfolging',
                url: `${modappDomain}/modiabrukerdialog/${fnr ? `person/${fnr}#!kontrakter` : ''}`,
            },
            {
                tittel: 'Brukerprofil',
                url: `${modappDomain}/modiabrukerdialog/${fnr ? `person/${fnr}#!brukerprofil` : ''}`,
            },
        ],
    },
];

export const andreSystemerLenker = (fnr, enhet) => ({ // eslint-disable-line no-unused-vars
    tittel: 'Andre systemer',
    lenker: [
        { tittel: 'Arena personmappen', url: `${arenaLink}?oppstart_skj=AS_REGPERSONALIA&fodselsnr=${fnr}` },
        { tittel: 'AA register', url: `${modappDomain}/aareg-web/?rolle=arbeidstaker&ident=${fnr}` },
        { tittel: 'Pesys', url: `${wasappDomain}/psak/brukeroversikt/fnr=${fnr}` },
        { tittel: 'Gosys', url: `${wasappDomain}/gosys/personoversikt/fnr=${fnr}` },
    ],
});