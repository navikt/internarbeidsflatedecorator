import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, TextField } from '@navikt/ds-react';
import '@navikt/ds-css/dist/index.css';
import { useTempValue } from './hooks/useTempValue';
import { WebSocketWrapper } from '../api/WebSocketWrapper';
import { ContextHolderAPI } from '../api/ContextHolderAPI';
import '../web-component';
import type {
  EnhetChangedDetail,
  FnrChangedDetail,
} from '../types/DecoratorEvents';

const WS_URL = 'ws://localhost:4000/ws';
const URL = 'http://localhost:4000/api';

const ident = 'Z999999';

const markup = JSON.stringify({
  etterSokefelt:
    '<button class="dr:font-black dr:bg-none dr:border-none">Min knapp</button>',
});

const Wrapper: React.FC = () => {
  const [enhet, tmpEnhet, setTmpEnhet, makeTheEnhetChange] = useTempValue('');
  const [fnr, tmpFnr, setTmpFnr, makeTheFnrChange] = useTempValue('');
  const [wsEnhet, setWsEnhet] = useState('');
  const [wsFnr, setWsFnr] = useState('');
  const [, setWebsocketHandler] = useState<WebSocketWrapper>();
  const [wsConnected, setWsConntected] = useState(false);
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [propsUpdates, setPropsUpdates] = useState<string[]>([]);
  const [api] = useState(() => new ContextHolderAPI(URL));
  const decoratorRef = useRef<InternarbeidsflateDecoratorElement>(null);

  useLayoutEffect(() => {
    const el = decoratorRef.current;
    if (!el) return;

    const onEnhetChanged = (event: CustomEvent<EnhetChangedDetail>) => {
      const { enhet } = event.detail;
      setTmpEnhet(enhet ?? '', true);
      setPropsUpdates((updates) => [
        ...updates,
        `Ny enhet fra dekoratør: ${enhet}`,
      ]);
    };

    const onFnrChanged = (event: CustomEvent<FnrChangedDetail>) => {
      const { fnr } = event.detail;
      setTmpFnr(fnr ?? '', true);
      setPropsUpdates((updates) => [
        ...updates,
        `Ny fnr fra dekoratør: ${fnr}`,
      ]);
    };

    el.addEventListener('enhet-changed', onEnhetChanged);
    el.addEventListener('fnr-changed', onFnrChanged);
    return () => {
      el.removeEventListener('enhet-changed', onEnhetChanged);
      el.removeEventListener('fnr-changed', onFnrChanged);
    };
  }, [setTmpEnhet, setTmpFnr]);

  useEffect(() => {
    if (ident) {
      const websocketHandler = new WebSocketWrapper(`${WS_URL}/${ident}`, {
        onOpen: () => setWsConntected(true),
        onClose: () => setWsConntected(false),
        onMessage: (event: MessageEvent<string>) => {
          setWsMessages((messages) => {
            return [...messages, event.data];
          });
        },
      });
      websocketHandler.open();
      setWebsocketHandler(websocketHandler);
      return () => websocketHandler.close();
    }
  }, []);

  const sendNewEnhet = async () => {
    await api.changeEnhet(wsEnhet);
  };

  const sendNewFnr = async () => {
    await api.changeFnr(wsFnr);
  };

  return (
    <>
      <div className="dr:w-full dr:top-0">
        <internarbeidsflate-decorator
          ref={decoratorRef}
          app-name="Test app"
          environment="q2"
          url-format="LOCAL"
          enhet={enhet}
          fnr={fnr}
          markup={markup}
          enable-hotkeys
          show-enheter
          show-search-area
          show-hotkeys
          fetch-active-enhet-on-mount
          fetch-active-user-on-mount
        />
      </div>
      <div className="dr:fixed dr:bottom-0 dr:p-4 dr:border dr:rounded-md dr:border-gray-700 dr:w-full dr:-z-10">
        <div className="dr:text-center dr:text-2xl dr:mb-6">Simulator</div>
        <div>
          <div className="dr:text-center dr:w-full dr:text-lg">Wrapper</div>
          <div className="dr:flex dr:justify-center dr:w-full">
            <div className="dr:mx-2">
              <TextField
                className="dr:mb-2"
                label="Enhet"
                value={tmpEnhet}
                onChange={(e) => setTmpEnhet(e.target.value)}
              />
              <Button onClick={makeTheEnhetChange}>Endre enhet</Button>
            </div>
            <div className="dr:mx-2">
              <TextField
                className="dr:mb-2"
                label="Aktivt fnr"
                value={tmpFnr}
                onChange={(e) => setTmpFnr(e.target.value)}
              />
              <Button onClick={makeTheFnrChange}>Endre fnr</Button>
            </div>
            <div className="dr:mx-2">
              Oppdateringer fra dekoratør
              <ul className="dr:overflow-y-auto dr:h-32 dr:w-96">
                {propsUpdates.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <hr className="dr:my-12" />
        <div className="dr:text-center dr:w-full dr:mt-8 dr:mb-2">
          WS oppdatering
        </div>
        <div className="dr:text-center">WS tilkoblet: {`${wsConnected}`}</div>
        <div className="dr:flex dr:justify-center dr:w-full">
          <div className="dr:mx-2">
            <TextField
              className="dr:mb-2"
              label="Aktiv enhet"
              value={wsEnhet}
              onChange={(e) => setWsEnhet(e.target.value)}
            />
            <Button onClick={sendNewEnhet}>Endre aktiv enhet</Button>
          </div>
          <div className="dr:mx-2">
            <TextField
              className="dr:mb-2"
              label="Aktivt fnr"
              value={wsFnr}
              onChange={(e) => setWsFnr(e.target.value)}
            />
            <Button onClick={sendNewFnr}>Endre aktivt fnr</Button>
          </div>
          <div className="dr:mx-2">
            Innkommende meldinger
            <ul className="dr:overflow-y-auto dr:h-32 dr:w-96">
              {wsMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wrapper;
