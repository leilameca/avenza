export const TODAY = "2026-10-02";
export const NOW = TODAY + "T10:00:00-04:00";
export const branches = ["Santiago Centro", "Aeropuerto del Cibao"] as const;
export type Role = "Administrador" | "Operaciones";
export type VehicleState =
  | "Disponible"
  | "Reservado"
  | "Preparación"
  | "Alquilado"
  | "Pendiente de inspección"
  | "Mantenimiento"
  | "Fuera de servicio"
  | "Limpieza";
export type ReservationState =
  | "Confirmada"
  | "Pendiente de pago"
  | "Lista para entrega"
  | "Activa"
  | "Finalizada"
  | "Cancelada"
  | "No-show";
export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  vin: string;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  bags: number;
  rate: number;
  km: number;
  fuel: number;
  branch: string;
  state: VehicleState;
  image: string;
  lastService: string;
  nextService: number;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  identification: string;
  license: string;
  notes: string;
};
export type Extra = {
  id: string;
  name: string;
  rate: number;
  description: string;
};
export const extras: Extra[] = [
  {
    id: "driver",
    name: "Conductor adicional",
    rate: 450,
    description: "Comparte el volante durante tu recorrido.",
  },
  {
    id: "seat",
    name: "Silla infantil",
    rate: 300,
    description: "Viaja con los pequeños, con todo preparado.",
  },
  {
    id: "wifi",
    name: "Wi-Fi portátil",
    rate: 250,
    description: "Conexión durante el viaje. Servicio conceptual.",
  },
  {
    id: "delivery",
    name: "Entrega coordinada",
    rate: 600,
    description: "Un punto de encuentro distinto. Cargo único.",
  },
  {
    id: "protection",
    name: "Protección adicional demo",
    rate: 550,
    description: "Opción conceptual; condiciones configurables.",
  },
];
export type Reservation = {
  id: string;
  customerId: string;
  vehicleId: string | null;
  category: string;
  start: string;
  end: string;
  pickup: string;
  dropoff: string;
  state: ReservationState;
  rate: number;
  extras: string[];
  total: number;
  deposit: number;
  notes: string;
  additionalDriver: string;
  extensionRequest?: string;
};
export type Rental = {
  id: string;
  reservationId: string;
  segments: {
    vehicleId: string;
    start: string;
    end?: string;
    reason?: string;
    outKm?: number;
    outFuel?: number;
    inKm?: number;
  }[];
  outKm: number;
  outFuel: number;
  returnedAt?: string;
};
export type Payment = {
  id: string;
  reservationId: string;
  kind: "Abono" | "Pago" | "Depósito" | "Cargo adicional" | "Reembolso";
  amount: number;
  method: string;
  date: string;
  note: string;
};
export type Damage = {
  id: string;
  vehicleId: string;
  reservationId: string;
  inspectionId: string;
  zone: string;
  kind: string;
  severity: string;
  note: string;
  date: string;
  employee: string;
  state: "En revisión" | "Cotización" | "Cobrado" | "Resuelto";
  photo?: string;
};
export type Inspection = {
  id: string;
  reservationId: string;
  vehicleId: string;
  type: "Salida" | "Entrada";
  km: number;
  fuel: number;
  date: string;
  employee: string;
  photos: { id: string; url: string; label: string }[];
  damageIds: string[];
  signature: string;
  interior: boolean;
  exterior: boolean;
};
export type Maintenance = {
  id: string;
  vehicleId: string;
  start: string;
  end: string;
  type: string;
  cost: number;
  provider: string;
  state: "Programado" | "En curso" | "Completado";
  km: number;
};
export type Document = {
  id: string;
  customerId: string;
  reservationId?: string;
  type: string;
  name: string;
  verified: boolean;
  data?: string;
};
export type Agreement = {
  id: string;
  reservationId: string;
  date: string;
  signed: boolean;
  signature?: string;
};
export type Activity = {
  id: string;
  reservationId?: string;
  vehicleId?: string;
  actor: string;
  text: string;
  date: string;
};
export type Incident = {
  id: string;
  reservationId: string;
  vehicleId: string;
  note: string;
  date: string;
  state: string;
};
export type Notification = {
  id: string;
  text: string;
  href: string;
  read: boolean;
};
export type Employee = { id: string; name: string; role: Role; branch: string };
export type User = { id: string; employeeId: string; role: Role };
export type Data = {
  version: number;
  vehicles: Vehicle[];
  customers: Customer[];
  reservations: Reservation[];
  rentals: Rental[];
  payments: Payment[];
  inspections: Inspection[];
  damages: Damage[];
  maintenance: Maintenance[];
  documents: Document[];
  agreements: Agreement[];
  activity: Activity[];
  incidents: Incident[];
  employees: Employee[];
  notifications: Notification[];
  settings: { usdRate: number; bufferHours: number; company: string };
};
export function demoDateTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    ? value + ":00-04:00"
    : value;
}
export function days(start: string, end: string) {
  start = demoDateTime(start);
  end = demoDateTime(end);
  return Math.max(
    1,
    Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000),
  );
}
export function quote(
  rate: number,
  start: string,
  end: string,
  extraIds: string[],
) {
  const d = days(start, end);
  return (
    rate * d +
    extras
      .filter((e) => extraIds.includes(e.id))
      .reduce((n, e) => n + e.rate * (e.id === "delivery" ? 1 : d), 0)
  );
}
export function paid(data: Data, id: string) {
  return data.payments
    .filter((p) => p.reservationId === id && ["Pago", "Abono"].includes(p.kind))
    .reduce((a, p) => a + p.amount, 0);
}
export function balance(data: Data, r: Reservation) {
  return Math.max(0, r.total - paid(data, r.id));
}
export function depositHeld(data: Data, id: string) {
  return data.payments
    .filter(
      (p) =>
        p.reservationId === id && ["Depósito", "Reembolso"].includes(p.kind),
    )
    .reduce((a, p) => a + (p.kind === "Reembolso" ? -p.amount : p.amount), 0);
}
export function overlap(
  a: string,
  b: string,
  c: string,
  d: string,
  buffer = 0,
) {
  a = demoDateTime(a);
  b = demoDateTime(b);
  c = demoDateTime(c);
  d = demoDateTime(d);
  return (
    new Date(a).getTime() < new Date(d).getTime() + buffer * 3600000 &&
    new Date(b).getTime() + buffer * 3600000 > new Date(c).getTime()
  );
}
export function availability(
  data: Data,
  vehicleId: string,
  start: string,
  end: string,
  ignore?: string,
): string | null {
  start = demoDateTime(start);
  end = demoDateTime(end);
  const v = data.vehicles.find((v) => v.id === vehicleId);
  if (!v) return "No encontramos este vehículo.";
  if (
    !start ||
    !end ||
    !Number.isFinite(new Date(start).getTime()) ||
    !Number.isFinite(new Date(end).getTime()) ||
    new Date(end) <= new Date(start)
  )
    return "La devolución debe ser después de la recogida.";
  if (v.state === "Fuera de servicio")
    return "Este vehículo está fuera de servicio.";
  if (
    v.state === "Mantenimiento" &&
    !data.maintenance.some(
      (m) => m.vehicleId === v.id && m.state !== "Completado",
    )
  )
    return "El vehículo está apartado para mantenimiento. Falta programar su servicio.";
  const m = data.maintenance.find(
    (m) =>
      m.vehicleId === vehicleId &&
      m.state !== "Completado" &&
      overlap(start, end, m.start, m.end),
  );
  if (m) return `Mantenimiento bloquea estas fechas: ${m.type}.`;
  const r = data.reservations.find(
    (r) =>
      r.id !== ignore &&
      r.vehicleId === vehicleId &&
      !["Cancelada", "No-show", "Finalizada"].includes(r.state) &&
      overlap(start, end, r.start, r.end, data.settings.bufferHours),
  );
  if (r)
    return `Conflicto con ${r.id}. Incluimos ${data.settings.bufferHours} horas para preparar el vehículo.`;
  if (
    [
      "Limpieza",
      "Pendiente de inspección",
      "Preparación",
      "Mantenimiento",
    ].includes(v.state) &&
    new Date(start).getTime() <
      new Date(NOW).getTime() + data.settings.bufferHours * 3600000
  )
    return `El vehículo está en ${v.state.toLowerCase()}. Elige una recogida posterior.`;
  return null;
}
export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
export function dateLabel(d: string, time = false) {
  return new Date(
    d.length === 10 ? d + "T12:00:00-04:00" : demoDateTime(d),
  ).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/Santo_Domingo",
  });
}
export function money(n: number, currency = "DOP", rate = 60) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })
    .format(currency === "USD" ? n / rate : n)
    .replace("DOP", "RD$");
}
export type Action =
  | {
      type: "book";
      customer: Omit<Customer, "id">;
      vehicleId: string;
      start: string;
      end: string;
      pickup: string;
      dropoff: string;
      extras: string[];
      additionalDriver: string;
      advance: number;
      method?: string;
    }
  | {
      type: "assign";
      id: string;
      vehicleId: string;
      reason?: string;
      outKm?: number;
      outFuel?: number;
      previousKm?: number;
      inspectionConfirmed?: boolean;
    }
  | { type: "agreement"; id: string; signature: string }
  | {
      type: "payment";
      id: string;
      kind: Payment["kind"];
      amount: number;
      method: string;
      note: string;
    }
  | { type: "extend"; id: string; end: string }
  | { type: "requestExtension"; id: string; end: string }
  | { type: "note"; id: string; note: string }
  | { type: "incident"; id: string; note: string }
  | { type: "cancel"; id: string }
  | {
      type: "inspection";
      id: string;
      inspection: Omit<
        Inspection,
        "id" | "reservationId" | "vehicleId" | "damageIds" | "employee"
      >;
      damages: Omit<
        Damage,
        | "id"
        | "vehicleId"
        | "reservationId"
        | "inspectionId"
        | "employee"
        | "date"
        | "state"
      >[];
      charge: number;
      nextState: VehicleState;
    }
  | {
      type: "maintenance";
      vehicleId: string;
      start: string;
      end: string;
      service: string;
      cost: number;
      provider: string;
    }
  | { type: "completeMaintenance"; id: string }
  | { type: "vehicleState"; id: string; state: VehicleState }
  | {
      type: "document";
      customerId: string;
      reservationId: string;
      name: string;
      docType: string;
      data: string;
    }
  | { type: "damageState"; id: string; state: Damage["state"] }
  | { type: "settings"; usdRate: number; bufferHours: number }
  | { type: "readNotification"; id: string };
