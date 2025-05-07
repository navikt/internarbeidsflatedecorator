import type React from 'react';
import { type PropsWithChildren, useMemo } from 'react';
import './index.bundled.css';
import Banner from './components/Banner';
import ErrorMessage from './components/ErrorMessageDisplay';
import Menu from './components/Menu';
import NewEnhetModal from './components/modals/NewEnhetModal';
import NewUserModal from './components/modals/NewUserModal';
import useAppLogic from './hooks/useAppLogic';
import { useOnOutsideClick } from './hooks/useOnOutsideClick';
import { useAppState } from './states/AppState';
import type { AppProps, DecoratorProps } from './types/AppProps';

const Decorator: React.FC<PropsWithChildren<DecoratorProps>> = (props) => {
  const memoizedProps = useMemo(
    () =>
      ({
        ...props,
        ignoreExternalFnr:
          props.fnrSyncMode === 'writeOnly' || props.fnrSyncMode === 'ignore',
        fetchActiveUserOnMount:
          props.fnrSyncMode !== 'writeOnly' &&
          props.fnrSyncMode !== 'ignore' &&
          props.fetchActiveUserOnMount,

        ignoreExternalEnhet:
          props.enhetSyncMode === 'writeOnly' ||
          props.enhetSyncMode === 'ignore',
        fetchActiveEnhetOnMount:
          props.enhetSyncMode !== 'writeOnly' &&
          props.enhetSyncMode !== 'ignore' &&
          props.fetchActiveEnhetOnMount,

        fnrWriteDisabled: props.fnrSyncMode === 'ignore',
        enhetWriteDisabled: props.enhetSyncMode === 'ignore',
      }) satisfies AppProps,
    [props],
  );
  useAppLogic(memoizedProps);

  const ref = useOnOutsideClick<HTMLElement>(() =>
    useAppState.setState({ open: false }),
  );

  return (
    <div className="dekorator">
      <div className="dekorator" data-theme="internarbeidsflatedecorator-theme">
        <header ref={ref} className="dr:font-arial dr:text-white">
          <Banner />
          <Menu />
          <ErrorMessage />
        </header>
      </div>
      <NewUserModal />
      <NewEnhetModal />
    </div>
  );
};

export default Decorator;
