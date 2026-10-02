"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  Plus,
  Trash2,
  ClipboardCheck,
  AlertTriangle,
  CreditCard,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "./store";
import {
  Damage,
  VehicleState,
  TODAY,
  uid,
  balance,
  depositHeld,
  dateLabel,
  money,
} from "./domain";
import { Field, Modal, Badge, PageTitle, Empty } from "./ui";
import { PaymentForm } from "./reservation";
const zones = [
  "Frontal",
  "Trasera",
  "Lateral izquierdo",
  "Lateral derecho",
  "Techo",
  "Interior",
  "Ruedas",
];
type NewDamage = Omit<
  Damage,
  | "id"
  | "vehicleId"
  | "reservationId"
  | "inspectionId"
  | "employee"
  | "date"
  | "state"
>;
function CarMap({
  selected,
  onSelect,
  damages,
}: {
  selected: string;
  onSelect: (s: string) => void;
  damages: NewDamage[];
}) {
  return (
    <div className="car-inspection-map">
      <svg
        role="group"
        viewBox="0 0 340 470"
        aria-label="Esquema superior del vehículo"
      >
        <path
          className="car-shadow"
          d="M106 46 Q170 19 234 46 L248 110 L250 368 Q237 437 170 443 Q103 437 90 368 L92 110Z"
        />
        <path
          className="car-outline"
          d="M112 44 Q170 26 228 44 L239 118 L237 363 Q231 416 170 425 Q109 416 103 363 L101 118Z"
        />
        <path className="car-glass" d="M116 126 L224 126 L213 195 L127 195Z" />
        <path className="car-glass" d="M127 301 L213 301 L224 349 L116 349Z" />
        <rect
          className="car-roof"
          x="126"
          y="200"
          width="88"
          height="92"
          rx="9"
        />
        <path
          className="car-detail"
          d="M112 81 L228 81 M111 382 L229 382 M116 149 L108 318 M224 149 L232 318"
        />
        <rect className="tire" x="88" y="109" width="15" height="52" rx="5" />
        <rect className="tire" x="237" y="109" width="15" height="52" rx="5" />
        <rect className="tire" x="88" y="317" width="15" height="52" rx="5" />
        <rect className="tire" x="237" y="317" width="15" height="52" rx="5" />
        {[
          [170, 66, "Frontal"],
          [170, 394, "Trasera"],
          [108, 245, "Lateral izquierdo"],
          [232, 245, "Lateral derecho"],
          [170, 224, "Techo"],
          [170, 273, "Interior"],
          [250, 137, "Ruedas"],
        ].map(([x, y, z]) => {
          const zone = String(z);
          const count = damages.filter((d) => d.zone === zone).length;
          return (
            <g
              key={zone}
              className={
                "map-zone " +
                (selected === zone ? "selected" : "") +
                (count ? " damaged" : "")
              }
              role="button"
              tabIndex={0}
              aria-label={
                "Seleccionar " +
                zone +
                (count ? `, ${count} observaciones` : "")
              }
              onClick={() => onSelect(zone)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(zone);
                }
              }}
            >
              <circle cx={Number(x)} cy={Number(y)} r="16" />
              <text x={Number(x)} y={Number(y) + 5} textAnchor="middle">
                {count || "+"}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="map-caption">
        <span>Vista superior</span>
        <span>Selecciona una zona para documentar</span>
      </div>
    </div>
  );
}
export function InspectionWizard({ id }: { id: string }) {
  const { data, act, role } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const r = data.reservations.find((r) => r.id === id);
  const type = params.get("tipo") === "entrada" ? "Entrada" : "Salida";
  const v = data.vehicles.find((v) => v.id === r?.vehicleId);
  const rental = data.rentals.find((x) => x.reservationId === id);
  const [step, setStep] = useState(1);
  const [km, setKm] = useState(v?.km || 0);
  const [fuel, setFuel] = useState(type === "Salida" ? v?.fuel || 100 : 75);
  const [interior, setInterior] = useState(false);
  const [exterior, setExterior] = useState(false);
  const [signature, setSignature] = useState("");
  const [date, setDate] = useState(
    TODAY + (type === "Entrada" ? "T17:00" : "T13:00"),
  );
  const [nextState, setNextState] = useState<VehicleState>("Limpieza");
  const [photos, setPhotos] = useState<
    { id: string; url: string; label: string }[]
  >([]);
  const [damages, setDamages] = useState<NewDamage[]>([]);
  const [zone, setZone] = useState("Lateral izquierdo");
  const [kind, setKind] = useState("Rayón");
  const [severity, setSeverity] = useState("Leve");
  const [note, setNote] = useState("");
  const [damagePhoto, setDamagePhoto] = useState("");
  const [showDamage, setShowDamage] = useState(false);
  const [pay, setPay] = useState(false);
  const [charge, setCharge] = useState(0);
  const [chargeNote, setChargeNote] = useState(
    "Diferencia registrada en devolución · demo",
  );
  if (!r || !v)
    return (
      <Empty title="Asigna un vehículo antes de inspeccionar.">
        <Link className="button" href={"/operaciones/reservas/" + id}>
          Volver a reserva
        </Link>
      </Empty>
    );
  const incoming = type === "Entrada";
  const allowed = incoming
    ? r.state === "Activa"
    : ["Confirmada", "Lista para entrega"].includes(r.state);
  if (!allowed)
    return (
      <Empty
        title="Esta reserva no está en el paso correcto."
        detail={
          incoming
            ? "La devolución requiere un alquiler activo."
            : "La salida requiere una reserva confirmada."
        }
      >
        <Link className="button" href={"/operaciones/reservas/" + id}>
          Abrir reserva
        </Link>
      </Empty>
    );
  const c = data.customers.find((c) => c.id === r.customerId)!;
  const existing = data.damages.filter(
    (d) => d.vehicleId === v.id && d.state !== "Resuelto",
  );
  const outgoing = data.inspections.findLast(
    (i) =>
      i.reservationId === id &&
      i.type === "Salida" &&
      i.vehicleId === r.vehicleId,
  );
  const license = data.documents.some(
    (d) => d.customerId === c.id && d.type === "Licencia" && d.verified,
  );
  const agreement = data.agreements.some(
    (a) => a.reservationId === id && a.signed,
  );
  const titles = incoming
    ? [
        "Identificar alquiler",
        "Kilometraje de entrada",
        "Combustible de entrada",
        "Hora real de devolución",
        "Inspección exterior",
        "Inspección interior",
        "Comparar daños",
        "Evidencia fotográfica",
        "Saldo y confirmación",
        "Cerrar devolución",
      ]
    : [
        "Cliente y documentos",
        "Confirmar vehículo",
        "Kilometraje de salida",
        "Combustible de salida",
        "Inspección exterior",
        "Inspección interior",
        "Daños preexistentes",
        "Evidencia fotográfica",
        "Firma simulada",
        "Entregar vehículo",
      ];
  const next = () => {
    if (step === 1 && !incoming && !license) {
      toast.error("Adjunta la licencia demo desde la reserva o el portal.");
      return;
    }
    if (
      ((step === 3 && !incoming) || (step === 2 && incoming)) &&
      (!Number.isFinite(km) ||
        km < v.km ||
        (incoming && km < (rental?.outKm || 0)))
    ) {
      toast.error("El kilometraje no puede ser menor al último registro.");
      return;
    }
    if (
      step === 4 &&
      incoming &&
      (!date || new Date(date) < new Date(r.start))
    ) {
      toast.error("La hora real debe ser posterior a la salida.");
      return;
    }
    if (step === 5 && !exterior) {
      toast.error("Confirma que revisaste el exterior.");
      return;
    }
    if (step === 6 && !interior) {
      toast.error("Confirma que revisaste el interior.");
      return;
    }
    if (step === 8 && !photos.length) {
      toast.error("Añade al menos una fotografía demo.");
      return;
    }
    if (step === 9 && !signature.trim()) {
      toast.error("Escribe un nombre para la firma simulada.");
      return;
    }
    setStep(Math.min(10, step + 1));
  };
  const finish = () => {
    if (
      act({
        type: "inspection",
        id,
        inspection: {
          type,
          km,
          fuel,
          date,
          photos,
          signature,
          interior,
          exterior,
        },
        damages,
        charge: 0,
        nextState,
      }).ok
    )
      router.push("/operaciones/reservas/" + id);
  };
  const addPhoto = () =>
    setPhotos([
      ...photos,
      {
        id: uid("PHOTO"),
        url:
          incoming &&
          id ===
            data.reservations.find((r) => r.notes.includes("nueva abolladura"))
              ?.id
            ? "/images/damage-after.webp"
            : v.image,
        label: incoming
          ? "Entrada · evidencia representativa demo"
          : "Salida · evidencia representativa demo",
      },
    ]);
  return (
    <>
      <Link className="back-link" href={"/operaciones/reservas/" + id}>
        <ArrowLeft size={16} /> Volver a la reserva
      </Link>
      <PageTitle
        eyebrow={r.id + " · " + v.id}
        title={
          incoming ? "Devolución documentada." : "Una entrega con todo claro."
        }
        description={`${v.brand} ${v.model} · ${c.name}`}
      >
        <Badge>{type}</Badge>
      </PageTitle>
      <div className="inspection-progress">
        <span>PASO {String(step).padStart(2, "0")} / 10</span>
        <strong>{titles[step - 1]}</strong>
        <div>
          <i style={{ width: step * 10 + "%" }} />
        </div>
      </div>
      <div className="inspection-layout">
        <section className="panel inspection-step" key={step}>
          <h2>{titles[step - 1]}</h2>
          {step === 1 && (
            <>
              <div className="review-grid">
                <div>
                  <small>Conductor</small>
                  <h3>{c.name}</h3>
                  <p>
                    {c.license}
                    <br />
                    {c.identification}
                  </p>
                </div>
                <div>
                  <small>Reserva</small>
                  <h3>{r.id}</h3>
                  <p>
                    {dateLabel(r.start, true)}
                    <br />
                    {dateLabel(r.end, true)}
                  </p>
                </div>
              </div>
              {incoming ? (
                <div className="success-box">
                  Alquiler activo encontrado. La evidencia de salida se
                  conservará separada.
                </div>
              ) : (
                <>
                  <div className={license ? "success-box" : "conflict-box"}>
                    {license
                      ? "Licencia ficticia revisada."
                      : "Falta licencia demo. Adjunta una desde la reserva."}
                  </div>
                  <div className={agreement ? "success-box" : "conflict-box"}>
                    {agreement
                      ? "Contrato demo firmado."
                      : "Prepara el contrato antes de entregar."}
                  </div>
                  <Link
                    className="text-link"
                    href={"/operaciones/reservas/" + id}
                  >
                    Revisar documentos y contrato <ArrowUpRightIcon />
                  </Link>
                </>
              )}
            </>
          )}
          {step === 2 && !incoming && (
            <>
              <img
                className="wizard-vehicle"
                src={v.image}
                alt="Vehículo representativo demo"
              />
              <h3>
                {v.brand} {v.model} · {v.year}
              </h3>
              <p>
                {v.plate} · {v.id} · {v.color}
              </p>
              <div className="notice">
                VIN ficticio: {v.vin}. Confirma físicamente el vehículo al usar
                un sistema real.
              </div>
            </>
          )}
          {((step === 3 && !incoming) || (step === 2 && incoming)) && (
            <>
              <p>
                Último registro: <strong>{v.km.toLocaleString()} km</strong>.{" "}
                {incoming && `Salida: ${rental?.outKm.toLocaleString()} km.`}
              </p>
              <Field
                label={
                  incoming
                    ? "Kilometraje real de entrada"
                    : "Kilometraje real de salida"
                }
              >
                <input
                  className="large-input"
                  type="number"
                  min={v.km}
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                />
              </Field>
              {incoming && (
                <div className="comparison-number">
                  <span>Recorrido</span>
                  <strong>
                    {Math.max(0, km - (rental?.outKm || 0)).toLocaleString()} km
                  </strong>
                </div>
              )}
            </>
          )}
          {((step === 4 && !incoming) || (step === 3 && incoming)) && (
            <>
              <div className="fuel-value">
                {fuel}
                <small>%</small>
              </div>
              <Field label="Nivel de combustible">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={fuel}
                  onChange={(e) => setFuel(Number(e.target.value))}
                />
              </Field>
              <div className="fuel-labels">
                <span>Vacío</span>
                <span>½ tanque</span>
                <span>Lleno</span>
              </div>
              {incoming && (
                <div className="notice">
                  Salida: {rental?.outFuel}% · Entrada: {fuel}% · Diferencia:{" "}
                  {fuel - (rental?.outFuel || 0)} puntos. Los cargos se revisan
                  manualmente.
                </div>
              )}
            </>
          )}
          {step === 4 && incoming && (
            <>
              <Field label="Fecha y hora real">
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <div className="notice">
                Hora esperada: {dateLabel(r.end, true)}
                <br />
                Diferencia:{" "}
                {Math.round(
                  ((new Date(date).getTime() - new Date(r.end).getTime()) /
                    3600000) *
                    10,
                ) / 10}{" "}
                horas.
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <p>
                Revisa cada zona. Registra las observaciones de forma manual.
              </p>
              <div className="inspection-map-layout">
                <CarMap
                  selected={zone}
                  damages={damages}
                  onSelect={(z) => {
                    setZone(z);
                    setShowDamage(true);
                  }}
                />
                <div>
                  <div className="zone-buttons">
                    {zones.map((z) => (
                      <button
                        key={z}
                        className={zone === z ? "selected" : ""}
                        onClick={() => {
                          setZone(z);
                          setShowDamage(true);
                        }}
                      >
                        {z}
                        <Plus size={15} />
                      </button>
                    ))}
                  </div>
                  <div className="damage-list">
                    {damages.map((d, i) => (
                      <div key={i}>
                        <span>
                          <strong>
                            {d.zone} · {d.kind}
                          </strong>
                          <small>
                            {d.severity} · {d.note}
                          </small>
                        </span>
                        <button
                          className="icon-button"
                          aria-label="Quitar observación"
                          onClick={() =>
                            setDamages(damages.filter((_, j) => i !== j))
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <label className="check-label confirm-check">
                <input
                  type="checkbox"
                  checked={exterior}
                  onChange={(e) => setExterior(e.target.checked)}
                />
                Exterior revisado y observaciones registradas.
              </label>
            </>
          )}
          {step === 6 && (
            <>
              <div className="interior-list">
                {[
                  "Asientos y tapicería",
                  "Tablero y controles",
                  "Aire acondicionado",
                  "Accesorios y limpieza",
                ].map((t) => (
                  <div key={t}>
                    <Check size={17} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <button
                className="button secondary"
                onClick={() => {
                  setZone("Interior");
                  setShowDamage(true);
                }}
              >
                Registrar observación interior <Plus size={16} />
              </button>
              <label className="check-label confirm-check">
                <input
                  type="checkbox"
                  checked={interior}
                  onChange={(e) => setInterior(e.target.checked)}
                />
                Interior revisado.
              </label>
            </>
          )}
          {step === 7 && (
            <>
              <h3>
                {incoming
                  ? "Registro de salida"
                  : "Observaciones previas del vehículo"}
              </h3>
              {existing.length ? (
                existing.map((d) => (
                  <div key={d.id} className="notice">
                    <strong>
                      {d.zone} · {d.kind} · {d.severity}
                    </strong>
                    <p>{d.note}</p>
                    <small>
                      {dateLabel(d.date)} · {d.employee}
                    </small>
                  </div>
                ))
              ) : (
                <p className="muted">
                  No hay daños preexistentes registrados en este vehículo.
                </p>
              )}
              {incoming && (
                <>
                  <div className="before-after-mini">
                    <div>
                      <span>ANTES · SALIDA</span>
                      <img
                        src={outgoing?.photos[0]?.url || v.image}
                        alt="Evidencia de salida"
                      />
                    </div>
                    <div>
                      <span>DESPUÉS · ENTRADA DEMO</span>
                      <img
                        src={photos[0]?.url || "/images/damage-after.webp"}
                        alt="Referencia ficticia de entrada"
                      />
                    </div>
                  </div>
                  <p className="policy-note">
                    La imagen de referencia demo no detecta daños. La
                    comparación y observaciones son manuales.
                  </p>
                </>
              )}
              <h3>
                {incoming
                  ? "Nuevas observaciones"
                  : "Observaciones de esta inspección"}
              </h3>
              {damages.map((d, i) => (
                <p className="notice" key={i}>
                  {d.zone} · {d.kind} · {d.severity}: {d.note}
                </p>
              ))}
              {!damages.length && (
                <p>No se han agregado observaciones nuevas.</p>
              )}
              <button
                className="button secondary"
                onClick={() => setShowDamage(true)}
              >
                Registrar observación <Plus size={16} />
              </button>
            </>
          )}
          {step === 8 && (
            <>
              <p>
                Conserva evidencia distinta para salida y entrada. Puedes usar
                fotos ficticias preparadas o archivos de prueba.
              </p>
              <div className="evidence-grid">
                {photos.map((p) => (
                  <div key={p.id}>
                    <img src={p.url} alt={p.label} />
                    <button
                      className="icon-button"
                      aria-label="Quitar fotografía"
                      onClick={() =>
                        setPhotos(photos.filter((x) => x.id !== p.id))
                      }
                    >
                      <X size={16} />
                    </button>
                    <small>{p.label}</small>
                  </div>
                ))}
              </div>
              <div className="flex gap wrap">
                <button className="button secondary" onClick={addPhoto}>
                  <Camera size={17} /> Usar foto demo
                </button>
                <label className="button secondary upload-label">
                  <Plus size={17} /> Adjuntar foto ficticia
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (
                        !["image/jpeg", "image/png", "image/webp"].includes(
                          f.type,
                        ) ||
                        f.size > 2097152
                      ) {
                        toast.error(
                          "Usa una imagen JPG, PNG o WebP de hasta 2 MB.",
                        );
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () =>
                        setPhotos([
                          ...photos,
                          {
                            id: uid("PIC"),
                            url: String(reader.result),
                            label: f.name + " · demo",
                          },
                        ]);
                      reader.readAsDataURL(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </>
          )}
          {step === 9 && (
            <>
              {incoming && (
                <>
                  <div className="finance-summary">
                    <div>
                      <small>Saldo pendiente</small>
                      <strong>{money(balance(data, r))}</strong>
                    </div>
                    <div>
                      <small>Depósito retenido</small>
                      <strong>{money(depositHeld(data, id))}</strong>
                    </div>
                  </div>
                  {role === "Administrador" && (
                    <div className="charge-box">
                      <Field label="Cargo conceptual revisado · RD$">
                        <input
                          type="number"
                          min="0"
                          value={charge}
                          onChange={(e) => setCharge(Number(e.target.value))}
                        />
                      </Field>
                      <Field label="Motivo del cargo">
                        <input
                          value={chargeNote}
                          onChange={(e) => setChargeNote(e.target.value)}
                        />
                      </Field>
                      <button
                        className="button secondary"
                        disabled={charge <= 0}
                        onClick={() => {
                          if (
                            act({
                              type: "payment",
                              id,
                              kind: "Cargo adicional",
                              amount: charge,
                              method: "Ajuste demo",
                              note: chargeNote,
                            }).ok
                          )
                            setCharge(0);
                        }}
                      >
                        Registrar cargo demo
                      </button>
                    </div>
                  )}
                  <button
                    className="button secondary"
                    onClick={() => setPay(true)}
                  >
                    <CreditCard size={16} /> Revisar pago / depósito
                  </button>
                  <p className="policy-note">
                    Los daños quedan en revisión; los cargos son decisiones
                    manuales de demostración. El depósito se devuelve por
                    separado.
                  </p>
                </>
              )}
              <Field label="Nombre para firma simulada">
                <input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={c.name}
                />
              </Field>
              {signature && (
                <div className="signature-preview">{signature}</div>
              )}
              <p className="policy-note">
                Confirmación demostrativa. No es una firma electrónica real.
              </p>
            </>
          )}
          {step === 10 && (
            <>
              <div className="review-grid">
                <div>
                  <small>Vehículo</small>
                  <strong>
                    {v.brand} {v.model}
                  </strong>
                </div>
                <div>
                  <small>Kilometraje</small>
                  <strong>{km.toLocaleString()} km</strong>
                </div>
                <div>
                  <small>Combustible</small>
                  <strong>{fuel}%</strong>
                </div>
                <div>
                  <small>Evidencias / observaciones</small>
                  <strong>
                    {photos.length} fotos · {damages.length} observaciones
                  </strong>
                </div>
              </div>
              {incoming ? (
                <>
                  <Field label="Estado del vehículo después de devolver">
                    <select
                      value={nextState}
                      onChange={(e) =>
                        setNextState(e.target.value as VehicleState)
                      }
                    >
                      {[
                        "Limpieza",
                        "Disponible",
                        "Mantenimiento",
                        "Fuera de servicio",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  {nextState === "Mantenimiento" && (
                    <p className="notice">
                      El vehículo queda apartado. Programa su servicio desde
                      mantenimiento para bloquear el período completo.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Field label="Fecha y hora de entrega demo">
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </Field>
                  <div
                    className={
                      balance(data, r) ||
                      depositHeld(data, id) < r.deposit ||
                      !agreement
                        ? "conflict-box"
                        : "success-box"
                    }
                  >
                    {balance(data, r) > 0
                      ? `Saldo pendiente: ${money(balance(data, r))}.`
                      : depositHeld(data, id) < r.deposit
                        ? `Falta depósito: ${money(r.deposit - depositHeld(data, id))}.`
                        : !agreement
                          ? "Prepara el contrato demo."
                          : "Pago, depósito y contrato listos para entregar."}
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => setPay(true)}
                  >
                    Completar pago / depósito
                  </button>
                </>
              )}
              <div className="notice">
                {incoming
                  ? "El alquiler finalizará y conservará las dos inspecciones y su historial."
                  : "La reserva pasará a activa y el vehículo quedará alquilado."}
              </div>
            </>
          )}
          <div className="step-actions">
            {step > 1 ? (
              <button
                className="button secondary"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} /> Atrás
              </button>
            ) : (
              <span />
            )}
            {step < 10 ? (
              <button className="button accent" onClick={next}>
                Continuar <ArrowRight size={16} />
              </button>
            ) : (
              <button className="button accent" onClick={finish}>
                <ClipboardCheck size={18} />
                {incoming ? "Cerrar devolución" : "Entregar vehículo"}
              </button>
            )}
          </div>
        </section>
        <aside className="inspection-sidebar">
          <div className="eyebrow">EL RECORRIDO DE LA INSPECCIÓN</div>
          {titles.map((t, i) => (
            <button
              disabled={i + 1 > step}
              className={
                i + 1 === step ? "current" : i + 1 < step ? "done" : ""
              }
              key={t}
              onClick={() => setStep(i + 1)}
            >
              <span>{i + 1 < step ? <Check size={13} /> : i + 1}</span>
              {t}
            </button>
          ))}
          <p className="policy-note">
            Borrador de esta sesión. Se guarda en el historial al completar la
            entrega o devolución.
          </p>
        </aside>
      </div>
      <Modal
        title={"Observación · " + zone}
        open={showDamage}
        onClose={() => setShowDamage(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) {
              toast.error("Describe la observación.");
              return;
            }
            setDamages([
              ...damages,
              { zone, kind, severity, note, photo: damagePhoto || undefined },
            ]);
            setNote("");
            setDamagePhoto("");
            setShowDamage(false);
            toast.success("Observación agregada al borrador.");
          }}
        >
          <div className="form-grid">
            <Field label="Zona">
              <select value={zone} onChange={(e) => setZone(e.target.value)}>
                {zones.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo">
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                {[
                  "Rayón",
                  "Abolladura",
                  "Cristal",
                  "Rueda",
                  "Interior",
                  "Otro",
                ].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Severidad">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option>Leve</option>
                <option>Moderado</option>
                <option>Severo</option>
              </select>
            </Field>
          </div>
          <Field label="Observación manual">
            <textarea
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </Field>
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              setDamagePhoto(
                incoming
                  ? "/images/damage-after.webp"
                  : "/images/damage-before.webp",
              )
            }
          >
            <Camera size={16} />
            {damagePhoto ? "Foto demo adjunta" : "Adjuntar evidencia demo"}
          </button>
          <button className="button accent full">
            Guardar en borrador <Check size={16} />
          </button>
        </form>
      </Modal>
      <Modal title="Movimientos demo" open={pay} onClose={() => setPay(false)}>
        <PaymentForm id={id} onDone={() => setPay(false)} />
      </Modal>
    </>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={16} />;
}
export function InspectionComparison({ id }: { id: string }) {
  const { data } = useStore();
  const [slider, setSlider] = useState(50);
  const [view, setView] = useState("Comparador");
  const r = data.reservations.find((r) => r.id === id);
  const v = data.vehicles.find((v) => v.id === r?.vehicleId);
  const out = data.inspections.findLast(
    (i) =>
      i.reservationId === id &&
      i.type === "Salida" &&
      i.vehicleId === r?.vehicleId,
  );
  const entry = data.inspections.findLast(
    (i) =>
      i.reservationId === id &&
      i.type === "Entrada" &&
      i.vehicleId === r?.vehicleId,
  );
  if (!r || !out)
    return (
      <Empty
        title="Primero necesitamos una inspección de salida."
        detail="La comparación estará disponible al documentar el vehículo."
      >
        <Link className="button" href={"/operaciones/reservas/" + id}>
          Abrir reserva
        </Link>
      </Empty>
    );
  const demo = !entry;
  const before = out.photos[0]?.url || v?.image;
  const after =
    entry?.photos[0]?.url ||
    (id ===
    data.reservations.find((r) => r.notes.includes("nueva abolladura"))?.id
      ? "/images/damage-after.webp"
      : v?.image);
  return (
    <>
      <Link className="back-link" href={"/operaciones/reservas/" + id}>
        <ArrowLeft size={16} /> Reserva {id}
      </Link>
      <PageTitle
        eyebrow="LA EVIDENCIA CUENTA LA HISTORIA"
        title="Antes. Después. Todo claro."
        description={`${v?.brand} ${v?.model} · ${v?.plate}`}
      />
      {demo && (
        <div className="notice">
          Vista previa con imagen de entrada ficticia. La devolución todavía no
          está registrada; completa la inspección para conservar la evidencia
          real de la demo.
        </div>
      )}
      <div className="pill-tabs">
        <button
          className={view === "Comparador" ? "selected" : ""}
          onClick={() => setView("Comparador")}
        >
          Comparador
        </button>
        <button
          className={view === "Lado a lado" ? "selected" : ""}
          onClick={() => setView("Lado a lado")}
        >
          Lado a lado
        </button>
      </div>
      {view === "Comparador" ? (
        <div className="comparison-frame">
          <img src={after} alt="Evidencia después de la devolución" />
          <div
            className="comparison-before"
            style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
          >
            <img src={before} alt="Evidencia antes de la entrega" />
          </div>
          <span className="before-label">SALIDA</span>
          <span className="after-label">
            {demo ? "ENTRADA · VISTA PREVIA DEMO" : "ENTRADA"}
          </span>
          <div className="comparison-handle" style={{ left: slider + "%" }}>
            <span>↔</span>
          </div>
          <input
            className="comparison-range"
            type="range"
            min="0"
            max="100"
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            aria-label="Comparar fotos de salida y entrada"
          />
        </div>
      ) : (
        <div className="before-after-mini large">
          <div>
            <span>SALIDA</span>
            <img src={before} alt="Antes de entrega" />
          </div>
          <div>
            <span>{demo ? "ENTRADA DEMO" : "ENTRADA"}</span>
            <img src={after} alt="Después de devolución" />
          </div>
        </div>
      )}
      <div className="comparison-stats">
        <div>
          <small>Kilometraje</small>
          <strong>
            {out.km.toLocaleString()} →{" "}
            {entry ? entry.km.toLocaleString() : "Por registrar"}
          </strong>
          <span>
            {entry
              ? `${entry.km - out.km} km recorridos`
              : "Se compara al devolver"}
          </span>
        </div>
        <div>
          <small>Combustible</small>
          <strong>
            {out.fuel}% → {entry ? entry.fuel + "%" : "Por registrar"}
          </strong>
          <span>
            {entry
              ? `${entry.fuel - out.fuel} puntos de diferencia`
              : "Se compara al devolver"}
          </span>
        </div>
        <div>
          <small>Observaciones nuevas</small>
          <strong>{entry ? entry.damageIds.length : "Por registrar"}</strong>
          <span>Revisión manual, sin detección automática</span>
        </div>
        <div>
          <small>Devolución esperada</small>
          <strong>{dateLabel(r.end, true)}</strong>
          <span>
            {entry
              ? "Real: " + dateLabel(entry.date, true)
              : "Pendiente de retorno"}
          </span>
        </div>
      </div>
      <section className="panel">
        <h3>Observaciones documentadas</h3>
        {data.damages
          .filter((d) => d.reservationId === id)
          .map((d) => (
            <div className="damage-record" key={d.id}>
              <div>
                <strong>
                  {d.zone} · {d.kind}
                </strong>
                <p>{d.note}</p>
                <small>
                  {d.employee} · {dateLabel(d.date, true)} · {d.severity}
                </small>
              </div>
              <Badge>{d.state}</Badge>
            </div>
          ))}
        <p className="policy-note">
          Las observaciones se registran manualmente. No establecen
          responsabilidad legal ni cobertura.
        </p>
      </section>
    </>
  );
}
