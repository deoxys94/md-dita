"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conceptRenderer_1 = require("./renderer/conceptRenderer");
const fs_1 = require("fs");
const convertToConcept = new conceptRenderer_1.ConceptRenderer();
let fileContents = (0, fs_1.readFileSync)(`./sample.md`, { encoding: 'utf8', flag: 'r' });
fileContents = convertToConcept.toDitaConcept(fileContents);
(0, fs_1.writeFileSync)(`output.xml`, fileContents);
