import { Environment, UrlFormat } from './environmentUtils';

export interface Url {
  url: string;
}

export interface LinkObject {
  modiaUrl: Url;
  modiaUtenPersonUrl: Url;
  veilarbpersonUrl: Url;
  veilarbportefoljeUrl: Url;
  beslutterUrl: Url;
  arbeidssokerUrl: Url;
  tiltaksGjennomforingUrl: Url;
  syfooversiktUrl: Url;
  syfomoteOversikt: Url;
  finnfastlege: Url;
  syfomodiaperson: Url;
  aaRegister: Url;
  pesys: Url;
  gosys: Url;
  foreldrepenger: Url;
  k9: Url;
  rekrutteringsBistand: Url;
  INST2: Url;
  modiaSosialhjelp: Url;
  refusjon: Url;
  salesforce: Url;
  arbeidsmarkedsTiltak: Url;
  kunnskapsbasenNKS: Url;
  kunnskapsbank: Url;
}

const findEnvString = (environment: Environment) => {
  if (environment === 'prod') {
    return '';
  }
  if (environment === 'local') {
    return '';
  }
  return `-${environment}`;
};

const naisAdeoDomain = (
  environment: Environment,
  addEnvNamespace: boolean = false,
) => {
  if (environment === 'prod') {
    return '.nais.adeo.no';
  }
  return `${
    addEnvNamespace ? findEnvString(environment) : ''
  }.nais.preprod.local`;
};

const naisDomain = (
  environment: Environment,
  urlFormat: UrlFormat = 'NAV_NO',
) => {
  if (urlFormat === 'ANSATT') return ansattDomain(environment);

  if (environment === 'prod') {
    return '.intern.nav.no';
  }
  return '.intern.dev.nav.no';
};

const ansattDomain = (environment: Environment) => {
  if (environment === 'prod') {
    return '.ansatt.nav.no';
  }
  return '.ansatt.dev.nav.no';
};

const modiaUrl = (
  fnr: string | undefined | null,
  path: string,
  environment: Environment,
  urlFormat: UrlFormat,
) => {
  const basePath =
    'https://modiapersonoversikt' + naisDomain(environment, urlFormat);

  return fnr ? basePath + path : basePath;
};

export const modiaContextHolderUrl = (
  environment: Environment,
  urlFormat: UrlFormat,
  contextHolderProxy?: string | null,
): string => {
  if (contextHolderProxy) {
    return contextHolderProxy;
  }

  switch (urlFormat) {
    case 'LOCAL':
      return 'http://localhost:4000';
    case 'NAV_NO':
    case 'ANSATT':
      return `https://modiacontextholder${naisDomain(environment)}`;
  }
};

export const wsEventDistribusjon = (
  environment: Environment,
  urlFormat: UrlFormat,
) => {
  switch (urlFormat) {
    case 'LOCAL':
      return 'ws://localhost:4000/ws/';
    case 'ANSATT':
      return `wss://modiacontextholder${ansattDomain(environment)}/ws/`;
    default:
      return `wss://modiacontextholder${naisDomain(environment)}/ws/`;
  }
};

const pesysDomain = (environment: Environment, path: string) =>
  `https://pensjon-psak${naisAdeoDomain(environment)}${path}`;
export const pesysUrl = (
  environment: Environment,
  fnr?: string | null,
): string => {
  if (!fnr) {
    return pesysDomain(environment, '/psak');
  }
  return pesysDomain(environment, `/psak/brukeroversikt/fnr=${fnr}`);
};

const gosysDomain = (environment: Environment, path: string) => {
  if (environment === 'prod') {
    return `https://gosys${naisDomain(environment)}${path}`;
  }
  const env = findEnvString(environment);
  return `https://gosys${env}${naisDomain(environment)}${path}`;
};
export const gosysUrl = (
  environment: Environment,
  fnr?: string | null,
): string => {
  if (!fnr) {
    return gosysDomain(environment, '/gosys');
  }
  return gosysDomain(environment, `/gosys/personoversikt/fnr=${fnr}`);
};

const fpSakDomain = (environment: Environment) =>
  `https://fpsak${naisDomain(environment)}`;
