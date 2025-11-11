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

    let validate = false;
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
        validate = checkPedestalCombinadas(PuExt, Fc, CxExt, CyExt, L);
        if (!validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: los parametros del pedestal no cumplen.',
                details: `Error en la columna ${i + 1}`
            });
        }
        const responseGrafica = grafiConstante(L, E, Lz, PuExt, PuInt, W);

        const Xa = Math.abs(parseFloat(responseGrafica.V[2] / W).toFixed(4));
        const Xa2 = Math.abs(parseFloat(Xa - Lz).toFixed(4));

        const dataNormal = responseGraficaMomento([E, Xa, Xa2, I], [responseGrafica.V[1], responseGrafica.V[2], responseGrafica.V[3], responseGrafica.V[4]]);

        const C = Math.max(...responseGrafica.V.map(Math.abs));
        let Bo;
        const B1 = (CyExt / 2 + ((PdInt + PlInt) * Lz) / (PdExt + PlExt + PdInt + PlInt));
        Bo = redondearA5(B1);
        const Vu1 = peralteRequeridoEnUnaDireccion(C, W, Hz);
        const Validate1 = validate_4_1(Vu1, Fc, Bo, Hz);
        if (!Validate1.validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: No cumple con los requisistos',
                details: 'no cumple con el peralte en una direccion.'
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

        let P = calculoAceroDoble(Fc, Fy, Bo, Hz, dataNormal);
        P.push(0.0033);
        let As = [];
        let separacionA = [];
        for (let i = 0; i < P.length; i++) {
            const pValue = P[i] * Bo * (Hz - 0.09) * 100;
            As.push(`P${i + 1}`, pValue);
            for (let j = 0; j <= listaAreaAcero.length; j++) {
                const area = listaAreaAcero[j].area;
                const AsValue = Math.ceil(pValue / area);
                const AsKey = L * 100 - 7.5 * 2;
                const separacion = AsKey / (AsValue - 1);

                // Si la validación se cumple, probamos con el siguiente acero (repetimos el for interno)
                if (separacion < 10 || AsValue > 30) {
                    continue; // intenta con la siguiente barra en listaAreaAcero
                }

                // Si la validación NO se cumple, aceptamos este resultado y salimos del for interno
                separacionA.push(separacion);
                break;
            }
        }

        res.status(200).json({
            response: {
                PuMaxExt,
                PuMaxInt,
                PuExt,
                PuInt,
                A,
                Xc_gExt,
                B,
                L,
                Qu,
                R,
                W,
                E,
                X1,
                X2,
                I,
                Bo,
                P
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