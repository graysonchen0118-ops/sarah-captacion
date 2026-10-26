import type { Ajustes, Alerta, CanalPub, Comercial, PantallaMobilia, Servicio } from "../types";
import { RETRATOS, FOTO_LOCAL } from "../photos";

export const MARCA = {
  nombre: "Sarah",
  lema: "Captación en Mobilia",
  agencia: "Costa Serena Propiedades",
  dominio: "costaserena.es",
};

export const DIRECCION = {
  id: "dir",
  nombre: "Dirección",
  cargo: "Administrador",
  email: "direccion@costaserena.es",
  foto: FOTO_LOCAL,
};

export const COMERCIALES: Comercial[] = [
  { id: "c1", nombre: "Laura Martín", email: "laura@costaserena.es", telefono: "+34 611 204 318", foto: RETRATOS[0], puedeAprobar: true, activo: true, desde: "2019" },
  { id: "c2", nombre: "Javier Soler", email: "javier@costaserena.es", telefono: "+34 622 518 040", foto: RETRATOS[1], puedeAprobar: false, activo: true, desde: "2021" },
  { id: "c3", nombre: "Marta Ivars", email: "marta@costaserena.es", telefono: "+34 633 910 772", foto: RETRATOS[2], puedeAprobar: false, activo: true, desde: "2022" },
];

const REQ_BASE = ["DISPONIBLE", "Publicar en web", "Provincia y población"];

export function canalesBase(): CanalPub[] {
  return [
    { id: "idealista", nombre: "Idealista", marcado: false, direccion: "Dirección completa", requisitos: [...REQ_BASE, "Geolocalizado", "m² construidos", "Dirección"] },
    { id: "fotocasa", nombre: "Fotocasa", marcado: false, direccion: "Calle y número", requisitos: [...REQ_BASE, "Geolocalizado", "m² construidos"] },
    { id: "kyero", nombre: "Kyero", marcado: false, direccion: "Zona", requisitos: REQ_BASE },
    { id: "thinkspain", nombre: "ThinkSpain", marcado: false, direccion: "Zona", requisitos: REQ_BASE },
    { id: "rightmove", nombre: "RightMove", marcado: false, direccion: "Zona", requisitos: REQ_BASE, soloVenta: true },
    { id: "zoopla", nombre: "Zoopla", marcado: false, direccion: "Zona", requisitos: REQ_BASE, soloVenta: true },
    { id: "immoscout", nombre: "ImmoScout24", marcado: false, direccion: "Solo calle", requisitos: REQ_BASE },
    { id: "jamesedition", nombre: "JamesEdition", marcado: false, direccion: "Zona", requisitos: REQ_BASE },
    { id: "luxuryestate", nombre: "LuxuryEstate", marcado: false, direccion: "Zona", requisitos: REQ_BASE },
    { id: "properstar", nombre: "Properstar", marcado: false, direccion: "Solo calle", requisitos: REQ_BASE },
    { id: "indomio", nombre: "Indomio", marcado: false, direccion: "Solo calle", requisitos: REQ_BASE },
    { id: "vivegreen", nombre: "Vivegreen", marcado: false, direccion: "Zona", requisitos: REQ_BASE },
    { id: "facebook", nombre: "Facebook", marcado: false, direccion: "Zona", requisitos: REQ_BASE },
    { id: "metricool", nombre: "Metricool", marcado: false, direccion: "Zona", requisitos: REQ_BASE },
  ];
}

export function pantallasBase(ahora: number): PantallaMobilia[] {
  const hace = (min: number) => new Date(ahora - min * 60000).toISOString();
  return [
    { id: "inmuebles", nombre: "Inmuebles · +Nuevo", campos: 4, estado: "ok", ultima: hace(3) },
    { id: "general", nombre: "General", campos: 58, estado: "ok", ultima: hace(3) },
    { id: "internos", nombre: "D. Internos", campos: 31, estado: "ok", ultima: hace(4) },
    { id: "documentos", nombre: "Documentos", campos: 6, estado: "ok", ultima: hace(4) },
    { id: "multimedia", nombre: "Multimedia", campos: 9, estado: "ok", ultima: hace(5) },
    { id: "comentarios", nombre: "Comentarios", campos: 3, estado: "ok", ultima: hace(5) },
    { id: "publicidad", nombre: "Publicidad", campos: 17, estado: "ok", ultima: hace(6) },
    { id: "cliente", nombre: "Perfil del cliente", campos: 12, estado: "ok", ultima: hace(6) },
  ];
}

export function serviciosBase(): Servicio[] {
  return [
    { id: "ia", nombre: "IA", detalle: "Lectura de documentos, fotos, textos y conversaciones", mes: 11.4, hoy: 0.92, limiteMes: 40, limiteDia: 4 },
    { id: "llamadas", nombre: "Llamadas de Sarah", detalle: "Línea y voz, por minuto", mes: 19.8, hoy: 1.62, limiteMes: 60, limiteDia: 6 },
    { id: "whatsapp", nombre: "WhatsApp", detalle: "Plantillas y respuestas fuera de las gratuitas", mes: 1.64, hoy: 0.12, limiteMes: 15, limiteDia: 2 },
  ];
}

