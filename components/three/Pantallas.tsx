"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { damp, lienzoTexto, montar, sombraSuave, css, hex } from "./kit";
import type { PantallaMobilia } from "@/lib/types";

// Las pantallas de Mobilia que usa el robot, en arco. Un haz pasa por cada una comprobando su huella;
// la ficha en curso salta a la pestaña donde se escribe, y una pantalla cambiada se pone roja y frena todo.

export default function Pantallas({ pantallas, activa, parado }: { pantallas: PantallaMobilia[]; activa: string; parado: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const datos = useRef({ pantallas, activa, parado });
  datos.current = { pantallas, activa, parado };
  const n = pantallas.length;

  useEffect(() => {
    const mount = ref.current;
    if (!mount || !n) return;
    const k = montar(mount, { dpr: 1.5 });
    if (!k) return;
    const { scene, renderer, track, reduce } = k;
    const camera = new THREE.PerspectiveCamera(36, k.size().w / k.size().h, 0.1, 100);
    // el arco entero cabe a lo ancho, sea cual sea la proporción del lienzo
    let dist = 7.4;
    const encuadrar = (w: number, h: number) => {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dist = Math.max(7.4, 13.2 / (2 * Math.tan((18 * Math.PI) / 180) * camera.aspect));
    };
    encuadrar(k.size().w, k.size().h);
    k.onResize(encuadrar);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd6e2, 1.4));
    const sol = new THREE.DirectionalLight(0xffffff, 1);
    sol.position.set(-3, 6, 8);
    scene.add(sol);

    const acento = hex(css("--accent", "#1e5a8a"));
    const ok = hex(css("--ok", "#1f9a62"));
    const err = hex(css("--err", "#d14646"));

    const radio = 6.2;
    const paneles = datos.current.pantallas.map((p, i) => {
      const g = new THREE.Group();
      const a = -0.95 + (i / Math.max(1, n - 1)) * 1.9;
      g.position.set(Math.sin(a) * radio, 0, -Math.cos(a) * radio + radio - 1.2);
      g.rotation.y = -a;
      const marcoMat = track(new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.94, shininess: 80 }));
      const marco = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 0.06), marcoMat);
      const lienzo = lienzoTexto(320, 220);
      track(lienzo.tex);
      const cara = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.93), track(new THREE.MeshBasicMaterial({ map: lienzo.tex, toneMapped: false })));
      cara.position.z = 0.035;
      const barraMat = track(new THREE.MeshBasicMaterial({ color: ok, toneMapped: false }));
      const barra = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.07), barraMat);
      barra.position.y = -0.56;
      const sombra = sombraSuave(1.8, 0.7, 0.25);
      sombra.position.set(0, -1.05, 0.2);
      g.add(marco, cara, barra, sombra);
      scene.add(g);
      return { g, lienzo, barraMat, marcoMat, a, ultimo: "", sac: 0, foco: 0 };
    });

    // haz que comprueba la huella de cada pantalla
    const hazMat = track(new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }));
    const haz = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 1.3), hazMat);
    scene.add(haz);

    // la ficha en curso
    const fichaMat = track(new THREE.MeshLambertMaterial({ color: 0xffffff }));
    const ficha = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.04), fichaMat);
    const franja = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.045), track(new THREE.MeshLambertMaterial({ color: acento })));
    franja.position.y = 0.21;
    ficha.add(franja);
    scene.add(ficha);
    const fichaPos = new THREE.Vector3(0, 1.1, 2);

    let saltito = 0;
    const onEscrito = () => (saltito = 1);
    window.addEventListener("sarah:escrito", onEscrito);

    camera.position.set(0, 1.3, dist);
    camera.lookAt(0, 0, 0);
    const ptr = { x: 0 };
    const cur = { x: 0 };
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    k.loop((dt, t) => {
      const d = datos.current;
      cur.x = damp(cur.x, ptr.x, 2, dt);
      camera.position.set(cur.x * 0.8, 1.3 + (dist - 7.4) * 0.12, dist);
      camera.lookAt(0, 0, 0);
      const scanI = reduce ? -1 : Math.floor((t * 0.6) % n);
      paneles.forEach((p, i) => {
        const pd = d.pantallas[i];
        if (!pd) return;
        const cambiada = pd.estado === "cambiada";
        const esActiva = pd.nombre.startsWith(d.activa) && !d.parado;
        const clave = `${pd.nombre}|${pd.estado}|${esActiva}`;
        if (clave !== p.ultimo) {
          p.ultimo = clave;
          p.lienzo.pintar(pd.nombre, cambiada ? "Huella distinta" : esActiva ? "Escribiendo" : "Huella correcta", cambiada ? "#b83535" : esActiva ? "#164672" : "#ffffff", cambiada || esActiva ? "#ffffff" : "#13202f");
        }
        p.barraMat.color.setHex(cambiada ? err : esActiva ? acento : ok);
        p.sac = cambiada ? p.sac + dt : 0;
        p.foco = damp(p.foco, esActiva || cambiada ? 1 : 0, 4, dt);
        p.g.position.y = p.foco * 0.25 + (cambiada ? Math.sin(p.sac * 30) * 0.02 : 0);
        p.g.scale.setScalar(1 + p.foco * 0.08);
        if (i === scanI && !d.parado) {
          haz.position.set(p.g.position.x + Math.sin(t * 3) * 0.6 * Math.cos(p.a), p.g.position.y, p.g.position.z + 0.1);
          haz.rotation.y = -p.a;
        }
        if (esActiva) fichaPos.set(p.g.position.x * 0.92, 1.25 + saltito * 0.35, p.g.position.z + 0.7);
      });
      hazMat.opacity = d.parado ? 0 : 0.28;
      saltito = Math.max(0, saltito - dt * 2.5);
      ficha.position.x = damp(ficha.position.x, fichaPos.x, 4, dt);
      ficha.position.y = damp(ficha.position.y, d.parado ? 0.2 : fichaPos.y, 4, dt);
      ficha.position.z = damp(ficha.position.z, fichaPos.z, 4, dt);
      ficha.rotation.y = Math.sin(t) * 0.25;
      fichaMat.color.setHex(d.parado ? 0xd8dbe0 : 0xffffff);
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener("sarah:escrito", onEscrito);
      window.removeEventListener("pointermove", onMove);
      k.dispose();
    };
  }, [n]);

  return <div ref={ref} className="pantallas-canvas" aria-hidden="true" />;
}
