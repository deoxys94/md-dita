"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixFootnotes = void 0;
const fixFootnotes = (markdown) => {
    const findFootnotes = /(\*\*Footnotes:\*\*)([\s\S]*)/;
    if (!findFootnotes.test(markdown)) {
        console.info(`[Info] No footnotes detected.`);
        return markdown;
    }
    let tempReplacement;
    let auxArray = [...markdown.match(findFootnotes)];
    markdown = markdown.replace(auxArray[0], `<!-- Fix footnotes manually \n ${tempReplacement} -->\n`);
    console.info(`[Info] Commented out footnotes.`);
    return markdown;
};
exports.fixFootnotes = fixFootnotes;
