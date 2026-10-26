"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Ajustes, Alerta, Captacion, CanalContacto, Comercial, Familia, PantallaMobilia, PasoRobot, Registro, Servicio } from "./types";
import { AJUSTES_BASE, alertasBase, COMERCIALES, DIRECCION, pantallasBase, serviciosBase, canalesBase } from "./mock/agencia";
import { crearCaptaciones, galeria, textosDe } from "./mock/captaciones";
import { espera, revelaDireccion, uid } from "./format";
import { RETRATOS } from "./photos";
import { DOC_IMPRESCINDIBLES } from "./manual";

export interface Toast {
  id: string;
  texto: string;
  tono: "ok" | "error" | "info";
}

export interface NuevaCaptacion {
  familia: Familia;
  tipo: string;
  poblacion: string;
  zona: string;
  calle: string;
  campana: string;
  vendedor: string;
  telefono: string;
  email: string;
  canales: CanalContacto[];
  maxLlamadas: number;
  maxRecordatorios: number;
  comercialId: string;
  precio: number;
}

const emit = (nombre: string, detail?: unknown) => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(nombre, { detail }));
};

/** lo que todavía impide marcar DISPONIBLE, según la sección 6.12 del manual */
export function bloqueosDisponible(c: Captacion): string[] {
  const b: string[] = [];
  const conflictos = c.conflictos.filter((k) => k.elegida === undefined).length;
  if (conflictos) b.push(conflictos === 1 ? "Hay 1 dato en conflicto sin decidir" : `Hay ${conflictos} datos en conflicto sin decidir`);
  const pendGeneral = c.valores.filter((v) => v.bloque === "General" && v.estado === "pendiente").length;
  if (pendGeneral) b.push(pendGeneral === 1 ? "1 dato del bloque General sin rellenar ni marcar «no consta»" : `${pendGeneral} datos del bloque General sin rellenar ni marcar «no consta»`);
  if (c.valores.some((v) => v.bloque === "D. Internos" && v.estado === "pendiente")) b.push("D. Internos incompleto");
  const faltan = DOC_IMPRESCINDIBLES.filter((t) => !c.documentos.some((d) => d.tipo === t && d.estado === "subido"));
  if (faltan.length) b.push(`Falta: ${faltan.join(", ").toLowerCase()}`);
  const fotos = c.fotos.filter((f) => f.tipo === "foto").length;
  if (fotos < 25) b.push(fotos === 24 ? "24 fotos: falta 1 para llegar a 25" : `${fotos} fotos de 25 como mínimo`);
  const ult = c.fotos[c.fotos.length - 1];
  if (c.fotos.length && ult?.tipo !== "local") b.push("La foto del local no está la última");
  if (c.paso < 7) {
    if (!c.anuncioAprobadoVendedor) b.push("Textos, SEO y aprobación del vendedor todavía por llegar");
    return b;
  }
  const fuga = [c.textos.titulo, c.textos.corta, c.textos.ampliada, c.textos.seoTitulo, c.textos.seoDesc, c.textos.seoUrl].flatMap((t) => revelaDireccion(t, c));
  if (fuga.length) b.push(`Los textos dicen ${Array.from(new Set(fuga)).join(" y ")}`);
  if (c.textos.titulo.length > 50) b.push("Título de más de 50 caracteres");
  if (c.textos.seoTitulo.length < 40 || c.textos.seoTitulo.length > 70) b.push("Título SEO fuera de 40 a 70 caracteres");
  if (c.textos.seoDesc.length < 100 || c.textos.seoDesc.length > 170) b.push("Descripción SEO fuera de 100 a 170 caracteres");
  if (!c.anuncioAprobadoVendedor) b.push("El vendedor aún no ha aprobado el anuncio");
  return b;
}

