// Función auxiliar para redondear a 2 decimales
const redondear = (valor) => {
    if (typeof valor === 'number') {
        return Math.round(valor * 100) / 100;
    }
    return valor;
};

// Función para redondear a incrementos de 0.05 con 2 decimales
const redondearMedio = (valor) => {
    // Redondea al incremento de 0.05 más cercano
    return Math.ceil(valor * 20) / 20;
};

const { calculoAceroDoble } = require("../../zapata-combinda/repository/funciones");
const { calcularPresionMaxima, R, X, Pservicio, Area, ejeY, validacionPunzonamiento, ejeYMomento, Mu, As } = require("../repositorio/funciones");
const { listaAreaAcero, estable } = require("../../constantes");

const zapata_excentrica_viga_amarre_servicio = (req, res) => {
    // Av ancho de viga
    // Hv altura de viga
    // Nbarras viene como un objeto completo = {data: 4, item: 3/8}
    // zapataExt el acero deberia venir un json que me mande el area y el numero de la barra y su nomenclatura que se presente en el front tipo lista
    // zapataInt el acero deberia venir un json que me mande el area y el numero de la barra y su nomenclatura que se presente en el front tipo lista
    // vgNroBarra el acero deberia venir un json que me mande el area y el numero de la barra y su nomenclatura que se presente en el front tipo lista
    const { Fc, Fy, Qa, Hz, Lz, PuExt, PuInt, CyExt, CxExt, CyInt, CxInt, Hv, Av, ramas, Nbarras, zapataExtLarga, zapataExtCorta, zapataInt, vgNroBarra } = req.body.model;
    // revision de presion de contacto
    const presionInt = calcularPresionMaxima(Fc, CxInt, CyInt);
    const presionExt = calcularPresionMaxima(Fc, CxExt, CyExt);

    // Validaciones de presión
    const validaciones = [
        { presion: PuExt, limite: presionExt.resultado, tipo: 'externa' },
        { presion: PuInt, limite: presionInt.resultado, tipo: 'interna' }
    ];
    for (const { presion, limite, tipo } of validaciones) {
        if (presion > limite) {
            return res.status(200).json({
                error: true,
                message: `Requiere aumento de pedestal la columna ${tipo}`
            });
        }
    }
    // calculamos dimencion L
    const R_value = R(PuExt, PuInt);
    const X_value = X(PuInt, Lz, R_value.resultado);
    const PservicioExt = Pservicio(PuExt);
    const PservicioInt = Pservicio(PuInt);

    const AreaZapataInt = Area(PservicioInt.resultado, Qa);
    const AreaZapataExt = Area(PservicioExt.resultado, Qa);

    // la interna es cuadrada asi que contara con la raiz cuadrada de su area
    const B_Int = redondear(Math.sqrt(AreaZapataInt.resultado));
    const L_Int = B_Int;

    // para la externa la zapara no puede ser cuadrada la tomamos rectangular
    const B_Ext = { formula: `√(${AreaZapataExt.resultado} * 2)`, resultado: redondear(Math.sqrt(AreaZapataExt.resultado * 2)) }
    const L_Ext = redondear(B_Ext.resultado / 2)
    const Lf2 = redondear(L_Ext - ((CxExt / 100) / 2));
    // calculamos las reacciones del suelo y se revisa la dimension de la zapata
    const Dis = { formula: `(${CxExt / 100}m - ${L_Ext}m) / 2`, resultado: redondear(Math.abs((CxExt / 100 - L_Ext) / 2)) };
    const Lz2 = redondear(Lz - Dis.resultado);
    const Re_Servicio = { formula: `(${PservicioExt.resultado} Ton * ${Lz} m) / ${Lz2} m`, resultado: redondear((PservicioExt.resultado * Lz) / Lz2) };
    const Ri_Servicio = { formula: `(-${PservicioExt.resultado} Ton * ${Dis.resultado}m + ${PservicioInt.resultado} Ton * ${Lz2} m) / ${Lz2}`, resultado: redondear((-PservicioExt.resultado * Dis.resultado + PservicioInt.resultado * Lz2) / Lz2) };

    // dimensiones finales de la zapata.

    // este es la externa.
    const Ae = { formula: `${Re_Servicio.resultado} Ton / ${Qa} Ton/m²`, resultado: redondear(Re_Servicio.resultado / Qa) }
    const BfinalExt = { formula: `√(${Ae.formula}m² * 2)`, resultado: redondearMedio(Math.sqrt(Ae.resultado * 2)) }
    if (BfinalExt.resultado < 1.6) BfinalExt.resultado = 1.6; // dimension minima de 1.6 m
    const LfinalExt = { formula: `${BfinalExt.formula}m/2`, resultado: redondearMedio(BfinalExt.resultado / 2) }
    // este es la interna.
    const Ai = { formula: `${Ri_Servicio.resultado} Ton / ${Qa} Ton/m²`, resultado: redondear(Ri_Servicio.resultado / Qa) }
    const BfinalInt = { formula: `√(${Ai.formula}m²)`, resultado: redondearMedio(Math.sqrt(Ai.resultado)) }
    const LfinalInt = { formula: `√(${Ai.formula}m²)`, resultado: redondearMedio(Math.sqrt(Ai.resultado)) }

    // paso 3
    // tazado de diagrama y diseño de la cimentacion para cargas mayoradas se tiene
    const Re_UltimoExt = { formula: `(${PuExt}Ton * ${Lz}m) / ${Lz2}m`, resultado: redondear((PuExt * Lz) / Lz2) };
    const Ri_UltimoInt = { formula: `(${PuInt}Ton * ${Lz2}m - ${PuExt}Ton * ${Dis.resultado}m ) / ${Lz2}m`, resultado: redondear((PuInt * Lz2 - PuExt * Dis.resultado) / Lz2) };

    const We = { formula: `${Re_UltimoExt.resultado} Ton / ${LfinalExt.resultado} m`, resultado: redondear(Re_UltimoExt.resultado / LfinalExt.resultado) };
    const Wi = { formula: `${Ri_UltimoInt.resultado} Ton / ${LfinalInt.resultado} m`, resultado: redondear(Ri_UltimoInt.resultado / LfinalInt.resultado) };

    // graficas de esfuerzo cortante y momento
    const Ltotal = ((CxExt / 100) / 2) + Lz + (LfinalInt.resultado / 2);
    const L6 = (LfinalInt.resultado / 2);
    const arrayDataEjeY = ejeY(We, (CxExt / 100), PuExt, Lf2, Wi, PuInt, LfinalInt);
    const L2 = arrayDataEjeY[1] / We.resultado;
    const L3 = L_Ext - Math.abs(L2) - (CxExt / 100) / 2;
    const L4 = Ltotal - LfinalInt.resultado - LfinalExt.resultado;
    const L5 = LfinalInt.resultado / 2;
    // Array de posiciones en eje X - ordenado y documentado
    const arrayDataEjeX = [
        0,                                              // Inicio
        (CxExt / 100) / 2,                                      // Centro columna externa
        ((CxExt / 100) / 2),                           // Final viga externa
        LfinalExt.resultado,                      // Ancho zapata externa
        Lz - (BfinalInt.resultado / 2) + (CxExt / 100) / 2,   // Centro columna interna
        (CxExt / 100) / 2 + Lz,                              // Posición Lz
        (CxExt / 100) / 2 + Lz,                              // Duplicado (gráfica)
        Ltotal                                     // Centro total
    ];
    // eje y de momento
    const momentEjeY = ejeYMomento(arrayDataEjeY, (CxExt / 100), L2, L3, L4, L5, L6);
    // REVISION DE ESPESOR ASUMIDO
    const QultimoInt = { formula: `${PuInt} Ton / (${LfinalInt.resultado} m * ${BfinalInt.resultado} m)`, resultado: PuInt / (LfinalInt.resultado * BfinalInt.resultado) };
    const d = Hz - 9;
    const b0 = 2 * (CxInt + d) + 2 * (CyInt + d);
    const Vu = PuInt - QultimoInt.resultado * ((CxInt / 100) + (d / 100)) * ((CyInt / 100) + (d / 100));
    // en la interna siempre sera 1 ya que es cuadrada
    const Bc = 1;
    // validaciones de punzonamiento. 
    const Validate1 = validacionPunzonamiento(Vu, 1.1, 0.75, Fc, 1, b0, d);
    const Validate2 = validacionPunzonamiento(Vu, 0.27, 0.75, Fc, (2 + (4 / Bc)), b0, d);
    const Validate3 = validacionPunzonamiento(Vu, 0.27, 0.75, Fc, (2 + ((40 * d) / b0)), b0, d);
    if (!Validate1 || !Validate2 || !Validate3) {
        return res.status(200).json({
            error: true,
            message: `Error de punzonamiento: alguna de las validaciones no se cumple. falla por punzonamiento para la culumna interna.`
        });
    };
    // cortante en una direccion. Analisis en la direccion de B.

    const Vu1 = QultimoInt.resultado * BfinalInt.resultado * ((LfinalInt.resultado / 2) - ((CxInt / 100) / 2) - (d / 100));
    const validate4 = validacionPunzonamiento(Vu1, 0.53, 0.75, Fc, 1, (BfinalInt.resultado * 100), d);
    if (!validate4) {
        return res.status(200).json({
            error: true,
            message: `Error de punzonamiento en una direccion interna`
        });
    };

    const QsueloUltimo = { formula: `1.5 * ${Qa} Ton/m²`, resultado: 1.5 * Qa }
    const b0Int = { formula: `4*(${CxInt / 100}m  + ${d}cm/100 cm)`, resultado: 4 * ((CxInt / 100) + (d / 100)) }
    const AreaPunzonar = { formula: `${b0Int.resultado} m * ${d / 100}cm`, resultado: b0Int.resultado * (d / 100) }
    const Vu1_2 = { formula: `${QsueloUltimo.resultado} Ton/m² * [ ${LfinalInt.resultado}m * ${BfinalInt.resultado}m - (${CxInt / 100}m + ${d}cm/100cm) * (${CyInt / 100}m + ${d}cm/100cm)]`, resultado: QsueloUltimo.resultado * (LfinalInt.resultado * BfinalInt.resultado - ((CxInt / 100) + (d / 100)) * ((CyInt / 100) + (d / 100))) }
    const Vc = { formula: `(1.1 * 0.75 * √(${Fc} Kgf/cm²) * ${b0Int}*100 * ${d}cm) * (1Ton/1000 Kgf)`, resultado: (1.1 * 0.75 * Math.sqrt(Fc) * (b0Int.resultado * 100) * d) * (1 / 1000) }
    if (Vc.resultado < Vu1_2.resultado) {
        return res.status(200).json({
            error: true,
            message: `Error de punzonamiento en una direccion interna`
        });
    };
    // Cortante
    const Vu2 = { formula: `${QsueloUltimo.resultado} Ton/m² * ${LfinalInt.resultado} * ((${BfinalInt.resultado}/2) - (${CyInt / 100}/2) - ${d / 100})`, resultado: QsueloUltimo.resultado * LfinalInt.resultado * ((BfinalInt.resultado / 2) - ((CyInt / 100) / 2) - (d / 100)) }
    const Vc2 = { formula: `(0.53 * 0.75 * √(${Fc} Kgf/cm²) * (${LfinalInt.resultado}* 100) * ${d}cm) * (1Ton/1000 Kgf)`, resultado: (0.53 * 0.75 * Math.sqrt(Fc) * (LfinalInt.resultado * 100) * d) * (1 / 1000) }
    if (Vc2.resultado < Vu2.resultado) {
        return res.status(200).json({
            error: true,
            message: 'Error de CORTANTE Interna'
        });
    }
    // punzamiento externo.
    const bo_Ext = { formula: `(Cy + d) + 2*(Cx + d)`, reemplazo: `(${CyExt / 100}m + ${d}cm/100 cm) + 2*(${CxExt / 100}m + ${d}/100 cm)`, resultado: ((CyExt / 100) + (d / 100)) + 2 * ((CxExt / 100) + (d / 100)) }
    // presion ultima
    const Qvt = { formula: 'PuExt/(AreaZapataExt)', reemplazo: `${PuExt} Ton / ${AreaZapataExt.resultado} m²`, resultado: PuExt / AreaZapataExt.resultado }
    const VuExt = { formul: 'Pu - presionUltima * (Cx + d) * (Cy + d)', reemplazo: `${PuExt}Ton - ${Qvt.resultado}Ton/m² * (${CxExt / 100}m + (${d}cm/2)/100cm) * (${CyExt / 100}m + ${d}cm/100cm)`, resultado: PuExt - Qvt.resultado * ((CxExt / 100) + ((d / 100) / 2)) * ((CyExt / 100) + (d / 100)) }
    const BcExt = Math.max(B_Ext.resultado, L_Ext) / Math.min(B_Ext.resultado, L_Ext);
    const Validate5 = validacionPunzonamiento(VuExt.resultado, 1, 0.75, Fc, 1, (bo_Ext.resultado * 100), d);
    const Validate6 = validacionPunzonamiento(VuExt.resultado, 0.27, 0.75, Fc, (2 + (4 / BcExt)), (bo_Ext.resultado * 100), d);
    const Validate7 = validacionPunzonamiento(VuExt.resultado, 0.27, 0.75, Fc, (2 + ((40 * d) / (bo_Ext.resultado * 100))), (bo_Ext.resultado * 100), d);
    if (!Validate5 || !Validate6 || !Validate7) {
        return res.status(200).json({
            error: true,
            message: `Error de punzonamiento: alguna de las validaciones no se cumple. falla por punzonamiento para la columna externa.`
        });
    };
    // cortante en una direccion externa
    const sombreado = (BfinalExt.resultado / 2) - ((CyExt / 100) / 2) - (d / 100);
    const Vu_Ext = { formula: `${QsueloUltimo.resultado} Ton/m² * ${BfinalExt.resultado} * ${sombreado}`, resultado: QsueloUltimo.resultado * BfinalExt.resultado * sombreado };
    const validate8 = { formula: 'Vu/(0.53 * 0.75 * √(Fc) * B)', reemplazo: `${Vu_Ext.resultado}/(0.53 * Φ *)`, resultado: ((Vu_Ext.resultado) * 1000) / (0.53 * 0.75 * Math.sqrt(Fc) * (BfinalExt.resultado * 100)) }
    if (d < validate8) {
        return res.status(200).json({
            error: true,
            message: `Error de punzonamiento en una direccion interna`
        });
    };
    // punzamiento externo.
    const Vu1_Ext = { formula: `${QsueloUltimo.resultado} Ton/m² * [ ${LfinalExt.resultado}m * ${BfinalExt.resultado}m - (${CxExt / 100}m + ${d}cm/100cm) * (${CyExt / 100}m + (${d}cm/2)/100cm)]`, resultado: QsueloUltimo.resultado * (LfinalExt.resultado * BfinalExt.resultado - ((CxExt / 100) + (d / 100)) * ((CyExt / 100) + ((d / 100) / 2))) }
    const Vc_Ext = { formula: `(1.1 * 0.75 * √(${Fc} Kgf/cm²) * ${bo_Ext.resultado * 100} * ${d}cm) * (1Ton/1000 Kgf)`, resultado: (1.1 * 0.75 * Math.sqrt(Fc) * (bo_Ext.resultado * 100) * d) * (1 / 1000) }
    if (Vc_Ext.resultado < Vu1_Ext.resultado) {
        return res.status(200).json({
            error: true,
            message: `Error de punzonamiento en una direccion Externa`
        });
    };
    // Cortante
    const Vu2_Ext = { formula: `${QsueloUltimo.resultado} Ton/m² * ${LfinalExt.resultado} * (${LfinalExt.resultado} - (${CxExt / 100}/2) - ${d / 100})`, resultado: QsueloUltimo.resultado * LfinalExt.resultado * (LfinalExt.resultado - ((CxExt / 100) / 2) - (d / 100)) }
    const Vc2_Ext = { formula: `(0.53 * 0.75 * √(${Fc} Kgf/cm²) * (${LfinalExt.resultado} * 100) * ${d}cm) * (1Ton/1000 Kgf)`, resultado: (0.53 * 0.75 * Math.sqrt(Fc) * (LfinalExt.resultado * 100) * d) * (1 / 1000) }
    if (Vc2_Ext.resultado < Vu2_Ext.resultado) {
        return res.status(200).json({
            error: true,
            message: 'Error de CORTANTE Externa'
        });
    }

    // chequeo de viga.
    const b_Ext = { formlua: '(P3*1000)/0.53 * Φ * √(Fc) * d', resultado: (arrayDataEjeY[2] * 1000) / (0.53 * 0.75 * Math.sqrt(Fc) * d) };
    if (b_Ext.resultado > Av) {
        return res.status(200).json({
            error: true,
            message: 'Error de corte en viga amarre, b es mayor que el ancho de viga (Av)'
        });
    }

    // Acero Armadura sobre la Vg externa.
    let response1 = calculoAceroDobleInterno(Fc, Fy, Av, (Hz / 100), momentEjeY, (Av / 100), ((Hv / 100) - 0.09));
    // const response5 = calculateAcero(response1, Av, (Hz / 100), listaAreaAcero, Hv);
    // const graficaMomento = { y: [0, ...response1.MuAbsEXp], x: [0, E, Xa, Lz, L] };

    // Acero por cortante en viga.
    // capitulo C.11.4
    const Vc_acero = { formula: '0.17 * √(Fc) * Av * (Hv - 9)/100', reemplazo: `0.17 * √(${Fc} Kgf/cm²) * ${Av}cm * (${Hv}cm - 9cm)/100`, resultado: 0.17 * Math.sqrt(Fc * 0.098) * Av * (Hv - 9) / 100 };
    const delta_Vc = { formula: '0.75 * Vc_acero', resultado: 0.75 * Vc_acero.resultado, reemplazo: `0.75 * ${Vc_acero.resultado} Ton` };
    let Fs1 = {};
    let Fs2 = {};
    let Fs3 = {};
    let Hierro = '';
    let S = {};
    let Vs = {};
    const SMax = { formula: '(Hv - 9)/2', reemplazo: `(${Hv}cm - 9cm)/2`, resultado: (Hv - 9) / 2 };
    const AvMini = { formula: 'ramas * Nbarras', resultado: ramas * Nbarras.data };
    let espaciamiento;
    if (arrayDataEjeY[2] <= delta_Vc.resultado) {
        Fs1 = (0.062 * (Av * 10) * ((Math.sqrt(Fc * 0.098) / (Fy * 0.098))));
        Fs2 = { formula: 'AvMini / Fs1', resultado: AvMini.resultado / Fs1, reemplazo: `${AvMini.resultado}cm / ${Fs1}cm` };
        espaciamiento = Math.min(SMax.resultado, (Fs2.resultado / 10));
        // impresion de acero a utilizar - separación mínima entre barras

    } else {
        Vs = { formula: '(P3/0.75) - 15.89', resultado: (arrayDataEjeY[2] / (0.75)) - 15.89 };
        Fs3 = { formula: 'Vs', resultado: Vs.resultado };
        S = { formula: '(Avmini  * Fy * (Hv - 9))/(Fs3 * 9810)', reemplazo: `(${AvMini.resultado}mm * ${Fy * 0.098} mpa * ( ${Hv}cm - 9cm))/( ${Fs3.resultado} Ton * 9810 cm/s²)`, resultado: (AvMini.resultado * (Fy * 0.098) * (Hv - 9)) / (Fs3.resultado * 9810) };
        espaciamiento = Math.min(SMax.resultado, (Fs3.resultado / 10));
    }
    console.log(SMax.resultado, Fs2.resultado);
    Hierro = `Max E${Nbarras.item}@${espaciamiento.toFixed(2)}`;
    // acero de zapata interior
    const MuInt = Mu(QsueloUltimo.resultado, LfinalInt.resultado, BfinalInt.resultado, CyInt);
    const MuExt = Mu(QsueloUltimo.resultado, LfinalExt.resultado, BfinalExt.resultado, CyExt);

    // sacamos la P o sea cuantia de cada Mu usando la funcion de acero
    const PInt = calculoAceroDobleInternoMoment(Fc, Fy, 0, Hz, MuInt.resultado, LfinalInt.resultado, ((Hz - 9) / 100));
    const PExt = calculoAceroDobleInternoMoment(Fc, Fy, 0, Hz, MuExt.resultado, LfinalExt.resultado, ((Hz - 9) / 100));

    const AsInt = As(PInt.P[0], (BfinalInt.resultado * 100), Hz - 9, zapataInt, null);
    const AsParrillaDobleInterna = As(0.0018, (BfinalInt.resultado * 100), Hz - 9, {area: 1.29, Nomen: 1/2}, null);
    if (AsInt.Arroba2 < 10 || AsInt.Arroba2 > 35) {
        return res.status(200).json({
            error: true,
            message: `Error: No cumple con los requisistos de espacio entre barras Internas. El espacio entre barras debe estar entre 10 y 35 cm. separación entre barras es de: ${AsInt.Arroba2.toFixed(2)} Cm.`,
        });
    }
    const AsExtLarga = As(PExt.P[0], (LfinalExt.resultado * 100), Hz - 9, zapataExtLarga, BfinalExt.resultado * 100);
    const AsExtCorta = As(0.0033, ((BfinalExt.resultado * 100)), Hv, zapataExtCorta, LfinalExt.resultado * 100);
    const AsParrillaDobleExterna = As(0.0018, ((LfinalExt.resultado * 100)), Hv, {area: 1.29, Nomen: 1/2}, LfinalExt.resultado * 100);
    if (AsExtLarga.Arroba2 <= 9 || AsExtLarga.Arroba2 > 35) {
        return res.status(200).json({
            error: true,
            message: `Error: No cumple con los requisistos de espacio entre barras Externas larga. El espacio entre barras debe estar entre 9 y 35 cm. separación entre barras es de: ${AsExtLarga.Arroba2.toFixed(2)} Cm.`,
        });
    }
    if (AsExtCorta.Arroba2 <= 8.99 || AsExtCorta.Arroba2 > 35) {
        return res.status(200).json({
            error: true,
            message: `Error: No cumple con los requisistos de espacio entre barras Externas corta. El espacio entre barras debe estar entre 9 y 35 cm. separación entre barras es de: ${AsExtCorta.Arroba2.toFixed(2)} Cm.`,
        });
    }

    const PMaxVig = Math.max(response1.P[1], response1.P[2], response1.P[3]);
    const AsViga = As(PMaxVig, Hv, Av, vgNroBarra, Av);
    if (AsViga.Arroba2 < 4.5) {
        return res.status(200).json({
            error: true,
            message: `Error: No cumple espaciamiento minimo de separacion entre barras de la viga. es de: ${AsViga.Arroba2.toFixed(2)} Cm.`,
        });
    }
    res.status(200).json({
        presionInt,
        presionExt,
        R_value,
        X_value,
        PservicioExt,
        PservicioInt,
        AreaZapataExt,
        AreaZapataInt,
        B_Int,
        L_Int,
        B_Ext,
        L_Ext,
        Dis,
        Lz2,
        Re_Servicio,
        Ri_Servicio,
        Ae,
        BfinalExt,
        LfinalExt,
        Ai,
        BfinalInt,
        LfinalInt,
        Re_UltimoExt,
        Ri_UltimoInt,
        We,
        Wi,
        arrayDataEjeY,
        arrayDataEjeX,
        momentEjeY,
        QultimoInt,
        Vu,
        b0,
        Vu1,
        QsueloUltimo,
        b0Int,
        AreaPunzonar,
        Vu1_2,
        Vc,
        Vu2,
        Vc2,
        bo_Ext,
        Qvt,
        VuExt,
        BcExt,
        sombreado,
        Vu_Ext,
        validate8,
        Vu1_Ext,
        Vc_Ext,
        Vu2_Ext,
        Vc2_Ext,
        b_Ext,
        response1,
        Vc_acero,
        delta_Vc,
        Fs1,
        Fs2,
        Fs3,
        Vs,
        S,
        AvMini,
        SMax,
        espaciamiento,
        Hierro,
        MuInt,
        MuExt,
        PInt,
        PExt,
        AsInt,
        AsExtLarga,
        AsExtCorta,
        AsParrillaDobleInterna,
        AsParrillaDobleExterna,
        PMaxVig,
        AsViga,
        // response5,
        message: 'Servicio de zapata excentrica viga amarre funcionando correctamente',
    });
}

