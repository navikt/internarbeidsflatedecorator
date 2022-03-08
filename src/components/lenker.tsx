import React, {useCallback} from 'react';
import {finnMiljoStreng, finnNaisInternNavMiljoStreng, finnNaisMiljoStreng, hentMiljoFraUrl} from '../utils/url-utils';
import useHotkeys, {erAltOg, Hotkey, openUrl} from "../hooks/use-hotkeys";
import {WrappedState} from "../hooks/use-wrapped-state";
import {useInitializedState} from "../hooks/use-initialized-state";
import {useEnhetContextvalueState, useFnrContextvalueState} from "../hooks/use-contextvalue-state";
import {ProxyConfig} from "../domain";
import {lagModiacontextholderUrl} from "../redux/api";


function Lenke(props: { href: string; children: string; target?: string; }) {
    /* eslint-disable jsx-a11y/anchor-has-content */
    return (
        <li>
            <a {...props} className="typo-normal dekorator__menylenke" rel="noopener noreferrer" />
        </li>
    );
    /* eslint-enable jsx-a11y/anchor-has-content */
}

function getArenaConfigParameter(miljo: string) {
    if (miljo === '') {
        return 'arena';
    } else if (miljo === 'q0') {
        return 'areq0';
    }
    return `are${miljo.charAt(0)}${miljo.substring(1).padStart(2, '0')}`;
}

function getArenaStartsideLink() {
    const miljo = finnMiljoStreng().replace('-', '');
    return `http://arena${finnMiljoStreng()}.adeo.no/forms/frmservlet?config=${getArenaConfigParameter(miljo)}`;
}

const naisDomain = finnNaisMiljoStreng();
const naisInternNavDomain = finnNaisInternNavMiljoStreng();
const gosysDomain = (path: string) => {
    const miljo = hentMiljoFraUrl();
    if (miljo.environment === 'p') {
        return `https://gosys.intern.nav.no${path}`;
    } else {
        return `https://gosys${finnMiljoStreng()}.dev.intern.nav.no${path}`;
    }
};
const pesysDomain = (path: string) => `https://pensjon-psak${finnNaisMiljoStreng(true)}${path}`;
const appDomain = (path: string) => `https://app${finnMiljoStreng()}.adeo.no${path}`;
const appDevDomain = (path: string) => `https://app${finnMiljoStreng(true)}.adeo.no${path}`;
const arenaLink = `http://arena${finnMiljoStreng()}.adeo.no/forms/arenaMod${finnMiljoStreng().replace('-', '_')}.html`;
const arenaUrl = (fnr: string) => fnr ? `${arenaLink}?oppstart_skj=AS_REGPERSONALIA&fodselsnr=${fnr}` : getArenaStartsideLink();
const modiaUrl = (fnr: string, path: string) => fnr ? appDomain(path) : appDomain('/modiapersonoversikt');
const pesysUrl = (fnr: string, path: string) => (fnr ? pesysDomain(path) : pesysDomain('/psak/'));
export const gosysUrl = (fnr: string, path: string) => fnr ? gosysDomain(path) : gosysDomain('/gosys/');
const foreldrePengerUrl = (aktoerId: string, path: string) => aktoerId ? appDomain(path) : appDomain('/fpsak/');
const byggArbeidssokerregistreringsURL = (fnr: string, enhet: string) => `https://arbeidssokerregistrering${finnMiljoStreng()}${naisDomain}?${fnr ? `fnr=${fnr}` : ''}${fnr && enhet ? '&' : ''}${enhet ? `enhetId=${enhet}` : ''}`;
function arbeidssokerregistreringLoginUrl(fnr: string, enhet: string): string {
    const miljo = hentMiljoFraUrl();
    const redirectUrl = encodeURIComponent(byggArbeidssokerregistreringsURL(fnr, enhet));
    if (miljo.environment === 'p') {
        return appDomain(`/veilarblogin/api/start?url=${redirectUrl}`)
    } else {
        return `https://veilarblogin${finnMiljoStreng()}${naisDomain}/veilarblogin/api/start?url=${redirectUrl}`;
    }
}
const arbeidstreningDomain = `https://arbeidsgiver${finnNaisMiljoStreng()}`;
const inst2 = () => `https://inst2-web${finnNaisMiljoStreng(true)}/`;
function k9Url(aktorId: string): string {
    const miljo = hentMiljoFraUrl();
    const domain = miljo.environment === 'p' ? 'https://k9-los-web.nais.adeo.no/' : 'https://k9-los-web.dev.adeo.no/';
    if (aktorId) {
        return `${domain}aktoer/${aktorId}`
    } else {
        return domain
    }
}
function salesforceUrl() {
    if (hentMiljoFraUrl().environment === 'p') {
        return "https://navdialog.lightning.force.com/";
    } else {
        return "https://navdialog--sit2.lightning.force.com/";
    }
}

