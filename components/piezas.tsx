"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, Mail, MessageCircle, Phone, Plus } from "lucide-react";
import type { Captacion, CanalContacto, Estado, Familia } from "@/lib/types";
import { ESTADOS, PASOS } from "@/lib/manual";
import { useStore, type NuevaCaptacion } from "@/lib/store";
import { Badge, Boton, Campo, Drawer, Aviso } from "./ui";
import { precio } from "@/lib/format";

export function EstadoBadge({ estado }: { estado: Estado }) {
  const e = ESTADOS[estado];
  return (
    <Badge tono={e.tono} punto>
      {e.texto}
    </Badge>
  );
}

export function IconoCanal({ canal, size = 15 }: { canal: CanalContacto | "sistema"; size?: number }) {
  if (canal === "llamada") return <Phone size={size} />;
  if (canal === "email") return <Mail size={size} />;
  if (canal === "whatsapp") return <MessageCircle size={size} />;
  return <Bot size={size} />;
}

export function Progreso({ c }: { c: Captacion }) {
  const total = PASOS.length;
  const hechos = Math.min(c.paso, total);
  return (
    <div className="progreso" title={`Paso ${Math.min(c.paso + 1, total)} de ${total}: ${PASOS[Math.min(c.paso, total - 1)].nombre}`}>
      {PASOS.map((p, i) => (
        <i key={p.id} className={i < hechos ? "hecho" : i === c.paso && c.estado !== "publicada" ? "ahora" : ""} />
      ))}
    </div>
  );
}

export function FichaMini({ c, nombreComercial, fotoComercial }: { c: Captacion; nombreComercial: string; fotoComercial: string }) {
  return (
    <Link href={`/captaciones/${c.id}`} className="ficha-mini">
      <div className="fm-foto">
        {c.portada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.portada} alt={`${c.tipo} en ${c.zona}`} loading="lazy" width={320} height={220} />
        ) : (
          <span className="fm-foto-vacia" />
        )}
        <span className="fm-ref">{c.ref}</span>
      </div>
      <div className="fm-cuerpo">
        <strong>
          {c.tipo} en {c.zona}
        </strong>
        <small>
          {c.poblacion} · {precio(c.precioDeseado)}
        </small>
        <Progreso c={c} />
        <div className="fm-pie">
          <EstadoBadge estado={c.estado} />
          {fotoComercial && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="avatar" src={fotoComercial} alt={nombreComercial} title={nombreComercial} width={26} height={26} style={{ width: 26, height: 26 }} loading="lazy" />
          )}
        </div>
      </div>
    </Link>
  );
}

const TIPOS: Record<Familia, string[]> = {
  Piso: ["Piso", "Ático", "Dúplex", "Apartamento", "Estudio"],
  "Casa o Villa": ["Villa", "Casa", "Casa adosada", "Chalet", "Finca"],
};
const POBLACIONES = ["Jávea", "Moraira", "Dénia", "Calpe", "Altea", "Benissa", "Teulada"];
const CAMPANAS = ["Idealista", "Llamada", "Oficina", "Cartel", "Cliente conocido", "Colaborador", "Kyero", "Fotocasa"];

export function BotonNueva({ texto = "Nueva captación", tono = "primario" as const }: { texto?: string; tono?: "primario" | "secundario" }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <Boton tono={tono} icono={<Plus size={17} />} onClick={() => setAbierto(true)}>
        {texto}
      </Boton>
      <NuevaCaptacionDrawer abierto={abierto} onCerrar={() => setAbierto(false)} />
    </>
  );
}

