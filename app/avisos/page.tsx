"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BellRing, CheckCircle2, Mail, PiggyBank, Radio, Settings2, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, Barra, Boton, Campo, Drawer, Modal, Skel, Tilt } from "@/components/ui";
import { cuandoFue, eurosDec, haceCuanto } from "@/lib/format";
import type { Alerta, Servicio } from "@/lib/types";

export default function Avisos() {
  const { listo, alertas, servicios, tick, ultimoToque, ajustes, marcarLeida, pausaGeneral, esDireccion } = useStore();
  const [abierta, setAbierta] = useState<Alerta | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "fallo" | "resumen" | "gasto">("todas");
  const [editar, setEditar] = useState<Servicio | null>(null);
  const lista = alertas.filter((a) => filtro === "todas" || a.tipo === filtro);
  const desde = ultimoToque ? Math.max(0, tick - ultimoToque) : 0;
  const pct = Math.min(100, (desde / 300000) * 100);
  const mes = servicios.reduce((s, x) => s + x.mes, 0);

  return (
    <>
      <div className="tit-fila">
        <div>
          <h1 className="tit-pagina">Avisos y gasto</h1>
          <p className="muted">Si algo se para, te llega un email en lenguaje sencillo: qué falló, qué captaciones afecta y si el resto sigue funcionando.</p>
        </div>
      </div>

      <section className="grid g-avisos-top">
        <Tilt className="vig-tilt">
          <div className="card vigilante">
            <span className="vig-ic">
              <Radio size={20} />
            </span>
            <div>
              <span className="eyebrow">Vigilante externo</span>
              <h3>{pausaGeneral ? "En pausa: no se esperan toques" : `Último toque ${ultimoToque ? haceCuanto(new Date(ultimoToque).toISOString(), tick) : "..."}`}</h3>
              <p className="muted pequeno">Un servicio fuera de vuestro servidor espera un toque cada 5 minutos. Si deja de llegar, avisa por email aunque el servidor entero se haya caído.</p>
              <Barra valor={pausaGeneral ? 0 : 100 - pct} tono={pct > 90 ? "aviso" : "ok"} />
              <small className="muted">Próximo toque en {Math.max(0, Math.ceil((300000 - desde) / 1000 / 60))} min</small>
            </div>
          </div>
        </Tilt>
        <Tilt className="vig-tilt">
          <div className="card vigilante">
            <span className="vig-ic apoyo">
              <Mail size={20} />
            </span>
            <div>
              <span className="eyebrow">A dónde llegan</span>
              <h3>{ajustes.emailAvisos}</h3>
              <p className="muted pequeno">Copia de respaldo a {ajustes.emailRespaldo}. Resumen {ajustes.resumen} «todo funciona», para que el silencio no se confunda con normalidad. Los avisos nunca llevan datos de clientes ni documentos.</p>
            </div>
          </div>
        </Tilt>
      </section>

      <section className="grid g-avisos">
        <div className="card">
          <header className="card-head">
            <div>
              <h2>Bandeja de avisos</h2>
              <p className="muted">Lo mismo que llega a tu correo.</p>
            </div>
            <div className="seg seg-sm">
              {(["todas", "fallo", "resumen", "gasto"] as const).map((f) => (
                <button key={f} className={`seg-op ${filtro === f ? "on" : ""}`} onClick={() => setFiltro(f)}>
                  {f === "todas" ? "Todos" : f === "fallo" ? "Fallos" : f === "resumen" ? "Resúmenes" : "Gasto"}
                </button>
              ))}
            </div>
          </header>
          {!listo ? (
            <div className="form-col">{[0, 1, 2].map((i) => <Skel key={i} alto={64} />)}</div>
          ) : (
            <ul className="bandeja">
              {lista.map((a, i) => (
                <li key={a.id} style={{ animationDelay: `${i * 40}ms` }}>
                  <button
                    className={`aviso-fila ${a.leida ? "" : "nueva"} t-${a.tipo}`}
                    onClick={() => {
                      setAbierta(a);
                      marcarLeida(a.id);
                    }}
                  >
                    <span className="af-ic">{a.tipo === "fallo" ? <AlertTriangle size={17} /> : a.tipo === "gasto" ? <Wallet size={17} /> : <CheckCircle2 size={17} />}</span>
                    <span className="af-txt">
                      <strong>{a.asunto}</strong>
                      <small>{a.cuerpo[0]}</small>
                    </span>
                    <span className="af-der">
                      <time>{cuandoFue(a.fecha, tick)}</time>
                      {a.resuelta ? <Badge tono="ok">Resuelto</Badge> : a.tipo === "fallo" ? <Badge tono="error" punto>Abierto</Badge> : null}
                    </span>
                  </button>
                </li>
              ))}
              {!lista.length && <li className="muted">Sin avisos de este tipo.</li>}
            </ul>
          )}
        </div>

        <div className="card">
          <header className="card-head">
            <div>
              <h2>Gasto de este mes</h2>
              <p className="muted">Se paga desde las cuentas de la agencia. Aviso al 80 % y pausa al 100 %.</p>
            </div>
            <span className="total-mes">{eurosDec(mes)}</span>
          </header>
          <div className="servicios">
            {servicios.map((s) => {
              const pm = (s.mes / s.limiteMes) * 100;
              const pd = (s.hoy / s.limiteDia) * 100;
              return (
                <div key={s.id} className="servicio">
                  <div className="sv-cab">
                    <strong>{s.nombre}</strong>
                    {esDireccion && (
                      <button className="icon-btn sm" onClick={() => setEditar(s)} aria-label={`Límites de ${s.nombre}`}>
                        <Settings2 size={15} />
                      </button>
                    )}
                  </div>
                  <small className="muted">{s.detalle}</small>
                  <div className="sv-barra">
                    <span>Mes</span>
                    <Barra valor={pm} tono={pm >= 100 ? "error" : pm >= 80 ? "aviso" : "acento"} />
                    <b>{eurosDec(s.mes)} / {eurosDec(s.limiteMes)}</b>
                  </div>
                  <div className="sv-barra">
                    <span>Hoy</span>
                    <Barra valor={pd} tono={pd >= 100 ? "error" : pd >= 80 ? "aviso" : "acento"} />
                    <b>{eurosDec(s.hoy)} / {eurosDec(s.limiteDia)}</b>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ejemplo-gasto">
            <PiggyBank size={18} />
            <div>
              <strong>Una captación cuesta unos 2,80 € en servicios</strong>
              <small>IA alrededor de 0,90 €, dos llamadas de unos 7 minutos cerca de 1,60 € y WhatsApp unos céntimos. Si el vendedor lo resuelve todo por escrito, baja casi a la mitad. A vuestro ritmo, unas 10 altas al mes, todo junto ronda 45 a 60 € al mes.</small>
            </div>
          </div>
          <p className="muted pequeno" style={{ marginTop: 10 }}>
            <BellRing size={13} style={{ verticalAlign: "-2px" }} /> Además de estos límites, cada proveedor tiene su propio tope configurado en la cuenta de la agencia: aunque fallara el sistema, la factura no pasa de ahí.
          </p>
        </div>
      </section>

      <Drawer abierto={!!abierta} titulo={abierta?.asunto ?? ""} sub={abierta ? `Para ${ajustes.emailAvisos} · copia a ${ajustes.emailRespaldo}` : ""} onCerrar={() => setAbierta(null)}>
        {abierta && (
          <div className="email">
            <div className="email-cab">
              <span>De: Sarah, avisos del sistema</span>
              <time>{cuandoFue(abierta.fecha, tick)}</time>
            </div>
            {abierta.cuerpo.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {abierta.afectadas.length > 0 && (
              <div className="email-afect">
                <small>Captaciones afectadas</small>
                <div>
                  {abierta.afectadas.map((r) => (
                    <Badge key={r} tono="apoyo">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="muted pequeno">Este aviso no lleva datos de clientes ni documentos, solo referencias de Mobilia.</p>
          </div>
        )}
      </Drawer>

      <LimitesModal s={editar} onCerrar={() => setEditar(null)} />
    </>
  );
}

function LimitesModal({ s, onCerrar }: { s: Servicio | null; onCerrar: () => void }) {
  const { setLimites } = useStore();
  const [mes, setMes] = useState("");
  const [dia, setDia] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const abierto = !!s;
  useEffect(() => {
    if (s) {
      setMes(String(s.limiteMes));
      setDia(String(s.limiteDia));
    }
  }, [s]);
  const cerrar = () => {
    setMes("");
    setDia("");
    setError("");
    onCerrar();
  };
  return (
    <Modal
      abierto={abierto}
      titulo={`Límites de ${s?.nombre ?? ""}`}
      onCerrar={cerrar}
      ancho={420}
      pie={
        <>
          <button className="btn btn-ghost" onClick={cerrar}>Cancelar</button>
          <Boton
            cargando={ocupado}
            onClick={async () => {
              const m = Number(mes.replace(",", "."));
              const d = Number(dia.replace(",", "."));
              if (!s || !(m > 0) || !(d > 0) || d > m) {
                setError("El límite diario tiene que ser mayor que cero y menor que el mensual");
                return;
              }
              setOcupado(true);
              await setLimites(s.id, m, d);
              setOcupado(false);
              cerrar();
            }}
          >
            Guardar límites
          </Boton>
        </>
      }
    >
      <div className="form-col">
        <div className="form-grid">
          <Campo etiqueta="Límite mensual (€)" error={error}>
            <input className="input" inputMode="decimal" value={mes} onChange={(e) => setMes(e.target.value)} />
          </Campo>
          <Campo etiqueta="Límite diario (€)">
            <input className="input" inputMode="decimal" value={dia} onChange={(e) => setDia(e.target.value)} />
          </Campo>
        </div>
        <p className="muted pequeno">Al 80 % te llega un aviso. Al 100 % esa función se pausa sola hasta el día o el mes siguiente.</p>
      </div>
    </Modal>
  );
}
