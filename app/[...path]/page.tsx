import Experience from "@/experience";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const known = [
    "flota",
    "reservar",
    "confirmacion",
    "portal",
    "nosotros",
    "preguntas",
    "contacto",
    "politicas",
    "operaciones",
  ];
  if (!known.includes(path[0])) notFound();
  return <Experience />;
}
