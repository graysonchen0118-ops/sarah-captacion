"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { damp, lienzoTexto, montar, sombraSuave, css, hex } from "./kit";

// La maqueta de la propiedad: una villa mediterránea que se va levantando con el expediente.
// Parcela, planta baja, planta alta con su chincheta de dirección, la carpeta de documentos,
// las fotos colgadas alrededor, el cartel y las balizas de los 14 portales al publicar.

export interface MaquetaProps {
  paso: number;
  fotos?: string[];
  canales?: number;
  pausada?: boolean;
  casa?: boolean;
  alto?: number;
  compacta?: boolean;
  giro?: boolean;
  etiqueta?: string;
}

export default function Maqueta({ paso, fotos = [], canales = 0, pausada = false, casa = true, compacta = false, giro = true, etiqueta }: MaquetaProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const estado = useRef({ paso, canales, pausada, etiqueta });
  estado.current = { paso, canales, pausada, etiqueta };
  const fotosKey = fotos.slice(0, 6).join("|");

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    const k = montar(mount, { dpr: 1.6 });
    if (!k) return;
    const { scene, renderer, track, small, reduce } = k;
    renderer.toneMappingExposure = 1.08;

    const camera = new THREE.PerspectiveCamera(compacta ? 36 : 32, k.size().w / k.size().h, 0.1, 100);
    const ajustar = (w: number, h: number) => {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    k.onResize(ajustar);

    scene.add(new THREE.HemisphereLight(0xfff6e8, 0xb9c7d6, 1.25));
    const sol = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sol.position.set(-5, 9, 6);
    scene.add(sol);
    const contra = new THREE.DirectionalLight(0xbfd8ff, 0.45);
    contra.position.set(6, 4, -6);
    scene.add(contra);

    const acento = hex(css("--accent", "#1e5a8a"));
    const apoyo = hex(css("--support", "#c4663a"));
    const mar = hex(css("--sea", "#3f9fb8"));

    const M = {
      blanco: track(new THREE.MeshLambertMaterial({ color: 0xf8f6f1 })),
      blancoSombra: track(new THREE.MeshLambertMaterial({ color: 0xe9e4da })),
      teja: track(new THREE.MeshLambertMaterial({ color: apoyo })),
      madera: track(new THREE.MeshLambertMaterial({ color: 0x9c6b45 })),
      vidrio: track(new THREE.MeshPhongMaterial({ color: 0x23435f, shininess: 90, specular: 0x88aacc })),
      agua: track(new THREE.MeshPhongMaterial({ color: mar, shininess: 120, specular: 0xffffff, transparent: true, opacity: 0.92 })),
      cesped: track(new THREE.MeshLambertMaterial({ color: 0x8fb36b })),
      arena: track(new THREE.MeshLambertMaterial({ color: 0xe9dcc3 })),
      tierra: track(new THREE.MeshLambertMaterial({ color: 0xc9b08b })),
      cipres: track(new THREE.MeshLambertMaterial({ color: 0x3f6b3c })),
      olivo: track(new THREE.MeshLambertMaterial({ color: 0x8a9a63 })),
      tronco: track(new THREE.MeshLambertMaterial({ color: 0x7a5a3c })),
      papel: track(new THREE.MeshLambertMaterial({ color: 0xffffff })),
      carpeta: track(new THREE.MeshLambertMaterial({ color: acento })),
      fantasma: track(new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0.1, depthWrite: false })),
      borde: track(new THREE.LineBasicMaterial({ color: acento, transparent: true, opacity: 0.35 })),
    };

    const raiz = new THREE.Group();
    scene.add(raiz);

    const caja = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, padre: THREE.Object3D) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      padre.add(mesh);
      return mesh;
    };

    // cada capa tiene su versión fantasma (lo que falta por levantar) y la real
    type Capa = { real: THREE.Group; fantasma: THREE.Group; desde: number; act: number };
    const capas: Capa[] = [];
    const capa = (desde: number, construir: (g: THREE.Group, solida: boolean) => void) => {
      const real = new THREE.Group();
      const fantasma = new THREE.Group();
      construir(real, true);
      construir(fantasma, false);
      fantasma.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.material = M.fantasma;
          const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry as THREE.BufferGeometry), M.borde);
          e.position.copy(m.position);
          e.rotation.copy(m.rotation);
          e.scale.copy(m.scale);
          m.parent?.add(e);
        }
      });
      raiz.add(real, fantasma);
      const c = { real, fantasma, desde, act: 0 };
      capas.push(c);
      return c;
    };

    // parcela flotante
    const parcela = new THREE.Group();
    raiz.add(parcela);
    caja(6.4, 0.42, 4.6, M.tierra, 0, -0.21, 0, parcela);
    caja(6.4, 0.06, 4.6, M.cesped, 0, 0.03, 0, parcela);
    caja(2.2, 0.065, 4.6, M.arena, 2.1, 0.035, 0, parcela);
    const sombra = sombraSuave(8.5, 6.8, 0.28);
    sombra.position.y = -0.62;
    raiz.add(sombra);

    // planta baja y piscina (bloque General)
    capa(3, (g, solida) => {
      caja(2.9, 1.05, 2.0, M.blanco, -0.75, 0.585, -0.45, g);
      caja(3.05, 0.09, 2.15, M.blancoSombra, -0.75, 1.15, -0.45, g);
      if (solida) {
        caja(0.95, 0.62, 0.03, M.vidrio, -1.35, 0.5, 0.56, g);
        caja(0.95, 0.62, 0.03, M.vidrio, -0.2, 0.5, 0.56, g);
        caja(0.03, 0.5, 0.6, M.vidrio, 0.61, 0.55, -0.3, g);
      }
      // piscina
      caja(2.1, 0.08, 1.2, M.blanco, 1.95, 0.1, 0.95, g);
      const agua = caja(1.86, 0.04, 0.98, solida ? M.agua : M.fantasma, 1.95, 0.135, 0.95, g);
      agua.name = "agua";
      // pérgola
      for (let i = 0; i < 4; i++) caja(0.07, 0.95, 0.07, M.madera, -2.0 + i * 0.85, 0.5, 0.95, g);
      for (let i = 0; i < 9; i++) caja(0.05, 0.05, 1.0, M.madera, -2.05 + i * 0.32, 1.0, 0.75, g);
    });

    // planta alta, terraza y chincheta de la dirección (D. Internos)
    const pin = new THREE.Group();
    capa(5, (g, solida) => {
      caja(1.8, 0.9, 1.5, M.blanco, -1.25, 1.65, -0.65, g);
      caja(1.95, 0.08, 1.65, M.blancoSombra, -1.25, 2.13, -0.65, g);
      caja(1.0, 0.24, 0.05, M.blanco, 0.0, 1.32, 0.48, g);
      if (solida) {
        caja(0.85, 0.55, 0.03, M.vidrio, -1.25, 1.62, 0.115, g);
        const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), M.teja);
        cabeza.position.y = 0.5;
        const punta = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 16), M.teja);
        punta.rotation.x = Math.PI;
        punta.position.y = 0.26;
        pin.add(cabeza, punta);
        pin.position.set(-1.25, 2.25, -0.65);
        g.add(pin);
      }
    });

    // carpeta de documentos (Documentos)
    capa(6, (g) => {
      const cp = new THREE.Group();
      caja(0.62, 0.05, 0.46, M.carpeta, 0, 0, 0, cp);
      for (let i = 0; i < 4; i++) {
        const h = caja(0.54, 0.012, 0.4, M.papel, (i % 2) * 0.02, 0.04 + i * 0.022, (i % 3) * 0.015, cp);
        h.rotation.y = (i - 1.5) * 0.06;
      }
      cp.position.set(2.75, 0.62, -1.55);
      cp.rotation.set(-0.25, -0.5, 0.08);
      g.add(cp);
    });

    // árboles
    const arboles = new THREE.Group();
    raiz.add(arboles);
    const cipres = (x: number, z: number, h: number) => {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, h, 10), M.cipres);
      c.position.set(x, h / 2 + 0.06, z);
      arboles.add(c);
    };
    cipres(-2.85, -1.9, 1.5);
    cipres(-2.55, -1.95, 1.2);
    cipres(-2.85, 1.8, 1.3);
    const olivo = new THREE.Group();
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8), M.tronco);
    tr.position.y = 0.3;
    const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), M.olivo);
    copa.position.y = 0.72;
    copa.scale.set(1.2, 0.8, 1.1);
    olivo.add(tr, copa);
    olivo.position.set(0.9, 0, -1.7);
    arboles.add(olivo);

    // fotos colgadas alrededor (Multimedia)
    const marcos = new THREE.Group();
    raiz.add(marcos);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const listaFotos = fotosKey ? fotosKey.split("|") : [];
    const nMarcos = small ? 4 : 6;
    const marcosData: { m: THREE.Mesh; base: THREE.Vector3; fase: number }[] = [];
    for (let i = 0; i < nMarcos; i++) {
      const mat = track(new THREE.MeshBasicMaterial({ color: 0xf1ede4, toneMapped: false }));
      const src = listaFotos[i % Math.max(1, listaFotos.length)];
      if (src) {
        loader.load(src.replace(/w=\d+/, "w=360").replace(/h=\d+/, "h=250"), (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          track(t);
          mat.map = t;
          mat.color.setHex(0xffffff);
          mat.needsUpdate = true;
        });
      }
      const marco = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), mat);
      const borde = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.78), M.papel);
      borde.position.z = -0.005;
      marco.add(borde);
      const ang = -2.4 + (i / (nMarcos - 1)) * 2.0;
      const base = new THREE.Vector3(Math.cos(ang) * 4.3, 1.6 + (i % 2) * 0.75, Math.sin(ang) * 3.0 - 0.6);
      marco.position.copy(base);
      marco.lookAt(0, 1.2, 4);
      marco.scale.setScalar(0.001);
      marcos.add(marco);
      marcosData.push({ m: marco, base, fase: i * 1.3 });
    }

    // cartel en la parcela y letrero DISPONIBLE
    const cartel = new THREE.Group();
    raiz.add(cartel);
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), M.tronco);
    poste.position.y = 0.6;
    const lienzo = lienzoTexto(300, 150);
    track(lienzo.tex);
    const tabla = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), track(new THREE.MeshBasicMaterial({ map: lienzo.tex, toneMapped: false, side: THREE.DoubleSide })));
    tabla.position.y = 1.2;
    cartel.add(poste, tabla);
    cartel.position.set(2.6, 0, 1.95);
    cartel.rotation.y = -0.45;
    let letreroActual = "";

    // balizas de los portales alrededor de la parcela
    const balizas: { m: THREE.Mesh; mat: THREE.MeshLambertMaterial; luz: number }[] = [];
    const balizaGeo = track(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 10));
    for (let i = 0; i < 14; i++) {
      const mat = track(new THREE.MeshLambertMaterial({ color: 0xc8ccd3, emissive: 0x000000 }));
      const m = new THREE.Mesh(balizaGeo, mat);
      const a = (i / 14) * Math.PI * 2;
      m.position.set(Math.cos(a) * 4.0, -0.45, Math.sin(a) * 3.1);
      m.scale.y = 0.4;
      raiz.add(m);
      balizas.push({ m, mat, luz: 0 });
    }

    // anillo que responde a cada escritura comprobada
    const anilloMat = track(new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0, depthWrite: false }));
    const anillo = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.02, 64).rotateX(-Math.PI / 2), anilloMat);
    anillo.position.y = 0.08;
    raiz.add(anillo);
    let pulso = 1;
    let colorPulso = acento;

    const ptr = { x: 0, y: 0 };
    const cur = { x: 0, y: 0, rot: 0.6, gris: 0 };
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ptr.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const onEscrito = () => {
      pulso = 0;
      colorPulso = acento;
    };
    const onDeshecho = () => {
      pulso = 0;
      colorPulso = apoyo;
    };
    const onDisponible = () => {
      pulso = 0;
      colorPulso = hex(css("--ok", "#1f9a62"));
    };
    window.addEventListener("sarah:escrito", onEscrito);
    window.addEventListener("sarah:deshecho", onDeshecho);
    window.addEventListener("sarah:disponible", onDisponible);
    window.addEventListener("sarah:foto", onEscrito);

    const colorBase = new Map<THREE.MeshLambertMaterial, THREE.Color>();
    [M.blanco, M.blancoSombra, M.teja, M.cesped, M.arena, M.tierra, M.cipres, M.olivo, M.madera].forEach((m) => colorBase.set(m, m.color.clone()));
    const gris = new THREE.Color(0xb8bcc4);

    camera.position.set(9.5, 6.4, 10.5);
    k.loop((dt, t) => {
      const st = estado.current;
      const paso = st.paso;
      cur.x = damp(cur.x, ptr.x, 2.5, dt);
      cur.y = damp(cur.y, ptr.y, 2.5, dt);
      if (giro && !reduce) cur.rot += dt * 0.12;
      const rot = cur.rot + cur.x * 0.35;
      const dist = compacta ? 12.5 : 11.5;
      camera.position.set(Math.cos(rot) * dist, 5.6 - cur.y * 1.2, Math.sin(rot) * dist);
      camera.lookAt(0, 0.9, 0);

      // capas que se levantan
      capas.forEach((c) => {
        const objetivo = paso > c.desde ? 1 : 0;
        c.act = damp(c.act, objetivo, 3.2, dt);
        c.real.visible = c.act > 0.02;
        c.real.scale.set(1, Math.max(0.001, c.act), 1);
        c.real.position.y = (1 - c.act) * -0.3;
        c.fantasma.visible = c.act < 0.98;
      });
      pin.position.y = 2.25 + Math.sin(t * 2) * 0.07;
      pin.rotation.y = t * 1.2;

      // fotos
      const conFotos = paso > 6;
      marcosData.forEach((d, i) => {
        const s = damp(d.m.scale.x, conFotos ? 1 : 0.001, 3 - i * 0.2, dt);
        d.m.scale.setScalar(s);
        d.m.visible = s > 0.01;
        d.m.position.y = d.base.y + (reduce ? 0 : Math.sin(t * 0.8 + d.fase) * 0.08);
      });

      // cartel
      const txt = paso >= 11 ? "DISPONIBLE" : st.pausada ? "EN PAUSA" : st.etiqueta ?? "EN CAPTACIÓN";
      if (txt !== letreroActual) {
        letreroActual = txt;
        lienzo.pintar(txt, paso >= 11 ? "14 portales" : `Paso ${Math.min(paso + 1, 11)} de 11`, paso >= 11 ? "#1f9a62" : st.pausada ? "#727e90" : "#164672");
      }
      cartel.scale.setScalar(damp(cartel.scale.x, paso >= 2 ? 1 : 0.001, 3, dt));

      // balizas
      const encendidas = paso >= 11 ? 14 : st.canales;
      balizas.forEach((b, i) => {
        const on = i < encendidas;
        b.luz = damp(b.luz, on ? 1 : 0, 4, dt);
        b.m.scale.y = 0.4 + b.luz * 1.6;
        b.m.position.y = -0.45 + b.luz * 0.62;
        b.mat.color.setHex(on ? hex(css("--ok", "#1f9a62")) : 0xc8ccd3);
        b.mat.emissive.setRGB(0, b.luz * 0.18, b.luz * 0.08);
      });

      // agua
      const agua = raiz.getObjectByName("agua") as THREE.Mesh | undefined;
      if (agua && agua.material === M.agua) M.agua.color.setHSL(0.53, 0.5, 0.48 + Math.sin(t * 1.4) * 0.03);

      // pulso
      pulso = Math.min(1, pulso + dt / 1.4);
      anillo.scale.setScalar(1 + pulso * 1.2);
      anilloMat.opacity = pulso >= 1 ? 0 : (1 - pulso) * 0.6;
      anilloMat.color.setHex(colorPulso);

      // pausa: la maqueta pierde el color
      cur.gris = damp(cur.gris, st.pausada ? 1 : 0, 3, dt);
      colorBase.forEach((c, m) => m.color.copy(c).lerp(gris, cur.gris * 0.75));

      raiz.position.y = reduce ? 0 : Math.sin(t * 0.6) * 0.06;
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("sarah:escrito", onEscrito);
      window.removeEventListener("sarah:deshecho", onDeshecho);
      window.removeEventListener("sarah:disponible", onDisponible);
      window.removeEventListener("sarah:foto", onEscrito);
      k.dispose();
    };
  }, [fotosKey, casa, compacta, giro]);

  return <div ref={ref} className="maqueta-canvas" aria-hidden="true" />;
}
