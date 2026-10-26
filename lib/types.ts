// Modelos con la forma que tendría la respuesta de una API real del sistema de captación.

export type Estado =
  | "abierta"
  | "contactando"
  | "esperando"
  | "documentacion"
  | "revisar"
  | "publicada"
  | "pausada"
  | "cancelada";

export type Familia = "Piso" | "Casa o Villa";

export type CanalContacto = "llamada" | "email" | "whatsapp";

/** de dónde sale cada dato: lo dijo el vendedor, sale de un documento, lo puso el comercial... */
export type Fuente = "vendedor" | "documento" | "comercial" | "catastro" | "mobilia";

export type EstadoValor = "comprobado" | "propuesta" | "pendiente" | "no consta" | "conflicto" | "escribiendo";

export interface Valor {
  id: string;
  bloque: "General" | "Extras" | "D. Internos" | "Registro";
  campo: string;
  valor: string;
  fuente: Fuente;
  detalle: string;
  estado: EstadoValor;
  critico?: boolean;
  /** lo que había en Mobilia antes de que el sistema escribiera */
  anterior?: string | null;
  escrito?: string;
}

export interface OpcionConflicto {
  fuente: Fuente;
  valor: string;
  detalle: string;
}

export interface Conflicto {
  id: string;
  campo: string;
  titulo: string;
  explicacion: string;
  regla: string;
  opciones: OpcionConflicto[];
  /** índice de la opción que aplica la regla del dueño */
  sugerida: number;
  elegida?: number;
  resuelto?: string;
}

export type TipoDoc =
  | "DNI del vendedor"
  | "Escritura"
  | "Nota simple"
  | "Cédula de habitabilidad"
  | "Certificado energético"
  | "Mandato firmado"
  | "Recibo de IBI"
  | "Recibo de basuras";

export interface Documento {
  id: string;
  tipo: TipoDoc;
  canal: "portal" | "email" | "whatsapp" | "comercial";
  estado: "subido" | "leyendo" | "aislado" | "pendiente";
  fecha?: string;
  paginas?: number;
  carpeta: "DOCUMENTACIÓN PROPIEDAD" | "Perfil del cliente";
  archivo?: string;
  extraidos?: number;
  nota?: string;
}

export interface Mensaje {
  id: string;
  canal: CanalContacto | "sistema";
  de: "sarah" | "vendedor" | "sistema";
  texto: string;
  fecha: string;
  cc?: string;
  duracion?: string;
  plantilla?: string;
}

export interface Foto {
  id: string;
  src: string;
  desc: string;
  tipo: "foto" | "plano" | "local";
}

export interface Textos {
  titulo: string;
  corta: string;
  ampliada: string;
  seoTitulo: string;
  seoUrl: string;
  seoDesc: string;
}

export interface CanalPub {
  id: string;
  nombre: string;
  marcado: boolean;
  /** cómo enseña la dirección ese portal */
  direccion: "Solo calle" | "Calle y número" | "Dirección completa" | "Zona";
  requisitos: string[];
  soloVenta?: boolean;
  corregido?: boolean;
}

export interface Registro {
  id: string;
  fecha: string;
  quien: string;
  accion: string;
  pestana?: string;
  campo?: string;
  antes?: string | null;
  despues?: string;
  resultado: "comprobado" | "fallido" | "deshecho" | "enviado" | "info" | "bloqueado";
}

export interface Vendedor {
  nombre: string;
  telefono: string;
  email: string;
  whatsapp: boolean;
  verificado: boolean;
  baja?: boolean;
}

export interface Captacion {
  id: string;
  ref: string;
  alias: string;
  familia: Familia;
  tipo: string;
  campana: string;
  poblacion: string;
  zona: string;
  calle: string;
  numero: string;
  planta: string;
  puerta: string;
  cp: string;
  precioDeseado: number;
  m2: number;
  habitaciones: number;
  banos: number;
  portada: string;
  comercialId: string;
  vendedor: Vendedor;
  canales: CanalContacto[];
  horario: string;
  maxLlamadas: number;
  maxRecordatorios: number;
  llamadas: number;
  recordatorios: number;
  fin: string;
  estado: Estado;
  estadoAntesPausa?: Estado;
  /** índice del paso del manual en curso (0 a 10), 11 = terminado */
  paso: number;
  creada: string;
  actualizada: string;
  proximoContacto?: string;
  valores: Valor[];
  conflictos: Conflicto[];
  documentos: Documento[];
  mensajes: Mensaje[];
  fotos: Foto[];
  textos: Textos;
  publicidad: CanalPub[];
  registro: Registro[];
  destacado: string;
  anuncioAprobadoVendedor: boolean;
  motivo?: string;
}

export interface Comercial {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  foto: string;
  puedeAprobar: boolean;
  activo: boolean;
  desde: string;
}

export interface PantallaMobilia {
  id: string;
  nombre: string;
  campos: number;
  estado: "ok" | "cambiada" | "comprobando";
  ultima: string;
  detalle?: string;
}

export interface Alerta {
  id: string;
  fecha: string;
  asunto: string;
  cuerpo: string[];
  tipo: "fallo" | "resumen" | "gasto" | "vigilante";
  afectadas: string[];
  leida: boolean;
  resuelta?: boolean;
}

export interface Servicio {
  id: "ia" | "llamadas" | "whatsapp";
  nombre: string;
  detalle: string;
  mes: number;
  hoy: number;
  limiteMes: number;
  limiteDia: number;
}

export interface Ajustes {
  agencia: string;
  buzonSarah: string;
  emailAvisos: string;
  emailRespaldo: string;
  horarioContacto: { desde: string; hasta: string; dias: string };
  horarioRobot: { desde: string; hasta: string };
  maxLlamadas: number;
  maxRecordatorios: number;
  idiomas: string[];
  saludoSarah: string;
  plantillaDocumento: string;
  guion: { id: string; cuando: string; texto: string; fija?: boolean }[];
  idiomaExtranjeros: "español" | "suyo";
  resumen: "diario" | "semanal";
  conservarCopiaDias: number;
}

export interface PasoRobot {
  id: string;
  ref: string;
  pestana: string;
  campo: string;
  valor: string;
  t: number;
  ok: boolean;
}
