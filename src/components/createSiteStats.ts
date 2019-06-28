import { URL } from "url";
import * as util from "util";
import * as fs from "fs";
import * as puppeteer from "puppeteer";
import { extractDataFromMetrics } from "../utils/performanceMetricUtil";

const lighthouse = require("lighthouse");
const mkdir = util.promisify(fs.mkdir);
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

const createSiteStats = async (url: string = DEFAULT_URL) => {
  const getStats = async (url: string) => {
    console.log("started");
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send("Performance.enable");
    await mkdir(AUDIT_DIR);
    await page.tracing.start({
      path: createPath("trace.json")
    });

    await page.goto(url, { waitUntil: "load", timeout: 0 });
    await page.tracing.stop();

    const metrics: Metrics = await client.send("Performance.getMetrics");

    const { lhr } = await lighthouse(DEFAULT_URL, {
      port: new URL(browser.wsEndpoint()).port,
      output: "json",
      logLevel: "info"
    });

    await writeFile(createPath("lighthouse.json"), JSON.stringify(lhr));

    return extractDataFromMetrics(
      metrics,
      "FirstMeaningfulPaint",
      "DomContentLoaded"
    );
  };

  const browser = await puppeteer.launch({
    headless: true
  });
  try {
    const stats = await getStats(url);
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
