import React from 'react';
import { describe } from './hurtigtaster';
import { Hotkey } from '../../domain';
import { Modal } from '@navikt/ds-react';

interface Props {
    isOpen: boolean;
    close(): void;
    hurtigtaster: Hotkey[];
}

function HurtigtastModal(props: Props) {
    const rader = props.hurtigtaster.map(({ key, description }) => {
        const keyDescription = describe(key);
        return (
            <tr key={keyDescription}>
                <td>{keyDescription}</td>
                <td>{description}</td>
            </tr>
        );
    });
    return (
        <Modal
            open={props.isOpen}
            onBeforeClose={props.close}
            header={{ closeButton: true, heading: 'Hurtigtaster' }}
        >
            <div className="hurtigtaster-modal">
                <div className="hurtigtaster-tabell-outline typo-normal">
                    <table className="hurtigtaster-tabell">
                        <thead>
                            <tr>
                                <th>Tast</th>
                                <th>Beskrivelse</th>
                            </tr>
                        </thead>
                        <tbody>{rader}</tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
}

export default HurtigtastModal;
