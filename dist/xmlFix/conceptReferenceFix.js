"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixConceptReference = void 0;
const fixConceptReference = (xml, type) => {
    let id = xml.match(/<title>(.*?)<\/title>/)[0];
    id = id.replace(`<title>`, ``).replace(`</title>`, ``);
    id = id.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, "_");
    xml = type === 1 ? xml.replace(/<concept\s+.*?id=".*?"/, `<concept id="${id}"`) : xml.replace(/<reference\s+.*?id=".*?"/, `<reference id="${id}"`);
    console.info(`[Info] Transformed markdown to DITA Concept/Reference.`);
    return xml;
};
exports.fixConceptReference = fixConceptReference;
