"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCascade = void 0;
const menuCascade = (xml) => {
    let auxArray = [];
    let tempReplacement;
    if (!/<checkMenu>(.|\n)*?<\/checkMenu>/g.test(xml)) {
        console.info(`[Info] No menu paths found.`);
        return xml;
    }
    auxArray = [...xml.match(/<checkMenu>(.|\n)*?<\/checkMenu>/g)];
    for (let element of auxArray) {
        tempReplacement = element.replace(/<checkMenu>/, ``)
            .replace(/<\/checkMenu>/, ``)
            .replace(/<codeph>/, ``)
            .replace(/<\/codeph>/, ``);
        if (element.includes(`&gt;`)) {
            let parts = tempReplacement.split('&gt;');
            let wrappedParts = parts.map(part => `<uicontrol>${part}</uicontrol>`);
            tempReplacement = wrappedParts.join('');
            tempReplacement = `<menucascade>${tempReplacement}</menucascade>`;
        }
        else {
            tempReplacement = `<term>${tempReplacement}</term>`;
        }
        xml = xml.replace(element, tempReplacement);
    }
    console.info(`[Info] Converted menu paths to <menucascade> elements.`);
    return xml;
};
exports.menuCascade = menuCascade;
