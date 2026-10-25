import type { Captacion, CanalContacto, Conflicto, Documento, Estado, Familia, Foto, Mensaje, Registro, Textos, Valor } from "../types";
import { FOTOS, u } from "../photos";
import { GENERAL } from "../manual";
import { canalesBase, COMERCIALES, MARCA } from "./agencia";
import { mulberry32 } from "../format";

// Fichas de captación de una agencia de la Costa Blanca. Todo inventado, con forma de datos reales.

interface Semilla {
  ref: string;
  familia: Familia;
  tipo: string;
  poblacion: string;
  zona: string;
  calle: string;
  numero: string;
  planta?: string;
  puerta?: string;
  cp: string;
  precio: number;
  m2: number;
  hab: number;
  banos: number;
  comercial: string;
  vendedor: string;
  email: string;
  tel: string;
  estado: Estado;
  paso: number;
  campana: string;
  horasAtras: number;
}

const S = (
  ref: string, familia: Familia, tipo: string, poblacion: string, zona: string, calle: string, numero: string, planta: string, puerta: string, cp: string,
  precio: number, m2: number, hab: number, banos: number, comercial: string, vendedor: string, email: string, tel: string, estado: Estado, paso: number, campana: string, horasAtras: number,
): Semilla => ({ ref, familia, tipo, poblacion, zona, calle, numero, planta, puerta, cp, precio, m2, hab, banos, comercial, vendedor, email, tel, estado, paso, campana, horasAtras });

