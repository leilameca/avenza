"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Content is visible by default; motion is a progressive enhancement. */
export function PublicMotion({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const targets = [...el.querySelectorAll<HTMLElement>("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    const updatePreference = () => {
      if (media.matches) el.removeAttribute("data-motion");
      else el.setAttribute("data-motion", "ready");
    };
    updatePreference();
    media.addEventListener("change", updatePreference);
    const hero = el.querySelector<HTMLElement>(".hero-photo");
    const scroll = () => {
      if (frame || media.matches || !hero || innerWidth < 961) return;
      frame = requestAnimationFrame(() => {
        const y = Math.min(scrollY, 1000);
        hero.style.setProperty("--camera-y", `${y * 0.035}px`);
        frame = 0;
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updatePreference);
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [path]);
  return (
    <div ref={root} className="public-experience">
      {children}
    </div>
  );
}