module.exports = {
    zapata_excentrica_viga_amarre_servicio
}

const calculateAcero = (response, Bo, Hz, listaAreaAcero, L) => {
    let As = [];
    let separacionA = [];

    for (let i = 0; i < response.P.length; i++) {
        const pValue = response.P[i] * Bo * 100 * (Hz * 100 - 0.09 * 100);
        As.push(`P${i + 1}`, pValue);

        // Buscar en la lista de aceros (cambiar <= por <)
        for (let j = 0; j < listaAreaAcero.length; j++) {
            const area = listaAreaAcero[j].area;
            const Az = listaAreaAcero[j].Az;
            const AsValue = Math.ceil(pValue / area);
            const AsKey = L * 100 - 7.5 * 2;
            const separacion = AsKey / (AsValue - 1);

            // Si cumple las condiciones, añadir y salir
            if (separacion > 10 && AsValue < 30) {
                separacionA.push({ separacion, Az });
                break;
            }
        }
    }
    return { As, separacionA };
}

const calculoAceroDobleInterno = (Fc, Fy, B, Hz, Mu, Lz, Hv) => {
    // Calcular acumulados de momentos con 5 decimales
    const roundTo5 = (val) => Math.round(val * 100000) / 100000;

    const P1 = roundTo5(Mu[0]);
    const P2 = roundTo5(Mu[0] + Mu[1]);
    const P3 = roundTo5(Mu[0] + Mu[1] + Mu[2]);
    const P4 = roundTo5(Mu[0] + Mu[1] + Mu[2] + Mu[3]);
    const P5 = roundTo5(Mu[0] + Mu[1] + Mu[2] + Mu[3] + Mu[4]);

    const MuAbsEXp = [P1, P2, P3, P4, P5];
    const MuAbs = MuAbsEXp.map((m) => Math.abs(m));

    // Calcular acero para cada momento
    const response = [];

    for (let i = 0; i < MuAbs.length; i++) {
        const d = roundTo5(Hz - 0.09);
        const A = roundTo5((((Fc * 0.098) / (2 * 0.59 * (Fy * 0.098))) ** 2));
        // lz Lfinal Interna y Hv sera d que hay que exponerlo en metros
        const Ab = roundTo5((((MuAbs[i] * 0.0098) * (Fc * 0.098)) / (Lz * Hv ** 2 * 0.9 * 0.59 * ((Fy * 0.098) ** 2))));
        const raiz = roundTo5(Math.abs(A - Ab));
        const asi = roundTo5((Fc * 0.098 / (2 * estable * (Fy * 0.098))));
        let As = roundTo5(asi - Math.sqrt(raiz));

        if (As < 0.0033) As = 0.0033;
        response.push(As);
    }

    return { P: response, MuAbs, MuAbsEXp };
};
const calculoAceroDobleInternoMoment = (Fc, Fy, B, Hz, Mu, Lz, Hv) => {
    // Calcular acumulados de momentos con 5 decimales
    const roundTo5 = (val) => Math.round(val * 100000) / 100000;

    const P1 = roundTo5(Mu);

    const MuAbsEXp = [P1];
    const MuAbs = MuAbsEXp.map((m) => Math.abs(m));

    // Calcular acero para cada momento
    const response = [];

    for (let i = 0; i < MuAbs.length; i++) {
        const d = roundTo5(Hz - 0.09);
        const A = roundTo5((((Fc * 0.098) / (2 * 0.59 * (Fy * 0.098))) ** 2));
        // lz Lfinal Interna y Hv sera d que hay que exponerlo en metros
        const Ab = roundTo5((((MuAbs[i] * 0.0098) * (Fc * 0.098)) / (Lz * Hv ** 2 * 0.9 * 0.59 * ((Fy * 0.098) ** 2))));
        const raiz = roundTo5(Math.abs(A - Ab));
        const asi = roundTo5((Fc * 0.098 / (2 * estable * (Fy * 0.098))));
        let As = roundTo5(asi - Math.sqrt(raiz));
        if (As < 0.0033) As = 0.0033;
        response.push(As);
    }

    return { P: response, MuAbs, MuAbsEXp };
};
