import { readFileSync, writeFileSync } from "fs";
import { MdDita } from "./md-dita";

let fileContents = readFileSync(`../../CloudOneSamples/agent-activation-failed.md`, { encoding: 'utf8', flag: 'r' });
const mdToDita = new MdDita();

writeFileSync(`output.xml`, mdToDita.mdToConcept(fileContents));