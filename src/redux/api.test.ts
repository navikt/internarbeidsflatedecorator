import { getVeilederflatehendelserUrl, lagModiacontextholderUrl } from './api';
import { withLocation } from '../utils/test.utils';

describe('api', () => {
    describe('modiacontextholder-url', () => {
        it('skal ha riktig url ved kjøring lokalt', () => {
            withLocation('localhost', () => {
                expect(lagModiacontextholderUrl()).toBe('http://localhost:8080/modiacontextholder');
            });
        });

        it('skal ha riktig nais-url ved kjøring på nais-dev.intern', () => {
            withLocation('https://navn-q6.intern.dev.nav.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://modiacontextholder-q6.intern.dev.nav.no/modiacontextholder'
                );
            });

            withLocation('https://navn.intern.dev.nav.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://modiacontextholder-q1.intern.dev.nav.no/modiacontextholder'
                );
            });
        });

        it('skal ha riktig nais-url ved kjøring på nais.intern', () => {
            withLocation('https://navn.intern.nav.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://modiacontextholder.intern.nav.no/modiacontextholder'
                );
            });
        });

        it('skal ha riktig nais-url ved kjøring på nais-preprod', () => {
            withLocation('https://navn-q6.nais.preprod.local/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://modiacontextholder-q6.nais.preprod.local/modiacontextholder'
                );
            });

            withLocation('https://navn.nais.preprod.local/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://modiacontextholder-q1.nais.preprod.local/modiacontextholder'
                );
            });
        });

        it('skal ha riktig nais-url ved kjøring på nais-prod', () => {
            withLocation('https://navn-q.nais.adeo.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://modiacontextholder.nais.adeo.no/modiacontextholder'
                );
            });
        });

        it('skal ha riktig url ved kjøring på app-XX.adeo.no', () => {
            withLocation('https://app-q6.adeo.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://app-q6.adeo.no/modiacontextholder'
                );
            });
        });

        it('skal ha riktig url ved kjøring på app-XX.dev.adeo.no', () => {
            withLocation('https://app-q6.dev.adeo.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe(
                    'https://app-q6.dev.adeo.no/modiacontextholder'
                );
            });
        });

        it('skal ha riktig url ved kjøring på app.adeo.no', () => {
            withLocation('https://app.adeo.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe('https://app.adeo.no/modiacontextholder');
            });
        });

        it('skal bruke domene fra proxy config', () => {
            withLocation('https://app.adeo.no/contextpath', () => {
                expect(lagModiacontextholderUrl('https://vg.no')).toBe(
                    'https://vg.no/modiacontextholder'
                );
            });
        });

        it('skal bruke relativ path om proxyconfig er true', () => {
            withLocation('https://app.adeo.no/contextpath', () => {
                expect(lagModiacontextholderUrl(true)).toBe('/modiacontextholder');
            });
        });

        it('skal ha fallback til prod om alt feiler', () => {
            withLocation('https://vg.no/contextpath', () => {
                expect(lagModiacontextholderUrl()).toBe('https://app.adeo.no/modiacontextholder');
            });
        });
    });

    describe('getVeilederflatehendelserUrl', () => {
        it('skal ha riktig wss-url i dev.adeo.no', () => {
            withLocation('https://navn.dev.adeo.no/contextpath/', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser-q1.dev.adeo.no/modiaeventdistribution/ws/navident'
                );
            });
        });

        it('skal ha riktig wss-url i app-q6.dev.adeo.no', () => {
            withLocation('https://app-q6.dev.adeo.no/contextpath/', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser-q6.dev.adeo.no/modiaeventdistribution/ws/navident'
                );
            });
        });

        it('skal ha riktig nais-url ved kjøring på nais-preprod', () => {
            withLocation('https://navn-q6.nais.preprod.local/contextpath', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser-q6.adeo.no/modiaeventdistribution/ws/navident'
                );
            });

            withLocation('https://navn.nais.preprod.local/contextpath', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser-q1.adeo.no/modiaeventdistribution/ws/navident'
                );
            });
        });

        it('skal ha riktig nais-url ved kjøring på nais-prod', () => {
            withLocation('https://navn-q.nais.adeo.no/contextpath', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser.adeo.no/modiaeventdistribution/ws/navident'
                );
            });
        });

        it('skal ha riktig url ved kjøring på app-XX.adeo.no', () => {
            withLocation('https://app-q6.adeo.no/contextpath', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser-q6.adeo.no/modiaeventdistribution/ws/navident'
                );
            });
        });

        it('skal ha riktig url ved kjøring på app.adeo.no', () => {
            withLocation('https://app.adeo.no/contextpath', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser.adeo.no/modiaeventdistribution/ws/navident'
                );
            });
        });

        it('skal ha fallback til prod om alt feiler', () => {
            withLocation('https://vg.no/contextpath', () => {
                expect(getVeilederflatehendelserUrl('navident')).toBe(
                    'wss://veilederflatehendelser.adeo.no/modiaeventdistribution/ws/navident'
                );
            });
        });
    });
});
