# Dekoratør for interne arbeidsflater

> Migrerer du fra NAVSPA eller en eldre versjon? Se [migrasjonsguiden](./Migrating-to-web-component.md).
> Bruker du fortsatt NAVSPA eller manuell React-import? [Disse metodene er utgåtte](./Legacy.md) — alle apper bør migrere til web component.

Dekoratøren er en navigasjonsmeny for interne NAV-applikasjoner. Den er implementert som en **web component** med Shadow DOM, og kan brukes i alle rammeverk (React, Vue, Angular, vanilla JS).

Appen har ansvar for kommunikasjon med contextholderen (modia-contextholder og modia-eventdistribution).
Dette betyr at hvis man sender inn konfigurasjonen for `enhet` eller `fnr`, så vil det bli satt opp en WebSocket-connection,
og appen vil holde context i sync med hva som vises i decoratøren.
Ved eventuelle endringer i andre flater vil det vises en bekreftelse-modal, og hvis saksbehandler bekrefter endringen så vil `onChange` bli kalt.

## Ta ibruk dekoratøren som web component

### Last inn via CDN

Legg til følgende script-tag i `index.html` **før** appen din starter:

**Dev**

```html
<script
  type="module"
  src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/internarbeidsflate-decorator.wc.js"
></script>
```

**Prod**

```html
<script
  type="module"
  src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/prod/latest/dist/internarbeidsflate-decorator.wc.js"
></script>
```

### Eller installer som npm-pakke

```js
import 'internarbeidsflate-decorator-v3/web-component';
```

### React

```tsx
import 'internarbeidsflate-decorator-v3/web-component';

function App() {
  const [fnr, setFnr] = useState<string | undefined>();
  const [enhet, setEnhet] = useState<string | undefined>();

  return (
    <internarbeidsflate-decorator
      app-name="Min app"
      environment="q2"
      url-format="NAV_NO"
      fnr={fnr}
      enhet={enhet}
      show-enheter
      show-search-area
      fetch-active-enhet-on-mount
      fetch-active-user-on-mount
      onEnhetChanged={(e: CustomEvent) => {
        const { enhet } = e.detail;
        setEnhet(enhet);
      }}
      onFnrChanged={(e: CustomEvent) => {
        const { fnr } = e.detail;
        setFnr(fnr);
      }}
    />
  );
}
```
#### React versjoner
 **Merk:** I React oppdateres attributter automatisk når state endres — ingen manuell `setAttribute` nødvendig.
 I React 19 sendes events fra custom elements som `onNavn`-props (camelCase av event-navnet).
 `enhet-changed` → `onEnhetChanged`, `fnr-changed` → `onFnrChanged`, `link-click` → `onLinkClick`.
 I React 18 må du bruke `addEventListener` i en `useEffect`:

```tsx
const decoratorRef = useRef<HTMLElement>(null);

useEffect(() => {
  const el = decoratorRef.current;
  if (!el) return;
  const handler = (e: Event) => {
    const { enhet } = (e as CustomEvent).detail;
  };
  el.addEventListener('enhet-changed', handler);
  return () => el.removeEventListener('enhet-changed', handler);
}, []);

return <internarbeidsflate-decorator ref={decoratorRef} app-name="Min app" ... />;
```

### Vanilla JS / andre rammeverk

```js
const decorator = document.createElement('internarbeidsflate-decorator');
decorator.setAttribute('app-name', 'Min app');
decorator.setAttribute('environment', 'q2');
decorator.setAttribute('url-format', 'NAV_NO');
decorator.setAttribute('show-enheter', '');
decorator.setAttribute('show-search-area', '');
decorator.setAttribute('fetch-active-enhet-on-mount', '');
decorator.setAttribute('fetch-active-user-on-mount', '');

decorator.addEventListener('enhet-changed', (e) => {
  const { enhet, enhetObjekt } = e.detail;
});

decorator.addEventListener('fnr-changed', (e) => {
  const { fnr } = e.detail;
});

document.body.prepend(decorator);

// Oppdater fnr/enhet når de endres i appen din
decorator.setAttribute('fnr', nyttFnr);
decorator.setAttribute('enhet', nyEnhet);
```

---

### TypeScript

Når dekoratøren brukes som web component, kjenner ikke TypeScript til `<internarbeidsflate-decorator>` som et gyldig JSX-element. Opprett f.eks. `src/decorator-elements.d.ts` med følgende innhold:

