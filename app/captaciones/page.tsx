"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDownUp, FolderSearch, LayoutGrid, List, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { BotonNueva, EstadoBadge, FichaMini, Progreso } from "@/components/piezas";
import { Paginacion, Skel, Vacio } from "@/components/ui";
import { ESTADOS, ORDEN_ESTADOS, PASOS } from "@/lib/manual";
import { haceCuanto, norm, precio } from "@/lib/format";
import type { Estado } from "@/lib/types";

const POR_PAGINA = 12;

function Lista() {
  const { listo, visibles, comerciales, tick, esDireccion } = useStore();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<Estado | "todas">((params.get("estado") as Estado) || "todas");
  const [comercial, setComercial] = useState("todos");
  const [poblacion, setPoblacion] = useState("todas");
  const [orden, setOrden] = useState<"actualizada" | "precio" | "ref" | "paso">("actualizada");
  const [vistaGrid, setVistaGrid] = useState(false);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const e = params.get("estado") as Estado | null;
    if (e) setEstado(e);
  }, [params]);
  useEffect(() => setPagina(1), [q, estado, comercial, poblacion, orden]);

  const poblaciones = useMemo(() => Array.from(new Set(visibles.map((c) => c.poblacion))).sort(), [visibles]);

  const filtradas = useMemo(() => {
    const t = norm(q);
    const r = visibles.filter((c) => {
      if (estado !== "todas" && c.estado !== estado) return false;
      if (comercial !== "todos" && c.comercialId !== comercial) return false;
      if (poblacion !== "todas" && c.poblacion !== poblacion) return false;
      if (t && !norm(`${c.ref} ${c.alias} ${c.vendedor.nombre} ${c.zona} ${c.poblacion} ${c.tipo}`).includes(t)) return false;
      return true;
    });
    return r.sort((a, b) => {
      if (orden === "precio") return b.precioDeseado - a.precioDeseado;
      if (orden === "ref") return b.ref.localeCompare(a.ref);
      if (orden === "paso") return b.paso - a.paso;
      return b.actualizada.localeCompare(a.actualizada);
    });
  }, [visibles, q, estado, comercial, poblacion, orden]);

  const pagina0 = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const cuentaEstado = (e: Estado) => visibles.filter((c) => c.estado === e).length;

  return (
    <>
      <div className="tit-fila">
        <div>
          <h1 className="tit-pagina">Captaciones</h1>
          <p className="muted">Cada propiedad es un expediente: una respuesta por cualquier canal actualiza el mismo, nunca abre otro.</p>
        </div>
        <BotonNueva />
      </div>

      <div className="chips-estado" role="tablist" aria-label="Estados">
        <button className={`chip ${estado === "todas" ? "on" : ""}`} onClick={() => setEstado("todas")}>
          Todas <em>{listo ? visibles.length : ""}</em>
        </button>
        {ORDEN_ESTADOS.map((e) => (
          <button key={e} className={`chip ${estado === e ? "on" : ""}`} onClick={() => setEstado(e)}>
            {ESTADOS[e].texto} <em>{listo ? cuentaEstado(e) : ""}</em>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <label className="buscar">
            <Search size={17} />
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por referencia, vendedor, zona o alias" aria-label="Buscar" />
          </label>
          {esDireccion && (
            <select className="select" value={comercial} onChange={(e) => setComercial(e.target.value)} aria-label="Comercial">
              <option value="todos">Todos los comerciales</option>
              {comerciales.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
          <select className="select" value={poblacion} onChange={(e) => setPoblacion(e.target.value)} aria-label="Población">
            <option value="todas">Todas las poblaciones</option>
            {poblaciones.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <label className="orden">
            <ArrowDownUp size={16} />
            <select className="select" value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)} aria-label="Ordenar">
              <option value="actualizada">Última actividad</option>
              <option value="paso">Más avanzadas</option>
              <option value="precio">Precio</option>
              <option value="ref">Referencia</option>
            </select>
          </label>
          <div className="seg seg-sm" role="radiogroup" aria-label="Vista">
            <button className={`seg-op ${!vistaGrid ? "on" : ""}`} onClick={() => setVistaGrid(false)} aria-label="Lista">
              <List size={16} />
            </button>
            <button className={`seg-op ${vistaGrid ? "on" : ""}`} onClick={() => setVistaGrid(true)} aria-label="Fichas">
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {!listo ? (
          <div className="form-col" style={{ marginTop: 14 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skel key={i} alto={62} />
            ))}
          </div>
        ) : !filtradas.length ? (
          <Vacio icono={<FolderSearch size={26} />} titulo="Ninguna captación con esos filtros" texto="Prueba con otra zona o quita el filtro de estado." accion={<button className="btn btn-ghost" onClick={() => { setQ(""); setEstado("todas"); setComercial("todos"); setPoblacion("todas"); }}>Quitar filtros</button>} />
        ) : vistaGrid ? (
          <div className="fichas-grid">
            {pagina0.map((c) => {
              const com = comerciales.find((x) => x.id === c.comercialId);
              return <FichaMini key={c.id} c={c} nombreComercial={com?.nombre ?? ""} fotoComercial={com?.foto ?? ""} />;
            })}
          </div>
        ) : (
          <div className="tabla">
            <div className="tabla-head">
              <span>Propiedad</span>
              <span>Vendedor</span>
              <span>Paso del manual</span>
              <span>Estado</span>
              <span>Actividad</span>
            </div>
            {pagina0.map((c, i) => {
              const com = comerciales.find((x) => x.id === c.comercialId);
              return (
                <Link key={c.id} href={`/captaciones/${c.id}`} className="tabla-fila" style={{ animationDelay: `${i * 30}ms` }}>
                  <span className="tf-prop">
                    {c.portada ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.portada.replace(/w=\d+/, "w=160").replace(/h=\d+/, "h=120")} alt="" width={64} height={48} loading="lazy" />
                    ) : (
                      <span className="tf-img-vacia" />
                    )}
                    <span>
                      <strong>
                        {c.ref} · {c.tipo} en {c.zona}
                      </strong>
                      <small>
                        {c.poblacion} · {precio(c.precioDeseado)} · {c.alias}
                      </small>
                    </span>
                  </span>
                  <span className="tf-vend">
                    <strong>{c.vendedor.nombre}</strong>
                    <small>{com?.nombre}</small>
                  </span>
                  <span className="tf-paso">
                    <Progreso c={c} />
                    <small>{c.estado === "publicada" ? "Terminada" : PASOS[Math.min(c.paso, 10)].nombre}</small>
                  </span>
                  <span className="tf-estado">
                    <EstadoBadge estado={c.estado} />
                  </span>
                  <span className="tf-act">{haceCuanto(c.actualizada, tick)}</span>
                </Link>
              );
            })}
          </div>
        )}
        <Paginacion pagina={pagina} total={filtradas.length} porPagina={POR_PAGINA} onCambio={setPagina} />
      </div>
    </>
  );
}

export default function Captaciones() {
  return (
    <Suspense fallback={<Skel alto={300} />}>
      <Lista />
    </Suspense>
  );
}
