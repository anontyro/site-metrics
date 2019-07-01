import { DEFAULT_URL } from "../enums/Constants";
import * as puppeteer from "puppeteer";
import { writeToFile } from "./fileUtil";

const lighthouse = require("lighthouse");
const ReportGenerator = require("lighthouse/lighthouse-core/report/report-generator");

const getLighthouseAudit = async (
  browser: puppeteer.Browser,
  url: string = DEFAULT_URL
) => {
  console.log("started lighthouse audit");
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 0 });

  const { lhr } = await lighthouse(DEFAULT_URL, {
    port: new URL(browser.wsEndpoint()).port,
    output: "json",
    logLevel: "info"
  });

  const htmlReport = ReportGenerator.generateReport(lhr, "html");

  await writeToFile("lighthouse.html", htmlReport);
  await writeToFile("lighthouse.json", JSON.stringify(lhr));
};

export default getLighthouseAudit;
