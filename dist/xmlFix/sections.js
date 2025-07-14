"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixSections = void 0;
const generateSections = (xml, type) => {
    let conceptBody = type === 1 ? xml.match(/<conbody[\s\S]+?<\/conbody>/)[0] : xml.match(/<refbody[\s\S]+?<\/refbody>/)[0];
    conceptBody = type === 1 ? conceptBody.replace(/<conbody>/, ``) : conceptBody.replace(/<refbody>/, ``);
    conceptBody = type === 1 ? conceptBody.replace(/<\/conbody>/, ``) : conceptBody.replace(/<\/refbody>/, ``);
    let sections = [];
    if (!/<section>/g.test(conceptBody)) {
        console.info(`[Info] No sections detected.`);
        return [];
    }
    if (/(<section>)([\s\S]*?)(?=<section>)/g.test(conceptBody)) {
        sections = conceptBody.match(/(<section>)([\s\S]*?)(?=<section>)/g);
        for (let element of sections)
            conceptBody = conceptBody.replace(element, ``);
    }
    sections.push(conceptBody.match(/(<section>)[\s\S]*/)[0]);
    console.log(`[Info] sections generated.`);
    return sections;
};
const fixSections = (xml, type) => {
    let auxArray = generateSections(xml, type);
    let tempReplacement;
    if (auxArray.length === 0)
        return xml;
    for (let element of auxArray) {
        tempReplacement = `${element.replace(/<\/section>/, ``)}\n</section>\n`;
        xml = xml.replace(element, tempReplacement);
    }
    return xml;
};
exports.fixSections = fixSections;
