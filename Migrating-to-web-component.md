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

---

## 3. Bytt ut callbacks med events

Callbacks (`onEnhetChanged`, `onFnrChanged`, `onLinkClick`) er erstattet med DOM CustomEvents.

**Før:**
```tsx
<Decorator onEnhetChanged={(enhet) => setEnhet(enhet)} />
```

**Etter (React 19):**
```tsx
<internarbeidsflate-decorator onEnhetChanged={(e: CustomEvent) => setEnhet(e.detail.enhet)} />
```

**Etter (React 18 / vanilla JS):**
```js
decorator.addEventListener('enhet-changed', (e) => setEnhet(e.detail.enhet));
```

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
