"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Bot, CheckCircle2, ClipboardCheck, FileWarning, Hourglass, PhoneCall, Scale, Send, ShieldAlert } from "lucide-react";
import { useStore, bloqueosDisponible } from "@/lib/store";
import { Maqueta } from "@/components/three/Scenes";
import { BotonNueva, EstadoBadge, FichaMini, IconoCanal } from "@/components/piezas";
import { Skel, Tilt } from "@/components/ui";
import { cuandoFue, haceCuanto, horaEspana } from "@/lib/format";
import { PASOS } from "@/lib/manual";

export default function Inicio() {
  const { listo, visibles, tick, comerciales, robotLog, robotActual, cola, captaciones, pausaGeneral, pantallas, esDireccion, nombreDe, vista } = useStore();
  const h = tick ? horaEspana(tick) : 10;
  const saludo = h < 13.5 ? "Buenos días" : h < 20.5 ? "Buenas tardes" : "Buenas noches";
  const parado = pausaGeneral || pantallas.some((p) => p.estado === "cambiada");

  const k = useMemo(() => {
    const cuenta = (e: string[]) => visibles.filter((c) => e.includes(c.estado)).length;
    return {
      curso: cuenta(["abierta", "contactando"]),
      esperando: cuenta(["esperando"]),
      docs: cuenta(["documentacion"]),
      revisar: cuenta(["revisar"]),
      publicadas: cuenta(["publicada"]),
    };
  }, [visibles]);

  const destacada = visibles.find((c) => c.ref === "REF 2431") ?? visibles.find((c) => c.estado === "revisar") ?? visibles[0];
  const actual = captaciones.find((c) => c.id === robotActual);

  const decisiones = useMemo(() => {
    const out: { id: string; ref: string; titulo: string; texto: string; icono: React.ReactNode; tono: string; enlace: string }[] = [];
    visibles.forEach((c) => {
      const abiertos = c.conflictos.filter((x) => x.elegida === undefined);
      if (abiertos.length)
        out.push({ id: c.id + "k", ref: c.ref, titulo: abiertos.length === 1 ? "1 dato en conflicto" : `${abiertos.length} datos en conflicto`, texto: abiertos.map((x) => x.campo).join(", "), icono: <Scale size={18} />, tono: "apoyo", enlace: `/captaciones/${c.id}?tab=conflictos` });
      if (c.estado === "revisar" && !abiertos.length) {
        const b = bloqueosDisponible(c);
        out.push({ id: c.id + "r", ref: c.ref, titulo: b.length ? "Lista para revisar, con un bloqueo" : "Lista para aprobar", texto: b.length ? b[0] : `${c.tipo} en ${c.zona}: todo comprobado`, icono: b.length ? <FileWarning size={18} /> : <ClipboardCheck size={18} />, tono: b.length ? "aviso" : "ok", enlace: `/captaciones/${c.id}` });
      }
      if (c.estado === "documentacion" && c.recordatorios >= c.maxRecordatorios)
        out.push({ id: c.id + "b", ref: c.ref, titulo: "Captación bloqueada", texto: "Sarah llegó al límite de recordatorios. Falta la nota simple.", icono: <Hourglass size={18} />, tono: "error", enlace: `/captaciones/${c.id}` });
      if (c.vendedor.baja)
        out.push({ id: c.id + "x", ref: c.ref, titulo: "El vendedor pidió la baja", texto: "Circuito parado. Decide si sigue el comercial en persona.", icono: <ShieldAlert size={18} />, tono: "error", enlace: `/captaciones/${c.id}` });
    });
    return out.slice(0, 7);
  }, [visibles]);

  const recientes = useMemo(
    () =>
      visibles
        .flatMap((c) => c.mensajes.filter((m) => m.canal !== "sistema").map((m) => ({ ...m, ref: c.ref, cid: c.id, vendedor: c.vendedor.nombre })))
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .slice(0, 6),
    [visibles],
  );

  const enCurso = visibles.filter((c) => ["revisar", "esperando", "documentacion", "contactando"].includes(c.estado)).slice(0, 4);

  return (
    <>
      <section className="hero card">
        <div className="hero-txt">
          <span className="eyebrow">{saludo}</span>
          <h1>
            {!listo ? (
              <Skel alto={34} ancho="80%" />
            ) : k.revisar ? (
              <>
                {k.revisar === 1 ? "Tienes 1 ficha lista para revisar" : `Tienes ${k.revisar} fichas listas para revisar`}
                {esDireccion ? "" : ` · ${nombreDe(vista)}`}
              </>
            ) : (
              "Nada pendiente de tu revisión"
            )}
          </h1>
          <div className="hero-sub">
            {!listo ? (
              <Skel alto={16} ancho="90%" />
            ) : parado ? (
              "El robot está parado. Sarah no contacta y nada se escribe en Mobilia hasta que lo reanudes."
            ) : actual ? (
              <>
                Ahora mismo el robot escribe <strong>{actual.ref}</strong> en Mobilia, un campo cada vez y releyendo cada guardado. Quedan {Math.max(0, cola.length - 1)} en la cola.
              </>
            ) : (
              "El robot terminó la cola y espera nuevas órdenes."
            )}
          </div>
          <div className="hero-acc">
            <BotonNueva />
            {destacada && (
              <Link href={`/captaciones/${destacada.id}`} className="btn btn-secundario">
                <span>Revisar {destacada.ref}</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
          {destacada && listo && (
            <div className="hero-ficha">
              <span className="hf-ref">{destacada.ref}</span>
              <span>
                {destacada.tipo} en {destacada.zona}, {destacada.poblacion}
              </span>
              <EstadoBadge estado={destacada.estado} />
            </div>
          )}
        </div>
        <div className="hero-escena">
          {destacada && listo ? (
            <Maqueta paso={destacada.paso} fotos={destacada.fotos.slice(0, 6).map((f) => f.src)} canales={destacada.publicidad.filter((p) => p.marcado).length} pausada={pausaGeneral || destacada.estado === "pausada"} casa={destacada.familia !== "Piso"} />
          ) : (
            <div className="maqueta-ph" />
          )}
          <div className="hero-leyenda">
            <span><i className="ley-real" /> Ya en Mobilia y releído</span>
            <span><i className="ley-fantasma" /> Lo que falta por levantar</span>
          </div>
        </div>
      </section>

      <section className="kpis">
        {[
          { t: "En curso", v: k.curso, ic: <PhoneCall size={18} />, href: "/captaciones?estado=contactando", tono: "acento" },
          { t: "Esperando al vendedor", v: k.esperando, ic: <Hourglass size={18} />, href: "/captaciones?estado=esperando", tono: "info" },
          { t: "Pendientes de documentación", v: k.docs, ic: <FileWarning size={18} />, href: "/captaciones?estado=documentacion", tono: "aviso" },
          { t: "Listas para revisar", v: k.revisar, ic: <ClipboardCheck size={18} />, href: "/captaciones?estado=revisar", tono: "apoyo" },
          { t: "Publicadas", v: k.publicadas, ic: <CheckCircle2 size={18} />, href: "/captaciones?estado=publicada", tono: "ok" },
        ].map((x, i) => (
          <Tilt key={x.t} className="kpi-tilt" style={{ animationDelay: `${i * 60}ms` }}>
            <Link href={x.href} className={`kpi k-${x.tono}`}>
              <span className="kpi-ic">{x.ic}</span>
              <small>{x.t}</small>
              <strong>{listo ? x.v : <Skel alto={28} ancho={40} />}</strong>
            </Link>
          </Tilt>
        ))}
      </section>

      <section className="grid g-inicio">
        <div className="card">
          <header className="card-head">
            <div>
              <h2>Te toca decidir</h2>
              <p className="muted">Datos críticos, bloqueos y excepciones. El sistema no elige por intuición.</p>
            </div>
          </header>
          {!listo ? (
            <div className="form-col">
              {[0, 1, 2].map((i) => (
                <Skel key={i} alto={58} />
              ))}
            </div>
          ) : decisiones.length ? (
            <ul className="decisiones">
              {decisiones.map((d, i) => (
                <li key={d.id} style={{ animationDelay: `${i * 50}ms` }}>
                  <Link href={d.enlace} className={`decision d-${d.tono}`}>
                    <span className="dec-ic">{d.icono}</span>
                    <span className="dec-txt">
                      <strong>
                        {d.ref} · {d.titulo}
                      </strong>
                      <small>{d.texto}</small>
                    </span>
                    <ArrowRight size={16} className="dec-flecha" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Nada que decidir ahora mismo.</p>
          )}
        </div>

        <div className="card robot-mini">
          <header className="card-head">
            <div>
              <h2>El robot ahora</h2>
              <p className="muted">Una ficha cada vez. Referencia comprobada antes y después.</p>
            </div>
            <Link href="/robot" className="enlace">
              Ver todo <ArrowRight size={14} />
            </Link>
          </header>
          {parado ? (
            <div className="robot-parado">
              <AlertTriangle size={18} />
              <span>{pausaGeneral ? "Pausa general activada." : "Mobilia ha cambiado una pantalla."} No se escribe nada.</span>
            </div>
          ) : actual ? (
            <div className="robot-actual">
              <Bot size={18} />
              <span>
                <strong>{actual.ref}</strong> · {actual.tipo} en {actual.zona} · paso {Math.min(actual.paso + 1, 11)}, {PASOS[Math.min(actual.paso, 10)].nombre}
              </span>
            </div>
          ) : null}
          <ol className="log-mini">
            {robotLog
              .slice(-6)
              .reverse()
              .map((p) => (
                <li key={p.id}>
                  <CheckCircle2 size={14} className="ok" />
                  <span>
                    <b>{p.pestana}</b> · {p.campo}: <em>{p.valor}</em>
                  </span>
                  <small>releído</small>
                </li>
              ))}
            {!robotLog.length && <li className="muted">Arrancando: abriendo la ficha y comprobando la referencia...</li>}
          </ol>
        </div>
      </section>

      <section className="grid g-inicio">
        <div className="card">
          <header className="card-head">
            <div>
              <h2>Sarah, lo último</h2>
              <p className="muted">Se presenta como IA en el primer mensaje y al empezar cada llamada.</p>
            </div>
          </header>
          <ul className="mensajes-mini">
            {(listo ? recientes : []).map((m) => (
              <li key={m.id}>
                <Link href={`/captaciones/${m.cid}?tab=conversaciones`}>
                  <span className={`mm-ic c-${m.canal}`}>
                    <IconoCanal canal={m.canal} />
                  </span>
                  <span className="mm-txt">
                    <strong>
                      {m.de === "sarah" ? "Sarah" : m.vendedor.split(" ")[0]} · {m.ref}
                    </strong>
                    <small>{m.texto}</small>
                  </span>
                  <time>{cuandoFue(m.fecha, tick)}</time>
                </Link>
              </li>
            ))}
            {!listo && [0, 1, 2, 3].map((i) => <Skel key={i} alto={46} />)}
          </ul>
        </div>
        <div className="card">
          <header className="card-head">
            <div>
              <h2>En marcha</h2>
              <p className="muted">Cada barra son los 11 pasos del manual.</p>
            </div>
            <Link href="/captaciones" className="enlace">
              Todas <ArrowRight size={14} />
            </Link>
          </header>
          <div className="fichas-mini">
            {listo
              ? enCurso.map((c) => {
                  const com = comerciales.find((x) => x.id === c.comercialId);
                  return <FichaMini key={c.id} c={c} nombreComercial={com?.nombre ?? ""} fotoComercial={com?.foto ?? ""} />;
                })
              : [0, 1, 2, 3].map((i) => <Skel key={i} alto={220} />)}
          </div>
          {listo && actual && (
            <p className="muted pequeno" style={{ marginTop: 12 }}>
              <Send size={13} style={{ verticalAlign: "-2px" }} /> Última escritura comprobada {robotLog.length ? haceCuanto(new Date(robotLog[robotLog.length - 1].t).toISOString(), tick) : "hace un momento"}.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
