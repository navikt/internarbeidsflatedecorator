import React, { PropTypes } from 'react';
import Enhet from './Enhet';
import Veileder from './Veileder';
import Sokefelt from '../containers/SokefeltContainer';
import Overskrift from './Overskrift';
import Meny from './Meny';
import Feilmelding from './Feilmelding';
import EnhetVelger from './EnhetVelger';

const defaultPersonsokHandler = (fodselsnummer) => {
    const personsokEvent = document.createEvent('Event');
    personsokEvent.initEvent('dekorator-hode-personsok', true, true);
    personsokEvent.fodselsnummer = fodselsnummer;
    document.dispatchEvent(personsokEvent);
};

const defaultFjernPersonHandler = () => {
    const personsokEvent = document.createEvent('Event');
    personsokEvent.initEvent('dekorator-hode-fjernperson', true, true);
    document.dispatchEvent(personsokEvent);
};

const Header = ({
                    applicationName,
                    fnr,
                    toggles = {},
                    handlePersonsokSubmit,
                    handlePersonsokReset,
                    handleChangeEnhet = () => {},
                    visMeny,
                    enheter,
                    veileder,
                    feilmelding,
                    toggleMeny,
                    initiellEnhet,
                    extraMarkup = { etterSokefelt: null },
                }) => {
    const triggerPersonsokEvent = handlePersonsokSubmit || defaultPersonsokHandler;
    const triggerFjernPersonEvent = handlePersonsokReset || defaultFjernPersonHandler;

    return (
        <div className="dekorator">
            <div className="dekorator__hode" role="banner">
                <div className="dekorator__container">
                    <header className="dekorator__banner">
                        <Overskrift applicationName={applicationName}/>
                        <div className="flex-center">
                            { toggles.visEnhet && <Enhet enheter={enheter}/> }
                            { toggles.visEnhetVelger && <EnhetVelger
                                toggleSendEventVedEnEnhet={toggles.toggleSendEventVedEnEnhet}
                                enheter={enheter}
                                handleChangeEnhet={handleChangeEnhet}
                                initiellEnhet={initiellEnhet}
                            /> }
                            { toggles.visSokefelt && <Sokefelt triggerPersonsokEvent={triggerPersonsokEvent}
                                                               triggerFjernPersonEvent={triggerFjernPersonEvent}
                                                               fnr={fnr}/> }
                            { extraMarkup.etterSokefelt && <div dangerouslySetInnerHTML={{ __html: extraMarkup.etterSokefelt}} /> }
                            { toggles.visVeileder && <Veileder veileder={veileder}/> }
                        </div>
                        <section>
                            <button aria-pressed="false"
                                    className={`dekorator__hode__toggleMeny ${visMeny ? 'dekorator__hode__toggleMeny--apen' : ''} `}
                                    id="js-dekorator-toggle-meny"
                                    onClick={() => {
                                        toggleMeny();
                                    }}>Meny
                            </button>
                        </section>
                    </header>
                </div>
            </div>
            <Meny apen={visMeny} fnr={fnr} />
            { feilmelding && <Feilmelding feilmelding={feilmelding}/> }
        </div>
    );
};

Header.propTypes = {
    applicationName: PropTypes.string,
    toggles: PropTypes.shape({
        visEnhet: PropTypes.bool,
        visEnhetVelger: PropTypes.bool,
        visSokefelt: PropTypes.bool,
        visVeileder: PropTypes.bool,
        toggleSendEventVedEnEnhet: PropTypes.bool,
    }),
    fnr: PropTypes.string,
    visMeny: PropTypes.bool,
    toggleMeny: PropTypes.func,
    handleChangeEnhet: PropTypes.func,
    handlePersonsokSubmit: PropTypes.func,
    handlePersonsokReset: PropTypes.func,
    feilmelding: PropTypes.string,
    initiellEnhet: PropTypes.string,
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
};

export default Header;
