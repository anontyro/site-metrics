import { URL } from "url";
import * as util from "util";
import * as fs from "fs";
import * as puppeteer from "puppeteer";
import { extractDataFromMetrics } from "../utils/performanceMetricUtil";

const lighthouse = require("lighthouse");
const ReportGenerator = require("lighthouse/lighthouse-core/report/report-generator");
const mkdir = util.promisify(fs.mkdir);
const dirExists = util.promisify(fs.exists);
const writeFile = util.promisify(fs.writeFile);

export interface Metrics {
  // [index: number]: metricObject;
  metrics?: [metricObject];
}

interface metricObject {
  name: string;
  value: number;
}

const DEFAULT_URL = "https://hooq.tv";
const AUDIT_DIR = `${__dirname}/audit/`;

const createPath = (fileName: string) => `${AUDIT_DIR}${fileName}`;

const checkDirExists = async (dir: string = AUDIT_DIR) => {
  const doesAuditExist = await dirExists(AUDIT_DIR);
  if (!doesAuditExist) {
    await mkdir(AUDIT_DIR);
  }
  return true;
};

const createSiteStats = async (url: string = DEFAULT_URL) => {
  const getPerformanceAudit = async (url: string) => {
    console.log("started performance audit");
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send("Performance.enable");
    await page.tracing.start({
      path: createPath("trace.json")
    });

    await page.goto(url, { waitUntil: "load", timeout: 0 });
    await page.tracing.stop();

    const metrics: Metrics = await client.send("Performance.getMetrics");

    return extractDataFromMetrics(
      metrics,
      "FirstMeaningfulPaint",
      "DomContentLoaded"
    );
  };

  const getLighthouseAudit = async (url: string = DEFAULT_URL) => {
    console.log("started lighthouse audit");
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 0 });

    const { lhr } = await lighthouse(DEFAULT_URL, {
      port: new URL(browser.wsEndpoint()).port,
      output: "json",
      logLevel: "info"
    });

    const htmlReport = ReportGenerator.generateReport(lhr, "html");

    await writeFile(createPath("lighthouse.html"), htmlReport);
    await writeFile(createPath("lighthouse.json"), JSON.stringify(lhr));
  };

  const browser = await puppeteer.launch({
    headless: true
  });
  try {
    await checkDirExists();
    const stats = await getPerformanceAudit(url);
    await getLighthouseAudit(url);
    console.log(stats);
    await browser.close();
    console.log("browser closed");
  } catch (err) {
    console.log(`an error occured`, err);
  } finally {
    await browser.close();
  }
};

export default createSiteStats;