```ts
interface DecoratorElementAttributes {
  'app-name'?: string;
  environment?: string;
  'url-format'?: string;
  fnr?: string;
  enhet?: string;
  'fnr-sync-mode'?: string;
  'enhet-sync-mode'?: string;
  'show-enheter'?: string;
  'show-search-area'?: string;
  'show-hotkeys'?: string;
  'enable-hotkeys'?: string;
  'fetch-active-enhet-on-mount'?: string;
  'fetch-active-user-on-mount'?: string;
  markup?: string;
  hotkeys?: string;
  proxy?: string;
  'websocket-url'?: string;
  'access-token'?: string;
  'include-credentials'?: string;
  'user-key'?: string;
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'internarbeidsflate-decorator': React.HTMLAttributes<HTMLElement> &
        React.RefAttributes<HTMLElement> &
        DecoratorElementAttributes;
    }
  }
}
```

---

## Konfigurasjon

Alle props settes som HTML-attributter (camelCase → kebab-case). Boolske attributter settes uten verdi (tilstede = `true`) eller utelates (= `false`).

| Attributt                     | Type                                                    | Beskrivelse                                                             |
| ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `app-name`                    | string (påkrevd)                                        | Navn på applikasjonen som vises i banneret                              |
| `environment`                 | `q0`\|`q1`\|`q2`\|`q3`\|`q4`\|`prod`\|`local`\|`mock` | Miljø, standard `q2`                                                    |
| `url-format`                  | `NAV_NO`\|`ANSATT`\|`LOCAL`                             | URL-format, standard `NAV_NO`                                           |
| `fnr`                         | string                                                  | Aktivt fødselsnummer                                                    |
| `enhet`                       | string                                                  | Aktiv enhet                                                             |
| `fnr-sync-mode`               | `sync`\|`writeOnly`\|`ignore`                           | Synkroniseringsmodus for fnr, standard `sync`                           |
| `enhet-sync-mode`             | `sync`\|`writeOnly`\|`ignore`                           | Synkroniseringsmodus for enhet, standard `sync`                         |
| `show-enheter`                | boolean                                                 | Vis enhet-velger                                                        |
| `show-search-area`            | boolean                                                 | Vis søkefelt                                                            |
| `show-hotkeys`                | boolean                                                 | Vis hurtigtaster-panel                                                  |
| `enable-hotkeys`              | boolean                                                 | Aktiver hurtigtaster                                                    |
| `fetch-active-enhet-on-mount` | boolean                                                 | Hent siste aktive enhet ved oppstart hvis `enhet` ikke er satt          |
| `fetch-active-user-on-mount`  | boolean                                                 | Hent siste aktive bruker ved oppstart hvis `fnr` ikke er satt           |
| `markup`                      | JSON string                                             | Ekstra HTML, f.eks. `'{"etterSokefelt":"<button>...</button>"}'`        |
| `hotkeys`                     | JSON string                                             | Array av hurtigtaster (JSON-serialisert)                                |
| `proxy`                       | string                                                  | Overstyrer URL til contextholderen                                      |
| `websocket-url`               | string                                                  | WebSocket URL                                                           |
| `access-token`                | string                                                  | JWT som settes som Authorization-header                                 |
| `include-credentials`         | boolean                                                 | Send cookies på requests til contextholderen (`credentials: 'include'`) |
| `user-key`                    | string                                                  | Midlertidig kode i stedet for fnr (se beskrivelse under)                |

### Events

| Event           | `detail`-innhold                               | Beskrivelse                  |
| --------------- | ---------------------------------------------- | ---------------------------- |
| `enhet-changed` | `{ enhet: string\|null, enhetObjekt?: Enhet }` | Kalles når enheten endres    |
| `fnr-changed`   | `{ fnr: string\|null }`                        | Kalles når fnr endres        |
| `link-click`    | `{ text: string, url: string }`                | Kalles ved klikk på menylenker |

### TypeScript-typer

For full typeinformasjon, her er React-grensesnittet (camelCase). Web component-attributtene er kebab-case-ekvivalentene:

