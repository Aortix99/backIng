const n1 = 0.85;
const n2 = 0.65;

const checkN1 = (Tt, Fc, A, L) => {
  console.log('parametros', Tt, Fc, A, L);
  const conversion = Fc / 100;
  const calculo = n1 * n2 * conversion * A * L;
  const validate = Tt <= calculo;
  console.log('validate', calculo, Tt);
  return validate;
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
  console.log('grafica', R, L, D1, D2, PveX, PvIn);
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

const graficaNormal = () => {
  
  return;
}

module.exports = {
  checkN1,
  grafiConstante,
  graficaNormal
};
