/**
 * Lee ciudades.tsv (tabulador, decimales con coma) y genera datos-sismicos-municipios.js
 * Ejecutar desde esta carpeta: node build-ciudades-data.cjs
 */
const fs = require("fs");
const path = require("path");

const TSV_PATH = path.join(__dirname, "ciudades.tsv");
const OUT_PATH = path.join(__dirname, "datos-sismicos-municipios.js");

function parseNum(s) {
  if (s === undefined || s === null) return NaN;
  const t = String(s).trim().replace(/\./g, "").replace(",", ".");
  return parseFloat(t);
}

/**
 * @param {string} line
 * @returns {string[] | null}
 */
function splitLine(line) {
  let p = line.split("\t").map((x) => x.trim());
  if (p.length === 0 || (p.length === 1 && p[0] === "")) return null;

  // Caso erróneo: Cauca | Villa Rica | Rica | 19845 | ... (columna "Rica" de más)
  if (
    p.length === 9 &&
    /^\d+$/.test(p[3]) &&
    p[1] === "Villa Rica" &&
    p[2] === "Rica"
  ) {
    p = [p[0], p[1], p[3], p[4], p[5], p[6], p[7], p[8]];
  }

  if (p.length === 7) {
    // Falta Ad (ej. fila incompleta)
    p.push("0,08");
  }

  if (p.length !== 8) {
    return null;
  }

  return p;
}

function main() {
  const raw = fs.readFileSync(TSV_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");

  const ciudades = [];
  for (let i = 0; i < lines.length; i++) {
    const p = splitLine(lines[i]);
    if (!p) {
      console.warn(`Línea ${i + 1} omitida o inválida:`, lines[i]);
      continue;
    }
    const [dep, mun, codStr, aa, av, zas, ae, ad] = p;
    const cod = Number(codStr);
    if (!Number.isFinite(cod)) {
      console.warn(`Código no numérico línea ${i + 1}:`, codStr);
      continue;
    }
    ciudades.push({
      Departamento: dep,
      Municipio: mun,
      "Cod Municipio": cod,
      Aa: parseNum(aa),
      Av: parseNum(av),
      ZAS: zas,
      Ae: parseNum(ae),
      Ad: parseNum(ad),
    });
  }

  const MUNICIPIOS_SISMICOS = ciudades.map((row, idx) => ({
    id: idx + 1,
    departamento: String(row.Departamento),
    municipio: String(row.Municipio),
    codMunicipio: row["Cod Municipio"],
    aa: row.Aa,
    av: row.Av,
    zas: row.ZAS,
    ae: row.Ae,
    ad: row.Ad,
  }));

  const ciudadesJson = JSON.stringify(ciudades, null, 2);
  const municipiosJson = JSON.stringify(MUNICIPIOS_SISMICOS, null, 2);

  const out = `/**
 * Catálogo sísmico en memoria (sin BD).
 * Formato legible: \`ciudades\` (claves como en la tabla NSR).
 * Uso interno: \`MUNICIPIOS_SISMICOS\` (minúsculas, compatible con servicio).
 * Generado por build-ciudades-data.cjs — no editar a mano el array grande.
 */

const ciudades = Object.freeze(${ciudadesJson});

const MUNICIPIOS_SISMICOS = Object.freeze(${municipiosJson});

const mapaPorCod = new Map(
  MUNICIPIOS_SISMICOS.map((m) => [m.codMunicipio, m]),
);
const mapaPorId = new Map(MUNICIPIOS_SISMICOS.map((m) => [m.id, m]));

function normalizarCodMunicipio(cod) {
  if (cod === null || cod === undefined || cod === "") {
    return null;
  }
  if (typeof cod === "object") {
    return null;
  }
  const n = Number(String(cod).trim());
  return Number.isFinite(n) ? n : null;
}

function obtenerPorCodMunicipio(codMunicipio) {
  const cod = normalizarCodMunicipio(codMunicipio);
  if (cod === null) {
    return null;
  }
  return mapaPorCod.get(cod) ?? null;
}

function obtenerPorId(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) {
    return null;
  }
  return mapaPorId.get(n) ?? null;
}

function listarMunicipiosSismicos() {
  return [...MUNICIPIOS_SISMICOS];
}

module.exports = {
  ciudades,
  MUNICIPIOS_SISMICOS,
  obtenerPorCodMunicipio,
  obtenerPorId,
  listarMunicipiosSismicos,
  normalizarCodMunicipio,
};
`;

  fs.writeFileSync(OUT_PATH, out, "utf8");
  console.log(
    `Generado ${OUT_PATH} con ${ciudades.length} municipios (${MUNICIPIOS_SISMICOS.length} filas).`,
  );
}

main();
