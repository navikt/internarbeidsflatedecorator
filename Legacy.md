# Eldre integrasjonsmetoder (utgått)

> ⚠️ **Disse metodene er utgåtte.** Alle apper bør migrere til web component-tilnærmingen.
> Se [migrasjonsguiden](./Migrating-to-web-component.md) for å komme i gang.
>
> Metodene beskrevet her støttes fortsatt teknisk, men vil ikke vedlikeholdes aktivt.

---

## NAVSPA

Den opprinnelige integrasjonsmetoden laster dekoratøren fra CDN og rendrer den via `@navikt/navspa`.

### Laste inn via CDN

Legg til følgende i `index.html`:

**Dev**

```html
<script src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/bundle.js"></script>
<link
  rel="stylesheet"
  href="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/index.css"
/>
```

**Prod**

```html
<script src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/prod/latest/dist/bundle.js"></script>
<link
  rel="stylesheet"
  href="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/prod/latest/dist/index.css"
/>
```

### Bruk med React og NAVSPA

```typescript jsx
import NAVSPA from '@navikt/navspa';
import type DecoratorProps from './decorator-props';
import decoratorConfig from './decorator-config';

const InternflateDecorator = NAVSPA.importer<DecoratorProps>('internarbeidsflate-decorator-v3');

function App() {
    return (
        <>
            <InternflateDecorator {...decoratorConfig}/>
            <h1>Resten av appen din her.</h1>
        </>
    );
}
```

> **Merk:** For apper med React >= 19 så må NAVSPA ha nøyaktig samme versjon av React som hovedappen. 

---

## Manuelt oppsett (React-komponent uten NAVSPA)

Det er også mulig å importere React-komponenten direkte fra npm-pakken uten NAVSPA:

```typescript jsx
import InternflateDecorator from 'internarbeidsflate-decorator-v3';

function App() {
    return (
        <>
            <InternflateDecorator {...decoratorConfig}/>
            <h1>Resten av appen din her.</h1>
        </>
    );
}
```

> **Merk:** Denne tilnærmingen kopler appen din til dekoratørens React-versjon. Større React-oppgraderinger
> kan kreve at pakken oppdateres samtidig. Ikke-React-apper må installere React som en ekstra avhengighet.
> Web component-tilnærmingen har ingen av disse begrensningene.
