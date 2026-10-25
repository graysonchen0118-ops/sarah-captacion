import type { Estado } from "./types";

// El orden de trabajo del manual de la agencia. Un paso no empieza si el anterior tiene un bloqueo.
export const PASOS = [
  { id: "alta", nombre: "Alta en Mobilia", corto: "Alta", pestana: "Inmuebles", texto: "Familia, tipo, alias y campaña. Antes de crear, busca si la propiedad ya existe." },
  { id: "propietario", nombre: "Propietario y contactos", corto: "Propietario", pestana: "D. Internos", texto: "Busca el contacto, lo crea si no existe y vincula cotitulares sin fusionar a nadie." },
  { id: "sarah", nombre: "Sarah pide lo que falta", corto: "Sarah", pestana: "Conversaciones", texto: "Datos del bloque General, extras y documentos. Nunca pregunta lo que ya consta." },
  { id: "general", nombre: "Bloque General", corto: "General", pestana: "General", texto: "Lo declarado por el vendedor, con su fuente en cada campo." },
  { id: "internos", nombre: "D. Internos", corto: "D. Internos", pestana: "D. Internos", texto: "Solo con escritura o nota simple: dirección, Catastro, geolocalización, registro y mandato." },
  { id: "documentos", nombre: "Documentos", corto: "Documentos", pestana: "Documentos", texto: "Todo en DOCUMENTACIÓN PROPIEDAD. El DNI, en el perfil del cliente." },
  { id: "multimedia", nombre: "Multimedia", corto: "Fotos", pestana: "Multimedia", texto: "25 fotos o más, el plano y la foto del local siempre la última." },
  { id: "textos", nombre: "Textos y SEO", corto: "Textos", pestana: "General", texto: "Título, descripciones y SEO dentro de los límites de Mobilia, sin número, planta ni puerta." },
  { id: "comentarios", nombre: "Comentarios", corto: "Comentarios", pestana: "Comentarios", texto: "Todo lo que contó el vendedor y el comentario destacado con lo que falta." },
  { id: "vendedor", nombre: "Aprobación del vendedor", corto: "Vendedor", pestana: "Email", texto: "Sarah le envía el anuncio. Su respuesta es un dato, no una autorización." },
  { id: "disponible", nombre: "Tu aprobación y DISPONIBLE", corto: "DISPONIBLE", pestana: "Publicidad", texto: "Canales marcados con solo la calle y, por último, la casilla DISPONIBLE." },
] as const;

export const ESTADOS: Record<Estado, { texto: string; tono: "info" | "acento" | "aviso" | "ok" | "neutro" | "error" | "apoyo" }> = {
  abierta: { texto: "Abierta", tono: "neutro" },
  contactando: { texto: "Contactando al vendedor", tono: "acento" },
  esperando: { texto: "Esperando al vendedor", tono: "info" },
  documentacion: { texto: "Pendiente de documentación", tono: "aviso" },
  revisar: { texto: "Lista para revisar", tono: "apoyo" },
  publicada: { texto: "Aprobada y publicada", tono: "ok" },
  pausada: { texto: "Pausada", tono: "neutro" },
  cancelada: { texto: "Cancelada", tono: "error" },
};

export const ORDEN_ESTADOS: Estado[] = ["revisar", "documentacion", "esperando", "contactando", "abierta", "pausada", "publicada", "cancelada"];

