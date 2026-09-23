interface EnhetChangedDetail {
  enhet?: string | null;
  enhetObjekt?: { enhetId: string; navn: string };
}

interface FnrChangedDetail {
  fnr?: string | null;
}

interface LinkClickDetail {
  text: string;
  url: string;
}

interface DecoratorHotkey {
  key: {
    char: string;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
  };
  description: string;
  forceOverride?: boolean;
}

interface DecoratorElementAttributes {
  'app-name': string;
  environment: string;
  'url-format': string;
  'show-enheter': boolean | string;
  'show-search-area': boolean | string;
  'show-hotkeys': boolean | string;
  fnr?: string;
  enhet?: string;
  'fnr-sync-mode'?: string;
  'enhet-sync-mode'?: string;
  'enable-hotkeys'?: boolean | string;
  'fetch-active-enhet-on-mount'?: boolean | string;
  'fetch-active-user-on-mount'?: boolean | string;
  'include-credentials'?: boolean | string;
  markup?: string;
  hotkeys?: DecoratorHotkey[] | string;
  proxy?: string;
  'websocket-url'?: string;
  'access-token'?: string;
  'user-key'?: string;
}

interface InternarbeidsflateDecoratorElement extends HTMLElement {
  addEventListener(
    type: 'enhet-changed',
    listener: (event: CustomEvent<EnhetChangedDetail>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'fnr-changed',
    listener: (event: CustomEvent<FnrChangedDetail>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'link-click',
    listener: (event: CustomEvent<LinkClickDetail>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'enhet-changed',
    listener: (event: CustomEvent<EnhetChangedDetail>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: 'fnr-changed',
    listener: (event: CustomEvent<FnrChangedDetail>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: 'link-click',
    listener: (event: CustomEvent<LinkClickDetail>) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'internarbeidsflate-decorator': React.HTMLAttributes<HTMLElement> &
        React.RefAttributes<InternarbeidsflateDecoratorElement> &
        DecoratorElementAttributes;
      'internarbeidsflate-decorator-fullscreen': React.HTMLAttributes<HTMLElement> &
        React.RefAttributes<InternarbeidsflateDecoratorElement> &
        DecoratorElementAttributes;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'internarbeidsflate-decorator': InternarbeidsflateDecoratorElement;
    'internarbeidsflate-decorator-fullscreen': InternarbeidsflateDecoratorElement;
  }
}
