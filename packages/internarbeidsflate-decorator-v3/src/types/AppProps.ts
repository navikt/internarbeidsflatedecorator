import { AppState } from '../states/AppState';
import { Enhet } from './Enhet';

interface DomainProps {
  enhet?: string | undefined;
  accessToken?: string | undefined;
  fnr?: string | undefined;
  userKey?: string | undefined;
  enableHotkeys?: boolean | undefined;
  fetchActiveEnhetOnMount?: boolean | undefined;
  fetchActiveUserOnMount?: boolean | undefined;
  onBeforeRequest?: (headers: HeadersInit) => HeadersInit | undefined;
  onEnhetChanged: (enhet?: string | null, enhetObjekt?: Enhet) => void;
  onFnrChanged: (fnr?: string | null) => void;
  onLinkClick?: (link: { text: string; url: string }) => void;
  websocketUrl?: string | undefined;
}

export interface AppProps extends DomainProps, Omit<AppState, 'open'> {}
