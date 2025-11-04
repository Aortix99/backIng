const forceApplay = (Qa, Hz, Wc, Ds, Ws) => {
    const Qe = Qa - Hz * Wc - Ds * Ws;
    return Qe;
};

const areaRequired = (PdExt, PlExt, PdInt, PlInt, Qe) => {
    const A = (PdExt + PlExt + PdInt + PlInt) / Qe
    return A;
};

const cargasOfColumns = (PdExt, PlExt, PdInt, PlInt, Lz) => {
    const Xc_gExt = ((PdInt + PlInt) * Lz) / (PdExt + PlExt + PdInt + PlInt);
    return Xc_gExt;
}

const DistanceOfLader = (CyExt, Xc_gExt) => {
    const Dl = (CyExt / 2) + Xc_gExt;
    return Dl;
};

const longZapata = (Dl) => {
    const L = 2 * (Dl);
    return L;
};

const redondearA05 = (valor) => {
    let resultado = Math.ceil(valor * 20) / 20;
    return resultado.toFixed(2);
}

const quiuMiu = (PdExt, PdInt, PlInt, PlExt, A) => {
    const Qu = (1.2 * (PdExt + PdInt) + 1.6 * (PlExt + PlInt)) / A;
    return Qu;
};

const forceApplicaExt = (PdExt, PlExt) => {
    const PuExt = 1.2 * (PdExt) + 1.6 * (PlExt);
    return PuExt;
};

const forceApplicaInt = (PdInt, PlInt) => {
    const PuInt = 1.2 * (PdInt) + 1.6 * (PlInt);
    return PuInt;
}

const force = (R, L) => {
    const W = R / L;
    return W;
};

const fnAIzq = (PuExt, PuInt, Lz, L) => {
    const aIzqu = (((PuExt + PuInt) * (L / 2)) - (PuInt * Lz)) / (PuExt + PuInt);
    return aIzqu;
};

const n1 = 0.85;
const n2 = 0.65;

const checkPedestalCombinadas = (Pu, Fc, Cx, Cy, L) => {
    console.log('parametros', Pu, Fc, Cx, Cy);
    const conversion = ((Fc) * (1 / 145.038)) / 100;
    const calculo = n1 * n2 * conversion * ((Cx * 100) * (Cy * 100)) * L;
    const validate = (Pu) * (1 / 9.81) <= calculo;
    console.log('pu', (Pu) * (1 / 9.81), 'calculo', calculo);
    return {Pu: (Pu) * (1 / 9.81), calculo, validate};
};
const checkPedestal = (Pu, Fc, Cx, Cy) => {
    const conversion = ((Fc) * (1 / 145.038)) / 100;
    const calculo = n1 * n2 * conversion * ((Cx * 100) * (Cy * 100));
    const validate = (Pu) * (1 / 9.81) <= calculo;
    return {Pu: ((Pu) * (1 / 9.81)).toFixed(2), calculo: calculo.toFixed(2), validate};
};

/**
 * Calcula los puntos críticos para el gráfico de distribución de cargas
 * @param {number} R - Carga total aplicada
 * @param {number} L - Longitud total
 * @param {number} D1 - Distancia 1
 * @param {number} D2 - Distancia 2
 * @param {number} PveX - Carga puntual externa
 * @param {number} PvIn - Carga puntual interna
 * @returns {Array<number>} Array con los 5 puntos críticos del diagrama
 */
const grafiConstante = (R, L, D1, D2, PveX, PvIn) => {
    const D3 = D1 + D2 - L;
    const W = R / L;
    const puntoInicial = D1 * W;
    const puntoDespuesCargaExterna = puntoInicial - PveX;
    const puntoIntermedio = W * D2 + puntoDespuesCargaExterna;
    const puntoDespuesCargaInterna = puntoIntermedio - PvIn;
    const puntoFinal = - puntoDespuesCargaInterna + D3 * W;
    const D = [0, D1, D1, D2, D2, L]
    const V = [0,
        parseFloat(puntoInicial.toFixed(4)),
        parseFloat(puntoDespuesCargaExterna.toFixed(4)),
        parseFloat(puntoIntermedio.toFixed(4)),
        parseFloat(puntoDespuesCargaInterna.toFixed(4)),
        puntoFinal
    ]
    return { D, V };
};

module.exports = {
    forceApplay,
    areaRequired,
    cargasOfColumns,
    DistanceOfLader,
    longZapata,
    quiuMiu,
    forceApplicaExt,
    forceApplicaInt,
    force,
    redondearA05,
    checkPedestal,
    fnAIzq,
    checkPedestalCombinadas
}