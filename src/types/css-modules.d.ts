// TypeScript 6 (TS2882) krever typedeklarasjon for side-effect-importer.
// Aksel publiserer ren CSS uten typer — bundleren håndterer disse importene.
declare module '@navikt/ds-css';
declare module '*.css';
