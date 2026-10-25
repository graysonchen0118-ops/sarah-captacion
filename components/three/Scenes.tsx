"use client";

import dynamic from "next/dynamic";

export const Fondo = dynamic(() => import("./Fondo"), {
  ssr: false,
  loading: () => <div className="bg-fallback" aria-hidden="true" />,
});

export const Maqueta = dynamic(() => import("./Maqueta"), {
  ssr: false,
  loading: () => <div className="maqueta-ph" aria-hidden="true" />,
});

export const Pantallas = dynamic(() => import("./Pantallas"), {
  ssr: false,
  loading: () => <div className="pantallas-ph" aria-hidden="true" />,
});
