import { test } from "node:test";
import assert from "node:assert/strict";
import { seed } from "../src/seed";
import {
  transact,
  availability,
  balance,
  depositHeld,
  quote,
  Data,
} from "../src/domain";
test("Dataset has complete, coherent relationships and no live double-booking", () => {
  const d = seed();
  assert.equal(d.vehicles.length, 28);
  assert.equal(d.customers.length, 22);
  assert.equal(d.reservations.length, 36);
  for (const r of d.reservations) {
    assert.ok(d.customers.some((c) => c.id === r.customerId));
    if (r.vehicleId) assert.ok(d.vehicles.some((v) => v.id === r.vehicleId));
    if (
      !["Finalizada", "Cancelada", "No-show"].includes(r.state) &&
      r.vehicleId
    )
      assert.equal(availability(d, r.vehicleId, r.start, r.end, r.id), null);
  }
  for (const p of d.payments)
    assert.ok(d.reservations.some((r) => r.id === p.reservationId));
  for (const i of d.inspections) {
    assert.ok(d.reservations.some((r) => r.id === i.reservationId));
    assert.ok(d.vehicles.some((v) => v.id === i.vehicleId));
    for (const did of i.damageIds)
      assert.ok(d.damages.some((d) => d.id === did));
  }
  for (const r of d.reservations.filter((r) => r.state === "Activa"))
    assert.equal(
      d.vehicles.find((v) => v.id === r.vehicleId)?.state,
      "Alquilado",
    );
});
test("Conflicting extension leaves data and money unchanged", () => {
  const d = seed();
  const r = d.reservations.find((r) => r.notes.includes("Solicita dos días"))!;
  const before = structuredClone(d);
  assert.throws(
    () =>
      transact(d, {
        type: "extend",
        id: r.id,
        end: "2026-10-06T16:30:00-04:00",
      }),
    /Conflicto/,
  );
  assert.deepEqual(d, before);
});
test("Maintenance blocks dates and releases when completed", () => {
  let d = seed();
  assert.match(
    availability(
      d,
      "AV-008",
      "2026-10-02T12:00:00-04:00",
      "2026-10-03T12:00:00-04:00",
    )!,
    /Mantenimiento/,
  );
  d = transact(d, { type: "completeMaintenance", id: "MNT-1" }).data;
  assert.equal(
    availability(
      d,
      "AV-008",
      "2026-10-02T12:00:00-04:00",
      "2026-10-03T12:00:00-04:00",
    ),
    null,
  );
});
test("Complete booking, documents, agreement, payment, inspection, extension, damage, return, deposit and history lifecycle", () => {
  let d = seed();
  const start = "2026-10-02T12:00:00-04:00",
    end = "2026-10-05T12:00:00-04:00";
  const created = transact(d, {
    type: "book",
    vehicleId: "AV-002",
    start,
    end,
    pickup: "Santiago Centro",
    dropoff: "Santiago Centro",
    extras: ["wifi"],
    additionalDriver: "",
    advance: 2000,
    customer: {
      name: "Lucía Camino Demo",
      email: "lucia@avenza.example",
      phone: "(809) 000-0000",
      identification: "DEMO-ID",
      license: "DEMO-LIC",
      notes: "Ficticio",
    },
  });
  d = created.data;
  const id = created.id!;
  const get = () => d.reservations.find((r) => r.id === id)!;
  const v = () => d.vehicles.find((v) => v.id === "AV-002")!;
  assert.equal(balance(d, get()), quote(2300, start, end, ["wifi"]) - 2000);
  assert.match(availability(d, v().id, start, end)!, /Conflicto/);
  const out = {
    type: "Salida" as const,
    km: v().km,
    fuel: 100,
    date: start,
    photos: [
      { id: "photo-out", url: "/images/compact.webp", label: "Salida demo" },
    ],
    signature: "Lucía Camino Demo",
    interior: true,
    exterior: true,
  };
  assert.throws(
    () =>
      transact(d, {
        type: "inspection",
        id,
        inspection: out,
        damages: [],
        charge: 0,
        nextState: "Disponible",
      }),
    /contrato/,
  );
  d = transact(d, {
    type: "agreement",
    id,
    signature: "Lucía Camino Demo",
  }).data;
  assert.throws(
    () =>
      transact(d, {
        type: "inspection",
        id,
        inspection: out,
        damages: [],
        charge: 0,
        nextState: "Disponible",
      }),
    /licencia/,
  );
  d = transact(d, {
    type: "document",
    customerId: get().customerId,
    reservationId: id,
    docType: "Licencia",
    name: "licencia-ficticia.png",
    data: "data:image/png;base64,AAAA",
  }).data;
  assert.throws(
    () =>
      transact(d, {
        type: "inspection",
        id,
        inspection: out,
        damages: [],
        charge: 0,
        nextState: "Disponible",
      }),
    /saldo/,
  );
  d = transact(d, {
    type: "payment",
    id,
    kind: "Pago",
    amount: balance(d, get()),
    method: "Efectivo",
    note: "demo",
  }).data;
  d = transact(d, {
    type: "payment",
    id,
    kind: "Depósito",
    amount: 12000,
    method: "Tarjeta demo",
    note: "demo",
  }).data;
  assert.equal(depositHeld(d, id), 12000);
  assert.equal(balance(d, get()), 0);
  d = transact(d, {
    type: "inspection",
    id,
    inspection: out,
    damages: [],
    charge: 0,
    nextState: "Disponible",
  }).data;
  assert.equal(get().state, "Activa");
  assert.equal(v().state, "Alquilado");
  d = transact(d, {
    type: "extend",
    id,
    end: "2026-10-06T12:00:00-04:00",
  }).data;
  assert.equal(balance(d, get()), 2550);
  d = transact(d, {
    type: "payment",
    id,
    kind: "Pago",
    amount: balance(d, get()),
    method: "Transferencia demo",
    note: "Extensión",
  }).data;
  d = transact(d, {
    type: "payment",
    id,
    kind: "Cargo adicional",
    amount: 1500,
    method: "Ajuste demo",
    note: "Diferencia revisada",
  }).data;
  const entry = {
    ...out,
    type: "Entrada" as const,
    km: out.km + 320,
    fuel: 75,
    date: "2026-10-06T13:00:00-04:00",
    photos: [
      {
        id: "photo-in",
        url: "/images/damage-after.webp",
        label: "Entrada demo",
      },
    ],
  };
  assert.throws(
    () =>
      transact(d, {
        type: "inspection",
        id,
        inspection: entry,
        damages: [],
        charge: 0,
        nextState: "Limpieza",
      }),
    /saldo/,
  );
  d = transact(d, {
    type: "payment",
    id,
    kind: "Pago",
    amount: 1500,
    method: "Efectivo",
    note: "Diferencia",
  }).data;
  d = transact(d, {
    type: "inspection",
    id,
    inspection: entry,
    damages: [
      {
        zone: "Lateral izquierdo",
        kind: "Abolladura",
        severity: "Moderado",
        note: "Observación manual demo",
      },
    ],
    charge: 0,
    nextState: "Limpieza",
  }).data;
  assert.equal(get().state, "Finalizada");
  assert.equal(v().state, "Limpieza");
  assert.equal(v().km, out.km + 320);
  assert.equal(d.inspections.filter((i) => i.reservationId === id).length, 2);
  assert.equal(
    d.damages.find((x) => x.reservationId === id)?.state,
    "En revisión",
  );
  assert.ok(
    d.activity.some(
      (x) => x.reservationId === id && x.text.includes("alquiler cerrado"),
    ),
  );
  d = transact(d, {
    type: "payment",
    id,
    kind: "Reembolso",
    amount: 12000,
    method: "Tarjeta demo",
    note: "Devuelto",
  }).data;
  assert.equal(depositHeld(d, id), 0);
  const persisted: Data = JSON.parse(JSON.stringify(d));
  assert.deepEqual(
    persisted.reservations.find((r) => r.id === id),
    get(),
  );
  assert.equal(
    persisted.inspections.filter((i) => i.reservationId === id).length,
    2,
  );
  assert.equal(depositHeld(persisted, id), 0);
});
test("Deposit is never counted as paid rent; employee cannot change sensitive finance or settings", () => {
  const d = seed();
  const r = d.reservations.find((r) => r.state === "Activa")!;
  const before = balance(d, r);
  assert.equal(depositHeld(d, r.id), 12000);
  assert.equal(balance(d, r), before);
  assert.throws(
    () =>
      transact(
        d,
        {
          type: "payment",
          id: r.id,
          kind: "Reembolso",
          amount: 12000,
          method: "demo",
          note: "",
        },
        "Operaciones",
      ),
    /administrador/,
  );
  assert.throws(
    () =>
      transact(
        d,
        { type: "settings", usdRate: 65, bufferHours: 2 },
        "Operaciones",
      ),
    /administrador/,
  );
});
test("Assignment and maintenance reject overlaps; canceled reservation releases dates", () => {
  let d = seed();
  const unassigned = d.reservations.find((r) => !r.vehicleId)!;
  assert.throws(
    () =>
      transact(d, { type: "assign", id: unassigned.id, vehicleId: "AV-007" }),
    /Conflicto/,
  );
  assert.throws(
    () =>
      transact(d, {
        type: "maintenance",
        vehicleId: "AV-007",
        start: unassigned.start,
        end: unassigned.end,
        service: "Frenos",
        cost: 2000,
        provider: "Taller demo",
      }),
    /Conflicto/,
  );
  const future = d.reservations.find((r) =>
    r.notes.includes("Conflicto futuro"),
  )!;
  d = transact(d, { type: "cancel", id: future.id }).data;
  assert.equal(
    availability(d, future.vehicleId!, future.start, future.end),
    null,
  );
});
test("Preparation buffer prevents adjacent reservations", () => {
  const d = seed();
  const r = d.reservations.find((r) => r.notes.includes("Conflicto futuro"))!;
  assert.match(
    availability(
      d,
      r.vehicleId!,
      "2026-10-04T20:00:00-04:00",
      "2026-10-05T08:00:00-04:00",
    )!,
    /preparar/,
  );
});
test("Vehicle swap preserves rental and prior segments", () => {
  const d = seed();
  const r = d.reservations.find((r) => r.notes.includes("Vibración"))!;
  const result = transact(d, {
    type: "assign",
    id: r.id,
    vehicleId: "AV-019",
    reason: "Vibración · revisión manual demo",
    outKm: 49140,
    outFuel: 100,
    previousKm: 32500,
    inspectionConfirmed: true,
  }).data;
  const rental = result.rentals.find((x) => x.reservationId === r.id)!;
  assert.equal(rental.segments.length, 2);
  assert.ok(rental.segments[0].end);
  assert.equal(rental.segments[1].vehicleId, "AV-019");
  assert.equal(
    result.vehicles.find((v) => v.id === r.vehicleId)?.state,
    "Pendiente de inspección",
  );
  assert.equal(
    result.vehicles.find((v) => v.id === "AV-019")?.state,
    "Alquilado",
  );
});
