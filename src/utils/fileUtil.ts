import * as util from "util";
import * as fs from "fs";
import { AUDIT_DIR } from "../enums/Constants";

const mkdir = util.promisify(fs.mkdir);
const dirExists = util.promisify(fs.exists);
const writeFile = util.promisify(fs.writeFile);

export const createPath = (fileName: string) => `${AUDIT_DIR}${fileName}`;

export const checkDirExists = async (dir: string = AUDIT_DIR) => {
  const doesAuditExist = await dirExists(AUDIT_DIR);
  if (!doesAuditExist) {
    await mkdir(AUDIT_DIR);
  }
  return true;
};

export const writeToFile = (path: string, file: any) =>
  writeFile(createPath(path), file);
