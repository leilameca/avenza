import { test, expect } from "@playwright/test";

test("photographic scenes reveal on scroll and remain visible with reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".hero-frame").waitFor();
  for (const selector of [
    ".featured-fleet .vehicle-grid",
    ".journey-story",
    ".road-closing",
  ]) {
    const scene = page.locator(selector);
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-visible", "true");
    await expect(scene).toHaveCSS("opacity", "1");
    await expect(scene.locator("img").first()).toHaveCSS(
      "clip-path",
      "inset(0px)",
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".public-experience")).not.toHaveAttribute(
    "data-motion",
  );
  await page.reload();
  await expect(page.locator(".road-closing")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-photo")).toHaveCSS("transform", "none");
});

test("editorial tabs, FAQ disclosure, mobile menu and booking progress respond", async ({
  page,
}) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Deja todo preparado" });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Tu reserva, documentos y pagos juntos",
  );
  await tab.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Recoge y disfruta" }),
  ).toBeFocused();
  await page.goto("/preguntas");
  const disclosure = page.getByRole("button", {
    name: "¿Esta empresa existe?",
    exact: true,
  });
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  const answer = page.locator(".faq-answer").first();
  await expect(answer).toHaveCSS("opacity", "1");
  await disclosure.press("Enter");
  await expect(answer).toHaveAttribute("inert", "");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Abrir menú" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.goto("/reservar");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
  const vehicle = page.locator(".vehicle-select").first();
  await vehicle.click();
  await expect(vehicle).toHaveAttribute("aria-pressed", "true");
});
