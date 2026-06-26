import React from 'react';
import { ChevronDownIcon } from '@navikt/aksel-icons';

export const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  return (
    <div
      className={`${
        isOpen ? 'dr:rotate-180 ' : 'dr:rotate-0'
      } dr:transform dr:transition dr:duration-150`}
    >
      <ChevronDownIcon aria-hidden className="w-full h-full" />
    </div>
  );
};