function lagHotkeys(fnr: string, aktorId: string): Array<Hotkey> {
    return [
        {
            matches: erAltOg('g'),
            execute: openUrl(gosysUrl(fnr, `/gosys/personoversikt/fnr=${fnr}`))
        },
        {
            matches: erAltOg('i'),
            execute: openUrl(pesysUrl(fnr, `/psak/brukeroversikt/fnr=${fnr}`))
        },
        {
            matches: erAltOg('p'),
            execute: openUrl(arenaUrl(fnr))
        },
        {
            matches: erAltOg('k'),
            execute: openUrl(foreldrePengerUrl(aktorId, `/fpsak/aktoer/${aktorId}`))
        }
    ];
}

interface Props {
    apen: WrappedState<boolean>;
    proxyConfig: ProxyConfig;
}

function Lenker(props: Props) {
    const fnr = useFnrContextvalueState().withDefault('');
    const enhet = useEnhetContextvalueState().withDefault('');
    const aktorId: string = useInitializedState((state) => state.data.aktorId)
        .map((resp) => resp.aktorId)
        .withDefault('');

    const hotkeys = useCallback(lagHotkeys, [fnr, aktorId])(fnr, aktorId);
    useHotkeys(hotkeys);

    if (!props.apen.value) {
        return null;
    }
    const modiacontextholderUrl = lagModiacontextholderUrl(props.proxyConfig);

    return (
        <div className="dekorator__nav dekorator__nav--apen">
            <div className="dekorator__container dekorator__meny">
                <div className="dekorator__kolonner">
                    <section className="dekorator__kolonne">
                        <h2 className="dekorator__lenkeheader">Personoversikt</h2>
                        <ul className="dekorator__menyliste">
                            <Lenke href={modiaUrl(fnr, `/modiapersonoversikt/person/${fnr}`)}>
                                Oversikt
                            </Lenke>
                            <Lenke href={modiaUrl(fnr, `/modiapersonoversikt/person/${fnr}/saker`)}>
                                Saksoversikt
                            </Lenke>
                            <Lenke href={modiaUrl(fnr, `/modiapersonoversikt/person/${fnr}/meldinger`)}>
                                Meldinger
                            </Lenke>
                            <Lenke href={modiaUrl(fnr, `/modiapersonoversikt/person/${fnr}/varsler`)}>
                                Varslinger
                            </Lenke>
                            <Lenke href={modiaUrl(fnr, `/modiapersonoversikt/person/${fnr}/utbetaling`)}>
                                Utbetalinger
                            </Lenke>
                            <Lenke href={modiaUrl(fnr, `/modiapersonoversikt/person/${fnr}/oppfolging`)}>
                                Oppfølging
                            </Lenke>
                            <Lenke href={modiaUrl(fnr, `/modiapersonoversikt/person/${fnr}/ytelser`)}>
                                Ytelser
                            </Lenke>
                        </ul>
                    </section>
                    <section className="dekorator__kolonne">
                        <h2 className="dekorator__lenkeheader">Arbeidsrettet oppfølging</h2>
                        <ul className="dekorator__menyliste">
                            <Lenke href={appDevDomain(`/veilarbportefoljeflatefs/enhet?clean&enhet=${enhet}`)}>
                                Enhetens oversikt
                            </Lenke>
                            <Lenke href={appDevDomain(`/veilarbportefoljeflatefs/portefolje?clean&enhet=${enhet}`)}>
                                Min oversikt
                            </Lenke>
                            <Lenke href={appDomain(`/beslutteroversikt`)}>
                                Kvalitetssikring 14a
                            </Lenke>
                            <Lenke href={appDomain(`/veilarbpersonflatefs/${fnr ? fnr : ''}?enhet=${enhet}`)}>
                                Aktivitetsplan
                            </Lenke>
                            <Lenke href={arbeidssokerregistreringLoginUrl(fnr, enhet)}>
                                Registrer arbeidssøker
                            </Lenke>
                            <Lenke href={`${arbeidstreningDomain}/tiltaksgjennomforing`}>
                                Tiltaksgjennomføring - avtaler
                            </Lenke>
                        </ul>
                    </section>
                    <section className="dekorator__kolonne">
                        <h2 className="dekorator__lenkeheader">Sykefraværsoppfølging</h2>
                        <ul className="dekorator__menyliste">
                            <Lenke href={`https://syfooversikt${naisInternNavDomain}/enhet`}>Enhetens oversikt</Lenke>
                            <Lenke href={`https://syfooversikt${naisInternNavDomain}/minoversikt`}>Min oversikt</Lenke>
                            <Lenke href={`https://syfomoteoversikt${naisInternNavDomain}/`}>Dialogmøteoversikt</Lenke>
                            <Lenke href={`https://finnfastlege${naisInternNavDomain}/fastlege/`}>Finn fastlege</Lenke>
                            <Lenke href={`https://syfomodiaperson${naisInternNavDomain}/sykefravaer/${fnr ? fnr : ''}`}>
                                Sykmeldt enkeltperson
                            </Lenke>
                        </ul>
                    </section>
                </div>
                <section className="dekorator__rad">
                    <h2 className="dekorator__lenkeheader">Andre systemer</h2>
                    <ul className="dekorator__menyliste">
                        <Lenke href={arenaUrl(fnr)} target="_blank">
                            Arena personmappen
                        </Lenke>
                        <Lenke href={`${modiacontextholderUrl}/redirect/aaregisteret`} target="_blank">
                            AA register
                        </Lenke>
                        <Lenke href={pesysUrl(fnr, `/psak/brukeroversikt/fnr=${fnr}`)} target="_blank">Pesys</Lenke>
                        <Lenke href={gosysUrl(fnr, `/gosys/personoversikt/fnr=${fnr}`)} target="_blank">
                            Gosys
                        </Lenke>
                        <Lenke href={foreldrePengerUrl(aktorId, `/fpsak/aktoer/${aktorId}`)} target="_blank">
                            Foreldrepenger
                        </Lenke>
                        <Lenke href={k9Url(aktorId)} target="_blank">
                            K9-sak
                        </Lenke>
                        <Lenke href={`https://rekrutteringsbistand${naisInternNavDomain}`} target="_blank">
                            Rekrutteringsbistand
                        </Lenke>
                        <Lenke href={inst2()} target="_blank">
                            INST2
                        </Lenke>
                        <Lenke href={`https://rekrutteringsbistand${naisInternNavDomain}/stillingssok?standardsok`} target="_blank">
                            Søk etter stilling
                        </Lenke>
                        <Lenke href={salesforceUrl()} target="_blank">
                            Salesforce
                        </Lenke>
                    </ul>
                </section>
            </div>
        </div>
    );
}

export default Lenker;
