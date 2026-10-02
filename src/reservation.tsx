"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  FileText,
  CreditCard,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Printer,
  Check,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "./store";
import {
  availability,
  balance,
  paid,
  depositHeld,
  dateLabel,
  money,
  extras,
  quote,
  Payment,
  Reservation,
  Vehicle,
} from "./domain";
import { Badge, Field, Modal, PageTitle, Timeline, Empty } from "./ui";
export function DocumentPreview({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const { data } = useStore();
  const d = data.documents.find((d) => d.id === id);
  const c = data.customers.find((c) => c.id === d?.customerId);
  return (
    <Modal title={d?.type || "Documento demo"} open={!!d} onClose={onClose}>
      {d && (
        <>
          <div className="demo-watermark">DOCUMENTO DEMOSTRATIVO</div>
          {d.data?.startsWith("data:image") ? (
            <img
              className="document-photo"
              src={d.data}
              alt="Documento ficticio cargado"
            />
          ) : d.data?.startsWith("data:application/pdf") ? (
            <iframe
              className="pdf-frame"
              src={d.data}
              title="PDF de demostración"
            />
          ) : (
            <div className="demo-id">
              <div className="eyebrow">AVENZA · ARCHIVO FICTICIO</div>
              <FileText size={36} />
              <h2>{d.type}</h2>
              <h3>{c?.name}</h3>
              <p>{d.name}</p>
              <strong>
                {d.type === "Licencia" ? c?.license : c?.identification}
              </strong>
              <div className="fake-barcode" />
              <small>
                Sin validez como identificación. No contiene datos reales.
              </small>
            </div>
          )}
          <p className="muted">
            {d.name} ·{" "}
            {d.verified ? "Documento demo revisado" : "Pendiente de revisión"}
          </p>
        </>
      )}
    </Modal>
  );
}
export function ContractPreview({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const { data } = useStore();
  const r = data.reservations.find((r) => r.id === id);
  const c = data.customers.find((c) => c.id === r?.customerId);
  const v = data.vehicles.find((v) => v.id === r?.vehicleId);
  const agreement = data.agreements.find((a) => a.reservationId === id);
  return (
    <Modal
      title="Contrato de alquiler · demo"
      open={!!r}
      onClose={onClose}
      wide
    >
      {r && (
        <>
          <div className="contract-document" id="print-contract">
            <div className="contract-brand">
              AVENZA <small>RENT A CAR</small>
            </div>
            <div className="demo-watermark">
              DOCUMENTO DEMOSTRATIVO · SIN VALIDEZ COMERCIAL
            </div>
            <div className="flex between">
              <h2>Acuerdo de alquiler</h2>
              <strong>{agreement?.id || "Borrador"}</strong>
            </div>
            <p>
              Reserva {r.id} · emitido {dateLabel(agreement?.date || r.start)}
            </p>
            <div className="review-grid">
              <div>
                <small>Conductor ficticio</small>
                <h3>{c?.name}</h3>
                <p>
                  {c?.identification}
                  <br />
                  {c?.license}
                </p>
              </div>
              <div>
                <small>Vehículo asignado</small>
                <h3>
                  {v?.brand} {v?.model}
                </h3>
                <p>
                  {v?.plate} · {v?.vin}
                </p>
              </div>
              <div>
                <small>Recogida</small>
                <strong>{dateLabel(r.start, true)}</strong>
                <p>{r.pickup}</p>
              </div>
              <div>
                <small>Devolución</small>
                <strong>{dateLabel(r.end, true)}</strong>
                <p>{r.dropoff}</p>
              </div>
            </div>
            <div className="summary-line">
              <span>Precio total demostrativo</span>
              <strong>{money(r.total)}</strong>
            </div>
            <div className="summary-line">
              <span>Depósito conceptual separado</span>
              <strong>{money(r.deposit)}</strong>
            </div>
            <h3>Condiciones conceptuales</h3>
            <ol>
              <li>
                Este documento forma parte de una demostración de producto. No
                constituye un alquiler real.
              </li>
              <li>
                Las fechas, tarifas, protecciones, requisitos y cancelaciones se
                configurarían para cada negocio.
              </li>
              <li>
                La inspección documenta el estado observado manualmente; no
                determina responsabilidad legal.
              </li>
              <li>
                Los pagos y firmas son simulados. No se ha procesado dinero ni
                verificado identidad real.
              </li>
            </ol>
            <div className="signature-row">
              <div>
                <span className="simulated-signature">
                  {agreement?.signature || "Pendiente"}
                </span>
                <small>Firma simulada del conductor</small>
              </div>
              <div>
                <span className="simulated-signature">María Gómez</span>
                <small>Firma simulada de AVENZA</small>
              </div>
            </div>
            <p className="policy-note">
              Concept Project by MORAN STUDIO · todos los datos son ficticios.
            </p>
          </div>
          <button className="button secondary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir documento demo
          </button>
        </>
      )}
    </Modal>
  );
}
export function PaymentForm({
  id,
  onDone,
}: {
  id: string;
  onDone: () => void;
}) {
  const { data, act, role } = useStore();
  const r = data.reservations.find((r) => r.id === id)!;
  const [kind, setKind] = useState<Payment["kind"]>("Pago");
  const [amount, setAmount] = useState(balance(data, r));
  const [method, setMethod] = useState("Efectivo");
  const [note, setNote] = useState("Movimiento de demostración");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (act({ type: "payment", id, kind, amount, method, note }).ok)
          onDone();
      }}
    >
      <div className="finance-summary">
        <div>
          <small>Saldo alquiler</small>
          <strong>{money(balance(data, r))}</strong>
        </div>
        <div>
          <small>Depósito retenido</small>
          <strong>{money(depositHeld(data, id))}</strong>
        </div>
      </div>
      <div className="form-grid">
        <Field label="Tipo de movimiento">
          <select
            value={kind}
            onChange={(e) => {
              const k = e.target.value as Payment["kind"];
              setKind(k);
              setAmount(
                k === "Depósito"
                  ? Math.max(0, r.deposit - depositHeld(data, id))
                  : k === "Reembolso"
                    ? depositHeld(data, id)
                    : k === "Cargo adicional"
                      ? 0
                      : balance(data, r),
              );
            }}
          >
            {[
              "Pago",
              "Abono",
              "Depósito",
              ...(role === "Administrador"
                ? ["Cargo adicional", "Reembolso"]
                : []),
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Importe · RD$">
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </Field>
        <Field label="Método ficticio">
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Efectivo</option>
            <option>Tarjeta demo</option>
            <option>Transferencia demo</option>
          </select>
        </Field>
        <Field label="Nota">
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
      <p className="policy-note">
        El depósito y su reembolso no cuentan como ingreso del alquiler. No
        ingreses datos de tarjetas reales.
      </p>
      <button className="button accent full">
        Registrar movimiento demo <Check size={16} />
      </button>
    </form>
  );
}
function Assignment({ r, onDone }: { r: Reservation; onDone: () => void }) {
  const { data, act } = useStore();
  const [vehicleId, setVehicleId] = useState("");
  const [reason, setReason] = useState("");
  const [outKm, setOutKm] = useState(0);
  const [outFuel, setOutFuel] = useState(100);
  const [previousKm, setPreviousKm] = useState(
    data.vehicles.find((v) => v.id === r.vehicleId)?.km || 0,
  );
  const [confirmed, setConfirmed] = useState(false);
  const active = r.state === "Activa";
  const options = data.vehicles.filter(
    (v) =>
      v.id !== r.vehicleId && !availability(data, v.id, r.start, r.end, r.id),
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (
          act({
            type: "assign",
            id: r.id,
            vehicleId,
            reason,
            outKm,
            outFuel,
            previousKm,
            inspectionConfirmed: confirmed,
          }).ok
        )
          onDone();
      }}
    >
      <p>
        {active
          ? "El cambio conserva este alquiler y cierra el segmento del vehículo anterior. Revisa el reemplazo y registra sus valores de salida."
          : "Selecciona un vehículo sin compromisos incompatibles."}
      </p>
      <Field label="Vehículo disponible">
        <select
          required
          value={vehicleId}
          onChange={(e) => {
            setVehicleId(e.target.value);
            const v = data.vehicles.find((v) => v.id === e.target.value);
            setOutKm(v?.km || 0);
            setOutFuel(v?.fuel || 100);
            setConfirmed(false);
          }}
        >
          <option value="">Seleccionar vehículo</option>
          {options.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} · {v.id} · {v.branch}
            </option>
          ))}
        </select>
      </Field>
      {active && (
        <>
          <Field label="Motivo del cambio">
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. vibración en rueda, reemplazo coordinado"
            />
          </Field>
          <div className="form-grid">
            <Field label="KM de cierre del vehículo anterior">
              <input
                type="number"
                min={data.rentals.find((x) => x.reservationId === r.id)?.outKm}
                required
                value={previousKm}
                onChange={(e) => setPreviousKm(Number(e.target.value))}
              />
            </Field>
            <Field label="KM de salida del reemplazo">
              <input
                type="number"
                required
                min={data.vehicles.find((v) => v.id === vehicleId)?.km}
                value={outKm}
                onChange={(e) => setOutKm(Number(e.target.value))}
              />
            </Field>
            <Field label="Combustible del reemplazo · %">
              <input
                type="number"
                min="0"
                max="100"
                required
                value={outFuel}
                onChange={(e) => setOutFuel(Number(e.target.value))}
              />
            </Field>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              required
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            Reemplazo revisado: exterior, interior y valores de salida. Firma y
            foto representativa simuladas.
          </label>
          <p className="policy-note">
            Se conservará una inspección demo del reemplazo. El vehículo
            anterior quedará pendiente de inspección.
          </p>
        </>
      )}
      {!options.length && (
        <p className="error">
          No hay reemplazos disponibles para este período.
        </p>
      )}
      <button className="button accent full" disabled={!vehicleId}>
        {active ? "Confirmar cambio" : "Asignar vehículo"}{" "}
        <RefreshCw size={16} />
      </button>
    </form>
  );
}
function Extension({ r, onDone }: { r: Reservation; onDone: () => void }) {
  const { data, act } = useStore();
  const [end, setEnd] = useState(
    r.extensionRequest?.slice(0, 16) ||
      new Date(new Date(r.end).getTime() + 2 * 86400000 - 4 * 3600000)
        .toISOString()
        .slice(0, 16),
  );
  const conflict = r.vehicleId
    ? availability(data, r.vehicleId, r.start, end, r.id)
    : "Asigna un vehículo primero.";
  const diff =
    quote(r.rate, r.start, end, r.extras) -
    quote(r.rate, r.start, r.end, r.extras);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (act({ type: "extend", id: r.id, end }).ok) onDone();
      }}
    >
      <div className="notice">Devolución actual: {dateLabel(r.end, true)}</div>
      <Field label="Nueva devolución">
        <input
          type="datetime-local"
          required
          value={end}
          min={r.end.slice(0, 16)}
          onChange={(e) => setEnd(e.target.value)}
        />
      </Field>
      {conflict ? (
        <div className="conflict-box">
          <h3>Este recorrido tiene un cruce.</h3>
          <p>{conflict}</p>
          <small>
            Prueba una fecha anterior o coordina un cambio de vehículo.
          </small>
        </div>
      ) : (
        <div className="success-box">
          Disponible para extender. Importe adicional:{" "}
          <strong>{money(Math.max(0, diff))}</strong>.
        </div>
      )}
      <button className="button accent full" disabled={!!conflict}>
        Registrar extensión <ArrowRight size={16} />
      </button>
    </form>
  );
}
export function ReservationDetail({ id }: { id: string }) {
  const { data, act, role } = useStore();
  const router = useRouter();
  const r = data.reservations.find((r) => r.id === id);
  const [modal, setModal] = useState("");
  const [document, setDocument] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [signature, setSignature] = useState("");
  const [tab, setTab] = useState("Resumen");
  if (!r) return <Empty title="No encontramos esa reserva." />;
  const c = data.customers.find((c) => c.id === r.customerId)!;
  const v = data.vehicles.find((v) => v.id === r.vehicleId);
  const rental = data.rentals.find((x) => x.reservationId === r.id);
  const agreement = data.agreements.find((a) => a.reservationId === r.id);
  const inspect = data.inspections.filter((i) => i.reservationId === r.id);
  const active = r.state === "Activa";
  const closed = ["Finalizada", "Cancelada", "No-show"].includes(r.state);
  return (
    <>
      <Link className="back-link" href="/operaciones/reservas">
        <ArrowLeft size={15} /> Reservas
      </Link>
      <PageTitle
        eyebrow={r.id}
        title={c.name}
        description={`${dateLabel(r.start, true)} — ${dateLabel(r.end, true)} · ${r.pickup}`}
      >
        <Badge>{r.state}</Badge>
        <Link className="button secondary" href={"/portal/" + r.id}>
          Portal cliente <ArrowUpRight size={16} />
        </Link>
      </PageTitle>
      {r.extensionRequest && (
        <div className="notice flex between">
          <span>
            Extensión solicitada hasta {dateLabel(r.extensionRequest, true)}.
          </span>
          <button className="text-link" onClick={() => setModal("extension")}>
            Revisar solicitud <ArrowRight size={16} />
          </button>
        </div>
      )}
      <div className="rental-workflow">
        {[
          "Reserva",
          "Documentos",
          "Contrato",
          "Inspección de salida",
          "Alquiler activo",
          "Devolución",
        ].map((s, i) => {
          const complete =
            i === 0 ||
            (i === 1 &&
              data.documents.some(
                (d) => d.customerId === c.id && d.type === "Licencia",
              )) ||
            (i === 2 && agreement?.signed) ||
            (i === 3 && inspect.some((x) => x.type === "Salida")) ||
            (i === 4 && (active || r.state === "Finalizada")) ||
            (i === 5 && r.state === "Finalizada");
          return (
            <div className={complete ? "done" : ""} key={s}>
              <span>{complete ? <Check size={13} /> : i + 1}</span>
              {s}
            </div>
          );
        })}
      </div>
      <div className="pill-tabs detail-tabs">
        {["Resumen", "Documentos", "Inspecciones", "Actividad"].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="record-layout">
        <div className="record-main">
          {tab === "Resumen" && (
            <>
              <section className="panel reservation-vehicle">
                <div className="flex between">
                  <h3>Vehículo asignado</h3>
                  {!closed && (
                    <button
                      className="text-link"
                      onClick={() => setModal("assign")}
                    >
                      {active ? "Cambiar vehículo" : "Asignar / cambiar"}{" "}
                      <RefreshCw size={15} />
                    </button>
                  )}
                </div>
                {v ? (
                  <div className="assigned-vehicle">
                    <img src={v.image} alt="Vehículo representativo demo" />
                    <div>
                      <Badge>{v.state}</Badge>
                      <h2>
                        {v.brand} {v.model}
                      </h2>
                      <p>
                        {v.id} · {v.plate} · {v.year}
                      </p>
                      <Link
                        className="text-link"
                        href={"/operaciones/flota/" + v.id}
                      >
                        Abrir ficha de vehículo <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Empty
                    title="Aún no hay vehículo asignado."
                    detail="Selecciona uno disponible antes de preparar la entrega."
                  />
                )}
                <div className="review-grid">
                  <div>
                    <small>Recogida</small>
                    <strong>{dateLabel(r.start, true)}</strong>
                    <p>{r.pickup}</p>
                  </div>
                  <div>
                    <small>Devolución</small>
                    <strong>{dateLabel(r.end, true)}</strong>
                    <p>{r.dropoff}</p>
                  </div>
                </div>
                {rental && (
                  <div className="spec-grid">
                    <div>
                      <small>KM salida</small>
                      <strong>{rental.outKm.toLocaleString()}</strong>
                    </div>
                    <div>
                      <small>Combustible salida</small>
                      <strong>{rental.outFuel}%</strong>
                    </div>
                  </div>
                )}
                {rental && rental.segments.length > 1 && (
                  <div className="segment-list">
                    <h4>Vehículos en este alquiler</h4>
                    {rental.segments.map((s, i) => (
                      <div key={i}>
                        <span>{s.vehicleId}</span>
                        <small>
                          {dateLabel(s.start)} →{" "}
                          {s.end ? dateLabel(s.end) : "en curso"} ·{" "}
                          {s.reason || "Entrega inicial"}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section className="panel">
                <div className="flex between">
                  <h3>Cliente y conductores</h3>
                  <Link
                    className="text-link"
                    href={"/operaciones/clientes/" + c.id}
                  >
                    Ver perfil <ArrowUpRight size={15} />
                  </Link>
                </div>
                <div className="review-grid">
                  <div>
                    <strong>{c.name}</strong>
                    <p>
                      {c.email}
                      <br />
                      {c.phone}
                    </p>
                  </div>
                  <div>
                    <small>Licencia ficticia</small>
                    <strong>{c.license}</strong>
                    <p>
                      {r.additionalDriver
                        ? "Conductor adicional: " + r.additionalDriver
                        : "Sin conductor adicional"}
                    </p>
                  </div>
                </div>
              </section>
              <section className="panel">
                <div className="flex between">
                  <h3>Notas de la reserva</h3>
                  <button
                    className="text-link"
                    onClick={() => {
                      setNote("");
                      setModal("note");
                    }}
                  >
                    Agregar nota <Plus size={16} />
                  </button>
                </div>
                <p className="preserve-lines">{r.notes}</p>
                {data.incidents
                  .filter((x) => x.reservationId === r.id)
                  .map((x) => (
                    <div className="notice" key={x.id}>
                      <strong>Incidencia · {x.state}</strong>
                      <p>{x.note}</p>
                      <small>{dateLabel(x.date, true)}</small>
                    </div>
                  ))}
              </section>
            </>
          )}
          {tab === "Documentos" && (
            <section className="panel">
              <h3>Archivo del cliente</h3>
              <p className="muted">
                Documentos ficticios. No cargues identificación real.
              </p>
              <div className="document-list">
                {data.documents
                  .filter((d) => d.customerId === c.id)
                  .map((d) => (
                    <button key={d.id} onClick={() => setDocument(d.id)}>
                      <FileText size={18} />
                      <span>
                        {d.type}
                        <small>{d.name}</small>
                      </span>
                      <Badge>{d.verified ? "Verificado" : "Pendiente"}</Badge>
                    </button>
                  ))}
              </div>
              <label className="button secondary upload-label">
                <Upload size={16} /> Adjuntar licencia demo
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (
                      !["image/jpeg", "image/png", "application/pdf"].includes(
                        f.type,
                      ) ||
                      f.size > 2097152
                    ) {
                      toast.error("Selecciona JPG, PNG o PDF de hasta 2 MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () =>
                      act({
                        type: "document",
                        customerId: c.id,
                        reservationId: r.id,
                        name: f.name,
                        docType: "Licencia",
                        data: String(reader.result),
                      });
                    reader.readAsDataURL(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <hr />
              <h3>Contrato de esta reserva</h3>
              {agreement ? (
                <>
                  <p>
                    {agreement.id} ·{" "}
                    {agreement.signed ? "Firma demo completada" : "Sin firma"}
                  </p>
                  <button
                    className="button"
                    onClick={() => setModal("preview")}
                  >
                    Ver documento <FileText size={16} />
                  </button>
                </>
              ) : (
                <button
                  className="button"
                  onClick={() => setModal("agreement")}
                >
                  Preparar contrato demo
                </button>
              )}
            </section>
          )}
          {tab === "Inspecciones" && (
            <section className="panel">
              <div className="flex between">
                <h3>Evidencia del recorrido</h3>
                <Link
                  className="text-link"
                  href={"/operaciones/comparacion/" + r.id}
                >
                  Comparar antes / después <ArrowUpRight size={16} />
                </Link>
              </div>
              {inspect.map((i) => (
                <div className="inspection-record" key={i.id}>
                  <div className="flex between">
                    <h3>Inspección de {i.type.toLowerCase()}</h3>
                    <Badge>{i.type}</Badge>
                  </div>
                  <p>
                    {i.km.toLocaleString()} km · {i.fuel}% combustible ·{" "}
                    {dateLabel(i.date, true)}
                  </p>
                  <div className="evidence-thumbs">
                    {i.photos.map((p) => (
                      <img key={p.id} src={p.url} alt={p.label} />
                    ))}
                  </div>
                  <small>
                    {i.employee} · firma simulada: {i.signature}
                  </small>
                  {data.damages
                    .filter((d) => d.inspectionId === i.id)
                    .map((d) => (
                      <p className="notice" key={d.id}>
                        {d.zone} · {d.kind} · {d.severity}: {d.note}
                      </p>
                    ))}
                </div>
              ))}
              {!inspect.length && (
                <Empty
                  title="La historia visual aún no comienza."
                  detail="La inspección de salida documentará el estado inicial."
                />
              )}
            </section>
          )}
          {tab === "Actividad" && (
            <section className="panel">
              <h3>Lo que ha ocurrido</h3>
              <Timeline reservationId={r.id} />
            </section>
          )}
        </div>
        <aside className="record-aside">
          <section className="panel">
            <h3>Cuenta de alquiler</h3>
            <div className="summary-line">
              <span>Tarifa × días</span>
              <strong>{money(quote(r.rate, r.start, r.end, []))}</strong>
            </div>
            {extras
              .filter((e) => r.extras.includes(e.id))
              .map((e) => (
                <div className="summary-line" key={e.id}>
                  <span>{e.name}</span>
                  <small>Incluido en total</small>
                </div>
              ))}
            <div className="summary-line">
              <span>Total</span>
              <strong>{money(r.total)}</strong>
            </div>
            <div className="summary-line">
              <span>Pagado</span>
              <strong>{money(paid(data, r.id))}</strong>
            </div>
            <div className="summary-line total">
              <span>Saldo</span>
              <strong>{money(balance(data, r))}</strong>
            </div>
            <div className="summary-line">
              <span>Depósito retenido</span>
              <strong>{money(depositHeld(data, r.id))}</strong>
            </div>
            <button
              className="button secondary full"
              onClick={() => setModal("payment")}
            >
              Registrar pago demo <CreditCard size={16} />
            </button>
            <div className="payment-history">
              {data.payments
                .filter((p) => p.reservationId === r.id)
                .map((p) => (
                  <div className="payment-row" key={p.id}>
                    <span>
                      {p.kind}
                      <small>
                        {dateLabel(p.date)} · {p.method}
                      </small>
                    </span>
                    <strong>{money(p.amount)}</strong>
                  </div>
                ))}
            </div>
          </section>
          {!closed && (
            <section className="panel warm">
              <h3>{active ? "Alquiler en curso" : "Preparar entrega"}</h3>
              {!active && (
                <button
                  className="button secondary full"
                  disabled={!v}
                  onClick={() => {
                    setSignature(c.name);
                    setModal("agreement");
                  }}
                >
                  <FileText size={16} />{" "}
                  {agreement ? "Revisar firma demo" : "Preparar contrato"}
                </button>
              )}
              {active && (
                <>
                  <button
                    className="button secondary full"
                    onClick={() => setModal("extension")}
                  >
                    Extender alquiler <Plus size={16} />
                  </button>
                  <button
                    className="button secondary full"
                    onClick={() => {
                      setNote("");
                      setModal("incident");
                    }}
                  >
                    Registrar incidencia
                  </button>
                </>
              )}
              <Link
                className="button accent full"
                href={`/operaciones/inspeccion/${r.id}?tipo=${active ? "entrada" : "salida"}`}
              >
                <ClipboardCheck size={17} />
                {active ? "Iniciar devolución" : "Inspeccionar y entregar"}
              </Link>
              {!active && (
                <button
                  className="text-link danger"
                  onClick={() => setModal("cancel")}
                >
                  Cancelar reserva
                </button>
              )}
            </section>
          )}
        </aside>
      </div>
      <Modal
        title="Registrar movimiento demo"
        open={modal === "payment"}
        onClose={() => setModal("")}
      >
        <PaymentForm id={r.id} onDone={() => setModal("")} />
      </Modal>
      <Modal
        title={active ? "Cambiar vehículo" : "Asignar vehículo"}
        open={modal === "assign"}
        onClose={() => setModal("")}
      >
        <Assignment r={r} onDone={() => setModal("")} />
      </Modal>
      <Modal
        title="Extender el recorrido"
        open={modal === "extension"}
        onClose={() => setModal("")}
      >
        <Extension r={r} onDone={() => setModal("")} />
      </Modal>
      <Modal
        title="Preparar contrato"
        open={modal === "agreement"}
        onClose={() => setModal("")}
      >
        <p className="notice">
          Firma de demostración. No equivale a una firma electrónica verificada.
        </p>
        <Field label="Nombre para la firma simulada">
          <input
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </Field>
        <button
          className="button accent full"
          onClick={() => {
            if (act({ type: "agreement", id: r.id, signature }).ok)
              setModal("preview");
          }}
        >
          Generar contrato demo <FileText size={16} />
        </button>
      </Modal>
      <ContractPreview
        id={modal === "preview" ? r.id : null}
        onClose={() => setModal("")}
      />
      <DocumentPreview id={document} onClose={() => setDocument(null)} />
      <Modal
        title={modal === "incident" ? "Registrar incidencia" : "Agregar nota"}
        open={["note", "incident"].includes(modal)}
        onClose={() => setModal("")}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              act({
                type: modal === "incident" ? "incident" : "note",
                id: r.id,
                note,
              }).ok
            )
              setModal("");
          }}
        >
          <Field label="Observación">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              rows={4}
            />
          </Field>
          <button className="button accent full">Guardar</button>
        </form>
      </Modal>
      <Modal
        title="Cancelar esta reserva"
        open={modal === "cancel"}
        onClose={() => setModal("")}
      >
        <p>
          Se liberarán las fechas del vehículo. Los movimientos demo quedarán en
          su historial para revisión.
        </p>
        <button
          className="button accent full"
          onClick={() => {
            if (act({ type: "cancel", id: r.id }).ok) setModal("");
          }}
        >
          Confirmar cancelación
        </button>
      </Modal>
    </>
  );
}
