import React, { ChangeEvent, useMemo } from 'react';
import { Select } from '@navikt/ds-react';
import StoreHandler from '../store/StoreHandler';

const EnhetVelger: React.FC = () => {
  const { enheter, enhetId } = StoreHandler.store((state) => ({
    enheter: state.veileder?.enheter,
    enhetId: state.enhet.value,
  }));

  const options: React.JSX.Element[] = useMemo(() => {
    if (!enheter?.length) return [];

    const enhetOptions = enheter.map((enhet) => (
      <option key={enhet.enhetId} value={enhet.enhetId}>
        {`${enhet.enhetId} ${enhet.navn}`}
      </option>
    ));

    return [
      <option value="" key="velg_enhet" disabled>
        Velg enhet
      </option>,
      ...enhetOptions,
    ];
  }, [enheter]);

  const onChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if (!enheter?.length) {
      throw new Error('Hadde ingen enheter når veileder prøvde å endre enhet');
    }
    const value = e.currentTarget.value;
    await StoreHandler.enhetValueManager.changeEnhetLocallyAndExternally(
      enheter,
      value,
    );
  };

  return (
    <Select
      value={enhetId ?? undefined}
      label="Velg enhet"
      onChange={onChange}
      hideLabel
    >
      {options}
    </Select>
  );
};

export default EnhetVelger;
