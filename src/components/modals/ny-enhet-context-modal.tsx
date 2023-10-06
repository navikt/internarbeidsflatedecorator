import React from 'react';
import { Alert, BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import { useDispatch } from 'react-redux';
import { useInitializedState } from '../../hooks/use-initialized-state';
import { isEnabled } from '../../internal-domain';
import { SagaActionTypes } from '../../redux/actions';

function NyEnhetContextModal() {
    const dispatch = useDispatch();
    const enhetState = useInitializedState((state) => state.enhet);
    if (!isEnabled(enhetState)) {
        return null;
    }

    const onDecline = () => {
        dispatch({ type: SagaActionTypes.WS_ENHET_DECLINE });
    };
    const onAcceptHandler = () => {
        dispatch({ type: SagaActionTypes.WS_ENHET_ACCEPT });
    };

    return (
        <Modal
            header={{
                heading: 'Enhet i kontekst endret',
                closeButton: false
            }}
            open={enhetState.showModal}
        >
            <div className="p-6 space-y-4">
                <Heading level="1" size="small">
                    Du har endret Enhet
                </Heading>
                <Alert variant="warning">
                    Du har endret enhet i et annet vindu. Du kan ikke jobbe i 2 enheter samtidig.
                    Velger du 'endre' mister du arbeidet du ikke har lagret.
                </Alert>
                <BodyShort>
                    Ønsker du å endre enhet til{' '}
                    {enhetState.wsRequestedValue.withDefault('Ukjent enhet')}?
                </BodyShort>
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

export default React.memo(NyEnhetContextModal);
