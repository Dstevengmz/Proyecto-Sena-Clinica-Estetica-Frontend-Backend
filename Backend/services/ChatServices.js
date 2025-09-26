const { Op } = require("sequelize");
const { procedimientos,categoriaprocedimientos } = require("../models");

class ChatServices {
  PALABRAS_VACIAS = new Set([
    "de",
    "la",
    "que",
    "el",
    "en",
    "y",
    "a",
    "los",
    "del",
    "se",
    "las",
    "por",
    "un",
    "para",
    "con",
    "no",
    "una",
    "su",
    "al",
    "lo",
    "como",
    "mas",
    "más",
    "pero",
    "sus",
    "le",
    "ya",
    "o",
    "este",
    "esta",
    "sin",
    "sobre",
    "me",
    "hay",
    "donde",
    "cuando",
    "muy",
    "entre",
    "todo",
    "todos",
    "ni",
    "contra",
    "otros",
    "otra",
    "otras",
    "otro",
    "esto",
    "eso",
    "ese",
  ]);

  async normalizar(texto = "") {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  async extraerPalabrasClaveBasico(texto = "") {
    const limpio = await this.normalizar(texto);  
    return limpio
      .split(/[^a-záéíóúñü]+/i)
      .filter((w) => w && w.length > 2 && !this.PALABRAS_VACIAS.has(w)) 
      .slice(0, 8);
  }

  async buscarProcedimientosPorKeywords(palabrasClave = [], limite = 10) {
  if (!Array.isArray(palabrasClave) || palabrasClave.length === 0) return [];

  const likeClauses = palabrasClave.map((kw) => ({ [Op.like]: `%${kw}%` }));
  const resultados = await procedimientos.findAll({
    include: [
      {
        model: categoriaprocedimientos,
        as: "categoria",
        attributes: ['nombre', 'descripcion'], 
      }
    ],
    where: {
      [Op.or]: [
        { nombre: { [Op.or]: likeClauses } },
        { descripcion: { [Op.or]: likeClauses } },
      ],
    },
    attributes: [
      "id",
      "nombre",
      "descripcion",
      "imagen",
      "precio",
      "categoriaId",
    ],
    limit: limite,
  });

  return resultados.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    precio: r.precio,
    imagen: r.imagen,
    categoria: r.categoria ? r.categoria.nombre : 'Sin categoría',
  }));
}

async consultarr(mensaje) {
  const palabras = await this.extraerPalabrasClaveBasico(mensaje);  
  if (palabras.length === 0) {
    return {
      ok: true,
      respuesta:
        "No pude identificar palabras clave. Intenta con el nombre del procedimiento o categoría.",
      items: [],
    };
  }

  const items = await this.buscarProcedimientosPorKeywords(palabras, 10); 
  if (items.length === 0) {
    return {
      ok: true,
      respuesta:
        "No encontré coincidencias. ¿Puedes ser más específico o usar otro término?",
      items: [],
    };
  }

  return {
    ok: true,
    respuesta: "Estos procedimientos podras encontrarlos en nuestra clínica:",
    items,
  };
}


}

module.exports = new ChatServices();
