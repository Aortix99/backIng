const { listaAreaAcero } = require("../../constantes");
const { grafiConstante } = require("../../pre-calculo/repository/checkeo");
const { areaRequired, cargasOfColumns, DistanceOfLader,
    longZapata, quiuMiu, forceApplicaExt, forceApplicaInt,
    force,
    fnAIzq,
    checkPedestalCombinadas,
    responseGraficaMomento,
    FuerzaPuMax,
    DistanciaLindero,
    Vultimo,
    calculoAceroDoble,
    redondearA5,
    peralteRequeridoEnUnaDireccion,
    validate_4_1,
    forceVu2,
    validate_4_2,
    forceVu3
} = require("../repository/funciones");


const zapataCombinadaService = (req, res) => {
    const { Fc, Fy, Wc, Qa, Ds, Hz, C, Lz, PdExt, PlExt, CxExt, CyExt, PdInt, PlInt, CxInt, CyInt } = req.body.model;

    let validateExt;
    let validateInt;
    try {

        const PuMaxExt = FuerzaPuMax(Fc, CxExt, CyExt);
        const PuMaxInt = FuerzaPuMax(Fc, CxInt, CyInt);

        const PuExt = forceApplicaExt(PdExt, PlExt);
        const PuInt = forceApplicaInt(PdInt, PlInt);

        if (PuExt > PuMaxExt || PuInt > PuMaxInt) {
            const validate = PuExt > PuMaxExt ? 'externa' : 'interna';
            return res.status(200).json({
                error: true,
                message: `Error: La carga de la columna ${validate} excede la presión de contacto.`,
            });
        }

        const A = areaRequired(PuMaxInt, Qa);

        let R = PuExt + PuInt;
        let X1 = (PuInt * Lz) / R;

        const Xc_gExt = cargasOfColumns(PdExt, PlExt, PdInt, PlInt, Lz);
        const L = longZapata(CxExt, X1);
        const B = DistanciaLindero(A, L);

        // sin redondear segun la medida que tomen.

        const Qu = quiuMiu(PdExt, PdInt, PlInt, PlExt, A);
        // crear datos para la primera grafica de las fuerzas.

        R = parseFloat(R.toFixed(4));
        const W = force(Qu, B);
        const E = fnAIzq(PuExt, PuInt, Lz, L);
        X1 = parseFloat(X1.toFixed(4));
        let X2 = Lz - X1;
        X2 = parseFloat(X2.toFixed(4));

        const I = Math.abs((E + Lz) - L);
        validateExt = checkPedestalCombinadas(PuExt, Fc, CxExt, CyExt);
        if (!validateExt.validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: los parametros del pedestal externo no cumplen.',
            });
        }
        validateInt = checkPedestalCombinadas(PuInt, Fc, CxInt, CyInt);
        if (!validateInt.validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: los parametros del pedestal interno no cumplen.',
            });
        }
        const responseGrafica = grafiConstante(L, E, Lz, PuExt, PuInt, W);

        const Xa = Math.abs(parseFloat(responseGrafica.V[2] / W).toFixed(4));
        const Xa2 = Math.abs(parseFloat(Xa - Lz).toFixed(4));

        // const dataNormal = ([E, Xa, Xa2, I], [responseGrafica.V[1], responseGrafica.V[2], responseGrafica.V[3], responseGrafica.V[4]]);
        const MomentoG = responseGraficaMomento([E, Xa, Xa2, I], [responseGrafica.V[1], responseGrafica.V[2], responseGrafica.V[3], responseGrafica.V[4]]);
        const C = Math.max(...responseGrafica.V.map(Math.abs));
        // este se usa para la separacion de acero princpapal inferior 
        let Bo;
        const B1 = (CyExt / 2 + ((PdInt + PlInt) * Lz) / (PdExt + PlExt + PdInt + PlInt));
        Bo = redondearA5(B1);
        // acero principal superior
        const Bo1 = (((C * 1000) - (W * 10) * (20 + (Hz * 100 - 0.09 * 100))) / (0.53 * 0.75 * Math.sqrt(Fc) * (Hz * 100 - 0.09 * 100)))/100;
        const Vu1 = peralteRequeridoEnUnaDireccion(C, W, Hz);
        const Validate1 = validate_4_1(Vu1, Fc, Bo, Hz);
        if (!Validate1.validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: no cumple con el peralte en una direccion. Aumentar Hz',
            });
        }

        // 1.1 PERALTE REQUERIDO EN DOS DIRECCIONES COLUMNA INTERNA
        const Vu2 = forceVu2(PuInt, CyInt, Hz, Qu, Fc);
        const Validate2 = validate_4_2(Vu2, Fc, CyInt, Hz, true, CxExt);
        if (!Validate2.validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: No cumple con los requisistos por puncionamiento en dos direcciones columna interna',
            });
        }

        // 1.2 PERALTE REQUERIDO EN UNA DIRECCION COLUMNA EXTERNA

        const Vu3 = forceVu3(PuExt, CyExt, CxExt, Qu, Hz);
        const Validate3 = validate_4_2(Vu3, Fc, CyExt, Hz, false, CxExt);
        if (!Validate3.validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: No cumple con los requisistos por puncionamiento en una direccion columna externa',
            });
        }

        let response1 = calculoAceroDoble(Fc, Fy, Bo1, Hz, MomentoG);
        const response5 = calculateAcero(response1, Bo1, Hz, listaAreaAcero, L);
        const graficaMomento = {y: [0, ...response1.MuAbsEXp], x: [0, E, Xa, Lz, L]};
        // pendiente checkeo.
        // const armaduraTransversalExt = calculoDeLaArmaduraTransversal(PuExt, (Hz- 0.09), CxExt, Bo1, true);
        // const armaduraTransversalInt = calculoDeLaArmaduraTransversal(PuInt, (Hz- 0.09), CyInt, Bo1, false);
        res.status(200).json({
            response: {
                PuMaxExt,
                PuMaxInt,
                PuExt,
                PuInt,
                A,
                Xc_gExt,
                B,
                C,
                L,
                Qu,
                R,
                W,
                E,
                X1,
                X2,
                I,
                Bo,
                Vu1,
                Vu2,
                Vu3,
                validateExt,
                validateInt,
                Validate1,
                Validate2,
                Validate3,
                As1: response5.As,
                separacionA1: response5.separacionA,
                response1,
                graficaMomento
            },
            responseGrafica
        });

    } catch (error) {
        res.status(500).json({ message: 'No se pudo calcular la zapata combinada', error: error && error.message ? String(error.message) : undefined });
    }
};

module.exports = {
    zapataCombinadaService
}

const calculateAcero = (response, Bo, Hz, listaAreaAcero, L) => {
    let As = [];
    let separacionA = [];
    for (let i = 0; i < response.P.length; i++) {
        const pValue = response.P[i] * Bo * 100 * (Hz * 100 - 0.09 * 100) ;
        As.push(`P${i + 1}`, pValue);
        for (let j = 0; j <= listaAreaAcero.length; j++) {
            const area = listaAreaAcero[j].area;
            const Az = listaAreaAcero[j].Az;
            const AsValue = Math.ceil(pValue / area);
            const AsKey = L * 100 - 7.5 * 2;
            let separacion = AsKey / (AsValue - 1);
            if (separacion <= 10 || AsValue >= 30) {
                continue;
            }
            separacionA.push({ separacion, Az });
            break;
        }   
    }
    return { As, separacionA };
}

const calculoDeLaArmaduraTransversal = (Pu, d, Cx, Bo1, bool) => {
    const Wu = Pu / (Cx + d * (bool ? 1 : 2));
    const Mu = Pu * (((Bo1 - Cx) / 2) ** 2) / 2;
    return { Wu, Mu};
};