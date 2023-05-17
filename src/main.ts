import { ConceptRenderer } from "./renderer/conceptRenderer";
import { readFileSync, writeFileSync } from "fs";

const convertToConcept: ConceptRenderer = new ConceptRenderer();

let fileContents = readFileSync(`./sample.md`, { encoding: 'utf8', flag: 'r' });

fileContents = convertToConcept.toDitaConcept(fileContents);

writeFileSync(`output.xml`, fileContents);
