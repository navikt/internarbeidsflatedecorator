import { WebSocketListener } from '../types/WebSocketListener';
const SECONDS: number = 1000;
const MINUTES: number = 60 * SECONDS;
const MAX_RETRIES: number = 3;

const CLOSE_DELAY = 2 * SECONDS;
const RETRY_DELAY = 5 * SECONDS;

export enum Status {
  INIT = 'INIT',
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  REFRESH = 'REFRESH',
}

const fuzzy = (min: number, max: number): number => {
  const diff = max - min;
  const rnd = Math.round(Math.random() * diff);
  return min + rnd;
};

const createDelay = (basedelay: number): number => {
  return basedelay + fuzzy(5 * SECONDS, 15 * SECONDS);
};

const createRetrytime = (tryCount: number): number => {
  if (tryCount === MAX_RETRIES) {
    return Number.MAX_SAFE_INTEGER;
  }

  const basedelay = RETRY_DELAY;
  return basedelay;
};

export class WebSocketWrapper {
  #status: Status;
  #wsUrl: string;
  readonly #listener: WebSocketListener;

  private connection?: WebSocket;
  private resettimer?: ReturnType<typeof window.setTimeout> | null;
  private retrytimer?: ReturnType<typeof window.setTimeout> | null;
  private retryCounter = 0;

  constructor(wsUrl: string, listener: WebSocketListener) {
    this.#wsUrl = wsUrl;
    this.#listener = listener;
    this.#status = Status.INIT;
  }

  readonly open = () => {
    if (this.#status === Status.CLOSE) {
      WebSocketWrapper.#print('Stopping creation of WS, since it is closed');
      return;
    }
    WebSocketWrapper.#print('Opening WS', this.#wsUrl);
    this.connection = new WebSocket(this.#wsUrl);
    this.connection.addEventListener('open', this.#onWSOpen);
    this.connection.addEventListener('message', this.#onWSMessage);
    this.connection.addEventListener('error', this.#onWSError);
    this.connection.addEventListener('close', this.#onWSClose);
  };

  readonly close = () => {
    WebSocketWrapper.#print('Closing WS', this.#wsUrl);
    this.#clearResetTimer();
    this.#clearRetryTimer();
    this.#status = Status.CLOSE;
    if (this.connection) {
      this.connection.close();
    }
  };

  readonly sendMessage = (message: string) => {
    this.connection?.send(message);
  };

  get status() {
    return this.#status;
  }

  #onWSOpen = (event: Event) => {
    WebSocketWrapper.#print('open', event);
    this.#clearResetTimer();
    this.#clearRetryTimer();
    const delay = createDelay(45 * MINUTES);
    WebSocketWrapper.#print('Creating resettimer', delay);

    this.resettimer = setTimeout(() => {
      this.#status = Status.REFRESH;
      if (this.connection) {
        this.connection.close();
      }
    }, delay);

    this.#status = Status.OPEN;

    if (this.#listener.onOpen) {
      this.#listener.onOpen(event);
    }
  };

  #onWSMessage = (event: MessageEvent) => {
    WebSocketWrapper.#print('message', event);
    if (this.#listener.onMessage) {
      this.#listener.onMessage(event);
    }
  };

  #onWSError = (event: Event) => {
    WebSocketWrapper.#printError('error', event);
    if (this.retryCounter < MAX_RETRIES) {
      const delay = createRetrytime(this.retryCounter++);
      this.#clearRetryTimer();
      this.retrytimer = setTimeout(() => this.open(), delay);
      return;
    }
    if (this.#listener.onError) {
      this.#listener.onError(event);
    }
  };

  #onWSClose = (event: CloseEvent) => {
    WebSocketWrapper.#print('close', event);
    if (this.#status === Status.REFRESH) {
      this.open();
      return;
    }

    if (this.#status !== Status.CLOSE) {
      const delay = CLOSE_DELAY;
      this.retrytimer = setTimeout(() => this.open(), delay);
    }

    if (this.#listener.onClose) {
      this.#listener.onClose(event);
    }
  };

  #clearResetTimer = () => {
    if (this.resettimer) {
      clearTimeout(this.resettimer);
      this.resettimer = null;
    }
  };

  #clearRetryTimer = () => {
    if (this.retrytimer) {
      clearTimeout(this.retrytimer);
      this.retrytimer = null;
    }
  };

  static #print = (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('WS:', ...args);
    }
  };

  static #printError = (...args: unknown[]) => {
    console.error('[Decorator WS]: ', ...args);
  };
}