```typescript
export interface DecoratorProps {
  enhet?: string | undefined; // Konfigurasjon av enhet-kontekst
  accessToken?: string | undefined; // Manuell innsending av JWT, settes som Authorization-header
  includeCredentials?: boolean | undefined; // Sett `credentials: 'include'` på outgoing requests til contextholderen
  fnr?: string | undefined; // Konfigurasjon av fødselsnummer-kontekst
  userKey?: string | undefined; // Midlertidig kode i stedet for fnr (se "userKey" under)
  enableHotkeys?: boolean | undefined; // Aktivere hurtigtaster
  fetchActiveEnhetOnMount?: boolean | undefined; // Om enhet er undefined fra container appen, og denne er satt til true, henter den sist aktiv enhet og bruker denne
  fetchActiveUserOnMount?: boolean | undefined; // Om fnr er undefined fra container appen, og denne er satt til true for at den skal hente siste aktiv fnr
  fnrSyncMode?: 'sync' | 'writeOnly' | 'ignore'; // Modus til fnr state management. "sync" er default. "writeOnly" gjør at endringer aldri hentes men vil settes dersom det oppdateres lokalt i appen. "ignore" verken henter fra context eller skriver til context ved oppdatert state lokalt.
  enhetSyncMode?: 'sync' | 'writeOnly' | 'ignore'; // Samme som fnrSyncMode, men for enhet state.
  onEnhetChanged?: (enhetId?: string | null, enhet?: Enhet) => void; // Kalles når enheten endres
  onFnrChanged?: (fnr?: string | null) => void; // Kalles når fnr endres
  onLinkClick?: (link: { text: string; url: string }) => void; // Kalles ved klikk på menylenker
  appName: string; // Navn på applikasjonen
  hotkeys?: Hotkey[]; // Konfigurasjon av hurtigtaster
  markup?: Markup; // Egen HTML
  showEnheter: boolean; // Vis enheter
  showSearchArea: boolean; // Vis søkefelt
  showHotkeys: boolean; // Vis hurtigtaster
  environment: Environment; // Miljø som skal brukes.
  urlFormat: UrlFormat; // URL format
  proxy?: string | undefined; // Overstyrer URL til contextholderen. Hvis satt, brukes denne verdien som base-URL for alle kall til modia-contextholder.
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

export type UrlFormat = 'LOCAL' | 'NAV_NO' | 'ANSATT'; // UrlFormat. Brukes til lenker i menyen & WS urlen

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

### `userKey` — midlertidig kode i stedet for fnr

Hvis en app ikke ønsker å eksponere fnr i URL-er, kan den bruke `userKey` i stedet. Flyten er:

1. **App A** sender en POST til `/fnr-code/generate` med `{ fnr: string }` i bodyen
2. Contextholderen returnerer `{ fnr: string, code: string }`
3. **App A** navigerer til **App B** og sender med koden (f.eks. som query-parameter)
4. **App B** sender koden inn som `user-key`-attributtet på dekoratøren
5. Dekoratøren henter fnr for koden fra contextholderen

```html
<internarbeidsflate-decorator user-key="<koden-fra-app-a>" ...></internarbeidsflate-decorator>
```

---

## Shadow DOM

Dekoratøren bruker Shadow DOM. Det betyr at den har et isolert DOM-subtre:

```
<internarbeidsflate-decorator>  ← hostelement
  #shadow-root                  ← shadow root (isolert)
    <div class="dekorator">
      ...dekoratørens HTML...
    </div>
```

- **CSS-isolasjon**: stiler inni lekker ikke ut, og stiler utenfra lekker ikke inn
- **DOM-isolasjon**: `document.querySelector('.dekorator')` finner ikke elementer inni shadow-roten
- **JS-tilgang**: shadow-roten er tilgjengelig via `element.shadowRoot`

### DOM-spørringer

Vanlige DOM-spørringer fra applikasjonen din vil **ikke finne elementer inni dekoratøren**:

```js
// ❌ Fungerer ikke – finner ikke noe inni shadow root
document.querySelector('#dropdown-container');
```

Bruk `shadowRoot` for å nå elementer inni dekoratøren:

```js
// ✅ Riktig måte
const host = document.querySelector('internarbeidsflate-decorator');
const element = host?.shadowRoot?.querySelector('#mitt-element');
element?.addEventListener('click', () => { /* ... */ });
```

### Styling av innhold i `etterSokefelt`

Dekoratøren bruker Shadow DOM, som betyr at **all CSS fra applikasjonen din er isolert fra innholdet i dekoratøren**. Globale stilark, CSS-klasser og CSS-variabler som er definert utenfor shadow-roten vil ikke påvirke elementer inni dekoratøren.

Dette gjelder også HTML som sendes inn via `markup.etterSokefelt`: elementene rendres inni shadow-roten og får ikke med seg stilark fra appen din – heller ikke CSS fra komponentbiblioteker som `@navikt/ds-react`.

**Du må derfor inkludere all nødvendig styling direkte i HTML-strengen**, typisk via en `<style>`-tag:

```html
<style>
  .min-knapp {
    background: none;
    border: none;
    cursor: pointer;
  }
  .min-knapp:hover {
    background-color: var(--ax-bg-accent-strong-hover);
  }
</style>
<div>
  <button class="min-knapp">Klikk meg</button>
</div>
```

> **Merk:** Aksel CSS-variabler (f.eks. `--ax-bg-accent-strong-hover`) er tilgjengelige fordi dekoratøren selv importerer Aksels tokens. Men komponentklasser som `.navds-button` vil ikke se riktige ut – de er scopet til dekoratørens mørke header-tema og vil gi uventede farger.

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan rettes mot:

[Team Personoversikt](https://github.com/navikt/info-team-personoversikt)