// Los siete expedientes con más historia van primero.
const SEMILLAS: Semilla[] = [
  S("REF 2431", "Casa o Villa", "Villa", "Jávea", "Cap Martí", "Calle Lepanto", "14", "", "", "03730", 685000, 128, 3, 2, "c1", "Gerhard Baumann", "g.baumann@gmx.de", "+34 619 402 117", "revisar", 10, "Cliente conocido", 70),
  S("REF 2436", "Piso", "Ático", "Altea", "Cap Negret", "Avenida del Mediterráneo", "41", "6", "B", "03590", 459000, 112, 2, 2, "c2", "Susan Whitaker", "susan.whitaker@btinternet.com", "+34 634 118 905", "esperando", 2, "Idealista", 30),
  S("REF 2412", "Piso", "Piso", "Dénia", "Les Rotes", "Carretera de Les Rotes", "88", "1", "A", "03700", 312000, 94, 2, 1, "c4", "Vicente Bertomeu", "vbertomeu@gmail.com", "+34 652 301 448", "documentacion", 4, "Llamada", 120),
  S("REF 2440", "Casa o Villa", "Casa adosada", "Moraira", "El Portet", "Calle Cometa", "7", "", "", "03724", 398000, 146, 3, 3, "c5", "Rosa Mengual", "rosamengual@hotmail.com", "+34 670 552 091", "contactando", 3, "Cartel", 9),
  S("REF 2427", "Piso", "Piso", "Calpe", "Puerto Blanco", "Calle Gabriel Miró", "22", "3", "C", "03710", 274000, 86, 2, 2, "c3", "Pieter van Dijk", "pvandijk@ziggo.nl", "+34 611 776 230", "revisar", 10, "Oficina", 52),
  S("REF 2419", "Casa o Villa", "Villa", "Benissa", "Fanadix", "Partida Fanadix", "112", "", "", "03720", 940000, 236, 4, 4, "c6", "Isabel Morant", "isabel.morant@gmail.com", "+34 699 210 384", "pausada", 2, "Colaborador", 96),
  S("REF 2405", "Casa o Villa", "Villa", "Jávea", "Tosalet", "Calle Holanda", "5", "", "", "03730", 1240000, 268, 5, 4, "c1", "Hans Vogel", "hvogel@t-online.de", "+34 627 488 512", "publicada", 11, "Kyero", 260),

  S("REF 2441", "Piso", "Apartamento", "Jávea", "Arenal", "Avenida del Plá", "126", "2", "D", "03730", 245000, 72, 2, 1, "c2", "Amparo Signes", "amparo.signes@gmail.com", "+34 645 223 870", "abierta", 0, "Idealista", 2),
  S("REF 2439", "Casa o Villa", "Villa", "Dénia", "Montgó", "Camino de la Colonia", "31", "", "", "03700", 575000, 182, 4, 3, "c4", "Thomas Fischer", "t.fischer@web.de", "+34 698 340 217", "contactando", 2, "Llamada", 6),
  S("REF 2438", "Piso", "Dúplex", "Altea", "Casco antiguo", "Calle Mayor", "9", "2", "A", "03590", 365000, 118, 3, 2, "c3", "Carmen Llinares", "c.llinares@gmail.com", "+34 618 902 553", "esperando", 2, "Oficina", 22),
  S("REF 2437", "Casa o Villa", "Casa", "Teulada", "Cumbre del Sol", "Calle Ibiza", "18", "", "", "03726", 720000, 204, 4, 3, "c6", "Mark Hennessy", "markhennessy@gmail.com", "+34 600 812 340", "documentacion", 4, "Cliente conocido", 40),
  S("REF 2435", "Piso", "Piso", "Calpe", "Centro", "Avenida Gabriel Miró", "45", "4", "B", "03710", 198000, 78, 2, 1, "c5", "José Antonio Ivorra", "jaivorra@gmail.com", "+34 659 113 762", "revisar", 10, "Cartel", 44),
  S("REF 2434", "Casa o Villa", "Villa", "Moraira", "Pla del Mar", "Calle Albatros", "3", "", "", "03724", 1095000, 251, 4, 4, "c1", "Elisabeth Kramer", "elisabeth.kramer@gmx.at", "+34 628 019 457", "esperando", 2, "JamesEdition", 33),
  S("REF 2433", "Piso", "Ático", "Dénia", "Las Marinas", "Carretera de Las Marinas", "204", "5", "A", "03700", 389000, 104, 3, 2, "c2", "Ana Mompó", "ana.mompo@gmail.com", "+34 664 297 015", "contactando", 3, "Idealista", 11),
  S("REF 2432", "Casa o Villa", "Casa adosada", "Jávea", "Puerto", "Calle Toledo", "12", "", "", "03730", 419000, 132, 3, 2, "c3", "Francisco Bas", "fbas@telefonica.net", "+34 619 553 802", "documentacion", 4, "Llamada", 58),
  S("REF 2430", "Piso", "Apartamento", "Altea", "Altea Hills", "Calle Suiza", "6", "1", "C", "03590", 310000, 89, 2, 2, "c4", "Linda Johansson", "linda.johansson@telia.se", "+34 676 401 298", "revisar", 10, "Kyero", 77),
  S("REF 2429", "Casa o Villa", "Villa", "Benissa", "La Fustera", "Calle Alicante", "27", "", "", "03720", 615000, 176, 3, 3, "c5", "Robert Sinclair", "rsinclair@outlook.com", "+34 607 318 449", "publicada", 11, "ThinkSpain", 140),
  S("REF 2428", "Piso", "Piso", "Jávea", "Arenal", "Avenida de Ultramar", "53", "3", "B", "03730", 289000, 81, 2, 1, "c6", "Marisa Cardona", "marisa.cardona@gmail.com", "+34 680 233 145", "esperando", 2, "Oficina", 27),
  S("REF 2426", "Casa o Villa", "Villa", "Calpe", "Maryvilla", "Calle Puerto Rico", "40", "", "", "03710", 830000, 224, 5, 4, "c1", "Peter Wouters", "peter.wouters@telenet.be", "+34 622 108 774", "contactando", 2, "Colaborador", 14),
  S("REF 2425", "Piso", "Dúplex", "Moraira", "Centro", "Calle Doctor Calatayud", "16", "1", "A", "03724", 335000, 102, 3, 2, "c2", "Teresa Ferrer", "teresaferrer@gmail.com", "+34 635 820 196", "publicada", 11, "Cartel", 190),
  S("REF 2424", "Casa o Villa", "Casa", "Dénia", "Centro", "Calle Loreto", "28", "", "", "03700", 455000, 160, 4, 2, "c3", "Joan Ripoll", "joanripoll@gmail.com", "+34 661 744 030", "abierta", 0, "Llamada", 1),
  S("REF 2423", "Piso", "Apartamento", "Calpe", "Playa Arenal-Bol", "Avenida de los Ejércitos Españoles", "17", "8", "D", "03710", 268000, 70, 1, 1, "c4", "Karin Meyer", "karin.meyer@web.de", "+34 674 912 503", "esperando", 2, "Idealista", 18),
  S("REF 2422", "Casa o Villa", "Villa", "Jávea", "Portitxol", "Camino Cala Blanca", "9", "", "", "03730", 1480000, 290, 5, 5, "c5", "Daniel Hughes", "dhughes@icloud.com", "+34 609 671 228", "revisar", 10, "LuxuryEstate", 61),
  S("REF 2421", "Piso", "Piso", "Altea", "Centro", "Calle Conde de Altea", "34", "2", "B", "03590", 239000, 84, 3, 1, "c6", "Lorena Vives", "lorena.vives@gmail.com", "+34 627 301 668", "documentacion", 4, "Oficina", 66),
  S("REF 2420", "Casa o Villa", "Casa adosada", "Benissa", "Benissa Costa", "Calle Rosa de los Vientos", "21", "", "", "03720", 349000, 128, 3, 2, "c1", "Wim de Boer", "wimdeboer@kpnmail.nl", "+34 652 445 017", "publicada", 11, "Kyero", 230),
  S("REF 2418", "Piso", "Apartamento", "Dénia", "Puerto", "Calle Sandunga", "11", "3", "A", "03700", 279000, 76, 2, 2, "c2", "Ingrid Larsen", "ingrid.larsen@gmail.com", "+34 638 507 921", "cancelada", 2, "Idealista", 150),
  S("REF 2417", "Casa o Villa", "Villa", "Moraira", "Cometa", "Calle Benimeit", "45", "", "", "03724", 765000, 198, 4, 3, "c3", "Michael Brandt", "mbrandt@gmx.de", "+34 619 230 875", "publicada", 11, "ImmoScout24", 280),
  S("REF 2416", "Piso", "Piso", "Jávea", "Centro", "Calle Virgen del Loreto", "8", "1", "B", "03730", 179000, 74, 2, 1, "c4", "Rafael Mas", "rafamas@gmail.com", "+34 666 125 330", "contactando", 3, "Cartel", 20),
  S("REF 2415", "Casa o Villa", "Villa", "Teulada", "Pla del Mar", "Calle Moraira", "71", "", "", "03725", 980000, 240, 4, 4, "c5", "Sophie Laurent", "sophie.laurent@orange.fr", "+34 690 448 271", "esperando", 2, "Properstar", 36),
  S("REF 2414", "Piso", "Ático", "Calpe", "Puerto Blanco", "Calle Mozart", "2", "7", "A", "03710", 415000, 109, 3, 2, "c6", "Andreas Huber", "andreas.huber@bluewin.ch", "+34 612 590 344", "revisar", 10, "Indomio", 48),
  S("REF 2413", "Casa o Villa", "Casa", "Altea", "Sierra de Altea", "Partida Cap Blanc", "15", "", "", "03590", 525000, 170, 3, 2, "c1", "Nuria Cortés", "nuria.cortes@gmail.com", "+34 633 207 864", "documentacion", 4, "Oficina", 84),
  S("REF 2411", "Piso", "Piso", "Benissa", "Centro", "Avenida de la Llibertat", "19", "2", "C", "03720", 158000, 88, 3, 1, "c2", "Salvador Pastor", "spastor@gmail.com", "+34 670 118 225", "abierta", 0, "Llamada", 3),
  S("REF 2410", "Casa o Villa", "Villa", "Dénia", "Las Rotas", "Calle Venus", "24", "", "", "03700", 689000, 189, 4, 3, "c3", "Graham Baxter", "grahambaxter@sky.com", "+34 607 662 190", "publicada", 11, "RightMove", 310),
  S("REF 2409", "Piso", "Apartamento", "Moraira", "El Portet", "Calle Mar Egeo", "4", "1", "B", "03724", 342000, 79, 2, 2, "c4", "Eva Zaragoza", "eva.zaragoza@gmail.com", "+34 619 880 413", "esperando", 2, "Idealista", 25),
  S("REF 2408", "Casa o Villa", "Casa adosada", "Jávea", "Montgó", "Calle Ronda Norte", "33", "", "", "03730", 368000, 140, 3, 2, "c5", "Klaus Richter", "k.richter@t-online.de", "+34 645 302 978", "contactando", 2, "Fotocasa", 8),
  S("REF 2407", "Piso", "Piso", "Calpe", "Centro", "Calle Libertad", "12", "5", "A", "03710", 215000, 83, 2, 1, "c6", "Mercedes Giner", "mercedesginer@gmail.com", "+34 662 509 341", "publicada", 11, "Oficina", 205),
  S("REF 2406", "Casa o Villa", "Villa", "Benissa", "Cala Advocat", "Calle Corb Marí", "8", "", "", "03720", 1150000, 276, 5, 4, "c2", "Jean Dupont", "jean.dupont@free.fr", "+34 690 213 876", "revisar", 10, "JamesEdition", 55),
];

