import { StoreApi, UseBoundStore, create } from 'zustand';

export class StateHandler<T, P> {
  readonly state!: Readonly<T>;
  props?: P;
  #store: UseBoundStore<StoreApi<T>>;
  store: UseBoundStore<Omit<StoreApi<T>, 'setState'>>;

  constructor(initialState: T) {
    this.#store = create<T>(() => initialState);
    this.store = this.#createProxyStore();
    Object.defineProperty(this, 'state', {
      get: () => this.getState(),
    });
  }

  getStore = () => this.#store;

  getState = () => this.#store.getState();

  setState = (stateUpdate: Partial<T>, replace?: boolean) => {
    const modifiedState = this.onBeforeStateUpdated(
      stateUpdate,
      this.#store.getState(),
    );
    if (replace) {
      this.#store.setState(modifiedState as T, true);
    } else {
      this.#store.setState(modifiedState);
    }
  };

  onBeforeStateUpdated = (
    stateUpdate: Partial<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _oldState: T,
  ): Partial<T> => {
    return stateUpdate;
  };

  setProps = (props: P) => (this.props = props);

  #createProxyStore = (): UseBoundStore<Omit<StoreApi<T>, 'setState'>> => {
    return new Proxy(this.#store, {
      get(target, prop: keyof UseBoundStore<StoreApi<T>>) {
        if (prop === 'setState') {
          return undefined;
        }
        return target;
      },
    });
  };
}
