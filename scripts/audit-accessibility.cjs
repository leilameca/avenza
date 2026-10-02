const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("fs");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const context = await b.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const p = await context.newPage();
  const results = [];
  for (const route of [
    "/",
    "/reservar",
    "/preguntas",
    "/contacto",
    "/portal",
    "/flota/AV-006",
    "/operaciones",
    "/operaciones/planner",
    "/operaciones/reservas/AVZ-261002-027",
    "/operaciones/inspeccion/AVZ-261002-027",
  ]) {
    await p.goto("http://localhost:3000" + route);
    if (route === "/operaciones")
      await p
        .getByRole("button", { name: "Entrar como administrador" })
        .click();
    await p.locator("h1").waitFor();
    await p.emulateMedia({ reducedMotion: "reduce" });
    const result = await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    results.push({
      route,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  fs.writeFileSync(
    "docs/accessibility-audit.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results));
  await b.close();
})();