function applyAction(
  original: Data,
  action: Action,
  role: Role = "Administrador",
): { data: Data; id?: string; message: string } {
  const data: Data = structuredClone(original);
  const actor = role === "Administrador" ? "María Gómez" : "Carlos Peña";
  const a = structuredClone(action);
  if ("start" in a) a.start = demoDateTime(a.start);
  if ("end" in a) a.end = demoDateTime(a.end);
  if (a.type === "inspection")
    a.inspection.date = demoDateTime(a.inspection.date);
  const log = (text: string, r?: Reservation, v?: string) =>
    data.activity.unshift({
      id: uid("ACT"),
      actor,
      text,
      date: new Date().toISOString(),
      reservationId: r?.id,
      vehicleId: v || r?.vehicleId || undefined,
    });
  const get = (id: string) => {
    const r = data.reservations.find((r) => r.id === id);
    if (!r) throw Error("No encontramos esa reserva.");
    return r;
  };
  const check = (v: string, s: string, e: string, id?: string) => {
    const error = availability(data, v, s, e, id);
    if (error) throw Error(error);
  };
  if (a.type === "book") {
    check(a.vehicleId, a.start, a.end);
    if (new Date(a.start) < new Date(NOW))
      throw Error("Elige una recogida posterior a la hora de la demo.");
    if (
      !a.customer.name.trim() ||
      !a.customer.license.trim() ||
      !a.customer.email.includes("@")
    )
      throw Error("Completa nombre, correo y licencia demo.");
    const v = data.vehicles.find((v) => v.id === a.vehicleId)!;
    let c = data.customers.find(
      (c) => c.email.toLowerCase() === a.customer.email.toLowerCase(),
    );
    if (!c) {
      c = { ...a.customer, id: uid("CLI") };
      data.customers.push(c);
    }
    if (
      !branches.includes(a.pickup as (typeof branches)[number]) ||
      !branches.includes(a.dropoff as (typeof branches)[number]) ||
      v.branch !== a.pickup
    )
      throw Error("Revisa las sucursales y el lugar del vehículo.");
    if (a.extras.some((id) => !extras.some((e) => e.id === id)))
      throw Error("Extra no reconocido.");
    const total = quote(v.rate, a.start, a.end, a.extras);
    if (a.advance < 0 || a.advance > total)
      throw Error("El abono debe estar entre cero y el total.");
    const id = `AVZ-${a.start.slice(2, 10).replaceAll("-", "")}-${String(data.reservations.length + 1).padStart(3, "0")}`;
    const r: Reservation = {
      id,
      customerId: c.id,
      vehicleId: v.id,
      category: v.category,
      start: a.start,
      end: a.end,
      pickup: a.pickup,
      dropoff: a.dropoff,
      state: a.advance ? "Confirmada" : "Pendiente de pago",
      rate: v.rate,
      extras: a.extras,
      total,
      deposit: 12000,
      notes: "Reserva desde la web · datos ficticios.",
      additionalDriver: a.additionalDriver,
    };
    data.reservations.unshift(r);
    if (a.advance)
      data.payments.push({
        id: uid("PAY"),
        reservationId: id,
        kind: "Abono",
        amount: a.advance,
        method: a.method || "Tarjeta demo",
        date: new Date().toISOString(),
        note: "Abono simulado en web",
      });
    log("Reserva creada desde la web", r);
    log("Vehículo asignado al reservar", r);
    return {
      data,
      id,
      message: "Reserva confirmada. Todo está preparado para el próximo paso.",
    };
  }
  if (a.type === "assign") {
    const r = get(a.id);
    if (["Finalizada", "Cancelada", "No-show"].includes(r.state))
      throw Error("Esta reserva ya está cerrada.");
    check(a.vehicleId, r.start, r.end, r.id);
    const old = r.vehicleId;
    if (r.state === "Activa") {
      if (!a.reason?.trim()) throw Error("Indica el motivo del cambio.");
      const rental = data.rentals.find((x) => x.reservationId === r.id)!;
      const replacement = data.vehicles.find((v) => v.id === a.vehicleId)!;
      const previous = data.vehicles.find((v) => v.id === old)!;
      if (
        !a.inspectionConfirmed ||
        a.outKm === undefined ||
        a.outFuel === undefined ||
        a.previousKm === undefined
      )
        throw Error(
          "Revisa y confirma kilometraje, combustible y estado del reemplazo.",
        );
      if (
        !Number.isFinite(a.outKm) ||
        a.outKm < replacement.km ||
        !Number.isFinite(a.previousKm) ||
        a.previousKm < rental.outKm ||
        !Number.isFinite(a.outFuel) ||
        a.outFuel < 0 ||
        a.outFuel > 100
      )
        throw Error("Revisa los registros de kilometraje y combustible.");
      const segment = rental.segments[rental.segments.length - 1];
      segment.end = new Date().toISOString();
      segment.inKm = a.previousKm;
      segment.outKm ??= rental.outKm;
      segment.outFuel ??= rental.outFuel;
      previous.km = a.previousKm;
      rental.segments.push({
        vehicleId: a.vehicleId,
        start: new Date().toISOString(),
        reason: a.reason,
        outKm: a.outKm,
        outFuel: a.outFuel,
      });
      rental.outKm = a.outKm;
      rental.outFuel = a.outFuel;
      replacement.km = a.outKm;
      replacement.fuel = a.outFuel;
      data.inspections.push({
        id: uid("INS-SWAP"),
        reservationId: r.id,
        vehicleId: a.vehicleId,
        type: "Salida",
        km: a.outKm,
        fuel: a.outFuel,
        date: new Date().toISOString(),
        employee: actor,
        photos: [
          {
            id: uid("PIC"),
            url: replacement.image,
            label:
              "Salida de reemplazo · evidencia representativa demo confirmada",
          },
        ],
        damageIds: [],
        signature: data.customers.find((c) => c.id === r.customerId)!.name,
        interior: true,
        exterior: true,
      });
      if (old)
        data.vehicles.find((v) => v.id === old)!.state =
          "Pendiente de inspección";
      data.vehicles.find((v) => v.id === a.vehicleId)!.state = "Alquilado";
    }
    r.vehicleId = a.vehicleId;
    log(
      old === a.vehicleId
        ? "Asignación confirmada"
        : `Vehículo asignado: ${a.vehicleId}${a.reason ? " · " + a.reason : ""}`,
      r,
    );
    return { data, message: "Vehículo asignado." };
  }
  if (a.type === "agreement") {
    const r = get(a.id);
    if (!r.vehicleId)
      throw Error("Asigna un vehículo antes de generar el contrato.");
    if (!a.signature.trim())
      throw Error("Escribe el nombre para la firma simulada.");
    const ex = data.agreements.find((x) => x.reservationId === r.id);
    if (ex) {
      ex.signed = true;
      ex.signature = a.signature;
    } else
      data.agreements.push({
        id: uid("CTR"),
        reservationId: r.id,
        date: new Date().toISOString(),
        signed: true,
        signature: a.signature,
      });
    log("Contrato demo generado y firmado", r);
    return { data, message: "Contrato demostrativo preparado." };
  }
  if (a.type === "payment") {
    const r = get(a.id);
    if (!Number.isFinite(a.amount) || a.amount <= 0)
      throw Error("Indica un importe mayor que cero.");
    if (
      ["Cargo adicional", "Reembolso"].includes(a.kind) &&
      role !== "Administrador"
    )
      throw Error("Esta acción requiere el rol administrador.");
    if (["Abono", "Pago"].includes(a.kind) && a.amount > balance(data, r))
      throw Error("El importe supera el saldo pendiente.");
    if (a.kind === "Reembolso" && a.amount > depositHeld(data, r.id))
      throw Error("El reembolso supera el depósito retenido.");
    if (a.kind === "Depósito" && depositHeld(data, r.id) + a.amount > r.deposit)
      throw Error(
        "El depósito ya está cubierto o el importe supera el requerido.",
      );
    if (a.kind === "Cargo adicional") r.total += a.amount;
    data.payments.push({
      id: uid("PAY"),
      reservationId: r.id,
      kind: a.kind,
      amount: a.amount,
      method: a.method,
      date: new Date().toISOString(),
      note: a.note,
    });
    if (r.state === "Pendiente de pago") r.state = "Confirmada";
    log(`${a.kind} demo registrado: ${money(a.amount)}`, r);
    return { data, message: "Movimiento demo registrado." };
  }
  if (a.type === "extend" || a.type === "requestExtension") {
    const r = get(a.id);
    if (r.state !== "Activa")
      throw Error("Solo puedes extender un alquiler activo.");
    if (new Date(a.end) <= new Date(r.end))
      throw Error("La nueva devolución debe ser posterior a la actual.");
    if (!r.vehicleId) throw Error("Asigna un vehículo primero.");
    check(r.vehicleId, r.start, a.end, r.id);
    if (a.type === "requestExtension") {
      r.extensionRequest = a.end;
      data.notifications.unshift({
        id: uid("NOT"),
        text: `${r.id}: el cliente solicitó una extensión.`,
        href: `/operaciones/reservas/${r.id}`,
        read: false,
      });
      log("Cliente solicitó una extensión", r);
      return { data, message: "Solicitud recibida por operaciones." };
    }
    const difference =
      quote(r.rate, r.start, a.end, r.extras) -
      quote(r.rate, r.start, r.end, r.extras);
    r.total += difference;
    r.end = a.end;
    delete r.extensionRequest;
    log(
      `Extensión registrada hasta ${dateLabel(a.end)} · ${money(difference)}`,
      r,
    );
    return { data, message: "Extensión registrada." };
  }
  if (a.type === "note" || a.type === "incident") {
    const r = get(a.id);
    if (!a.note.trim()) throw Error("Escribe una nota.");
    if (a.type === "note") r.notes += `\n${actor}: ${a.note}`;
    else {
      if (!r.vehicleId) throw Error("No hay vehículo asignado.");
      data.incidents.push({
        id: uid("INC"),
        reservationId: r.id,
        vehicleId: r.vehicleId,
        note: a.note,
        date: new Date().toISOString(),
        state: "En revisión",
      });
    }
    log(a.type === "note" ? "Nota agregada" : "Incidencia registrada", r);
    return {
      data,
      message: a.type === "note" ? "Nota guardada." : "Incidencia registrada.",
    };
  }
  if (a.type === "cancel") {
    const r = get(a.id);
    if (
      !["Confirmada", "Pendiente de pago", "Lista para entrega"].includes(
        r.state,
      )
    )
      throw Error("Solo se cancelan reservas que aún no se han entregado.");
    r.state = "Cancelada";
    log("Reserva cancelada · pagos preservados para revisión", r);
    return { data, message: "Reserva cancelada." };
  }
  if (a.type === "inspection") {
    const r = get(a.id);
    if (!r.vehicleId) throw Error("Asigna un vehículo primero.");
    const v = data.vehicles.find((v) => v.id === r.vehicleId)!;
    const i = a.inspection;
    if (
      !i.signature.trim() ||
      !i.interior ||
      !i.exterior ||
      i.photos.length < 1
    )
      throw Error("Completa inspección exterior, interior, evidencia y firma.");
    if (
      !Number.isFinite(new Date(i.date).getTime()) ||
      new Date(i.date) < new Date(r.start)
    )
      throw Error("La hora de inspección debe ser posterior a la recogida.");
    if (
      !Number.isFinite(i.km) ||
      !Number.isFinite(i.fuel) ||
      i.km < v.km ||
      i.fuel < 0 ||
      i.fuel > 100
    )
      throw Error("Revisa kilometraje y combustible.");
    if (i.type === "Salida") {
      if (!["Confirmada", "Lista para entrega"].includes(r.state))
        throw Error("La reserva no está lista para entregar.");
      check(v.id, r.start, r.end, r.id);
      if (!data.agreements.some((x) => x.reservationId === r.id && x.signed))
        throw Error("Prepara y firma el contrato demo antes de entregar.");
      if (
        !data.documents.some(
          (x) =>
            x.customerId === r.customerId &&
            x.type === "Licencia" &&
            x.verified,
        )
      )
        throw Error("Adjunta una licencia demo antes de entregar.");
      if (balance(data, r) > 0)
        throw Error("Hay saldo pendiente. Registra el pago antes de entregar.");
      if (depositHeld(data, r.id) < r.deposit)
        throw Error("Registra el depósito demo antes de entregar.");
      r.state = "Activa";
      v.state = "Alquilado";
      data.rentals.push({
        id: uid("ALQ"),
        reservationId: r.id,
        segments: [{ vehicleId: v.id, start: i.date }],
        outKm: i.km,
        outFuel: i.fuel,
      });
    } else {
      if (r.state !== "Activa")
        throw Error("La devolución necesita un alquiler activo.");
      const rental = data.rentals.find((x) => x.reservationId === r.id)!;
      if (i.km < rental.outKm)
        throw Error(
          "El kilometraje de entrada no puede ser menor al de salida.",
        );
      if (!Number.isFinite(a.charge) || a.charge < 0)
        throw Error("Revisa el cargo conceptual.");
      if (role === "Operaciones" && a.charge > 0)
        throw Error("Un administrador debe registrar los cargos adicionales.");
      if (a.charge > 0) {
        r.total += a.charge;
        data.payments.push({
          id: uid("PAY"),
          reservationId: r.id,
          kind: "Cargo adicional",
          amount: a.charge,
          method: "Ajuste demo",
          date: i.date,
          note: "Diferencia en devolución",
        });
      }
      if (balance(data, r) > 0)
        throw Error(
          "Hay saldo pendiente. Registra el pago o cargo antes de cerrar.",
        );
      r.state = "Finalizada";
      v.state = a.nextState;
      rental.returnedAt = i.date;
      rental.segments[rental.segments.length - 1].end = i.date;
      rental.segments[rental.segments.length - 1].inKm = i.km;
    }
    const id = uid("INS");
    const damageIds: string[] = [];
    a.damages.forEach((d) => {
      const did = uid("DMG");
      damageIds.push(did);
      data.damages.push({
        ...d,
        id: did,
        inspectionId: id,
        vehicleId: v.id,
        reservationId: r.id,
        date: i.date,
        employee: actor,
        state: "En revisión",
      });
    });
    data.inspections.push({
      ...i,
      id,
      reservationId: r.id,
      vehicleId: v.id,
      employee: actor,
      damageIds,
    });
    v.km = i.km;
    v.fuel = i.fuel;
    log(
      i.type === "Salida"
        ? "Inspección guardada · vehículo entregado"
        : "Inspección guardada · alquiler cerrado",
      r,
    );
    return {
      data,
      message:
        i.type === "Salida"
          ? "Vehículo entregado. Alquiler activo."
          : "Devolución completada. Historial actualizado.",
    };
  }
  if (a.type === "maintenance") {
    if (role !== "Administrador")
      throw Error("Solo un administrador programa mantenimiento.");
    check(a.vehicleId, a.start, a.end);
    if (!a.service.trim() || !a.provider.trim() || a.cost < 0)
      throw Error("Completa servicio, proveedor y costo.");
    const v = data.vehicles.find((v) => v.id === a.vehicleId)!;
    const current = overlap(a.start, a.end, NOW, NOW);
    data.maintenance.push({
      id: uid("MNT"),
      vehicleId: v.id,
      start: a.start,
      end: a.end,
      type: a.service,
      cost: a.cost,
      provider: a.provider,
      state: current ? "En curso" : "Programado",
      km: v.km,
    });
    if (current) v.state = "Mantenimiento";
    log(`Mantenimiento programado: ${a.service}`, undefined, v.id);
    return { data, message: "Mantenimiento programado. Fechas bloqueadas." };
  }
  if (a.type === "completeMaintenance") {
    if (role !== "Administrador")
      throw Error("Solo un administrador cierra mantenimiento.");
    const m = data.maintenance.find((x) => x.id === a.id);
    if (!m) throw Error("Servicio no encontrado.");
    m.state = "Completado";
    const v = data.vehicles.find((v) => v.id === m.vehicleId)!;
    v.lastService = TODAY;
    v.nextService = v.km + 5000;
    if (v.state === "Mantenimiento") v.state = "Disponible";
    log("Servicio completado", undefined, v.id);
    return { data, message: "Servicio completado." };
  }
  if (a.type === "vehicleState") {
    const v = data.vehicles.find((v) => v.id === a.id);
    if (!v) throw Error("Vehículo no encontrado.");
    if (
      data.reservations.some(
        (r) => r.vehicleId === v.id && r.state === "Activa",
      )
    )
      throw Error(
        "El vehículo tiene un alquiler activo. Usa devolución o cambio de vehículo.",
      );
    if (
      a.state === "Disponible" &&
      data.maintenance.some(
        (m) =>
          m.vehicleId === v.id &&
          m.state !== "Completado" &&
          overlap(m.start, m.end, NOW, NOW),
      )
    )
      throw Error("Completa el mantenimiento primero.");
    v.state = a.state;
    log(`Estado: ${a.state}`, undefined, v.id);
    return { data, message: "Vehículo actualizado." };
  }
  if (a.type === "document") {
    if (!a.data || !a.name) throw Error("Selecciona un archivo demo válido.");
    data.documents.push({
      id: uid("DOC"),
      customerId: a.customerId,
      reservationId: a.reservationId,
      type: a.docType,
      name: a.name,
      verified: true,
      data: a.data,
    });
    log(`Documento demo cargado: ${a.docType}`, get(a.reservationId));
    return { data, message: "Documento demo guardado." };
  }
  if (a.type === "damageState") {
    const d = data.damages.find((d) => d.id === a.id);
    if (!d) throw Error("Daño no encontrado.");
    d.state = a.state;
    log(`Daño actualizado: ${a.state}`, get(d.reservationId), d.vehicleId);
    return { data, message: "Registro de daño actualizado." };
  }
  if (a.type === "settings") {
    if (role !== "Administrador")
      throw Error("Esta acción requiere administrador.");
    if (
      !Number.isFinite(a.usdRate) ||
      !Number.isFinite(a.bufferHours) ||
      a.usdRate <= 0 ||
      a.bufferHours < 0 ||
      a.bufferHours > 24
    )
      throw Error("Revisa tasa y margen de preparación.");
    data.settings.usdRate = a.usdRate;
    data.settings.bufferHours = a.bufferHours;
    log("Configuración demo actualizada");
    return { data, message: "Configuración guardada." };
  }
  if (a.type === "readNotification") {
    const n = data.notifications.find((n) => n.id === a.id);
    if (n) n.read = true;
    return { data, message: "Notificación leída." };
  }
  throw Error("Acción no reconocida.");
}

