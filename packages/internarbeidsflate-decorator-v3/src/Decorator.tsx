import React, { PropsWithChildren, useMemo } from 'react';
import './index.css';
import useAppLogic from './hooks/useAppLogic';
import Banner from './components/Banner';
import Menu from './components/Menu';
import NewUserModal from './components/modals/NewUserModal';
import NewEnhetModal from './components/modals/NewEnhetModal';
import ErrorMessage from './components/ErrorMessageDisplay';
import { useOnOutsideClick } from './hooks/useOnOutsideClick';
import { useAppState } from './states/AppState';
import { DecoratorProps } from './types/AppProps';

const Decorator: React.FC<PropsWithChildren<DecoratorProps>> = (props) => {
  const memoizedProps = useMemo(
    () => ({
      ...props,
      ignoreExternalFnr: props.fnrSyncMode === 'writeOnly',
      fetchActiveUserOnMount:
        props.fnrSyncMode !== 'writeOnly' && props.fetchActiveUserOnMount,

      ignoreExternalEnhet: props.enhetSyncMode === 'writeOnly',
      fetchActiveEnhetOnMount:
        props.enhetSyncMode !== 'writeOnly' && props.fetchActiveEnhetOnMount,
    }),
    [props],
  );
  useAppLogic(memoizedProps);

  const ref = useOnOutsideClick<HTMLElement>(() =>
    useAppState.setState({ open: false }),
  );

  return (
    <>
      <div className="dekorator" data-theme="internarbeidsflatedecorator-theme">
        <header ref={ref} className="dr-font-arial dr-text-white">
          <Banner />
          <Menu />
          <ErrorMessage />
        </header>
      </div>
      <NewUserModal />
      <NewEnhetModal />
    </>
  );
};

export default Decorator;
