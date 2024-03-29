import { MaybeCls } from '@nutgaard/maybe-ts';
import { PredefiniertFeilmelding, PredefiniertFeilmeldinger } from '../redux/feilmeldinger/domain';

const kontrollRekke1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
const kontrollRekke2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

const decimalRadix = 10;

function erGyldigPnummer(dag: number, maaned: number) {
    return dag > 0 && dag < 32 && maaned > 0 && maaned < 13;
}

function erGyldigDNummer(dag: number, maaned: number) {
    return dag > 40 && dag < 72 && maaned > 0 && maaned < 13;
}

function erGyldigHNummer(dag: number, maaned: number) {
    return dag > 0 && dag < 32 && maaned > 40 && maaned < 53;
}

function erGyldigBNummer(dag: number, maaned: number) {
    return dag > 0 && dag < 32 && maaned > 20 && maaned < 33;
}

function erGyldigSyntetiskNummer(dag: number, maaned: number) {
    if (maaned <= 80) {
        return false;
    }
    return erGyldigVariant(dag, maaned - 80);
}

function erGyldigVariant(dag: number, maaned: number): boolean {
    return (
        erGyldigPnummer(dag, maaned) ||
        erGyldigDNummer(dag, maaned) ||
        erGyldigHNummer(dag, maaned) ||
        erGyldigBNummer(dag, maaned) ||
        erGyldigSyntetiskNummer(dag, maaned)
    );
}

function erGyldigFodselsdato(fnr: string) {
    const dag = parseInt(fnr.substring(0, 2), decimalRadix);
    let maaned = parseInt(fnr.substring(2, 4), decimalRadix);

    return erGyldigVariant(dag, maaned);
}

function hentKontrollSiffer(fnr: number[], kontrollrekke: number[]) {
    let sum = 0;
    for (let sifferNummer = 0; sifferNummer < fnr.length; sifferNummer++) {
        sum += fnr[sifferNummer] * kontrollrekke[sifferNummer];
    }
    const kontrollSiffer = sum % 11;
    return kontrollSiffer !== 0 ? 11 - kontrollSiffer : 0;
}

export function erGyldigFodselsnummer(fnr: string): boolean {
    if (fnr.length !== 11) {
        return false;
    }
    if (!erGyldigFodselsdato(fnr.substring(0, 6))) {
        return false;
    }
    const fodselsnummerListe = fnr.split('').map((x) => parseInt(x, decimalRadix));
    const kontrollSiffer1 = hentKontrollSiffer(fodselsnummerListe.slice(0, 9), kontrollRekke1);
    const kontrollSiffer2 = hentKontrollSiffer(fodselsnummerListe.slice(0, 10), kontrollRekke2);
    return fodselsnummerListe[9] === kontrollSiffer1 && fodselsnummerListe[10] === kontrollSiffer2;
}

export function lagFnrFeilmelding(fnr: string): MaybeCls<PredefiniertFeilmelding> {
    if (!fnr.match(/^\d+$/)) {
        return MaybeCls.just(PredefiniertFeilmeldinger.FNR_KUN_TALL);
    } else if (fnr.length !== 11) {
        return MaybeCls.just(PredefiniertFeilmeldinger.FNR_11_SIFFER);
    } else if (!erGyldigFodselsnummer(fnr)) {
        return MaybeCls.just(PredefiniertFeilmeldinger.FNR_KONTROLL_SIFFER);
    }
    return MaybeCls.nothing();
}