const DIAS = 86400000;

function fotoPortada(s: Semilla, i: number) {
  const pool = s.familia === "Piso" ? FOTOS.pisos : FOTOS.villas;
  const id = pool.length ? pool[i % pool.length] : "";
  return id ? u(id, 900, 640) : "";
}

const DESC: Record<"villas" | "pisos" | "salones" | "cocinas" | "dormitorios" | "banos" | "piscinas" | "terrazas", string[]> = {
  villas: ["Fachada blanca con la piscina delante", "Vista exterior de la casa desde el jardín", "Porche cubierto junto a la piscina", "Fachada principal al atardecer"],
  pisos: ["Edificio con terrazas orientadas al mar", "Terraza amplia con vistas abiertas", "Vista exterior del edificio", "Balcón con vistas a la bahía"],
  salones: ["Salón luminoso con salida a la terraza", "Salón comedor con ventanales", "Zona de estar con sofá y luz natural", "Salón con suelo claro y techos altos", "Salón abierto a la cocina"],
  cocinas: ["Cocina equipada con isla central", "Cocina con encimera clara y ventana", "Cocina abierta al comedor", "Cocina con armarios blancos"],
  dormitorios: ["Dormitorio principal con mucha luz", "Dormitorio doble con armario", "Dormitorio con ventana amplia", "Dormitorio de invitados"],
  banos: ["Baño completo con ducha", "Baño con lavabo doble", "Baño en tonos claros"],
  piscinas: ["Piscina privada con zona de hamacas", "Piscina y jardín con palmeras", "Piscina rodeada de terraza"],
  terrazas: ["Terraza con vistas al mar", "Terraza con mesa para comer fuera", "Balcón con vistas despejadas"],
};

export function galeria(s: { familia: Familia; ref: string }, cuantas: number, semilla: number): Foto[] {
  const rnd = mulberry32(semilla);
  const orden: (keyof typeof DESC)[] = s.familia === "Piso"
    ? ["pisos", "terrazas", "salones", "salones", "cocinas", "dormitorios", "dormitorios", "banos", "terrazas", "salones", "cocinas", "banos"]
    : ["villas", "piscinas", "villas", "salones", "salones", "cocinas", "dormitorios", "dormitorios", "banos", "terrazas", "piscinas", "cocinas"];
  const out: Foto[] = [];
  for (let i = 0; i < cuantas; i++) {
    const cat = orden[i % orden.length];
    const pool = FOTOS[cat];
    if (!pool.length) continue;
    const k = (i + Math.floor(rnd() * 7)) % pool.length;
    const d = DESC[cat];
    out.push({ id: `${s.ref}-f${i}`, src: u(pool[k], 640, 440), desc: d[(i + k) % d.length], tipo: "foto" });
  }
  if (FOTOS.planos.length) out.push({ id: `${s.ref}-plano`, src: u(FOTOS.planos[semilla % FOTOS.planos.length], 640, 440), desc: "Plano de la vivienda", tipo: "plano" });
  if (FOTOS.locales.length) out.push({ id: `${s.ref}-local`, src: u(FOTOS.locales[0], 640, 440), desc: `Nuestra oficina de ${MARCA.agencia}`, tipo: "local" });
  return out;
}

const ORIENT = ["Sur", "Sureste", "Este", "Suroeste", "Sur"];
const ESTADO_C = ["Buen estado", "Reformado", "Buen estado", "Necesita reforma", "Reformado de lujo"];
const SUELOS = ["Mármol", "Baldosa", "Parquet", "Mármol", "Piedra natural"];

function v(id: string, bloque: Valor["bloque"], campo: string, valor: string, fuente: Valor["fuente"], detalle: string, estado: Valor["estado"] = "comprobado", extra: Partial<Valor> = {}): Valor {
  return { id, bloque, campo, valor, fuente, detalle, estado, ...extra };
}

