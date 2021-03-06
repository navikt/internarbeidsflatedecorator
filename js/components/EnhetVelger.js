import React, { Component, PropTypes } from 'react';

class HentEnhetListeInnerHTML extends Component {
    componentWillMount() {
        const { enhetliste, handleChangeEnhet, toggleSendEventVedEnEnhet = false } = this.props;
        if (enhetliste.length === 1 && toggleSendEventVedEnEnhet) {
            handleChangeEnhet(enhetliste[0].enhetId, 'init'); // Legger med en bool for å indikere om det er endring trigget av enhetsvalg eller ikke.
        }
    }

    render() {
        const { enhetliste, valgtEnhet = undefined, handleChangeEnhet } = this.props;
        if (enhetliste.length === 1) {
            return (
                <section className="dekorator-enhet">
                    <h2 className="typo-avsnitt">{`${enhetliste[0].enhetId} ${enhetliste[0].navn}`}</h2>
                </section>
            );
        }
        const options = enhetliste.map((enhet) => <option value={enhet.enhetId}>{`${enhet.enhetId} ${enhet.navn}`}</option>);

        const onChange = (event) => {
            if (event.type === 'change') { // Må sjekke ettersom chrome fyrer av change og input ved onChange. Dersom man bruker onInput fanges ikke det opp av IE.
                handleChangeEnhet(event.srcElement.value, 'select-change');
            }
        };

        return (
            <div className="dekorator-select-container">
                <select value={valgtEnhet} onChange={onChange}>
                    {options}
                </select>
            </div>
        );
    }
}

HentEnhetListeInnerHTML.propTypes = {
    enhetliste: PropTypes.arrayOf({
        enhetId: PropTypes.string,
        navn: PropTypes.string,
    }),
    valgtEnhet: PropTypes.string,
    handleChangeEnhet: PropTypes.func,
    toggleSendEventVedEnEnhet: PropTypes.bool,
};

const EnhetVelger = ({ enheter, valgtEnhet, handleChangeEnhet, toggleSendEventVedEnEnhet }) => {
    if (enheter.henter) {
        return <span aria-pressed="false" className="dekorator__hode__enhet">Henter...</span>;
    } else if (enheter.hentingFeilet) {
        return <span aria-pressed="false" className="dekorator__hode__enhet">Kunne ikke hente enheter</span>;
    }
    return <HentEnhetListeInnerHTML enhetliste={enheter.data.enhetliste} valgtEnhet={valgtEnhet} handleChangeEnhet={handleChangeEnhet} toggleSendEventVedEnEnhet={toggleSendEventVedEnEnhet} />;
};

EnhetVelger.propTypes = {
    enheter: PropTypes.arrayOf({
        henter: PropTypes.bool,
        hentingFeilet: PropTypes.bool,
        data: PropTypes.shape({
            enhetListe: PropTypes.arrayOf({
                enhetId: PropTypes.string,
                navn: PropTypes.string,
            }),
        }),
    }),
    valgtEnhet: PropTypes.string,
    handleChangeEnhet: PropTypes.func,
    toggleSendEventVedEnEnhet: PropTypes.bool,
};

export default EnhetVelger;
