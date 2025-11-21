const { toneladasAkn, psi, estable, phi2, newtons, phi, pulgadasMetro } = require("../../constantes");

const forceApplay = (Qa, Hz, Wc, Ds, Ws) => {
    const Qe = Qa - Hz * Wc - Ds * Ws;
    return parseFloat(Qe.toFixed(4));
};

const areaRequired = (PuMaxInt, Qa) => {
    const Pservise = ((PuMaxInt) / 1.5);
    const A = (Pservise) / Qa;
    return parseFloat(A.toFixed(4));
};

const cargasOfColumns = (PdExt, PlExt, PdInt, PlInt, Lz) => {
    const Xc_gExt = ((PdInt + PlInt) * Lz) / (PdExt + PlExt + PdInt + PlInt);
    return parseFloat(Xc_gExt.toFixed(4));
}

const DistanciaLindero = (A, L) => {
    const B = (A / L);
    return parseFloat(B.toFixed(4));
};

const longZapata = (CxExt, X1) => {
    const L = 2 * ((CxExt / 2) + X1);
    return parseFloat(L.toFixed(4));
};

const redondearA05 = (valor) => {
    let resultado = Math.ceil(valor * 20) / 20;
    return parseFloat(resultado.toFixed(4));
}
const redondearA5 = (valor) => {
    let resultado = Math.ceil(valor * 1) / 1;
    return parseFloat(resultado.toFixed(1));
}

const quiuMiu = (PdExt, PdInt, PlInt, PlExt, A) => {
    const Qu = (1.2 * (PdExt + PdInt) + 1.6 * (PlExt + PlInt)) / A;
    return parseFloat(Qu.toFixed(4));
};

const forceApplicaExt = (PdExt, PlExt) => {
    const PuExt = 1.2 * (PdExt) + 1.6 * (PlExt);
    return parseFloat(PuExt.toFixed(4));
};

const forceApplicaInt = (PdInt, PlInt) => {
    const PuInt = (1.2 * PdInt) + (1.6 * PlInt);
    return parseFloat(PuInt.toFixed(4));
}

const force = (Qu, B) => {
    const W = Qu * B;
    return parseFloat(W.toFixed(4));
};

const fnAIzq = (PuExt, PuInt, Lz, L) => {
    const aIzqu = (((PuExt + PuInt) * (L / 2)) - (PuInt * Lz)) / (PuExt + PuInt);
    return parseFloat(aIzqu.toFixed(4));
};

const n1 = 0.85;
const n2 = 0.65;

const checkPedestalCombinadas = (Pu, Fc, Cx, Cy, L) => {
    const conversion = ((Fc) * (1 / 145.038)) / 100;
    const calculo = n1 * n2 * conversion * ((Cx * 100) * (Cy * 100)) * L;
    const validate = (Pu) * (1 / 9.81) <= calculo;
    return { Pu: (Pu) * (1 / 9.81), calculo, validate };
};
const checkPedestal = (Pu, Fc, Cx, Cy) => {
    const conversion = ((Fc) * (1 / 145.038)) / 100;
    const calculo = n1 * n2 * conversion * ((Cx * 100) * (Cy * 100));
    const validate = (Pu) * (1 / 9.81) <= calculo;
    return { Pu: ((Pu) * (1 / 9.81)).toFixed(4), calculo: calculo.toFixed(4), validate };
};

const responseGraficaMomento = (x, y) => {
    let areas = [];
    let suma = 0;

    for (let i = 0; i <= x.length - 1; i++) {
        const base = x[i];
        const altura = y[i];

        const area = (base * altura) / 2;

        suma += area;
        areas.push(area);
    }

    return areas;
};

const FuerzaPuMax = (Fc, Cx, Cy) => {
    const PuMax = (0.7 * 0.85 * Fc * (Cx * 100 * Cy * 100)) / 1000;
    return parseFloat((PuMax).toFixed(10));
}

const Vultimo = (Cu, W, Hz, Fc) => {
    const d = Hz - 0.09;
    const Vu = ((Cu * 1000) - (W * 10) * (20 + (d * 100))) / (0.53 * 0.75 * Math.sqrt(Fc) * (d * 100));
    return Vu;
};

const calculoAceroDoble = (Fc, Fy, B, Hz, Mu) => {
    const MuAbs = Mu.map(Math.abs);
    let response = [];
    for (let i = 1; i < MuAbs.length; i++) {
        const d = Hz - 0.09;
        const A = ((Fc * 0.098) / (2 * 0.59 * (Fy * 0.098))) ** 2;
        const Ab = ((MuAbs[i] * 0.0098) * (Fc * 0.098)) / ((B / 100) * (d) ** 2 * phi2 * estable * (Fy * 0.098) ** 2);
        const raiz = A - Ab;
        const asi = (Fc * 0.098 / (2 * estable * (Fy * 0.098)));
        let As = asi - Math.sqrt(raiz);
        if (As < 0.0033) As = 0.0033;
        response.push(As);
    }
    return response;
};

const peralteRequeridoEnUnaDireccion = (C, W, Hz) => {
    const d = Hz - 0.09;
    const V = C - W * d;
    return V;
}

const validate_4_1 = (Vu1, Fc, Bo, Hz) => {
    let validate = false;
    const d = (Vu1 * 2204.62) / (0.75 * 2 * Math.sqrt(Fc * 14.223) * (Bo * 39.37));
    validate = d * pulgadasMetro < Hz - 0.09;
    return { d: (d * pulgadasMetro).toFixed(2), Hz: (Hz - 0.09).toFixed(2), validate };
};

const forceVu2 = (PuInt, CyInt, Hz, Qu) => {
    const d = Hz - 0.09;
    const Vu2 = ((PuInt) - (CyInt + d) ** 2 * Qu);
    return Vu2;
};
const forceVu3 = (PuExt, CyExt, CxExt, Qu, Hz) => {
    const d = Hz - 0.09;
    const Vu3 = ((PuExt) - ((CyExt + d) * (CxExt + d/2)) * Qu);
    console.log('Vu3', Vu3);
    return Vu3;
};
const validate_4_2 = (Vu2, Fc, CyInt, Hz, Va, CxExt) => {
    let validate = false;
    let variable = Va ? (4 * (CyInt * 39.37 + (Hz - 0.09) * 39.37)) : (((CyInt + (Hz - 0.09)) * (CxExt + (Hz - 0.09)/2)) * 39.37) * 2;
    const d = (Vu2 * 2204.62) / (0.75 * 4 * Math.sqrt(Fc * 14.223) * variable);
    validate = d * pulgadasMetro < Hz - 0.09;
    console.log('d', d * pulgadasMetro, 'Hz', Hz - 0.09, 'validate', validate, d);
    return { d: (d * pulgadasMetro).toFixed(6), Hz: (Hz - 0.09).toFixed(2), validate };
}
module.exports = {
    forceApplay,
    areaRequired,
    cargasOfColumns,
    DistanciaLindero,
    longZapata,
    quiuMiu,
    forceApplicaExt,
    forceApplicaInt,
    force,
    redondearA05,
    redondearA5,
    checkPedestal,
    fnAIzq,
    checkPedestalCombinadas,
    responseGraficaMomento,
    FuerzaPuMax,
    Vultimo,
    calculoAceroDoble,
    peralteRequeridoEnUnaDireccion,
    validate_4_1,
    forceVu2,
    validate_4_2,
    forceVu3
}