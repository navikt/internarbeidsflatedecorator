import { AppState } from '../states/AppState';
import { Enhet } from './Enhet';

interface DomainProps {
  enhet?: string | undefined;
  accessToken?: string | undefined;
  includeCredentials?: boolean | undefined;
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

  ignoreExternalFnr?: boolean;
  ignoreExternalEnhet?: boolean;
  enhetWriteDisabled?: boolean;
  fnrWriteDisabled?: boolean;
}

export interface AppProps extends DomainProps, Omit<AppState, 'open'> {}

export interface DecoratorProps extends Omit<
  AppProps,
  | 'ignoreExternalFnr'
  | 'ignoreExternalEnhet'
  | 'enhetWriteDisabled'
  | 'fnrWriteDisabled'
> {
  fnrSyncMode?: 'writeOnly' | 'sync' | 'ignore';
  enhetSyncMode?: 'writeOnly' | 'sync' | 'ignore';
}
