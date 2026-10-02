const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const context = await b.newContext({
    viewport: { width: 1440, height: 1000 },
    timezoneId: "America/Santo_Domingo",
  });
  const p = await context.newPage();
  await p.goto("http://localhost:3000/operaciones");
  await p.getByRole("button", { name: "Entrar como administrador" }).click();
  for (const [name, route] of [
    ["planner", "/operaciones/planner"],
    ["reservation", "/operaciones/reservas/AVZ-261002-027"],
    ["before-after", "/operaciones/comparacion/AVZ-260928-023"],
  ]) {
    await p.goto("http://localhost:3000" + route);
    await p.locator("h1").waitFor();
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({
      path: "docs/" + name + "-desktop.png",
      fullPage: true,
    });
  }
  await p.goto("http://localhost:3000/operaciones/inspeccion/AVZ-261002-027");
  for (let i = 0; i < 4; i++)
    await p.getByRole("button", { name: "Continuar", exact: true }).click();
  await p.screenshot({ path: "docs/inspection-desktop.png", fullPage: true });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(250);
  await p.screenshot({ path: "docs/inspection-mobile.png", fullPage: true });
  await p.goto("http://localhost:3000/operaciones/reservas/AVZ-261002-027");
  await p.getByRole("button", { name: "Revisar firma demo" }).click();
  await p.getByRole("button", { name: "Generar contrato demo" }).click();
  await p.emulateMedia({ media: "print" });
  await p.screenshot({ path: "docs/contract-print.png", fullPage: true });
  const printInfo = await p
    .locator(".contract-document")
    .evaluate((e) => ({
      display: getComputedStyle(e).display,
      width: e.getBoundingClientRect().width,
      height: e.getBoundingClientRect().height,
    }));
  console.log("Contract print layout:", printInfo);
  await b.close();
})();
