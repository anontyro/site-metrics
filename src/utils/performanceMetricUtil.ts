import { Metrics } from "../components/createSiteStats";

// const getTimeFromMetric = (metrics: any, name: string): any =>
//   metrics.metrics.find((metric: any) => metric.name === name).value * 1000;

const getTimeInMs = (siteMetrics: Metrics, name = "NavigationStart") => {
  const start = siteMetrics.metrics.find(x => x.name === name);
  return start.value * 1000;
};

export const extractDataFromMetrics = (
  siteMetrics: Metrics,
  ...dataValues: string[]
) => {
  const navStart = getTimeInMs(siteMetrics);
  let data = {};
  dataValues.forEach(name => {
    const value = getTimeInMs(siteMetrics, name) - navStart;
    data = { ...data, [name]: value.toFixed(3) };
  });
  return data;
};
