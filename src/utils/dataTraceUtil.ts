import * as fs from "fs";
import * as util from "util";

const readFile = util.promisify(fs.readFile);

export const extractDataFromTrace = async (path: string, ...name: string[]) => {
  try {
    const file: any = await readFile(path);
    const traceJson = JSON.parse(file);
  } catch (err) {
    console.log(
      `An error occured trying to read trace file from: ${path}`,
      err
    );
  }
};
