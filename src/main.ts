import { readFileSync, writeFileSync } from "fs";
import { MdDita } from "./md-dita";

let fileContents = readFileSync(`../../../CloudOneSamples/agent-compatibility.md`, { encoding: 'utf8', flag: 'r' });
const mdToDita = new MdDita(true);
console.log(typeof fileContents);
fileContents = mdToDita.mdToConcept(fileContents);

if(fileContents === ``)
  console.log(`It's empty!`);

writeFileSync(`output.xml`, fileContents);