interface Store {
  listo: boolean;
  tick: number;
  captaciones: Captacion[];
  comerciales: Comercial[];
  pantallas: PantallaMobilia[];
  alertas: Alerta[];
  servicios: Servicio[];
  ajustes: Ajustes;
  robotLog: PasoRobot[];
  robotActual: string | null;
  cola: string[];
  pausaGeneral: boolean;
  vista: string;
  ultimoToque: number;
  toasts: Toast[];
  toast: (texto: string, tono?: Toast["tono"]) => void;
  setVista: (v: string) => void;
  visibles: Captacion[];
  puedeAprobar: boolean;
  esDireccion: boolean;
  nombreDe: (id: string) => string;
  crearCaptacion: (n: NuevaCaptacion) => Promise<string>;
  pausar: (id: string) => Promise<void>;
  reanudar: (id: string) => Promise<void>;
  cancelar: (id: string, motivo: string) => Promise<void>;
  togglePausaGeneral: () => Promise<void>;
  resolverConflicto: (id: string, kId: string, opcion: number) => Promise<void>;
  deshacer: (id: string, valorId: string) => Promise<void>;
  aceptarPropuesta: (id: string, valorId: string, usarPropuesta: boolean) => Promise<void>;
  editarValor: (id: string, valorId: string, valor: string) => Promise<void>;
  anadirFoto: (id: string) => Promise<void>;
  moverFoto: (id: string, fotoId: string, dir: -1 | 1) => void;
  quitarFoto: (id: string, fotoId: string) => void;
  editarTextos: (id: string, campos: Partial<Captacion["textos"]>) => Promise<void>;
  aprobar: (id: string) => Promise<boolean>;
  excepcion: (id: string, motivo: string) => Promise<void>;
  simularCambioPantalla: () => void;
  repararPantalla: (pid: string) => Promise<void>;
  setPermiso: (cid: string, puede: boolean) => Promise<void>;
  setActivo: (cid: string, activo: boolean) => Promise<void>;
  crearComercial: (nombre: string, email: string) => Promise<void>;
  setLimites: (sid: Servicio["id"], mes: number, dia: number) => Promise<void>;
  guardarAjustes: (a: Ajustes) => Promise<void>;
  marcarLeida: (aid: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [listo, setListo] = useState(false);
  const [tick, setTick] = useState(0);
  const [captaciones, setCaptaciones] = useState<Captacion[]>([]);
  const [comerciales, setComerciales] = useState<Comercial[]>(COMERCIALES);
  const [pantallas, setPantallas] = useState<PantallaMobilia[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>(serviciosBase());
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_BASE);
  const [robotLog, setRobotLog] = useState<PasoRobot[]>([]);
  const [robotActual, setRobotActual] = useState<string | null>(null);
  const [cola, setCola] = useState<string[]>([]);
  const [pausaGeneral, setPausaGeneral] = useState(false);
  const [vista, setVistaState] = useState("dir");
  const [ultimoToque, setUltimoToque] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const capsRef = useRef<Captacion[]>([]);
  capsRef.current = captaciones;
  const paradoRef = useRef(false);
  const robotActualRef = useRef<string | null>(null);
  robotActualRef.current = robotActual;
  const toastPausa = useRef<((p: boolean) => void) | null>(null);

  const toast = useCallback((texto: string, tono: Toast["tono"] = "ok") => {
    const id = uid("t");
    setToasts((t) => [...t.slice(-3), { id, texto, tono }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // carga inicial con la latencia de una API real
  useEffect(() => {
    const ahora = Date.now();
    setTick(ahora);
    setUltimoToque(ahora - 131000);
    let vivo = true;
    (async () => {
      await espera(650);
      if (!vivo) return;
      const caps = crearCaptaciones(ahora);
      setCaptaciones(caps);
      setPantallas(pantallasBase(ahora));
      setAlertas(alertasBase(ahora));
      setRobotActual("c2440");
      setCola(["c2440", "c2433", "c2416"]);
      try {
        const v = window.localStorage.getItem("sarah-vista");
        if (v && (v === "dir" || COMERCIALES.some((c) => c.id === v))) setVistaState(v);
      } catch {}
      setListo(true);
    })();
    const iv = setInterval(() => setTick(Date.now()), 1000);
    return () => {
      vivo = false;
      clearInterval(iv);
    };
  }, []);

  const setVista = useCallback((v: string) => {
    setVistaState(v);
    try {
      window.localStorage.setItem("sarah-vista", v);
    } catch {}
  }, []);

  const parado = pausaGeneral || pantallas.some((p) => p.estado === "cambiada");
  paradoRef.current = parado;

  const actualizar = useCallback((id: string, fn: (c: Captacion) => Captacion) => {
    setCaptaciones((cs) => cs.map((c) => (c.id === id ? { ...fn(c), actualizada: new Date().toISOString() } : c)));
  }, []);

  const registrar = (c: Captacion, r: Omit<Registro, "id" | "fecha">): Captacion => ({
    ...c,
    registro: [...c.registro, { ...r, id: uid("r"), fecha: new Date().toISOString() }],
  });

  // el vigilante externo: un toque cada 5 minutos
  useEffect(() => {
    if (!listo || !ultimoToque) return;
    if (tick - ultimoToque >= 300000 && !pausaGeneral) setUltimoToque(tick);
  }, [tick, ultimoToque, listo, pausaGeneral]);

  // el robot: una ficha cada vez, un campo cada vez, con relectura
  useEffect(() => {
    if (!listo) return;
    const iv = setInterval(() => {
      if (paradoRef.current) return;
      const caps = capsRef.current;
      const actual = caps.find((c) => c.id === robotActualRef.current);
      if (!actual) return;
      const escribiendo = actual.valores.find((v) => v.estado === "escribiendo");
      if (escribiendo) {
        const pantalla = escribiendo.bloque === "D. Internos" ? "D. Internos" : "General";
        setCaptaciones((cs) =>
          cs.map((c) =>
            c.id === actual.id
              ? {
                  ...c,
                  actualizada: new Date().toISOString(),
                  valores: c.valores.map((v) => (v.id === escribiendo.id ? { ...v, estado: "comprobado", escrito: new Date().toISOString() } : v)),
                }
              : c,
          ),
        );
        setRobotLog((l) => [...l.slice(-60), { id: uid("p"), ref: actual.ref, pestana: pantalla, campo: escribiendo.campo, valor: escribiendo.valor || "no consta", t: Date.now(), ok: true }]);
        emit("sarah:escrito");
        return;
      }
      const siguiente = actual.valores.find((v) => v.bloque === "General" && v.estado === "pendiente");
      if (siguiente) {
        const valor = valorDeSarah(siguiente.campo, actual);
        setCaptaciones((cs) =>
          cs.map((c) =>
            c.id === actual.id
              ? { ...c, valores: c.valores.map((v) => (v.id === siguiente.id ? { ...v, valor, estado: "escribiendo", detalle: "Llamada de Sarah, hoy", anterior: "" } : v)) }
              : c,
          ),
        );
        return;
      }
      // ficha terminada en este bloque: pasa a la siguiente de la cola
      setCaptaciones((cs) =>
        cs.map((c) =>
          c.id === actual.id
            ? {
                ...c,
                paso: Math.max(c.paso, 4),
                estado: c.estado === "contactando" ? "documentacion" : c.estado,
                registro: [...c.registro, { id: uid("r"), fecha: new Date().toISOString(), quien: "Sistema", accion: "Bloque General completo: cada campo releído y comprobado", pestana: "General", resultado: "comprobado" }],
              }
            : c,
        ),
      );
      setCola((q) => {
        const resto = q.filter((x) => x !== actual.id);
        const sig = resto[0] ?? null;
        robotActualRef.current = sig;
        setRobotActual(sig);
        if (sig) {
          setCaptaciones((cs) => cs.map((c) => (c.id === sig ? { ...c, paso: Math.max(c.paso, 3), estado: c.estado === "esperando" ? "contactando" : c.estado } : c)));
        }
        return resto;
      });
      emit("sarah:ficha");
    }, 1900);
    return () => clearInterval(iv);
  }, [listo]);


  const nombreDe = useCallback((id: string) => (id === "dir" ? DIRECCION.nombre : comerciales.find((c) => c.id === id)?.nombre ?? ""), [comerciales]);
  const esDireccion = vista === "dir";
  const puedeAprobar = esDireccion || !!comerciales.find((c) => c.id === vista)?.puedeAprobar;
  const visibles = useMemo(() => (esDireccion ? captaciones : captaciones.filter((c) => c.comercialId === vista)), [captaciones, vista, esDireccion]);

  const crearCaptacion = useCallback(
    async (n: NuevaCaptacion) => {
      await espera(900);
      const ahora = Date.now();
      const num = 2442 + capsRef.current.filter((c) => Number(c.ref.slice(4)) >= 2442).length;
      const ref = `REF ${num}`;
      const id = `c${num}`;
      const com = comerciales.find((c) => c.id === n.comercialId);
      const base = crearCaptaciones(ahora)[0];
      const textos = textosDe({ tipo: n.tipo, poblacion: n.poblacion, zona: n.zona, m2: 100, hab: 3, banos: 2, familia: n.familia });
      const nueva: Captacion = {
        ...base,
        id,
        ref,
        alias: `${n.calle} · ${n.vendedor.split(" ").slice(-1)[0]}`,
        familia: n.familia,
        tipo: n.tipo,
        campana: n.campana,
        poblacion: n.poblacion,
        zona: n.zona,
        calle: n.calle,
        numero: "",
        planta: "",
        puerta: "",
        cp: "",
        precioDeseado: n.precio,
        m2: 0,
        habitaciones: 0,
        banos: 0,
        portada: base.portada,
        comercialId: n.comercialId,
        vendedor: { nombre: n.vendedor, telefono: n.telefono, email: n.email, whatsapp: n.canales.includes("whatsapp"), verificado: false },
        canales: n.canales,
        maxLlamadas: n.maxLlamadas,
        maxRecordatorios: n.maxRecordatorios,
        llamadas: 0,
        recordatorios: 0,
        estado: "abierta",
        paso: 0,
        creada: new Date(ahora).toISOString(),
        actualizada: new Date(ahora).toISOString(),
        proximoContacto: undefined,
        valores: base.valores.filter((v) => v.bloque === "General").map((v) => ({ ...v, id: `${id}-${v.id}`, valor: v.campo === "Tipo" ? n.tipo : "", estado: v.campo === "Tipo" ? ("comprobado" as const) : ("pendiente" as const), detalle: v.campo === "Tipo" ? "Orden de la captación" : "Sarah lo pide al vendedor", anterior: "" })),
        conflictos: [],
        documentos: base.documentos.map((d) => ({ ...d, id: `${id}-${d.id}`, estado: "pendiente" as const, fecha: undefined, archivo: undefined, extraidos: undefined, nota: undefined })),
        mensajes: [
          { id: uid("m"), canal: "sistema", de: "sistema", fecha: new Date(ahora).toISOString(), texto: `Orden de ${com?.nombre ?? "Dirección"}: contactar al vendedor por ${n.canales.join(", ")}, con ${n.maxLlamadas} llamadas y ${n.maxRecordatorios} recordatorios como máximo.` },
        ],
        fotos: [],
        textos,
        publicidad: canalesBase(),
        registro: [{ id: uid("r"), fecha: new Date(ahora).toISOString(), quien: com?.nombre ?? "Dirección", accion: "Abrió la captación y dio la orden a Sarah", resultado: "info" }],
        destacado: "NO SE PERMITE PUBLICAR. Captación recién abierta.",
        anuncioAprobadoVendedor: false,
        motivo: undefined,
        estadoAntesPausa: undefined,
      };
      setCaptaciones((cs) => [nueva, ...cs]);
      emit("sarah:nueva");
      // el sistema busca en Mobilia antes de crear y prepara la lista de lo que falta
      setTimeout(() => {
        actualizar(id, (c) =>
          registrar(
            registrar({ ...c, estado: "contactando", paso: 2, vendedor: { ...c.vendedor, verificado: true } }, { quien: "Sistema", accion: `Buscó «${n.calle}» en Mobilia antes de crear: ninguna ficha parecida`, pestana: "Inmuebles", resultado: "comprobado" }),
            { quien: "Sistema", accion: `Creó la ficha ${ref} y releyó tipo, alias y campaña`, pestana: "Inmuebles", resultado: "comprobado" },
          ),
        );
        actualizar(id, (c) => ({
          ...c,
          mensajes: [...c.mensajes, { id: uid("m"), canal: "sistema", de: "sistema", fecha: new Date().toISOString(), texto: `Ficha ${ref} creada en Mobilia. Faltan ${c.valores.filter((v) => v.estado === "pendiente").length} datos del bloque General y 8 documentos. Sarah no preguntará lo que ya consta.` }],
        }));
        setCola((q) => [...q, id]);
      }, 2600);
      return id;
    },
    [comerciales, actualizar],
  );

  const pausar = useCallback(async (id: string) => {
    await espera(500);
    actualizar(id, (c) => registrar({ ...c, estadoAntesPausa: c.estado, estado: "pausada", motivo: "Pausada desde el panel. Sarah no contacta y el sistema no escribe en esta ficha." }, { quien: "Panel", accion: "Pausó la captación", resultado: "info" }));
    toast("Captación pausada. Se comprueba justo antes de cada contacto.");
  }, [actualizar, toast]);

  const reanudar = useCallback(async (id: string) => {
    await espera(500);
    actualizar(id, (c) => registrar({ ...c, estado: c.estadoAntesPausa ?? "esperando", estadoAntesPausa: undefined, motivo: undefined }, { quien: "Panel", accion: "Reanudó la captación", resultado: "info" }));
    toast("Captación reanudada");
  }, [actualizar, toast]);

  const cancelar = useCallback(async (id: string, motivo: string) => {
    await espera(600);
    actualizar(id, (c) => registrar({ ...c, estado: "cancelada", motivo }, { quien: "Panel", accion: `Canceló la captación: ${motivo}`, resultado: "info" }));
    toast("Captación cancelada", "info");
  }, [actualizar, toast]);

  const togglePausaGeneral = useCallback(async () => {
    await espera(350);
    setPausaGeneral((p) => {
      const n = !p;
      emit(n ? "sarah:pausa" : "sarah:sigue");
      return n;
    });
  }, []);

  const pausaPrevia = useRef(false);
  useEffect(() => {
    if (!listo || pausaPrevia.current === pausaGeneral) return;
    pausaPrevia.current = pausaGeneral;
    toastPausa.current?.(pausaGeneral);
  }, [pausaGeneral, listo]);
  toastPausa.current = (p) => toast(p ? "Todo pausado: Sarah no contacta y el robot no escribe" : "Sistema en marcha otra vez", p ? "error" : "ok");

  const resolverConflicto = useCallback(async (id: string, kId: string, opcion: number) => {
    await espera(800);
    actualizar(id, (c) => {
      const k = c.conflictos.find((x) => x.id === kId);
      if (!k) return c;
      const elegido = k.opciones[opcion];
      const nuevo = registrar(
        {
          ...c,
          conflictos: c.conflictos.map((x) => (x.id === kId ? { ...x, elegida: opcion, resuelto: "Decidido en el panel, escrito y releído" } : x)),
          valores: c.valores.map((v) => (v.campo === k.campo ? { ...v, valor: elegido.valor, fuente: elegido.fuente, detalle: elegido.detalle, estado: "comprobado", anterior: v.valor } : v)),
          destacado: k.campo === "Hipoteca pendiente" ? c.destacado.replace(" Hipoteca: la nota simple muestra una carga inscrita.", "") : c.destacado,
        },
        { quien: "Dirección", accion: `Decidió «${elegido.valor}» y el sistema lo escribió`, campo: k.campo, despues: elegido.valor, pestana: "General", resultado: "comprobado" },
      );
      return nuevo;
    });
    emit("sarah:escrito");
    toast("Decisión guardada, escrita en Mobilia y releída");
  }, [actualizar, toast]);

  const deshacer = useCallback(async (id: string, valorId: string) => {
    await espera(700);
    actualizar(id, (c) => {
      const v = c.valores.find((x) => x.id === valorId);
      if (!v || v.anterior === undefined || v.anterior === null) return c;
      return registrar(
        { ...c, valores: c.valores.map((x) => (x.id === valorId ? { ...x, valor: v.anterior ?? "", anterior: v.valor, estado: "comprobado", detalle: "Restaurado desde el panel" } : x)) },
        { quien: "Dirección", accion: "Deshizo la escritura y releyó el valor anterior", campo: v.campo, antes: v.valor, despues: v.anterior || "(vacío)", pestana: v.bloque === "D. Internos" ? "D. Internos" : "General", resultado: "deshecho" },
      );
    });
    emit("sarah:deshecho");
    toast("Valor anterior restaurado en Mobilia y releído");
  }, [actualizar, toast]);

  const aceptarPropuesta = useCallback(async (id: string, valorId: string, usarPropuesta: boolean) => {
    await espera(650);
    actualizar(id, (c) => {
      const v = c.valores.find((x) => x.id === valorId);
      if (!v) return c;
      const final = usarPropuesta ? v.valor : v.anterior ?? v.valor;
      return registrar(
        { ...c, valores: c.valores.map((x) => (x.id === valorId ? { ...x, valor: final, estado: "comprobado", anterior: usarPropuesta ? v.anterior : null, detalle: usarPropuesta ? "Aprobado en el panel" : "Se mantiene lo que escribió el comercial" } : x)) },
        { quien: "Dirección", accion: usarPropuesta ? "Aceptó la propuesta y el sistema la escribió" : "Mantuvo el dato del comercial", campo: v.campo, antes: v.anterior, despues: final, pestana: "General", resultado: "comprobado" },
      );
    });
    emit("sarah:escrito");
    toast(usarPropuesta ? "Propuesta escrita y releída" : "Se mantiene el dato del comercial");
  }, [actualizar, toast]);

  const editarValor = useCallback(async (id: string, valorId: string, valor: string) => {
    await espera(700);
    actualizar(id, (c) => {
      const v = c.valores.find((x) => x.id === valorId);
      if (!v) return c;
      return registrar(
        { ...c, valores: c.valores.map((x) => (x.id === valorId ? { ...x, valor, anterior: v.valor, fuente: "comercial", detalle: "Corregido en el panel", estado: "comprobado" } : x)) },
        { quien: "Dirección", accion: "Corrigió el dato y el sistema lo escribió", campo: v.campo, antes: v.valor || "(vacío)", despues: valor, pestana: v.bloque === "D. Internos" ? "D. Internos" : "General", resultado: "comprobado" },
      );
    });
    emit("sarah:escrito");
    toast("Dato corregido, escrito y releído");
  }, [actualizar, toast]);

  const anadirFoto = useCallback(async (id: string) => {
    await espera(1100);
    actualizar(id, (c) => {
      const extra = galeria(c, 30, 77).filter((f) => f.tipo === "foto")[c.fotos.length % 20];
      const fotos = [...c.fotos.filter((f) => f.tipo === "foto"), { ...extra, id: uid("f"), desc: "Vista de la terraza al atardecer" }, ...c.fotos.filter((f) => f.tipo !== "foto")];
      return registrar(
        { ...c, fotos, destacado: c.destacado.replace("Falta 1 foto para llegar a 25. ", "") },
        { quien: "Sistema", accion: `Subió la foto ${fotos.filter((f) => f.tipo === "foto").length}, recolocó plano y foto del local al final y releyó el orden`, pestana: "Multimedia", resultado: "comprobado" },
      );
    });
    emit("sarah:foto");
    toast("Foto subida a Mobilia. Orden releído: fotos, plano y local al final");
  }, [actualizar, toast]);

  const moverFoto = useCallback((id: string, fotoId: string, dir: -1 | 1) => {
    actualizar(id, (c) => {
      const props = c.fotos.filter((f) => f.tipo === "foto");
      const i = props.findIndex((f) => f.id === fotoId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= props.length) return c;
      const n = [...props];
      [n[i], n[j]] = [n[j], n[i]];
      return { ...c, fotos: [...n, ...c.fotos.filter((f) => f.tipo !== "foto")] };
    });
  }, [actualizar]);

  const quitarFoto = useCallback((id: string, fotoId: string) => {
    actualizar(id, (c) => registrar({ ...c, fotos: c.fotos.filter((f) => f.id !== fotoId) }, { quien: "Dirección", accion: "Quitó una foto de la galería", pestana: "Multimedia", resultado: "comprobado" }));
    toast("Foto quitada de la ficha", "info");
  }, [actualizar, toast]);

  const editarTextos = useCallback(async (id: string, campos: Partial<Captacion["textos"]>) => {
    await espera(800);
    actualizar(id, (c) => registrar({ ...c, textos: { ...c.textos, ...campos }, destacado: c.ref === "REF 2427" ? "Lista para tu revisión." : c.destacado }, { quien: "Dirección", accion: "Editó los textos del anuncio. Releídos: Mobilia ya no marca «texto demasiado corto»", pestana: "General", resultado: "comprobado" }));
    toast("Textos guardados en Mobilia y releídos");
  }, [actualizar, toast]);

  const aprobar = useCallback(async (id: string) => {
    const c = capsRef.current.find((x) => x.id === id);
    if (!c || bloqueosDisponible(c).length) return false;
    if (paradoRef.current) {
      toast("El sistema está parado. Reanúdalo para publicar.", "error");
      return false;
    }
    // canal a canal, cada uno con solo la calle y releído; DISPONIBLE al final
    for (const p of c.publicidad) {
      await espera(260);
      actualizar(id, (x) => ({
        ...x,
        publicidad: x.publicidad.map((q) => (q.id === p.id ? { ...q, marcado: true, direccion: q.direccion === "Zona" ? "Zona" : "Solo calle", corregido: q.corregido || q.direccion === "Calle y número" || q.direccion === "Dirección completa" } : q)),
      }));
      emit("sarah:canal", p.id);
    }
    await espera(500);
    actualizar(id, (x) =>
      registrar(
        registrar({ ...x, estado: "publicada", paso: 11, destacado: "Ficha completa. Nada pendiente." }, { quien: "Sistema", accion: "Marcó los 14 canales con solo la calle y releyó cada uno: ningún número publicado", pestana: "Publicidad", resultado: "comprobado" }),
        { quien: "Sistema", accion: "Marcó la casilla DISPONIBLE, la última", pestana: "General", resultado: "comprobado" },
      ),
    );
    emit("sarah:disponible");
    toast(`${c.ref} publicada. DISPONIBLE marcada la última`);
    return true;
  }, [actualizar, toast]);

  const excepcion = useCallback(async (id: string, motivo: string) => {
    await espera(700);
    actualizar(id, (c) => registrar({ ...c, motivo: `Excepción decidida: ${motivo}`, destacado: `Excepción: ${motivo}` }, { quien: "Dirección", accion: `Decidió una excepción con motivo: ${motivo}`, resultado: "info" }));
    toast("Excepción registrada con su motivo");
  }, [actualizar, toast]);

  const simularCambioPantalla = useCallback(() => {
    const ahora = new Date().toISOString();
    setPantallas((ps) => ps.map((p) => (p.id === "general" ? { ...p, estado: "cambiada", ultima: ahora, detalle: "Falta la etiqueta «Basuras €» donde estaba. Hay un campo nuevo, «Tasas municipales»." } : p)));
    const afectadas = capsRef.current.filter((c) => cola.includes(c.id)).map((c) => c.ref);
    setAlertas((a) => [
      {
        id: uid("al"),
        fecha: ahora,
        asunto: "Captaciones paradas: Mobilia ha cambiado la pantalla General",
        cuerpo: [
          "Al entrar en la pestaña General, la pantalla no coincide con su huella: falta la etiqueta «Basuras €» y aparece un campo nuevo.",
          "El sistema se paró sin escribir nada. Ningún dato quedó a medias.",
          `Afectadas: ${afectadas.join(", ") || "ninguna en curso"}. Sarah sigue hablando con los vendedores y el resto funciona.`,
          "Para seguir hace falta adaptar el conector a la pantalla nueva.",
        ],
        tipo: "fallo",
        afectadas,
        leida: false,
      },
      ...a,
    ]);
    emit("sarah:cambio");
  }, [cola]);

  const repararPantalla = useCallback(async (pid: string) => {
    await espera(1200);
    setPantallas((ps) => ps.map((p) => (p.id === pid ? { ...p, estado: "ok", ultima: new Date().toISOString(), detalle: undefined } : p)));
    setAlertas((a) => a.map((x) => (x.asunto.includes("cambiado la pantalla") ? { ...x, resuelta: true, leida: true } : x)));
    emit("sarah:sigue");
    toast("Conector adaptado. El robot retoma la cola donde la dejó");
  }, [toast]);

  const setPermiso = useCallback(async (cid: string, puede: boolean) => {
    await espera(450);
    setComerciales((cs) => cs.map((c) => (c.id === cid ? { ...c, puedeAprobar: puede } : c)));
    toast(puede ? "Ahora puede aprobar publicaciones" : "Ya no puede aprobar publicaciones");
  }, [toast]);

  const setActivo = useCallback(async (cid: string, activo: boolean) => {
    await espera(500);
    setComerciales((cs) => cs.map((c) => (c.id === cid ? { ...c, activo } : c)));
    toast(activo ? "Cuenta reactivada" : "Cuenta dada de baja. Su acceso al panel se cortó al instante", activo ? "ok" : "info");
  }, [toast]);

  const crearComercial = useCallback(async (nombre: string, email: string) => {
    await espera(800);
    setComerciales((cs) => [...cs, { id: uid("c"), nombre, email, telefono: "", foto: RETRATOS[cs.length % RETRATOS.length], puedeAprobar: false, activo: true, desde: "2026" }]);
    toast(`Cuenta creada para ${nombre}. Le llega la invitación por email`);
  }, [toast]);

  const setLimites = useCallback(async (sid: Servicio["id"], mes: number, dia: number) => {
    await espera(600);
    setServicios((ss) => ss.map((s) => (s.id === sid ? { ...s, limiteMes: mes, limiteDia: dia } : s)));
    toast("Límites guardados. Aviso al 80 % y pausa al 100 %");
  }, [toast]);

  const guardarAjustes = useCallback(async (a: Ajustes) => {
    await espera(900);
    setAjustes(a);
    toast("Configuración guardada");
  }, [toast]);

  const marcarLeida = useCallback((aid: string) => setAlertas((a) => a.map((x) => (x.id === aid ? { ...x, leida: true } : x))), []);

  const valor = useMemo<Store>(
    () => ({
      listo, tick, captaciones, comerciales, pantallas, alertas, servicios, ajustes, robotLog, robotActual, cola, pausaGeneral, vista, ultimoToque, toasts, toast, setVista,
      visibles, puedeAprobar, esDireccion, nombreDe,
      crearCaptacion, pausar, reanudar, cancelar, togglePausaGeneral, resolverConflicto, deshacer, aceptarPropuesta, editarValor, anadirFoto, moverFoto, quitarFoto, editarTextos, aprobar, excepcion,
      simularCambioPantalla, repararPantalla, setPermiso, setActivo, crearComercial, setLimites, guardarAjustes, marcarLeida,
    }),
    [listo, tick, captaciones, comerciales, pantallas, alertas, servicios, ajustes, robotLog, robotActual, cola, pausaGeneral, vista, ultimoToque, toasts, toast, setVista, visibles, puedeAprobar, esDireccion, nombreDe, crearCaptacion, pausar, reanudar, cancelar, togglePausaGeneral, resolverConflicto, deshacer, aceptarPropuesta, editarValor, anadirFoto, moverFoto, quitarFoto, editarTextos, aprobar, excepcion, simularCambioPantalla, repararPantalla, setPermiso, setActivo, crearComercial, setLimites, guardarAjustes, marcarLeida],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore fuera del proveedor");
  return s;
}

/** lo que Sarah obtuvo del vendedor para un campo (la conversación de la casa adosada de Moraira) */
function valorDeSarah(campo: string, c: Captacion): string {
  const casa = c.familia !== "Piso";
  const mapa: Record<string, string> = {
    "Gastos de comunidad": casa ? "38 €/mes" : "72 €/mes",
    "Hipoteca pendiente": "NO",
    "m² jardín": "180 m²",
    "m² terrazas": "26 m²",
    Orientación: "Sur",
    "Terrazas y balcones": "2",
    "Estado de conservación": "Buen estado",
    "Inspección ITE": casa ? "No aplica" : "Superada en 2023",
    "Habitaciones y baños": `${c.habitaciones} dormitorios · ${c.banos} baños`,
    "Plantas de la propiedad": "2",
    "Plantas del edificio": "5",
    "Altura (planta)": c.planta ? `${c.planta}ª, interno` : "",
    Ascensor: casa ? "No" : "Sí",
    "Carpintería interior": "Madera",
    "Carpintería exterior": "Aluminio",
    Suelos: "Baldosa",
    Amueblado: "No",
    "Armarios empotrados": "Sí",
    "Plazas de garaje": "1",
    Calefacción: "No tiene (el split no cuenta)",
    "Aire acondicionado": "Sí",
    Gas: "No",
    Trasteros: "1",
    Piscina: "Comunitaria",
    "Cartel en inmueble": "Sí, lo permite",
    "Certificado energético": "Pendiente certificar",
    "m² construidos": `${c.m2} m²`,
    "m² útiles": `${Math.round(c.m2 * 0.86)} m²`,
    "Año de construcción": "2004",
    Basuras: "96 €/año",
    "I.B.I": "512 €/año",
  };
  return mapa[campo] ?? "no consta";
}

