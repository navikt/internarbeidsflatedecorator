import { Enhet } from '../types/Enhet';
import { Veileder } from '../types/Veileder';
import { ApiClient, FetchResponse } from './ApiClient';

interface AktivBrukerResponse {
  aktivBruker: string | undefined
}

interface AktivEnhetResponse {
  aktivEnhet: string | undefined
}

export interface ContextHolderAPI {
  exhangeUserKeyForFnr: (
    userKey: string,
  ) => Promise<FetchResponse<string>>

  changeFnr: (newFnr?: string | null) => Promise<FetchResponse<void>>

  changeEnhet: (newEnhet?: string | null) => Promise<FetchResponse<void>>;

  getEnhet: (enhetId: string) => Promise<FetchResponse<Enhet>>;

  getVeilederDetails: () => Promise<FetchResponse<Veileder>>;

  getVeiledersActiveFnr: () => Promise<FetchResponse<AktivBrukerResponse>>;

  getVeiledersActiveEnhet: () => Promise<FetchResponse<AktivEnhetResponse>>
}

export class ContextHolderAPIImpl extends ApiClient implements ContextHolderAPI {
  constructor(url: string, token?: string) {
    super(url, token);
  }

  readonly exhangeUserKeyForFnr = (
    userKey: string,
  ): Promise<FetchResponse<string>> => {
    return this.post<string>({ path: `/bytt-bruker-nokkel`, body: { userKey } });
  };

  readonly changeFnr = (newFnr?: string | null): Promise<FetchResponse<void>> => {
    return this.post({ body: { eventType: 'NY_AKTIV_BRUKER', verdi: newFnr } });
  };

  readonly changeEnhet = (newEnhet?: string | null): Promise<FetchResponse<void>> => {
    return this.post({ body: { eventType: 'NY_AKTIV_ENHET', verdi: newEnhet } });
  };

  readonly getEnhet = (enhetId: string): Promise<FetchResponse<Enhet>> => {
    return this.get<Enhet>({ path: `/enhet/${enhetId}` });
  };

  readonly getVeilederDetails = (
  ): Promise<FetchResponse<Veileder>> => {
    return this.get<Veileder>({ path: `/decorator` });
  };

  readonly getVeiledersActiveFnr = (
  ): Promise<FetchResponse<AktivBrukerResponse>> => {
    return this.get<AktivBrukerResponse>({ path: `/aktivbruker` });
  };

  readonly getVeiledersActiveEnhet = (
  ): Promise<FetchResponse<AktivEnhetResponse>> => {
    return this.get<AktivEnhetResponse>({ path: `/aktivenhet` });
  };
}
