import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { erGyldigFodselsnummer, lagFodselsnummerfeilmelding } from '../utils/fodselsnummer';

class Sokefelt extends React.Component {

    constructor(props) {
        super(props);
        this.inputRef = null;
        this.state = {
            valideringsfeil: false,
            value: props.fnr,
        };
    }

    componentDidMount() {
        if (this.props.autoSubmit) {
            this.onEnter(this.props.fnr);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fnr === this.props.fnr) {
            return;
        }
        this.setState(() => (
            {
                valideringsfeil: false,
                value: nextProps.fnr,
            })
        );
    }

    onEnter = (fodselsnummer) => {
        if (erGyldigFodselsnummer(fodselsnummer)) {
            this.props.triggerPersonsokEvent(fodselsnummer);
        } else {
            this.props.visFeilmelding(lagFodselsnummerfeilmelding(fodselsnummer));
            this.setState(...this.state, { valideringsfeil: true });
        }
    };

    onSubmit = (event) => {
        event.preventDefault();
        const input = this.state.value.replace(/\s/g, '');
        this.onEnter(input);
    };

    onReset = (event) => {
        event.preventDefault();
        this.setState({ value: '' });
        this.props.triggerFjernPersonEvent();
    };

    sokefeltEndret = (event) => {
        this.setState({
            value: event.target.value,
        });

        this.props.fjernFeilmelding();
        this.setState({ valideringsfeil: false });
    };

    render() {
        const sokefeltKlasser = classNames({
            dekorator__sokefelt__input: true,
            dekorator__sokefelt__valideringsfeil: this.state.valideringsfeil,
        });

        const visSokeIkon = !this.state.value || this.props.fnr !== this.state.value;

        return (
            <section>
                <form className="dekorator__sokefelt" onSubmit={this.onSubmit} onReset={this.onReset}>
                    <label className="visuallyhidden" htmlFor="js-deokorator-sokefelt">
                        Personsøk
                    </label>
                    <input
                        id="js-deokorator-sokefelt"
                        ref={(inputRef) => { this.inputRef = inputRef; }}
                        onChange={this.sokefeltEndret}
                        className={sokefeltKlasser}
                        placeholder="Personsøk"
                        type="search"
                        value={this.state.value}
                        autoComplete="off"
                    />
                    { visSokeIkon && <input
                        id="forstorrelsesglass_sokefelt"
                        type="submit"
                        value="Søk"
                        className="dekorator__sokefelt__ikon dekorator__forstorrelsesglass--hvit"
                    /> }
                    { !visSokeIkon && <input
                        id="forstorrelsesglass_sokefelt"
                        type="reset"
                        value="reset"
                        className="dekorator__sokefelt__ikon dekorator__kryss--hvit"
                        onClick={() => {
                            if (this.inputRef) {
                                this.inputRef.focus();
                            }
                        }}
                    /> }
                </form>
            </section>
        );
    }
}

Sokefelt.propTypes = {
    autoSubmit: PropTypes.bool,
    triggerPersonsokEvent: PropTypes.func,
    triggerFjernPersonEvent: PropTypes.func,
    visFeilmelding: PropTypes.func,
    fjernFeilmelding: PropTypes.func,
    fnr: PropTypes.string,
};

export default Sokefelt;
