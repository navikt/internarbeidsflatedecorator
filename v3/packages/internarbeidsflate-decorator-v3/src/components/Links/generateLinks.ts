import { Environment, UrlFormat } from '../../utils/environmentUtils';
import { Url, buildLinks } from '../../utils/urlUtils';

export interface LinkWithTitle extends Url {
  title: string;
  subPath?: string | undefined;
}

export interface LinkSection {
  links: LinkWithTitle[];
  title: string;
  newPage?: boolean | undefined;
}

export interface LinkSections {
  modia: LinkSection;
  arbeidsrettet: LinkSection;
  sykefravaer: LinkSection;
  andre: LinkSection;
}

const buildLinkWithTitle = (
  link: Url,
  title: string,
  subPath: string | undefined = '',
): LinkWithTitle => ({
  ...link,
  title,
  subPath,
});

export const generateLinks = ({
  environment,
  urlFormat,
  fnr,
  enhet,
  aktoerId,
}: {
  environment: Environment;
  urlFormat: UrlFormat;
  fnr?: string | undefined | null;
  enhet?: string | undefined | null;
  aktoerId?: string | undefined | null;
}): LinkSections => {
  const links = buildLinks({
    environment,
    urlFormat,
    fnr,
    enhet,
    aktoerId,
  });
  const modia: LinkSection = {
    title: 'Personoversikt',
    links: [
      buildLinkWithTitle(links.modiaUrl, 'Oversikt'),
      buildLinkWithTitle(links.modiaUrl, 'Saksoversikt', '/saker'),
      buildLinkWithTitle(links.modiaUrl, 'Meldinger', '/meldinger'),
      buildLinkWithTitle(links.modiaUrl, 'Varslinger', '/varsler'),
      buildLinkWithTitle(links.modiaUrl, 'Utbetalinger', '/utbetaling'),
      buildLinkWithTitle(links.modiaUrl, 'Oppfølging', '/oppfolging'),
      buildLinkWithTitle(links.modiaUrl, 'Ytelser', '/ytelser'),
    ],
  };
  const arbeidsrettet: LinkSection = {
    title: 'Arbeidsrettet oppfølging',
    links: [
      buildLinkWithTitle(
        links.veilarbportefoljeUrl,
        'Enhetens oversikt',
        `/enhet?clean&enhet=${enhet ? enhet : ''}`,
      ),
      buildLinkWithTitle(
        links.veilarbportefoljeUrl,
        'Min oversikt',
        `/portefolje?clean&enhet=${enhet ? enhet : ''}`,
      ),
      buildLinkWithTitle(links.beslutterUrl, 'Kvalitetssikring 14a'),
      buildLinkWithTitle(links.veilarbpersonUrl, 'Aktivitetsplan'),
      buildLinkWithTitle(links.arbeidssokerUrl, 'Registrer arbeidssøker'),
      buildLinkWithTitle(
        links.tiltaksGjennomforingUrl,
        'Tiltaksjennomføring - avtaler',
      ),
    ],
  };
  const sykefravaer: LinkSection = {
    title: 'Sykefraværsoppfølging',
    links: [
      buildLinkWithTitle(links.syfooversiktUrl, 'Enhetens oversikt', '/enhet'),
      buildLinkWithTitle(links.syfooversiktUrl, 'Min oversikt', '/minoversikt'),
      buildLinkWithTitle(links.syfomoteOversikt, 'Dialogmøteoversikt'),
      buildLinkWithTitle(links.finnfastlege, 'Finn fastlege'),
      buildLinkWithTitle(links.syfomodiaperson, 'Sykmeld enkeltperson'),
    ],
  };

  const andre: LinkSection = {
    title: 'Andre systemer',
    newPage: true,
    links: [
      buildLinkWithTitle(links.arena, 'Arena personmappen'),
      buildLinkWithTitle(links.aaRegister, 'AA register'),
      buildLinkWithTitle(links.pesys, 'Pesys'),
      buildLinkWithTitle(links.gosys, 'Gosys'),
      buildLinkWithTitle(links.foreldrepenger, 'Foreldrepenger'),
      buildLinkWithTitle(links.k9, 'K9-sak'),
      buildLinkWithTitle(links.rekrutteringsBistand, 'Rekrutteringsbistand'),
      buildLinkWithTitle(links.INST2, 'INST2'),
      buildLinkWithTitle(
        links.rekrutteringsBistand,
        'Søk etter stilling',
        '/stillingssok?standardsok',
      ),
      buildLinkWithTitle(links.modiaSosialhjelp, 'Modia sosialhjelp'),
      buildLinkWithTitle(links.refusjon, 'Refusjon tilskudd'),
      buildLinkWithTitle(links.salesforce, 'Salesforce'),
    ],
  };

  return { modia, arbeidsrettet, sykefravaer, andre };
};
