"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixCollapsibleElements = void 0;
const fixCollapsibleElements = (markdown) => {
    const findCollapsibleElements = /\?\?\?\s"[^\n]*/g;
    if (!findCollapsibleElements.test(markdown)) {
        console.info(`[Info] No collapsible elements detected.`);
        return markdown;
    }
    console.warn(`[Warning] Collapsible elements detected. The script will remove whitespace and indentation from the file. If the file contains codeblocks, verify the indentation afterwards.`);
    let lines = markdown.split('\n');
    let tempReplacement;
    for (let element of lines)
        tempReplacement = tempReplacement + `${element.trim()}\n`;
    markdown = tempReplacement;
    let auxArray = [...markdown.match(findCollapsibleElements)];
    for (let element of auxArray) {
        if (/\*\*/.test(element)) {
            tempReplacement = element.replace(/\?\?\?\s"\*\*/, `## `);
            tempReplacement = tempReplacement.replace(/"/, ``);
            tempReplacement = tempReplacement.replace(/\*\*/, ``);
        }
        else {
            tempReplacement = element.replace(/\?\?\?\s"/, `## `);
            tempReplacement = tempReplacement.replace(/"/, ``);
        }
        markdown = markdown.replace(element, tempReplacement);
    }
    console.info(`[Info] Changed collapsible elements to <title> elements.`);
    return markdown;
};
exports.fixCollapsibleElements = fixCollapsibleElements;
