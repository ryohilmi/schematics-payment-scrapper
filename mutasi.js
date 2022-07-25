const puppeteer = require("puppeteer");

require("dotenv").config();

(async () => {
  /*
    Open the page
  */
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://ibank.bankmandiri.co.id/", {
    waitUntil: "networkidle2",
  });
  const frame = await page.frames().find((f) => f.name() === "mainFrame");

  /*
    Login
  */
  const username = await frame.$("#userid_sebenarnya");
  const password = await frame.$("#pwd_sebenarnya");
  const submitBtn = await frame.$("#btnSubmit");

  await username.type(process.env.USERID, { delay: 20 });
  await password.type(process.env.PASSWORD, { delay: 20 });
  await submitBtn.click();

  /*
    Logout
  */
  await frame.waitForSelector("#nav-logout");
  const navLogout = await frame.$("#nav-logout");
  const logoutBtn = await navLogout.$("a");

  await logoutBtn.click();

  await page.waitForTimeout(200);

  const confirmBtn = await frame.$("#btnCancelReg");
  await confirmBtn.click();

  // await browser.close();
})();