export const AJUSTES_BASE: Ajustes = {
  agencia: MARCA.agencia,
  buzonSarah: "sarah@costaserena.es",
  emailAvisos: "direccion@costaserena.es",
  emailRespaldo: "avisos.costaserena@gmail.com",
  horarioContacto: { desde: "10:00", hasta: "20:00", dias: "Lunes a viernes" },
  horarioRobot: { desde: "08:00", hasta: "22:00" },
  maxLlamadas: 2,
  maxRecordatorios: 3,
  idiomas: ["Español", "Inglés", "Alemán"],
  saludoSarah:
    "Hola, {vendedor}. Soy Sarah, la asistente de inteligencia artificial de {agencia}. Le escribo de parte de {comercial}, su comercial, por la venta de su {inmueble}.",
  plantillaDocumento:
    "Para terminar el anuncio solo nos falta {documento}. Si lo tiene, puede enviarme aquí el PDF o una foto. Si no lo tiene, dígamelo y se lo comento a {comercial}; no hace falta que lo busque hoy. Si prefiere que no le escribamos por WhatsApp, responda BAJA.",
  guion: [
    { id: "saludo", cuando: "Al empezar", texto: "Buenos días, ¿hablo con {vendedor}? Soy Sarah, la asistente de inteligencia artificial de {agencia}. La llamo de parte de {comercial} por la venta de su {inmueble}. Son unos cinco minutos para completar el anuncio. ¿Le viene bien ahora?" },
    { id: "no-puede", cuando: "Si no puede", texto: "Sin problema. ¿A qué hora la llamo, o prefiere que se lo pregunte por WhatsApp?" },
    { id: "preguntas", cuando: "Si puede", texto: "Solo lo que aún no consta en Mobilia, de una en una: ¿Cuántos dormitorios y baños tiene? ¿Tiene terraza o garaje?" },
    { id: "confirmar", cuando: "Antes de terminar", texto: "Le repito para no equivocarme: {resumen}. ¿Es correcto?" },
    { id: "manual", cuando: "Cierre, del manual", texto: "¿Hay alguna cosa más que tenga la propiedad, como piscina privada, chimenea, sauna o algo similar, que debamos tener en cuenta?", fija: true },
    { id: "precio", cuando: "Si pregunta por el precio", texto: "Eso lo lleva {comercial}. Le dejo el recado y la llama él." },
  ],
  idiomaExtranjeros: "español",
  resumen: "diario",
  conservarCopiaDias: 7,
};

export function alertasBase(ahora: number): Alerta[] {
  const hace = (h: number) => new Date(ahora - h * 3600000).toISOString();
  return [
    {
      id: "al-1",
      fecha: hace(2.2),
      asunto: "Resumen diario: todo funciona",
      cuerpo: [
        "Ayer el sistema escribió y releyó 1 ficha en Mobilia, sin ningún fallo.",
        "Sarah hizo 2 llamadas y envió 4 mensajes, todos dentro del horario y con la copia al comercial de cada propiedad.",
        "El vigilante externo recibió 288 de 288 toques. Gasto del día: 2,60 €.",
      ],
      tipo: "resumen",
      afectadas: [],
      leida: false,
    },
    {
      id: "al-2",
      fecha: hace(19),
      asunto: "Captación bloqueada: falta la nota simple desde hace 24 horas",
      cuerpo: [
        "REF 2432 no puede pasar al bloque D. Internos sin escritura o nota simple.",
        "Sarah ya envió los 3 recordatorios permitidos. Hace falta que el comercial llame o que decidas una excepción.",
        "El resto de captaciones sigue funcionando.",
      ],
      tipo: "fallo",
      afectadas: ["REF 2432"],
      leida: true,
    },
    {
      id: "al-3",
      fecha: hace(27),
      asunto: "Llamadas de Sarah al 80 % del límite diario",
      cuerpo: ["Llevas 4,80 € de 6,00 € en llamadas hoy. Al llegar al 100 % las llamadas se pausan solas hasta mañana.", "Email y WhatsApp siguen funcionando."],
      tipo: "gasto",
      afectadas: [],
      leida: true,
      resuelta: true,
    },
    {
      id: "al-4",
      fecha: hace(74),
      asunto: "Captaciones paradas: Mobilia pidió un código por SMS",
      cuerpo: [
        "Al entrar, Mobilia pidió un código que llega por SMS. El sistema no lo salta: se paró sin escribir nada.",
        "Afectadas: REF 2398 y REF 2401. Se retomaron solas cuando introdujiste el código desde el panel.",
      ],
      tipo: "fallo",
      afectadas: ["REF 2398", "REF 2401"],
      leida: true,
      resuelta: true,
    },
  ];
}
