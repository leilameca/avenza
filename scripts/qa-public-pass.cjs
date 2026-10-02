const { chromium } = require("@playwright/test");
const fs = require("fs");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({
    reducedMotion: "reduce",
    timezoneId: "America/Santo_Domingo",
  });
  let results = [],
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1440, 1280, 1024, 768, 430, 390]) {
    await p.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/flota",
      "/flota/AV-006",
      "/reservar",
      "/nosotros",
      "/preguntas",
      "/contacto",
      "/portal",
      "/portal/AVZ-261002-027",
      "/flota/INVALID",
      "/confirmacion/INVALID",
    ]) {
      await p.goto("http://localhost:3000" + route);
      await p.locator(".public-header").waitFor();
      await p.evaluate(() => document.fonts.ready);
      await p.locator("main img").evaluateAll((xs) =>
        Promise.all(
          xs.map((i) => {
            i.loading = "eager";
            return i.decode().catch(() => {});
          }),
        ),
      );
      const row = {
        width,
        route,
        ...(await p.evaluate(() => ({
          documentWidth: document.documentElement.scrollWidth,
          brokenImages: [...document.querySelectorAll("main img")]
            .filter((i) => !i.naturalWidth)
            .map((i) => i.src),
          outside: [...document.querySelectorAll("main *")]
            .filter((i) => {
              const r = i.getBoundingClientRect();
              return (
                !i.closest(".stepper,.table-wrap") &&
                r.width &&
                r.right > innerWidth + 1 &&
                getComputedStyle(i).position !== "absolute"
              );
            })
            .slice(0, 6)
            .map((i) => i.className),
        }))),
      };
      results.push(row);
      if (
        [1440, 768, 390].includes(width) &&
        ["/", "/flota/AV-006", "/preguntas", "/portal"].includes(route)
      )
        await p.screenshot({
          path: `docs/phase2-${route.replaceAll("/", "_")}-${width}.png`,
          fullPage: true,
        });
    }
  }
  fs.writeFileSync(
    "docs/public-qa-phase2.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  const failures = results.filter(
    (r) =>
      r.documentWidth > r.width || r.brokenImages.length || r.outside.length,
  );
  console.log(JSON.stringify({ screens: results.length, failures, errors }));
  await b.close();
  if (failures.length || errors.length) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
