const puppeteer = require("puppeteer"); // v13.0.0 or later
const csvToJson = require("convert-csv-to-json");

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

(async () => {
  const browser = await puppeteer.launch(konfigbrowser);

  async function waitForSelectors(selectors, frame, options) {
    for (const selector of selectors) {
      try {
        return await waitForSelector(selector, frame, options);
      } catch (err) {
        console.error(err);
      }
    }
    throw new Error(
      "Could not find element for selectors: " + JSON.stringify(selectors)
    );
  }

  async function scrollIntoViewIfNeeded(element, timeout) {
    await waitForConnected(element, timeout);
    const isInViewport = await element.isIntersectingViewport({ threshold: 0 });
    if (isInViewport) {
      return;
    }
    await element.evaluate((element) => {
      element.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: "auto",
      });
    });
    await waitForInViewport(element, timeout);
  }

  async function waitForConnected(element, timeout) {
    await waitForFunction(async () => {
      return await element.getProperty("isConnected");
    }, timeout);
  }

  async function waitForInViewport(element, timeout) {
    await waitForFunction(async () => {
      return await element.isIntersectingViewport({ threshold: 0 });
    }, timeout);
  }

  async function waitForSelector(selector, frame, options) {
    if (!Array.isArray(selector)) {
      selector = [selector];
    }
    if (!selector.length) {
      throw new Error("Empty selector provided to waitForSelector");
    }
    let element = null;
    for (let i = 0; i < selector.length; i++) {
      const part = selector[i];
      if (element) {
        element = await element.waitForSelector(part, options);
      } else {
        element = await frame.waitForSelector(part, options);
      }
      if (!element) {
        throw new Error("Could not find element: " + selector.join(">>"));
      }
      if (i < selector.length - 1) {
        element = (
          await element.evaluateHandle((el) =>
            el.shadowRoot ? el.shadowRoot : el
          )
        ).asElement();
      }
    }
    if (!element) {
      throw new Error("Could not find element: " + selector.join("|"));
    }
    return element;
  }

  async function waitForElement(step, frame, timeout) {
    const count = step.count || 1;
    const operator = step.operator || ">=";
    const comp = {
      "==": (a, b) => a === b,
      ">=": (a, b) => a >= b,
      "<=": (a, b) => a <= b,
    };
    const compFn = comp[operator];
    await waitForFunction(async () => {
      const elements = await querySelectorsAll(step.selectors, frame);
      return compFn(elements.length, count);
    }, timeout);
  }

  async function querySelectorsAll(selectors, frame) {
    for (const selector of selectors) {
      const result = await querySelectorAll(selector, frame);
      if (result.length) {
        return result;
      }
    }
    return [];
  }

  async function querySelectorAll(selector, frame) {
    if (!Array.isArray(selector)) {
      selector = [selector];
    }
    if (!selector.length) {
      throw new Error("Empty selector provided to querySelectorAll");
    }
    let elements = [];
    for (let i = 0; i < selector.length; i++) {
      const part = selector[i];
      if (i === 0) {
        elements = await frame.$$(part);
      } else {
        const tmpElements = elements;
        elements = [];
        for (const el of tmpElements) {
          elements.push(...(await el.$$(part)));
        }
      }
      if (elements.length === 0) {
        return [];
      }
      if (i < selector.length - 1) {
        const tmpElements = [];
        for (const el of elements) {
          const newEl = (
            await el.evaluateHandle((el) =>
              el.shadowRoot ? el.shadowRoot : el
            )
          ).asElement();
          if (newEl) {
            tmpElements.push(newEl);
          }
        }
        elements = tmpElements;
      }
    }
    return elements;
  }

  async function waitForFunction(fn, timeout) {
    let isActive = true;
    setTimeout(() => {
      isActive = false;
    }, timeout);
    while (isActive) {
      const result = await fn();
      if (result) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Timed out");
  }

  let accounts = csvToJson.fieldDelimiter(",").getJsonFromCsv(process.argv[2]);

  for (let i = 0; i < accounts.length; i++) {
    let account = accounts[i];
    const page = await browser.newPage();
    const timeout = 2147483647;
    page.setDefaultTimeout(timeout);
    {
      const targetPage = page;
      await targetPage.setViewport({ width: 877, height: 551 });
    }
    {
      const targetPage = page;
      const promises = [];
      promises.push(targetPage.waitForNavigation());
      await targetPage.goto("http://schematics.its.ac.id/");
      await Promise.all(promises);
    }
    {
      const targetPage = page;
      const promises = [];
      promises.push(targetPage.waitForNavigation());
      const element = await waitForSelectors(
        [
          ["aria/Login"],
          [
            "#__next > div > div > nav > ul.md\\:flex.hidden.text-white.md\\:gap-5.lg\\:gap-10.xl\\:gap-\\[67px\\] > li:nth-child(3) > a",
          ],
        ],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 34.546875, y: 14 } });
      await Promise.all(promises);
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [
          ["aria/Daftar"],
          [
            "#root > div.min-h-screen.flex.md\\:flex-row.flex-col.w-full.bg-dark-400.font-primary.py-16 > div:nth-child(2) > div > div > p.text-white.text-center.py-2 > span > a",
          ],
        ],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 24.59375, y: 12 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Nama Lengkap"], ["#name"]],
        targetPage,
        { visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 193.5, y: 12 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Nama Lengkap"], ["#name"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      const type = await element.evaluate((el) => el.type);
      if (
        [
          "textarea",
          "select-one",
          "text",
          "url",
          "tel",
          "search",
          "password",
          "number",
          "email",
        ].includes(type)
      ) {
        await element.type(account["Nama"]);
      } else {
        await element.focus();
        await element.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, account["Nama"]);
      }
    }
    {
      const targetPage = page;
      await targetPage.keyboard.down("Tab");
    }
    {
      const targetPage = page;
      await targetPage.keyboard.up("Tab");
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Nama Lengkap"], ["#name"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 192.5, y: 7 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Nama Lengkap"], ["#name"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 193.5, y: 12 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Email"], ["#email"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 193.5, y: 24 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Email"], ["#email"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      const type = await element.evaluate((el) => el.type);
      if (
        [
          "textarea",
          "select-one",
          "text",
          "url",
          "tel",
          "search",
          "password",
          "number",
          "email",
        ].includes(type)
      ) {
        await element.type(account["Email"]);
      } else {
        await element.focus();
        await element.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, account["Email"]);
      }
    }
    {
      const targetPage = page;
      await targetPage.keyboard.down("Tab");
    }
    {
      const targetPage = page;
      await targetPage.keyboard.up("Tab");
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Nomor Telepon"], ["#no_telp"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      const type = await element.evaluate((el) => el.type);
      if (
        [
          "textarea",
          "select-one",
          "text",
          "url",
          "tel",
          "search",
          "password",
          "number",
          "email",
        ].includes(type)
      ) {
        await element.type(account["Nomor"]);
      } else {
        await element.focus();
        await element.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, account["Nomor"]);
      }
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Password"], ["#password"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 188.5, y: 19 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Password"], ["#password"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      const type = await element.evaluate((el) => el.type);
      if (
        [
          "textarea",
          "select-one",
          "text",
          "url",
          "tel",
          "search",
          "password",
          "number",
          "email",
        ].includes(type)
      ) {
        await element.type(account["Password"]);
      } else {
        await element.focus();
        await element.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, account["Password"]);
      }
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Konfirmasi Password"], ["#password_confirm"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 32.5, y: 12 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [["aria/Konfirmasi Password"], ["#password_confirm"]],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      const type = await element.evaluate((el) => el.type);
      if (
        [
          "textarea",
          "select-one",
          "text",
          "url",
          "tel",
          "search",
          "password",
          "number",
          "email",
        ].includes(type)
      ) {
        await element.type(account["Password"]);
      } else {
        await element.focus();
        await element.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, account["Password"]);
      }
    }
    {
      const targetPage = page;
      const element = await waitForSelectors(
        [
          ["aria/Masuk"],
          [
            "#root > div.min-h-screen.flex.md\\:flex-row.flex-col.w-full.bg-dark-400.font-primary.py-16 > div:nth-child(2) > div > div > form > div:nth-child(6) > button",
          ],
        ],
        targetPage,
        { timeout, visible: true }
      );
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 111.5, y: 8 } });
    }
    await page.waitForTimeout(2000);
    await page.close();
  }

  await browser.close();
})();
