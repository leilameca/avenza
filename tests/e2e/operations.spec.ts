import { test, expect, Page } from "@playwright/test";
const next = async (p: Page) =>
  p.getByRole("button", { name: "Continuar", exact: true }).click();
test("Swap preserves segments and creates a replacement inspection with its own baseline", async ({
  page,
}) => {
  await page.goto("/operaciones/reservas/AVZ-260930-026");
  await page.getByRole("button", { name: "Entrar como administrador" }).click();
  await page
    .getByRole("button", { name: "Cambiar vehículo", exact: true })
    .click();
  await page.getByLabel("Vehículo disponible").selectOption("AV-019");
  await page
    .getByLabel("Motivo del cambio")
    .fill("Vibración de rueda · inspección ficticia confirmada");
  await page.getByLabel("KM de cierre del vehículo anterior").fill("31940");
  await page.getByLabel("Combustible del reemplazo · %").fill("100");
  await page
    .getByLabel(
      "Reemplazo revisado: exterior, interior y valores de salida. Firma y foto representativa simuladas.",
    )
    .check();
  await page
    .getByRole("button", { name: "Confirmar cambio", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Kia Sportage" }),
  ).toBeVisible();
  await page.reload();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("avenza-concept-v1")!),
  );
  const rental = stored.rentals.find(
    (r: { reservationId: string }) => r.reservationId === "AVZ-260930-026",
  );
  expect(rental.segments).toHaveLength(2);
  expect(rental.segments[0].inKm).toBe(31940);
  expect(rental.segments[1].outKm).toBe(49140);
  expect(rental.outKm).toBe(49140);
  expect(
    stored.inspections.filter(
      (i: { reservationId: string; type: string }) =>
        i.reservationId === "AVZ-260930-026" && i.type === "Salida",
    ),
  ).toHaveLength(2);
  await page.getByRole("button", { name: "Inspecciones", exact: true }).click();
  await page.getByRole("link", { name: "Comparar antes / después" }).click();
  await expect(page.getByText("49,140 → Por registrar")).toBeVisible();
});
test("Return charge is paid before closing; deposit refund is separate; search and CSV work", async ({
  page,
}) => {
  await page.goto("/operaciones/reservas/AVZ-260928-023");
  await page.getByRole("button", { name: "Entrar como administrador" }).click();
  await page.getByRole("link", { name: "Iniciar devolución" }).click();
  await next(page);
  await page.getByLabel("Kilometraje real de entrada").fill("25220");
  await next(page);
  await next(page);
  await next(page);
  await page
    .getByRole("button", { name: "Lateral izquierdo", exact: true })
    .click();
  await page.getByLabel("Tipo", { exact: true }).selectOption("Abolladura");
  await page
    .getByLabel("Observación manual")
    .fill("Observación nueva demo en puerta. Pendiente de revisión.");
  await page.getByRole("button", { name: "Adjuntar evidencia demo" }).click();
  await page.getByRole("button", { name: "Guardar en borrador" }).click();
  await page
    .getByLabel("Exterior revisado y observaciones registradas.")
    .check();
  await next(page);
  await page.getByLabel("Interior revisado.", { exact: true }).check();
  await next(page);
  await next(page);
  await page.getByRole("button", { name: "Usar foto demo" }).click();
  await next(page);
  await page.getByLabel("Cargo conceptual revisado · RD$").fill("1600");
  await page
    .getByRole("button", { name: "Registrar cargo demo", exact: true })
    .click();
  await page.getByRole("button", { name: "Revisar pago / depósito" }).click();
  await page.getByRole("button", { name: "Registrar movimiento demo" }).click();
  await page.getByLabel("Nombre para firma simulada").fill("Gabriela Rosario");
  await next(page);
  await page
    .getByRole("button", { name: "Cerrar devolución", exact: true })
    .click();
  await expect(
    page.locator(".page-title").getByText("Finalizada", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Registrar pago demo" }).click();
  await page.getByLabel("Tipo de movimiento").selectOption("Reembolso");
  await page.getByRole("button", { name: "Registrar movimiento demo" }).click();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("avenza-concept-v1")!),
  );
  expect(
    stored.payments.filter(
      (p: { reservationId: string; kind: string }) =>
        p.reservationId === "AVZ-260928-023" && p.kind === "Reembolso",
    ),
  ).toHaveLength(1);
  expect(
    stored.notifications.some(
      (n: { id: string }) => n.id === "late-AVZ-260928-023",
    ),
  ).toBe(false);
  await page.keyboard.press("Control+k");
  await page
    .getByLabel("Buscar cliente, reserva o placa")
    .fill("AVZ-260929-024");
  await page.locator(".search-results a").first().click();
  await expect(
    page.getByRole("heading", { name: "Luis Miguel Batista" }),
  ).toBeVisible();
  await page.goto("/operaciones/reportes");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV demo" }).click();
  expect((await download).suggestedFilename()).toBe("avenza-reporte-demo.csv");
});
test("Mobile menus, configuration, keyboard dialog dismissal and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Nuestra flota", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nuestra flota", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".public-header nav")).not.toBeVisible();
  await page.goto("/operaciones");
  await page.getByRole("button", { name: "Entrar como administrador" }).click();
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("link", { name: "Configuración", exact: true }).click();
  await page.getByLabel("Conversión ilustrativa · DOP por USD").fill("62");
  await page.getByRole("button", { name: "Guardar configuración" }).click();
  await page.reload();
  await expect(
    page.getByLabel("Conversión ilustrativa · DOP por USD"),
  ).toHaveValue("62");
  await page
    .getByRole("button", { name: "Restaurar datos de la demo" })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Restaurar datos de la demo" })
    .click();
  await page.getByRole("button", { name: "Restaurar datos iniciales" }).click();
  await page.reload();
  await expect(
    page.getByLabel("Conversión ilustrativa · DOP por USD"),
  ).toHaveValue("60");
  await page.goto("/");
  await expect(page.locator(".studio-link")).toHaveAttribute(
    "href",
    "https://moran-studio.vercel.app",
  );
  expect(
    await page
      .locator(".vehicle-image img")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
});
