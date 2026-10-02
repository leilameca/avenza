"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Users,
  CreditCard,
  Wrench,
  ClipboardCheck,
  ChartNoAxesCombined,
  Settings,
  LayoutDashboard,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Check,
  Download,
  MapPin,
  Clock,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "./store";
import {
  Vehicle,
  Reservation,
  availability,
  balance,
  paid,
  money,
  TODAY,
  NOW,
  dateLabel,
  VehicleState,
  branches,
  depositHeld,
} from "./domain";
import {
  Brand,
  Badge,
  Field,
  PageTitle,
  Empty,
  Modal,
  Timeline,
  GlobalSearch,
  useCommand,
  useIsMobile,
} from "./ui";
import { ReservationDetail, PaymentForm, DocumentPreview } from "./reservation";
import { InspectionWizard, InspectionComparison } from "./inspection";
const nav = [
  ["", "Operación de hoy", LayoutDashboard],
  ["planner", "Planner de flota", CalendarDays],
  ["reservas", "Reservas", BookOpen],
  ["flota", "Vehículos", CarFront],
  ["clientes", "Clientes", Users],
  ["inspecciones", "Inspecciones", ClipboardCheck],
  ["pagos", "Pagos demo", CreditCard],
  ["mantenimiento", "Mantenimiento", Wrench],
  ["reportes", "Reportes", ChartNoAxesCombined],
  ["equipo", "Equipo", Users],
  ["configuracion", "Configuración", Settings],
] as const;
function Access({ path }: { path: string }) {
  const { setRole } = useStore();
  const router = useRouter();
  return (
    <div className="access-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={16} /> Volver a la web
      </Link>
      <Brand />
      <div className="access-content">
        <div className="eyebrow">DEMO OPERATIVA · SIN CUENTA</div>
        <h1>
          Detrás de cada viaje,
          <br />
          <em>hay un equipo.</em>
        </h1>
        <p>
          Explora una operación conectada, desde la primera reserva hasta el
          último kilómetro.
        </p>
        <div className="role-options">
          <button
            onClick={() => {
              setRole("Administrador");
              router.push(path);
            }}
          >
            <ShieldCheck size={27} />
            <span>
              <strong>Entrar como administrador</strong>
              <small>Operación, flota, pagos y configuración.</small>
            </span>
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => {
              setRole("Operaciones");
              router.push(path);
            }}
          >
            <ClipboardCheck size={27} />
            <span>
              <strong>Entrar como empleado</strong>
              <small>Entregas, devoluciones e inspecciones.</small>
            </span>
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="access-note">
          <span className="small-dot" /> Fecha de la demo: viernes, 2 de octubre
          de 2026.
          <br />
          Todos los datos y movimientos son ficticios.
        </div>
      </div>
      <div className="access-footer">
        Concept Project by <strong>MORAN STUDIO</strong>
      </div>
    </div>
  );
}
function DemoGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useStore();
  const sample = (phrase: string) =>
    data.reservations.find((r) => r.notes.includes(phrase))?.id;
  const scenes = [
    [
      "01",
      "Una entrega preparada",
      "Contrato, pagos e inspección conectados.",
      "/operaciones/reservas/" + sample("Documentos y pagos listos"),
    ],
    [
      "02",
      "La evidencia cuenta la historia",
      "Compara salida y entrada en un mismo contexto.",
      "/operaciones/comparacion/" + sample("nueva abolladura"),
    ],
    [
      "03",
      "Dos días más, con un cruce",
      "La próxima reserva impide extender el RAV4.",
      "/operaciones/reservas/" + sample("Solicita dos días"),
    ],
    [
      "04",
      "Una devolución tardía",
      "Entiende cómo afecta a la próxima entrega.",
      "/operaciones/reservas/" + sample("Retorno tardío"),
    ],
    [
      "05",
      "Un reemplazo durante el alquiler",
      "Conserva los segmentos y el mismo cliente.",
      "/operaciones/reservas/" + sample("Vibración"),
    ],
    [
      "06",
      "Mantenimiento que bloquea fechas",
      "El Sportage sale de la disponibilidad.",
      "/operaciones/flota/AV-008",
    ],
    [
      "07",
      "Una reserva desde cero",
      "Crea una y síguela hasta su cierre.",
      "/reservar",
    ],
    [
      "08",
      "Un saldo antes de salir",
      "Asignación y cobro antes de la entrega.",
      "/operaciones/reservas/" + sample("Aún falta asignar"),
    ],
  ];
  return (
    <Modal
      title="Explora una historia de la operación"
      open={open}
      onClose={onClose}
      wide
    >
      <p className="muted">
        Elige un escenario. Cada uno abre sus registros reales dentro de la
        demo.
      </p>
      <div className="guide-scenes">
        {scenes.map(([n, t, d, url]) => (
          <Link key={n} href={url} onClick={onClose}>
            <span>{n}</span>
            <div>
              <strong>{t}</strong>
              <small>{d}</small>
            </div>
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </div>
    </Modal>
  );
}
export function Operations({ path }: { path: string }) {
  const { role, setRole, data, act } = useStore();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [guide, setGuide] = useState(false);
  useCommand(() => setSearch(true));
  const mobile = useIsMobile();
  if (!role) return <Access path={path} />;
  const parts = path.split("/").filter(Boolean).slice(1);
  const page = parts[0] || "";
  const isAdmin = role === "Administrador";
  const restricted =
    ["pagos", "reportes", "equipo", "configuracion"].includes(page) && !isAdmin;
  const title = nav.find((n) => n[0] === page)?.[1] || "Operación";
  return (
    <div className="operations-shell">
      <aside
        inert={mobile && !menu}
        aria-hidden={mobile && !menu ? true : undefined}
        className={"sidebar " + (menu ? "open" : "")}
      >
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-menu"
            aria-label="Cerrar menú"
            onClick={() => setMenu(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="small-dot" /> ESPACIO OPERATIVO <small>DEMO</small>
        </div>
        <nav aria-label="Navegación operativa">
          {nav
            .filter(
              (n) =>
                isAdmin ||
                !["pagos", "reportes", "equipo", "configuracion"].includes(
                  n[0],
                ),
            )
            .map(([slug, label, Icon]) => (
              <Link
                key={slug}
                className={page === slug ? "active" : ""}
                href={"/operaciones" + (slug ? "/" + slug : "")}
                onClick={() => setMenu(false)}
              >
                <Icon size={18} />
                {label}
                {slug === "" && (
                  <small>
                    {
                      data.reservations.filter((r) => r.state === "Activa")
                        .length
                    }
                  </small>
                )}
              </Link>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setGuide(true)}>
            <span className="guide-symbol">↗</span>
            <span>
              Explorar escenarios<small>Conoce la demo en acción</small>
            </span>
          </button>
          <Link href="/">
            Ver experiencia pública <ArrowUpRight size={15} />
          </Link>
          <div className="operator">
            <span className="avatar">{isAdmin ? "MG" : "CP"}</span>
            <div>
              <strong>{isAdmin ? "María Gómez" : "Carlos Peña"}</strong>
              <small>{role} · demo</small>
            </div>
            <button
              className="icon-button"
              aria-label="Salir de demo operativa"
              onClick={() => setRole(null)}
            >
              <LogOut size={16} />
            </button>
          </div>
          <small className="studio-credit">CONCEPT BY MORAN STUDIO</small>
        </div>
      </aside>
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="operations-main">
        <header className="operations-header">
          <div className="flex gap">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir navegación"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <span>
              AVENZA <span className="breadcrumb-separator">/</span> {title}
            </span>
          </div>
          <div className="flex gap">
            <span className="demo-date">
              02 OCT 2026 <span>DEMO</span>
            </span>
            <button
              className="search-trigger"
              onClick={() => setSearch(true)}
              aria-label="Buscar en la operación"
            >
              <Search size={17} />
              <span>Buscar</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Ver notificaciones"
              onClick={() => setNotifications(true)}
            >
              <Bell size={19} />
              {data.notifications.some((n) => !n.read) && <i />}
            </button>
          </div>
        </header>
        <main
          className={
            "operations-content " +
            (page === "inspeccion" ? "field-operations" : "")
          }
        >
          {restricted ? (
            <Empty
              title="Esta vista pertenece al administrador."
              detail="El rol de operaciones concentra las tareas de campo."
            />
          ) : page === "" || page === "hoy" ? (
            <Today />
          ) : page === "planner" ? (
            <Planner />
          ) : page === "reservas" ? (
            parts[1] ? (
              <ReservationDetail id={decodeURIComponent(parts[1])} />
            ) : (
              <Reservations />
            )
          ) : page === "flota" ? (
            parts[1] ? (
              <VehicleProfile id={parts[1]} />
            ) : (
              <FleetBoard />
            )
          ) : page === "clientes" ? (
            parts[1] ? (
              <CustomerProfile id={parts[1]} />
            ) : (
              <Customers />
            )
          ) : page === "inspeccion" ? (
            <InspectionWizard id={parts[1]} />
          ) : page === "comparacion" ? (
            <InspectionComparison id={parts[1]} />
          ) : page === "inspecciones" ? (
            <Inspections />
          ) : page === "pagos" ? (
            <Payments />
          ) : page === "mantenimiento" ? (
            <Maintenance />
          ) : page === "reportes" ? (
            <Reports />
          ) : page === "equipo" ? (
            <Team />
          ) : page === "configuracion" ? (
            <Configuration />
          ) : (
            <Empty title="Esta vista no existe en la demo.">
              <Link href="/operaciones">Volver a la operación de hoy</Link>
            </Empty>
          )}
        </main>
        <footer className="operations-footer">
          Empresa ficticia · Datos locales de demostración{" "}
          <span>
            Concept & Development by{" "}
            <a
              className="studio-link"
              href="https://moran-studio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              MORAN STUDIO
            </a>
          </span>
        </footer>
      </div>
      <GlobalSearch open={search} onClose={() => setSearch(false)} />
      <DemoGuide open={guide} onClose={() => setGuide(false)} />
      <Modal
        title="Lo que necesita atención"
        open={notifications}
        onClose={() => setNotifications(false)}
      >
        <div className="notifications">
          {data.notifications.map((n) => (
            <Link
              key={n.id}
              className={n.read ? "read" : ""}
              href={n.href}
              onClick={() => {
                act({ type: "readNotification", id: n.id });
                setNotifications(false);
              }}
            >
              <Bell size={17} />
              <span>
                {n.text}
                <small>{n.read ? "Revisada" : "Pendiente de revisar"}</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </Modal>
    </div>
  );
}
function Today() {
  const { data } = useStore();
  const [filter, setFilter] = useState("Todo");
  const todays = data.reservations
    .filter((r) => !["Cancelada", "No-show", "Finalizada"].includes(r.state))
    .flatMap((r) => [
      ...(r.start.startsWith(TODAY) && r.state !== "Activa"
        ? [{ r, type: "Entrega", date: r.start }]
        : []),
      ...(r.end.startsWith(TODAY) && r.state === "Activa"
        ? [{ r, type: "Devolución", date: r.end }]
        : []),
    ])
    .sort((a, b) => a.date.localeCompare(b.date));
  const active = data.reservations.filter((r) => r.state === "Activa");
  const available = data.vehicles.filter(
    (v) => !availability(data, v.id, TODAY + "T12:00", "2026-10-03T12:00"),
  );
  const events = todays.filter((e) => filter === "Todo" || e.type === filter);
  const unresolved = data.reservations.filter(
    (r) =>
      !r.vehicleId && !["Finalizada", "Cancelada", "No-show"].includes(r.state),
  );
  const outstanding = data.reservations.filter(
    (r) =>
      balance(data, r) > 0 &&
      !["Cancelada", "No-show", "Finalizada"].includes(r.state),
  );
  return (
    <>
      <PageTitle
        eyebrow="VIERNES, 02 DE OCTUBRE DE 2026"
        title="Cada viaje, bien preparado."
        description="Buenos días, equipo. Esto es lo que mueve la operación de hoy."
      >
        <Link className="button accent" href="/reservar">
          <Plus size={17} /> Nueva reserva
        </Link>
      </PageTitle>
      <div className="operational-stats">
        {[
          [
            todays.filter((e) => e.type === "Entrega").length,
            "Entregas de hoy",
            "/operaciones/reservas?estado=Confirmada",
          ],
          [
            todays.filter((e) => e.type === "Devolución").length,
            "Devoluciones de hoy",
            "/operaciones/reservas?estado=Activa",
          ],
          [
            active.length,
            "Alquileres activos",
            "/operaciones/reservas?estado=Activa",
          ],
          [
            available.length,
            "Disponibles · próximas 24 h",
            "/operaciones/flota",
          ],
        ].map(([n, t, url]) => (
          <Link href={String(url)} key={String(t)}>
            <span>{String(t)}</span>
            <strong>
              {n}
              <ArrowUpRight size={19} />
            </strong>
          </Link>
        ))}
      </div>
      <div className="today-layout">
        <section className="panel today-panel">
          <div className="flex between">
            <div>
              <div className="eyebrow">EL DÍA, DE UN VISTAZO</div>
              <h2>Operación de hoy</h2>
            </div>
            <Link className="text-link" href="/operaciones/planner">
              Ver planner <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="pill-tabs compact-tabs">
            {["Todo", "Entrega", "Devolución"].map((t) => (
              <button
                key={t}
                className={filter === t ? "selected" : ""}
                onClick={() => setFilter(t)}
              >
                {t === "Entrega"
                  ? "Entregas"
                  : t === "Devolución"
                    ? "Devoluciones"
                    : t}
              </button>
            ))}
          </div>
          <div className="today-events">
            {events.map(({ r, type, date }) => {
              const v = data.vehicles.find((v) => v.id === r.vehicleId);
              const c = data.customers.find((c) => c.id === r.customerId)!;
              return (
                <Link
                  className="today-event"
                  href={"/operaciones/reservas/" + r.id}
                  key={r.id + type}
                >
                  <div className="event-time">
                    {new Date(date).toLocaleTimeString("es-DO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "America/Santo_Domingo",
                    })}
                    <span
                      className={
                        "event-dot " + (type === "Entrega" ? "rust" : "green")
                      }
                    />
                  </div>
                  <div className="event-details">
                    <div className="flex gap">
                      <span
                        className={
                          "event-type " +
                          (type === "Entrega" ? "rust" : "green")
                        }
                      >
                        {type}
                      </span>
                      <small>
                        {r.pickup === "Aeropuerto del Cibao"
                          ? "AEROPUERTO"
                          : "SANTIAGO CENTRO"}
                      </small>
                    </div>
                    <h3>
                      {v
                        ? v.brand + " " + v.model
                        : r.category + " · por asignar"}
                    </h3>
                    <p>
                      {c.name} <span>· {r.id}</span>
                    </p>
                  </div>
                  <div className="event-readiness">
                    {!r.vehicleId ? (
                      <Badge>Sin asignar</Badge>
                    ) : balance(data, r) > 0 ? (
                      <Badge>Saldo pendiente</Badge>
                    ) : type === "Entrega" ? (
                      <Badge>Preparar entrega</Badge>
                    ) : (
                      <Badge>Inspección entrada</Badge>
                    )}
                  </div>
                  <ArrowUpRight size={18} />
                </Link>
              );
            })}
            {!events.length && (
              <Empty
                title="No hay tareas pendientes en esta selección."
                detail="El equipo tiene espacio para preparar los próximos recorridos."
              />
            )}
          </div>
        </section>
        <aside>
          <section className="attention-panel">
            <div className="eyebrow">
              ANTES DE QUE SE CONVIERTA EN UN PROBLEMA
            </div>
            <h3>
              Necesita atención{" "}
              <span>{data.notifications.length + unresolved.length}</span>
            </h3>
            {data.notifications.slice(0, 3).map((n, i) => (
              <Link key={n.id} href={n.href}>
                <span className="attention-index">0{i + 1}</span>
                <span>
                  {n.text}
                  <small>
                    Abrir registro <ArrowRight size={13} />
                  </small>
                </span>
              </Link>
            ))}
            {unresolved.map((r) => (
              <Link key={r.id} href={"/operaciones/reservas/" + r.id}>
                <span className="attention-index">!</span>
                <span>
                  {r.id}: sin vehículo asignado.
                  <small>
                    Resolver asignación <ArrowRight size={13} />
                  </small>
                </span>
              </Link>
            ))}
          </section>
          <section className="panel fleet-pulse">
            <h3>Estado de la flota</h3>
            {[
              "Disponible",
              "Alquilado",
              "Mantenimiento",
              "Preparación",
              "Limpieza",
              "Pendiente de inspección",
              "Fuera de servicio",
            ].map((s) => (
              <Link key={s} href={"/operaciones/flota?estado=" + s}>
                <span>{s}</span>
                <strong>
                  {data.vehicles.filter((v) => v.state === s).length}
                </strong>
              </Link>
            ))}
          </section>
        </aside>
      </div>
      <section className="panel active-rentals">
        <div className="flex between">
          <h3>Alquileres en curso</h3>
          <span>{outstanding.length} reservas con saldo pendiente</span>
        </div>
        <ReservationTable rows={active} />
      </section>
    </>
  );
}
function ReservationTable({ rows }: { rows: Reservation[] }) {
  const { data } = useStore();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Reserva / cliente</th>
            <th>Vehículo</th>
            <th>Recogida</th>
            <th>Devolución</th>
            <th>Estado</th>
            <th>Saldo</th>
            <th>
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const c = data.customers.find((c) => c.id === r.customerId);
            const v = data.vehicles.find((v) => v.id === r.vehicleId);
            return (
              <tr key={r.id}>
                <td>
                  <Link href={"/operaciones/reservas/" + r.id}>
                    <strong>{c?.name}</strong>
                    <small>{r.id}</small>
                  </Link>
                </td>
                <td>
                  {v ? v.brand + " " + v.model : r.category}
                  <small>{v?.plate || "Sin asignar"}</small>
                </td>
                <td>
                  {dateLabel(r.start)}
                  <small>{r.pickup}</small>
                </td>
                <td>{dateLabel(r.end)}</td>
                <td>
                  <Badge>{r.state}</Badge>
                </td>
                <td className={balance(data, r) > 0 ? "text-rust" : ""}>
                  {money(balance(data, r))}
                </td>
                <td>
                  <Link
                    className="icon-button"
                    aria-label={"Abrir " + r.id}
                    href={"/operaciones/reservas/" + r.id}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length && (
        <Empty
          title="No hay reservas con estos filtros."
          detail="Prueba otro estado o nombre."
        />
      )}
    </div>
  );
}
function Reservations() {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [state, setState] = useState(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("estado") || "Todas"
      : "Todas",
  );
  const [branch, setBranch] = useState("Todas");
  const [day, setDay] = useState("");
  const [vehicle, setVehicle] = useState("Todos");
  const rows = data.reservations.filter((r) => {
    const c = data.customers.find((c) => c.id === r.customerId);
    return (
      (r.id + " " + c?.name).toLowerCase().includes(q.toLowerCase()) &&
      (state === "Todas" || r.state === state) &&
      (branch === "Todas" || r.pickup === branch) &&
      (!day || (r.start.slice(0, 10) <= day && r.end.slice(0, 10) >= day)) &&
      (vehicle === "Todos" || r.vehicleId === vehicle)
    );
  });
  return (
    <>
      <PageTitle
        eyebrow="DE LA SOLICITUD AL ÚLTIMO KILÓMETRO"
        title="Reservas"
        description={`${data.reservations.length} recorridos, una operación conectada.`}
      >
        <Link className="button accent" href="/reservar">
          <Plus size={16} /> Nueva reserva
        </Link>
      </PageTitle>
      <div className="list-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar reserva o cliente"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar reserva o cliente…"
          />
        </div>
        <Field label="Estado">
          <select value={state} onChange={(e) => setState(e.target.value)}>
            {[
              "Todas",
              "Confirmada",
              "Pendiente de pago",
              "Lista para entrega",
              "Activa",
              "Finalizada",
              "Cancelada",
              "No-show",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Sucursal">
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option>Todas</option>
            {branches.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Fecha incluida">
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </Field>
        <Field label="Vehículo">
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            <option>Todos</option>
            {data.vehicles.map((v) => (
              <option value={v.id} key={v.id}>
                {v.model} · {v.id}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <section className="panel table-panel">
        <div className="table-count">{rows.length} reservas</div>
        <ReservationTable rows={rows} />
      </section>
    </>
  );
}
function Planner() {
  const { data } = useStore();
  const [offset, setOffset] = useState(0);
  const [category, setCategory] = useState("Todas");
  const [branch, setBranch] = useState("Todas");
  const [selected, setSelected] = useState<string | null>(null);
  const start =
    new Date(TODAY + "T00:00:00-04:00").getTime() + offset * 86400000;
  const dates = Array.from(
    { length: 10 },
    (_, i) => new Date(start + i * 86400000),
  );
  const end = start + 10 * 86400000;
  const fleet = data.vehicles.filter(
    (v) =>
      (category === "Todas" || v.category === category) &&
      (branch === "Todas" || v.branch === branch),
  );
  const maintenance = data.maintenance.find((m) => m.id === selected);
  return (
    <>
      <PageTitle
        eyebrow="EL TIEMPO TAMBIÉN ES PARTE DE LA FLOTA"
        title="Planner de vehículos"
        description="Reservas, alquileres y servicios en una misma línea de tiempo."
      >
        <Link className="button secondary" href="/reservar">
          <Plus size={16} /> Nueva reserva
        </Link>
      </PageTitle>
      <div className="planner-toolbar">
        <div className="flex gap">
          <button
            className="icon-button bordered"
            aria-label="Diez días anteriores"
            onClick={() => setOffset(offset - 10)}
          >
            <ChevronLeft size={18} />
          </button>
          <strong>
            {dateLabel(dates[0].toISOString())} —{" "}
            {dateLabel(dates[9].toISOString())}
          </strong>
          <button
            className="icon-button bordered"
            aria-label="Diez días siguientes"
            onClick={() => setOffset(offset + 10)}
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="button secondary small"
            onClick={() => setOffset(0)}
          >
            Hoy
          </button>
        </div>
        <div className="flex gap wrap">
          <select
            aria-label="Categoría de vehículo"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["Todas", "Económico", "Sedán", "SUV", "Pickup", "Premium"].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
          <select
            aria-label="Sucursal del planner"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option>Todas</option>
            {branches.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="planner-legend">
        <span>
          <i className="rust" />
          Alquiler activo
        </span>
        <span>
          <i className="sage" />
          Reserva confirmada
        </span>
        <span>
          <i className="amber" />
          Mantenimiento
        </span>
        <span>
          <i className="outline" />
          Margen de preparación: {data.settings.bufferHours} h
        </span>
      </div>
      <div className="planner-scroll">
        <div className="planner">
          <div className="planner-header">
            <div>
              VEHÍCULO <small>{fleet.length} unidades</small>
            </div>
            <div className="planner-days">
              {dates.map((d) => (
                <div
                  className={
                    d.toISOString().slice(0, 10) === TODAY ? "today" : ""
                  }
                  key={d.toISOString()}
                >
                  <small>
                    {d.toLocaleDateString("es-DO", {
                      weekday: "short",
                      timeZone: "America/Santo_Domingo",
                    })}
                  </small>
                  <strong>
                    {d.toLocaleDateString("es-DO", {
                      day: "2-digit",
                      timeZone: "America/Santo_Domingo",
                    })}
                  </strong>
                </div>
              ))}
            </div>
          </div>
          {fleet.map((v) => {
            const bookings = data.reservations.filter(
              (r) =>
                r.vehicleId === v.id &&
                !["Finalizada", "Cancelada", "No-show"].includes(r.state) &&
                new Date(r.start).getTime() < end &&
                new Date(r.end).getTime() > start,
            );
            const services = data.maintenance.filter(
              (m) =>
                m.vehicleId === v.id &&
                m.state !== "Completado" &&
                new Date(m.start).getTime() < end &&
                new Date(m.end).getTime() > start,
            );
            const pos = (s: string, e: string) => {
              const left = Math.max(
                0,
                ((new Date(s).getTime() - start) / (end - start)) * 100,
              );
              return {
                left: left + "%",
                width:
                  Math.max(
                    0.5,
                    Math.min(
                      100,
                      ((new Date(e).getTime() - start) / (end - start)) * 100,
                    ) - left,
                  ) + "%",
              };
            };
            return (
              <div className="planner-row" key={v.id}>
                <Link
                  className="planner-vehicle"
                  href={"/operaciones/flota/" + v.id}
                >
                  <img src={v.image} alt="" />
                  <span>
                    <strong>
                      {v.brand} {v.model}
                    </strong>
                    <small>
                      {v.id} · {v.plate}
                    </small>
                  </span>
                </Link>
                <div className="planner-lane">
                  <div className="planner-grid-lines">
                    {dates.map((d) => (
                      <i key={d.toISOString()} />
                    ))}
                  </div>
                  {bookings.map((r) => (
                    <Link
                      title={`${r.id} · ${dateLabel(r.start, true)} — ${dateLabel(r.end, true)}`}
                      key={r.id}
                      href={"/operaciones/reservas/" + r.id}
                      style={pos(r.start, r.end)}
                      className={
                        "planner-block " +
                        (r.state === "Activa" ? "active" : "reserved")
                      }
                    >
                      <strong>
                        {data.customers
                          .find((c) => c.id === r.customerId)
                          ?.name.split(" ")
                          .slice(0, 2)
                          .join(" ")}
                      </strong>
                      <small>{r.state}</small>
                    </Link>
                  ))}
                  {services.map((m) => (
                    <button
                      style={pos(m.start, m.end)}
                      className="planner-block maintenance"
                      key={m.id}
                      onClick={() => setSelected(m.id)}
                      title={m.type}
                    >
                      <Wrench size={14} />
                      <span>{m.type}</span>
                    </button>
                  ))}
                  {v.state === "Fuera de servicio" && (
                    <div className="planner-offline">Fuera de servicio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="policy-note">
        Abre un bloque para gestionar la reserva. La reasignación se confirma en
        su ficha después de verificar fechas; no se permite arrastrar una
        reserva a un compromiso incompatible.
      </p>
      <Modal
        title="Bloque de mantenimiento"
        open={!!maintenance}
        onClose={() => setSelected(null)}
      >
        {maintenance && (
          <>
            <Badge>{maintenance.state}</Badge>
            <h2>{maintenance.type}</h2>
            <p>
              {dateLabel(maintenance.start)} — {dateLabel(maintenance.end)}
            </p>
            <p>
              {maintenance.provider} · {money(maintenance.cost)}
            </p>
            <Link
              className="button"
              onClick={() => setSelected(null)}
              href={"/operaciones/flota/" + maintenance.vehicleId}
            >
              Abrir vehículo <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </Modal>
    </>
  );
}
function FleetBoard() {
  const { data } = useStore();
  const [group, setGroup] = useState("Estado");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Todas");
  const [state, setState] = useState(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("estado") || "Todos"
      : "Todos",
  );
  const [branch, setBranch] = useState("Todas");
  const fleet = data.vehicles.filter(
    (v) =>
      (v.brand + " " + v.model + " " + v.plate + " " + v.id)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (category === "Todas" || v.category === category) &&
      (state === "Todos" || v.state === state) &&
      (branch === "Todas" || v.branch === branch),
  );
  const groups =
    group === "Estado"
      ? [
          "Disponible",
          "Alquilado",
          "Reservado",
          "Preparación",
          "Pendiente de inspección",
          "Mantenimiento",
          "Limpieza",
          "Fuera de servicio",
        ]
      : ["Económico", "Sedán", "SUV", "Pickup", "Premium"];
  return (
    <>
      <PageTitle
        eyebrow="CADA UNIDAD TIENE SU HISTORIA"
        title="Flota"
        description={`${data.vehicles.length} vehículos · Santiago Centro y Aeropuerto del Cibao`}
      />
      <div className="list-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar vehículo o placa"
            placeholder="Vehículo, placa o código…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Field label="Categoría">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["Todas", "Económico", "Sedán", "SUV", "Pickup", "Premium"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
        </Field>
        <Field label="Estado">
          <select value={state} onChange={(e) => setState(e.target.value)}>
            {[
              "Todos",
              ...groups.filter(
                (g) =>
                  !["Económico", "Sedán", "SUV", "Pickup", "Premium"].includes(
                    g,
                  ),
              ),
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Sucursal">
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option>Todas</option>
            {branches.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Agrupar por">
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option>Estado</option>
            <option>Categoría</option>
          </select>
        </Field>
      </div>
      {groups.map((g) => {
        const rows = fleet.filter(
          (v) => (group === "Estado" ? v.state : v.category) === g,
        );
        return rows.length ? (
          <section className="fleet-group" key={g}>
            <h3>
              {g} <span>{rows.length}</span>
            </h3>
            <div className="fleet-board-grid">
              {rows.map((v) => (
                <Link
                  className="fleet-unit"
                  key={v.id}
                  href={"/operaciones/flota/" + v.id}
                >
                  <div className="flex between">
                    <small>{v.id}</small>
                    <Badge>{v.state}</Badge>
                  </div>
                  <img src={v.image} alt="Vehículo representativo demo" />
                  <h3>
                    {v.brand} {v.model}
                  </h3>
                  <p>
                    {v.plate} · {v.year}
                  </p>
                  <div className="flex between">
                    <small>{v.km.toLocaleString()} km</small>
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null;
      })}
      {!fleet.length && (
        <Empty title="No encontramos vehículos con estos filtros." />
      )}
    </>
  );
}
function VehicleProfile({ id }: { id: string }) {
  const { data, act } = useStore();
  const [tab, setTab] = useState("Resumen");
  const [newState, setNewState] = useState<VehicleState>("Disponible");
  const [showState, setShowState] = useState(false);
  const [doc, setDoc] = useState(false);
  const v = data.vehicles.find((v) => v.id === id);
  if (!v) return <Empty title="Ese vehículo no pertenece a la flota demo." />;
  const bookings = data.reservations.filter(
    (r) =>
      r.vehicleId === id ||
      data.rentals.some(
        (x) =>
          x.reservationId === r.id &&
          x.segments.some((s) => s.vehicleId === id),
      ),
  );
  const inspections = data.inspections.filter((i) => i.vehicleId === id);
  const damages = data.damages.filter((d) => d.vehicleId === id);
  const services = data.maintenance.filter((m) => m.vehicleId === id);
  return (
    <>
      <Link className="back-link" href="/operaciones/flota">
        <ArrowLeft size={16} /> Flota
      </Link>
      <PageTitle
        eyebrow={`${v.id} · ${v.plate}`}
        title={`${v.brand} ${v.model}`}
        description={`${v.year} · ${v.color} · ${v.branch}`}
      >
        <Badge>{v.state}</Badge>
        <button
          className="button secondary"
          onClick={() => {
            setNewState(v.state);
            setShowState(true);
          }}
        >
          Cambiar estado
        </button>
      </PageTitle>
      <div className="vehicle-profile-hero">
        <img
          src={v.image}
          alt={`${v.brand} ${v.model}, imagen representativa demo`}
        />
        <div>
          <div>
            <small>Kilometraje actual</small>
            <strong>
              {v.km.toLocaleString()}
              <span> km</span>
            </strong>
          </div>
          <div>
            <small>Próximo servicio</small>
            <strong>
              {Math.max(0, v.nextService - v.km).toLocaleString()}
              <span> km</span>
            </strong>
          </div>
          <div>
            <small>Combustible</small>
            <strong>
              {v.fuel}
              <span>%</span>
            </strong>
          </div>
          <div>
            <small>Historial de recorridos</small>
            <strong>
              {bookings.length}
              <span> reservas</span>
            </strong>
          </div>
        </div>
      </div>
      <div className="pill-tabs detail-tabs">
        {[
          "Resumen",
          "Reservas",
          "Inspecciones",
          "Daños",
          "Mantenimiento",
          "Documentos",
          "Historial",
        ].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <section className="panel">
        {tab === "Resumen" && (
          <>
            <h3>Una unidad, todos sus detalles.</h3>
            <div className="spec-grid">
              {[
                ["Código", v.id],
                ["Placa ficticia", v.plate],
                ["VIN ficticio", v.vin],
                ["Categoría", v.category],
                ["Transmisión", v.transmission],
                ["Combustible", v.fuelType],
                ["Capacidad", `${v.seats} pasajeros · ${v.bags} maletas`],
                ["Tarifa demo", money(v.rate) + "/día"],
                ["Último servicio", dateLabel(v.lastService)],
                ["Próximo servicio", v.nextService.toLocaleString() + " km"],
              ].map(([a, b]) => (
                <div key={a}>
                  <small>{a}</small>
                  <strong>{b}</strong>
                </div>
              ))}
            </div>
            {v.nextService - v.km < 500 && (
              <div className="notice">
                Mantenimiento cerca: quedan {v.nextService - v.km} km.{" "}
                <Link href="/operaciones/mantenimiento">
                  Programar servicio
                </Link>
              </div>
            )}
          </>
        )}
        {tab === "Reservas" && <ReservationTable rows={bookings} />}{" "}
        {tab === "Inspecciones" && (
          <>
            {inspections.map((i) => (
              <Link
                className="record-row"
                key={i.id}
                href={"/operaciones/comparacion/" + i.reservationId}
              >
                <ClipboardCheck size={20} />
                <span>
                  <strong>Inspección de {i.type.toLowerCase()}</strong>
                  <small>
                    {i.reservationId} · {dateLabel(i.date)} ·{" "}
                    {i.km.toLocaleString()} km
                  </small>
                </span>
                <ArrowUpRight size={18} />
              </Link>
            ))}
            {!inspections.length && (
              <Empty title="Esta unidad todavía no tiene inspecciones." />
            )}
          </>
        )}
        {tab === "Daños" && (
          <>
            {damages.map((d) => (
              <div className="damage-record" key={d.id}>
                <div>
                  <strong>
                    {d.zone} · {d.kind} · {d.severity}
                  </strong>
                  <p>{d.note}</p>
                  <small>
                    {d.reservationId} · {dateLabel(d.date)}
                  </small>
                </div>
                <select
                  aria-label="Estado de daño"
                  value={d.state}
                  onChange={(e) =>
                    act({
                      type: "damageState",
                      id: d.id,
                      state: e.target.value as typeof d.state,
                    })
                  }
                >
                  {["En revisión", "Cotización", "Cobrado", "Resuelto"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </div>
            ))}
            {!damages.length && (
              <Empty title="Sin daños registrados en esta unidad." />
            )}
            <p className="policy-note">
              Estado de seguimiento manual; no determina responsabilidad.
            </p>
          </>
        )}
        {tab === "Mantenimiento" && (
          <>
            <MaintenanceTable rows={services} />
            <Link
              className="button secondary"
              href="/operaciones/mantenimiento"
            >
              Programar servicio <Wrench size={16} />
            </Link>
          </>
        )}
        {tab === "Documentos" && (
          <>
            <button className="record-row" onClick={() => setDoc(true)}>
              <BookOpen size={22} />
              <span>
                <strong>Ficha técnica ficticia</strong>
                <small>
                  {v.plate} · {v.vin}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
            <p className="policy-note">
              Documentos de demostración, sin validez real.
            </p>
          </>
        )}
        {tab === "Historial" && (
          <>
            <h3>La línea de vida del vehículo</h3>
            <Timeline vehicleId={v.id} />
            {services.map((m) => (
              <div className="activity-item" key={m.id}>
                <i />
                <div>
                  <strong>
                    {m.type} · {m.state}
                  </strong>
                  <p>
                    {m.provider} · {dateLabel(m.start)}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </section>
      <Modal
        title="Actualizar estado de la unidad"
        open={showState}
        onClose={() => setShowState(false)}
      >
        <Field label="Estado operativo">
          <select
            value={newState}
            onChange={(e) => setNewState(e.target.value as VehicleState)}
          >
            {[
              "Disponible",
              "Preparación",
              "Pendiente de inspección",
              "Limpieza",
              "Mantenimiento",
              "Fuera de servicio",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <p className="policy-note">
          Los alquileres activos se cierran desde devolución. Para
          mantenimiento, programa también el período de servicio.
        </p>
        <button
          className="button accent full"
          onClick={() => {
            if (act({ type: "vehicleState", id, state: newState }).ok)
              setShowState(false);
          }}
        >
          Guardar estado
        </button>
      </Modal>
      <Modal
        title="Ficha técnica · documento demo"
        open={doc}
        onClose={() => setDoc(false)}
      >
        <div className="demo-id">
          <div className="demo-watermark">DOCUMENTO DEMOSTRATIVO</div>
          <h2>
            {v.brand} {v.model}
          </h2>
          <p>
            {v.plate} · {v.year}
          </p>
          <p>{v.vin}</p>
          <p>
            {v.fuelType} · {v.transmission}
          </p>
          <small>Creado únicamente para la demostración AVENZA.</small>
        </div>
      </Modal>
    </>
  );
}
function Customers() {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [repeat, setRepeat] = useState(false);
  const rows = data.customers.filter(
    (c) =>
      (c.name + " " + c.email + " " + c.phone)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!repeat ||
        data.reservations.filter((r) => r.customerId === c.id).length > 1),
  );
  return (
    <>
      <PageTitle
        eyebrow="PERSONAS, MÁS QUE REGISTROS"
        title="Clientes"
        description={`${data.customers.length} perfiles ficticios con su historial conectado.`}
      />
      <div className="list-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar cliente"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre, correo o teléfono demo…"
          />
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
          />
          Solo clientes recurrentes
        </label>
      </div>
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto demo</th>
                <th>Reservas</th>
                <th>Saldo pendiente</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const rs = data.reservations.filter(
                  (r) => r.customerId === c.id,
                );
                return (
                  <tr key={c.id}>
                    <td>
                      <Link href={"/operaciones/clientes/" + c.id}>
                        <strong>{c.name}</strong>
                        <small>{c.id}</small>
                      </Link>
                    </td>
                    <td>
                      {c.email}
                      <small>{c.phone}</small>
                    </td>
                    <td>
                      {rs.length}
                      {rs.length > 1 && <small>Recurrente</small>}
                    </td>
                    <td>
                      {money(
                        rs
                          .filter(
                            (r) => !["Cancelada", "No-show"].includes(r.state),
                          )
                          .reduce((n, r) => n + balance(data, r), 0),
                      )}
                    </td>
                    <td>
                      <Link
                        className="icon-button"
                        href={"/operaciones/clientes/" + c.id}
                        aria-label={"Ver " + c.name}
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <Empty title="No encontramos ese cliente en la demo." />
          )}
        </div>
      </section>
    </>
  );
}
function CustomerProfile({ id }: { id: string }) {
  const { data } = useStore();
  const [doc, setDoc] = useState<string | null>(null);
  const c = data.customers.find((c) => c.id === id);
  if (!c) return <Empty title="No encontramos ese perfil." />;
  const rows = data.reservations.filter((r) => r.customerId === id);
  return (
    <>
      <Link className="back-link" href="/operaciones/clientes">
        <ArrowLeft size={16} /> Clientes
      </Link>
      <PageTitle
        eyebrow={c.id + " · PERFIL FICTICIO"}
        title={c.name}
        description={c.notes}
      >
        {rows.length > 1 && <Badge>Cliente recurrente</Badge>}
      </PageTitle>
      <div className="record-layout">
        <div>
          <section className="panel">
            <h3>Sus recorridos</h3>
            <ReservationTable rows={rows} />
          </section>
          <section className="panel">
            <h3>Incidencias del historial</h3>
            {data.incidents
              .filter((x) => rows.some((r) => r.id === x.reservationId))
              .map((x) => (
                <Link
                  className="record-row"
                  key={x.id}
                  href={"/operaciones/reservas/" + x.reservationId}
                >
                  <span>
                    <strong>{x.note}</strong>
                    <small>
                      {x.reservationId} · {dateLabel(x.date)}
                    </small>
                  </span>
                  <Badge>{x.state}</Badge>
                </Link>
              ))}
            {!data.incidents.some((x) =>
              rows.some((r) => r.id === x.reservationId),
            ) && <p>No hay incidencias registradas.</p>}
          </section>
        </div>
        <aside>
          <section className="panel">
            <h3>Información demo</h3>
            <div className="profile-fields">
              {[
                ["Correo", c.email],
                ["Teléfono", c.phone],
                ["Identificación", c.identification],
                ["Licencia", c.license],
              ].map(([a, b]) => (
                <div key={a}>
                  <small>{a}</small>
                  <strong>{b}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="panel">
            <h3>Archivo del cliente</h3>
            <div className="document-list">
              {data.documents
                .filter((d) => d.customerId === c.id)
                .map((d) => (
                  <button key={d.id} onClick={() => setDoc(d.id)}>
                    <span>
                      {d.type}
                      <small>{d.name}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
            </div>
          </section>
          <section className="panel">
            <h3>Resumen de cuenta</h3>
            <div className="summary-line">
              <span>Pagos de alquiler</span>
              <strong>
                {money(rows.reduce((n, r) => n + paid(data, r.id), 0))}
              </strong>
            </div>
            <div className="summary-line">
              <span>Depósitos retenidos</span>
              <strong>
                {money(rows.reduce((n, r) => n + depositHeld(data, r.id), 0))}
              </strong>
            </div>
          </section>
        </aside>
      </div>
      <DocumentPreview id={doc} onClose={() => setDoc(null)} />
    </>
  );
}
function Inspections() {
  const { data } = useStore();
  const [type, setType] = useState("Todas");
  const [q, setQ] = useState("");
  const rows = data.inspections.filter(
    (i) =>
      (type === "Todas" || i.type === type) &&
      (i.reservationId + " " + i.vehicleId)
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="CADA ENTREGA, BIEN DOCUMENTADA"
        title="Inspecciones"
        description="Evidencias separadas para salida y entrada, dentro de cada alquiler."
      />
      <div className="list-toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Buscar inspección"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Reserva o unidad…"
          />
        </div>
        <select
          aria-label="Tipo de inspección"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>Todas</option>
          <option>Salida</option>
          <option>Entrada</option>
        </select>
      </div>
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehículo / reserva</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>KM / combustible</th>
                <th>Responsable</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const v = data.vehicles.find((v) => v.id === i.vehicleId);
                return (
                  <tr key={i.id}>
                    <td>
                      <Link href={"/operaciones/reservas/" + i.reservationId}>
                        <strong>
                          {v?.brand} {v?.model}
                        </strong>
                        <small>{i.reservationId}</small>
                      </Link>
                    </td>
                    <td>
                      <Badge>{i.type}</Badge>
                    </td>
                    <td>{dateLabel(i.date, true)}</td>
                    <td>
                      {i.km.toLocaleString()} km<small>{i.fuel}%</small>
                    </td>
                    <td>{i.employee}</td>
                    <td>
                      <Link
                        className="text-link"
                        href={"/operaciones/comparacion/" + i.reservationId}
                      >
                        Comparar <ArrowUpRight size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <Empty title="No hay inspecciones para esta búsqueda." />
          )}
        </div>
      </section>
    </>
  );
}
function Payments() {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("Todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [rId, setRId] = useState(data.reservations[0]?.id || "");
  const rows = data.payments.filter(
    (p) =>
      (kind === "Todos" || p.kind === kind) &&
      (
        p.reservationId +
        " " +
        data.customers.find(
          (c) =>
            c.id ===
            data.reservations.find((r) => r.id === p.reservationId)?.customerId,
        )?.name
      )
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const income = data.payments
    .filter((p) => ["Pago", "Abono"].includes(p.kind))
    .reduce((n, p) => n + p.amount, 0);
  return (
    <>
      <PageTitle
        eyebrow="MOVIMIENTOS SIMULADOS · SIN DINERO REAL"
        title="Pagos y depósitos"
        description="El ingreso del alquiler y las garantías se mantienen separados."
      >
        <button className="button accent" onClick={() => setSelected("choose")}>
          <Plus size={16} /> Registrar movimiento
        </button>
      </PageTitle>
      <div className="operational-stats three">
        <div>
          <span>Ingreso demo recibido</span>
          <strong>{money(income)}</strong>
        </div>
        <div>
          <span>Saldo de reservas vigentes</span>
          <strong>
            {money(
              data.reservations
                .filter(
                  (r) =>
                    !["Cancelada", "No-show", "Finalizada"].includes(r.state),
                )
                .reduce((n, r) => n + balance(data, r), 0),
            )}
          </strong>
        </div>
        <div>
          <span>Depósitos retenidos</span>
          <strong>
            {money(
              data.reservations.reduce(
                (n, r) => n + depositHeld(data, r.id),
                0,
              ),
            )}
          </strong>
        </div>
      </div>
      <div className="list-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar pagos por reserva o cliente"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Reserva o cliente…"
          />
        </div>
        <select
          aria-label="Tipo de pago"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {[
            "Todos",
            "Pago",
            "Abono",
            "Depósito",
            "Cargo adicional",
            "Reembolso",
          ].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reserva</th>
                <th>Movimiento</th>
                <th>Importe</th>
                <th>Método</th>
                <th>Fecha</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      className="text-link"
                      href={"/operaciones/reservas/" + p.reservationId}
                    >
                      {p.reservationId}
                    </Link>
                  </td>
                  <td>
                    <Badge>{p.kind}</Badge>
                  </td>
                  <td>{money(p.amount)}</td>
                  <td>{p.method}</td>
                  <td>{dateLabel(p.date)}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <Empty title="No hay movimientos en esta selección." />
          )}
        </div>
      </section>
      <Modal
        title="Registrar movimiento demo"
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected === "choose" ? (
          <>
            <Field label="Reserva">
              <select value={rId} onChange={(e) => setRId(e.target.value)}>
                {data.reservations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} ·{" "}
                    {data.customers.find((c) => c.id === r.customerId)?.name}
                  </option>
                ))}
              </select>
            </Field>
            <button
              className="button accent full"
              onClick={() => setSelected(rId)}
            >
              Continuar
            </button>
          </>
        ) : (
          selected && (
            <PaymentForm id={selected} onDone={() => setSelected(null)} />
          )
        )}
      </Modal>
    </>
  );
}
function MaintenanceTable({
  rows,
}: {
  rows: ReturnType<typeof useStore>["data"]["maintenance"];
}) {
  const { data, act, role } = useStore();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Unidad / servicio</th>
            <th>Período</th>
            <th>Proveedor ficticio</th>
            <th>Costo demo</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const v = data.vehicles.find((v) => v.id === m.vehicleId);
            return (
              <tr key={m.id}>
                <td>
                  <Link href={"/operaciones/flota/" + m.vehicleId}>
                    <strong>
                      {v?.brand} {v?.model}
                    </strong>
                    <small>
                      {m.type} · {v?.id}
                    </small>
                  </Link>
                </td>
                <td>
                  {dateLabel(m.start)} — {dateLabel(m.end)}
                  <small>{m.km.toLocaleString()} km</small>
                </td>
                <td>{m.provider}</td>
                <td>{money(m.cost)}</td>
                <td>
                  <Badge>{m.state}</Badge>
                </td>
                <td>
                  {m.state !== "Completado" && role === "Administrador" && (
                    <button
                      className="button secondary small"
                      onClick={() =>
                        act({ type: "completeMaintenance", id: m.id })
                      }
                    >
                      Completar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length && (
        <Empty title="No hay servicios registrados para esta unidad." />
      )}
    </div>
  );
}
function Maintenance() {
  const { data, act, role } = useStore();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(data.vehicles[1].id);
  const [start, setStart] = useState("2026-10-06T08:00");
  const [end, setEnd] = useState("2026-10-07T18:00");
  const [service, setService] = useState("Cambio de aceite");
  const [provider, setProvider] = useState("Taller Cibao · ficticio");
  const [cost, setCost] = useState(4200);
  const [filter, setFilter] = useState("Todos");
  return (
    <>
      <PageTitle
        eyebrow="CUIDAR LA FLOTA ES CUIDAR EL RECORRIDO"
        title="Mantenimiento"
        description="Cada servicio bloquea disponibilidad durante su período."
      >
        {role === "Administrador" && (
          <button className="button accent" onClick={() => setOpen(true)}>
            <Plus size={16} /> Programar servicio
          </button>
        )}
      </PageTitle>
      <div className="maintenance-alerts">
        {data.vehicles
          .filter((v) => v.nextService - v.km <= 500)
          .map((v) => (
            <Link href={"/operaciones/flota/" + v.id} key={v.id}>
              <Wrench size={20} />
              <span>
                <strong>
                  {v.brand} {v.model} · {v.id}
                </strong>
                <small>Próximo servicio en {v.nextService - v.km} km</small>
              </span>
              <ArrowUpRight size={17} />
            </Link>
          ))}
      </div>
      <div className="pill-tabs">
        {["Todos", "Programado", "En curso", "Completado"].map((s) => (
          <button
            key={s}
            className={filter === s ? "selected" : ""}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <section className="panel table-panel">
        <MaintenanceTable
          rows={data.maintenance.filter(
            (m) => filter === "Todos" || m.state === filter,
          )}
        />
      </section>
      <Modal
        title="Programar mantenimiento"
        open={open}
        onClose={() => setOpen(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              act({
                type: "maintenance",
                vehicleId: v,
                start,
                end,
                service,
                cost,
                provider,
              }).ok
            )
              setOpen(false);
          }}
        >
          <Field label="Vehículo">
            <select value={v} onChange={(e) => setV(e.target.value)}>
              {data.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} · {v.id}
                </option>
              ))}
            </select>
          </Field>
          <div className="form-grid">
            <Field label="Desde">
              <input
                required
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>
            <Field label="Hasta">
              <input
                required
                type="datetime-local"
                min={start}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>
            <Field label="Servicio">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {[
                  "Cambio de aceite",
                  "Neumáticos",
                  "Frenos",
                  "Servicio programado",
                  "Revisión de incidencia",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Costo demo · RD$">
              <input
                required
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Proveedor ficticio">
            <input
              required
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </Field>
          <p className="notice">
            No se puede programar sobre una reserva incompatible. Las fechas
            dejan de aparecer disponibles.
          </p>
          <button className="button accent full">
            Programar y bloquear fechas <Check size={16} />
          </button>
        </form>
      </Modal>
    </>
  );
}
function Reports() {
  const { data } = useStore();
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-10-31");
  const rows = data.reservations.filter(
    (r) => r.start.slice(0, 10) >= from && r.start.slice(0, 10) <= to,
  );
  const paymentRows = data.payments.filter(
    (p) => p.date.slice(0, 10) >= from && p.date.slice(0, 10) <= to,
  );
  const revenues = paymentRows
    .filter((p) => ["Pago", "Abono"].includes(p.kind))
    .reduce((n, p) => n + p.amount, 0);
  const valid = rows.filter((r) => !["Cancelada", "No-show"].includes(r.state));
  const countByCat = ["Económico", "Sedán", "SUV", "Pickup", "Premium"].map(
    (cat) => ({ cat, n: valid.filter((r) => r.category === cat).length }),
  );
  const top = data.vehicles
    .map((v) => ({ v, n: valid.filter((r) => r.vehicleId === v.id).length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  const totalDays = Math.max(
    1,
    Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000) +
      1,
  );
  const occupied = valid.reduce(
    (n, r) =>
      n +
      Math.max(
        0,
        Math.ceil(
          (Math.min(
            new Date(r.end).getTime(),
            new Date(to + "T23:59").getTime(),
          ) -
            Math.max(new Date(r.start).getTime(), new Date(from).getTime())) /
            86400000,
        ),
      ),
    0,
  );
  const utilization = Math.min(
    100,
    Math.round((occupied / (data.vehicles.length * totalDays)) * 100),
  );
  const download = () => {
    const content =
      "Reserva,Cliente,Estado,Total DOP,Saldo DOP\n" +
      rows
        .map((r) =>
          [
            r.id,
            data.customers.find((c) => c.id === r.customerId)?.name,
            r.state,
            r.total,
            balance(data, r),
          ]
            .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
            .join(","),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "avenza-reporte-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageTitle
        eyebrow="NÚMEROS PARA TOMAR DECISIONES"
        title="Reportes de la operación"
        description="Resultados calculados desde los registros de esta demo."
      >
        <button className="button secondary" onClick={download}>
          <Download size={16} /> Exportar CSV demo
        </button>
      </PageTitle>
      <div className="list-toolbar">
        <Field label="Desde">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="Hasta">
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
      </div>
      <div className="operational-stats">
        <div>
          <span>Ingresos recibidos demo</span>
          <strong>{money(revenues)}</strong>
        </div>
        <div>
          <span>Reservas del período</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span>Uso de días de flota</span>
          <strong>{utilization}%</strong>
        </div>
        <div>
          <span>Cancelaciones / no-show</span>
          <strong>{rows.length - valid.length}</strong>
        </div>
      </div>
      <div className="reports-grid">
        <section className="panel">
          <div className="eyebrow">PREFERENCIAS DE LOS CLIENTES</div>
          <h3>Reservas por categoría</h3>
          <div className="report-bars">
            {countByCat.map(({ cat, n }) => (
              <div key={cat}>
                <span>{cat}</span>
                <div>
                  <i
                    style={{
                      width:
                        (n / Math.max(1, ...countByCat.map((x) => x.n))) * 100 +
                        "%",
                    }}
                  />
                </div>
                <strong>{n}</strong>
              </div>
            ))}
          </div>
          <p className="muted">Excluye cancelaciones y no-show.</p>
        </section>
        <section className="panel">
          <div className="eyebrow">UNIDADES CON MÁS RECORRIDOS</div>
          <h3>Vehículos más reservados</h3>
          {top.map(({ v, n }, i) => (
            <Link
              className="rank-row"
              key={v.id}
              href={"/operaciones/flota/" + v.id}
            >
              <span>0{i + 1}</span>
              <img src={v.image} alt="" />
              <div>
                <strong>
                  {v.brand} {v.model}
                </strong>
                <small>{v.id}</small>
              </div>
              <strong>
                {n} <small>reservas</small>
              </strong>
            </Link>
          ))}
        </section>
        <section className="panel">
          <h3>Mantenimiento del período</h3>
          <div className="summary-line">
            <span>Costo demo de servicios</span>
            <strong>
              {money(
                data.maintenance
                  .filter(
                    (m) =>
                      m.start.slice(0, 10) >= from &&
                      m.start.slice(0, 10) <= to,
                  )
                  .reduce((n, m) => n + m.cost, 0),
              )}
            </strong>
          </div>
          <div className="summary-line">
            <span>Días bloqueados por servicio</span>
            <strong>
              {data.maintenance
                .filter(
                  (m) =>
                    m.start.slice(0, 10) >= from && m.start.slice(0, 10) <= to,
                )
                .reduce(
                  (n, m) =>
                    n +
                    Math.ceil(
                      (new Date(m.end).getTime() -
                        new Date(m.start).getTime()) /
                        86400000,
                    ),
                  0,
                )}
            </strong>
          </div>
          <div className="summary-line">
            <span>Unidades fuera de servicio ahora</span>
            <strong>
              {
                data.vehicles.filter((v) => v.state === "Fuera de servicio")
                  .length
              }
            </strong>
          </div>
        </section>
        <section className="panel">
          <h3>Saldos y depósitos del período</h3>
          <div className="summary-line">
            <span>Saldo por cobrar</span>
            <strong>
              {money(valid.reduce((n, r) => n + balance(data, r), 0))}
            </strong>
          </div>
          <div className="summary-line">
            <span>Garantía retenida</span>
            <strong>
              {money(rows.reduce((n, r) => n + depositHeld(data, r.id), 0))}
            </strong>
          </div>
          <p className="policy-note">
            Los depósitos no forman parte del ingreso. La utilización mide días
            reservados sobre días de flota, no facturación.
          </p>
        </section>
      </div>
    </>
  );
}
function Team() {
  const { data } = useStore();
  return (
    <>
      <PageTitle
        eyebrow="QUIÉN HACE QUE TODO SE MUEVA"
        title="Equipo demo"
        description="Roles claros para la administración y el trabajo junto al vehículo."
      />
      <section className="panel">
        <div className="team-grid">
          {data.employees.map((e) => (
            <article key={e.id}>
              <span className="avatar">
                {e.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <h3>{e.name}</h3>
              <Badge>{e.role}</Badge>
              <p>{e.branch}</p>
              <small>
                {e.role === "Administrador"
                  ? "Operación completa, finanzas y configuración."
                  : "Reservas, entregas, devoluciones e inspecciones."}
              </small>
            </article>
          ))}
        </div>
        <p className="policy-note">
          Accesos simulados para explorar el producto. No hay usuarios ni
          contraseñas reales.
        </p>
      </section>
      <section className="panel">
        <h3>Actividad reciente del equipo</h3>
        <div className="activity-list">
          {data.activity.slice(0, 12).map((a) => (
            <div key={a.id} className="activity-item">
              <i />
              <div>
                <strong>{a.text}</strong>
                <p>
                  {a.actor} · {dateLabel(a.date, true)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function Configuration() {
  const { data, act, reset } = useStore();
  const [rate, setRate] = useState(data.settings.usdRate);
  const [buffer, setBuffer] = useState(data.settings.bufferHours);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageTitle
        eyebrow="UN SISTEMA ALREDEDOR DE TU OPERACIÓN"
        title="Configuración demo"
        description="Un proyecto real adaptaría estos criterios al negocio."
      />
      <div className="reports-grid">
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            act({ type: "settings", usdRate: rate, bufferHours: buffer });
          }}
        >
          <h3>Reglas compartidas</h3>
          <Field label="Conversión ilustrativa · DOP por USD">
            <input
              type="number"
              min="1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </Field>
          <Field label="Margen de preparación entre reservas · horas">
            <input
              type="number"
              min="0"
              max="24"
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
            />
          </Field>
          <p className="policy-note">
            La tasa es ficticia y no se actualiza desde el mercado. El margen se
            aplica al buscar, reservar, reasignar y extender.
          </p>
          <button className="button accent">Guardar configuración</button>
        </form>
        <section className="panel">
          <h3>Datos de esta experiencia</h3>
          <p>
            Los cambios se guardan localmente en este navegador. La demo
            mantiene la fecha operativa del 2 de octubre de 2026 para que los
            escenarios sean reproducibles.
          </p>
          <p>
            Restaurar elimina las reservas, fotos y movimientos agregados y
            vuelve al dataset inicial.
          </p>
          <button
            className="button secondary danger"
            onClick={() => setOpen(true)}
          >
            Restaurar datos de la demo
          </button>
        </section>
        <section className="panel">
          <h3>Posibilidades de integración</h3>
          <div className="integration-slots">
            {[
              "WhatsApp",
              "Correo electrónico",
              "Pasarela de pago",
              "Firma electrónica",
              "GPS / telemática",
              "Contabilidad",
              "Almacenamiento",
              "Mapas",
            ].map((s) => (
              <div key={s}>
                <span>{s}</span>
                <small>Sin conexión · espacio futuro</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel warm">
          <div className="eyebrow">MORAN STUDIO</div>
          <h2>
            Cada empresa
            <br />
            <em>tiene su manera.</em>
          </h2>
          <p>
            Procesos, roles, campos, contratos, sucursales, pagos y reportes
            pueden diseñarse alrededor de la operación real. Esta demo muestra
            posibilidades, no paquetes ni planes.
          </p>
          <Link className="text-link" href="/contacto?studio=1">
            Cuéntanos cómo trabaja tu empresa <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      <Modal
        title="Restaurar la demo"
        open={open}
        onClose={() => setOpen(false)}
      >
        <p>
          Se eliminarán los cambios de esta demo en este navegador. Volverán las
          36 reservas y los escenarios originales.
        </p>
        <button
          className="button accent full"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Restaurar datos iniciales
        </button>
      </Modal>
    </>
  );
}
