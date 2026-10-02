import {
  Data,
  TODAY,
  Vehicle,
  Reservation,
  Customer,
  quote,
  notificationsFor,
} from "./domain";
const models = [
  ["Kia", "Picanto", "Económico", 2100, 4, 1, "compact"],
  ["Hyundai", "Grand i10", "Económico", 2300, 5, 2, "compact"],
  ["Hyundai", "Accent", "Sedán", 2800, 5, 3, "sedan"],
  ["Toyota", "Corolla", "Sedán", 3200, 5, 3, "sedan"],
  ["Kia", "K5", "Sedán", 3800, 5, 3, "sedan"],
  ["Toyota", "RAV4", "SUV", 4900, 5, 4, "suv"],
  ["Hyundai", "Tucson", "SUV", 4600, 5, 4, "suv"],
  ["Kia", "Sportage", "SUV", 4700, 5, 4, "suv"],
  ["Honda", "CR-V", "SUV", 5100, 5, 4, "suv"],
  ["Toyota", "Hilux", "Pickup", 5800, 5, 5, "pickup"],
  ["Chevrolet", "Tahoe", "Premium", 8900, 7, 5, "premium"],
] as const;
const names = [
  "Gabriela Rosario",
  "Luis Miguel Batista",
  "Camila Fernández",
  "Andrés Polanco",
  "Diana Marte",
  "Rafael Santana",
  "Laura Jiménez",
  "Miguel Tejada",
  "Isabel Núñez",
  "José Manuel Peña",
  "Valentina Reyes",
  "Daniel Cabrera",
  "Ana Lucía Gómez",
  "Marcos Peralta",
  "Sofía Almonte",
  "Emilio Vargas",
  "Patricia Méndez",
  "Ricardo Santos",
  "Elena Rodríguez",
  "Francisco de la Cruz",
  "Natalia Díaz",
  "Samuel Torres",
];
export function seed(): Data {
  const vehicles: Vehicle[] = Array.from({ length: 28 }, (_, i) => {
    const m = models[i % 11];
    return {
      id: `AV-${String(i + 1).padStart(3, "0")}`,
      brand: m[0],
      model: m[1],
      category: m[2],
      rate: m[3],
      seats: m[4],
      bags: m[5],
      image: `/images/${m[6]}.webp`,
      year: 2023 + (i % 3),
      color: ["Blanco perla", "Gris grafito", "Plata", "Azul profundo"][i % 4],
      plate: `DEMO-${String(701 + i)}`,
      vin: `DEMO-AVENZA-${String(i + 1).padStart(6, "0")}`,
      transmission: i === 20 ? "Manual" : "Automática",
      fuelType: m[6] === "pickup" ? "Diésel" : "Gasolina",
      km: 18000 + i * 1730,
      fuel: 100 - (i % 3) * 25,
      branch: i % 3 === 0 ? "Aeropuerto del Cibao" : "Santiago Centro",
      state: "Disponible",
      lastService: "2026-09-" + String(5 + (i % 20)).padStart(2, "0"),
      nextService: 23000 + i * 1730,
    };
  });
  const customers: Customer[] = names.map((name, i) => ({
    id: `CLI-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `persona${i + 1}@avenza.example`,
    phone: `(809) 000-${String(1000 + i)}`,
    identification: `DEMO-ID-${1001 + i}`,
    license: `DEMO-LIC-${2001 + i}`,
    notes:
      i % 5 === 0
        ? "Cliente recurrente. Prefiere recogida en el aeropuerto."
        : "Perfil ficticio para demostración.",
  }));
  const reservations: Reservation[] = [];
  const add = (
    i: number,
    v: number | null,
    start: string,
    end: string,
    state: Reservation["state"],
    notes: string,
  ) => {
    const vehicle = vehicles[v ?? 5];
    const r: Reservation = {
      id: `AVZ-${start.slice(2, 10).replaceAll("-", "")}-${String(i + 1).padStart(3, "0")}`,
      customerId: customers[i % 22].id,
      vehicleId: v === null ? null : vehicle.id,
      category: vehicle.category,
      start: start + "T" + (i % 2 ? "09:30" : "08:00") + ":00-04:00",
      end: end + "T" + (i % 2 ? "16:30" : "08:00") + ":00-04:00",
      pickup: vehicle.branch,
      dropoff: vehicle.branch,
      state,
      rate: vehicle.rate,
      extras: i % 4 === 0 ? ["wifi"] : [],
      total: 0,
      deposit: 12000,
      notes,
      additionalDriver: i === 0 ? "Luis Miguel Batista" : "",
    };
    r.total = quote(r.rate, r.start, r.end, r.extras);
    reservations.push(r);
    return r;
  };
  // Historical rentals are separated from the active/future planning window.
  for (let i = 0; i < 22; i++)
    add(
      i,
      i % 28,
      `2026-09-${String(2 + (i % 15)).padStart(2, "0")}`,
      `2026-09-${String(5 + (i % 15)).padStart(2, "0")}`,
      i === 18 ? "Cancelada" : i === 19 ? "No-show" : "Finalizada",
      "Historial demo · viaje familiar o visita de trabajo.",
    );
  add(
    22,
    4,
    "2026-09-28",
    TODAY,
    "Activa",
    "Devolución de hoy. Inspección con nueva abolladura para revisar.",
  );
  add(
    23,
    5,
    "2026-09-29",
    "2026-10-04",
    "Activa",
    "Solicita dos días adicionales; otra reserva impide la extensión.",
  );
  add(
    24,
    0,
    "2026-09-30",
    TODAY,
    "Activa",
    "Retorno tardío reportado. Siguiente entrega a las 18:00.",
  );
  add(
    25,
    8,
    "2026-09-30",
    "2026-10-06",
    "Activa",
    "Vibración en rueda. Explorar cambio de vehículo.",
  );
  add(
    26,
    6,
    TODAY,
    "2026-10-05",
    "Confirmada",
    "Entrega de hoy. Documentos y pagos listos.",
  );
  reservations[26].start = TODAY + "T13:00:00-04:00";
  reservations[26].total = quote(
    reservations[26].rate,
    reservations[26].start,
    reservations[26].end,
    reservations[26].extras,
  );
  add(
    27,
    null,
    TODAY,
    "2026-10-05",
    "Pendiente de pago",
    "Entrega aeropuerto. Aún falta asignar SUV y completar saldo.",
  );
  reservations[27].start = TODAY + "T15:00:00-04:00";
  add(
    28,
    5,
    "2026-10-05",
    "2026-10-08",
    "Confirmada",
    "Conflicto futuro para extensión de RAV4.",
  );
  add(
    29,
    0,
    TODAY,
    "2026-10-04",
    "Confirmada",
    "Entrega siguiente afectada por retorno tardío.",
  );
  reservations[29].start = TODAY + "T18:00:00-04:00";
  add(
    30,
    10,
    "2026-10-07",
    "2026-10-11",
    "Confirmada",
    "Familia de visita. Aeropuerto del Cibao.",
  );
  add(31, 3, "2026-10-04", "2026-10-07", "Confirmada", "Cliente recurrente.");
  add(
    32,
    13,
    "2026-10-06",
    "2026-10-09",
    "Pendiente de pago",
    "Abono por confirmar.",
  );
  add(
    33,
    16,
    "2026-10-08",
    "2026-10-12",
    "Confirmada",
    "Recogida en Santiago Centro.",
  );
  add(34, 20, "2026-10-09", "2026-10-13", "Confirmada", "Viaje de trabajo.");
  add(
    35,
    21,
    "2026-10-03",
    "2026-10-06",
    "Confirmada",
    "SUV premium con conductor adicional.",
  );
  const data: Data = {
    version: 1,
    vehicles,
    customers,
    reservations,
    rentals: [],
    payments: [],
    inspections: [],
    damages: [],
    maintenance: [],
    documents: [],
    agreements: [],
    activity: [],
    incidents: [],
    employees: [
      {
        id: "EMP-001",
        name: "María Gómez",
        role: "Administrador",
        branch: "Santiago Centro",
      },
      {
        id: "EMP-002",
        name: "Carlos Peña",
        role: "Operaciones",
        branch: "Aeropuerto del Cibao",
      },
      {
        id: "EMP-003",
        name: "Lucía Rosario",
        role: "Operaciones",
        branch: "Santiago Centro",
      },
    ],
    notifications: [
      {
        id: "NOT-1",
        text: "RAV4: extensión de dos días incompatible con la siguiente reserva.",
        href: "/operaciones/reservas/" + reservations[23].id,
        read: false,
      },
      {
        id: "NOT-2",
        text: "SUV para entrega de hoy aún sin asignación.",
        href: "/operaciones/reservas/" + reservations[27].id,
        read: false,
      },
      {
        id: "NOT-3",
        text: "Picanto: retorno tardío puede afectar la entrega de las 18:00.",
        href: "/operaciones/reservas/" + reservations[24].id,
        read: false,
      },
    ],
    settings: { usdRate: 60, bufferHours: 3, company: "AVENZA Rent a Car" },
  };
  customers.forEach((c) => {
    ["Licencia", "Identificación"].forEach((type) =>
      data.documents.push({
        id: `DOC-${c.id}-${type}`,
        customerId: c.id,
        type,
        name: `${type} ${c.identification} · ficticio`,
        verified: true,
      }),
    );
  });
  reservations.forEach((r, i) => {
    if (!["Cancelada", "No-show"].includes(r.state))
      data.payments.push({
        id: `PAY-${i}`,
        reservationId: r.id,
        kind: r.state === "Pendiente de pago" ? "Abono" : "Pago",
        amount:
          r.state === "Pendiente de pago" ? Math.round(r.total * 0.3) : r.total,
        method: ["Transferencia", "Tarjeta demo", "Efectivo"][i % 3],
        date: r.start,
        note: "Movimiento ficticio de demostración",
      });
    if (r.state === "Activa" || r.state === "Finalizada" || i === 26) {
      data.payments.push({
        id: `DEP-${i}`,
        reservationId: r.id,
        kind: "Depósito",
        amount: r.deposit,
        method: "Tarjeta demo",
        date: r.start,
        note: "Garantía conceptual separada del alquiler",
      });
      data.agreements.push({
        id: `CTR-${i}`,
        reservationId: r.id,
        date: r.start,
        signed: true,
        signature: customers[i % 22].name,
      });
    }
    if (r.state === "Activa" || r.state === "Finalizada") {
      const v = vehicles.find((v) => v.id === r.vehicleId)!;
      const outKm = v.km - (r.state === "Finalizada" ? 500 : 0);
      data.rentals.push({
        id: `ALQ-${i}`,
        reservationId: r.id,
        segments: [
          {
            vehicleId: v.id,
            start: r.start,
            ...(r.state === "Finalizada" ? { end: r.end } : {}),
          },
        ],
        outKm,
        outFuel: 100,
        ...(r.state === "Finalizada" ? { returnedAt: r.end } : {}),
      });
      data.inspections.push({
        id: `INS-OUT-${i}`,
        reservationId: r.id,
        vehicleId: v.id,
        type: "Salida",
        km: outKm,
        fuel: 100,
        date: r.start,
        employee: "Carlos Peña",
        photos: [
          {
            id: `PIC-${i}`,
            url: v.image,
            label: "Exterior · evidencia demo de salida",
          },
        ],
        damageIds: [],
        signature: customers[i % 22].name,
        interior: true,
        exterior: true,
      });
      if (r.state === "Finalizada") {
        data.inspections.push({
          id: `INS-IN-${i}`,
          reservationId: r.id,
          vehicleId: v.id,
          type: "Entrada",
          km: outKm + 500,
          fuel: 100,
          date: r.end,
          employee: "Lucía Rosario",
          photos: [
            {
              id: `PIC-IN-${i}`,
              url: v.image,
              label: "Exterior · evidencia demo de entrada",
            },
          ],
          damageIds: [],
          signature: customers[i % 22].name,
          interior: true,
          exterior: true,
        });
        data.payments.push({
          id: `REF-${i}`,
          reservationId: r.id,
          kind: "Reembolso",
          amount: r.deposit,
          method: "Tarjeta demo",
          date: r.end,
          note: "Depósito devuelto · demo",
        });
      } else v.state = "Alquilado";
    }
    data.activity.push({
      id: `ACT-${i}`,
      reservationId: r.id,
      vehicleId: r.vehicleId || undefined,
      actor: "María Gómez",
      text: "Reserva creada · " + r.notes,
      date: r.start,
    });
  });
  const damaged = reservations[22];
  data.damages.push({
    id: "DMG-SEED",
    vehicleId: damaged.vehicleId!,
    reservationId: damaged.id,
    inspectionId: "INS-OUT-22",
    zone: "Lateral izquierdo",
    kind: "Rayón",
    severity: "Leve",
    note: "Marca preexistente en puerta delantera. Evidencia conceptual.",
    date: damaged.start,
    employee: "Carlos Peña",
    state: "En revisión",
    photo: "/images/damage-before.webp",
  });
  data.inspections.find((i) => i.id === "INS-OUT-22")!.damageIds = ["DMG-SEED"];
  data.inspections.find((i) => i.id === "INS-OUT-22")!.photos = [
    {
      id: "BEFORE",
      url: "/images/damage-before.webp",
      label: "Puerta izquierda · marca preexistente demo",
    },
  ];
  data.maintenance = [
    {
      id: "MNT-1",
      vehicleId: vehicles[7].id,
      start: "2026-10-01T08:00:00-04:00",
      end: "2026-10-04T18:00:00-04:00",
      type: "Frenos y revisión preventiva",
      cost: 8500,
      provider: "Taller Norte · ficticio",
      state: "En curso",
      km: vehicles[7].km,
    },
    {
      id: "MNT-2",
      vehicleId: vehicles[9].id,
      start: "2026-10-06T08:00:00-04:00",
      end: "2026-10-07T18:00:00-04:00",
      type: "Cambio de aceite",
      cost: 4200,
      provider: "Servicio Cibao · ficticio",
      state: "Programado",
      km: vehicles[9].km,
    },
    {
      id: "MNT-3",
      vehicleId: vehicles[2].id,
      start: "2026-09-15T08:00:00-04:00",
      end: "2026-09-16T18:00:00-04:00",
      type: "Servicio de 20,000 km",
      cost: 5100,
      provider: "Servicio Cibao · ficticio",
      state: "Completado",
      km: 20000,
    },
  ];
  vehicles[7].state = "Mantenimiento";
  vehicles[11].state = "Limpieza";
  vehicles[12].state = "Fuera de servicio";
  vehicles[14].state = "Pendiente de inspección";
  vehicles[6].state = "Preparación";
  vehicles[10].state = "Reservado";
  vehicles[15].nextService = vehicles[15].km + 320;
  data.notifications = notificationsFor(data);
  return data;
}
