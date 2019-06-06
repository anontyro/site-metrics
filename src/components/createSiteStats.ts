import * as puppeteer from 'puppeteer';

const DEFAULT_URL = 'https://hooq.tv';

const createSiteStats = async (url: string = DEFAULT_URL) => {
  const getStats = async (url: string) => {
    console.log('started');
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');
    await page.tracing.start({
      path: './trace.json',
    });

    await page.goto(url);
    await page.waitFor(5000);
    await page.tracing.stop();
    const metrics = await client.send('Performance.getMetrics');

    return metrics;
  };

  const browser = await puppeteer.launch({
    headless: false,
  });

  const stats = await getStats(url);
  console.log(stats);

  await browser.close();
};

export default createSiteStats;
