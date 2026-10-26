"use client";

import { useState } from "react";
import { Eye, Lock, Mail, ShieldCheck, UserMinus, UserPlus, UserRoundCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Aviso, Badge, Boton, Campo, Modal, Tilt, Vacio } from "@/components/ui";

export default function Equipo() {
  const { comerciales, captaciones, setPermiso, setActivo, crearComercial, setVista, esDireccion } = useStore();
  const [nuevo, setNuevo] = useState(false);
  const [trabajando, setTrabajando] = useState<string | null>(null);

  if (!esDireccion)
    return <Vacio icono={<Lock size={26} />} titulo="Solo para dirección" texto="Crear cuentas, dar de baja y cambiar permisos lo hace solo el administrador, con inicio de sesión fuerte reciente." />;

  return (
    <>
      <div className="tit-fila">
        <div>
          <h1 className="tit-pagina">Equipo</h1>
          <p className="muted">Cada comercial entra al panel con su cuenta y en Mobilia sigue con su usuario de siempre. El usuario de Mobilia del sistema no lo usa nadie más.</p>
        </div>
        <Boton icono={<UserPlus size={17} />} onClick={() => setNuevo(true)}>
          Nueva cuenta
        </Boton>
      </div>

      <Aviso tono="info">Hoy sois {comerciales.filter((c) => c.activo).length}. Activar una cuenta más es un minuto desde «Nueva cuenta» y no cuesta nada. Cada comercial solo ve y gestiona sus propiedades: el permiso se comprueba en el servidor en cada consulta. La copia de los emails va solo al comercial de esa propiedad, y tú no vas en copia de las suyas.</Aviso>

      <div className="equipo">
        {comerciales.map((c, i) => {
          const suyas = captaciones.filter((x) => x.comercialId === c.id);
          const abiertas = suyas.filter((x) => !["publicada", "cancelada"].includes(x.estado)).length;
          return (
            <Tilt key={c.id} className="eq-tilt" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`card miembro ${c.activo ? "" : "baja"}`}>
                <div className="mi-cab">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="avatar" src={c.foto} alt={c.nombre} width={56} height={56} style={{ width: 56, height: 56 }} loading="lazy" />
                  <div>
                    <strong>{c.nombre}</strong>
                    <small>
                      <Mail size={12} /> {c.email}
                    </small>
                    {c.activo ? <Badge tono="ok" punto>Activa</Badge> : <Badge tono="error">Dada de baja</Badge>}
                  </div>
                </div>
                <div className="mi-num">
                  <span>
                    <b>{abiertas}</b> en curso
                  </span>
                  <span>
                    <b>{suyas.filter((x) => x.estado === "publicada").length}</b> publicadas
                  </span>
                  <span>
                    <b>{c.desde}</b> en la agencia
                  </span>
                </div>
                <label className={`perm ${!c.activo ? "off" : ""}`}>
                  <span>
                    <ShieldCheck size={15} /> Puede aprobar publicaciones y marcar DISPONIBLE
                  </span>
                  <input
                    type="checkbox"
                    className="switch"
                    checked={c.puedeAprobar}
                    disabled={!c.activo || trabajando === c.id}
                    onChange={async (e) => {
                      setTrabajando(c.id);
                      await setPermiso(c.id, e.target.checked);
                      setTrabajando(null);
                    }}
                  />
                </label>
                <div className="mi-acc">
                  <button className="btn btn-sm btn-ghost" onClick={() => setVista(c.id)} disabled={!c.activo}>
                    <Eye size={15} />
                    <span>Ver como {c.nombre.split(" ")[0]}</span>
                  </button>
                  <button
                    className={`btn btn-sm ${c.activo ? "btn-peligro-suave" : "btn-secundario"}`}
                    disabled={trabajando === c.id}
                    onClick={async () => {
                      setTrabajando(c.id);
                      await setActivo(c.id, !c.activo);
                      setTrabajando(null);
                    }}
                  >
                    {c.activo ? <UserMinus size={15} /> : <UserRoundCheck size={15} />}
                    <span>{c.activo ? "Dar de baja" : "Reactivar"}</span>
                  </button>
                </div>
              </div>
            </Tilt>
          );
        })}
      </div>
      <NuevaCuenta abierto={nuevo} onCerrar={() => setNuevo(false)} crear={crearComercial} />
    </>
  );
}

function NuevaCuenta({ abierto, onCerrar, crear }: { abierto: boolean; onCerrar: () => void; crear: (n: string, e: string) => Promise<void> }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<{ n?: string; e?: string }>({});
  const [ocupado, setOcupado] = useState(false);
  return (
    <Modal
      abierto={abierto}
      titulo="Nueva cuenta de comercial"
      onCerrar={onCerrar}
      ancho={440}
      pie={
        <>
          <button className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
          <Boton
            cargando={ocupado}
            onClick={async () => {
              const e: typeof err = {};
              if (nombre.trim().length < 3) e.n = "Nombre y apellido";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.e = "Email no válido";
              setErr(e);
              if (Object.keys(e).length) return;
              setOcupado(true);
              await crear(nombre.trim(), email.trim());
              setOcupado(false);
              setNombre("");
              setEmail("");
              onCerrar();
            }}
          >
            Crear e invitar
          </Boton>
        </>
      }
    >
      <div className="form-col">
        <Campo etiqueta="Nombre" error={err.n}>
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellido" />
        </Campo>
        <Campo etiqueta="Email" error={err.e} ayuda="Es también la dirección que irá en copia de los emails de sus propiedades.">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@costaserena.es" />
        </Campo>
        <p className="muted pequeno">Empieza sin permiso para aprobar. No cuesta nada más por cuenta.</p>
      </div>
    </Modal>
  );
}
