"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { damp, montar } from "./kit";
import { mulberry32 } from "@/lib/format";

let texFicha: THREE.CanvasTexture | null = null;
/** una ficha de Mobilia vista de lejos: foto arriba, renglones de datos y la marca de comprobado */
function texturaFicha() {
  if (texFicha) return texFicha;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 168;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 128, 168);
  const grad = g.createLinearGradient(0, 0, 128, 70);
  grad.addColorStop(0, "#7fc0d6");
  grad.addColorStop(1, "#e8d9bd");
  g.fillStyle = grad;
  g.fillRect(10, 10, 108, 64);
  g.fillStyle = "#f8f6f1";
  g.fillRect(30, 40, 44, 26);
  g.fillStyle = "#c4663a";
  g.fillRect(28, 37, 48, 5);
  g.fillStyle = "#13202f";
  g.fillRect(10, 86, 70, 7);
  g.fillStyle = "#c9cfd8";
  for (let y = 102; y < 150; y += 10) g.fillRect(10, y, y % 20 === 2 ? 80 : 100, 4);
  g.fillStyle = "#1f9a62";
  g.beginPath();
  g.arc(108, 150, 8, 0, Math.PI * 2);
  g.fill();
  texFicha = new THREE.CanvasTexture(c);
  texFicha.colorSpace = THREE.SRGBColorSpace;
  return texFicha;
}

// Fondo de todo el panel: fichas de propiedades, casitas blancas y láminas de mar flotando en capas,
// cada capa a su velocidad con el scroll y el puntero. Cada ficha comprobada las sacude un poco.
export default function Fondo() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    const k = montar(mount, { dpr: 1, suavizado: false });
    if (!k) return;
    const { scene, renderer, track, small, reduce } = k;
    renderer.setPixelRatio(small ? 0.9 : 0.8);
    scene.fog = new THREE.Fog(0xf6f3ee, 9, 32);
    const camera = new THREE.PerspectiveCamera(50, k.size().w / k.size().h, 0.1, 80);
    camera.position.set(0, 0, 16);
    k.onResize((w, h) => {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd6c8b4, 1.3));
    const sol = new THREE.DirectionalLight(0xfff3e2, 0.9);
    sol.position.set(-4, 7, 8);
    scene.add(sol);

    const casaGeo = new THREE.BoxGeometry(0.9, 0.62, 0.7);
    const rnd = mulberry32(31);
    const capas = [
      { n: small ? 9 : 16, geo: track(new THREE.PlaneGeometry(0.8, 1.05)), mat: track(new THREE.MeshLambertMaterial({ map: texturaFicha(), transparent: true, opacity: 0.85, side: THREE.DoubleSide })) },
      { n: small ? 6 : 12, geo: track(casaGeo), mat: track(new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })) },
      { n: small ? 5 : 9, geo: track(new THREE.BoxGeometry(1.3, 0.05, 0.85)), mat: track(new THREE.MeshLambertMaterial({ color: 0x3f9fb8, transparent: true, opacity: 0.22 })) },
      { n: small ? 4 : 8, geo: track(new THREE.BoxGeometry(0.95, 0.08, 0.75)), mat: track(new THREE.MeshLambertMaterial({ color: 0xc4663a, transparent: true, opacity: 0.32 })) },
    ];
    type Pieza = { base: THREE.Vector3; rot: THREE.Euler; giro: THREE.Vector3 };
    const grupos = capas.map((c, ci) => {
      const mesh = new THREE.InstancedMesh(c.geo, c.mat, c.n);
      mesh.frustumCulled = false;
      const piezas: Pieza[] = [];
      for (let i = 0; i < c.n; i++) {
        piezas.push({
          base: new THREE.Vector3((rnd() - 0.5) * 42, (rnd() - 0.5) * 30, -3 - rnd() * 18 - ci * 2),
          rot: new THREE.Euler(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI),
          giro: new THREE.Vector3((rnd() - 0.5) * 0.14, (rnd() - 0.5) * 0.14, (rnd() - 0.5) * 0.1),
        });
      }
      scene.add(mesh);
      return { mesh, piezas };
    });

    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3(1, 1, 1);
    const ptr = { x: 0, y: 0 };
    const cur = { x: 0, y: 0, s: 0 };
    const onMove = (e: PointerEvent) => {
      ptr.x = (e.clientX / window.innerWidth - 0.5) * 2;
      ptr.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let empujon = 0;
    const onPulso = () => (empujon = 1);
    const eventos = ["sarah:nueva", "sarah:ficha", "sarah:disponible"];
    eventos.forEach((e) => window.addEventListener(e, onPulso));

    k.loop((dt, t) => {
      cur.x = damp(cur.x, ptr.x, 2, dt);
      cur.y = damp(cur.y, ptr.y, 2, dt);
      cur.s = damp(cur.s, window.scrollY, 5, dt);
      empujon = Math.max(0, empujon - dt * 0.8);
      camera.position.x = cur.x * 1.3;
      camera.position.y = -cur.y * 0.8 - cur.s * 0.004;
      camera.position.z = 16 - empujon * 2.2;
      camera.lookAt(0, camera.position.y * 0.7, 0);
      grupos.forEach(({ mesh, piezas }) => {
        piezas.forEach((p, i) => {
          const vel = 0.003 * (1 + (p.base.z + 26) / 16);
          const flota = reduce ? 0 : Math.sin(t * 0.2 + i) * 0.45;
          v.set(p.base.x, p.base.y + flota + cur.s * vel, p.base.z);
          if (!reduce) {
            p.rot.x += p.giro.x * dt * (1 + empujon * 4);
            p.rot.y += p.giro.y * dt * (1 + empujon * 4);
            p.rot.z += p.giro.z * dt;
          }
          q.setFromEuler(p.rot);
          m4.compose(v, q, s);
          mesh.setMatrixAt(i, m4);
        });
        mesh.instanceMatrix.needsUpdate = true;
      });
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      eventos.forEach((e) => window.removeEventListener(e, onPulso));
      k.dispose();
    };
  }, []);

  return <div ref={ref} className="bg-canvas" aria-hidden="true" />;
}
