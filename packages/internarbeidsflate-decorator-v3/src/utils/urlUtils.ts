import { Environment, UrlFormat } from './environmentUtils';

export interface Url {
  url: string;
}

export interface LinkObject {
  modiaUrl: Url;
  veilarbpersonUrl: Url;
  veilarbportefoljeUrl: Url;
  beslutterUrl: Url;
  arbeidssokerUrl: Url;
  tiltaksGjennomforingUrl: Url;
  syfooversiktUrl: Url;
  syfomoteOversikt: Url;
  finnfastlege: Url;
  syfomodiaperson: Url;
  arena: Url;
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
const adeoDomain = (environment: Environment) =>
  `https://app${findEnvString(environment)}.adeo.no`;

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

const naisDomain = (environment: Environment) => {
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
    urlFormat === 'ADEO' || environment === 'prod'
      ? adeoDomain(environment) + '/modiapersonoversikt'
      : 'https://modiapersonoversikt' + naisDomain(environment);

  return fnr ? basePath + path : basePath;
};

const arenaConfig = (environment: Environment): string => {
  const env = findEnvString(environment).replace('-', '');
  if (env === '') {
    return 'arena';
  } else if (env === 'q0') {
    return 'areq0';
  } else {
    return `are${env.charAt(0)}${env.substring(1).padStart(2, '0')}`;
  }
};

export const modiaContextHolderUrl = (
  environment: Environment,
  urlFormat: UrlFormat,
  contextHolderProxy?: string | undefined | null,
): string => {
  if (contextHolderProxy) {
    return `${contextHolderProxy}/modiacontextholder`;
  }

  switch (urlFormat) {
    case 'LOCAL':
      return 'http://localhost:4000/modiacontextholder';
    case 'ADEO':
      return `https://app${findEnvString(
        environment,
      )}.adeo.no/modiacontextholder`;
    case 'NAV_NO':
    case 'ANSATT':
      return `https://modiacontextholder${naisDomain(
        environment,
      )}/modiacontextholder`;
  }
};

export const wsEventDistribusjon = (
  environment: Environment,
  urlFormat: UrlFormat,
) => {
  const subdomain = environment === 'prod' ? '' : '.dev';
  switch (urlFormat) {
    case 'LOCAL':
      return 'ws://localhost:4000/ws/';
    case 'ANSATT':
      return `wss://modiaeventdistribution${ansattDomain(environment)}/ws/`;
    default: {
      if (environment === 'q2')
        return `wss://modiaeventdistribution${naisDomain(environment)}/ws/`;
      else
        return `wss://veilederflatehendelser${findEnvString(
          environment,
        )}${subdomain}.adeo.no/modiaeventdistribution/ws/`;
    }
  }
};

const pesysDomain = (environment: Environment, path: string) =>
  `https://pensjon-psak${naisAdeoDomain(environment)}${path}`;
export const pesysUrl = (
  environment: Environment,
  fnr?: string | undefined | null,
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
  fnr?: string | undefined | null,
): string => {
  if (!fnr) {
    return gosysDomain(environment, '/gosys');
  }
  return gosysDomain(environment, `/gosys/personoversikt/fnr=${fnr}`);
};

const fpSakDomain = (environment: Environment) =>
  `https://fpsak${naisDomain(environment)}`;
export const fpSakUrl = (
  enironment: Environment,
  aktoerId?: string | undefined | null,
) =>
  aktoerId
    ? `${fpSakDomain(enironment)}/aktoer/${aktoerId}`
    : `${fpSakDomain(enironment)}`;

const k9url = (environment: Environment) =>
  environment === 'prod'
    ? 'https://k9-los-web.intern.nav.no'
    : 'https://k9-los-web.intern.dev.nav.no';

const arbeidssokerUrl = ({
  environment,
  enhet,
  fnr,
}: Pick<BuildLinksProps, 'environment' | 'enhet' | 'fnr'>) => {
  const queryParams = `?${fnr ? `fnr=${fnr}` : ''}${fnr && enhet ? '&' : ''}${
    enhet ? `enhetId=${enhet}` : ''
  }`;
  return `https://arbeidssokerregistrering-for-veileder${naisDomain(
    environment,
  )}${queryParams}`;
};

export const arenaUrl = ({
  environment,
  fnr,
}: Pick<BuildLinksProps, 'environment' | 'enhet' | 'fnr'>) => {
  if (fnr) {
    const baseUrl = `http://arena${findEnvString(
      environment,
    )}.adeo.no/forms/arenaMod${findEnvString(environment).replace(
      '-',
      '_',
    )}.html`;
    return `${baseUrl}oppstart_skj=AS_REGPERSONALIA&fodselsnr=${fnr}`;
  }
  return `http://arena${findEnvString(
    environment,
  )}.adeo.no/forms/frmservlet?config=${arenaConfig(environment)}`;
};

export const veilarbpersonflateUrl = ({
  environment,
  enhet,
  fnr,
}: Pick<BuildLinksProps, 'environment' | 'enhet' | 'fnr'>) => {
  return `https://veilarbpersonflate${naisDomain(environment)}/${
    fnr ? fnr : ''
  }?enhet=${enhet ? enhet : ''}`;
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
  enhet,
  fnr,
  aktoerId,
  contextHolderProxy,
}: BuildLinksProps): LinkObject => {
  return {
    modiaUrl: {
      url: modiaUrl(fnr, `/person`, environment, urlFormat),
    },
    veilarbportefoljeUrl: {
      url: `https://veilarbportefoljeflate${naisDomain(environment)}`,
    },
    veilarbpersonUrl: {
      url: veilarbpersonflateUrl({ environment }),
    },
    beslutterUrl: {
      url: `https://beslutteroversikt${naisDomain(environment)}`,
    },
    arbeidssokerUrl: {
      url: arbeidssokerUrl({ environment, enhet, fnr }),
    },
    tiltaksGjennomforingUrl: {
      url: `https://tiltaksgjennomforing${naisDomain(
        environment,
      )}/tiltaksgjennomforing`,
    },
    syfooversiktUrl: {
      url: `https://syfooversikt${naisDomain(environment)}`,
    },
    syfomoteOversikt: {
      url: `https://syfomoteoversikt${naisDomain(environment)}`,
    },
    finnfastlege: {
      url: `https://finnfastlege${naisDomain(environment)}/fastlege/`,
    },
    syfomodiaperson: {
      url: `https://syfomodiaperson${naisDomain(environment)}/sykefravaer`,
    },
    arena: {
      url: arenaUrl({ environment, enhet, fnr }),
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
      url: 'https://data.intern.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/',
    },
  };
};
