# Dekoratør for interne arbeidsflater V2.1
Dekoratøren er en navigasjonsmeny som skal kunne brukes på tvers av fagapplikasjoner i NAV.

Appen har ansvar for kommunikasjon med contextholderen (modia-contextholder og modia-eventdistribution).
Dette betyr at hvis man sender inn konfigurasjonen for `enhet` eller `fnr`, så vil det bli satt opp en WebSocket-connection, 
og appen vil holde context i sync med hva som vises i decoratøren. 
Ved eventuelle endringer i andre flater vil det vises en bekreftelse-modal, og hvis saksbehandler bekrefter endringen så vil `onChange` bli kalt. 

## Ta ibruk
Legg til følgende i index.html
```html
<script src="/internarbeidsflatedecorator/v2.1/static/js/head.v2.min.js"></script>
<link rel="stylesheet" href="/internarbeidsflatedecorator/v2.1/static/css/main.css" />
```

**NB!!**  
Applikasjonen er tilgjengelig på `app.adeo.no`, `modapp.adeo.no` og `internarbeidsflatedecorator.nais.adeo.no` ([Se ingressene](../.nais/prod.yaml)).
Om deres løsning kjører på ett annet domene må man huske å bruke en absolutt URL ved lasting av javascript/css.


### React med navspa
Om man bruker react som frontendbibliotek kan man så ta ibruk `@navikt/navspa` (Eksemplet er med typescript, fjern `DecoratorProps` om det ikke brukes).
```typescript jsx
import NAVSPA from '@navikt/navspa';
import DecoratorProps from './decorator-props';
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
Ett eksempel på hvordan dette kan gjøres kan ses i [index.html](public/index.html).

## Konfigurasjon

Eksempler på konfigurasjoner kan ses i [index.html](public/index.html).

```typescript jsx
export interface DecoratorProps {
    appname: string;                // Navn på applikasjon
    fnr?: FnrContextvalue;          // Konfigurasjon av fødselsnummer-kontekst
    enhet?: EnhetContextvalue;      // Konfigurasjon av enhet-kontekst
    toggles?: TogglesConfig;        // Konfigurasjon av hvilke elementer som skal vises i dekoratøren
    markup?: Markup;                // Ekstra innhold i dekoratøren, kan brukes om man trenger å legge en knapp innenfor dekoratøren
    
    useProxy?: boolean | string;    // Manuell overstyring av urlene til BFFs. Gjør alle kall til relativt path hvis true, og bruker verdien som domene om satt til en string. Default: false 
    accessToken?: string;           // Manuell innsending av JWT, settes som Authorization-header. Om null sendes cookies vha credentials: 'include' 
}

export interface TogglesConfig {
    visVeileder?: boolean;          // Styrer om man skal vise informasjon om innlogget veileder
}

export interface Markup {
    etterSokefelt?: string;         // Gir muligheten for sende inn egen html som blir en del av dekoratøren
}


// Fnr/Enhet-konfiguration støttet både `Controlled` og `Uncontrolled` operasjon.
// Ved bruk av `Controlled` må konsument-applikasjonen selv ta ansvar for oppdatering av `value` etter enhver `onChange`
// Dette er i motsetning til `Uncontrolled`, hvor dette håndteres av dekoratøren. Og alt konsument-applikasjonen trenger å gjøre er å følge med på `onChange`.
export interface ControlledContextvalue<T> extends BaseContextvalue<T> {
    value: string | null;
}
export interface UncontrolledContextvalue<T> extends BaseContextvalue<T> {
    initialValue: string | null;
}

export interface BaseContextvalue<T> {
    display: T;
    onChange(value: string | null): void;
    skipModal?: boolean;
    ignoreWsEvents?: boolean;
}

export type Contextvalue<T> = ControlledContextvalue<T> | UncontrolledContextvalue<T>;

export enum EnhetDisplay {
    ENHET = 'ENHET',
    ENHET_VALG = 'ENHET_VALG'
}

export enum FnrDisplay {
    SOKEFELT = 'SOKEFELT'
}

export type EnhetContextvalue = Contextvalue<EnhetDisplay>;
export type FnrContextvalue = Contextvalue<FnrDisplay>;
```
# Henvendelser
Spørsmål knyttet til koden eller prosjektet kan rettes mot:

[Team Personoversikt](https://github.com/navikt/info-team-personoversikt)
