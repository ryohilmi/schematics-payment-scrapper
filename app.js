const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: "out.csv",
  header: [
    { id: "date", title: "Data" },
    { id: "desc", title: "Description" },
    { id: "value", title: "Value" },
  ],
});

require("dotenv").config();

const konfigbrowser = {
  headless: false,
  args: [
    "--log-level=3", // fatal only

    "--no-default-browser-check",
    "--disable-infobars",
    "--disable-web-security",
    "--disable-site-isolation-trials",
    "--no-experiments",
    "--ignore-gpu-blacklist",
    "--ignore-certificate-errors",
    "--ignore-certificate-errors-spki-list",
    "--mute-audio",
    "--disable-extensions",
    "--no-sandbox",
  ],
  disablejavascript: true,
  ignoreHTTPSErrors: true,
  incognito: true,
  disablegpu: true,
};

async function getSettlement() {
  const browser = await puppeteer.launch(konfigbrowser);
  const page = await browser.newPage();
  try {
    await page.goto(
      "https://ibank.bankmandiri.co.id/retail3/loginfo/loginRequest",
      {
        waitUntil: "networkidle2",
      }
    );

    await page.type("#userid_sebenarnya", process.env.USERID, { delay: 20 });
    await page.type("#pwd_sebenarnya", process.env.PASSWORD, { delay: 20 });
    await page.click("#btnSubmit");

    await page.waitForNavigation({
      waitUntil: "networkidle2",
    });

    await page.click("div.acc-left");
    await page.waitForSelector(
      "#globalTable > tbody > tr:nth-child(1) > td.desc > div"
    );
    const result = await page.$$eval("#globalTable > tbody > tr", (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });
    let arrayfilter = [];
    for (let i = 0; i < result.length; i++) {
      const filtered = result[i].filter(function (el) {
        return el != "-";
      });
      if (filtered.length > 0) {
        arrayfilter.push(filtered);
      }
    }

    let res = arrayfilter.map((el, i) => ({
      date: el[0],
      desc: el[1],
      value: parseInt(el[2].replace(/\,/g, "")),
    }));

    res = res.filter((el) => {
      let val = el["value"];

      if (process.argv[2] == "nlc") {
        return val > 150000 && val < 155000;
      } else if (process.argv[2] == "npc" && process.argv[3] == "senior") {
        return val > 120000 && val < 125000;
      } else if (process.argv[2] == "npc" && process.argv[3] == "junior") {
        return val > 50000 && val < 55000;
      } else if (process.argv[2] == "nst") {
        return val % 60000 < 5000;
      } else {
        return true;
      }
    });

    csvWriter
      .writeRecords(res)
      .then(() => console.log("The CSV file was written successfully"));

    await page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/logout");
  } catch (error) {
    console.log(error);
    await page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/logout");
  }
}
getSettlement().then(() => {});
