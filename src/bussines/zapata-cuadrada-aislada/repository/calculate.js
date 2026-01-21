const { phi2, psi, estable, newtons, pulgadasMetro, pulgadas, phi, FpD, FpL } = require("../../constantes");

const areaRequiredCuadrada = (Pd, Pl, Qe) => {
    const A = (Pd + Pl) / Qe;
    return A;
};

const quiuMiuCuadrada = (Pd, Pl, A) => {
    const Qu = (FpD * (Pd) + FpL * (Pl)) / A;
    return Qu;
};

const areaPorFalla = (Cx, De) => {
    const Bo = (4) * (Cx + De);
    return Bo;
};

const Vuz = (A, Cx, De, Qu) => {
    const Vuz = (A - (Cx + De)) * (Qu);
    return Vuz;
}

const checkD = (Vu2, Fc, Bo) => {
    const D = (Vu2 * newtons) / (phi * 4 * 1 * Math.sqrt(Fc) * (Bo * pulgadas));
    return D;
};

const validate12_3 = (Vu2, Bc, Fc, Bo, Hz) => {
    let validate = false;
    const d = (Vu2 * newtons) / (phi * (2 + (4 / Bc)) * 1 * Math.sqrt(Fc) * (Bo * pulgadas));
    validate = d * pulgadasMetro < (Hz - 0.09);
    return { d: (d * pulgadasMetro).toFixed(2), Hz: Hz.toFixed(2), validate };
};

const validate12_4 = (Vu2, Fc, Bo, Hz) => {
    let validate = false;
    const Hz_9 = Hz * pulgadas;
    const d = (Vu2 * newtons) / (phi * (((40 * Hz_9) / (Bo * pulgadas)) + 2) * 1 * Math.sqrt(Fc) * (Bo * pulgadas));
    validate = d * pulgadasMetro < (Hz - 0.09);
    return { d: (d * pulgadasMetro).toFixed(2), Hz: Hz.toFixed(2), validate };
};

const cortanteDireccion = (B, C, Hz) => {
    const e = (B / 2) - (C / 2) - (Hz - 0.09);
    return e;
};

const validate_4 = (Vu1, Fc, L, Hz) => {
    let validate = false;
    const d = (Vu1 * newtons) / (phi * 2 * Math.sqrt(Fc) * L * pulgadas);
    validate = d * pulgadasMetro < (Hz - 0.09);
    return { d: (d * pulgadasMetro).toFixed(2), Hz: Hz.toFixed(2), validate };
};
const calculoAcero = (Fc, Fy, B, Hz, e, L, Qu, MuV = 0, validate = false) => {
    let Mu = 0;
    const d = Hz - 0.09;
    if (validate) {
        Mu = MuV;
    } else {
        Mu = (e + d) * L * Qu * ((e + d) / 2);
    }
    const A = ((Fc * psi) / (2 * estable * (Fy * psi))) ** 2;
    const Ab = ((Mu * 0.001) * (Fc * psi)) / (B * (d) ** 2 * phi2 * estable * (Fy * psi) ** 2);
    const raiz = A - Ab;
    const As = (Fc * psi / (2 * estable * (Fy * psi))) - Math.sqrt(raiz);
    return { As, Mu };
};

const calculoAceroAs = (P, L, d) => {
    const As = P * (L * 100) * (d * 100);
    return As;
};
module.exports = {
    areaRequiredCuadrada,
    quiuMiuCuadrada,
    areaPorFalla,
    Vuz,
    checkD,
    validate12_3,
    validate12_4,
    cortanteDireccion,
    validate_4,
    calculoAcero,
    calculoAceroAs
}