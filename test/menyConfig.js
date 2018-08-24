import { expect } from 'chai';

import { arenaLenke } from '../js/menyConfig';

const AREMARK_FNR = '***REMOVED***8';

const setHost = (host) => {
    global.window = {
        location: { host },
    };
};

describe('Lenker', () => {
    describe('arena lenke', () => {
        describe('i produksjon', () => {
            before(() => {
                setHost('arena.adeo.no');
            });

            it('med person i kontekst', () => {
                const lenke = arenaLenke(AREMARK_FNR);
                expect(lenke.url).to.equal(`http://arena.adeo.no/forms/arenaMod.html?oppstart_skj=AS_REGPERSONALIA&fodselsnr=${AREMARK_FNR}`);
            });

            it('uten person i kontekst', () => {
                const lenke = arenaLenke();
                expect(lenke.url).to.equal('http://arena.adeo.no/forms/frmservlet?config=arena');
            });
        });

        describe('i q1', () => {
            before(() => {
                setHost('arena-q1.adeo.no');
            });

            it('med person i kontekst', () => {
                const lenke = arenaLenke(AREMARK_FNR);
                expect(lenke.url).to.equal(`http://arena-q1.adeo.no/forms/arenaMod_q1.html?oppstart_skj=AS_REGPERSONALIA&fodselsnr=${AREMARK_FNR}`);
            });

            it('uten person i kontekst', () => {
                const lenke = arenaLenke();
                expect(lenke.url).to.equal('http://arena-q1.adeo.no/forms/frmservlet?config=areq01');
            });
        });

        describe('i t11', () => {
            before(() => {
                setHost('arena-t11.adeo.no');
            });

            it('med person i kontekst', () => {
                const lenke = arenaLenke(AREMARK_FNR);
                expect(lenke.url).to.equal(`http://arena-t11.adeo.no/forms/arenaMod_t11.html?oppstart_skj=AS_REGPERSONALIA&fodselsnr=${AREMARK_FNR}`);
            });

            it('uten person i kontekst', () => {
                const lenke = arenaLenke();
                expect(lenke.url).to.equal('http://arena-t11.adeo.no/forms/frmservlet?config=aret11');
            });
        });
    });
});