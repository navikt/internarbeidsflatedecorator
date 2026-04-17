import { ContextValue } from '../types/ContextValue';
import { Enhet } from '../types/Enhet';
import { PredefiniertFeilmeldinger } from '../types/ErrorMessage';
import { ContextValueManager } from './ContextValueManager';
import { ErrorMessageManager } from './ErrorMessageManager';
import { FnrValueManager } from './FnrValueManager';
import { PropsUpdateHandler } from './PropsUpdateHandler';
import { StoreProps } from './StoreHandler';
import { SubstateHandlerProps } from './SubstateHandler';

type EnhetContextValue = ContextValue<Enhet>;

export class EnhetValueManager extends ContextValueManager {
  #errorMessageManager: ErrorMessageManager;
  #fnrValueManager: FnrValueManager;
  #propsUpdateHandler: PropsUpdateHandler;
  #onEnhetChanged:
    | ((newEnhet?: string | null, enhetObject?: Enhet) => void)
    | undefined = undefined;

  #writeDisabled?: boolean;
  constructor(
    substateProps: SubstateHandlerProps,
    errorMessageManager: ErrorMessageManager,
    fnrValueManager: FnrValueManager,
    propsUpdateHandler: PropsUpdateHandler,
  ) {
    super(substateProps);
    this.#errorMessageManager = errorMessageManager;
    this.#fnrValueManager = fnrValueManager;
    this.#propsUpdateHandler = propsUpdateHandler;
  }

  override initialize = async ({
    enhet,
    onEnhetChanged,
    veileder,
    enhetWriteDisabled,
  }: StoreProps) => {
    this.#registerPropsHandler();
    this.#onEnhetChanged = onEnhetChanged;
    this.#writeDisabled = !!enhetWriteDisabled;
    if (enhet && enhet === this.state.enhet.value) {
      return;
    }

    const enheter = veileder.enheter;
    if (!enheter?.length) {
      await this.#resetFnrAndEnhetDueToNoLegalEnhet();
      return;
    }

    return this.#updateEnhetExternallyToMatchRequestedEnhet(enheter, enhet);
  };

  readonly #registerPropsHandler = () => {
    this.#propsUpdateHandler.registerCallback(
      'enhetValueManager',
      this.initialize,
      'enhet',
    );
  };

  readonly updateEnhetLocallyToMatchContextHolder = async () => {
    const enheter = this.state.veileder?.enheter;
    if (!enheter?.length) return;

    const passendeEnhet = enheter[0];

    const activeEnhet = await this.contextHolderApi.getVeiledersActiveEnhet();
    if (activeEnhet.error || !activeEnhet.data) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.HENT_ENHET_FEILET,
      );
      return this.changeEnhetLocallyAndExternally(
        enheter,
        passendeEnhet.enhetId,
      );
    }
    return this.#changeEnhetLocally(enheter, activeEnhet.data.aktivEnhet);
  };

  readonly #updateEnhetExternallyToMatchRequestedEnhet = async (
    enheter: Enhet[],
    enhet?: string,
  ) => {
    if (!enhet || !this.#haveLegalEnhet(enhet, enheter)) {
      return this.changeEnhetLocallyAndExternally(enheter, enheter[0].enhetId);
    }
    return this.changeEnhetLocallyAndExternally(enheter, enhet);
  };

  readonly #resetFnrAndEnhetDueToNoLegalEnhet = async () => {
    await this.#fnrValueManager.changeFnrLocallyAndExternally();
    await this.changeEnhetLocallyAndExternally([]);
    this.#errorMessageManager.addErrorMessage(
      PredefiniertFeilmeldinger.INGEN_GYLDIG_ENHET,
    );
  };

  readonly #updateEnhet = (newEnhet?: Enhet | null): EnhetContextValue => {
    const tmpEnhet = { ...this.state.enhet };
    tmpEnhet.value = newEnhet?.enhetId;
    tmpEnhet.display = newEnhet;
    tmpEnhet.wsRequestedValue = undefined;
    return tmpEnhet;
  };

  readonly setWSEnhetRequestedValue = (value: string) => {
    this.setWSRequestedValue('enhet', value);
  };

  readonly openEnhetModal = () => this.openModal('enhet');

  readonly changeEnhetLocallyToWsRequestedValue = () => {
    if (!this.state.veileder?.enheter) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.WS_ERROR,
      );
      return;
    }

    this.#changeEnhetLocally(
      this.state.veileder.enheter,
      this.state.enhet.wsRequestedValue,
    );
    this.closeModal('enhet');
  };

  readonly #changeEnhetLocally = (
    veiledersEnheter: Enhet[],
    newEnhetId?: string | null,
  ) => {
    if (!newEnhetId || !veiledersEnheter.length) {
      const enhet = this.#updateEnhet(undefined);
      this.setState({ enhet });
      if (this.#onEnhetChanged) this.#onEnhetChanged(newEnhetId);
      return;
    }

    const matchendeEnhet = veiledersEnheter.find(
      (enhet) => enhet.enhetId === newEnhetId,
    );

    if (!matchendeEnhet) {
      this.#errorMessageManager.addErrorMessage(
        PredefiniertFeilmeldinger.HENT_ENHET_FEILET,
      );
      const enhet = this.#updateEnhet(null);
      this.setState({ enhet });
      if (this.#onEnhetChanged) this.#onEnhetChanged(null);
      return;
    }

    const enhet = this.#updateEnhet(matchendeEnhet);
    this.setState({ enhet });
    if (this.#onEnhetChanged) this.#onEnhetChanged(newEnhetId, matchendeEnhet);
  };

  readonly changeEnhetLocallyAndExternally = async (
    enheter: Enhet[],
    newEnhetId?: string,
  ) => {
    this.#changeEnhetLocally(enheter, newEnhetId);

    if (this.#writeDisabled) {
      return;
    }

    return this.contextHolderApi.changeEnhet(newEnhetId);
  };

  readonly changeEnhetExternallyToLocalValue = async () => {
    await this.contextHolderApi.changeEnhet(this.state.enhet.value);
    this.clearWSRequestedValue('enhet');
    this.closeModal('enhet');
  };

  readonly clearEnhet = () => {
    this.#changeEnhetLocally([]);
  };

  #haveLegalEnhet = (requestedEnhet: string, enheter: Enhet[]) =>
    enheter.some((enhet) => enhet.enhetId === requestedEnhet);
}
