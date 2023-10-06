import {
    finnMiljoStreng,
    finnNaisInternNavMiljoStreng,
    hentMiljoFraUrl,
    UrlFormat
} from './url-utils';
import { withLocation } from './test.utils';

describe('url-utils', () => {
    describe('finnMiljoStreng', () => {
        it('skal identifisere -q1', () => {
            withLocation('localhost', () => {
                expect(finnMiljoStreng()).toBe('-q1');
                expect(finnMiljoStreng(true)).toBe('-q1.dev');
            });
            withLocation('https://app.adeo.no/contextpath', () => {
                expect(finnMiljoStreng()).toBe('');
                expect(finnMiljoStreng(true)).toBe('');
            });
        });
    });

    describe('hentMiljoFraUrl', () => {
        it('skal identifisere localhost', () => {
            withLocation('localhost', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    envclass: 'local',
                    urlformat: UrlFormat.LOCAL
                });
            });

            withLocation('http://localhost:8080/modia', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    envclass: 'local',
                    urlformat: UrlFormat.LOCAL
                });
            });
        });

        it('skal identifisere navikt.github.io som local', () => {
            withLocation('https://navikt.github.io/modiapersonoversikt/', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    envclass: 'local',
                    urlformat: UrlFormat.LOCAL
                });
            });
        });

        it('skal identifisere herokuapp.com som local', () => {
            withLocation('https://navn.herokuapp.com/contextpath/', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    envclass: 'local',
                    urlformat: UrlFormat.LOCAL
                });
            });
        });

        it('skal identifisere labs.nais.io som local', () => {
            withLocation('https://navn.labs.nais.io/contextpath/', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'local',
                    envclass: 'local',
                    urlformat: UrlFormat.LOCAL
                });
            });
        });

        it('skal identifisere test og qa nais-miljøer', () => {
            withLocation('https://navn-q6.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q6',
                    envclass: 'q',
                    urlformat: UrlFormat.NAIS
                });
            });

            withLocation('https://navn-t6.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 't6',
                    envclass: 't',
                    urlformat: UrlFormat.NAIS
                });
            });
        });

        it('skal ha fallback til q1 for uspesifiserte qa-miljø', () => {
            withLocation('https://navn.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q1',
                    envclass: 'q',
                    urlformat: UrlFormat.NAIS
                });
            });
            withLocation('https://navn-q.nais.preprod.local/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q1',
                    envclass: 'q',
                    urlformat: UrlFormat.NAIS
                });
            });
        });

        it('skal identifisere dev-adeo urler som dev. Bruk dekorator i q1', () => {
            withLocation('https://navn.dev.adeo.no/contextpath/', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q1',
                    envclass: 'dev',
                    urlformat: UrlFormat.DEV_ADEO
                });
            });
        });

        it('skal identifisere nais-prod urler', () => {
            withLocation('https://navn-q.nais.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'p',
                    envclass: 'p',
                    urlformat: UrlFormat.NAIS
                });
            });
        });

        it('skal identifisere app-XX urler til test og qa', () => {
            withLocation('https://app-q6.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q6',
                    envclass: 'q',
                    urlformat: UrlFormat.ADEO
                });
            });

            withLocation('https://app-t6.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 't6',
                    envclass: 't',
                    urlformat: UrlFormat.ADEO
                });
            });
        });

        it('skal identifisere app-XX prod urler', () => {
            withLocation('https://app.adeo.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'p',
                    envclass: 'p',
                    urlformat: UrlFormat.ADEO
                });
            });
        });

        it('skal identifisere intern.dev.nav.no-urler som dev. Bruk dekorator i q1', () => {
            withLocation('https://navn.intern.dev.nav.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q1',
                    envclass: 'dev',
                    urlformat: UrlFormat.NAV_NO
                });
            });
        });

        it('skal identifisere intern.dev.nav.no-urler som dev. Bruk dekorator i q1', () => {
            withLocation('https://navn.intern.dev.nav.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'q1',
                    envclass: 'dev',
                    urlformat: UrlFormat.NAV_NO
                });
            });
        });

        it('skal identifisere intern.nav.no-urler som prod', () => {
            withLocation('https://navn.intern.nav.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'p',
                    envclass: 'p',
                    urlformat: UrlFormat.NAV_NO
                });
            });
        });

        it('skal ha fallback til prod om alt feiler', () => {
            withLocation('https://vg.no/contextpath', () => {
                expect(hentMiljoFraUrl()).toEqual({
                    environment: 'p',
                    envclass: 'p',
                    urlformat: UrlFormat.ADEO
                });
            });
        });
    });

    describe('finnNaisInternNavMiljoStreng', () => {
        it('skal legg ikke legge til miljøprefix for produksjon', () => {
            withLocation('https://navn.intern.nav.no/contextpath', () => {
                expect(finnNaisInternNavMiljoStreng(false)).toBe('.intern.nav.no');
                expect(finnNaisInternNavMiljoStreng(true)).toBe('.intern.nav.no');
            });
        });

        it('skal legg ikke legge til miljøprefix som default', () => {
            withLocation('https://navn.intern.dev.nav.no/contextpath', () => {
                expect(finnNaisInternNavMiljoStreng()).toBe('.intern.dev.nav.no');
            });
        });

        it('skal legg legge til miljøprefix for preprod om ønskelig', () => {
            withLocation('https://navn.intern.dev.nav.no/contextpath', () => {
                expect(finnNaisInternNavMiljoStreng(true)).toBe('-q1.intern.dev.nav.no');
            });
        });
    });
});
