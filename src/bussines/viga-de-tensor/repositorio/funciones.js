/**
 * Catálogo Antioquia (legacy): id 1…124 y Aa 1 / 1.15.
 * Catálogo nacional sísmico: ver `datos-sismicos-municipios.js` (Aa, Av, Zas, Ae, Ad por código DANE).
 */

const {
  ciudades,
  MUNICIPIOS_SISMICOS,
  obtenerPorCodMunicipio,
  obtenerPorId: obtenerMunicipioSismicoPorId,
  listarMunicipiosSismicos,
  normalizarCodMunicipio,
} = require("./datos-sismicos-municipios");

/** Zona Aa = 1 (área metropolitana y cercanías según tabla) */
const ZONA_AA_1 = [
  "Medellín",
  "Sabaneta",
  "Envigado",
  "Itagüí",
  "Bello",
  "Caldas",
  "La Estrella",
  "Girardota",
  "Copacabana",
  "Barbosa",
];

/** Resto de municipios con Aa = 1.15 */
const ZONA_AA_115 = [
  "Retiro",
  "Rionegro",
  "Marinilla",
  "La Ceja",
  "Carmen de Viboral",
  "Guarne",
  "San Vicente",
  "La Unión",
  "El Santuario",
  "San Jerónimo",
  "Santa fe de Antioquia",
  "Sopetran",
  "Ciudad Bolivar",
  "Jardin",
  "Andes",
  "Jerico",
  "Urrao",
  "Santa Rosa de Osos",
  "Entrerrios",
  "San Pedro de los Milagros",
  "Yarumal",
  "Puerto Triunfo",
  "Doradal",
  "San Francisco",
  "Cocorná",
  "San Luis",
  "Gomez Plata",
  "Guadalupe",
  "Carolina del Principe",
  "Cisneros",
  "Santo Domingo",
  "Maceo",
  "Yolombo",
  "Yalí",
  "Vegachi",
  "Remedios",
  "Segovia",
  "Amalfi",
  "Anori",
  "Campamento",
  "Angostura",
  "Ituango",
  "Briceño",
  "Valdivia",
  "Taraza",
  "Caceres",
  "Caucasia",
  "El Bagre",
  "Nechí",
  "Zaragoza",
  "Puerto Berrio",
  "Puerto Nare",
  "Caracolí",
  "Fredonia",
  "Amaga",
  "Angelopolis",
  "Titiribí",
  "Venecia",
  "Támesis",
  "Valparaiso",
  "Caramanta",
  "Santa Bárbara",
  "Montebello",
  "Abejorral",
  "Sonsón",
  "Argelia",
  "Nariño",
  "San Roque",
  "San Rafael",
  "San Carlos",
  "Granada",
  "Guatapé",
  "El Peñol",
  "Alejandría",
  "Concepción",
  "Don Matias",
  "Belmira",
  "Liborina",
  "Olaya",
  "Sabanalarga",
  "Peque",
  "San José de la Montaña",
  "Toledo",
  "San Andres de Cuerquia",
  "Ebéjico",
  "Anzá",
  "Armenia",
  "Betulia",
  "Heliconia",
  "Concordia",
  "Salgar",
  "Betania",
  "Hispania",
  "Caicedo",
  "Frontino",
  "Uramita",
  "Abriaquí",
  "Giraldo",
  "Cañasgordas",
  "Dabeiba",
  "Mutatá",
  "Chigorodó",
  "Carepa",
  "Apartadó",
  "Turbo",
  "Necoclí",
  "San Juan de Urabá",
  "Arboletes",
  "San Pedro de Urabá",
  "Murindó",
  "Vigía del Fuerte",
  "Buriticá",
  "Tarso",
  "Pueblo Rico",
];

const construirCatalogo = () => {
  const filas = [];
  let id = 1;
  for (const nombre of ZONA_AA_1) {
    filas.push({ id: id++, nombre, aa: 1 });
  }
  for (const nombre of ZONA_AA_115) {
    filas.push({ id: id++, nombre, aa: 1.15 });
  }
  return filas;
};

/** @type {ReadonlyArray<{ id: number; nombre: string; aa: number }>} */
const CIUDADES_AA = Object.freeze(construirCatalogo());

const mapaPorId = new Map(CIUDADES_AA.map((c) => [c.id, c]));

/**
 * @param {unknown} idCiudad - id enviado desde el front (NumberCiudad)
 * @returns {{ id: number; nombre: string; aa: number } | null}
 */
function obtenerCiudadPorId(idCiudad) {
  const id = Number(idCiudad);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return mapaPorId.get(id) ?? null;
}

/**
 * @param {unknown} idCiudad
 * @returns {number | null}
 */
function obtenerAaPorId(idCiudad) {
  const c = obtenerCiudadPorId(idCiudad);
  return c ? c.aa : null;
}

/** Lista para poblar select en el front (id + nombre + aa) */
function listarCiudadesAa() {
  return [...CIUDADES_AA];
}

module.exports = {
  // Legacy Antioquia (NumberCiudad = id 1…124)
  CIUDADES_AA,
  obtenerCiudadPorId,
  obtenerAaPorId,
  listarCiudadesAa,
  // Nacional / NSR (objeto completo por municipio)
  ciudades,
  MUNICIPIOS_SISMICOS,
  obtenerPorCodMunicipio,
  obtenerMunicipioSismicoPorId,
  listarMunicipiosSismicos,
  normalizarCodMunicipio,
};
