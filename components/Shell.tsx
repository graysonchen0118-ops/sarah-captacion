"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Bot, FolderOpen, Home, LayoutDashboard, Menu, OctagonPause, Play, Settings, Users, X } from "lucide-react";
import { Fondo } from "./three/Scenes";
import { Avatar, Toasts } from "./ui";
import { useStore } from "@/lib/store";
import { DIRECCION, MARCA } from "@/lib/mock/agencia";
import { haceCuanto } from "@/lib/format";

const NAV = [
  { href: "/", texto: "Inicio", icono: LayoutDashboard },
  { href: "/captaciones", texto: "Captaciones", icono: FolderOpen, cuenta: "revisar" as const },
  { href: "/robot", texto: "Robot de Mobilia", icono: Bot, cuenta: "robot" as const },
  { href: "/avisos", texto: "Avisos y gasto", icono: Bell, cuenta: "avisos" as const },
  { href: "/equipo", texto: "Equipo", icono: Users, soloDir: true },
  { href: "/ajustes", texto: "Configuración", icono: Settings, soloDir: true },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [cambiando, setCambiando] = useState(false);
  const { visibles, alertas, pantallas, listo, tick, pausaGeneral, togglePausaGeneral, vista, setVista, comerciales, esDireccion, ultimoToque } = useStore();
  const robotParado = pausaGeneral || pantallas.some((p) => p.estado === "cambiada");
  const cuentas = {
    revisar: visibles.filter((c) => c.estado === "revisar").length,
    avisos: alertas.filter((a) => !a.leida && a.tipo !== "resumen").length,
    robot: robotParado ? 1 : 0,
  };
  const actual = NAV.find((n) => (n.href === "/" ? ruta === "/" : ruta.startsWith(n.href)));
  const yo = esDireccion ? { nombre: DIRECCION.nombre, foto: DIRECCION.foto, cargo: DIRECCION.cargo } : (() => {
    const c = comerciales.find((x) => x.id === vista);
    return { nombre: c?.nombre ?? "", foto: c?.foto ?? "", cargo: "Comercial" };
  })();

  useEffect(() => setAbierto(false), [ruta]);

  const pausa = async () => {
    setCambiando(true);
    await togglePausaGeneral();
    setCambiando(false);
  };

  return (
    <div className="app">
      <Fondo />
      <aside className={`sidebar ${abierto ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Home size={20} strokeWidth={2.4} />
          </span>
          <span className="brand-txt">
            <strong>{MARCA.nombre}</strong>
            <small>{MARCA.lema}</small>
          </span>
          <button className="icon-btn cerrar-menu" onClick={() => setAbierto(false)} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>
        <nav className="nav">
          {NAV.filter((n) => !n.soloDir || esDireccion).map((n) => {
            const on = actual?.href === n.href;
            const cuenta = n.cuenta ? cuentas[n.cuenta] : 0;
            const Ic = n.icono;
            return (
              <Link key={n.href} href={n.href} className={`nav-item ${on ? "on" : ""}`}>
                <Ic size={19} />
                <span>{n.texto}</span>
                {listo && cuenta > 0 && (n.cuenta === "robot" ? <em className="cuenta roja">Parado</em> : <em className={n.cuenta === "avisos" ? "cuenta roja" : "cuenta"}>{cuenta}</em>)}
              </Link>
            );
          })}
        </nav>
        <div className="side-foot">
          <div className="senal">
            <span className="senal-ic">
              <Bot size={16} />
            </span>
            <div>
              <small>Vigilante externo</small>
              <strong>{listo && ultimoToque ? `Último toque ${haceCuanto(new Date(ultimoToque).toISOString(), tick)}` : "Conectando"}</strong>
            </div>
            {pausaGeneral ? <span className="punto-gris" /> : <span className="punto-vivo" aria-label="Sistema vivo" />}
          </div>
          <label className="ver-como">
            <small>Ver el panel como</small>
            <select className="select" value={vista} onChange={(e) => setVista(e.target.value)} aria-label="Ver el panel como">
              <option value="dir">Dirección (todo)</option>
              {comerciales.filter((c) => c.activo).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>
          <div className="quien">
            {yo.foto ? <Avatar src={yo.foto} alt={yo.nombre} size={38} /> : <span className="avatar" style={{ width: 38, height: 38 }} />}
            <div>
              <strong>{yo.nombre}</strong>
              <small>{yo.cargo} · {MARCA.agencia}</small>
            </div>
          </div>
        </div>
      </aside>
      <div className={`scrim ${abierto ? "show" : ""}`} onClick={() => setAbierto(false)} />
      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setAbierto(true)} aria-label="Abrir menú">
            <Menu size={20} />
          </button>
          <div className="top-tit">
            <small>{MARCA.agencia}</small>
            <strong>{actual?.texto ?? "Expediente"}</strong>
          </div>
          <div className="top-der">
            <span className="reloj-chip">
              {robotParado ? <span className="punto-gris" /> : <span className="punto-vivo" />} {robotParado ? "Robot parado" : "Robot trabajando"}
            </span>
            {esDireccion && (
              <button className={`btn btn-sm ${pausaGeneral ? "btn-primario" : "btn-peligro"} pausa-btn`} onClick={pausa} disabled={cambiando || !listo}>
                {pausaGeneral ? <Play size={16} /> : <OctagonPause size={16} />}
                <span>{pausaGeneral ? "Reanudar todo" : "Pausa general"}</span>
              </button>
            )}
          </div>
        </header>
        {pausaGeneral && (
          <div className="banda-pausa" role="status">
            <OctagonPause size={18} />
            <span>
              <strong>Todo pausado.</strong> Sarah no contacta a nadie y el robot no escribe en Mobilia. Lo guardado sigue a salvo y la pausa no depende de la IA.
            </span>
          </div>
        )}
        <main className="content">{children}</main>
        <footer className="footer">
          <span>© 2026 {MARCA.agencia} · {MARCA.nombre}, {MARCA.lema.toLowerCase()}</span>
          <span>Fotos: Unsplash</span>
        </footer>
      </div>
      <Toasts />
    </div>
  );
}
