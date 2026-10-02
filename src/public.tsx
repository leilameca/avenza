"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicMotion } from "./public-motion";
import { FAQItem, JourneyStory, RoadClosing } from "./public-art";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Menu,
  X,
  Check,
  ChevronDown,
  ArrowLeft,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "./store";
import {
  branches,
  extras,
  Vehicle,
  availability,
  quote,
  dateLabel,
  money,
  days,
  balance,
  depositHeld,
  TODAY,
} from "./domain";
import {
  Brand,
  VehicleCard,
  VehicleSpecs,
  Field,
  PageTitle,
  Empty,
  Badge,
  SuccessMark,
  Modal,
  Timeline,
} from "./ui";
import { DocumentPreview, ContractPreview } from "./reservation";
type SearchDates = {
  pickup: string;
  dropoff: string;
  start: string;
  end: string;
};
const defaultDates: SearchDates = {
  pickup: branches[0],
  dropoff: branches[0],
  start: TODAY + "T12:00",
  end: "2026-10-05T12:00",
};
function SearchForm({
  initial,
  onSearch,
  compact = false,
}: {
  initial?: SearchDates;
  onSearch?: (d: SearchDates) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [d, setD] = useState(initial || defaultDates);
  const [same, setSame] = useState(d.pickup === d.dropoff);
  const [error, setError] = useState("");
  const change = (k: keyof SearchDates, v: string) =>
    setD({ ...d, [k]: v, ...(k === "pickup" && same ? { dropoff: v } : {}) });
  return (
    <form
      className={"availability-form " + (compact ? "compact" : "")}
      onSubmit={(e) => {
        e.preventDefault();
        if (
          new Date(d.end) <= new Date(d.start) ||
          new Date(d.start) < new Date(TODAY + "T10:00")
        ) {
          setError(
            "Elige fechas posteriores a la hora de la demo, con devolución después de la recogida.",
          );
          return;
        }
        setError("");
        const payload = { ...d, dropoff: same ? d.pickup : d.dropoff };
        if (onSearch) onSearch(payload);
        else router.push("/flota?" + new URLSearchParams(payload));
      }}
    >
      <div className="search-form-heading">
        <span>
          <MapPin size={15} /> Encuentra tu próximo vehículo
        </span>
        <label className="check-label">
          <input
            type="checkbox"
            checked={same}
            onChange={(e) => setSame(e.target.checked)}
          />
          Mismo lugar de devolución
        </label>
      </div>
      <div
        className={"availability-fields " + (!same ? "different-location" : "")}
      >
        <Field label="Lugar de recogida">
          <select
            value={d.pickup}
            onChange={(e) => change("pickup", e.target.value)}
          >
            {branches.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Recogida · fecha y hora">
          <input
            type="datetime-local"
            min={TODAY + "T10:00"}
            required
            value={d.start}
            onChange={(e) => change("start", e.target.value)}
          />
        </Field>
        {!same && (
          <Field label="Lugar de devolución">
            <select
              value={d.dropoff}
              onChange={(e) => change("dropoff", e.target.value)}
            >
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Devolución · fecha y hora">
          <input
            type="datetime-local"
            required
            min={d.start}
            value={d.end}
            onChange={(e) => change("end", e.target.value)}
          />
        </Field>
        <button className="button accent">
          Buscar vehículos <ArrowRight size={18} />
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
function Header({ path }: { path: string }) {
  const { currency, setCurrency } = useStore();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 56);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <>
      <div className="concept-strip">
        UNA EMPRESA FICTICIA. UNA EXPERIENCIA REAL DE PRODUCTO.{" "}
        <span>
          Concept Project by MORAN STUDIO <ArrowUpRight size={11} />
        </span>
      </div>
      <header className={`public-header ${scrolled ? "is-scrolled" : ""}`}>
        <Brand />
        <nav className={menu ? "open" : ""} aria-label="Navegación principal">
          <Link
            className={path.startsWith("/flota") ? "active" : ""}
            href="/flota"
            onClick={() => setMenu(false)}
          >
            Nuestra flota
          </Link>
          <Link
            href="/nosotros"
            className={path === "/nosotros" ? "active" : ""}
            onClick={() => setMenu(false)}
          >
            Nosotros
          </Link>
          <Link
            href="/contacto"
            className={path === "/contacto" ? "active" : ""}
            onClick={() => setMenu(false)}
          >
            Contacto
          </Link>
          <Link
            href="/portal"
            className={path.startsWith("/portal") ? "active" : ""}
            onClick={() => setMenu(false)}
          >
            Mi reserva
          </Link>
        </nav>
        <div className="header-tools">
          <select
            aria-label="Moneda"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="DOP">RD$</option>
            <option value="USD">USD</option>
          </select>
          <Link href="/operaciones" className="demo-link">
            Demo operativa <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-button mobile-menu"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
function Footer() {
  return (
    <footer className="public-footer">
      <div className="footer-top">
        <Brand dark />
        <p>
          Una forma más cercana
          <br />
          de moverte por el Cibao.
        </p>
        <div>
          <Link href="/preguntas">Preguntas frecuentes</Link>
          <Link href="/politicas">Condiciones demo</Link>
          <Link href="/contacto">Hablemos</Link>
        </div>
        <div>
          <small>SANTIAGO, REPÚBLICA DOMINICANA</small>
          <p>
            Santiago Centro
            <br />
            Aeropuerto del Cibao
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 AVENZA · Empresa ficticia</span>
        <span>
          Concept & Development by{" "}
          <a
            className="studio-link"
            href="https://moran-studio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>MORAN STUDIO</strong>
          </a>
        </span>
      </div>
    </footer>
  );
}
function Home() {
  const { data } = useStore();
  return (
    <>
      <main>
        <section className="home-intro container">
          <div className="eyebrow">
            <span className="small-dot" /> SANTIAGO & AEROPUERTO DEL CIBAO
          </div>
          <div className="intro-row">
            <h1>
              <span className="title-line">
                <span>Alquiler de vehículos.</span>
              </span>
              <span className="title-line">
                <em>A tu ritmo.</em>
              </span>
            </h1>
            <p>
              Para volver a casa. Para un nuevo camino.
              <br />
              El vehículo que necesitas, con la tranquilidad
              <br className="desktop-only" /> de tener todo claro desde el
              principio.
            </p>
          </div>
        </section>
        <section className="hero-scene">
          <div className="hero-frame">
            <img
              className="hero-photo"
              src="/images/hero.webp"
              alt="SUV blanco en una escena editorial cálida de Santiago · imagen conceptual"
              fetchPriority="high"
              width="1536"
              height="1024"
            />
          </div>
          <div className="hero-caption">
            <span>EL CAMINO ES TUYO.</span>
            <span>
              Nosotros nos encargamos del vehículo. <ArrowDownIcon />
            </span>
          </div>
          <div className="hero-booking container">
            <SearchForm />
          </div>
        </section>
        <section className="trust-strip container">
          <span>
            <span>01</span> Tarifas claras, sin sorpresas
          </span>
          <span>
            <span>02</span> Recogida donde te conviene
          </span>
          <span>
            <span>03</span> Atención de aquí, para ti
          </span>
        </section>
        <section className="section container featured-fleet">
          <div className="section-heading">
            <div>
              <div className="eyebrow">BUENOS COMPAÑEROS DE CAMINO</div>
              <h2>
                Un vehículo para
                <br />
                <em>cada plan.</em>
              </h2>
            </div>
            <Link className="text-link" href="/flota">
              Explorar la flota <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="vehicle-grid" data-reveal="image">
            {[data.vehicles[5], data.vehicles[0], data.vehicles[4]].map((v) => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        </section>
        <JourneyStory />
        <section className="section container studio-note">
          <div className="eyebrow">DETRÁS DE ESTA EXPERIENCIA</div>
          <h2>
            La operación también
            <br />
            <em>merece buen diseño.</em>
          </h2>
          <p>
            Esta es una demostración conceptual. En MORAN STUDIO diseñamos
            soluciones alrededor de la operación real de cada negocio.
          </p>
          <div className="flex wrap gap">
            <Link className="button" href="/operaciones">
              Explorar la operación <ArrowUpRight size={17} />
            </Link>
            <Link className="text-link" href="/contacto?studio=1">
              Cuéntanos cómo trabaja tu empresa <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <RoadClosing />
      </main>
    </>
  );
}
function ArrowDownIcon() {
  return <span className="arrow-down">↓</span>;
}
function Fleet() {
  const params = useSearchParams();
  const initial = {
    pickup: params.get("pickup") || branches[0],
    dropoff: params.get("dropoff") || branches[0],
    start: params.get("start") || defaultDates.start,
    end: params.get("end") || defaultDates.end,
  };
  const [dates, setDates] = useState<SearchDates>(initial);
  const [category, setCategory] = useState("Todas");
  const [price, setPrice] = useState(10000);
  const [seats, setSeats] = useState("Todos");
  const [trans, setTrans] = useState("Todas");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const { data } = useStore();
  const query = new URLSearchParams(dates).toString();
  const list = data.vehicles.filter(
    (v) =>
      (category === "Todas" || v.category === category) &&
      v.rate <= price &&
      (seats === "Todos" || v.seats >= Number(seats)) &&
      (trans === "Todas" || v.transmission === trans) &&
      v.branch === dates.pickup &&
      (!onlyAvailable || !availability(data, v.id, dates.start, dates.end)),
  );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="ENCUENTRA TU COMPAÑERO DE CAMINO"
        title="Nuestra flota"
        description="Compara, elige y sal con todo claro. Precios de demostración."
      />
      <SearchForm compact initial={dates} onSearch={setDates} />
      <div className="fleet-filters">
        <div className="pill-tabs">
          {["Todas", "Económico", "Sedán", "SUV", "Pickup", "Premium"].map(
            (c) => (
              <button
                key={c}
                className={category === c ? "selected" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ),
          )}
        </div>
        <div className="filter-controls">
          <Field label={`Hasta RD$ ${price.toLocaleString("es-DO")} / día`}>
            <input
              type="range"
              min="2100"
              max="10000"
              step="100"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </Field>
          <Field label="Pasajeros">
            <select value={seats} onChange={(e) => setSeats(e.target.value)}>
              <option>Todos</option>
              <option value="5">5 o más</option>
              <option value="7">7 o más</option>
            </select>
          </Field>
          <Field label="Transmisión">
            <select value={trans} onChange={(e) => setTrans(e.target.value)}>
              <option>Todas</option>
              <option>Automática</option>
              <option>Manual</option>
            </select>
          </Field>
          <label className="check-label">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Solo disponibles
          </label>
        </div>
      </div>
      <div className="results-heading">
        <span>
          {list.length} vehículos · {dateLabel(dates.start)} —{" "}
          {dateLabel(dates.end)}
        </span>
        <small>Fotografías representativas · flota ficticia</small>
      </div>
      {list.length ? (
        <div className="vehicle-grid">
          {list.map((v) => (
            <VehicleCard
              key={v.id}
              v={v}
              href={`/flota/${v.id}?${query}`}
              available={!availability(data, v.id, dates.start, dates.end)}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="No hay vehículos para esta combinación."
          detail="Prueba otra categoría, sucursal o fechas. El mantenimiento y las reservas bloquean la disponibilidad."
        >
          <button
            className="button secondary"
            onClick={() => {
              setCategory("Todas");
              setSeats("Todos");
              setTrans("Todas");
              setPrice(10000);
              setDates({ ...dates, pickup: branches[0] });
            }}
          >
            Ampliar filtros
          </button>
        </Empty>
      )}
    </main>
  );
}
function VehicleDetail({ id }: { id: string }) {
  const { data, currency } = useStore();
  const p = useSearchParams();
  const v = data.vehicles.find((v) => v.id === id);
  const [dates, setDates] = useState<SearchDates>({
    pickup: p.get("pickup") || v?.branch || branches[0],
    dropoff: p.get("dropoff") || v?.branch || branches[0],
    start: p.get("start") || defaultDates.start,
    end: p.get("end") || defaultDates.end,
  });
  if (!v)
    return (
      <main className="container section">
        <Empty title="Este vehículo no está en la flota.">
          <Link href="/flota">Ver flota</Link>
        </Empty>
      </main>
    );
  const error = availability(data, v.id, dates.start, dates.end);
  return (
    <main className="container section product-page">
      <Link className="back-link" href="/flota">
        <ArrowLeft size={16} /> Nuestra flota
      </Link>
      <div className="product-heading">
        <h1>
          {v.brand} <em>{v.model}</em>
        </h1>
        <span>
          {v.category} / {v.year} · {v.id}
        </span>
      </div>
      <div className="detail-photo" data-reveal="image">
        <img
          src={v.image}
          width="1536"
          height="1024"
          fetchPriority="high"
          alt={`${v.brand} ${v.model}, fotografía representativa`}
        />
        <span>
          {v.category} / {v.year}
        </span>
      </div>
      <small className="muted">
        Fotografía representativa. El vehículo individual se identifica al
        reservar.
      </small>

      <div className="vehicle-detail-grid">
        <div>
          <div className="section small-section">
            <h2>Todo lo que necesitas.</h2>
            <VehicleSpecs v={v} />
            <div className="spec-grid">
              {[
                ["Combustible", v.fuelType],
                ["Color", v.color],
                ["Recogida", v.branch],
                ["Equipamiento", "A/C · conectividad · cámara demo"],
              ].map(([a, b]) => (
                <div key={a}>
                  <small>{a}</small>
                  <strong>{b}</strong>
                </div>
              ))}
            </div>
          </div>
          <h3>Un poco más de comodidad</h3>
          <div className="extras-list">
            {extras.map((e) => (
              <div key={e.id}>
                <span>{e.name}</span>
                <small>
                  {money(e.rate, currency, data.settings.usdRate)} /{" "}
                  {e.id === "delivery" ? "entrega" : "día"}
                </small>
              </div>
            ))}
          </div>
          <p className="policy-note">
            Las protecciones, requisitos y depósitos son condiciones
            conceptuales configurables. AVENZA es una empresa ficticia.
          </p>
        </div>
        <aside className="booking-aside">
          <div className="eyebrow">TU PRÓXIMO RECORRIDO</div>
          <h2>
            {v.brand} <em>{v.model}</em>
          </h2>
          <p className="large-price">
            {money(v.rate, currency, data.settings.usdRate)}{" "}
            <small>/ día</small>
          </p>
          <div className="mini-dates">
            <Field label="Recogida">
              <input
                type="datetime-local"
                value={dates.start}
                onChange={(e) => setDates({ ...dates, start: e.target.value })}
              />
            </Field>
            <Field label="Devolución">
              <input
                type="datetime-local"
                value={dates.end}
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
              />
            </Field>
          </div>
          <div className="summary-line">
            <span>{days(dates.start, dates.end)} días · tarifa base</span>
            <strong>
              {money(
                quote(v.rate, dates.start, dates.end, []),
                currency,
                data.settings.usdRate,
              )}
            </strong>
          </div>
          {error ? (
            <>
              <p className="error">{error}</p>
              <Link
                className="button secondary full"
                href={"/flota?" + new URLSearchParams(dates)}
              >
                Buscar una alternativa
              </Link>
            </>
          ) : (
            <Link
              className="button accent full"
              href={`/reservar?vehicle=${v.id}&${new URLSearchParams(dates)}`}
            >
              Reservar este vehículo <ArrowRight size={17} />
            </Link>
          )}
          <div className="aside-assurance">
            <ShieldCheck size={19} />
            <span>
              Abono simulado. Sin dinero real.
              <br />
              Depósito demo separado: RD$ 12,000.
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
function Booking() {
  const { data, act, currency } = useStore();
  const p = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dates, setDates] = useState<SearchDates>({
    pickup:
      p.get("pickup") ||
      data.vehicles.find((v) => v.id === p.get("vehicle"))?.branch ||
      branches[0],
    dropoff: p.get("dropoff") || branches[0],
    start: p.get("start") || defaultDates.start,
    end: p.get("end") || defaultDates.end,
  });
  const [vehicleId, setVehicleId] = useState(p.get("vehicle") || "");
  const [selected, setSelected] = useState<string[]>([]);
  const [driver, setDriver] = useState({
    name: "",
    email: "",
    phone: "",
    identification: "",
    license: "",
    notes: "Conductor ficticio de la demo.",
  });
  const [additional, setAdditional] = useState("");
  const [accept, setAccept] = useState(false);
  const [advance, setAdvance] = useState(true);
  const [method, setMethod] = useState("Tarjeta demo");
  const v = data.vehicles.find((v) => v.id === vehicleId);
  const total = v ? quote(v.rate, dates.start, dates.end, selected) : 0;
  const list = data.vehicles.filter(
    (v) =>
      v.branch === dates.pickup &&
      !availability(data, v.id, dates.start, dates.end),
  );
  const error = v ? availability(data, v.id, dates.start, dates.end) : null;
  const next = () => {
    if (
      step === 1 &&
      (new Date(dates.end) <= new Date(dates.start) ||
        new Date(dates.start) < new Date(TODAY + "T10:00"))
    ) {
      toast.error("Revisa las fechas de recogida y devolución.");
      return;
    }
    if (step === 2 && (!v || error || v.branch !== dates.pickup)) {
      toast.error(
        error || "Elige un vehículo disponible en la sucursal de recogida.",
      );
      return;
    }
    if (step === 3 && selected.includes("driver") && !additional.trim()) {
      toast.error("Escribe el nombre del conductor adicional demo.");
      return;
    }
    if (
      step === 4 &&
      (!driver.name.trim() ||
        !driver.license.trim() ||
        !driver.email.includes("@") ||
        !driver.phone.trim() ||
        !driver.identification.trim())
    ) {
      toast.error("Completa los datos del conductor con información ficticia.");
      return;
    }
    if (step === 5 && !accept) {
      toast.error("Confirma que entiendes las condiciones de la demo.");
      return;
    }
    setStep(step + 1);
  };
  const finish = () => {
    if (!v) return;
    const r = act({
      type: "book",
      customer: driver,
      vehicleId: v.id,
      ...dates,
      extras: selected,
      additionalDriver: additional,
      method,
      advance: advance ? Math.round(total * 0.3) : 0,
    });
    if (r.ok) {
      localStorage.setItem("avenza-last-reservation", r.id!);
      router.push("/confirmacion/" + r.id);
    }
  };
  return (
    <main className="container section">
      <PageTitle
        eyebrow="RESERVA SIN COMPLICACIONES"
        title="Deja tu recorrido preparado."
      />
      <div
        className="booking-progress"
        role="progressbar"
        aria-label="Progreso de reserva"
        aria-valuemin={1}
        aria-valuemax={6}
        aria-valuenow={step}
      >
        <span style={{ transform: `scaleX(${step / 6})` }} />
      </div>
      <div className="stepper">
        {[
          "Fechas",
          "Vehículo",
          "Extras",
          "Conductor",
          "Resumen",
          "Abono demo",
        ].map((s, i) => (
          <button
            key={s}
            disabled={i + 1 > step}
            className={
              step === i + 1 ? "current" : step > i + 1 ? "complete" : ""
            }
            onClick={() => setStep(i + 1)}
          >
            <span>{step > i + 1 ? <Check size={14} /> : i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <div className="booking-layout">
        <section className="booking-step" key={step}>
          <div className="eyebrow">PASO {step} DE 6</div>
          <h2>
            {
              [
                "¿Dónde y cuándo?",
                "Elige tu vehículo.",
                "Hazlo a tu medida.",
                "¿Quién estará al volante?",
                "Todo claro antes de salir.",
                "Confirma tu reserva.",
              ][step - 1]
            }
          </h2>
          {step === 1 && (
            <div className="form-grid">
              <Field label="Lugar de recogida">
                <select
                  value={dates.pickup}
                  onChange={(e) =>
                    setDates({
                      ...dates,
                      pickup: e.target.value,
                      dropoff: e.target.value,
                    })
                  }
                >
                  {branches.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field label="Lugar de devolución">
                <select
                  value={dates.dropoff}
                  onChange={(e) =>
                    setDates({ ...dates, dropoff: e.target.value })
                  }
                >
                  {branches.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field label="Recogida">
                <input
                  type="datetime-local"
                  min={TODAY + "T10:00"}
                  value={dates.start}
                  onChange={(e) =>
                    setDates({ ...dates, start: e.target.value })
                  }
                />
              </Field>
              <Field label="Devolución">
                <input
                  type="datetime-local"
                  min={dates.start}
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                />
              </Field>
            </div>
          )}
          {step === 2 && (
            <div className="booking-vehicles">
              {list.map((x) => (
                <button
                  className={
                    "vehicle-select " + (vehicleId === x.id ? "selected" : "")
                  }
                  key={x.id}
                  aria-pressed={vehicleId === x.id}
                  onClick={() => setVehicleId(x.id)}
                >
                  <img src={x.image} alt="" />
                  <span>
                    <strong>
                      {x.brand} {x.model}
                    </strong>
                    <small>
                      {x.category} · {x.seats} pasajeros · {x.id}
                    </small>
                  </span>
                  <strong>
                    {money(x.rate, currency, data.settings.usdRate)}
                    <small>/ día</small>
                  </strong>
                  {vehicleId === x.id && <Check size={18} />}
                </button>
              ))}
              {!list.length && (
                <Empty
                  title="No hay vehículos en estas fechas."
                  detail="Vuelve al primer paso y prueba otras fechas o sucursal."
                />
              )}
            </div>
          )}
          {step === 3 && (
            <>
              <div className="extra-options">
                {extras.map((e) => (
                  <label
                    key={e.id}
                    className={selected.includes(e.id) ? "selected" : ""}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(e.id)}
                      onChange={() =>
                        setSelected(
                          selected.includes(e.id)
                            ? selected.filter((x) => x !== e.id)
                            : [...selected, e.id],
                        )
                      }
                    />
                    <span>
                      <strong>{e.name}</strong>
                      <small>{e.description}</small>
                    </span>
                    <strong>
                      {money(e.rate, currency, data.settings.usdRate)}
                      <small>/{e.id === "delivery" ? "entrega" : "día"}</small>
                    </strong>
                  </label>
                ))}
              </div>
              {selected.includes("driver") && (
                <Field label="Nombre del conductor adicional demo">
                  <input
                    value={additional}
                    onChange={(e) => setAdditional(e.target.value)}
                    placeholder="Nombre ficticio"
                  />
                </Field>
              )}
            </>
          )}
          {step === 4 && (
            <>
              <p className="notice">
                Usa únicamente información ficticia. No cargues datos personales
                reales.
              </p>
              <div className="form-grid">
                {[
                  ["name", "Nombre completo demo"],
                  ["email", "Correo demo"],
                  ["phone", "Teléfono demo"],
                  ["identification", "Identificación demo"],
                  ["license", "Licencia demo"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      type={
                        key === "email"
                          ? "email"
                          : key === "phone"
                            ? "tel"
                            : "text"
                      }
                      value={driver[key as keyof typeof driver]}
                      onChange={(e) =>
                        setDriver({ ...driver, [key]: e.target.value })
                      }
                      placeholder={
                        key === "email"
                          ? "conductor@avenza.example"
                          : key === "phone"
                            ? "(809) 000-0000"
                            : "Dato ficticio"
                      }
                    />
                  </Field>
                ))}
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <div className="review-grid">
                <div>
                  <small>Conductor</small>
                  <h3>{driver.name}</h3>
                  <p>
                    {driver.email}
                    <br />
                    {driver.phone}
                  </p>
                </div>
                <div>
                  <small>Vehículo</small>
                  <h3>
                    {v?.brand} {v?.model}
                  </h3>
                  <p>
                    {v?.id} · {v?.category}
                  </p>
                </div>
                <div>
                  <small>Recogida</small>
                  <h3>{dateLabel(dates.start, true)}</h3>
                  <p>{dates.pickup}</p>
                </div>
                <div>
                  <small>Devolución</small>
                  <h3>{dateLabel(dates.end, true)}</h3>
                  <p>{dates.dropoff}</p>
                </div>
              </div>
              <p className="policy-note">
                Condiciones demostrativas: documentación ficticia, tarifa por
                períodos de 24 horas y depósito conceptual de RD$ 12,000. Las
                protecciones y cancelaciones se configurarían para cada negocio
                real.
              </p>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={accept}
                  onChange={(e) => setAccept(e.target.checked)}
                />
                Entiendo que esta reserva es una simulación sin validez
                comercial.
              </label>
            </>
          )}
          {step === 6 && (
            <>
              <div className="payment-demo">
                <ShieldCheck size={28} />
                <h3>Todo sucede dentro de la demo.</h3>
                <p>No se procesa dinero ni se piden números de tarjeta.</p>
              </div>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={advance}
                  onChange={(e) => setAdvance(e.target.checked)}
                />
                Registrar abono demo del 30% ·{" "}
                {money(
                  Math.round(total * 0.3),
                  currency,
                  data.settings.usdRate,
                )}
              </label>
              <Field label="Método simulado">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option>Tarjeta demo</option>
                  <option>Transferencia demo</option>
                  <option>Efectivo demo</option>
                </select>
              </Field>
              <p className="muted">
                {advance
                  ? "El saldo y depósito demo se completan antes de la entrega."
                  : "La reserva quedará pendiente de pago en operaciones."}
              </p>
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
              <Link className="text-link" href="/flota">
                Volver a la flota
              </Link>
            )}
            {step < 6 ? (
              <button className="button accent" onClick={next}>
                Continuar <ArrowRight size={17} />
              </button>
            ) : (
              <button className="button accent" onClick={finish}>
                Confirmar reserva demo <Check size={17} />
              </button>
            )}
          </div>
        </section>
        <aside className="reservation-summary">
          <div className="eyebrow">TU RESERVA</div>
          {v ? (
            <>
              <img src={v.image} alt="" />
              <h3>
                {v.brand} {v.model}
              </h3>
              <p>
                {v.category} · {v.id}
              </p>
            </>
          ) : (
            <h3>Elige tu compañero de camino.</h3>
          )}
          <div className="summary-line">
            <span>{dateLabel(dates.start)}</span>
            <span>{dateLabel(dates.end)}</span>
          </div>
          <small>{dates.pickup}</small>
          <div className="summary-line">
            <span>
              {days(dates.start, dates.end)} días ×{" "}
              {money(v?.rate || 0, currency, data.settings.usdRate)}
            </span>
            <strong>
              {money(
                (v?.rate || 0) * days(dates.start, dates.end),
                currency,
                data.settings.usdRate,
              )}
            </strong>
          </div>
          {extras
            .filter((e) => selected.includes(e.id))
            .map((e) => (
              <div className="summary-line" key={e.id}>
                <span>{e.name}</span>
                <span>
                  {money(
                    e.rate *
                      (e.id === "delivery" ? 1 : days(dates.start, dates.end)),
                    currency,
                    data.settings.usdRate,
                  )}
                </span>
              </div>
            ))}
          <div className="summary-line total">
            <span>Total demo</span>
            <strong key={total} className="price-response" aria-live="polite">
              {money(total, currency, data.settings.usdRate)}
            </strong>
          </div>
          <small>
            Depósito separado: {money(12000, currency, data.settings.usdRate)}
            <br />
            Conversión ilustrativa: RD$ {data.settings.usdRate} / USD.
          </small>
        </aside>
      </div>
    </main>
  );
}
function Confirmation({ id }: { id: string }) {
  const { data, currency } = useStore();
  const r = data.reservations.find((r) => r.id === id);
  if (!r)
    return (
      <main className="container section">
        <Empty title="No encontramos esta confirmación." />
      </main>
    );
  const v = data.vehicles.find((v) => v.id === r.vehicleId);
  const c = data.customers.find((c) => c.id === r.customerId)!;
  return (
    <main className="container section confirmation">
      <SuccessMark />
      <div className="eyebrow">TODO EMPIEZA CON UN BUEN PLAN</div>
      <h1>Tu reserva está preparada.</h1>
      <p>
        Hola, {c.name.split(" ")[0]}. Aquí tienes los detalles de tu recorrido
        demo.
      </p>
      <div className="confirmation-card">
        <div className="flex between">
          <strong>{r.id}</strong>
          <Badge>{r.state}</Badge>
        </div>
        <h2>
          {v?.brand} {v?.model}
        </h2>
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
        <div className="summary-line">
          <span>Total</span>
          <strong>{money(r.total, currency, data.settings.usdRate)}</strong>
        </div>
        <div className="summary-line">
          <span>Abono registrado</span>
          <strong>
            {money(r.total - balance(data, r), currency, data.settings.usdRate)}
          </strong>
        </div>
        <div className="summary-line">
          <span>Saldo</span>
          <strong>
            {money(balance(data, r), currency, data.settings.usdRate)}
          </strong>
        </div>
        <p className="notice">
          Próximo paso: adjunta una licencia ficticia desde tu portal.
          Operaciones preparará contrato, pagos e inspección antes de la
          entrega.
        </p>
        <Link className="button accent full" href={"/portal/" + id}>
          Abrir mi reserva <ArrowRight size={17} />
        </Link>
        <Link className="text-link" href={"/operaciones/reservas/" + id}>
          Seguir esta reserva en operaciones <ArrowUpRight size={16} />
        </Link>
      </div>
    </main>
  );
}
function Portal({ id }: { id?: string }) {
  const { data, act, currency } = useStore();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [ext, setExt] = useState("");
  const [doc, setDoc] = useState<string | null>(null);
  const [contract, setContract] = useState(false);
  const r = data.reservations.find((r) => r.id === id);
  const sample = data.reservations.find((r) => r.state === "Activa")!;
  if (!id)
    return (
      <main className="container section portal-entry">
        <div className="eyebrow">TODO EN UN MISMO LUGAR</div>
        <h1>
          Tu recorrido,
          <br />
          <em>con todo a mano.</em>
        </h1>
        <p>Consulta tu reserva demo, documentos y pagos.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const x = data.reservations.find(
              (r) => r.id.toLowerCase() === code.trim().toLowerCase(),
            );
            if (x) router.push("/portal/" + x.id);
            else toast.error("No encontramos ese código demo.");
          }}
        >
          <Field label="Código de reserva">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="AVZ-261002-027"
              required
            />
          </Field>
          <button className="button accent">
            Consultar reserva <ArrowRight size={17} />
          </button>
        </form>
        <button
          className="text-link"
          onClick={() => {
            const last = localStorage.getItem("avenza-last-reservation");
            router.push(
              "/portal/" +
                (data.reservations.some((r) => r.id === last)
                  ? last
                  : sample.id),
            );
          }}
        >
          Explorar una reserva de ejemplo <ArrowUpRight size={16} />
        </button>
        <p className="policy-note">
          Acceso abierto de demostración. No es un portal con autenticación
          real.
        </p>
      </main>
    );
  if (!r)
    return (
      <main className="container section">
        <Empty title="Ese código no está en la demo.">
          <Link href="/portal">Buscar reserva</Link>
        </Empty>
      </main>
    );
  const v = data.vehicles.find((v) => v.id === r.vehicleId);
  const c = data.customers.find((c) => c.id === r.customerId)!;
  const docs = data.documents.filter((d) => d.customerId === c.id);
  return (
    <main className="container section">
      <PageTitle
        eyebrow={r.id}
        title={"Hola, " + c.name.split(" ")[0] + "."}
        description="Aquí está todo lo que necesitas para tu recorrido."
      >
        <Badge>{r.state}</Badge>
      </PageTitle>
      <div className="portal-grid">
        <div>
          <section className="panel">
            <div className="portal-car">
              {v && <img src={v.image} alt="Vehículo representativo demo" />}
              <div>
                <h2>{v ? v.brand + " " + v.model : r.category}</h2>
                <p>
                  {v?.id || "Por asignar"} · {r.pickup}
                </p>
              </div>
            </div>
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
            {r.state === "Activa" && (
              <div className="extension-box">
                <h3>¿Necesitas más tiempo?</h3>
                <Field label="Nueva devolución solicitada">
                  <input
                    type="datetime-local"
                    value={ext}
                    min={r.end.slice(0, 16)}
                    onChange={(e) => setExt(e.target.value)}
                  />
                </Field>
                <button
                  className="button secondary"
                  disabled={!ext}
                  onClick={() =>
                    act({ type: "requestExtension", id: r.id, end: ext })
                  }
                >
                  Solicitar extensión <Plus size={16} />
                </button>
                {r.extensionRequest && (
                  <p className="notice">
                    Solicitud pendiente: {dateLabel(r.extensionRequest, true)}.
                  </p>
                )}
              </div>
            )}
          </section>
          <section className="panel">
            <h3>Documentos y contrato</h3>
            <p className="muted">
              Usa solamente documentos ficticios. Archivos JPG, PNG o PDF, hasta
              2 MB.
            </p>
            <div className="document-list">
              {docs.map((d) => (
                <button key={d.id} onClick={() => setDoc(d.id)}>
                  <span>
                    {d.type}
                    <small>{d.name}</small>
                  </span>
                  <Badge>{d.verified ? "Verificado" : "Pendiente"}</Badge>
                </button>
              ))}
            </div>
            <label className="button secondary upload-label">
              Adjuntar licencia demo
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (
                    !["image/jpeg", "image/png", "application/pdf"].includes(
                      f.type,
                    ) ||
                    f.size > 2 * 1024 * 1024
                  ) {
                    toast.error(
                      "El archivo debe ser JPG, PNG o PDF, de hasta 2 MB.",
                    );
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
            {data.agreements.some((a) => a.reservationId === r.id) ? (
              <button
                className="button secondary"
                onClick={() => setContract(true)}
              >
                Ver contrato demo <ArrowUpRight size={16} />
              </button>
            ) : (
              <p className="muted">
                Operaciones preparará tu contrato antes de la entrega.
              </p>
            )}
          </section>
          <section className="panel">
            <h3>Tu reserva, paso a paso</h3>
            <Timeline reservationId={r.id} />
          </section>
        </div>
        <aside>
          <section className="panel">
            <h3>Resumen de pagos</h3>
            <div className="summary-line">
              <span>Total alquiler</span>
              <strong>{money(r.total, currency, data.settings.usdRate)}</strong>
            </div>
            <div className="summary-line">
              <span>Pagado</span>
              <strong>
                {money(
                  r.total - balance(data, r),
                  currency,
                  data.settings.usdRate,
                )}
              </strong>
            </div>
            <div className="summary-line total">
              <span>Saldo</span>
              <strong>
                {money(balance(data, r), currency, data.settings.usdRate)}
              </strong>
            </div>
            <div className="summary-line">
              <span>Depósito retenido</span>
              <strong>
                {money(
                  depositHeld(data, r.id),
                  currency,
                  data.settings.usdRate,
                )}
              </strong>
            </div>
            {data.payments
              .filter((p) => p.reservationId === r.id)
              .map((p) => (
                <div className="payment-row" key={p.id}>
                  <span>
                    {p.kind}
                    <small>
                      {p.method} · {dateLabel(p.date)}
                    </small>
                  </span>
                  <strong>
                    {money(p.amount, currency, data.settings.usdRate)}
                  </strong>
                </div>
              ))}
            <small className="muted">
              Todos los movimientos son simulados.
            </small>
          </section>
          <section className="panel warm">
            <h3>Estamos para ayudarte.</h3>
            <p>
              Tu punto de recogida: {r.pickup}. Conserva el código {r.id} para
              identificar tu reserva demo.
            </p>
            <Link className="text-link" href={"/contacto?reserva=" + r.id}>
              Contactar al equipo <ArrowRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
      <DocumentPreview id={doc} onClose={() => setDoc(null)} />
      <ContractPreview
        id={contract ? r.id : null}
        onClose={() => setContract(false)}
      />
    </main>
  );
}
const questions = [
  [
    "¿Esta empresa existe?",
    "AVENZA es una empresa ficticia creada por MORAN STUDIO para mostrar una operación de alquiler conectada. No acepta reservas comerciales.",
  ],
  [
    "¿Cómo funciona la disponibilidad?",
    "Comparamos reservas, mantenimiento y un margen de preparación. Si un vehículo tiene un compromiso incompatible, no se puede reservar ni extender.",
  ],
  [
    "¿Qué necesito para recoger un vehículo?",
    "En esta demo se revisa licencia ficticia, contrato simulado, pago y depósito demo, e inspección de salida. Los requisitos reales se definirían con cada empresa.",
  ],
  [
    "¿Puedo devolver en otro lugar?",
    "Puedes seleccionar Santiago Centro o Aeropuerto del Cibao. También existe una opción conceptual de entrega coordinada.",
  ],
  [
    "¿Cómo se manejan los daños?",
    "La inspección registra zonas, fotos y observaciones. Los daños nuevos quedan en revisión; el sistema no determina responsabilidad legal.",
  ],
  [
    "¿La tarifa en USD es una tasa real?",
    "No. Es una conversión ilustrativa configurable, inicialmente RD$ 60 por USD. No es una cotización de mercado.",
  ],
];
function Info({ path }: { path: string }) {
  const params = useSearchParams();
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState(
    params.get("studio")
      ? "Un proyecto para mi empresa"
      : "Consulta de reserva demo",
  );
  const isContact = path === "/contacto";
  return (
    <main
      className={`container section info-page ${path === "/nosotros" ? "about-page" : ""} ${isContact ? "contact-page" : ""}`}
    >
      {path === "/nosotros" ? (
        <>
          <PageTitle
            eyebrow="DE AQUÍ, PARA TU CAMINO"
            title="Cercanía que se mueve contigo."
          />
          <div className="info-split">
            <img
              src="/images/road.webp"
              alt="Carretera conceptual en el Cibao"
              data-reveal="image"
              loading="lazy"
              width="1536"
              height="1024"
            />
            <div>
              <h2>
                Santiago es
                <br />
                <em>nuestro punto de partida.</em>
              </h2>
              <p>
                AVENZA imagina una empresa de alquiler ágil y cercana, con dos
                puntos de encuentro: Santiago Centro y el Aeropuerto del Cibao.
              </p>
              <p>
                La tranquilidad no está solo en elegir un vehículo. Está en
                saber cuándo estará disponible, conocer tu saldo y tener
                documentos y entregas bien preparados.
              </p>
              <p className="notice">
                AVENZA es ficticia. Esta experiencia muestra cómo MORAN STUDIO
                puede diseñar software alrededor de procesos reales.
              </p>
              <Link className="button" href="/flota">
                Conocer la flota <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </>
      ) : path === "/preguntas" ? (
        <>
          <PageTitle eyebrow="TODO CLARO" title="Preguntas frecuentes" />
          <div className="faq-layout">
            <div>
              {questions.map(([q, a]) => (
                <FAQItem key={q} question={q} answer={a} />
              ))}
            </div>
            <aside className="faq-context">
              <img
                src="/images/automotive-detail.webp"
                alt="Detalle automotriz conceptual de AVENZA"
                loading="lazy"
                width="1536"
                height="1024"
              />
              <div>
                <div className="eyebrow">ANTES DE SALIR</div>
                <h2>
                  Que nada
                  <br />
                  <em>quede en el aire.</em>
                </h2>
                <p>
                  Fechas, documentos, recogida. Si aún tienes una duda,
                  conversemos.
                </p>
                <Link className="text-link" href="/contacto">
                  Hablemos <ArrowUpRight size={17} />
                </Link>
              </div>
            </aside>
          </div>
        </>
      ) : path === "/politicas" ? (
        <>
          <PageTitle
            eyebrow="CONDICIONES DE DEMOSTRACIÓN"
            title="Una demo, con límites claros."
          />
          <div className="prose">
            <p>
              Todos los vehículos, clientes, documentos, reservas y pagos son
              ficticios. No se realizan cobros, no se reservan vehículos reales
              y los contratos no tienen validez comercial.
            </p>
            <h2>Tarifas y depósito</h2>
            <p>
              La tarifa se calcula en períodos de 24 horas, redondeando al
              próximo día. El depósito conceptual se registra separado del
              ingreso del alquiler. USD usa una tasa ilustrativa configurable.
            </p>
            <h2>Documentos e inspecciones</h2>
            <p>
              Usa únicamente datos y archivos de demostración. Las observaciones
              de daños se registran manualmente y no establecen responsabilidad
              legal.
            </p>
            <h2>Personalización</h2>
            <p>
              En un proyecto real, procesos, roles, contratos, cobros,
              protecciones y políticas se revisan con la empresa y sus asesores.
              Esta demo no representa regulación dominicana confirmada ni
              compromisos de cobertura.
            </p>
            <h2>Datos locales</h2>
            <p>
              Los cambios se guardan en este navegador. Puedes restaurarlos
              desde la configuración de la demo. No existe sincronización entre
              dispositivos ni integraciones externas activas.
            </p>
          </div>
        </>
      ) : isContact ? (
        <>
          <PageTitle
            eyebrow={params.get("studio") ? "MORAN STUDIO" : "ESTAMOS CERCA"}
            title={
              params.get("studio")
                ? "Cuéntanos cómo trabaja tu empresa."
                : "Hablemos de tu recorrido."
            }
          />
          <div className="info-split">
            <div>
              <h2>
                Una buena conversación
                <br />
                <em>abre caminos.</em>
              </h2>
              <p>Dos puntos de encuentro, un mismo equipo.</p>
              <img
                className="contact-photo"
                src="/images/hero.webp"
                alt="Vehículo conceptual en Santiago"
                loading="lazy"
                width="1536"
                height="1024"
              />
              {branches.map((b) => (
                <div className="branch-info" key={b}>
                  <MapPin size={21} />
                  <div>
                    <h3>{b}</h3>
                    <p>
                      Santiago, República Dominicana
                      <br />
                      Ubicación conceptual · no es una oficina real
                    </p>
                  </div>
                </div>
              ))}
              <p className="notice">
                Formulario demostrativo. Guarda tu mensaje en este navegador; no
                envía correos ni mensajes externos.
              </p>
            </div>
            {sent ? (
              <div className="panel">
                <SuccessMark />
                <h2>Mensaje demo guardado.</h2>
                <p>
                  Esta conversación quedaría conectada con tu empresa en una
                  implementación real.
                </p>
                <button
                  className="button secondary"
                  onClick={() => setSent(false)}
                >
                  Escribir otro mensaje
                </button>
              </div>
            ) : (
              <form
                className="panel contact-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  try {
                    const messages = JSON.parse(
                      localStorage.getItem("avenza-messages") || "[]",
                    );
                    messages.push({
                      ...Object.fromEntries(fd.entries()),
                      date: new Date().toISOString(),
                      topic,
                    });
                    localStorage.setItem(
                      "avenza-messages",
                      JSON.stringify(messages),
                    );
                    setSent(true);
                    toast.success("Mensaje demo guardado.");
                  } catch {
                    toast.error(
                      "No pudimos guardar el mensaje en este navegador.",
                    );
                  }
                }}
              >
                <Field label="Nombre demo">
                  <input name="name" required placeholder="Nombre ficticio" />
                </Field>
                <Field label="Correo demo">
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="hola@empresa.example"
                  />
                </Field>
                <Field label="¿Sobre qué conversamos?">
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option>Consulta de reserva demo</option>
                    <option>Un proyecto para mi empresa</option>
                  </select>
                </Field>
                <Field label="Mensaje">
                  <textarea
                    name="message"
                    required
                    rows={4}
                    defaultValue={
                      params.get("reserva")
                        ? "Consulta demo sobre " + params.get("reserva")
                        : ""
                    }
                  />
                </Field>
                <button className="button accent">
                  Guardar mensaje demo <ArrowRight size={17} />
                </button>
              </form>
            )}
          </div>
        </>
      ) : (
        <Empty title="No encontramos esa página.">
          <Link className="button" href="/">
            Volver al inicio
          </Link>
        </Empty>
      )}
    </main>
  );
}
export function PublicExperience({ path }: { path: string }) {
  const parts = path.split("/").filter(Boolean);
  return (
    <PublicMotion path={path}>
      <Header path={path} />
      <div className="public-route" key={path}>
        {path === "/" ? (
          <Home />
        ) : path === "/flota" ? (
          <Fleet />
        ) : parts[0] === "flota" && parts[1] ? (
          <VehicleDetail id={parts[1]} />
        ) : path === "/reservar" ? (
          <Booking />
        ) : parts[0] === "confirmacion" ? (
          <Confirmation id={parts[1]} />
        ) : parts[0] === "portal" ? (
          <Portal id={parts[1]} />
        ) : (
          <Info path={path} />
        )}
      </div>
      <Footer />
    </PublicMotion>
  );
}
