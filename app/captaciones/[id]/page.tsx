"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, BadgeCheck, CalendarClock, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, FileText, History, ImagePlus, KeyRound, Loader2,
  Lock, MapPin, Megaphone, MessageSquare, OctagonPause, Pencil, Play, Route, Scale, ShieldCheck, Trash2, Undo2, Upload, X,
} from "lucide-react";
import { useStore, bloqueosDisponible } from "@/lib/store";
import { Maqueta } from "@/components/three/Scenes";
import { EstadoBadge, IconoCanal, Progreso } from "@/components/piezas";
import { Aviso, Badge, Boton, Campo, Modal, Skel, Tilt, Vacio } from "@/components/ui";
import { FUENTE_TXT, LIMITES, PASOS } from "@/lib/manual";
import { cuandoFue, fechaCorta, haceCuanto, hora, palabras, precio, revelaDireccion } from "@/lib/format";
import type { Captacion, Valor } from "@/lib/types";

type Tab = "recorrido" | "ficha" | "conflictos" | "documentos" | "conversaciones" | "fotos" | "anuncio" | "publicidad" | "historial";

function Expediente() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const st = useStore();
  const { listo, captaciones, comerciales, tick, pausaGeneral, puedeAprobar, esDireccion, vista } = st;
  const c = captaciones.find((x) => x.id === id);
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "recorrido");
  const [aprobarAbierto, setAprobarAbierto] = useState(false);
  const [cancelarAbierto, setCancelarAbierto] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const t = params.get("tab") as Tab | null;
    if (t) setTab(t);
  }, [params]);

  if (!listo) {
    return (
      <div className="form-col">
        <Skel alto={120} />
        <Skel alto={44} />
        <Skel alto={420} />
      </div>
    );
  }
  if (!c) {
    return <Vacio icono={<CircleSlash size={26} />} titulo="Esta captación no existe" texto="Puede que se haya creado en otra sesión. Vuelve a la lista." accion={<Link className="btn btn-secundario" href="/captaciones">Ver captaciones</Link>} />;
  }
  if (!esDireccion && c.comercialId !== vista) {
    return <Vacio icono={<Lock size={26} />} titulo="Esta propiedad es de otro comercial" texto="Cada comercial solo ve y gestiona sus propiedades. El permiso se comprueba en el servidor, no solo en la pantalla." accion={<Link className="btn btn-secundario" href="/captaciones">Mis captaciones</Link>} />;
  }

  const com = comerciales.find((x) => x.id === c.comercialId);
  const bloqueos = bloqueosDisponible(c);
  const conflictosAbiertos = c.conflictos.filter((k) => k.elegida === undefined).length;
  const pausada = c.estado === "pausada";
  const terminada = c.estado === "publicada" || c.estado === "cancelada";

  const pausar = async () => {
    setOcupado(true);
    if (pausada) await st.reanudar(c.id);
    else await st.pausar(c.id);
    setOcupado(false);
  };

  const TABS: { id: Tab; t: string; ic: React.ReactNode; n?: number }[] = [
    { id: "recorrido", t: "Recorrido", ic: <Route size={16} /> },
    { id: "ficha", t: "Ficha", ic: <FileText size={16} /> },
    { id: "conflictos", t: "Conflictos", ic: <Scale size={16} />, n: conflictosAbiertos },
    { id: "documentos", t: "Documentos", ic: <KeyRound size={16} /> },
    { id: "conversaciones", t: "Conversaciones", ic: <MessageSquare size={16} /> },
    { id: "fotos", t: "Fotos", ic: <ImagePlus size={16} /> },
    { id: "anuncio", t: "Anuncio y SEO", ic: <Pencil size={16} /> },
    { id: "publicidad", t: "Publicidad", ic: <Megaphone size={16} /> },
    { id: "historial", t: "Historial", ic: <History size={16} /> },
  ];

  return (
    <>
      <Link href="/captaciones" className="volver">
        <ArrowLeft size={16} /> Captaciones
      </Link>
      <section className="exp-cab card">
        <div className="exp-foto">
          {c.portada ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.portada} alt={`${c.tipo} en ${c.zona}`} width={300} height={210} />
          ) : (
            <span className="fm-foto-vacia" />
          )}
        </div>
        <div className="exp-datos">
          <div className="exp-tit">
            <span className="exp-ref">{c.ref}</span>
            <EstadoBadge estado={c.estado} />
          </div>
          <h1>
            {c.tipo} en {c.zona}, {c.poblacion}
          </h1>
          <p className="muted">
            Alias en Mobilia: <strong>{c.alias}</strong> · Campaña: {c.campana} · Pide {precio(c.precioDeseado)}
          </p>
          <div className="exp-gente">
            {com && (
              <span className="persona">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="avatar" src={com.foto} alt="" width={28} height={28} style={{ width: 28, height: 28 }} />
                <span>
                  <small>Comercial y captador</small>
                  <strong>{com.nombre}</strong>
                </span>
              </span>
            )}
            <span className="persona">
              <span className="persona-ic">
                <KeyRound size={15} />
              </span>
              <span>
                <small>Vendedor</small>
                <strong>{c.vendedor.nombre}</strong>
              </span>
            </span>
          </div>
          <Progreso c={c} />
          {c.motivo && (
            <Aviso tono={c.estado === "cancelada" || c.vendedor.baja ? "error" : "aviso"}>{c.motivo}</Aviso>
          )}
        </div>
        <div className="exp-acc">
          {!terminada && (
            <Boton tono="secundario" cargando={ocupado} onClick={pausar} icono={pausada ? <Play size={16} /> : <OctagonPause size={16} />}>
              {pausada ? "Reanudar" : "Pausar"}
            </Boton>
          )}
          {!terminada && (
            <button className="btn btn-ghost" onClick={() => setCancelarAbierto(true)}>
              <X size={16} />
              <span>Cancelar</span>
            </button>
          )}
          {c.estado === "revisar" && (
            <button className="btn btn-primario btn-aprobar" disabled={!puedeAprobar || !!bloqueos.length} onClick={() => setAprobarAbierto(true)} title={!puedeAprobar ? "Solo dirección o comerciales con permiso" : bloqueos[0]}>
              <BadgeCheck size={17} />
              <span>Aprobar y publicar</span>
            </button>
          )}
        </div>
      </section>

      <div className="exp-layout">
        <div className="exp-main">
          <div className="tabs tabs-scroll" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`tab ${tab === t.id ? "on" : ""}`}
                onClick={() => {
                  setTab(t.id);
                  router.replace(`/captaciones/${c.id}?tab=${t.id}`, { scroll: false });
                }}
              >
                {t.ic}
                <span>{t.t}</span>
                {!!t.n && <em className="tab-n">{t.n}</em>}
              </button>
            ))}
          </div>
          <div className="tab-panel" key={tab}>
            {tab === "recorrido" && <Recorrido c={c} />}
            {tab === "ficha" && <Ficha c={c} />}
            {tab === "conflictos" && <Conflictos c={c} />}
            {tab === "documentos" && <Documentos c={c} />}
            {tab === "conversaciones" && <Conversaciones c={c} />}
            {tab === "fotos" && <Fotos c={c} />}
            {tab === "anuncio" && <Anuncio c={c} />}
            {tab === "publicidad" && <Publicidad c={c} />}
            {tab === "historial" && <Historial c={c} />}
          </div>
        </div>

        <aside className="exp-lado">
          <div className="card maqueta-card">
            <div className="maqueta-box">
              <Maqueta paso={c.paso} fotos={c.fotos.slice(0, 6).map((f) => f.src)} canales={c.publicidad.filter((p) => p.marcado).length} pausada={pausada || pausaGeneral} casa={c.familia !== "Piso"} compacta />
            </div>
            <p className="muted pequeno">La maqueta se levanta con cada paso que queda escrito y releído en Mobilia.</p>
          </div>
          <div className="card">
            <h3 className="lado-tit">Para marcar DISPONIBLE</h3>
            {c.estado === "publicada" ? (
              <Aviso tono="ok">Publicada en los 14 canales con solo la calle. DISPONIBLE fue lo último.</Aviso>
            ) : bloqueos.length ? (
              <ul className="bloqueos">
                {bloqueos.map((b) => (
                  <li key={b}>
                    <CircleSlash size={15} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Aviso tono="ok">Todo cumple la sección 6.12 del manual. Falta solo tu aprobación.</Aviso>
            )}
          </div>
          <div className="card destacado">
            <h3 className="lado-tit">Comentario destacado en Mobilia</h3>
            <p>{c.destacado}</p>
          </div>
          <div className="card">
            <h3 className="lado-tit">La orden</h3>
            <div className="orden-lista">
              <span>
                <small>Canales</small>
                <strong className="canales-ic">
                  {c.canales.map((x) => (
                    <IconoCanal key={x} canal={x} />
                  ))}
                </strong>
              </span>
              <span>
                <small>Horario</small>
                <strong>{c.horario}</strong>
              </span>
              <span>
                <small>Llamadas</small>
                <strong>
                  {c.llamadas} de {c.maxLlamadas}
                </strong>
              </span>
              <span>
                <small>Recordatorios</small>
                <strong>
                  {c.recordatorios} de {c.maxRecordatorios}
                </strong>
              </span>
              <span>
                <small>Hasta</small>
                <strong>{fechaCorta(c.fin)}</strong>
              </span>
              {c.proximoContacto && c.estado !== "pausada" && !pausaGeneral && (
                <span>
                  <small>Próximo contacto</small>
                  <strong>{hora(c.proximoContacto)}, {haceCuanto(c.proximoContacto, tick)}</strong>
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>

      <AprobarModal c={c} abierto={aprobarAbierto} onCerrar={() => setAprobarAbierto(false)} />
      <CancelarModal c={c} abierto={cancelarAbierto} onCerrar={() => setCancelarAbierto(false)} />
    </>
  );
}

function Recorrido({ c }: { c: Captacion }) {
  const { tick } = useStore();
  const momento = (pestana: string) => {
    const r = [...c.registro].reverse().find((x) => x.pestana === pestana && x.resultado === "comprobado");
    return r ? cuandoFue(r.fecha, tick) : "";
  };
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>El orden de tu manual</h2>
          <p className="muted">Un paso no empieza si el anterior tiene un bloqueo abierto.</p>
        </div>
      </header>
      <ol className="pasos">
        {PASOS.map((p, i) => {
          const hecho = i < c.paso || c.estado === "publicada";
          const ahora = i === c.paso && c.estado !== "publicada";
          const bloq = ahora && (c.estado === "documentacion" || c.estado === "pausada" || (i === 10 && bloqueosDisponible(c).length > 0));
          return (
            <li key={p.id} className={`paso-m ${hecho ? "hecho" : ahora ? (bloq ? "bloq" : "ahora") : ""}`} style={{ animationDelay: `${i * 40}ms` }}>
              <span className="pm-n">{hecho ? <Check size={15} /> : i + 1}</span>
              <div className="pm-txt">
                <strong>{p.nombre}</strong>
                <small>{p.texto}</small>
              </div>
              <span className="pm-der">
                <Badge tono="neutro">{p.pestana}</Badge>
                {hecho && momento(p.pestana) && <small className="muted">{momento(p.pestana)}</small>}
                {ahora && !bloq && <Badge tono="acento" punto>En curso</Badge>}
                {bloq && <Badge tono="aviso">Esperando</Badge>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FuenteBadge({ v }: { v: Valor }) {
  const tono = v.fuente === "documento" ? "info" : v.fuente === "vendedor" ? "acento" : v.fuente === "catastro" ? "aviso" : "neutro";
  return <Badge tono={tono}>{FUENTE_TXT[v.fuente]}</Badge>;
}

function Ficha({ c }: { c: Captacion }) {
  const st = useStore();
  const [filtro, setFiltro] = useState<"todo" | "pend">("todo");
  const [editando, setEditando] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const bloques: Valor["bloque"][] = ["General", "D. Internos", "Registro"];
  const correr = async (vid: string, fn: () => Promise<void>) => {
    setTrabajando(vid);
    await fn();
    setTrabajando(null);
  };
  const comprobados = c.valores.filter((v) => v.estado === "comprobado").length;
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>Ficha en Mobilia, dato a dato</h2>
          <p className="muted">
            {comprobados} de {c.valores.length} datos escritos y releídos. Cada uno guarda de dónde salió y el valor que había antes.
          </p>
        </div>
        <div className="seg seg-sm">
          <button className={`seg-op ${filtro === "todo" ? "on" : ""}`} onClick={() => setFiltro("todo")}>Todo</button>
          <button className={`seg-op ${filtro === "pend" ? "on" : ""}`} onClick={() => setFiltro("pend")}>Por resolver</button>
        </div>
      </header>
      {bloques.map((b) => {
        const filas = c.valores.filter((v) => v.bloque === b && (filtro === "todo" || v.estado !== "comprobado"));
        if (!filas.length) return null;
        return (
          <div key={b} className="bloque">
            <h3 className="bloque-tit">{b === "Registro" ? "Datos del Registro" : `Bloque ${b}`}</h3>
            <div className="valores">
              {filas.map((v) => (
                <div key={v.id} className={`valor v-${v.estado.replace(" ", "-")}`}>
                  <div className="v-campo">
                    <strong>{v.campo}</strong>
                    {v.critico && <small className="critico">Dato crítico</small>}
                  </div>
                  <div className="v-valor">
                    {editando === v.id ? (
                      <form
                        className="v-edit"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!texto.trim()) return;
                          setEditando(null);
                          await correr(v.id, () => st.editarValor(c.id, v.id, texto.trim()));
                        }}
                      >
                        <input className="input" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} aria-label={`Nuevo valor de ${v.campo}`} />
                        <button className="icon-btn sm" type="submit" aria-label="Guardar"><Check size={15} /></button>
                        <button className="icon-btn sm" type="button" onClick={() => setEditando(null)} aria-label="Cancelar"><X size={15} /></button>
                      </form>
                    ) : (
                      <>
                        <span className="v-dato">{v.estado === "pendiente" ? <em className="muted">pendiente</em> : v.valor || <em className="muted">vacío</em>}</span>
                        {!!v.anterior && v.anterior !== v.valor && v.estado !== "pendiente" && (
                          <small className="v-antes">
                            {v.estado === "propuesta" ? "En Mobilia: " : "Antes: "}
                            {v.anterior || "vacío"}
                          </small>
                        )}
                      </>
                    )}
                  </div>
                  <div className="v-fuente">
                    <FuenteBadge v={v} />
                    <small>{v.detalle}</small>
                  </div>
                  <div className="v-estado">
                    {trabajando === v.id || v.estado === "escribiendo" ? (
                      <span className="est est-escr"><Loader2 size={14} className="spin" /> Escribiendo y releyendo</span>
                    ) : v.estado === "comprobado" ? (
                      <span className="est est-ok"><CheckCircle2 size={14} /> Releído</span>
                    ) : v.estado === "conflicto" ? (
                      <button className="est est-conf" onClick={() => st.toast("Abre la pestaña Conflictos para decidir", "info")}><Scale size={14} /> En conflicto</button>
                    ) : v.estado === "propuesta" ? (
                      <span className="est est-prop">Propuesta</span>
                    ) : (
                      <span className="est est-pend">Sarah lo pide</span>
                    )}
                  </div>
                  <div className="v-acc">
                    {v.estado === "propuesta" && v.anterior ? (
                      <>
                        <button className="btn btn-sm btn-secundario" disabled={!!trabajando} onClick={() => correr(v.id, () => st.aceptarPropuesta(c.id, v.id, true))}>Usar propuesta</button>
                        <button className="btn btn-sm btn-ghost" disabled={!!trabajando} onClick={() => correr(v.id, () => st.aceptarPropuesta(c.id, v.id, false))}>Mantener</button>
                      </>
                    ) : (
                      <>
                        {v.estado === "comprobado" && v.anterior !== undefined && v.anterior !== null && v.anterior !== v.valor && (
                          <button className="icon-btn sm" title="Deshacer: vuelve a poner el valor anterior en Mobilia" aria-label={`Deshacer ${v.campo}`} disabled={!!trabajando} onClick={() => correr(v.id, () => st.deshacer(c.id, v.id))}>
                            <Undo2 size={15} />
                          </button>
                        )}
                        {v.estado !== "conflicto" && (
                          <button className="icon-btn sm" title="Corregir" aria-label={`Corregir ${v.campo}`} disabled={!!trabajando} onClick={() => { setEditando(v.id); setTexto(v.valor); }}>
                            <Pencil size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {filtro === "pend" && c.valores.every((v) => v.estado === "comprobado") && <Vacio icono={<CheckCircle2 size={26} />} titulo="Nada por resolver" texto="Todos los datos están escritos y releídos." />}
    </div>
  );
}

function Conflictos({ c }: { c: Captacion }) {
  const st = useStore();
  const [eleccion, setEleccion] = useState<Record<string, number>>({});
  const [trabajando, setTrabajando] = useState<string | null>(null);
  if (!c.conflictos.length) return <div className="card"><Vacio icono={<Scale size={26} />} titulo="Sin conflictos" texto="Vendedor, documentos, Catastro y ficha coinciden en todo lo leído hasta ahora." /></div>;
  return (
    <div className="form-col">
      <Aviso tono="info">Cuando dos fuentes no coinciden se guardan las dos y la diferencia viene aquí. El modelo nunca elige por intuición: la prioridad la fijas tú.</Aviso>
      {c.conflictos.map((k, i) => {
        const elegida = k.elegida ?? eleccion[k.id] ?? k.sugerida;
        const resuelto = k.elegida !== undefined;
        return (
          <div key={k.id} className={`card conflicto ${resuelto ? "resuelto" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
            <header className="card-head">
              <div>
                <span className="eyebrow">{k.campo}</span>
                <h3>{k.titulo}</h3>
              </div>
              {resuelto ? <Badge tono="ok" punto>{k.resuelto ?? "Resuelto"}</Badge> : <Badge tono="apoyo" punto>Te toca decidir</Badge>}
            </header>
            <p>{k.explicacion}</p>
            <div className="opciones-k">
              {k.opciones.map((o, j) => (
                <Tilt key={j} className="op-tilt">
                  <button className={`op-k ${elegida === j ? "on" : ""}`} disabled={resuelto} onClick={() => setEleccion((e) => ({ ...e, [k.id]: j }))} aria-pressed={elegida === j}>
                    <span className="op-k-fuente">{FUENTE_TXT[o.fuente]}{j === k.sugerida && <em>Tu regla</em>}</span>
                    <strong>{o.valor}</strong>
                    <small>{o.detalle}</small>
                  </button>
                </Tilt>
              ))}
            </div>
            <p className="muted pequeno"><ShieldCheck size={13} style={{ verticalAlign: "-2px" }} /> {k.regla}</p>
            {!resuelto && (
              <div className="fila-der">
                <Boton
                  cargando={trabajando === k.id}
                  onClick={async () => {
                    setTrabajando(k.id);
                    await st.resolverConflicto(c.id, k.id, elegida);
                    setTrabajando(null);
                  }}
                  icono={<Check size={16} />}
                >
                  Decidir y escribir en Mobilia
                </Boton>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Documentos({ c }: { c: Captacion }) {
  const st = useStore();
  const [enviando, setEnviando] = useState(false);
  const canalTxt = { portal: "Portal seguro", email: "Email", whatsapp: "WhatsApp", comercial: "Comercial" } as const;
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>Documentos</h2>
          <p className="muted">El original se sube sin tocar, con nombre uniforme, y se comprueba que quedó subido.</p>
        </div>
        <Boton
          tono="secundario"
          cargando={enviando}
          icono={<Upload size={16} />}
          onClick={async () => {
            setEnviando(true);
            await new Promise((r) => setTimeout(r, 900));
            setEnviando(false);
            st.toast("Enlace nuevo del portal enviado por email con copia al comercial. Caduca en 7 días");
          }}
        >
          Reenviar enlace del portal
        </Boton>
      </header>
      <Aviso tono="info">El DNI solo entra por el portal seguro y va al perfil del cliente. Si llega por WhatsApp o email, se aísla y se pide de nuevo por el portal. «Archivos públicos» de Multimedia sigue vacío: Mobilia lo publica en la web.</Aviso>
      <div className="docs">
        {c.documentos.map((d, i) => (
          <div key={d.id} className={`doc doc-${d.estado}`} style={{ animationDelay: `${i * 40}ms` }}>
            <span className="doc-ic"><FileText size={18} /></span>
            <div className="doc-txt">
              <strong>{d.tipo}</strong>
              <small>
                {d.estado === "pendiente" ? "Aún no ha llegado" : `${canalTxt[d.canal]} · ${d.paginas} pág. · ${d.fecha ? fechaCorta(d.fecha) : ""}`}
                {d.extraidos ? ` · ${d.extraidos} datos extraídos con su página` : ""}
              </small>
              {d.nota && <small className="doc-nota">{d.nota}</small>}
            </div>
            <div className="doc-der">
              {d.estado === "subido" && <Badge tono="ok" punto>Subido y comprobado</Badge>}
              {d.estado === "aislado" && <Badge tono="error" punto>Aislado</Badge>}
              {d.estado === "pendiente" && <Badge tono="aviso">Pendiente</Badge>}
              {d.estado === "leyendo" && <Badge tono="info">Leyendo</Badge>}
              <small className="muted">{d.estado === "aislado" ? "No se sube a ninguna ficha" : d.carpeta}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Conversaciones({ c }: { c: Captacion }) {
  const { tick, pausaGeneral } = useStore();
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>Un solo expediente, tres canales</h2>
          <p className="muted">Llamada, email y WhatsApp sobre la misma propiedad. Sarah no repite el mismo recordatorio por dos canales a la vez.</p>
        </div>
        <div className="contadores">
          <span><b>{c.llamadas}</b>/{c.maxLlamadas} llamadas</span>
          <span><b>{c.recordatorios}</b>/{c.maxRecordatorios} recordatorios</span>
        </div>
      </header>
      <ol className="chat">
        {c.mensajes.map((m, i) => (
          <li key={m.id} className={`msg m-${m.de}`} style={{ animationDelay: `${i * 35}ms` }}>
            {m.de === "sistema" ? (
              <div className="msg-sis">
                <IconoCanal canal="sistema" size={14} />
                <span>{m.texto}</span>
                <time>{cuandoFue(m.fecha, tick)}</time>
              </div>
            ) : (
              <div className="burbuja">
                <div className="b-cab">
                  <span className={`b-canal c-${m.canal}`}>
                    <IconoCanal canal={m.canal} size={13} />
                    {m.canal === "llamada" ? `Llamada${m.duracion ? ` · ${m.duracion}` : ""}` : m.canal === "email" ? "Email" : "WhatsApp"}
                  </span>
                  <strong>{m.de === "sarah" ? "Sarah" : c.vendedor.nombre.split(" ")[0]}</strong>
                  <time>{cuandoFue(m.fecha, tick)}</time>
                </div>
                <p>{m.texto}</p>
                {m.cc && <small className="b-cc">CC visible: {m.cc} · la pone el programa, no la IA</small>}
                {m.plantilla && <small className="b-cc">Plantilla aprobada: {m.plantilla}</small>}
                {m.canal === "llamada" && m.de === "sarah" && m.duracion !== "0:00" && <small className="b-cc">Se presentó como asistente de inteligencia artificial al empezar</small>}
              </div>
            )}
          </li>
        ))}
      </ol>
      {c.proximoContacto && !["pausada", "publicada", "cancelada"].includes(c.estado) && (
        <div className={`proximo ${pausaGeneral ? "parado" : ""}`}>
          <CalendarClock size={17} />
          <span>
            {pausaGeneral ? "Pausa general: el próximo contacto no saldrá hasta que reanudes." : <>Próximo contacto {haceCuanto(c.proximoContacto, tick)}, a las {hora(c.proximoContacto)}, dentro del horario. La pausa se comprueba justo antes de enviar.</>}
          </span>
        </div>
      )}
    </div>
  );
}

function Fotos({ c }: { c: Captacion }) {
  const st = useStore();
  const [subiendo, setSubiendo] = useState(false);
  const props = c.fotos.filter((f) => f.tipo === "foto");
  const fijas = c.fotos.filter((f) => f.tipo !== "foto");
  const ok = props.length >= 25;
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>Multimedia</h2>
          <p className="muted">Orden fijo en todas las publicaciones: fotos, plano y la foto del local, siempre la última.</p>
        </div>
        <div className="fotos-cab">
          <span className={`contador-fotos ${ok ? "ok" : "falta"}`}>
            <b>{props.length}</b> de 25 fotos
          </span>
          <Boton
            tono="secundario"
            cargando={subiendo}
            icono={<ImagePlus size={16} />}
            onClick={async () => {
              setSubiendo(true);
              await st.anadirFoto(c.id);
              setSubiendo(false);
            }}
          >
            Añadir foto
          </Boton>
        </div>
      </header>
      {!c.fotos.length ? (
        <Vacio icono={<ImagePlus size={26} />} titulo="Todavía sin fotos" texto="La multimedia llega cuando la ficha tiene los datos y los documentos. Quién hace las fotos lo decide la agencia." />
      ) : (
        <div className="fotos-grid">
          {props.map((f, i) => (
            <Tilt key={f.id} className="foto-tilt">
              <figure className="foto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt={f.desc} loading="lazy" width={320} height={220} />
                <span className="foto-n">{i + 1}</span>
                <figcaption>{f.desc}</figcaption>
                <div className="foto-acc">
                  <button className="icon-btn sm" aria-label="Mover antes" disabled={i === 0} onClick={() => st.moverFoto(c.id, f.id, -1)}><ChevronLeft size={15} /></button>
                  <button className="icon-btn sm" aria-label="Mover después" disabled={i === props.length - 1} onClick={() => st.moverFoto(c.id, f.id, 1)}><ChevronRight size={15} /></button>
                  <button className="icon-btn sm" aria-label="Quitar foto" onClick={() => st.quitarFoto(c.id, f.id)}><Trash2 size={15} /></button>
                </div>
              </figure>
            </Tilt>
          ))}
          {fijas.map((f) => (
            <figure key={f.id} className="foto fija">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt={f.desc} loading="lazy" width={320} height={220} />
              <span className="foto-n"><Lock size={12} /></span>
              <figcaption>{f.tipo === "plano" ? "Plano · antes de la foto del local" : "Foto del local · siempre la última"}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <p className="muted pequeno" style={{ marginTop: 12 }}>La IA describe solo lo que se ve: no deduce equipamiento, orientación ni estado a partir de las fotos. Después de guardar, el sistema relee el orden en Mobilia.</p>
    </div>
  );
}

function Contador({ n, min, max, unidad }: { n: number; min: number; max: number; unidad: string }) {
  const ok = n >= min && n <= max;
  return (
    <span className={`contador ${ok ? "ok" : "mal"}`}>
      {n} {unidad} · {min} a {max}
    </span>
  );
}

const TRAD: Record<string, { en: string; de: string }> = {
  Villa: { en: "Villa", de: "Villa" }, Casa: { en: "House", de: "Haus" }, "Casa adosada": { en: "Townhouse", de: "Reihenhaus" }, Piso: { en: "Apartment", de: "Wohnung" },
  Ático: { en: "Penthouse", de: "Penthouse" }, Dúplex: { en: "Duplex", de: "Maisonette" }, Apartamento: { en: "Apartment", de: "Apartment" }, Chalet: { en: "Villa", de: "Villa" }, Finca: { en: "Country house", de: "Finca" }, Estudio: { en: "Studio", de: "Studio" },
};

function Anuncio({ c }: { c: Captacion }) {
  const st = useStore();
  const [t, setT] = useState(c.textos);
  const [idioma, setIdioma] = useState<"es" | "en" | "de">("es");
  const [guardando, setGuardando] = useState(false);
  const [traducido, setTraducido] = useState(false);
  const [traduciendo, setTraduciendo] = useState(false);
  useEffect(() => setT(c.textos), [c.textos]);
  const cambios = JSON.stringify(t) !== JSON.stringify(c.textos);
  const fugas = useMemo(() => {
    const out: { campo: string; que: string[] }[] = [];
    (["titulo", "corta", "ampliada", "seoTitulo", "seoDesc", "seoUrl"] as const).forEach((k) => {
      const q = revelaDireccion(t[k], c);
      if (q.length) out.push({ campo: k, que: q });
    });
    return out;
  }, [t, c]);
  const nombres: Record<string, string> = { titulo: "título", corta: "descripción corta", ampliada: "descripción ampliada", seoTitulo: "título SEO", seoDesc: "descripción SEO", seoUrl: "URL amigable" };
  const corregir = () => {
    const limpiar = (s: string) =>
      s
        .replace(/Situado en la \d+\s*[ºª]?\s*planta de un edificio con ascensor, la entrada/g, "La entrada")
        .replace(/,?\s*en la \d+\s*[ºª]?\s*planta/gi, "")
        .replace(new RegExp(`(${c.calle.split(" ").slice(-1)[0]})[,\\s]*(n[º°o]\\.?\\s*)?${c.numero}\\b`, "gi"), "$1");
    setT((x) => ({ ...x, titulo: limpiar(x.titulo), corta: limpiar(x.corta), ampliada: limpiar(x.ampliada), seoTitulo: limpiar(x.seoTitulo), seoDesc: limpiar(x.seoDesc) }));
  };
  const tr = TRAD[c.tipo] ?? { en: c.tipo, de: c.tipo };
  const casa = c.familia !== "Piso";
  const trad = {
    en: { titulo: `${tr.en} with ${casa ? "private pool" : "terrace"} in ${c.zona}`, corta: `${tr.en} of ${c.m2} m² built in ${c.zona}, ${c.poblacion}, with ${c.habitaciones} bedrooms and ${c.banos} bathrooms. ${casa ? "Garden, private pool and a covered porch for eating outdoors most of the year." : "Sunny terrace, lift and a parking space included in the price."}` },
    de: { titulo: `${tr.de} mit ${casa ? "Privatpool" : "Terrasse"} in ${c.zona}`, corta: `${tr.de} mit ${c.m2} m² Wohnfläche in ${c.zona}, ${c.poblacion}, mit ${c.habitaciones} Schlafzimmern und ${c.banos} Bädern. ${casa ? "Garten, Privatpool und überdachte Veranda für Mahlzeiten im Freien." : "Sonnige Terrasse, Aufzug und Stellplatz im Preis inbegriffen."}` },
  };
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>Anuncio y SEO</h2>
          <p className="muted">Con el tono de la agencia, solo con datos de la ficha y nunca con número, planta ni puerta. Es borrador hasta que el vendedor y tú lo aprobáis.</p>
        </div>
        <div className="seg seg-sm">
          {(["es", "en", "de"] as const).map((l) => (
            <button key={l} className={`seg-op ${idioma === l ? "on" : ""}`} onClick={() => setIdioma(l)}>
              {l === "es" ? "Español" : l === "en" ? "Inglés" : "Alemán"}
            </button>
          ))}
        </div>
      </header>
      {idioma !== "es" ? (
        <div className="form-col">
          {!traducido ? (
            <Vacio
              icono={<FileText size={26} />}
              titulo={`Versión en ${idioma === "en" ? "inglés" : "alemán"}`}
              texto="Se prepara a partir del texto en español ya aprobado, con las mismas reglas de dirección."
              accion={
                <Boton cargando={traduciendo} onClick={async () => { setTraduciendo(true); await new Promise((r) => setTimeout(r, 1100)); setTraduciendo(false); setTraducido(true); }}>
                  Preparar traducción
                </Boton>
              }
            />
          ) : (
            <>
              <Campo etiqueta="Título"><input className="input" value={trad[idioma].titulo} readOnly /></Campo>
              <Campo etiqueta="Descripción corta"><textarea className="textarea" rows={4} value={trad[idioma].corta} readOnly /></Campo>
              <p className="muted pequeno">La ampliada se genera igual al aprobar. Se escribe en la pestaña de idioma de Mobilia.</p>
            </>
          )}
        </div>
      ) : (
        <div className="form-col">
          {fugas.length > 0 && (
            <Aviso tono="error">
              <strong>No se publica así.</strong> {fugas.map((f) => `La ${nombres[f.campo]} dice ${f.que.join(" y ")}`).join(". ")}. Para evitar robos, en ningún canal se publica número, planta ni puerta.
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-sm btn-peligro" onClick={corregir}>Quitar la planta y el número</button>
              </div>
            </Aviso>
          )}
          <Campo etiqueta="Título del inmueble">
            <input className="input" value={t.titulo} onChange={(e) => setT({ ...t, titulo: e.target.value })} />
            <Contador n={t.titulo.length} min={LIMITES.titulo[0]} max={LIMITES.titulo[1]} unidad="caracteres" />
          </Campo>
          <Campo etiqueta="Descripción corta">
            <textarea className="textarea" rows={4} value={t.corta} onChange={(e) => setT({ ...t, corta: e.target.value })} />
            <Contador n={palabras(t.corta)} min={LIMITES.corta[0]} max={LIMITES.corta[1]} unidad="palabras" />
          </Campo>
          <Campo etiqueta="Descripción ampliada">
            <textarea className="textarea" rows={10} value={t.ampliada} onChange={(e) => setT({ ...t, ampliada: e.target.value })} />
            <Contador n={palabras(t.ampliada)} min={LIMITES.ampliada[0]} max={LIMITES.ampliada[1]} unidad="palabras" />
          </Campo>
          <div className="seo-caja">
            <span className="eyebrow">SEO</span>
            <Campo etiqueta="Título para buscadores">
              <input className="input" value={t.seoTitulo} onChange={(e) => setT({ ...t, seoTitulo: e.target.value })} />
              <Contador n={t.seoTitulo.length} min={LIMITES.seoTitulo[0]} max={LIMITES.seoTitulo[1]} unidad="caracteres" />
            </Campo>
            <Campo etiqueta="URL amigable">
              <input className="input mono" value={t.seoUrl} onChange={(e) => setT({ ...t, seoUrl: e.target.value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]+/g, "-") })} />
            </Campo>
            <Campo etiqueta="Descripción para buscadores">
              <textarea className="textarea" rows={3} value={t.seoDesc} onChange={(e) => setT({ ...t, seoDesc: e.target.value })} />
              <Contador n={t.seoDesc.length} min={LIMITES.seoDesc[0]} max={LIMITES.seoDesc[1]} unidad="caracteres" />
            </Campo>
            <div className="serp">
              <small>{c.poblacion.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}-propiedades › {t.seoUrl}</small>
              <strong>{t.seoTitulo}</strong>
              <p>{t.seoDesc}</p>
            </div>
          </div>
          <div className="fila-der">
            {cambios && <button className="btn btn-ghost" onClick={() => setT(c.textos)}>Descartar</button>}
            <Boton
              disabled={!cambios}
              cargando={guardando}
              onClick={async () => {
                setGuardando(true);
                await st.editarTextos(c.id, t);
                setGuardando(false);
              }}
              icono={<Check size={16} />}
            >
              Guardar en Mobilia
            </Boton>
          </div>
        </div>
      )}
    </div>
  );
}

function Publicidad({ c }: { c: Captacion }) {
  const datosOk = c.valores.some((v) => v.campo === "Geolocalización" && v.estado === "comprobado");
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>Publicidad</h2>
          <p className="muted">Tras tu aprobación se marcan todos los canales y, por último, DISPONIBLE. Después se relee cada canal.</p>
        </div>
        <span className="mapa-chip"><MapPin size={15} /> Mapa web: Dirección aproximada</span>
      </header>
      <div className="canales">
        {c.publicidad.map((p, i) => {
          const ajusta = !p.corregido && (p.direccion === "Calle y número" || p.direccion === "Dirección completa");
          const requisitosOk = p.requisitos.every((r) => (r === "Geolocalizado" || r === "Dirección" ? datosOk : true));
          return (
            <div key={p.id} className={`canal ${p.marcado ? "on" : ""}`} style={{ animationDelay: `${i * 30}ms` }}>
              <span className="canal-chk">{p.marcado ? <Check size={15} /> : null}</span>
              <div className="canal-txt">
                <strong>{p.nombre}</strong>
                <small>{p.soloVenta ? "Solo venta · " : ""}{p.requisitos.slice(3).join(", ") || "Requisitos básicos"}</small>
              </div>
              <div className="canal-dir">
                {ajusta ? (
                  <Badge tono="aviso">Viene con «{p.direccion}» · se cambia a solo calle</Badge>
                ) : p.corregido ? (
                  <Badge tono="ok">Cambiado a solo calle</Badge>
                ) : (
                  <Badge tono="neutro">{p.direccion === "Zona" ? "Solo zona" : "Solo calle"}</Badge>
                )}
              </div>
              <span className={`canal-req ${requisitosOk ? "ok" : "mal"}`}>{requisitosOk ? "Requisitos ok" : "Falta geolocalizar"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Historial({ c }: { c: Captacion }) {
  const { tick } = useStore();
  const lista = [...c.registro].reverse();
  const tono = { comprobado: "ok", fallido: "error", deshecho: "apoyo", enviado: "info", info: "neutro", bloqueado: "error" } as const;
  const txt = { comprobado: "Comprobado", fallido: "Fallido", deshecho: "Deshecho", enviado: "Enviado", info: "Registro", bloqueado: "Bloqueado" } as const;
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <h2>Registro de auditoría</h2>
          <p className="muted">Quién, qué, cuándo y con qué resultado. En el historial de Mobilia todo aparece con el usuario del sistema; aquí queda quién dio cada orden.</p>
        </div>
      </header>
      <ol className="auditoria">
        {lista.map((r) => (
          <li key={r.id}>
            <time>{cuandoFue(r.fecha, tick)}</time>
            <div>
              <strong>{r.accion}</strong>
              <small>
                {r.quien}
                {r.pestana ? ` · pestaña ${r.pestana}` : ""}
                {r.campo ? ` · ${r.campo}` : ""}
                {r.antes !== undefined && r.despues !== undefined ? ` · ${r.antes || "vacío"} → ${r.despues}` : ""}
              </small>
            </div>
            <Badge tono={tono[r.resultado]}>{txt[r.resultado]}</Badge>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AprobarModal({ c, abierto, onCerrar }: { c: Captacion; abierto: boolean; onCerrar: () => void }) {
  const st = useStore();
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [hecho, setHecho] = useState(false);
  useEffect(() => {
    if (abierto) {
      setCodigo("");
      setError("");
      setHecho(false);
    }
  }, [abierto]);
  const marcados = c.publicidad.filter((p) => p.marcado).length;
  const publicar = async () => {
    if (!/^\d{6}$/.test(codigo)) {
      setError("Introduce las 6 cifras de tu app de verificación");
      return;
    }
    setError("");
    setPublicando(true);
    const ok = await st.aprobar(c.id);
    setPublicando(false);
    if (ok) setHecho(true);
  };
  return (
    <Modal
      abierto={abierto}
      titulo={hecho ? "Publicada" : `Aprobar ${c.ref}`}
      onCerrar={onCerrar}
      ancho={520}
      pie={
        hecho ? (
          <button className="btn btn-primario" onClick={onCerrar}>Listo</button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={onCerrar} disabled={publicando}>Cancelar</button>
            <Boton cargando={publicando} onClick={publicar} icono={<BadgeCheck size={16} />}>Aprobar y publicar</Boton>
          </>
        )
      }
    >
      <div className="form-col">
        {hecho ? (
          <Aviso tono="ok">Los 14 canales quedaron marcados con solo la calle y releídos. DISPONIBLE se marcó la última. La maqueta ya tiene su cartel.</Aviso>
        ) : (
          <>
            <p>Esta aprobación vale para una sola acción y caduca. Si algo cambia después, hay que aprobar otra vez. Un «sí» por WhatsApp no aprueba nada.</p>
            <ul className="checks-aprobar">
              <li><CheckCircle2 size={16} /> Datos del bloque General completos o «no consta»</li>
              <li><CheckCircle2 size={16} /> D. Internos con escritura y nota simple</li>
              <li><CheckCircle2 size={16} /> {c.fotos.filter((f) => f.tipo === "foto").length} fotos, plano y local al final</li>
              <li><CheckCircle2 size={16} /> Textos y SEO dentro de los límites, sin número</li>
              <li><CheckCircle2 size={16} /> El vendedor aprobó el anuncio</li>
            </ul>
            <Campo etiqueta="Código de verificación" error={error} ayuda="Inicio de sesión fuerte reciente, como pide el manual.">
              <input className="input codigo" inputMode="numeric" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} placeholder="000000" disabled={publicando} />
            </Campo>
            {publicando && (
              <div className="publicando">
                <Loader2 size={16} className="spin" /> Marcando canales: {marcados} de {c.publicidad.length}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

function CancelarModal({ c, abierto, onCerrar }: { c: Captacion; abierto: boolean; onCerrar: () => void }) {
  const st = useStore();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  return (
    <Modal
      abierto={abierto}
      titulo={`Cancelar ${c.ref}`}
      onCerrar={onCerrar}
      ancho={460}
      pie={
        <>
          <button className="btn btn-ghost" onClick={onCerrar}>Volver</button>
          <Boton
            tono="peligro"
            cargando={ocupado}
            onClick={async () => {
              if (motivo.trim().length < 5) {
                setError("Escribe el motivo: queda en el expediente");
                return;
              }
              setOcupado(true);
              await st.cancelar(c.id, motivo.trim());
              setOcupado(false);
              onCerrar();
            }}
          >
            Cancelar captación
          </Boton>
        </>
      }
    >
      <div className="form-col">
        <p className="muted">Sarah deja de contactar al vendedor al instante. La ficha de Mobilia no se borra: el sistema no tiene ninguna acción de borrar.</p>
        <Campo etiqueta="Motivo" error={error}>
          <textarea className="textarea" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="El vendedor decidió esperar a primavera" />
        </Campo>
      </div>
    </Modal>
  );
}

export default function Pagina() {
  return (
    <Suspense fallback={<Skel alto={400} />}>
      <Expediente />
    </Suspense>
  );
}
