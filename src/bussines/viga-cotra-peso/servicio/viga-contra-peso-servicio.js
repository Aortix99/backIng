const Viga_de_contra_peso = (req, res) => {
  const {
    N_ramas,
    Pu1,
    Pu2,
    Qa,
    Luz_Viga,
    Anc_Viga,
    Alt_Viga,
    Fc,
    Fy,
    Acero_Vg,
    Acero_Estrivo,
  } = req.body.model;

  const pedestal = 0.15;

  const AlfaSuelo = {
    formula: `(Pu1 Ton / Qa Ton/m²)`,
    reemplazo: `(${Pu1} Ton / ${Qa} Ton/m²)`,
    resultado: { x: Pu1 / Qa, y: "m²" },
  };
  const L = {
    formula: `√(AlfaSuelo m² * 2)`,
    reemplazo: `√(${AlfaSuelo.resultado.x} m² * 2)`,
    resultado: { x: Math.sqrt(AlfaSuelo.resultado.x * 2), y: "m" },
  };

  const B = {
    formula: `L/2`,
    reemplazo: `(${L.resultado.x} m / 2)`,
    resultado: { x: L.resultado.x / 2, y: "m" },
  };

  const RexT = {
    formula: `(Pu1 Ton * L m) / (Luz_Viga m - 0.15 m)`,
    reemplazo: `(${Pu1} Ton * ${L.resultado.x} m) / (${Luz_Viga} m - ${pedestal} m)`,
    resultado: { x: (Pu1 * L.resultado.x) / (Luz_Viga - pedestal), y: "Ton/m" },
  };

  const WExt = {
    formula: `(RexT Ton/m / B m)`,
    reemplazo: `(${RexT.resultado.x} Ton/m / ${B.resultado.x} m)`,
    resultado: { x: RexT.resultado.x / B.resultado.x, y: "Ton" },
  };

  const Rint = {
    formula: `(Pu1 Ton + Pu2 Ton - RexT Ton)`,
    reemplazo: `(${Pu1} Ton + ${Pu2} Ton - ${RexT.resultado.x} Ton)`,
    resultado: { x: Pu1 + Pu2 - RexT.resultado.x, y: "Ton" },
  };

  const C1 = {
    formula: `WExt Ton * 0.15 m`,
    reemplazo: `(${WExt.resultado.x} Ton * ${pedestal} m)`,
    resultado: { x: WExt.resultado.x * pedestal, y: "m" },
  };

  const C2 = {
    formula: `C1 - Pu1 Ton`,
    reemplazo: `(${C1.resultado.x} m - ${Pu1} Ton)`,
    resultado: { x: C1.resultado.x - Pu1, y: "m" },
  };

  const C3 = {
    formula: `C2 + ((B m - 0.15 m) * WExt Ton)`,
    reemplazo: `(${C2.resultado.x} m + ((${B.resultado.x} m - ${pedestal} m) * ${WExt.resultado.x} Ton))`,
    resultado: {
      x: C2.resultado.x + (B.resultado.x - pedestal) * WExt.resultado.x,
      y: "m",
    },
  };

  const L1 = {
    formula: `((C2 * -1 ) / WExt Ton)`,
    reemplazo: `((${C2.resultado.x} m * -1) / ${WExt.resultado.x} Ton)`,
    resultado: { x: (C2.resultado.x * -1) / WExt.resultado.x, y: "m" },
  };

  const L2 = {
    formula: `B m - 0.15 m - L1 m`,
    reemplazo: `(${B.resultado.x} m - ${pedestal} m - ${L1.resultado.x} m)`,
    resultado: { x: B.resultado.x - pedestal - L1.resultado.x, y: "m" },
  };

  const A1 = {
    formula: `((C1 * 0.15 m ) / 2)`,
    reemplazo: `((${C1.resultado.x} m * 0.15 m) / 2)`,
    resultado: { x: (C1.resultado.x * pedestal) / 2, y: "m" },
  };

  const A2 = {
    formula: `((C2 * L1 m) / 2)`,
    reemplazo: `((${C2.resultado.x} m * ${L1.resultado.x} m) / 2)`,
    resultado: { x: (C2.resultado.x * L1.resultado.x) / 2, y: "m" },
  };

  const A3 = {
    formula: `((C3 * L2 m) / 2)`,
    reemplazo: `((${C3.resultado.x} m * ${L2.resultado.x} m) / 2)`,
    resultado: { x: (C3.resultado.x * L2.resultado.x) / 2, y: "m" },
  };

  const A4 = {
    formula: `C3 * (Luz_Viga m - B   m)`,
    reemplazo: `(${C3.resultado.x} m * (${Luz_Viga} m - ${B.resultado.x} m))`,
    resultado: { x: C3.resultado.x * (Luz_Viga - B.resultado.x), y: "m" },
  };

  const M1 = {
    formula: `A1`,
    reemplazo: `(${A1.resultado.x} m)`,
    resultado: { x: A1.resultado.x, y: "m" },
  };

  const M2 = {
    formula: `A1+A2`,
    reemplazo: `(${A1.resultado.x} m + ${A2.resultado.x} m)`,
    resultado: { x: A1.resultado.x + A2.resultado.x, y: "m" },
  };

  const M3 = {
    formula: `A1+A2+A3`,
    reemplazo: `(${A1.resultado.x} m + ${A2.resultado.x} m + ${A3.resultado.x} m)`,
    resultado: { x: A1.resultado.x + A2.resultado.x + A3.resultado.x, y: "m" },
  };

  const d = {
    formula: `((C3 * 1000) / (0.17 * 0.75 * 1 * √(Fc MPa) * Anc_Viga m * 10))`,
    reemplazo: `((${C3.resultado.x} m * 1000) / (0.17 * 0.75 * 1 * √(${Fc} MPa) * ${Anc_Viga} m * 10))`,
    resultado: {
      x:
        (C3.resultado.x * 1000) /
        (0.17 * 0.75 * 1 * Math.sqrt(Fc) * Anc_Viga * 10),
      y: "cm",
    },
  };

  const Hmin = {
    formula: `d + 9 cm`,
    reemplazo: `(${d.resultado.x} cm + 9 cm)`,
    resultado: { x: d.resultado.x + 9, y: "cm" },
  };

  if (Alt_Viga < Hmin.resultado.x) {
    return res.status(200).json({
      error: true,
      message:
        "Error: la altura de la viga es menor a la altura minima requerida.",
      details: "Aumentar altura de viga",
      data: {
        Alt_Viga: Alt_Viga,
        Hmin: Hmin.resultado.x,
      },
    });
  }

  const DeltaVC = {
    formula: `(0.75 * (√(Fc MPa)/6) * (Anc_Viga cm / 100 ) * ((Alt_Viga cm - 9 cm)/100) * 100)`,
    reemplazo: `(0.75 * (√(${Fc} MPa)/6) * (${Anc_Viga} cm / 100 ) * ((${Alt_Viga} cm - 9 cm)/100) * 100)`,
    resultado: {
      x:
        0.75 *
        (Math.sqrt(Fc) / 6) *
        (Anc_Viga / 100) *
        ((Alt_Viga - 9) / 100) *
        100,
      y: "tonf",
    },
  };

  const hprima = {
    formula: `((C2 + (C3 * -1)) / (B m - 0.15 m ))`,
    reemplazo: `((${C2.resultado.x} m + (${C3.resultado.x} m * -1)) / (${B.resultado.x} m - 0.15 m ))`,
    resultado: {
      x: (C2.resultado.x + C3.resultado.x * -1) / (B.resultado.x - pedestal),
      y: "tonf",
    },
  };

  const VuBc = {
    formula: `C2 - hprima tonf`,
    reemplazo: `(${C2.resultado.x} m - ${hprima.resultado.x} tonf)`,
    resultado: { x: C2.resultado.x - hprima.resultado.x, y: "tonf" },
  };

  const deltaVs = {
    formula: `VuBc tonf - DeltaVC tonf`,
    reemplazo: `(${VuBc.resultado.x} tonf - ${DeltaVC.resultado.x} tonf)`,
    resultado: { x: VuBc.resultado.x - DeltaVC.resultado.x, y: "tonf" },
  };

  const estribosZC = {
    formula:
      (0.75 * (N_ramas * Acero_Vg.area) * Fy * (Alt_Viga / 100)) / deltaVs,
    reemplazo: `((0.75 * (${N_ramas} * ${Acero_Vg.area} ) * ${Fy} * (${Alt_Viga} / 100)) / ${deltaVs.resultado.x} tonf)`,
    resultado: {
      x:
        (0.75 * (N_ramas * Acero_Vg.area) * Fy * (Alt_Viga / 100)) /
        deltaVs.resultado.x,
      y: "cm",
    },
  };
  let estribosZNC = {};
  if (deltaVs.resultado.x > C3.resultado.x) {
    estribosZNC = {
      formula: `(Alt_Viga - 9) / 2`,
      reemplazo: `(${Alt_Viga} cm - 9 cm) /2`,
      resultado: { x: (Alt_Viga - 9) / 2, y: "cm" },
    };
  } else {
    estribosZNC = estribosZC;
  }

  const cuantia = {
    formula: `((Fc)/(2*0.59*fy))- (√(((Fc/(2*0.59*Fy))²)-(((M2*0.00981)*Fc)/((Anc_Viga/100)*((Alt_Viga-9)/100)*0.9*0.59*Fy²))))`,
    reemplazo: `((${Fc} / (2 * 0.59 * ${Fy})) - (√(((${Fc}  / (2 * 0.59 * ${Fy}))²) - (((${M2.resultado.x} * 0.00981) * ${Fc}) / ((${Anc_Viga} / 100) * ((${Alt_Viga} - 9) / 100) * 0.9 * 0.59 * ${Fy}²)))))`,
    resultado: {
      x:
        Fc / (2 * 0.59 * Fy) -
        Math.sqrt(
          (Fc / (2 * 0.59 * Fy)) ** 2 -
            (M2.resultado.x * 0.00981 * Fc) /
              ((Anc_Viga / 100) *
                ((Alt_Viga - 9) / 100) *
                0.9 *
                0.59 *
                Fy ** 2),
        ),
      y: "",
    },
  };

  const Asup = {
    formula: `(cuantia * Anc_Viga* (Alt_Viga - 9))`,
    reemplazo: `(${cuantia.resultado.x} cm * ${Anc_Viga} cm * (${Alt_Viga} cm - 9 cm))`,
    resultado: { x: cuantia.resultado.x * Anc_Viga * (Alt_Viga - 9), y: "cm²" },
  };

  const Asinf = {
    formula: `(0.003333 * Anc_Viga cm * (Alt_Viga cm - 9 cm))`,
    reemplazo: `(0.003333 * ${Anc_Viga} cm * (${Alt_Viga} cm - 9 cm))`,
    resultado: { x: 0.003333 * Anc_Viga * (Alt_Viga - 9), y: "cm²" },
  };

  const AceroSuperior = {
    formula: `Asup / Acero_Vg.area`,
    reemplazo: `(${Asup.resultado.x} cm² / ${Acero_Vg.area} cm²)`,
    resultado: { x: Asup.resultado.x / Acero_Vg.area, y: "" },
  };

  const AceroInferior = {
    formula: `Asinf / Acero_Vg.area`,
    reemplazo: `(${Asinf.resultado.x} cm² / ${Acero_Vg.area} cm²)`,
    resultado: { x: Asinf.resultado.x / Acero_Vg.area, y: "" },
  };

  return res.status(200).json({
    AlfaSuelo,
    L,
    B,
    RexT,
    WExt,
    Rint,
    C1,
    C2,
    C3,
    L1,
    L2,
    A1,
    A2,
    A3,
    M1,
    M2,
    M3,
    d,
    Hmin,
    DeltaVC,
    hprima,
    VuBc,
    deltaVs,
    estribosZC,
    estribosZNC,
    cuantia,
    Asup,
    Asinf,
    AceroSuperior,
    AceroInferior,
  });
};
