import { test, expect, Page } from "@playwright/test";
const advance = async (p: Page) =>
  p.getByRole("button", { name: "Continuar", exact: true }).click();
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
  "base64",
);
test("Public search → booking → documents → employee handover → extension → return → history persists", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Buscar vehículos" }).click();
  await page.locator('a[href*="/flota/AV-002?"]').click();
  await page.getByRole("link", { name: "Reservar este vehículo" }).click();
  await advance(page);
  await advance(page);
  await page.getByText("Wi-Fi portátil", { exact: true }).click();
  await advance(page);
  await page.getByLabel("Nombre completo demo").fill("Lucía Camino Demo");
  await page.getByLabel("Correo demo").fill("lucia@avenza.example");
  await page.getByLabel("Teléfono demo").fill("(809) 000-0000");
  await page.getByLabel("Identificación demo").fill("DEMO-ID-400");
  await page.getByLabel("Licencia demo").fill("DEMO-LIC-400");
  await advance(page);
  await page
    .getByLabel(
      "Entiendo que esta reserva es una simulación sin validez comercial.",
    )
    .check();
  await advance(page);
  await page.getByLabel("Método simulado").selectOption("Transferencia demo");
  await page.getByRole("button", { name: "Confirmar reserva demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Tu reserva está preparada." }),
  ).toBeVisible();
  const id = new URL(page.url()).pathname.split("/").pop()!;
  await page.getByRole("link", { name: "Abrir mi reserva" }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "licencia-ficticia.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });
  await expect(
    page.getByText("licencia-ficticia.png", { exact: true }),
  ).toBeVisible();
  await page.goto("/operaciones/reservas/" + id);
  await page.getByRole("button", { name: "Entrar como empleado" }).click();
  await expect(
    page.getByRole("heading", { name: "Lucía Camino Demo" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Preparar contrato", exact: true })
    .click();
  await page.getByRole("button", { name: "Generar contrato demo" }).click();
  await expect(
    page.getByText("DOCUMENTO DEMOSTRATIVO · SIN VALIDEZ COMERCIAL"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  for (const kind of ["Pago", "Depósito"]) {
    await page.getByRole("button", { name: "Registrar pago demo" }).click();
    await page.getByLabel("Tipo de movimiento").selectOption(kind);
    await page
      .getByRole("button", { name: "Registrar movimiento demo" })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.getByRole("link", { name: "Inspeccionar y entregar" }).click();
  await advance(page);
  await advance(page);
  await advance(page);
  await advance(page);
  await page
    .getByLabel("Exterior revisado y observaciones registradas.")
    .check();
  await advance(page);
  await page.getByLabel("Interior revisado.", { exact: true }).check();
  await advance(page);
  await advance(page);
  await page.getByRole("button", { name: "Usar foto demo" }).click();
  await advance(page);
  await page.getByLabel("Nombre para firma simulada").fill("Lucía Camino Demo");
  await advance(page);
  await page
    .getByRole("button", { name: "Entregar vehículo", exact: true })
    .click();
  await expect(
    page.locator(".page-title").getByText("Activa", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.locator(".page-title").getByText("Activa", { exact: true }),
  ).toBeVisible();
  await page.goto("/portal/" + id);
  await page.getByLabel("Nueva devolución solicitada").fill("2026-10-06T12:00");
  await page.getByRole("button", { name: "Solicitar extensión" }).click();
  await expect(page.getByText(/Solicitud pendiente:/)).toBeVisible();
  await page.goto("/operaciones/reservas/" + id);
  await page.getByRole("button", { name: "Revisar solicitud" }).click();
  await page
    .getByRole("button", { name: "Registrar extensión", exact: true })
    .click();
  await page.getByRole("button", { name: "Registrar pago demo" }).click();
  await page.getByRole("button", { name: "Registrar movimiento demo" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Iniciar devolución" }).click();
  await advance(page);
  const out = Number(
    await page.getByLabel("Kilometraje real de entrada").inputValue(),
  );
  await page.getByLabel("Kilometraje real de entrada").fill(String(out + 340));
  await advance(page);
  await page.getByLabel("Nivel de combustible").fill("75");
  await advance(page);
  await page.getByLabel("Fecha y hora real").fill("2026-10-06T13:00");
  await advance(page);
  await page
    .getByRole("button", { name: "Lateral izquierdo", exact: true })
    .click();
  await page.getByLabel("Tipo", { exact: true }).selectOption("Abolladura");
  await page.getByLabel("Severidad").selectOption("Moderado");
  await page
    .getByLabel("Observación manual")
    .fill(
      "Nueva observación ficticia en puerta. Sin atribución de responsabilidad.",
    );
  await page.getByRole("button", { name: "Adjuntar evidencia demo" }).click();
  await page.getByRole("button", { name: "Guardar en borrador" }).click();
  await page
    .getByLabel("Exterior revisado y observaciones registradas.")
    .check();
  await advance(page);
  await page.getByLabel("Interior revisado.", { exact: true }).check();
  await advance(page);
  await advance(page);
  await page.getByRole("button", { name: "Usar foto demo" }).click();
  await advance(page);
  await page.getByLabel("Nombre para firma simulada").fill("Lucía Camino Demo");
  await advance(page);
  await page
    .getByLabel("Estado del vehículo después de devolver")
    .selectOption("Disponible");
  await page
    .getByRole("button", { name: "Cerrar devolución", exact: true })
    .click();
  await expect(
    page.locator(".page-title").getByText("Finalizada", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Inspecciones", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Inspección de entrada" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Comparar antes / después" }).click();
  await expect(
    page.getByRole("heading", { name: "Antes. Después. Todo claro." }),
  ).toBeVisible();
  await expect(page.getByText("340 km recorridos")).toBeVisible();
  await page
    .getByRole("slider", { name: "Comparar fotos de salida y entrada" })
    .fill("35");
  await page.reload();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("avenza-concept-v1")!),
  );
  expect(
    stored.reservations.find((r: { id: string }) => r.id === id).state,
  ).toBe("Finalizada");
  expect(
    stored.vehicles.find((v: { id: string }) => v.id === "AV-002").state,
  ).toBe("Disponible");
  expect(
    stored.inspections.filter(
      (i: { reservationId: string }) => i.reservationId === id,
    ),
  ).toHaveLength(2);
  expect(
    stored.payments.find(
      (p: { reservationId: string; kind: string }) =>
        p.reservationId === id && p.kind === "Abono",
    ).method,
  ).toBe("Transferencia demo");
  expect(errors).toEqual([]);
});
test("Conflicting extension, invalid upload, role boundaries and maintenance", async ({
  page,
}) => {
  await page.goto("/operaciones/reservas/AVZ-260929-024");
  await page.getByRole("button", { name: "Entrar como administrador" }).click();
  await page
    .getByRole("button", { name: "Extender alquiler", exact: true })
    .click();
  await expect(page.getByText("Este recorrido tiene un cruce.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Registrar extensión", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.getByRole("button", { name: "Documentos", exact: true }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "archivo-invalido.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("demo"),
    });
  await expect(
    page.getByText("Selecciona JPG, PNG o PDF de hasta 2 MB."),
  ).toBeVisible();
  await page.goto("/operaciones/mantenimiento");
  await page
    .getByRole("button", { name: "Programar servicio", exact: true })
    .click();
  await page.getByLabel("Vehículo", { exact: true }).selectOption("AV-007");
  await page.getByLabel("Desde", { exact: true }).fill("2026-10-03T08:00");
  await page.getByLabel("Hasta", { exact: true }).fill("2026-10-04T18:00");
  await page
    .getByRole("button", { name: "Programar y bloquear fechas" })
    .click();
  await expect(page.getByText(/Conflicto con AVZ-261002-027/)).toBeVisible();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.getByRole("button", { name: "Salir de demo operativa" }).click();
  await page.getByRole("button", { name: "Entrar como empleado" }).click();
  await page.goto("/operaciones/pagos");
  await expect(
    page.getByText("Esta vista pertenece al administrador."),
  ).toBeVisible();
});
test("Desktop, tablet and mobile routes have working imagery and no page overflow", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/operaciones");
  await page.getByRole("button", { name: "Entrar como administrador" }).click();
  const routes = [
    "/",
    "/flota",
    "/flota/AV-002",
    "/reservar",
    "/nosotros",
    "/preguntas",
    "/contacto",
    "/politicas",
    "/portal",
    "/portal/AVZ-260929-024",
    "/operaciones",
    "/operaciones/planner",
    "/operaciones/reservas",
    "/operaciones/reservas/AVZ-261002-027",
    "/operaciones/flota",
    "/operaciones/flota/AV-008",
    "/operaciones/clientes",
    "/operaciones/clientes/CLI-001",
    "/operaciones/inspecciones",
    "/operaciones/comparacion/AVZ-260928-023",
    "/operaciones/pagos",
    "/operaciones/mantenimiento",
    "/operaciones/reportes",
    "/operaciones/equipo",
    "/operaciones/configuracion",
    "/operaciones/inspeccion/AVZ-261002-027",
  ];
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.locator("img").evaluateAll(async (xs) => {
        await Promise.all(
          xs.map(async (el) => {
            const img = el as HTMLImageElement;
            img.loading = "eager";
            try {
              await img.decode();
            } catch {}
          }),
        );
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `Overflow ${route} ${width}px`).toBe(false);
      const broken = await page
        .locator("img")
        .evaluateAll((xs) =>
          xs
            .filter(
              (x) =>
                !(x as HTMLImageElement).complete ||
                (x as HTMLImageElement).naturalWidth === 0,
            )
            .map((x) => x.getAttribute("src")),
        );
      expect(broken, `Broken image ${route}`).toEqual([]);
    }
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Alquiler de vehículos." }),
    ).toBeVisible();
    await page.screenshot({ path: `docs/home-${width}.png`, fullPage: true });
    await page.goto("/operaciones");
    await expect(
      page.getByRole("heading", { name: "Cada viaje, bien preparado." }),
    ).toBeVisible();
    await page.screenshot({
      path: `docs/operations-${width}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
