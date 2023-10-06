import React from 'react';
import { useDispatch } from 'react-redux';
import { useInitializedState } from '../../hooks/use-initialized-state';
import { isEnabled } from '../../internal-domain';
import { SagaActionTypes } from '../../redux/actions';
import { Alert, BodyShort, Button, Heading, Modal } from '@navikt/ds-react';

function NyBrukerContextModal() {
    const dispatch = useDispatch();
    const fnrState = useInitializedState((state) => state.fnr);
    if (!isEnabled(fnrState)) {
        return null;
    }
    const onDecline = () => {
        dispatch({ type: SagaActionTypes.WS_FNR_DECLINE });
    };
    const onAcceptHandler = () => {
        dispatch({ type: SagaActionTypes.WS_FNR_ACCEPT });
    };

    return (
        <Modal
            header={{
                heading: 'Bruker i kontekst endret',
                closeButton: true
            }}
            open={fnrState.showModal}
            onBeforeClose={() => true}
        >
            <div className="p-6 space-y-4">
                <Heading size="small" level="1">
                    Du har endret bruker
                </Heading>
                <Alert variant="warning">
                    Du har endret bruker i et annet vindu. Du kan ikke jobbe med 2 brukere samtidig.
                    Velger du å endre bruker mister du arbeidet du ikke har lagret.
                </Alert>
                <BodyShort>{`Ønsker du å endre bruker til ${fnrState.wsRequestedValue.withDefault(
                    'Ukjent FNR'
                )}?`}</BodyShort>
                <div className="decorator-context-modal__footer">
                    <Button variant="primary" onClick={onAcceptHandler}>
                        Endre
                    </Button>
                    <Button variant="secondary" onClick={onDecline}>
                        Behold
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default NyBrukerContextModal;