export function NuevaCaptacionDrawer({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { crearCaptacion, comerciales, vista, esDireccion, ajustes, pausaGeneral } = useStore();
  const router = useRouter();
  const vacio: NuevaCaptacion = {
    familia: "Casa o Villa",
    tipo: "Villa",
    poblacion: "Jávea",
    zona: "",
    calle: "",
    campana: "Llamada",
    vendedor: "",
    telefono: "",
    email: "",
    canales: ["llamada", "email", "whatsapp"],
    maxLlamadas: ajustes.maxLlamadas,
    maxRecordatorios: ajustes.maxRecordatorios,
    comercialId: esDireccion ? "c1" : vista,
    precio: 0,
  };
  const [f, setF] = useState<NuevaCaptacion>(vacio);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const set = <K extends keyof NuevaCaptacion>(k: K, v: NuevaCaptacion[K]) => setF((x) => ({ ...x, [k]: v }));

  const validar = () => {
    const e: Record<string, string> = {};
    if (!f.zona.trim()) e.zona = "La zona hace falta para elegirla de la lista de Mobilia";
    if (!f.calle.trim()) e.calle = "Con la calle el sistema busca si la ficha ya existe";
    if (!f.vendedor.trim()) e.vendedor = "Nombre del vendedor";
    if (f.canales.includes("llamada") || f.canales.includes("whatsapp")) {
      if (!/^\+?\d[\d\s]{8,}$/.test(f.telefono.trim())) e.telefono = "Teléfono con prefijo, por ejemplo +34 611 204 318";
    }
    if (f.canales.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Email no válido";
    if (!f.canales.length) e.canales = "Elige al menos un canal";
    if (!f.precio || f.precio < 10000) e.precio = "Precio que pide el vendedor, en euros";
    return e;
  };

  const enviar = async () => {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    setEnviando(true);
    const id = await crearCaptacion(f);
    setEnviando(false);
    setF(vacio);
    onCerrar();
    router.push(`/captaciones/${id}`);
  };

  const toggleCanal = (c: CanalContacto) => set("canales", f.canales.includes(c) ? f.canales.filter((x) => x !== c) : [...f.canales, c]);

  return (
    <Drawer
      abierto={abierto}
      titulo="Nueva captación"
      sub="La orden a Sarah: a quién, por dónde, cuándo y cuántas veces"
      onCerrar={onCerrar}
      pie={
        <>
          <button className="btn btn-ghost" onClick={onCerrar}>
            Cancelar
          </button>
          <Boton cargando={enviando} onClick={enviar} icono={<Phone size={16} />}>
            Dar la orden a Sarah
          </Boton>
        </>
      }
    >
      <div className="form-col">
        {pausaGeneral && <Aviso tono="aviso">El sistema está en pausa general. La captación se crea, pero Sarah no contactará hasta que lo reanudes.</Aviso>}
        <div className="seg" role="radiogroup" aria-label="Familia">
          {(["Casa o Villa", "Piso"] as Familia[]).map((fam) => (
            <button key={fam} type="button" className={`seg-op ${f.familia === fam ? "on" : ""}`} onClick={() => setF((x) => ({ ...x, familia: fam, tipo: TIPOS[fam][0] }))} role="radio" aria-checked={f.familia === fam}>
              {fam}
            </button>
          ))}
        </div>
        <div className="form-grid">
          <Campo etiqueta="Tipo">
            <select className="select" value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
              {TIPOS[f.familia].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Campaña (origen)">
            <select className="select" value={f.campana} onChange={(e) => set("campana", e.target.value)}>
              {CAMPANAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Población">
            <select className="select" value={f.poblacion} onChange={(e) => set("poblacion", e.target.value)}>
              {POBLACIONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Zona" error={errores.zona}>
            <input className="input" value={f.zona} onChange={(e) => set("zona", e.target.value)} placeholder="Cap Martí, Arenal, Montgó..." />
          </Campo>
        </div>
        <Campo etiqueta="Calle" error={errores.calle} ayuda="Solo para buscar en Mobilia y para el alias. Nunca se publica con número.">
          <input className="input" value={f.calle} onChange={(e) => set("calle", e.target.value)} placeholder="Calle Lepanto" />
        </Campo>
        <Campo etiqueta="Precio que pide el vendedor" error={errores.precio} ayuda="El precio publicado lo fijas tú o el comercial, nunca Sarah.">
          <input className="input" inputMode="numeric" value={f.precio ? String(f.precio) : ""} onChange={(e) => set("precio", Number(e.target.value.replace(/\D/g, "")) || 0)} placeholder="450000" />
        </Campo>
        <div className="sep-form">Vendedor</div>
        <Campo etiqueta="Nombre" error={errores.vendedor}>
          <input className="input" value={f.vendedor} onChange={(e) => set("vendedor", e.target.value)} placeholder="Nombre y apellidos" />
        </Campo>
        <div className="form-grid">
          <Campo etiqueta="Teléfono y WhatsApp" error={errores.telefono}>
            <input className="input" value={f.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="+34 6..." />
          </Campo>
          <Campo etiqueta="Email" error={errores.email}>
            <input className="input" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="nombre@correo.es" />
          </Campo>
        </div>
        <div className="sep-form">La orden</div>
        <div className="canales-orden">
          {(["llamada", "email", "whatsapp"] as CanalContacto[]).map((c) => (
            <button key={c} type="button" className={`chip-canal ${f.canales.includes(c) ? "on" : ""}`} onClick={() => toggleCanal(c)} aria-pressed={f.canales.includes(c)}>
              <IconoCanal canal={c} size={16} />
              {c === "llamada" ? "Llamada" : c === "email" ? "Email" : "WhatsApp"}
            </button>
          ))}
        </div>
        {errores.canales && <span className="campo-error">{errores.canales}</span>}
        <div className="form-grid">
          <Campo etiqueta="Llamadas como máximo">
            <select className="select" value={f.maxLlamadas} onChange={(e) => set("maxLlamadas", Number(e.target.value))}>
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Recordatorios como máximo">
            <select className="select" value={f.maxRecordatorios} onChange={(e) => set("maxRecordatorios", Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Campo>
        </div>
        {esDireccion && (
          <Campo etiqueta="Comercial responsable" ayuda="Va en copia visible de todos los emails de esta propiedad. La copia la pone el programa, no la IA.">
            <select className="select" value={f.comercialId} onChange={(e) => set("comercialId", e.target.value)}>
              {comerciales.filter((c) => c.activo).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </Campo>
        )}
        <p className="muted pequeno">
          Horario de contacto: {ajustes.horarioContacto.dias.toLowerCase()}, de {ajustes.horarioContacto.desde} a {ajustes.horarioContacto.hasta}. Antes de escribir, el sistema mira en Mobilia qué ya consta y Sarah no lo pregunta.
        </p>
      </div>
    </Drawer>
  );
}
