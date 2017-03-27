import React from 'react';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import Header from '../../js/components/Header';
import Enhet from '../../js/components/Enhet';
import Veileder from '../../js/components/Veileder';
import Sokefelt from '../../js/containers/SokefeltContainer';
import EnhetVelger from '../../js/components/EnhetVelger';
import Feilmelding from '../../js/components/Feilmelding';

describe("Header", () => {
    let toggles;

    beforeEach(() => {
        toggles = {
            visVeileder: false,
            visSokefelt: false,
            visEnhetVelger: false,
            visEnhet: false,
        }
    });

    it("visEnhet satt til true renderer Enhet", () => {
        toggles.visEnhet = true;
        const combo = shallow(<Header toggles={toggles} />);
        expect(combo.find(Enhet)).to.have.length(1);
        expect(combo.find(Veileder)).to.have.length(0);
        expect(combo.find(EnhetVelger)).to.have.length(0);
        expect(combo.find(Sokefelt)).to.have.length(0);
    });

    it("visVeileder satt til true renderer Veileder", () => {
        toggles.visVeileder = true;
        const combo = shallow(<Header toggles={toggles} />);
        expect(combo.find(Enhet)).to.have.length(0);
        expect(combo.find(Veileder)).to.have.length(1);
        expect(combo.find(EnhetVelger)).to.have.length(0);
        expect(combo.find(Sokefelt)).to.have.length(0);
    });

    it("visEnhetVelger satt til true renderer EnhetVelger", () => {
        toggles.visEnhetVelger = true;
        const combo = shallow(<Header toggles={toggles} />);
        expect(combo.find(Enhet)).to.have.length(0);
        expect(combo.find(Veileder)).to.have.length(0);
        expect(combo.find(EnhetVelger)).to.have.length(1);
        expect(combo.find(Sokefelt)).to.have.length(0);
    });

    it("visSokefelt satt til true renderer Sokefelt", () => {
        toggles.visSokefelt = true;
        const combo = shallow(<Header toggles={toggles} />);
        expect(combo.find(Enhet)).to.have.length(0);
        expect(combo.find(Veileder)).to.have.length(0);
        expect(combo.find(EnhetVelger)).to.have.length(0);
        expect(combo.find(Sokefelt)).to.have.length(1);
    });

    it("viser feilmelding dersom den er satt til noe", () => {
        const feilmelding = "feilmelding";
        const combo = shallow(<Header feilmelding={feilmelding} />);
        expect(combo.find(Feilmelding)).to.have.length(1);
    });

    it("viser ikke feilmelding dersom den ikke er satt til noe", () => {
        const combo = shallow(<Header />);
        expect(combo.find(Feilmelding)).to.have.length(0);
    });
});