# Migrasjonsguide: NAVSPA → Web Component

De eldre integrasjonsmetodene (NAVSPA og manuell React-import) er utgåtte. Web componenten er den anbefalte måten å ta i bruk dekoratøren på. Se [README.md](./README.md) for full dokumentasjon.

---

## 1. Bytt ut lasting

**Før (NAVSPA):**
```html
<script src="https://cdn.nav.no/.../dist/bundle.js"></script>
```
```js
const Decorator = NAVSPA.importer<DecoratorPropsV3>('internarbeidsflate-decorator-v3');
```

**Etter (web component):**
```html
<!-- Dev -->
<script type="module" src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/internarbeidsflate-decorator.wc.js"></script>

<!-- Prod -->
<script type="module" src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/prod/latest/dist/internarbeidsflate-decorator.wc.js"></script>
```

Ingen import — elementet `<internarbeidsflate-decorator>` er tilgjengelig globalt etter at scriptet er lastet.

---

## 2. Bytt ut React-komponenten med HTML-elementet

**Før:**
```tsx
<Decorator appName="Min app" environment="q2" showEnheter={true} fnr={fnr} />
```

**Etter:**
```tsx
<internarbeidsflate-decorator app-name="Min app" environment="q2" show-enheter fnr={fnr} />
```

Props blir attributter: camelCase → kebab-case. Boolske props settes uten verdi (tilstede = `true`).

> **OBS — `enable-hotkeys`:** I den gamle React-komponenten var hurtigtaster aktivert som standard (dvs. `enableHotkeys` kunne utelates). I web componenten må `enable-hotkeys` settes **eksplisitt** for å aktivere hurtigtaster — utelatt attributt tolkes som `false`. Hvis du brukte hurtigtaster tidligere, legg til attributtet:
> ```html
> <internarbeidsflate-decorator ... enable-hotkeys />
> ```

---

## 3. Bytt ut callbacks med events

Callbacks (`onEnhetChanged`, `onFnrChanged`, `onLinkClick`) er erstattet med DOM CustomEvents. Du må alltid bruke `useLayoutEffect` med `addEventListener` — React sin `onNavn`-prop-syntaks fungerer ikke for hendelser med bindestrek som `enhet-changed` (React lowercaser og lytter på `enhetchanged` i stedet).

**Før:**
```tsx
<Decorator onEnhetChanged={(enhet) => setEnhet(enhet)} />
```

**Etter:**
```tsx
useLayoutEffect(() => {
  const el = ref.current;
  if (!el) return;
  const onEnhetChanged = (e: Event) => setEnhet((e as CustomEvent).detail.enhet);
  const onFnrChanged = (e: Event) => setFnr((e as CustomEvent).detail.fnr);
  el.addEventListener('enhet-changed', onEnhetChanged);
  el.addEventListener('fnr-changed', onFnrChanged);
  return () => {
    el.removeEventListener('enhet-changed', onEnhetChanged);
    el.removeEventListener('fnr-changed', onFnrChanged);
  };
}, []);
```

> `useLayoutEffect` er anbefalt fremfor `useEffect` fordi dekoratøren henter aktiv bruker/enhet fra contextholder ved oppstart — dette kan skje raskt nok til at det første eventet går tapt.

---

## 4. Funksjons-props (`onBeforeRequest`, `hotkeys`)

Funksjoner kan ikke settes som HTML-attributter. Sett dem som JS-properties direkte på elementet:

```js
document.querySelector('internarbeidsflate-decorator').onBeforeRequest = (headers) => ({
  ...headers,
  Authorization: `Bearer ${token}`,
});
```

Se [README.md](./README.md) for detaljer om alle attributter, events og konfigurasjon.
