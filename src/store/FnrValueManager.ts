import {
  ErrorMessageCode,
  PredefiniertFeilmeldinger,
} from '../types/ErrorMessage';
import { erGyldigFodselsnummer } from '../utils/fnrUtils';
import { ContextValueManager } from './ContextValueManager';
import { ErrorMessageManager } from './ErrorMessageManager';
import { PropsUpdateHandler } from './PropsUpdateHandler';
import { StoreProps } from './StoreHandler';
import { SubstateHandlerProps } from './SubstateHandler';

export class FnrValueManager extends ContextValueManager {
  #errorMessageManager: ErrorMessageManager;
  #propsUpdateHandler: PropsUpdateHandler;
  #onFnrUpdated: ((fnr?: string | null) => void) | undefined = undefined;

  #writeDisabled?: boolean;

  constructor(
    substateProps: SubstateHandlerProps,
    errorMessageMaanger: ErrorMessageManager,
    propsUpdateHandler: PropsUpdateHandler,
  ) {
    super(substateProps);
    this.#errorMessageManager = errorMessageMaanger;
    this.#propsUpdateHandler = propsUpdateHandler;
    this.#registerPropsHandler();
  }

  override initialize = async ({
    veileder,
    fnr,
    userKey,
    onFnrChanged,
    fnrWriteDisabled,
  }: StoreProps) => {
    this.#onFnrUpdated = onFnrChanged;
    this.#writeDisabled = !!fnrWriteDisabled;
    if (!veileder.ident) {
      this.changeFnrLocally();
      return;
    }
    const fnrKey = await this.#getFnr(fnr, userKey);
    if (fnrKey && !erGyldigFodselsnummer(fnrKey)) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.FNR_UKJENT_FEIL,
      );
      return;
    }
    if (fnrKey) {
      await this.changeFnrLocallyAndExternally(fnrKey);
    }
  };

  #registerPropsHandler = () => {
    this.#propsUpdateHandler.registerCallback(
      'fnrValueManager',
      this.initialize,
      'fnr',
      'userKey',
    );
  };

  readonly updateFnrLocallyToMatchContextHolder = async () => {
    const activeUser = await this.contextHolderApi.getVeiledersActiveFnr();
    if (activeUser.error) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.HENT_BRUKER_CONTEXT_FEILET,
      );
      return;
    }
    this.changeFnrLocally(activeUser.data?.aktivBruker);
  };

  readonly changeFnrLocally = (newFnr?: string | null) => {
    const oldValue = this.state.fnr.value;
    this.setValue('fnr', {
      value: newFnr,
      display: newFnr,
      wsRequestedValue: undefined,
      showModal: false,
    });
    if (!this.#onFnrUpdated) {
      return;
    }
    if (oldValue !== newFnr) this.#onFnrUpdated(newFnr);
  };

  readonly changeFnrLocallyToWsRequestedValue = () => {
    this.changeFnrLocally(this.state.fnr.wsRequestedValue);
    this.closeModal('fnr');
  };

  readonly changeFnrLocallyAndExternally = async (newFnr?: string) => {
    this.optimisticUpdate('fnr');
    this.changeFnrLocally(newFnr);
    if (this.#writeDisabled) {
      return;
    }

    const res = await this.contextHolderApi.changeFnr(newFnr);
    if (res.error) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
      );
    }
  };

  readonly changeFnrExternallyToLocalValue = async () => {
    const revert = this.optimisticUpdate('fnr');
    this.clearWSRequestedValue('fnr');
    this.closeModal('fnr');
    const res = await this.contextHolderApi.changeFnr(this.state.fnr.value);
    if (res.error) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
      );
      revert();
    }
  };

  readonly setWSFnrRequestedValue = (value: string) => {
    this.setWSRequestedValue('fnr', value);
  };

  readonly openFnrModal = () => this.openModal('fnr');

  readonly clearFnrExternally = async () => {
    const res = await this.contextHolderApi.clearFnr();
    if (res.error) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.OPPDATER_BRUKER_CONTEXT_FEILET,
      );
    }
  };

  readonly clearFnr = async () => {
    this.changeFnrLocally();
    await this.clearFnrExternally();
    this.#propsUpdateHandler.clearOldValue('fnr');
  };

  #getFnr = async (
    initialFnr: string | undefined,
    userKey: string | undefined,
  ): Promise<string | undefined> => {
    let fnr = initialFnr;

    if (userKey?.length && !erGyldigFodselsnummer(userKey)) {
      const res = await this.contextHolderApi.exhangeUserKeyForFnr(userKey);
      if (res.error || !res.data) {
        this.#errorMessageManager.addErrorMessage({
          code: ErrorMessageCode.BYTT_BRUKERNØKKEL_FEILET,
          message: 'Klarte ikke å bytte inn brukernøkkel til fnr.',
        });
      } else {
        fnr = res.data.fnr;
      }
    } else if (userKey?.length && erGyldigFodselsnummer(userKey)) {
      fnr = userKey;
    }
    return fnr;
  };
}
