import { readFileSync, writeFileSync } from "fs";
import { MdDita } from "./md-dita";

let fileContents = readFileSync(`../../CloudOneSamples/agent-activation-failed.md`, { encoding: 'utf8', flag: 'r' });
const mdToDita = new MdDita();

fileContents = mdToDita.mdToConcept(fileContents);

let logs = mdToDita.getLogs()

console.log(logs);
console.log(logs.length);

writeFileSync(`output.xml`, fileContents);