/** valores de la ficha según hasta dónde ha llegado el expediente */
export function valoresDe(s: Semilla, rnd: () => number, fechaDato: string): Valor[] {
  const casa = s.familia !== "Piso";
  const out: Valor[] = [];
  const llamada = `Llamada de Sarah, ${fechaDato}`;
  const whats = `WhatsApp del vendedor, ${fechaDato}`;
  const generalHecho = s.paso > 3;
  const generalParcial = s.paso === 3;
  GENERAL.forEach((g, i) => {
    if (g.soloCasa && !casa) return;
    if (g.soloPiso && casa) return;
    const id = `${s.ref}-g${g.n}`;
    let valor = "";
    let fuente: Valor["fuente"] = "vendedor";
    let detalle = i % 3 === 0 ? whats : llamada;
    switch (g.campo) {
      case "Tipo": valor = s.tipo; fuente = "comercial"; detalle = "Orden de la captación"; break;
      case "Gastos de comunidad": valor = casa ? (rnd() > 0.5 ? "No tiene" : `${Math.round(30 + rnd() * 40)} €/mes`) : `${Math.round(55 + rnd() * 70)} €/mes`; break;
      case "Basuras": valor = `${Math.round(70 + rnd() * 70)} €/año`; fuente = "documento"; detalle = "Recibo de basuras 2026, pág. 1"; break;
      case "I.B.I": valor = `${Math.round(s.precio * (0.0008 + rnd() * 0.0004))} €/año`; fuente = "documento"; detalle = "Recibo de IBI 2026, pág. 1"; break;
      case "Hipoteca pendiente": valor = rnd() > 0.6 ? `Sí, ${Math.round(40 + rnd() * 120)}.000 €` : "NO"; break;
      case "Valoración": valor = `${Math.round((s.precio * 0.96) / 1000)}.000 €`; fuente = "comercial"; detalle = "Valoración del comercial"; break;
      case "Precio de venta": valor = `${Math.round(s.precio / 1000)}.000 €`; fuente = "comercial"; detalle = "Fijado por el comercial"; break;
      case "m² construidos": valor = `${s.m2} m²`; fuente = "documento"; detalle = "Escritura, pág. 3"; break;
      case "m² útiles": valor = `${Math.round(s.m2 * 0.86)} m²`; fuente = "documento"; detalle = "Escritura, pág. 3"; break;
      case "m² jardín": valor = `${Math.round(300 + rnd() * 900)} m²`; break;
      case "m² terrazas": valor = `${Math.round(10 + rnd() * 50)} m²`; break;
      case "Orientación": valor = ORIENT[Math.floor(rnd() * ORIENT.length)]; break;
      case "Terrazas y balcones": valor = `${1 + Math.floor(rnd() * 3)}`; break;
      case "Año de construcción": valor = `${1984 + Math.floor(rnd() * 34)}`; fuente = "documento"; detalle = "Escritura, pág. 2"; break;
      case "Estado de conservación": valor = ESTADO_C[Math.floor(rnd() * ESTADO_C.length)]; break;
      case "Inspección ITE": valor = casa ? "No aplica" : "Superada en 2024"; break;
      case "Certificado energético": valor = `${"DEEFG"[Math.floor(rnd() * 5)]} · ${Math.round(90 + rnd() * 120)} kWh/m² año`; fuente = "documento"; detalle = "Certificado energético, pág. 1"; break;
      case "Habitaciones y baños": valor = `${s.hab} dormitorios · ${s.banos} baños`; break;
      case "Plantas de la propiedad": valor = casa ? `${1 + Math.floor(rnd() * 2)}` : s.tipo === "Dúplex" ? "2" : "1"; break;
      case "Plantas del edificio": valor = `${Math.max(Number(s.planta) || 2, 4) + Math.floor(rnd() * 3)}`; break;
      case "Altura (planta)": valor = `${s.planta}ª, interno`; fuente = "documento"; detalle = "Nota simple, pág. 1"; break;
      case "Ascensor": valor = casa ? "No" : "Sí"; break;
      case "Carpintería interior": valor = "Madera"; break;
      case "Carpintería exterior": valor = rnd() > 0.5 ? "Aluminio" : "PVC"; break;
      case "Suelos": valor = SUELOS[Math.floor(rnd() * SUELOS.length)]; break;
      case "Amueblado": valor = rnd() > 0.5 ? "Sí" : "No"; break;
      case "Armarios empotrados": valor = "Sí"; break;
      case "Plazas de garaje": valor = `${casa ? 2 : 1}`; break;
      case "Calefacción": valor = rnd() > 0.5 ? "No tiene (el split no cuenta)" : casa ? "Suelo radiante" : "Eléctrica"; break;
      case "Aire acondicionado": valor = "Sí"; break;
      case "Gas": valor = "No"; break;
      case "Trasteros": valor = casa ? "1" : rnd() > 0.5 ? "1" : "0"; break;
      case "Piscina": valor = casa ? "Privada" : "Comunitaria"; break;
      case "Cartel en inmueble": valor = "Pendiente del permiso del vendedor"; fuente = "comercial"; detalle = "Lo confirma el comercial"; break;
      case "Cartel en escaparate": valor = "Sí"; fuente = "comercial"; detalle = "Marca interna"; break;
    }
    let estado: Valor["estado"] = generalHecho ? "comprobado" : generalParcial ? (i < 12 ? "comprobado" : i < 14 ? "escribiendo" : "pendiente") : fuente === "comercial" ? "comprobado" : "pendiente";
    if (g.critico && fuente === "comercial" && s.estado !== "publicada") estado = "propuesta";
    if (estado === "pendiente") valor = "";
    out.push(v(id, "General", g.campo, valor, fuente, estado === "pendiente" ? "Sarah lo pide al vendedor" : detalle, estado, { critico: g.critico, anterior: "" }));
  });
  if (s.paso > 4) {
    const dir = `${s.calle}, ${s.numero}`;
    const int: [string, string, Valor["fuente"], string][] = [
      ["Provincia", "Alicante", "documento", "Nota simple, pág. 1"],
      ["Población", s.poblacion, "documento", "Nota simple, pág. 1"],
      ["Zona y subzona", `${s.poblacion} · ${s.zona}`, "documento", "Elegida de la lista de Mobilia"],
      ["Dirección (vía y número)", dir, "documento", "Escritura, pág. 1"],
      ["Planta y puerta", s.planta ? `${s.planta}ª ${s.puerta}` : "No aplica", "documento", "Escritura, pág. 1"],
      ["Código postal", s.cp, "documento", "Escritura, pág. 1"],
      ["Referencia catastral", `${Math.floor(1000000 + rnd() * 8999999)}BC${Math.floor(1000 + rnd() * 8999)}S000${Math.floor(1 + rnd() * 8)}`, "documento", "Recibo de IBI, pág. 1"],
      ["Geolocalización", "Punto dentro de la zona y subzona", "mobilia", "Botón Geolocalizar · comprobado"],
      ["Mapa web", "Dirección aproximada", "comercial", "Regla de la agencia"],
      ["Mandato", "Exclusiva · inicio registrado", "comercial", "Mandato firmado, subido por el comercial"],
      ["Captador", COMERCIALES.find((c) => c.id === s.comercial)?.nombre ?? "", "comercial", "Quien dio la orden"],
    ];
    int.forEach(([campo, valor, fuente, detalle], i) => out.push(v(`${s.ref}-i${i}`, "D. Internos", campo, valor, fuente, detalle)));
    const reg: [string, string][] = [
      ["Registro de la Propiedad", `${s.poblacion === "Jávea" || s.poblacion === "Dénia" ? "Dénia" : s.poblacion === "Altea" ? "Callosa d'en Sarrià" : "Calpe"}`],
      ["Tomo, libro y folio", `${1400 + Math.floor(rnd() * 400)}, ${300 + Math.floor(rnd() * 300)}, ${Math.floor(10 + rnd() * 200)}`],
      ["Finca", `${10000 + Math.floor(rnd() * 40000)}`],
      ["Cargas", "Libre de cargas"],
    ];
    reg.forEach(([campo, valor], i) => out.push(v(`${s.ref}-r${i}`, "Registro", campo, valor, "documento", "Nota simple, pág. 2")));
  } else {
    out.push(v(`${s.ref}-i-bloq`, "D. Internos", "Bloque completo", "", "documento", "Espera la escritura o la nota simple", "pendiente"));
  }
  return out;
}

