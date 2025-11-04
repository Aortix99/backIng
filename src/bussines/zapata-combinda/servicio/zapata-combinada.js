const { grafiConstante } = require("../../pre-calculo/repository/checkeo");
const { forceApplay, areaRequired, cargasOfColumns, DistanceOfLader,
    longZapata, redondearA05, quiuMiu, forceApplicaExt, forceApplicaInt,
    force,
    fnAIzq,
    checkPedestalCombinadas
} = require("../repository/funciones");


const zapataCombinadaService = (req, res) => {
    const { Fc, Fy, Wc, Qa, Ws, Ds, Hz, C, Lz, PdExt, PlExt, CxExt, CyExt, PdInt, PlInt, CxInt, CyInt } = req.body.model;

    let validate = false;
    try {
        const Qe = forceApplay(Qa, Hz, Wc, Ds, Ws);
        console.log('Qe', Qe);
        const A = areaRequired(PdExt, PlExt, PdInt, PlInt, Qe);
        console.log('A', A);
        const Xc_gExt = cargasOfColumns(PdExt, PlExt, PdInt, PlInt, Lz);
        console.log('Xc_gExt', Xc_gExt);
        const Dl = DistanceOfLader(CyExt, Xc_gExt);
        console.log('Dl', Dl);

        // sin redondear segun la medida que tomen.

        const l = longZapata(Dl);
        console.log('l', l);
        const L = redondearA05(l);
        console.log('L', L);
        const Qu = quiuMiu(PdExt, PdInt, PlInt, PlExt, A);
        console.log('Qu', Qu);
        // crear datos para la primera grafica de las fuerzas.

        const PuExt = forceApplicaExt(PdExt, PlExt);
        console.log('PuExt', PuExt);
        const PuInt = forceApplicaInt(PdInt, PlInt);
        console.log('PuInt', PuInt);

        const R = PuExt + PuInt;
        console.log('R', R);
        const W = force(R, l);
        console.log('W', W);
        const E = fnAIzq(PuExt, PuInt, Lz, L);
        console.log('E', E);
        const X1 = (PuInt * Lz) / R;
        console.log('X1', X1);

        const X2 = Lz - X1;
        console.log('X2', X2);

        const I = (E + Lz) - L;
        validate = checkPedestalCombinadas(PuExt, Fc, CxExt, CyExt, L);
        validate = checkPedestalCombinadas(PuInt, Fc, CxInt, CyInt, L);
        if (!validate) {
            return res.status(200).json({
                error: true,
                message: 'Error: los parametros del pedestal no cumplen.',
                details: `Error en la columna ${i + 1}`
            });
        }
        const responseGrafica = grafiConstante(R, L, E, Lz, PuExt, PuInt);

        res.status(200).json({ response: { Qe, A, Xc_gExt, Dl, L, Qu, PuExt, PuInt, R, W, E, X1, X2, I }, responseGrafica });

    } catch (error) {
        console.error('Error al calcular zapata combinada:', error);
        res.status(500).json({ message: 'No se pudo calcular la zapata combinada' });
    }
};

module.exports = {
    zapataCombinadaService
}