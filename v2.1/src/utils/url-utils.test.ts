import { hentMiljoFraUrl } from './url-utils';
import { withLocation } from './test.utils';

describe('url-utils', () => {
    describe('hentMiljoFraUrl', () => {
        it('skal identifisere localhost', () => {
            withLocation('localhost', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    isNaisUrl: false,
                    envclass: 'local'
                });
            });

            withLocation('http://localhost:8080/modia', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    isNaisUrl: false,
                    envclass: 'local'
                });
            });
        });

        it('skal identifisere navikt.github.io som local', () => {
            withLocation('https://navikt.github.io/modiapersonoversikt/', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    isNaisUrl: false,
                    envclass: 'local'
                });
            });
        });

        it('skal identifisere test og qa nais-miljøer', () => {
            withLocation('https://navn-q6.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q6',
                    isNaisUrl: true,
                    envclass: 'q'
                });
            });

            withLocation('https://navn-t6.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 't6',
                    isNaisUrl: true,
                    envclass: 't'
                });
            });
        });

        it('skal ha fallback til q0 for uspesifiserte qa-miljø', () => {
            withLocation('https://navn.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q0',
                    isNaisUrl: true,
                    envclass: 'q'
                });
            });
            withLocation('https://navn-q.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q0',
                    isNaisUrl: true,
                    envclass: 'q'
                });
            });
        });

        it('skal identifisere nais-prod urler', () => {
            withLocation('https://navn-q.nais.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'p',
                    isNaisUrl: true,
                    envclass: 'p'
                });
            });
        });

        it('skal identifisere app-XX urler til test og qa', () => {
            withLocation('https://app-q6.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q6',
                    isNaisUrl: false,
                    envclass: 'q'
                });
            });

            withLocation('https://app-t6.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 't6',
                    isNaisUrl: false,
                    envclass: 't'
                });
            });
        });

        it('skal identifisere app-XX prod urler', () => {
            withLocation('https://app.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'p',
                    isNaisUrl: false,
                    envclass: 'p'
                });
            });
        });

        it('skal ha fallback til prod om alt feiler', () => {
            withLocation('https://vg.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'p',
                    isNaisUrl: false,
                    envclass: 'p'
                });
            });
        });
    });
});
