import * as puppeteer from "puppeteer";
import { extractDataFromMetrics } from "../utils/performanceMetricUtil";

export interface Metrics {
  // [index: number]: metricObject;
  metrics?: [metricObject];
}

interface metricObject {
  name: string;
  value: number;
}

const DEFAULT_URL = "https://hooq.tv";

const createSiteStats = async (url: string = DEFAULT_URL) => {
  const getStats = async (url: string) => {
    console.log("started");
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send("Performance.enable");
    await page.tracing.start({
      path: "./trace.json"
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
