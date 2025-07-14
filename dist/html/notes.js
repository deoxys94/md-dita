"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNotes = void 0;
const convertNotes = (xml) => {
    let auxArray = [];
    let tempReplacement;
    if (!/<p[\s\S]+?<\/p>/g.test(xml)) {
        console.log("[Info] No notes found");
        return xml;
    }
    auxArray = [...xml.match(/<p[\s\S]+?<\/p>/g)];
    for (let element of auxArray) {
        if (!/{[\s\S]+?}/.test(element))
            continue;
        if (/.note/.test(element))
            xml = xml.replace(element, `<note>${element.replace(/{[\s\S]+?}/, ``)}</note>`);
        if (/.tip/.test(element))
            xml = xml.replace(element, `<note type="tip">${element.replace(/{[\s\S]+?}/, ``)}</note>`);
        if (/.warning/.test(element))
            xml = xml.replace(element, `<note type="warning">${element.replace(/{[\s\S]+?}/, ``)}</note>`);
    }
    console.info(`[Info] Converted notes to DITA XML notes.`);
    return xml;
};
exports.convertNotes = convertNotes;
