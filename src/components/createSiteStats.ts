import * as puppeteer from "puppeteer";
import { extractDataFromMetrics } from "../utils/performanceMetricUtil";
import { DEFAULT_URL } from "../enums/Constants";
import { checkDirExists, createPath } from "../utils/fileUtil";
import getLighthouseAudit from "../utils/lighthouseUtil";
export interface Metrics {
  // [index: number]: metricObject;
  metrics?: [metricObject];
}

interface metricObject {
  name: string;
  value: number;
}

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

  const browser = await puppeteer.launch({
    headless: true
  });
  try {
    await checkDirExists();
    const stats = await getPerformanceAudit(url);
    await getLighthouseAudit(browser, url);
    console.log(stats);
    await browser.close();
    console.log("audit completed successfully");
  } catch (err) {
    console.log(`an error occured`, err);
  } finally {
    await browser.close();
  }
};

export default createSiteStats;
