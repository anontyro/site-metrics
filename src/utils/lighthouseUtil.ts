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

  const { lhr } = await lighthouse(DEFAULT_URL, {
    port: new URL(browser.wsEndpoint()).port,
    output: "json",
    logLevel: "info"
  });

  const htmlReport = ReportGenerator.generateReport(lhr, "html");
  console.log("Finishing up Lighthouse report");

  await writeToFile("lighthouse.html", htmlReport);
  await writeToFile("lighthouse.json", JSON.stringify(lhr));
  console.log("Lighthouse report successfully wrote to disk");
};

export default getLighthouseAudit;
