import React, { PropTypes } from 'react';
import Enhet from './Enhet';
import Veileder from './Veileder';
import Sokefelt from '../containers/SokefeltContainer';
import Overskrift from './Overskrift';
import Meny from './Meny';
import Feilmelding from './Feilmelding';
import EnhetVelger from './EnhetVelger';
import { hentValgtEnhetIDFraURL } from '../utils/url-utils';
import { dispatchFjernPersonEvent, dispatchPersonsokEvent } from '../events';
import { hentAktor } from '../actions/aktor_actions';
import { connect } from 'react-redux';

const finnValgtEnhet = (valgtEnhetId, enhetliste) =>
    enhetliste.find(enhet => valgtEnhetId === enhet.enhetId);

export const finnEnhetForVisning = (valgtEnhet, data) => {
    if (!data || data.length === 0) {
        return '';
    }

    const finnValgtEnhetIEnhetListe = finnValgtEnhet(valgtEnhet, data.enhetliste);

    if (finnValgtEnhetIEnhetListe) {
        return finnValgtEnhetIEnhetListe;
    }

    const enhetFraUrl = finnValgtEnhet(hentValgtEnhetIDFraURL(), data.enhetliste);
    if (!enhetFraUrl) {
        return data.enhetliste[0];
    }
    return enhetFraUrl;
};

export class Header extends React.Component {

    static propTypes = {
        applicationName: PropTypes.string,
        toggles: PropTypes.shape({
            visEnhet: PropTypes.bool,
            visEnhetVelger: PropTypes.bool,
            visSokefelt: PropTypes.bool,
            visVeileder: PropTypes.bool,
            nameCaseVeileder: PropTypes.bool,
            toggleSendEventVedEnEnhet: PropTypes.bool,
        }),
        fnr: PropTypes.string,
        aktorId: PropTypes.shape({
            data: PropTypes.string,
            henter: PropTypes.bool,
            hentingFeilet: PropTypes.bool,
        }),
        autoSubmit: PropTypes.bool,
        visMeny: PropTypes.bool,
        toggleMeny: PropTypes.func,
        handleChangeEnhet: PropTypes.func,
        handlePersonsokSubmit: PropTypes.func,
        handlePersonsokReset: PropTypes.func,
        settValgtEnhet: PropTypes.func,
        feilmelding: PropTypes.string,
        valgtEnhet: PropTypes.string,
        enheter: PropTypes.shape({
            data: PropTypes.shape({
                navn: PropTypes.string,
            }),
            henter: PropTypes.bool,
            hentingFeilet: PropTypes.bool,
        }),
        extraMarkup: PropTypes.shape({ etterSokefelt: PropTypes.String }),
        veileder: PropTypes.shape({
            data: PropTypes.shape({
                navn: PropTypes.string,
                ident: PropTypes.string,
            }),
            henter: PropTypes.bool,
            hentingFeilet: PropTypes.bool,
        }),
        dispatch: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.handleClickOutside = this.handleClickOutside.bind(this);

        this.nyttFnr = this.nyttFnr.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.handleClickOutside);
        document.addEventListener('dekorator-hode-personsok', this.nyttFnr);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.handleClickOutside);
    }

    handleClickOutside(event) {
        if (this.dekoratorRef && this.props.visMeny && !this.dekoratorRef.contains(event.target)) {
            this.props.toggleMeny();
        }
    }

    nyttFnr(event) {
        this.props.dispatch(hentAktor(event.fodselsnummer));
    }

    render({
               applicationName,
               fnr,
               aktorId,
               autoSubmit,
               toggles = {},
               handlePersonsokSubmit,
               handlePersonsokReset,
               handleChangeEnhet = () => {},
               settValgtEnhet,
               visMeny,
               enheter,
               veileder,
               feilmelding,
               toggleMeny,
               valgtEnhet,
               extraMarkup = { etterSokefelt: null },
           } = this.props) {
        const triggerPersonsokEvent = handlePersonsokSubmit || dispatchPersonsokEvent;
        const triggerFjernPersonEvent = handlePersonsokReset || dispatchFjernPersonEvent;

        return (
            <div ref={ref => {this.dekoratorRef = ref;}} className="dekorator">
                <div className="dekorator__hode" role="banner">
                    <div className="dekorator__container">
                        <header className="dekorator__banner">
                            <Overskrift applicationName={applicationName} />
                            <div className="flex-center">
                                {toggles.visEnhet && <Enhet valgtEnhet={valgtEnhet} enheter={enheter} />}
                                {toggles.visEnhetVelger && <EnhetVelger
                                    toggleSendEventVedEnEnhet={toggles.toggleSendEventVedEnEnhet}
                                    enheter={enheter}
                                    handleChangeEnhet={(oppdatertEnhet, endringsType) => {
                                        settValgtEnhet(oppdatertEnhet);
                                        handleChangeEnhet(oppdatertEnhet, endringsType);
                                    }}
                                    valgtEnhet={valgtEnhet}
                                />}
                                {toggles.visSokefelt && <Sokefelt
                                    triggerPersonsokEvent={triggerPersonsokEvent}
                                    triggerFjernPersonEvent={triggerFjernPersonEvent}
                                    fnr={fnr}
                                    autoSubmit={autoSubmit}
                                />}
                                {extraMarkup.etterSokefelt &&
                                <div dangerouslySetInnerHTML={{ __html: extraMarkup.etterSokefelt }} />}
                                {toggles.visVeileder &&
                                <Veileder veileder={veileder} nameCase={toggles.nameCaseVeileder} />}
                            </div>
                            <section>
                                <button
                                    aria-expanded={visMeny}
                                    className={`dekorator__hode__toggleMeny ${visMeny ? 'dekorator__hode__toggleMeny--apen' : ''} `}
                                    id="js-dekorator-toggle-meny"
                                    onClick={() => {
                                        toggleMeny();
                                    }}
                                >Meny
                                </button>
                            </section>
                        </header>
                    </div>
                </div>
                <Meny apen={visMeny} fnr={fnr} aktorId={aktorId} enhet={valgtEnhet} />
                {feilmelding && <Feilmelding feilmelding={feilmelding} />}
            </div>
        );
    }
}

export default connect()(Header);
