"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFix = void 0;
const subtasks_1 = require("./subtasks");
const taskFix = (xml) => {
    let id = xml.match(/<title>(.*?)<\/title>/)[0];
    id = id.replace(`<title>`, ``).replace(`</title>`, ``);
    id = id.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, "_");
    xml = xml.replace(/<task\s+.*?id=".*?"/, `<task id="${id}"`);
    let auxArray = (0, subtasks_1.generateSubTasks)(xml);
    let tempReplacement;
    if (auxArray.length > 0) {
        let i = 1;
        for (let element of auxArray) {
            xml = xml.replace(element, ``);
            tempReplacement = tempReplacement + `<task id="sub_task_${i}">\n${element.replace(/<\/title>/, `</title>\n<taskbody>`)}\n</taskbody>\n</task>\n`;
            i++;
        }
        xml = xml.replace(`</taskbody>`, `</taskbody>\n${tempReplacement}`);
    }
    auxArray = [...xml.match(/(<taskbody>)([\s\S]*?)(<\/taskbody>)/g)];
    for (let element of auxArray) {
        if (!/<steps>/.test(element)) {
            tempReplacement = element.replace(/<taskbody>/, `<taskbody>\n<context>`)
                .replace(/<\/taskbody>/, `</context>\n</taskbody>`);
            xml = xml.replace(element, tempReplacement);
            continue;
        }
        tempReplacement = element.replace(/<taskbody>/, `<taskbody>\n<context>`)
            .replace(/<steps>/, `</context>\n<steps>\n`)
            .replace(/<\/steps>/, `</steps>\n<postreq>\n`)
            .replace(/<\/taskbody>/, `</postreq>\n</taskbody>`);
        xml = xml.replace(element, tempReplacement);
    }
    if (/(<step>)([\s\S]*?)(<\/step>)/g.test(xml)) {
        auxArray = [...xml.match(/(<step>)([\s\S]*?)(<\/step>)/g)];
        for (let element of auxArray) {
            if (/<p>/.test(element)) {
                tempReplacement = element.replace(/<p>/, `<cmd>`)
                    .replace(/<\/p>/, `</cmd>`);
                tempReplacement = tempReplacement.replace(/<\/cmd>/, `</cmd>\n<info>\n`)
                    .replace(/<\/step>/, `\n</info>\n<\/step>\n`);
            }
            else {
                tempReplacement = element.replace(/<step>/, `<step>\n<cmd>`)
                    .replace(/<\/step>/, `</cmd>\n</step>`);
            }
            xml = xml.replace(element, tempReplacement);
        }
    }
    return xml;
};
exports.taskFix = taskFix;
