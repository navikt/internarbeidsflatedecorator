import React, { ChangeEventHandler, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { guid } from 'nav-frontend-js-utils';
import visibleIf from './visibleIf';
import { SagaActions, SagaActionTypes } from '../redux/actions';
import { useInitializedState } from '../hooks/use-initialized-state';
import { useEnhetContextvalueState } from '../hooks/use-contextvalue-state';
import EnhetVisning from './enhet';
import './enhetvelger.css';
import { Enhet } from '../internal-domain';

function EnhetVelger() {
    const dispatch = useDispatch<Dispatch<SagaActions>>();
    const id = useRef(guid());
    const valgtEnhet = useEnhetContextvalueState().withDefault(undefined);
    const enheter: Array<Enhet> = useInitializedState((state) => state.data.saksbehandler)
        .map((saksbehandler) => saksbehandler.enheter)
        .withDefault([]);

    if (enheter.length === 1) {
        return <EnhetVisning visible={true} />;
    }

    const onChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
        dispatch({ type: SagaActionTypes.ENHETCHANGED, data: event.target.value });
    };
    const options = enheter.map((enhet) => (
        <option
            key={enhet.enhetId}
            value={enhet.enhetId}
        >{`${enhet.enhetId} ${enhet.navn}`}</option>
    ));

    return (
        <div className="dekorator-select-container">
            <label htmlFor={id.current} className="visuallyhidden">
                Velg enhet
            </label>
            <select id={id.current} value={valgtEnhet} onChange={onChange}>
                {options}
            </select>
        </div>
    );
}

export default visibleIf(EnhetVelger);
