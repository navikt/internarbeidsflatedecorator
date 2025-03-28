import { WebSocketWrapper } from '../api/WebSocketWrapper';
import { PredefiniertFeilmeldinger } from '../types/ErrorMessage';
import { WebSocketMessage } from '../types/WebsocketMessage';
import { erGyldigFodselsnummer, makeFnrFeilmelding } from '../utils/fnrUtils';
import { EnhetValueManager } from './EnhetValueManager';
import { ErrorMessageManager } from './ErrorMessageManager';
import { FnrValueManager } from './FnrValueManager';
import { StoreProps } from './StoreHandler';
import { SubstateHandler, SubstateHandlerProps } from './SubstateHandler';

export type EventHandlerOptions = {
  ignoreExternalFnr?: boolean | undefined;
  ignoreExternalEnhet?: boolean | undefined;
};

export class EventHandler extends SubstateHandler {
  #webSocketWrapper?: WebSocketWrapper | undefined;
  #errorMessageManager: ErrorMessageManager;
  #fnrValueManager: FnrValueManager;
  #enhetValueManager: EnhetValueManager;

  #options: EventHandlerOptions = {};

  constructor(
    substateProps: SubstateHandlerProps,
    fnrValueManager: FnrValueManager,
    enhetValueManager: EnhetValueManager,
    errorMessageManager: ErrorMessageManager,
  ) {
    super(substateProps);
    this.#fnrValueManager = fnrValueManager;
    this.#enhetValueManager = enhetValueManager;
    this.#errorMessageManager = errorMessageManager;
  }

  initialize = ({
    wsUrl,
    veileder,
    ignoreExternalEnhet,
    ignoreExternalFnr,
  }: StoreProps) => {
    this.#webSocketWrapper = new WebSocketWrapper(`${wsUrl}${veileder.ident}`, {
      onMessage: this.#onWSMessage,
      onError: this.#onWSError,
    });
    this.#webSocketWrapper.open();
    this.registerShutdown('websocketwrapper', this.#webSocketWrapper.close);

    this.#options.ignoreExternalFnr = ignoreExternalFnr;
    this.#options.ignoreExternalEnhet = ignoreExternalEnhet;
  };

  #onWSMessage = (message: MessageEvent<WebSocketMessage>) => {
    const data = message.data;
    if (data === 'NY_AKTIV_BRUKER') {
      void this.#handleFnrChangedExternally();
    } else if (data === 'NY_AKTIV_ENHET') {
      void this.#handleEnhetChangedExternally();
    }
  };

  #onWSError = () => {
    this.#errorMessageManager.clearAllErrorMessages();
    this.#errorMessageManager.addErrorMessage(
      PredefiniertFeilmeldinger.WS_ERROR,
    );
  };

  #handleFnrChangedExternally = async () => {
    if (this.#options.ignoreExternalFnr) return;

    const response = await this.contextHolderApi.getVeiledersActiveFnr();
    if (response.error || !response.data || !response.data.aktivBruker) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.HENT_BRUKER_CONTEXT_FEILET,
      );
      return;
    }
    const { aktivBruker } = response.data;
    if (!this.state.fnr.value) {
      this.#fnrValueManager.setWSFnrRequestedValue(aktivBruker);
      this.#fnrValueManager.changeFnrLocallyToWsRequestedValue();
    } else if (
      this.#checkThatUpdateIsNewAndNotAwaitingAccept('fnr', aktivBruker)
    ) {
      this.#fnrValueManager.setWSFnrRequestedValue(aktivBruker);
      this.#fnrValueManager.openFnrModal();
    }
  };

  #handleEnhetChangedExternally = async () => {
    if (this.#options.ignoreExternalEnhet) return;

    const response = await this.contextHolderApi.getVeiledersActiveEnhet();
    if (response.error || !response.data || !response.data.aktivEnhet) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.HENT_ENHET_FEILET,
      );
      return;
    }
    const { aktivEnhet } = response.data;
    if (this.#checkThatUpdateIsNewAndNotAwaitingAccept('enhet', aktivEnhet)) {
      this.#enhetValueManager.setWSEnhetRequestedValue(aktivEnhet);
      this.#enhetValueManager.openEnhetModal();
    }
  };

  #checkThatUpdateIsNewAndNotAwaitingAccept = (
    key: 'fnr' | 'enhet',
    newValue: string,
  ) =>
    newValue !== this.state[key].value &&
    newValue !== this.state[key].wsRequestedValue;

  readonly changeFnr = (newFnr?: string) => {
    this.#errorMessageManager.clearAllErrorMessages();
    if (!newFnr) {
      void this.#fnrValueManager.clearFnr();
      return;
    }
    if (!erGyldigFodselsnummer(newFnr)) {
      const errorMessage = makeFnrFeilmelding(newFnr);
      if (errorMessage) {
        this.#errorMessageManager.addErrorMessage(errorMessage);
      }
      return;
    }
    void this.#fnrValueManager.changeFnrLocallyAndExternally(newFnr);
  };
}
