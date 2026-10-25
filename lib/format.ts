export function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** minúsculas, sin tildes ni signos, para buscar */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ZONA = "Europe/Madrid";
const dfCorta = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: ZONA });
const dfLarga = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: ZONA });
const dfHora = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: ZONA });
const dfSeg = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: ZONA });
const dfDia = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: ZONA });
const dfH = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA });

const limpio = (s: string) => s.replace(/ | /g, " ").replace(/\s+/g, " ");

export const fechaCorta = (iso: string) => limpio(dfCorta.format(new Date(iso))).replace(/\./g, "");
export const fechaLarga = (iso: string) => dfLarga.format(new Date(iso));
export const hora = (iso: string) => limpio(dfHora.format(new Date(iso)));
export const horaSeg = (iso: string) => limpio(dfSeg.format(new Date(iso)));
export const dia = (ms: number) => dfDia.format(new Date(ms));

/** hora decimal en España, 13.5 = 13:30 */
export function horaEspana(ms: number) {
  const [h, m] = dfH.format(new Date(ms)).split(":").map(Number);
  return (h % 24) + m / 60;
}

export function haceCuanto(iso: string, ahora: number) {
  const s = Math.round((ahora - new Date(iso).getTime()) / 1000);
  if (s < 0) {
    const f = -s;
    if (f < 3600) return `en ${Math.max(1, Math.round(f / 60))} min`;
    if (f < 86400) return `en ${Math.round(f / 3600)} h`;
    return `en ${Math.round(f / 86400)} días`;
  }
  if (s < 45) return `hace ${Math.max(1, s)} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? "hace 1 hora" : `hace ${h} horas`;
  const d = Math.round(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

export function cuandoFue(iso: string, ahora: number) {
  return dia(new Date(iso).getTime()) === dia(ahora) ? hora(iso) : `${fechaCorta(iso)}, ${hora(iso)}`;
}

export const euros = (n: number) => Math.round(n).toLocaleString("es-ES", { useGrouping: true }).replace(/ /g, ".") + " €";
export const eurosDec = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ".") + " €";
export const miles = (n: number) => {
  const s = Math.round(n).toString();
  return s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : s;
};
export const precio = (n: number) => miles(n) + " €";
export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const uid = (p: string) => p + "-" + Math.random().toString(36).slice(2, 8);
export const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const palabras = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** número de portal, planta o puerta escritos en un texto público */
export function revelaDireccion(texto: string, c: { numero: string; calle: string }) {
  const hallazgos: string[] = [];
  const calle = c.calle.replace(/^(Calle|Carrer|Avenida|Avinguda|Paseo|Plaza|Camino|Partida)\s+(de\s+(la\s+|los\s+|las\s+)?|del\s+)?/i, "").trim();
  const esc = calle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (c.numero && calle && new RegExp(`${esc}[,\\s]*(n[º°o]\\.?\\s*)?${c.numero}\\b`, "i").test(texto)) hallazgos.push(`número ${c.numero}`);
  else if (/\bn[º°]\.?\s*\d+/i.test(texto)) hallazgos.push("número de portal");
  if (/\b\d+\s*[ºª°]?\s*(planta)\b/i.test(texto) || /\bplanta\s+\d+/i.test(texto)) hallazgos.push("planta");
  if (/\bpuerta\s+[A-Z0-9]\b/i.test(texto) || /\b\d+\s*[ºª°]\s*[A-D]\b/.test(texto)) hallazgos.push("puerta");
  return Array.from(new Set(hallazgos));
}
