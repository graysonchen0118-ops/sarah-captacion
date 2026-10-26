"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Check, Clock4, Copy, Lock, MessageSquareQuote, PhoneCall, Repeat } from "lucide-react";
import { useStore } from "@/lib/store";
import { Aviso, Boton, Campo, Vacio } from "@/components/ui";
import type { Ajustes } from "@/lib/types";

export default function Configuracion() {
  const { ajustes, guardarAjustes, esDireccion, comerciales } = useStore();
  const [a, setA] = useState<Ajustes>(ajustes);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  useEffect(() => setA(ajustes), [ajustes]);
  const cambios = JSON.stringify(a) !== JSON.stringify(ajustes);
  const rellenar = (t: string) =>
    t
      .replaceAll("{vendedor}", "Carmen")
      .replaceAll("{agencia}", a.agencia)
      .replaceAll("{comercial}", "Javier")
      .replaceAll("{inmueble}", "piso")
      .replaceAll("{documento}", "el certificado energético")
      .replaceAll("{resumen}", "tres dormitorios, dos baños y terraza")
      .replaceAll("{zona}", "Les Rotes");
  const vista = useMemo(() => `${rellenar(a.saludoSarah)} ${rellenar(a.plantillaDocumento)}`, [a.saludoSarah, a.plantillaDocumento, a.agencia, comerciales]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!esDireccion) return <Vacio icono={<Lock size={26} />} titulo="Solo para dirección" texto="La configuración la cambia solo el administrador." />;

  const guardar = async () => {
    const e: Record<string, string> = {};
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.test(a.buzonSarah)) e.buzon = "Email no válido";
    if (!email.test(a.emailAvisos)) e.avisos = "Email no válido";
    if (!email.test(a.emailRespaldo)) e.respaldo = "Email no válido";
    if (a.emailRespaldo === a.emailAvisos) e.respaldo = "Tiene que ser otro correo, por si falla el primero";
    if (!/inteligencia artificial|\bIA\b/i.test(a.saludoSarah)) e.saludo = "El saludo tiene que decir que Sarah es una inteligencia artificial";
    if (!/BAJA/.test(a.plantillaDocumento)) e.plantilla = "La plantilla tiene que dejar la salida «responda BAJA»";
    const inicio = a.guion.find((g) => g.id === "saludo");
    if (inicio && !/inteligencia artificial/i.test(inicio.texto)) e.guion = "La llamada tiene que empezar diciendo que Sarah es una inteligencia artificial";
    if (a.horarioContacto.desde >= a.horarioContacto.hasta) e.horario = "La hora de inicio va antes que la de fin";
    setErrores(e);
    if (Object.keys(e).length) return;
    setGuardando(true);
    await guardarAjustes(a);
    setGuardando(false);
  };

  return (
    <>
      <div className="tit-fila">
        <div>
          <h1 className="tit-pagina">Configuración</h1>
          <p className="muted">Todo lo propio de la agencia vive aquí y no en el código. Otra agencia es otra instalación con su propia configuración.</p>
        </div>
        <Boton disabled={!cambios} cargando={guardando} onClick={guardar} icono={<Check size={16} />}>
          Guardar cambios
        </Boton>
      </div>

      <section className="grid g-2">
        <div className="card form-col">
          <h2 className="sec-h"><Building2 size={18} /> Agencia y correo</h2>
          <Campo etiqueta="Nombre de la agencia">
            <input className="input" value={a.agencia} onChange={(e) => setA({ ...a, agencia: e.target.value })} />
          </Campo>
          <Campo etiqueta="Buzón desde el que escribe Sarah" error={errores.buzon}>
            <input className="input" value={a.buzonSarah} onChange={(e) => setA({ ...a, buzonSarah: e.target.value })} />
          </Campo>
          <div className="form-grid">
            <Campo etiqueta="Avisos de fallo a" error={errores.avisos}>
              <input className="input" value={a.emailAvisos} onChange={(e) => setA({ ...a, emailAvisos: e.target.value })} />
            </Campo>
            <Campo etiqueta="Correo de respaldo" error={errores.respaldo}>
              <input className="input" value={a.emailRespaldo} onChange={(e) => setA({ ...a, emailRespaldo: e.target.value })} />
            </Campo>
          </div>
          <Campo etiqueta="Resumen «todo funciona»">
            <select className="select" value={a.resumen} onChange={(e) => setA({ ...a, resumen: e.target.value as Ajustes["resumen"] })}>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
            </select>
          </Campo>
        </div>

        <div className="card form-col">
          <h2 className="sec-h"><Clock4 size={18} /> Horarios y límites</h2>
          <div className="form-grid">
            <Campo etiqueta="Sarah contacta desde" error={errores.horario}>
              <input className="input" type="time" value={a.horarioContacto.desde} onChange={(e) => setA({ ...a, horarioContacto: { ...a.horarioContacto, desde: e.target.value } })} />
            </Campo>
            <Campo etiqueta="Hasta">
              <input className="input" type="time" value={a.horarioContacto.hasta} onChange={(e) => setA({ ...a, horarioContacto: { ...a.horarioContacto, hasta: e.target.value } })} />
            </Campo>
          </div>
          <Campo etiqueta="Días">
            <select className="select" value={a.horarioContacto.dias} onChange={(e) => setA({ ...a, horarioContacto: { ...a.horarioContacto, dias: e.target.value } })}>
              <option>Lunes a viernes</option>
              <option>Lunes a sábado</option>
            </select>
          </Campo>
          <div className="form-grid">
            <Campo etiqueta="Llamadas por captación">
              <select className="select" value={a.maxLlamadas} onChange={(e) => setA({ ...a, maxLlamadas: Number(e.target.value) })}>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Recordatorios en total">
              <select className="select" value={a.maxRecordatorios} onChange={(e) => setA({ ...a, maxRecordatorios: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Campo>
          </div>
          <div className="form-grid">
            <Campo etiqueta="El robot trabaja desde">
              <input className="input" type="time" value={a.horarioRobot.desde} onChange={(e) => setA({ ...a, horarioRobot: { ...a.horarioRobot, desde: e.target.value } })} />
            </Campo>
            <Campo etiqueta="Hasta">
              <input className="input" type="time" value={a.horarioRobot.hasta} onChange={(e) => setA({ ...a, horarioRobot: { ...a.horarioRobot, hasta: e.target.value } })} />
            </Campo>
          </div>
          <Campo etiqueta="Copia temporal de documentos" ayuda="Se borra al confirmar la subida a Mobilia, como mucho a los días que fijes.">
            <select className="select" value={a.conservarCopiaDias} onChange={(e) => setA({ ...a, conservarCopiaDias: Number(e.target.value) })}>
              {[1, 3, 7, 15, 30].map((n) => <option key={n} value={n}>{n} {n === 1 ? "día" : "días"}</option>)}
            </select>
          </Campo>
        </div>
      </section>

      <section className="grid g-2">
        <div className="card form-col">
          <h2 className="sec-h"><MessageSquareQuote size={18} /> Cómo escribe Sarah</h2>
          <Campo etiqueta="Primer mensaje" error={errores.saludo} ayuda="{vendedor}, {agencia}, {comercial} e {inmueble} se rellenan solos. Siempre dice que es una inteligencia artificial.">
            <textarea className="textarea" rows={3} value={a.saludoSarah} onChange={(e) => setA({ ...a, saludoSarah: e.target.value })} />
          </Campo>
          <Campo etiqueta="Plantilla de WhatsApp: pedir un documento" error={errores.plantilla} ayuda="{documento} es lo que falta según Mobilia. Plantilla aprobada por Meta antes de usarla.">
            <textarea className="textarea" rows={5} value={a.plantillaDocumento} onChange={(e) => setA({ ...a, plantillaDocumento: e.target.value })} />
          </Campo>
          <div className="burbuja previa">
            <small className="b-cc">Así le llega a la vendedora · ejemplo con Carmen y Javier</small>
            <p>{vista}</p>
          </div>
          <Campo etiqueta="Con vendedores extranjeros">
            <select className="select" value={a.idiomaExtranjeros} onChange={(e) => setA({ ...a, idiomaExtranjeros: e.target.value as Ajustes["idiomaExtranjeros"] })}>
              <option value="español">Siempre en español</option>
              <option value="suyo">En su idioma (inglés, alemán, francés, neerlandés)</option>
            </select>
          </Campo>
          <div className="idiomas">
            <span className="campo-et">Idiomas de los anuncios</span>
            {["Español", "Inglés", "Alemán"].map((l) => (
              <label key={l} className="chk">
                <input type="checkbox" checked={a.idiomas.includes(l)} disabled={l === "Español"} onChange={(e) => setA({ ...a, idiomas: e.target.checked ? [...a.idiomas, l] : a.idiomas.filter((x) => x !== l) })} />
                <span>{l}{l === "Español" ? " (obligatorio)" : ""}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="card form-col">
          <h2 className="sec-h"><PhoneCall size={18} /> Guion de la primera llamada</h2>
          <p className="muted pequeno">Llamadas cortas, de cinco a ocho minutos. Sarah solo pregunta lo que aún no consta en Mobilia, repite lo importante antes de colgar y lo que no entiende lo deja pendiente.</p>
          {errores.guion && <span className="campo-error">{errores.guion}</span>}
          <ol className="guion">
            {a.guion.map((g, i) => (
              <li key={g.id} className={g.fija ? "fija" : ""}>
                <span className="guion-n">{i + 1}</span>
                <div className="guion-txt">
                  <span className="guion-cuando">{g.cuando}{g.fija && <em><Lock size={12} /> Texto del manual, no se cambia</em>}</span>
                  {g.fija ? (
                    <p>{g.texto}</p>
                  ) : (
                    <textarea className="textarea" rows={Math.max(2, Math.ceil(g.texto.length / 52))} value={g.texto} aria-label={g.cuando} onChange={(e) => setA({ ...a, guion: a.guion.map((x) => (x.id === g.id ? { ...x, texto: e.target.value } : x)) })} />
                  )}
                  {!g.fija && <small className="muted">{rellenar(g.texto)}</small>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid g-2">
        <div className="card form-col">
          <h2 className="sec-h"><Repeat size={18} /> Para instalarlo en otra agencia</h2>
          <p>Esta pantalla, el manual convertido en diccionario de campos, los canales, la foto del local y los textos de Sarah son configuración. El código no lleva nada de {a.agencia}.</p>
          <ul className="lista-check">
            <li><Check size={15} /> Una instalación separada por agencia, con sus datos, su usuario de Mobilia, sus números y su buzón</li>
            <li><Check size={15} /> Nunca se mezclan datos de dos agencias</li>
            <li><Check size={15} /> Si la otra agencia usa otro CRM, solo cambia la pieza del conector</li>
          </ul>
          <Aviso tono="info">
            <span><Copy size={14} style={{ verticalAlign: "-2px" }} /> La configuración se exporta en un archivo y se carga en la instalación nueva.</span>
          </Aviso>
        </div>
      </section>
    </>
  );
}