// Bloque General, la guía amarilla. El número es el del manual.
export const GENERAL: { n: string; campo: string; quien: string; critico?: boolean; soloCasa?: boolean; soloPiso?: boolean }[] = [
  { n: "1", campo: "Tipo", quien: "Comercial o vendedor" },
  { n: "2", campo: "Gastos de comunidad", quien: "Vendedor y recibo" },
  { n: "3", campo: "Basuras", quien: "Vendedor y recibo" },
  { n: "4", campo: "I.B.I", quien: "Vendedor y recibo" },
  { n: "5", campo: "Hipoteca pendiente", quien: "Vendedor y nota simple", critico: true },
  { n: "6", campo: "Valoración", quien: "Comercial", critico: true },
  { n: "7", campo: "Precio de venta", quien: "Comercial o dirección", critico: true },
  { n: "8", campo: "m² construidos", quien: "Escritura o nota simple", critico: true },
  { n: "9", campo: "m² útiles", quien: "Escritura o nota simple", critico: true },
  { n: "10", campo: "m² jardín", quien: "Vendedor", soloCasa: true },
  { n: "11", campo: "m² terrazas", quien: "Vendedor" },
  { n: "17", campo: "Orientación", quien: "Vendedor" },
  { n: "18", campo: "Terrazas y balcones", quien: "Vendedor" },
  { n: "12", campo: "Año de construcción", quien: "Escritura o vendedor" },
  { n: "13", campo: "Estado de conservación", quien: "Vendedor y comercial" },
  { n: "14", campo: "Inspección ITE", quien: "Vendedor o administrador" },
  { n: "15", campo: "Certificado energético", quien: "Extraído del certificado" },
  { n: "16", campo: "Habitaciones y baños", quien: "Vendedor" },
  { n: "19", campo: "Plantas de la propiedad", quien: "Vendedor" },
  { n: "20", campo: "Plantas del edificio", quien: "Vendedor", soloPiso: true },
  { n: "21", campo: "Altura (planta)", quien: "Escritura o vendedor", soloPiso: true },
  { n: "22", campo: "Ascensor", quien: "Vendedor" },
  { n: "23", campo: "Carpintería interior", quien: "Vendedor" },
  { n: "24", campo: "Carpintería exterior", quien: "Vendedor" },
  { n: "25", campo: "Suelos", quien: "Vendedor" },
  { n: "26", campo: "Amueblado", quien: "Vendedor" },
  { n: "27", campo: "Armarios empotrados", quien: "Vendedor" },
  { n: "28", campo: "Plazas de garaje", quien: "Vendedor o escritura" },
  { n: "29", campo: "Calefacción", quien: "Vendedor" },
  { n: "30", campo: "Aire acondicionado", quien: "Vendedor" },
  { n: "31", campo: "Gas", quien: "Vendedor" },
  { n: "32", campo: "Trasteros", quien: "Vendedor o escritura" },
  { n: "33", campo: "Piscina", quien: "Vendedor" },
  { n: "34", campo: "Cartel en inmueble", quien: "Comercial" },
  { n: "35", campo: "Cartel en escaparate", quien: "Comercial" },
];

export const EXTRAS = ["Barbacoa", "Lavadero", "Chimenea", "Paneles solares", "Puerta blindada", "Alarma", "Vistas al mar", "Vistas a la montaña", "Punto de recarga", "Zonas verdes", "Primera línea de playa", "Distancia al mar"];

export const INTERNOS = ["Provincia", "Población", "Zona y subzona", "Dirección (vía y número)", "Planta y puerta", "Código postal", "Referencia catastral", "Geolocalización", "Mapa web", "Mandato", "Captador", "Llavero"];

export const REGISTRO = ["Registro de la Propiedad", "Tomo, libro y folio", "Finca", "IDUFIR", "Cargas", "Valor de la escritura"];

export const DOC_IMPRESCINDIBLES = ["Escritura", "Mandato firmado", "Certificado energético"] as const;

export const LIMITES = {
  titulo: [10, 50],
  corta: [50, 650],
  ampliada: [300, 650],
  seoTitulo: [40, 70],
  seoDesc: [100, 170],
} as const;

export const FUENTE_TXT: Record<string, string> = {
  vendedor: "Declarado",
  documento: "Extraído",
  comercial: "Comercial",
  catastro: "Catastro",
  mobilia: "Ya en Mobilia",
};
