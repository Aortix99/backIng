const { pulgadasMetro, listaAreaAcero } = require("../../constantes");
const { forceApplay, redondearA05, forceApplicaExt, checkPedestal } = require("../../zapata-combinda/repository/funciones");
const { areaRequiredCuadrada, areaPorFalla, checkD, validate13_4, validate13_3, validate_4, Vuz, quiuMiuCuadrada, cortanteDireccion, calculoAcero, calculoAceroAs, validate12_3, validate12_4 } = require("../../zapata-cuadrada-aislada/repository/calculate");

const zapataCuadradaCombinadaService = (req, res) => {
    let { Fc, Fy, Pd, Pl, Cx, Cy, Hz, Ds, Ws, Wc, Qa, Rc, Az } = req.body;

    // Convertir strings a números con decimales manteniendo el mismo nombre
    Fc = parseFloat(Fc);
    Fy = parseFloat(Fy);
    Pd = parseFloat(Pd);
    Pl = parseFloat(Pl);
    Cx = parseFloat(Cx);
    Cy = parseFloat(Cy);
    Hz = parseFloat(Hz);
    Ds = parseFloat(Ds);
    Ws = parseFloat(Ws);
    Wc = parseFloat(Wc);
    Qa = parseFloat(Qa);
    Rc = parseFloat(Rc);
    Az = parseInt(Az);

    console.log('====>', Az);
    const Qe = forceApplay(Qa, Hz, Wc, Ds, Ws);
    const Pu = forceApplicaExt(Pd, Pl);

    let cantidadAcero = 0;
    let a = areaRequiredCuadrada(Pd, Pl, Qe);
    if (a < 1) a = 1;

    let L = 0;
    let A = Math.sqrt(a);
    L = redondearA05(A);

    const validate0 = checkPedestal(Pu, Fc, Cx, Cy);
    if (!validate0.validate) {
        return res.status(200).json({
            error: true,
            message: 'Error: area del pedestal no cumplen aumentar seccion.',
            details: `Error en la columna`
        });
    }

    let B = L;
    A = L * L;

    const Qu = quiuMiuCuadrada(Pd, Pl, A);

    const De = Hz - 0.09;
    const Bo = areaPorFalla(Cx, De);
    const Vu2 = Vuz(A, Cx, De, Qu);

    const D = checkD(Vu2, Fc, Bo) * pulgadasMetro;
    const d = Hz - 0.09;

    const validate1 = D < d;
    if (!validate1) {
        return res.status(200).json({
            error: true,
            message: 'Error: No cumple con los requisistos de 12.2., aumentar Hz',
            details: 'El peralte requerido es mayor que el peralte disponible.'
        });
    }

    const Bc = Cx >= Cy ? Cx / Cy : Cy / Cx;

    const validate2 = validate12_3(Vu2, Bc, Fc, Bo, Hz);
    if (!validate2.validate) {
        return res.status(200).json({
            error: true,
            message: 'Error: No cumple con los requisistos de 12.2., aumentar Hz',
            details: 'No aplica ecuacion 12.3. Aumenta la Hz'
        });
    }

    const validate3 = validate12_4(Vu2, Fc, Bo, Hz);
    if (!validate3.validate) {
        return res.status(200).json({
            error: true,
            message: 'Error: No cumple con los requisistos de 12.2., aumentar Hz',
            details: 'No aplica ecuacion 12.4. Aumenta la Hz'
        });
    }

    const e = cortanteDireccion(B, Math.max(Cx, Cy), Hz);
    const Vu1 = B * e * Qu;

    const validate4 = validate_4(Vu1, Fc, L, Hz);
    if (!validate4.validate) {
        return res.status(200).json({
            error: true,
            message: 'Error: No cumple con los requisistos, aumentar Hz',
            details: 'no cumple con el cuarto punto.'
        });
    }

    let P = calculoAcero(Fc, Fy, B, Hz, e, L, Qu);
    if (P.As < 0.0033) P.As = 0.0033;
    const As = calculoAceroAs(P.As, L, Hz - 0.09);
    const aceroCalculado = As / listaAreaAcero.find(item => item.Az === Az).area;
    cantidadAcero = Math.ceil(aceroCalculado);

    const espacioEntreBarras = (L * 100) - Rc * 2;
    const espacioEntreBarrasValidate = espacioEntreBarras / (cantidadAcero - 1);

    if (espacioEntreBarrasValidate < 10 || espacioEntreBarrasValidate > 30) {
        return res.status(200).json({
            error: true,
            message: `Error: No cumple con los requisistos de espacio entre barras. El espacio entre barras debe estar entre 10 y 30 cm. separación entre barras es de: ${espacioEntreBarrasValidate.toFixed(2)} Cm.`,
        });
    }

    return res.status(200).json({
        error: false,
        response: {
            a: a.toFixed(2),
            A: A.toFixed(2),
            aceroCalculado: aceroCalculado.toFixed(2),
            As: As.toFixed(2),
            B: B,
            Bc: Bc.toFixed(2),
            Bo: Bo.toFixed(2),
            maxCxCy: Math.max(Cx, Cy),
            cantidadAcero,
            D: D.toFixed(2),
            d: d.toFixed(2),
            De: De.toFixed(2),
            e: e.toFixed(2),
            espacioEntreBarras: espacioEntreBarras.toFixed(2),
            espacioEntreBarrasValidate: espacioEntreBarrasValidate.toFixed(2),
            L: L,
            Pu: Pu.toFixed(2),
            P: P.As.toFixed(4),
            Mu: P.Mu.toFixed(4),
            Qe: Qe.toFixed(2),
            Qu: Qu.toFixed(2),
            validate0,
            validate1,
            validate2,
            validate3,
            validate4,
            Vu1: Vu1.toFixed(2),
            Vu2: Vu2.toFixed(2),
            isEsquinera: false
        },
        message: 'Zapata diseñada con exito...',
    });
}

module.exports = {
    zapataCuadradaCombinadaService
}
