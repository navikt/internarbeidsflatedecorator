import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Decorator from './Decorator';
import LandingPage from './LandingPage';
import type { AppProps, DecoratorProps } from './types/AppProps';
import type { Enhet } from './types/Enhet';
import type { Hotkey } from './types/Hotkey';
import type { Markup } from './types/Markup';

// Importer CSS som en streng slik at vi kan injecte den inn i shadow root.
// Den vanlige `import './index.bundled.css'` i Decorator.tsx auto-injiseres fortsatt
// i <head> for portaler som rendres utenfor shadow root.
import cssText from './index.bundled.css?inline';

type OnBeforeRequest = (headers: HeadersInit) => HeadersInit | undefined;

const OBSERVED_ATTRIBUTES = [
  'app-name',
  'environment',
  'url-format',
  'fnr',
  'enhet',
  'fnr-sync-mode',
  'enhet-sync-mode',
  'show-enheter',
  'show-search-area',
  'show-hotkeys',
  'enable-hotkeys',
  'fetch-active-enhet-on-mount',
  'fetch-active-user-on-mount',
  'markup',
  'hotkeys',
  'proxy',
  'websocket-url',
  'access-token',
  'include-credentials',
  'user-key',
] as const;

function boolAttr(value: string | null): boolean {
  return value !== null && value !== 'false';
}

function jsonAttr<T>(value: string | null): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn(
      '[internarbeidsflate-decorator] Failed to parse JSON attribute:',
      value,
    );
    return undefined;
  }
}

// Delt stilark som injiseres én gang og gjenbrukes på tvers av alle shadow roots
const decoratorSheet = new CSSStyleSheet();
decoratorSheet.replaceSync(cssText);

abstract class DecoratorBase extends HTMLElement {
  protected root: Root | null = null;
  private mountPoint: HTMLDivElement | null = null;
  onBeforeRequest: OnBeforeRequest | undefined = undefined;
  private _hotkeys: Hotkey[] | undefined = undefined;

  private readonly handleEnhetChanged = (
    enhet?: string | null,
    enhetObjekt?: Enhet,
  ) => {
    this.dispatchEvent(
      new CustomEvent('enhet-changed', {
        detail: { enhet, enhetObjekt },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private readonly handleFnrChanged = (fnr?: string | null) => {
    this.dispatchEvent(
      new CustomEvent('fnr-changed', {
        detail: { fnr },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private readonly handleLinkClick = ({
    text,
    url,
  }: {
    text: string;
    url: string;
  }) => {
    this.dispatchEvent(
      new CustomEvent('link-click', {
        detail: { text, url },
        bubbles: true,
        composed: true,
      }),
    );
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get hotkeys(): Hotkey[] | undefined {
    return this._hotkeys;
  }

  set hotkeys(value: Hotkey[] | undefined) {
    this._hotkeys = value;
    this.render();
  }

  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  connectedCallback() {
    const shadow = this.shadowRoot!;
    shadow.adoptedStyleSheets = [decoratorSheet];

    this.mountPoint = document.createElement('div');
    shadow.appendChild(this.mountPoint);
    this.root = createRoot(this.mountPoint);
    this.render();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
    this.mountPoint?.remove();
    this.mountPoint = null;
  }

  attributeChangedCallback() {
    this.render();
  }

  protected buildSharedProps() {
    return {
      appName: this.getAttribute('app-name') ?? '',
      environment: (this.getAttribute('environment') ??
        'q2') as DecoratorProps['environment'],
      urlFormat: (this.getAttribute('url-format') ??
        'NAV_NO') as DecoratorProps['urlFormat'],
      fnr: this.getAttribute('fnr') ?? undefined,
      enhet: this.getAttribute('enhet') ?? undefined,
      showEnheter: boolAttr(this.getAttribute('show-enheter')),
      showSearchArea: boolAttr(this.getAttribute('show-search-area')),
      showHotkeys: boolAttr(this.getAttribute('show-hotkeys')),
      enableHotkeys: boolAttr(this.getAttribute('enable-hotkeys')),
      fetchActiveEnhetOnMount: boolAttr(
        this.getAttribute('fetch-active-enhet-on-mount'),
      ),
      fetchActiveUserOnMount: boolAttr(
        this.getAttribute('fetch-active-user-on-mount'),
      ),
      markup: jsonAttr<Markup>(this.getAttribute('markup')),
      hotkeys:
        this._hotkeys ?? jsonAttr<Hotkey[]>(this.getAttribute('hotkeys')),
      proxy: this.getAttribute('proxy') ?? undefined,
      websocketUrl: this.getAttribute('websocket-url') ?? undefined,
      accessToken: this.getAttribute('access-token') ?? undefined,
      includeCredentials: boolAttr(this.getAttribute('include-credentials')),
      userKey: this.getAttribute('user-key') ?? undefined,
      onBeforeRequest: this.onBeforeRequest,
      onEnhetChanged: this.handleEnhetChanged,
      onFnrChanged: this.handleFnrChanged,
      onLinkClick: this.handleLinkClick,
    };
  }

  protected abstract render(): void;
}

class InternarbeidsflateDecorator extends DecoratorBase {
  protected render() {
    if (!this.root) return;
    const fnrSyncMode = this.getAttribute(
      'fnr-sync-mode',
    ) as DecoratorProps['fnrSyncMode'];
    const enhetSyncMode = this.getAttribute(
      'enhet-sync-mode',
    ) as DecoratorProps['enhetSyncMode'];
    const props = {
      ...this.buildSharedProps(),
      ...(fnrSyncMode != null ? { fnrSyncMode } : {}),
      ...(enhetSyncMode != null ? { enhetSyncMode } : {}),
    };
    this.root.render(
      React.createElement(Decorator, props as unknown as DecoratorProps),
    );
  }
}

customElements.define(
  'internarbeidsflate-decorator',
  InternarbeidsflateDecorator,
);

class InternarbeidsflateDecoratorFullscreen extends DecoratorBase {
  protected render() {
    if (!this.root) return;
    this.root.render(
      React.createElement(LandingPage, this.buildSharedProps() as AppProps),
    );
  }
}

customElements.define(
  'internarbeidsflate-decorator-fullscreen',
  InternarbeidsflateDecoratorFullscreen,
);

export type {
  InternarbeidsflateDecorator,
  InternarbeidsflateDecoratorFullscreen,
};