function docs(s: Semilla, base: number): Documento[] {
  const f = (h: number) => new Date(base + h * 3600000).toISOString();
  const tiene = (n: number) => s.paso >= n;
  const lista: Documento[] = [
    { id: `${s.ref}-d1`, tipo: "DNI del vendedor", canal: "portal", estado: tiene(4) ? "subido" : "pendiente", fecha: tiene(4) ? f(20) : undefined, paginas: 2, carpeta: "Perfil del cliente", archivo: tiene(4) ? `DNI_${s.ref.replace(" ", "")}.pdf` : undefined },
    { id: `${s.ref}-d2`, tipo: "Escritura", canal: "portal", estado: tiene(5) ? "subido" : "pendiente", fecha: tiene(5) ? f(22) : undefined, paginas: 14, carpeta: "DOCUMENTACIÓN PROPIEDAD", archivo: tiene(5) ? `Escritura_${s.ref.replace(" ", "")}.pdf` : undefined, extraidos: tiene(5) ? 12 : undefined },
    { id: `${s.ref}-d3`, tipo: "Nota simple", canal: "email", estado: tiene(5) ? "subido" : "pendiente", fecha: tiene(5) ? f(23) : undefined, paginas: 3, carpeta: "DOCUMENTACIÓN PROPIEDAD", archivo: tiene(5) ? `NotaSimple_${s.ref.replace(" ", "")}.pdf` : undefined, extraidos: tiene(5) ? 9 : undefined },
    { id: `${s.ref}-d4`, tipo: "Certificado energético", canal: "whatsapp", estado: tiene(4) ? "subido" : "pendiente", fecha: tiene(4) ? f(18) : undefined, paginas: 5, carpeta: "DOCUMENTACIÓN PROPIEDAD", archivo: tiene(4) ? `CertEnergetico_${s.ref.replace(" ", "")}.pdf` : undefined, extraidos: tiene(4) ? 4 : undefined },
    { id: `${s.ref}-d5`, tipo: "Recibo de IBI", canal: "email", estado: tiene(4) ? "subido" : "pendiente", fecha: tiene(4) ? f(16) : undefined, paginas: 1, carpeta: "DOCUMENTACIÓN PROPIEDAD", archivo: tiene(4) ? `IBI_${s.ref.replace(" ", "")}.pdf` : undefined, extraidos: tiene(4) ? 2 : undefined },
    { id: `${s.ref}-d6`, tipo: "Recibo de basuras", canal: "whatsapp", estado: tiene(4) ? "subido" : "pendiente", fecha: tiene(4) ? f(16.5) : undefined, paginas: 1, carpeta: "DOCUMENTACIÓN PROPIEDAD", archivo: tiene(4) ? `Basuras_${s.ref.replace(" ", "")}.pdf` : undefined, extraidos: tiene(4) ? 1 : undefined },
    { id: `${s.ref}-d7`, tipo: "Mandato firmado", canal: "comercial", estado: tiene(1) ? "subido" : "pendiente", fecha: tiene(1) ? f(1) : undefined, paginas: 2, carpeta: "DOCUMENTACIÓN PROPIEDAD", archivo: tiene(1) ? `Mandato_${s.ref.replace(" ", "")}.pdf` : undefined },
    { id: `${s.ref}-d8`, tipo: "Cédula de habitabilidad", canal: "email", estado: tiene(6) ? "subido" : "pendiente", fecha: tiene(6) ? f(26) : undefined, paginas: 1, carpeta: "DOCUMENTACIÓN PROPIEDAD", archivo: tiene(6) ? `Cedula_${s.ref.replace(" ", "")}.pdf` : undefined, extraidos: tiene(6) ? 2 : undefined },
  ];
  return lista;
}

function conversacion(s: Semilla, base: number, comercialNombre: string, comercialEmail: string): Mensaje[] {
  const f = (h: number) => new Date(base + h * 3600000).toISOString();
  const nombre = s.vendedor.split(" ")[0];
  const m: Mensaje[] = [
    { id: `${s.ref}-m0`, canal: "sistema", de: "sistema", fecha: f(0), texto: `Orden de ${comercialNombre}: contactar al vendedor por llamada, email y WhatsApp, de lunes a viernes de 10:00 a 20:00, con 2 llamadas y 3 recordatorios como máximo.` },
  ];
  if (s.paso >= 2) {
    m.push({ id: `${s.ref}-m1`, canal: "sistema", de: "sistema", fecha: f(0.1), texto: "El sistema revisó Mobilia: la ficha ya tiene tipo, alias y campaña. Faltan 31 datos del bloque General y 6 documentos." });
    m.push({ id: `${s.ref}-m2`, canal: "llamada", de: "sarah", fecha: f(1.5), duracion: `${5 + Math.floor((base / 1000) % 3)}:${String(10 + Math.floor((base / 7000) % 49)).padStart(2, "0")}`, texto: `Aviso de IA al empezar. ${nombre} confirmó superficies, habitaciones, orientación, terrazas y estado. Al final, a la pregunta de los extras, añadió barbacoa y paneles solares. Lo que no sabía queda pendiente.` });
    m.push({ id: `${s.ref}-m3`, canal: "email", de: "sarah", fecha: f(1.7), cc: comercialEmail, texto: `Gracias por su tiempo, ${nombre}. Le dejo el enlace al portal seguro para subir el DNI, la escritura o nota simple, el certificado energético y los recibos de IBI y basuras. El enlace caduca en 7 días.` });
  }
  if (s.paso >= 3) {
    m.push({ id: `${s.ref}-m4`, canal: "whatsapp", de: "vendedor", fecha: f(5), texto: "Le mando el recibo del IBI y el de la basura. La escritura la tengo en el banco, la recojo esta semana." });
    m.push({ id: `${s.ref}-m5`, canal: "whatsapp", de: "sarah", fecha: f(5.05), plantilla: "Confirmación de recepción", texto: "Recibidos los dos recibos, gracias. Ya están en su expediente. Cuando tenga la escritura, puede subirla por el mismo enlace." });
  }
  if (s.paso >= 4) {
    m.push({ id: `${s.ref}-m6`, canal: "sistema", de: "sistema", fecha: f(20), texto: "Escritura recibida por el portal seguro. Lectura: 12 datos extraídos, cada uno con su página." });
  }
  if (s.paso >= 9) {
    m.push({ id: `${s.ref}-m7`, canal: "email", de: "sarah", fecha: f(30), cc: comercialEmail, texto: `Le envío el anuncio de su vivienda para que lo revise antes de publicarlo: título, descripción y fotos. Si algo no le encaja, conteste a este correo y ${comercialNombre} lo corrige.` });
    m.push({ id: `${s.ref}-m8`, canal: "email", de: "vendedor", fecha: f(33), texto: "Lo he leído, está todo correcto. Adelante." });
  }
  return m;
}

const PALABRAS_TIPO: Record<string, string> = { Villa: "villa", "Casa adosada": "casa adosada", Casa: "casa", Piso: "piso", Ático: "ático", Dúplex: "dúplex", Apartamento: "apartamento" };

