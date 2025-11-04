const { checkN1, grafiConstante, graficaNormal } = require('../repository/checkeo.js');

const calculateZapata = async (req, res) => {
    const { model } = req.body;
    console.log('=====', model);
    try {
        let response;
        let longitudFinal;
        let Pvs = [];
        // Factores de carga
        const factorCargaMuerta = 1.2;
        const factorCargaViva = 1.6;
        let D1 = (model.columnas[0].ancho / 2) / 100;
        // Variables acumulativas
        let sumaPesosFactorizados = 0;
        let sumaCargasDirectas = 0;

        // Datos de entrada - columnas
        const columnas = model.columnas;
        // const columnas = [
        //     { ancho: 25, longitud: 30, pd: 22, pl: 12 },
        //     { ancho: 35, longitud: 35, pd: 40, pl: 20  }
        // ];

        // Longitud entre las columnas
        const longitudEntreColumnas = model.longitud;
        // const longitudEntreColumnas = 4.8;

        // Capacidad admisible del suelo
        const capacidadAdmisibleSuelo = model.suelo;
        // const capacidadAdmisibleSuelo = 9;

        // Procesamiento de cada columna
        for (let i = 0; i < columnas.length; i++) {
            const pesoFactorizado = columnas[i].pd * factorCargaMuerta + columnas[i].pl * factorCargaViva;
            Pvs.push(pesoFactorizado);
            sumaPesosFactorizados += pesoFactorizado;
            
            const longitudPreliminar = i * ((pesoFactorizado * longitudEntreColumnas) / sumaPesosFactorizados);
            longitudFinal = (D1 + longitudPreliminar) * 2;

            const cargaDirectaColumna = columnas[i].pd + columnas[i].pl;
            sumaCargasDirectas += cargaDirectaColumna;
            const areaRequeridaZapata = sumaCargasDirectas / capacidadAdmisibleSuelo;
            resultadoFinal = areaRequeridaZapata / longitudFinal;
            const redondearFinal = redondearA05(resultadoFinal);
            const longitudSinRedondear = Math.floor(longitudFinal * 100) / 100;
            response = `L ${longitudSinRedondear}, B ${redondearFinal}`;
            const validate = checkN1(pesoFactorizado, model.fc, columnas[i].ancho, columnas[i].longitud);
            if (!validate) {
                return res.status(200).json({
                    error: true,
                    message: 'Error: los parametros del pedestal no cumplen.',
                    details: `Error en la columna ${i + 1}`
                });
            }
        }
        const responseGrafica = grafiConstante(sumaPesosFactorizados, longitudFinal, D1, model.longitud, Pvs[0], Pvs[1]);
        const GraficaNormal = graficaNormal(responseGrafica);
        function redondearA05(valor) {
            let resultado = Math.ceil(valor * 20) / 20;
            return resultado.toFixed(2);
        }
        res.status(200).json({ response, responseGrafica, GraficaNormal });
    } catch (error) {
        console.error('Error al calcular zapata:', error);
        res.status(500).json({ message: 'No se pudo calcular la zapata' });
    }
};

module.exports = { calculateZapata };