export function notificationsFor(data: Data): Notification[] {
  const list: Notification[] = [];
  const add = (id: string, text: string, href: string) =>
    list.push({
      id,
      text,
      href,
      read: data.notifications.find((n) => n.id === id)?.read || false,
    });
  for (const r of data.reservations) {
    if (["Finalizada", "Cancelada", "No-show"].includes(r.state)) continue;
    const href = "/operaciones/reservas/" + r.id;
    if (!r.vehicleId)
      add(
        "unassigned-" + r.id,
        r.id + ": reserva aún sin vehículo asignado.",
        href,
      );
    if (r.state === "Activa" && new Date(r.end) < new Date(NOW))
      add(
        "late-" + r.id,
        r.id + ": devolución pendiente desde " + dateLabel(r.end, true) + ".",
        href,
      );
    if (r.extensionRequest)
      add(
        "extension-" + r.id,
        r.id +
          ": el cliente solicitó extensión hasta " +
          dateLabel(r.extensionRequest) +
          ".",
        href,
      );
    if (balance(data, r) > 0 && r.start.startsWith(TODAY))
      add(
        "balance-" + r.id,
        r.id +
          ": saldo pendiente antes de entrega · " +
          money(balance(data, r)) +
          ".",
        href,
      );
    if (
      r.state === "Activa" &&
      r.vehicleId &&
      r.notes.includes("Solicita dos días")
    ) {
      const extension = new Date(
        new Date(r.end).getTime() + 2 * 86400000,
      ).toISOString();
      if (availability(data, r.vehicleId, r.start, extension, r.id))
        add(
          "conflict-" + r.id,
          "RAV4: dos días adicionales cruzan el siguiente compromiso.",
          href,
        );
    }
  }
  for (const v of data.vehicles)
    if (v.nextService - v.km <= 500)
      add(
        "service-" + v.id,
        v.brand +
          " " +
          v.model +
          ": próximo servicio en " +
          Math.max(0, v.nextService - v.km) +
          " km.",
        "/operaciones/flota/" + v.id,
      );
  return list;
}
export function transact(
  original: Data,
  action: Action,
  role: Role = "Administrador",
): { data: Data; id?: string; message: string } {
  const result = applyAction(original, action, role);
  result.data.notifications = notificationsFor(result.data);
  return result;
}
