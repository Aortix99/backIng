const redondear = (valor) => {
  if (typeof valor === "number") {
    return Math.round(valor * 100) / 100;
  }
  return valor;
};

const calcularPresionMaxima = (Fc, Cx, Cy) => {
  return {
    formula: `(0.7 * 0.85 * ${Fc} Kgf/cm² * ${Cx}m * ${Cy}m)/1000 Kgf/Ton`,
    resultado: redondear((0.7 * 0.85 * Fc * Cx * Cy) / 1000),
  };
};
const R = (PuExt, PuInt) => {
  return {
    formula: `(${PuExt} Ton + ${PuInt} Ton)`,
    resultado: redondear(PuExt + PuInt),
  };
};
const X = (PuInt, Lz, R) => {
  return {
    formula: `( ${PuInt} Ton * ${Lz} m ) / ${R} Ton`,
    resultado: redondear((PuInt * Lz) / R),
  };
};
const Pservicio = (Pu) => {
  return {
    formula: `(${Pu} Ton)/1.5`,
    resultado: redondear(Pu / 1.5),
  };
};
const Area = (P, Qu) => {
  return {
    formula: `${P} Ton / (${Qu} Ton/m)`,
    resultado: redondear(P / Qu),
  };
};

const ejeY = (Ns, LFinalExt, BFinalExt, CxExt, PuExt) => {
    console.log('==>', Ns, LFinalExt, LFinalExt, CxExt, PuExt);
  const W = Ns * BFinalExt;
  const P1 = W * (CxExt / 2);
  const P2 = P1 - PuExt;
  const P3 = P2 + (W * (LFinalExt - (CxExt / 2)));
  return [P1, P2, P3];
};

const ejeYMomento = (P, L2, L3, CxExt, Lz, LfinalExt) => {
  const A1 = ((CxExt/2) * P[0])/2;
  const A2 = ((L2 * P[1])/2) + A1;
  const A3 = ((L3 * P[2])/2) + A2;
  const A4 = 0;
  return [A1, A2, A3, A4];
};

const validacionPunzonamiento = (Vu, lamda, cons, fc, operacion, B0, d) => {
  const calculo = (Vu * 1000) / (lamda * cons * Math.sqrt(fc) * operacion * B0);
  return d >= calculo;
};

const Mu = (QsueloUltimo, Lfinal, Bfinal, CyInt) => {
  const formula = "QsueloUltimo * Lfinal * [((Bfinal / 2) - (CyInt / 2))^2)/2]";
  const reemplazo = `${QsueloUltimo} Ton/m * ${Lfinal} m * [ ((${Bfinal} m / 2) - (${CyInt / 100} m / 2))^2 ) / 2 ]`;
  const resultado =
    (QsueloUltimo * Lfinal * (Bfinal / 2 - CyInt / 100 / 2) ** 2) / 2;
  return { formula, reemplazo, resultado };
};

const As = (P, Bfinal, L, AreaHierro, B = null) => {
  const As = P * Bfinal * L;
  const acero = Math.ceil(As / AreaHierro.area);
  const LongitudEfectiva = B == null ? Bfinal - 7.5 * 2 : B;
  const Arroba2 = LongitudEfectiva / (acero - 1);
  return {
    As,
    acero,
    LongitudEfectiva,
    Arroba2,
    formula: `@${Arroba2}Φ#${AreaHierro.Nomen}`,
  };
};
const AsVigaFn = (P, Bfinal, L, AreaHierro, B = null) => {
  const As = P * Bfinal * L;
  const acero = Math.ceil(As / AreaHierro.area);
  const LongitudEfectiva = B == null ? Bfinal - 7.5 * 2 : B - 7.5 * 2;
  const Arroba2 = LongitudEfectiva / (acero - 1);
  return {
    As,
    acero,
    LongitudEfectiva,
    Arroba2,
    formula: `@${Arroba2}Φ#${AreaHierro.Nomen}`,
  };
};
module.exports = {
  calcularPresionMaxima,
  R,
  X,
  Pservicio,
  Area,
  ejeY,
  ejeYMomento,
  validacionPunzonamiento,
  Mu,
  As,
  AsVigaFn,
};