export const fpSakUrl = (enironment: Environment, aktoerId?: string | null) =>
  aktoerId
    ? `${fpSakDomain(enironment)}/aktoer/${aktoerId}`
    : `${fpSakDomain(enironment)}`;

const k9url = (environment: Environment) =>
  environment === 'prod'
    ? 'https://k9-los-web.intern.nav.no'
    : 'https://k9-los-web.intern.dev.nav.no';

const arbeidssokerUrl = ({
  environment,
}: Pick<BuildLinksProps, 'environment'>) => {
  return `https://arbeidssokerregistrering-for-veileder${naisDomain(
    environment,
  )}`;
};

export const veilarbpersonflateUrl = ({
  environment,
  urlFormat,
}: Pick<BuildLinksProps, 'environment' | 'urlFormat'>) => {
  return `https://veilarbpersonflate${naisDomain(environment, urlFormat)}`;
};

interface BuildLinksProps {
  environment: Environment;
  urlFormat: UrlFormat;
  enhet?: string | undefined | null;
  fnr?: string | undefined | null;
  aktoerId?: string | undefined | null;
  contextHolderProxy?: string | undefined | null;
}

export const buildLinks = ({
  environment,
  urlFormat,
  fnr,
  aktoerId,
  contextHolderProxy,
}: BuildLinksProps): LinkObject => {
  return {
    modiaUrl: {
      url: modiaUrl(fnr, `/person`, environment, urlFormat),
    },
    modiaUtenPersonUrl: {
      url: modiaUrl(fnr, '', environment, urlFormat),
    },
    veilarbportefoljeUrl: {
      url: `https://veilarbportefoljeflate${naisDomain(environment, urlFormat)}`,
    },
    veilarbpersonUrl: {
      url: veilarbpersonflateUrl({ environment, urlFormat }),
    },
    beslutterUrl: {
      url: `https://beslutteroversikt${naisDomain(environment, urlFormat)}`,
    },
    arbeidssokerUrl: {
      url: arbeidssokerUrl({ environment }),
    },
    tiltaksGjennomforingUrl: {
      url: `https://tiltaksgjennomforing${naisDomain(
        environment,
      )}/tiltaksgjennomforing`,
    },
    syfooversiktUrl: {
      url: `https://syfooversikt${naisDomain(environment, urlFormat)}`,
    },
    syfomoteOversikt: {
      url: `https://syfomoteoversikt${naisDomain(environment, urlFormat)}`,
    },
    finnfastlege: {
      url: `https://finnfastlege${naisDomain(environment, urlFormat)}/fastlege/`,
    },
    syfomodiaperson: {
      url: `https://syfomodiaperson${naisDomain(environment, urlFormat)}/sykefravaer`,
    },
    aaRegister: {
      url: `${modiaContextHolderUrl(
        environment,
        urlFormat,
        contextHolderProxy,
      )}/redirect/aaregisteret`,
    },
    pesys: {
      url: pesysUrl(environment, fnr),
    },
    gosys: {
      url: gosysUrl(environment, fnr),
    },
    foreldrepenger: {
      url: fpSakUrl(environment, aktoerId),
    },
    k9: {
      url: k9url(environment),
    },
    rekrutteringsBistand: {
      url: `https://rekrutteringsbistand${naisDomain(environment)}`,
    },
    INST2: {
      url: `https://inst2-web${naisAdeoDomain(environment)}`,
    },
    modiaSosialhjelp: {
      url: `https://sosialhjelp-modia${naisDomain(
        environment,
      )}/sosialhjelp/modia`,
    },
    refusjon: {
      url: `https://tiltak-refusjon${naisDomain(environment)}`,
    },
    salesforce: {
      url: `${modiaContextHolderUrl(
        environment,
        urlFormat,
        contextHolderProxy,
      )}/redirect/salesforce`,
    },
    arbeidsmarkedsTiltak: {
      url: `https://nav-arbeidsmarkedstiltak${naisDomain(environment)}/`,
    },
    kunnskapsbasenNKS: {
      url: 'https://data.ansatt.nav.no/story/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb',
    },
    kunnskapsbank: {
      url: 'https://navno.sharepoint.com/sites/fag-og-ytelser-Kunnskapsbank-trygdemedisin',
    },
  };
};
