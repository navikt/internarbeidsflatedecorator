# Dekoratør for interne arbeidsflater V3

> [!NOTE]
> v2.1 kjører fortsatt i prod. Du kan finne denne i [v2.1 branchen](https://github.com/navikt/internarbeidsflatedecorator/tree/v2.1)

Dekoratøren er en navigasjonsmeny som skal kunne brukes på tvers av fagapplikasjoner i NAV.

Appen har ansvar for kommunikasjon med contextholderen (modia-contextholder og modia-eventdistribution).
Dette betyr at hvis man sender inn konfigurasjonen for `enhet` eller `fnr`, så vil det bli satt opp en WebSocket-connection,
og appen vil holde context i sync med hva som vises i decoratøren.
Ved eventuelle endringer i andre flater vil det vises en bekreftelse-modal, og hvis saksbehandler bekrefter endringen så vil `onChange` bli kalt.

## Ta ibruk

Legg til følgende i index.html

**I dev**

```html
<script src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/bundle.js"></script>
<link
  rel="stylesheet"
  href="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/index.css"
/>
```

**I prod**

```html
<script src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/prod/latest/dist/bundle.js"></script>
<link
  rel="stylesheet"
  href="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/prod/latest/dist/index.css"
/>
```

### React med navspa

Om man bruker react som frontendbibliotek kan man så ta ibruk `@navikt/navspa` (Eksemplet er med typescript, fjern `DecoratorProps` om det ikke brukes).

```typescript jsx
import NAVSPA from '@navikt/navspa';
import type DecoratorProps from './decorator-props';
import decoratorConfig from './decorator-config';

const InternflateDecorator = NAVSPA.importer<DecoratorProps>('internarbeidsflatefs');

function App() {
    return (
        <>
            <InternflateDecorator {...decoratorConfig}/>
            <h1>Resten av appen din her.</h1>
        </>
    );
}
```

### Manuelt oppsett

Om man ikke bruker react så kan man fortsatt ta ibruk decoratoren, men man må da kalle render-funksjonen selv.
Ett eksempel på hvordan dette kan gjøres kan ses i [index.html](../public/index.html).

## Konfigurasjon

```typescript jsx
export interface DecoratorProps {
  useProxy?: boolean | string; // Manuell overstyring av urlene til BFFs. Gjør alle kall til relativt path hvis true, og bruker verdien som domene om satt til en string. Default: false
  enhet?: string | undefined; // Konfigurasjon av enhet-kontekst
  accessToken?: string | undefined; // Manuell innsending av JWT, settes som Authorization-header. Om null sendes cookies vha credentials: 'include'
  fnr?: string | undefined; // Konfigurasjon av fødselsnummer-kontekst
  userKey?: string | undefined; // Om man ikke ønsker å bruke fnr i urler, kan andre apper kalle contextholder for å generere en midlertidig kode. Hvis App A skal navigere til App B som har dekoratøren, må App A først sende en post request til /fnr-code/generate med {fnr: string} i bodyen, dette returnerer {fnr: string, code: string} til App A. App A kan så navigere til App B og sende med denne koden. App B kan så sende den koden inn til dekoratøren i userKey  propen og så henter dekoratøren fnr for den koden fra contextholderen.
  enableHotkeys?: boolean | undefined; // Aktivere hurtigtaster
  fetchActiveEnhetOnMount?: boolean | undefined; // Om enhet er undefined fra container appen, og denne er satt til true, henter den sist aktiv enhet og bruker denne.
  fetchActiveUserOnMount?: boolean | undefined; // Om fnr er undefined fra container appen, og denne er satt til true for at den skal hente siste aktiv fnr.
  onBeforeRequest?: (headers: HeadersInit) => HeadersInit | undefined; // Her kan headeren til alle nettverkskall bli modifisert før de blir kalt
  onEnhetChanged: (enhetId?: string | null, enhet?: Enhet) => void; // Kalles når enheten endres
  onFnrChanged: (fnr?: string | null) => void; // Kalles når fnr enheten endres
  onLinkClick?: (link: { text: string; url: string }) => void; // Kan brukes for å legge til callbacks ved klikk på lenker i menyen. Merk at callbacken ikke kan awaites og man må selv håndtere at siden lukkes. Nyttig for å f.eks tracke navigasjon events i amplitude
  appName: string; // Navn på applikasjonen
  hotkeys?: Hotkey[]; // Konfigurasjon av hurtigtaster
  markup?: Markup; // Egen HTML
  showEnheter: boolean; // Vis enheter
  showSearchArea: boolean; // Vis søkefelt
  showHotkeys: boolean; // Vis hurtigtaster
  environment: Environment; // Miljø som skal brukes.
  urlFormat: UrlFormat; // URL format
  proxy?: string | undefined; // Manuell overstyring av urlene til BFFs. Gjør alle kall til relativt path hvis true, og bruker verdien som domene om satt til en string. Default: false
}

export interface Markup {
  etterSokefelt?: string; // Gir muligheten for sende inn egen html som blir en del av dekoratøren
}

export interface Enhet {
  readonly enhetId: string;
  readonly navn: string;
}

// Miljø
export type Environment =
  | 'q0'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'prod'
  | 'local'
  | 'mock';

export type UrlFormat = 'LOCAL' | 'ADEO' | 'NAV_NO' | 'ANSATT'; // UrlFormat. Brukes om proxy ikke er satt & i url til websocket.

export interface HotkeyObject {
  char: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

export interface HotkeyDescription {
  key: HotkeyObject;
  description: string;
  forceOverride?: boolean;
}

export interface ActionHotKey extends HotkeyDescription {
  action(event: KeyboardEvent): void;
}

export interface DocumentingHotKey extends HotkeyDescription {
  documentationOnly: boolean;
}

export type Hotkey = ActionHotKey | DocumentingHotKey;
```

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan rettes mot:

[Team Personoversikt](https://github.com/navikt/info-team-personoversikt)
