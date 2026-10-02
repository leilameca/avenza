"use client";
import Link from "next/link";
import {
  useEffect,
  useState,
  useId,
  cloneElement,
  isValidElement,
  ReactElement,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ArrowRight,
  X,
  Check,
  Users,
  Briefcase,
  Fuel,
  Settings2,
  Search,
} from "lucide-react";
import { Vehicle, dateLabel, money } from "./domain";
import { useStore } from "./store";
export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className={"brand " + (dark ? "light" : "")}
      aria-label="AVENZA, inicio"
    >
      <span className="brand-mark">Λ</span>
      <span>
        AVENZA<small>RENT A CAR</small>
      </span>
    </Link>
  );
}
export function Badge({ children }: { children: React.ReactNode }) {
  const t = String(children);
  return (
    <span
      className={
        "badge " +
        (["Disponible", "Finalizada", "Completado", "Verificado"].includes(t)
          ? "green"
          : [
                "Activa",
                "Alquilado",
                "Confirmada",
                "Lista para entrega",
              ].includes(t)
            ? "rust"
            : [
                  "Mantenimiento",
                  "Pendiente de pago",
                  "En revisión",
                  "Preparación",
                  "Limpieza",
                  "Pendiente de inspección",
                ].includes(t)
              ? "amber"
              : "neutral")
      }
    >
      <i />
      {children}
    </span>
  );
}
export function Modal({
  title,
  children,
  open,
  onClose,
  wide = false,
  description,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  wide?: boolean;
  description?: string;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={"dialog " + (wide ? "wide" : "")}
          aria-describedby={description ? "modal-description" : undefined}
        >
          <div className="dialog-head">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Cerrar">
              <X size={20} />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description id="modal-description" className="muted">
              {description}
            </Dialog.Description>
          )}
          <div className="dialog-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{
              id: string;
              "aria-describedby"?: string;
            }>,
            { id, ...(hint ? { "aria-describedby": id + "-hint" } : {}) },
          )
        : children}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
export function Empty({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-line" />
      <h3>{title}</h3>
      {detail && <p>{detail}</p>}
      {children}
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="title-actions">{children}</div>
    </div>
  );
}
export function VehicleSpecs({ v }: { v: Vehicle }) {
  return (
    <div className="vehicle-specs">
      <span>
        <Users size={15} />
        {v.seats} pasajeros
      </span>
      <span>
        <Settings2 size={15} />
        {v.transmission}
      </span>
      <span>
        <Briefcase size={15} />
        {v.bags} {v.bags === 1 ? "maleta" : "maletas"}
      </span>
    </div>
  );
}
export function VehicleCard({
  v,
  href,
  available = true,
}: {
  v: Vehicle;
  href?: string;
  available?: boolean;
}) {
  const { currency, data } = useStore();
  return (
    <article className="vehicle-card">
      <Link href={href || `/flota/${v.id}`} className="vehicle-image">
        <img
          src={v.image}
          alt={`${v.brand} ${v.model} · fotografía representativa demo`}
          loading="lazy"
        />
        <span className="image-label">{v.category}</span>
        <span className="image-arrow">
          <ArrowUpRight size={19} />
        </span>
        <span className="vehicle-explore">
          Ver vehículo <ArrowUpRight size={16} />
        </span>
        <span className="vehicle-hover-detail">
          {v.seats} pasajeros · {v.transmission} · {v.branch}
        </span>
      </Link>
      <div className="vehicle-info">
        <div className="flex between">
          <h3>
            {v.brand} {v.model}
          </h3>
          <small>{v.year}</small>
        </div>
        <VehicleSpecs v={v} />
        <div className="vehicle-price">
          <span>
            <strong>{money(v.rate, currency, data.settings.usdRate)}</strong> /
            día
          </span>
          <span className="availability-dot">
            {available ? "Consultar fechas" : "Sin disponibilidad"}
          </span>
        </div>
      </div>
    </article>
  );
}
export function Timeline({
  reservationId,
  vehicleId,
}: {
  reservationId?: string;
  vehicleId?: string;
}) {
  const { data } = useStore();
  const logs = data.activity.filter((a) =>
    reservationId
      ? a.reservationId === reservationId
      : a.vehicleId === vehicleId,
  );
  return (
    <div className="activity-list">
      {logs.length ? (
        logs.map((a) => (
          <div key={a.id} className="activity-item">
            <i />
            <div>
              <strong>{a.text}</strong>
              <p>
                {a.actor} · {dateLabel(a.date, true)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <Empty title="El historial comienza aquí." />
      )}
    </div>
  );
}
export function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const term = q.toLowerCase();
  const hits = [
    ...data.reservations.map((r) => ({
      id: r.id,
      title: r.id,
      sub: data.customers.find((c) => c.id === r.customerId)?.name || "",
      url: `/operaciones/reservas/${r.id}`,
    })),
    ...data.vehicles.map((v) => ({
      id: v.id,
      title: `${v.brand} ${v.model}`,
      sub: `${v.plate} · ${v.id}`,
      url: `/operaciones/flota/${v.id}`,
    })),
    ...data.customers.map((c) => ({
      id: c.id,
      title: c.name,
      sub: c.email,
      url: `/operaciones/clientes/${c.id}`,
    })),
    ...data.agreements.map((a) => ({
      id: a.id,
      title: a.id,
      sub: `Contrato · ${a.reservationId}`,
      url: `/operaciones/reservas/${a.reservationId}`,
    })),
  ]
    .filter((h) => (h.title + " " + h.sub).toLowerCase().includes(term))
    .slice(0, 12);
  return (
    <Modal title="Buscar en AVENZA" open={open} onClose={onClose}>
      <div className="search-field">
        <Search size={18} />
        <input
          aria-label="Buscar cliente, reserva o placa"
          placeholder="Cliente, reserva, placa o contrato…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>
      <div className="search-results">
        {hits.map((h) => (
          <Link key={h.id} href={h.url} onClick={onClose}>
            <span>
              <strong>{h.title}</strong>
              <small>{h.sub}</small>
            </span>
            <ArrowRight size={18} />
          </Link>
        ))}
        {!hits.length && (
          <Empty
            title="No encontramos coincidencias."
            detail="Prueba con el nombre, código o placa demo."
          />
        )}
      </div>
    </Modal>
  );
}
export function useCommand(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
export function SuccessMark() {
  return (
    <span className="success-mark">
      <Check size={28} />
    </span>
  );
}
export function useIsMobile() {
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width:760px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width:760px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}
