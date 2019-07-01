import createSiteStats from "./components/createSiteStats";
import * as path from "path";

global.appRoot = path.resolve(__dirname);

createSiteStats();