export function textosDe(s: { tipo: string; poblacion: string; zona: string; m2: number; hab: number; banos: number; familia: Familia }): Textos {
  const t = PALABRAS_TIPO[s.tipo] ?? s.tipo.toLowerCase();
  const casa = s.familia !== "Piso";
  const titulo = `${s.tipo} ${casa ? "con piscina" : "con terraza"} en ${s.zona}, ${s.poblacion}`.slice(0, 50);
  const corta = `${s.tipo} de ${s.m2} m² construidos en ${s.zona}, ${s.poblacion}, con ${s.hab} dormitorios y ${s.banos} baños. ${casa ? "Parcela con jardín, piscina privada y porche cubierto para comer fuera casi todo el año." : "Terraza orientada al sol de la mañana, ascensor y plaza de garaje incluida en el precio."} Una vivienda pensada para vivir con luz natural en cada estancia, a pocos minutos en coche de la playa, del centro y de todos los servicios de la zona.`;
  const ampliada = [
    `Esta ${t} en ${s.zona} reúne lo que más se busca en ${s.poblacion}: luz, tranquilidad y la costa a pocos minutos. Tiene ${s.m2} metros cuadrados construidos según escritura, repartidos para que la vida de día y el descanso queden separados sin perder amplitud.`,
    `La entrada da paso a un salón comedor luminoso, con ventanales que se abren ${casa ? "al porche y a la piscina" : "a la terraza principal"}. La cocina está equipada y tiene ventilación directa, con espacio para comer a diario sin ocupar el comedor.`,
    `La zona de noche reúne ${s.hab} dormitorios, todos con armarios empotrados, y ${s.banos} baños completos. El dormitorio principal tiene su propio baño y una ventana amplia por la que entra el sol de la mañana.`,
    casa
      ? `Fuera, la parcela está ajardinada con plantas mediterráneas de poco riego. La piscina privada queda protegida del viento y rodeada de terraza para tumbarse, y el porche cubierto permite comer fuera desde la primavera hasta bien entrado el otoño. Hay aparcamiento dentro de la parcela para dos coches.`
      : `La terraza es la otra sala de la casa: cabe una mesa para seis personas y un rincón de lectura con vistas despejadas. El edificio tiene ascensor, piscina comunitaria y una plaza de garaje con trastero incluida en el precio.`,
    `Las calidades acompañan: carpintería exterior con doble acristalamiento, suelos claros que mantienen la casa fresca en verano, aire acondicionado por conductos y agua caliente por termo eléctrico. El estado de conservación es bueno y la vivienda se puede habitar desde el primer día.`,
    `En cuanto al entorno, ${s.zona} es una de las zonas más tranquilas de ${s.poblacion}. En pocos minutos se llega en coche a supermercados, colegios, centro de salud y restaurantes, y el aeropuerto de Alicante queda a menos de una hora por la autopista.`,
    `Una vivienda que encaja tanto para vivir todo el año como para pasar largas temporadas junto al mar. Si quiere verla en persona, en nuestra oficina le enseñamos los planos, la documentación y la dejamos abierta para una visita sin prisas, a la hora que mejor le venga.`,
  ].join("\n\n");
  const seoTitulo = `${s.tipo} en venta en ${s.zona}, ${s.poblacion}${casa ? " con piscina" : " con terraza"}`.slice(0, 70);
  const slug = `${s.tipo}-venta-${s.poblacion}-${s.zona}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const seoDesc = `${s.tipo} de ${s.m2} m² en ${s.zona}, ${s.poblacion}: ${s.hab} dormitorios, ${s.banos} baños${casa ? ", jardín y piscina privada" : ", terraza y garaje"}, cerca de la playa.`;
  return { titulo, corta, ampliada, seoTitulo, seoUrl: slug, seoDesc };
}

function registroBase(s: Semilla, base: number, comercialNombre: string): Registro[] {
  const f = (h: number) => new Date(base + h * 3600000).toISOString();
  const r: Registro[] = [
    { id: `${s.ref}-r0`, fecha: f(0), quien: comercialNombre, accion: "Abrió la captación y dio la orden a Sarah", resultado: "info" },
    { id: `${s.ref}-r1`, fecha: f(0.05), quien: "Sistema", accion: `Buscó ${s.calle} en Mobilia antes de crear: ninguna ficha parecida`, pestana: "Inmuebles", resultado: "comprobado" },
  ];
  if (s.paso >= 1) {
    r.push({ id: `${s.ref}-r2`, fecha: f(0.08), quien: "Sistema", accion: `Creó la ficha ${s.ref} y releyó tipo, alias y campaña`, pestana: "Inmuebles", resultado: "comprobado" });
    r.push({ id: `${s.ref}-r3`, fecha: f(0.1), quien: "Sistema", accion: "Vinculó al propietario sin duplicar contactos", pestana: "D. Internos", resultado: "comprobado" });
  }
  if (s.paso > 3) r.push({ id: `${s.ref}-r4`, fecha: f(8), quien: "Sistema", accion: "Escribió 31 campos del bloque General y los releyó uno a uno", pestana: "General", resultado: "comprobado" });
  if (s.paso > 4) r.push({ id: `${s.ref}-r5`, fecha: f(24), quien: "Sistema", accion: "Rellenó D. Internos con la escritura y la nota simple", pestana: "D. Internos", resultado: "comprobado" });
  if (s.paso > 6) r.push({ id: `${s.ref}-r6`, fecha: f(27), quien: "Sistema", accion: "Subió las fotos en el orden fijo y releyó el orden", pestana: "Multimedia", resultado: "comprobado" });
  if (s.paso >= 11) r.push({ id: `${s.ref}-r7`, fecha: f(40), quien: "Dirección", accion: "Aprobó la publicación. Canales marcados con solo la calle y DISPONIBLE al final", pestana: "Publicidad", resultado: "comprobado" });
  return r;
}

function destacadoDe(s: Semilla) {
  if (s.estado === "publicada") return "Ficha completa. Nada pendiente.";
  if (s.paso < 2) return "NO SE PERMITE PUBLICAR. Captación recién abierta.";
  if (s.paso < 5) return "NO SE PERMITE PUBLICAR. Falta la escritura o nota simple y el certificado energético.";
  if (s.paso < 10) return "NO SE PERMITE PUBLICAR. Faltan fotos y la aprobación del vendedor.";
  return "Lista para tu revisión.";
}

export function crearCaptaciones(ahora: number): Captacion[] {
  return SEMILLAS.map((s, i) => {
    const rnd = mulberry32(1000 + i * 37);
    const com = COMERCIALES.find((c) => c.id === s.comercial)!;
    const base = ahora - s.horasAtras * 3600000;
    const fechaDato = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" }).format(new Date(base + 1.5 * 3600000)).replace(".", "");
    const valores = valoresDe(s, rnd, fechaDato);
    const fotosN = s.paso > 6 ? 25 + Math.floor(rnd() * 6) : s.paso === 6 ? 14 : 0;
    const canales: CanalContacto[] = ["llamada", "email", "whatsapp"];
    const publicidad = canalesBase().map((c) =>
      s.estado === "publicada" ? { ...c, marcado: true, direccion: c.direccion === "Zona" ? ("Zona" as const) : ("Solo calle" as const), corregido: c.direccion === "Calle y número" || c.direccion === "Dirección completa" } : c,
    );
    const llamadas = s.paso >= 2 ? Math.min(2, 1 + Math.floor(rnd() * 2)) : 0;
    const recordatorios = s.paso >= 2 ? Math.min(3, Math.floor(rnd() * 3)) : 0;
    const cap: Captacion = {
      id: s.ref.replace("REF ", "c"),
      ref: s.ref,
      alias: `${s.calle.replace(/^(Calle|Avenida|Carretera|Camino|Partida) (de (la |las |los )?|del )?/, "")} · ${s.planta ? `${s.planta}${s.puerta} · ` : ""}${s.vendedor.split(" ").slice(-1)[0]}`,
      familia: s.familia,
      tipo: s.tipo,
      campana: s.campana,
      poblacion: s.poblacion,
      zona: s.zona,
      calle: s.calle,
      numero: s.numero,
      planta: s.planta ?? "",
      puerta: s.puerta ?? "",
      cp: s.cp,
      precioDeseado: s.precio,
      m2: s.m2,
      habitaciones: s.hab,
      banos: s.banos,
      portada: fotoPortada(s, i),
      comercialId: s.comercial,
      vendedor: { nombre: s.vendedor, telefono: s.tel, email: s.email, whatsapp: true, verificado: s.paso >= 1 },
      canales,
      horario: "Lunes a viernes, 10:00 a 20:00",
      maxLlamadas: 2,
      maxRecordatorios: 3,
      llamadas,
      recordatorios,
      fin: new Date(base + 10 * DIAS).toISOString(),
      estado: s.estado,
      paso: s.paso,
      creada: new Date(base).toISOString(),
      actualizada: new Date(Math.min(ahora - 60000 * (5 + i * 7), base + 40 * 3600000)).toISOString(),
      proximoContacto: s.estado === "esperando" || s.estado === "contactando" ? new Date(ahora + (1 + (i % 5)) * 3600000).toISOString() : undefined,
      valores,
      conflictos: [],
      documentos: docs(s, base),
      mensajes: conversacion(s, base, com.nombre, com.email),
      fotos: fotosN ? galeria(s, fotosN, i + 3) : [],
      textos: textosDe({ tipo: s.tipo, poblacion: s.poblacion, zona: s.zona, m2: s.m2, hab: s.hab, banos: s.banos, familia: s.familia }),
      publicidad,
      registro: registroBase(s, base, com.nombre),
      destacado: destacadoDe(s),
      anuncioAprobadoVendedor: s.paso >= 10,
    };
    if (s.estado === "cancelada") cap.motivo = "La vendedora decidió no vender por ahora. Cancelada por el comercial.";
    return especial(cap, ahora, com.nombre, com.email);
  });
}

// Los expedientes con más historia: aquí se ve cada regla del manual funcionando.
function especial(c: Captacion, ahora: number, comercial: string, ccEmail: string): Captacion {
  const h = (horas: number) => new Date(ahora - horas * 3600000).toISOString();
  if (c.ref === "REF 2431") {
    const val = (campo: string) => c.valores.find((x) => x.campo === campo)!;
    val("m² construidos").valor = "128 m²";
    val("m² construidos").detalle = "Escritura, pág. 3 · repuesto tras «Usar datos»";
    val("m² construidos").anterior = null;
    val("m² útiles").valor = "112 m²";
    val("m² útiles").estado = "conflicto";
    val("I.B.I").valor = "742 €/año";
    val("I.B.I").estado = "conflicto";
    val("Hipoteca pendiente").valor = "NO";
    val("Hipoteca pendiente").estado = "conflicto";
    val("Orientación").valor = "Sureste";
    val("Orientación").estado = "propuesta";
    val("Orientación").anterior = "Sur";
    val("Orientación").detalle = "Laura Martín escribió «Sur» en Mobilia. Lo de una persona no se pisa.";
    val("Habitaciones y baños").valor = "3 dormitorios · 2 baños";
    val("Piscina").valor = "Privada";
    val("Año de construcción").valor = "1998";
    val("Certificado energético").valor = "E · 168 kWh/m² año";
    c.registro.push(
      { id: "x1", fecha: h(46), quien: "Sistema", accion: "Pulsó «Consultar Catastro» y «Usar datos»", pestana: "D. Internos", resultado: "info" },
      { id: "x2", fecha: h(46), quien: "Sistema", accion: "Mobilia cambió los m² construidos", campo: "m² construidos", antes: "128 m²", despues: "141 m²", pestana: "General", resultado: "info" },
      { id: "x3", fecha: h(46), quien: "Sistema", accion: "Repuso los m² de la escritura y dejó 141 m² solo en Superficies Catastro", campo: "m² construidos", antes: "141 m²", despues: "128 m²", pestana: "General", resultado: "comprobado" },
      { id: "x4", fecha: h(40), quien: "Sistema", accion: "DNI recibido por WhatsApp: aislado, no se sube desde ahí. Pedido de nuevo por el portal", pestana: "Documentos", resultado: "bloqueado" },
      { id: "x5", fecha: h(31), quien: "Sistema", accion: "Fotocasa venía con «Calle y número»: cambiado a «Solo calle» y releído", pestana: "Publicidad", resultado: "comprobado" },
    );
    c.conflictos = [
      {
        id: "k1", campo: "m² construidos", titulo: "«Usar datos» del Catastro cambió los metros",
        explicacion: "Al pulsar «Usar datos», Mobilia puso 141 m², los del Catastro. La escritura dice 128 m².",
        regla: "Tu regla: manda la escritura. El Catastro queda solo en Superficies Catastro.",
        opciones: [
          { fuente: "documento", valor: "128 m²", detalle: "Escritura, pág. 3" },
          { fuente: "catastro", valor: "141 m²", detalle: "Superficies Catastro" },
        ],
        sugerida: 0, elegida: 0, resuelto: "Aplicado por tu regla y releído",
      },
      {
        id: "k2", campo: "m² útiles", titulo: "La escritura y el vendedor no coinciden",
        explicacion: "La escritura dice 112 m² útiles. El vendedor dijo 115 m² por teléfono, contando el lavadero cerrado.",
        regla: "Propuesta: manda la escritura y la diferencia va al comentario destacado del comercial.",
        opciones: [
          { fuente: "documento", valor: "112 m²", detalle: "Escritura, pág. 3" },
          { fuente: "vendedor", valor: "115 m²", detalle: "Llamada de Sarah" },
        ],
        sugerida: 0,
      },
      {
        id: "k3", campo: "Hipoteca pendiente", titulo: "El vendedor dice «NO», la nota simple muestra una carga",
        explicacion: "La nota simple tiene inscrita una hipoteca de 2019. Es frecuente que ya esté pagada y nadie la haya cancelado en el Registro, pero eso solo lo aclara un certificado del banco.",
        regla: "Dato crítico: lo decides tú. Nada se publica con esta duda abierta.",
        opciones: [
          { fuente: "documento", valor: "Sí, carga inscrita", detalle: "Nota simple, pág. 2" },
          { fuente: "vendedor", valor: "NO, y pedir certificado de deuda cero", detalle: "Llamada de Sarah" },
        ],
        sugerida: 1,
      },
      {
        id: "k4", campo: "I.B.I", titulo: "Recibo anual y cifra mensual",
        explicacion: "El recibo del IBI es de 742 € al año. El vendedor dijo «unos 62 al mes», que son 744 € al año: coinciden, solo cambia la periodicidad.",
        regla: "Se guarda el importe anual del recibo y se señala la diferencia.",
        opciones: [
          { fuente: "documento", valor: "742 €/año", detalle: "Recibo de IBI 2026" },
          { fuente: "vendedor", valor: "62 €/mes", detalle: "WhatsApp del vendedor" },
        ],
        sugerida: 0,
      },
    ];
    c.documentos = c.documentos.map((d) =>
      d.tipo === "DNI del vendedor"
        ? { ...d, nota: "Llegó primero por WhatsApp: se aisló y se pidió de nuevo por el portal. El de la ficha es el del portal." }
        : d.tipo === "Cédula de habitabilidad"
          ? { ...d, estado: "pendiente", fecha: undefined, archivo: undefined, extraidos: undefined, nota: "El vendedor la está pidiendo al ayuntamiento." }
          : d,
    );
    c.documentos.push({ id: "aislado-1", tipo: "DNI del vendedor", canal: "whatsapp", estado: "aislado", fecha: h(40), paginas: 1, carpeta: "Perfil del cliente", nota: "Foto del DNI enviada por WhatsApp. No se sube a ninguna ficha y se borra en el plazo acordado." });
    c.fotos = galeria(c, 24, 11);
    c.mensajes.splice(4, 0, {
      id: "m-dni", canal: "whatsapp", de: "vendedor", fecha: h(40), texto: "[Foto del DNI]",
    }, {
      id: "m-dni2", canal: "whatsapp", de: "sarah", fecha: h(39.9), plantilla: "Documento sensible", texto: "Gracias, Gerhard. Por seguridad el DNI no lo guardamos desde WhatsApp. Puede subirlo por el portal seguro? Es el mismo enlace del correo.",
    });
    c.destacado = "Falta 1 foto para llegar a 25. Cédula pendiente. Hipoteca: la nota simple muestra una carga inscrita.";
    c.textos = {
      titulo: "Villa con piscina y vistas al Montgó, Cap Martí",
      corta: c.textos.corta,
      ampliada: c.textos.ampliada,
      seoTitulo: "Villa en venta en Cap Martí, Jávea, con piscina y vistas",
      seoUrl: "villa-venta-javea-cap-marti",
      seoDesc: "Villa de 128 m² en Cap Martí, Jávea: 3 dormitorios, 2 baños, jardín y piscina privada con vistas al Montgó, cerca de la playa del Arenal.",
    };
    c.publicidad = c.publicidad.map((p) => (p.id === "fotocasa" ? { ...p, direccion: "Solo calle", corregido: true } : p.id === "idealista" ? { ...p, direccion: "Solo calle", corregido: true } : p));
    c.llamadas = 2;
    c.recordatorios = 2;
  }
  if (c.ref === "REF 2427") {
    c.textos = { ...c.textos, ampliada: c.textos.ampliada.replace("La entrada da paso", "Situado en la 3ª planta de un edificio con ascensor, la entrada da paso") };
    c.destacado = "La descripción ampliada menciona la planta. No se publica hasta corregirla.";
  }
  if (c.ref === "REF 2436") {
    c.llamadas = 1;
    c.recordatorios = 2;
    c.mensajes = [
      c.mensajes[0],
      c.mensajes[1],
      { id: "a1", canal: "llamada", de: "sarah", fecha: h(27), duracion: "0:00", texto: "Llamada sin respuesta. Siguiente intento por escrito, para no insistir por el mismo canal." },
      { id: "a2", canal: "whatsapp", de: "sarah", fecha: h(26.8), plantilla: "Primer contacto", texto: `Hola, soy Sarah, la asistente de inteligencia artificial de ${MARCA.agencia}. Le escribo de parte de ${comercial} por la venta de su ático en Cap Negret. Para preparar el anuncio me faltan algunos datos: le dejo también un correo con el enlace para los documentos.` },
      { id: "a3", canal: "email", de: "sarah", fecha: h(26.7), cc: ccEmail, texto: "Le adjunto el enlace al portal seguro para subir el DNI, la escritura y los recibos. Si prefiere que la llamemos, dígame a qué hora le viene mejor." },
      { id: "a4", canal: "whatsapp", de: "vendedor", fecha: h(8), texto: "Hola Sarah, estoy en Inglaterra hasta el jueves. Les mando la escritura cuando vuelva. El ático tiene 112 metros y dos terrazas." },
      { id: "a5", canal: "whatsapp", de: "sarah", fecha: h(7.9), plantilla: "Confirmación de recepción", texto: "Gracias, Susan. Apunto los 112 metros y las dos terrazas. Le recuerdo lo de la escritura el viernes por la mañana." },
    ];
    c.proximoContacto = new Date(ahora + 2.5 * 3600000).toISOString();
  }
  if (c.ref === "REF 2412") {
    c.recordatorios = 3;
    c.llamadas = 2;
    c.motivo = "Captación bloqueada: falta la nota simple. Sarah llegó al límite de 3 recordatorios y dejó de insistir.";
  }
  if (c.ref === "REF 2419") {
    c.estadoAntesPausa = "esperando";
    c.motivo = "La vendedora escribió «BAJA» por WhatsApp. Se paró todo el circuito y se creó una tarea para ti.";
    c.vendedor = { ...c.vendedor, baja: true };
    c.mensajes.push({ id: "b1", canal: "whatsapp", de: "vendedor", fecha: h(20), texto: "BAJA" }, { id: "b2", canal: "sistema", de: "sistema", fecha: h(20), texto: "Baja recibida. Sarah no volverá a contactar a la vendedora. Los 2 recordatorios que estaban en cola no se enviaron." });
  }
  return c;
}
