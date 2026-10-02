const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: Number(process.argv[2] || 768), height: 900 },
    timezoneId: "America/Santo_Domingo",
  });
  await page.goto("http://localhost:3000/operaciones");
  await page.getByRole("button", { name: "Entrar como administrador" }).click();
  await page.goto(
    "http://localhost:3000" + (process.argv[3] || "/operaciones/reservas"),
  );
  await page.locator("h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
  console.log(
    await page.evaluate(() => ({
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      overflows: Array.from(document.querySelectorAll("body *"))
        .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 20)
        .map((e) => ({
          tag: e.tagName,
          cls: e.className,
          right: e.getBoundingClientRect().right,
          width: e.getBoundingClientRect().width,
          overflow: getComputedStyle(e).overflow,
        })),
      wrap: Array.from(document.querySelectorAll(".table-wrap")).map((e) => ({
        rect: e.getBoundingClientRect().width,
        overflow: getComputedStyle(e).overflow,
        scroll: e.scrollWidth,
      })),
    })),
  );
  await page.screenshot({ path: "docs/layout-check.png", fullPage: true });
  await browser.close();
})();
