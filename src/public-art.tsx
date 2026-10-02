"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { useId, useState } from "react";

const chapters = [
  {
    title: "Elige tu recorrido",
    copy: "Fechas, sucursal y un vehículo para tu plan. Compara el precio antes de decidir.",
    image: "/images/road.webp",
    label: "TU CAMINO",
    link: "/flota",
    action: "Encontrar mi vehículo",
  },
  {
    title: "Deja todo preparado",
    copy: "Tu reserva, documentos y pagos juntos. Llega con los detalles resueltos.",
    image: "/images/automotive-detail.webp",
    label: "CADA DETALLE",
    link: "/portal",
    action: "Consultar mi reserva",
  },
  {
    title: "Recoge y disfruta",
    copy: "Santiago Centro o Aeropuerto del Cibao. Una entrega documentada antes de salir.",
    image: "/images/hero.webp",
    label: "EL PUNTO DE PARTIDA",
    link: "/contacto",
    action: "Ver puntos de encuentro",
  },
];
export function JourneyStory() {
  const [chapter, setChapter] = useState(0);
  const id = useId();
  const current = chapters[chapter];
  return (
    <section className="journey-story" data-reveal="image">
      <div className="journey-photo" key={current.image}>
        <img
          src={current.image}
          alt="Fotografía editorial conceptual del recorrido AVENZA"
          loading="lazy"
          width="1536"
          height="1024"
        />
      </div>
      <div className="container journey-content">
        <div className="journey-heading">
          <div className="eyebrow">MENOS VUELTAS. MÁS CAMINO.</div>
          <h2>
            Tu tiempo merece
            <br />
            <em>un trato diferente.</em>
          </h2>
        </div>
        <div className="journey-controls">
          <div
            className="journey-tabs"
            role="tablist"
            aria-label="Prepara tu recorrido"
          >
            {chapters.map((item, i) => (
              <button
                key={item.title}
                id={`${id}-tab-${i}`}
                role="tab"
                aria-selected={chapter === i}
                aria-controls={`${id}-panel`}
                tabIndex={chapter === i ? 0 : -1}
                onClick={() => setChapter(i)}
                onKeyDown={(event) => {
                  if (
                    ["ArrowRight", "ArrowLeft", "Home", "End"].includes(
                      event.key,
                    )
                  ) {
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? 2
                          : (chapter + (event.key === "ArrowRight" ? 1 : 2)) %
                            3;
                    setChapter(next);
                    document.getElementById(`${id}-tab-${next}`)?.focus();
                  }
                }}
              >
                <span>0{i + 1}</span>
                {item.title}
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
          <div
            className="journey-panel"
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${chapter}`}
            tabIndex={0}
          >
            <div key={chapter} className="journey-copy">
              <small>{current.label}</small>
              <p>{current.copy}</p>
              <Link className="text-link" href={current.link}>
                {current.action}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <small className="scene-credit">AVENZA / CIBAO · IMAGEN CONCEPTUAL</small>
    </section>
  );
}
export function RoadClosing() {
  return (
    <section className="road-closing" data-reveal="image">
      <img
        src="/images/road.webp"
        alt="SUV conceptual sobre una carretera de montaña del Cibao"
        loading="lazy"
        width="1536"
        height="1024"
      />
      <div className="container road-copy">
        <div className="eyebrow">EL CAMINO ES TUYO.</div>
        <h2>
          Lo que sigue,
          <br />
          <em>lo decides tú.</em>
        </h2>
        <Link className="button" href="/flota">
          Encuentra tu próximo vehículo <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="road-baseline container">
        <span>AVENZA RENT A CAR</span>
        <span>SANTIAGO / REPÚBLICA DOMINICANA</span>
      </div>
    </section>
  );
}
export function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`faq motion-faq ${open ? "is-open" : ""}`}>
      <h2>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          {question}
          <ChevronDown size={18} />
        </button>
      </h2>
      <div id={id} className="faq-answer" aria-hidden={!open} inert={!open}>
        <div>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}
