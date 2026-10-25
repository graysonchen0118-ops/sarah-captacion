"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Clock3, Fingerprint, ListOrdered, ShieldCheck, Wrench, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { Pantallas } from "@/components/three/Scenes";
import { Aviso, Badge, Boton, Skel } from "@/components/ui";
import { haceCuanto, horaSeg } from "@/lib/format";
import { PASOS } from "@/lib/manual";

export default function Robot() {
  const { listo, pantallas, robotLog, robotActual, cola, captaciones, pausaGeneral, simularCambioPantalla, repararPantalla, tick, ajustes, esDireccion } = useStore();
  const [reparando, setReparando] = useState(false);
  const cambiada = pantallas.find((p) => p.estado === "cambiada");
  const parado = pausaGeneral || !!cambiada;
  const ultimo = robotLog[robotLog.length - 1];
  const actual = captaciones.find((c) => c.id === robotActual);
  const hoy = robotLog.length + 37;

  return (
    <>
      <div className="tit-fila">
        <div>
          <h1 className="tit-pagina">Robot de Mobilia</h1>
          <p className="muted">Entra con su propio usuario, a ritmo de persona y en el horario acordado. Nunca salta una contraseña, un doble factor ni un CAPTCHA.</p>
        </div>
        {esDireccion && !cambiada && (
          <button className="btn btn-ghost" onClick={simularCambioPantalla} disabled={!listo}>
            <Zap size={16} />
            <span>Simular un cambio de pantalla</span>
          </button>
        )}
      </div>

      {cambiada && (
        <Aviso tono="error">
          <strong>Mobilia ha cambiado la pantalla {cambiada.nombre}.</strong> {cambiada.detalle} El robot se paró sin escribir nada y te llegó el email. Sarah sigue hablando con los vendedores.
          {esDireccion && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Boton
                tono="secundario"
                cargando={reparando}
                icono={<Wrench size={16} />}
                onClick={async () => {
                  setReparando(true);
                  await repararPantalla(cambiada.id);
                  setReparando(false);
                }}
              >
                Marcar el conector como adaptado
              </Boton>
              <Link href="/avisos" className="btn btn-ghost">Ver el email del aviso</Link>
            </div>
          )}
        </Aviso>
      )}

      <section className="card robot-escena">
        <div className="re-canvas">{listo ? <Pantallas pantallas={pantallas} activa={ultimo?.pestana ?? "General"} parado={parado} /> : <div className="pantallas-ph" />}</div>
        <div className="re-info">
          <span className={`re-estado ${parado ? "parado" : ""}`}>
            {parado ? <AlertTriangle size={16} /> : <span className="punto-vivo" />}
            {pausaGeneral ? "En pausa general" : cambiada ? "Parado: pantalla distinta" : "Trabajando"}
          </span>
          <h2>{actual ? `${actual.ref} · ${actual.tipo} en ${actual.zona}` : "Cola vacía"}</h2>
          <p className="muted">{actual ? `Paso ${Math.min(actual.paso + 1, 11)} de 11: ${PASOS[Math.min(actual.paso, 10)].nombre}. Referencia comprobada antes y después de cada escritura.` : "Esperando nuevas órdenes."}</p>
          <div className="re-datos">
            <span>
              <small>Fichas escritas hoy</small>
              <strong>{listo ? Math.floor(hoy / 31) + 2 : "..."}</strong>
            </span>
            <span>
              <small>Campos releídos hoy</small>
              <strong>{listo ? hoy : "..."}</strong>
            </span>
            <span>
              <small>Tiempo medio por ficha completa</small>
              <strong>18 min</strong>
            </span>
            <span>
              <small>Horario de trabajo</small>
              <strong>{ajustes.horarioRobot.desde} a {ajustes.horarioRobot.hasta}</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="grid g-robot">
        <div className="card">
          <header className="card-head">
            <div>
              <h2>Escritura en directo</h2>
              <p className="muted">Escribe, relee y compara. Si el valor no coincide, para y avisa.</p>
            </div>
          </header>
          {!listo ? (
            <div className="form-col">{[0, 1, 2, 3, 4].map((i) => <Skel key={i} alto={34} />)}</div>
          ) : (
            <ol className="log">
              {robotLog
                .slice(-14)
                .reverse()
                .map((p, i) => (
                  <li key={p.id} className={i === 0 ? "nuevo" : ""}>
                    <time>{horaSeg(new Date(p.t).toISOString())}</time>
                    <span className="log-ref">{p.ref}</span>
                    <span className="log-txt">
                      <b>{p.pestana}</b> · {p.campo}: <em>{p.valor}</em>
                    </span>
                    <span className="log-ok">
                      <CheckCircle2 size={14} /> releído
                    </span>
                  </li>
                ))}
              {!robotLog.length && <li className="muted">Abriendo la ficha {actual?.ref} y comprobando la referencia...</li>}
            </ol>
          )}
        </div>

        <div className="form-col">
          <div className="card">
            <header className="card-head">
              <div>
                <h2>Cola de trabajo</h2>
                <p className="muted">Por orden de llegada. Cada comercial ve en qué punto está la suya.</p>
              </div>
              <ListOrdered size={18} className="muted" />
            </header>
            <ol className="cola">
              {cola.map((id, i) => {
                const c = captaciones.find((x) => x.id === id);
                if (!c) return null;
                return (
                  <li key={id} className={i === 0 ? "ahora" : ""}>
                    <span className="cola-n">{i === 0 ? <Bot size={15} /> : i + 1}</span>
                    <Link href={`/captaciones/${c.id}`}>
                      <strong>{c.ref}</strong> · {c.tipo} en {c.zona}
                    </Link>
                    <small>{i === 0 ? (parado ? "Parada" : "Escribiendo") : `En unos ${i * 18} min`}</small>
                  </li>
                );
              })}
              {!cola.length && <li className="muted">Sin fichas en cola.</li>}
            </ol>
          </div>

          <div className="card">
            <header className="card-head">
              <div>
                <h2>Huella de cada pantalla</h2>
                <p className="muted">Antes de escribir, comprueba que la pantalla es la que conoce. Si no, no escribe.</p>
              </div>
              <Fingerprint size={18} className="muted" />
            </header>
            <ul className="huellas">
              {pantallas.map((p) => (
                <li key={p.id} className={p.estado === "cambiada" ? "mal" : ""}>
                  {p.estado === "cambiada" ? <AlertTriangle size={15} /> : <ShieldCheck size={15} />}
                  <span>
                    <strong>{p.nombre}</strong>
                    <small>{p.campos} campos conocidos</small>
                  </span>
                  {p.estado === "cambiada" ? <Badge tono="error">Distinta</Badge> : <Badge tono="ok">Correcta</Badge>}
                  <small className="muted"><Clock3 size={12} /> {haceCuanto(p.ultima, tick)}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
