"use client";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useStore } from "./store";
import { PublicExperience } from "./public";
const Operations = dynamic(
  () => import("./operations").then((m) => m.Operations),
  {
    loading: () => (
      <main
        className="container section"
        aria-busy="true"
        aria-label="Cargando operación"
      >
        <div className="skeleton" />
        <div className="skeleton" />
      </main>
    ),
  },
);
export default function Experience() {
  const pathname = usePathname();
  const { ready } = useStore();
  const loading = (
    <main
      className="container section"
      aria-busy="true"
      aria-label="Cargando experiencia"
    >
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </main>
  );
  if (!ready) return loading;
  return (
    <Suspense fallback={loading}>
      {pathname.startsWith("/operaciones") ? (
        <Operations path={pathname} />
      ) : (
        <PublicExperience path={pathname} />
      )}
    </Suspense>
  );
}
