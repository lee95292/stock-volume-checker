const puppeteer = require("puppeteer");

(async () => {
  const google = require("./googleutils.js");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.barchart.com/stocks/most-active/daily-volume-leaders",
    { waitUntil: "load" }
  );

  await page.waitForSelector("tbody", { timeout: 5000 });

  const newPage = await page.evaluate(() => {
    const tbRows = document.getElementsByTagName("tbody")[0].children;
    const stockInfos = [];
    for (const row of tbRows) {
      if (row.getElementsByClassName("priceChange up").length === 0) {
        continue;
      }
      const rowInfos = [
        "symbol",
        "lastPrice",
        "priceChange up",
        "tradeTime",
        "volume",
      ].map((v) => {
        return row.getElementsByClassName(v)[0].innerText;
      });
      stockInfos.push(rowInfos);
    }

    return stockInfos;
  });
  console.log(newPage);
  const res = await google.updateSheet(
    "17XgOoKWbZSjm4oh8j7oIDvTlVcY_e9C68WU_7ZDwDv0",
    "2021-02-18!A2:E100",
    newPage
  );
  console.log(res);

  process.exit();
})();
