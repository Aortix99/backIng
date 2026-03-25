const {
  obtenerPorCodMunicipio,
  obtenerCiudadPorId,
  CIUDADES_AA,
} = require("../repositorio/funciones");

const redondear = (valor) => {
  if (typeof valor === "number") {
    return Math.round(valor * 100) / 100;
  }
  return valor;
};

const Viga_de_amarre_zapata_aislada = (req, res) => {
  const {
    BarraViga,
    NumberCiudad,
    codMunicipio,
    b,
    h,
    cargaMaxima,
    luzViga,
    fc,
    fy
  } = req.body.model;

  /** Registro con Aa, Av, Zas, Ae, Ad (nacional) o solo Aa legacy Antioquia */
  let registroSismico;
  if (codMunicipio != null && codMunicipio !== "") {
    registroSismico = obtenerPorCodMunicipio(codMunicipio);
    if (!registroSismico) {
      return res.status(400).json({
        error: true,
        message:
          "Código de municipio (DANE) no encontrado. Actualice ciudades.tsv y ejecute node build-ciudades-data.cjs, o verifique el código.",
      });
    }
  } else {
    const ciudadSeleccionada = obtenerCiudadPorId(NumberCiudad);
    if (!ciudadSeleccionada) {
      return res.status(400).json({
        error: true,
        message: `Id de ciudad inválido. Use 1–${CIUDADES_AA.length} o envíe codMunicipio (DANE).`,
      });
    }
    registroSismico = {
      id: ciudadSeleccionada.id,
      departamento: "ANTIOQUIA",
      municipio: ciudadSeleccionada.nombre,
      codMunicipio: null,
      aa: ciudadSeleccionada.aa,
      av: null,
      zas: null,
      ae: null,
      ad: null,
    };
  }

  const Aa = registroSismico.aa;

//Carga Axial Maxima

const axialMaxima = {
  formula: "0.25 * Aa * cargaMaxima env tabla B.2.3",
  reemplazo: `0.25 * ${Aa} * ${cargaMaxima}`,
  resultado: 0.25 * Aa * cargaMaxima,
};

const cargaUltima = {
  formula: "1.5 * axialMaxima",
  reemplazo: `1.5 * ${axialMaxima.resultado}`,
  resultado: 1.5 * axialMaxima.resultado,
};

// resistenia a la compresion

const ag = {
  formula: "b * h",
  reemplazo: `${b} * ${h}`,
  resultado: b * h,
};

const RHO_INICIAL = 0.0033;
const RHO_DELTA = 0.0001;
/** Máximo de pasos: 0.0033 + 470×0.0001 ≈ 0.0503 */
const RHO_MAX_PASOS = 470;

let rho = RHO_INICIAL;
let Acero;
let Acero1;
let acero2;
let acero3;
let Ast;
let PhiPnMaxima;
let PhiPn;
let PhiTu;

let cumplePhiTu = false;

for (let paso = 0; paso < RHO_MAX_PASOS; paso++) {
  Acero = {
    formula: `${rho} * b*100 * h*100`,
    reemplazo: `${rho} * ${b}*100 * ${h}*100`,
    resultado: rho * b * 100 * h * 100,
  };

  Acero1 = (() => {
    const bruto = Acero.resultado / BarraViga;
    const r = redondear(bruto);
    let resultado = r;
    if (resultado < 2) {
      resultado = 2;
    } else if (Math.abs(r - Math.floor(r)) > 1e-9) {
      resultado = Math.ceil(r);
    }
    return {
      formula: "Acero / BarraViga",
      reemplazo: `${redondear(Acero.resultado)} / ${BarraViga} = ${r} → ${resultado}`,
      resultado,
    };
  })();

  acero2 = {
    formula: "Acero1 * BarraViga",
    reemplazo: `${Acero1.resultado} * ${BarraViga}`,
    resultado: Acero1.resultado * BarraViga,
  };

  acero3 = {
    formula: "acero2 * 2",
    reemplazo: `${acero2.resultado} * 2`,
    resultado: acero2.resultado * 2,
  };

  Ast = {
    formula: "acero3 / 10000",
    reemplazo: `${acero3.resultado} / 10000`,
    resultado: acero3.resultado / 10000,
  };

  PhiPnMaxima = {
    formula: "0.75 * phi *[0.85 * fc * (ag - Ast) + fy * Ast]",
    reemplazo: `0.75 * 0.75 *[0.85 * ${fc} * (${ag.resultado} - ${Ast.resultado}) + ${fy} * ${Ast.resultado}]`,
    resultado:
      0.75 *
      0.75 *
      (0.85 * fc * (ag.resultado - Ast.resultado) + fy * Ast.resultado),
  };

  PhiPn = {
    formula: "PhiPnMaxima * 101.97",
    reemplazo: `${PhiPnMaxima.resultado} * 101.97`,
    resultado: PhiPnMaxima.resultado * 101.97,
  };

  if (PhiPn.resultado < cargaUltima.resultado) {
    return res.status(200).json({
      error: true,
      message: "Aumentar seccion de viga.",
    });
  }

  PhiTu = {
    formula: "(0.9 * Ast * fy) / 101.97",
    reemplazo: `(0.9 * ${Ast.resultado} * ${fy}) / 101.97`,
    resultado: (0.9 * Ast.resultado * fy) / 101.97,
  };

  if (PhiTu.resultado < cargaUltima.resultado) {
    cumplePhiTu = true;
    break;
  }

  rho = Math.round((rho + RHO_DELTA) * 10000) / 10000;
}

  const hVal = Number(h);
  const sEst1 = hVal / 2;
  const sEst2 = 0.3;
  const separacionEstribosM = Math.min(sEst1, sEst2);
  const paso12 = {
    formula:
      "NSR-10 C.15.13.4 — separación de estribos (Se ≤ h/2; se compara con 0,30 m)",
    reemplazo: `S₁ = h/2 = ${hVal} / 2 = ${redondear(sEst1)} m; S₂ = 0,30 m; se adopta min(S₁, S₂)`,
    resultado: separacionEstribosM.toFixed(2),
  };


  return res.status(200).json({
    error: false,
    message: "Cálculo completado.",
    registroSismico: {
      departamento: registroSismico.departamento,
      municipio: registroSismico.municipio,
      codMunicipio: registroSismico.codMunicipio,
      aa: registroSismico.aa,
      av: registroSismico.av,
      zas: registroSismico.zas,
      ae: registroSismico.ae,
      ad: registroSismico.ad,
    },
    axialMaxima,
    cargaUltima,
    ag,
    rho,
    Acero,
    Acero1,
    acero2,
    acero3,
    Ast,
    PhiPnMaxima,
    PhiPn,
    PhiTu,
    paso12,
  });
};

module.exports = {
  Viga_de_amarre_zapata_aislada,
};