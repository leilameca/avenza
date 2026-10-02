const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000");
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
  for (let y = 0; y < 4500; y += 600) {
    await p.evaluate((y) => scrollTo(0, y), y);
    await p.waitForTimeout(120);
  }
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: "docs/phase2-home-1440.png", fullPage: true });
  await p.goto("http://localhost:3000/preguntas");
  await p.locator(".motion-faq").first().waitFor();
  await p.waitForTimeout(500);
  await p.screenshot({ path: "docs/phase2-faq-1440.png", fullPage: true });
  await p.setViewportSize({ width: 390, height: 900 });
  await p.goto("http://localhost:3000/flota/AV-006");
  await p.locator(".product-heading").waitFor();
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: "docs/phase2-product-390.png", fullPage: true });
  await p.goto("http://localhost:3000");
  await p.locator(".hero-frame").waitFor();
  for (let y = 0; y < 6500; y += 650) {
    await p.evaluate((y) => scrollTo(0, y), y);
    await p.waitForTimeout(100);
  }
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: "docs/phase2-home-390.png", fullPage: true });
  console.log("Screens captured");
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
