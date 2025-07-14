"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSubTasks = void 0;
const generateSubTasks = (xml) => {
    let taskBody = xml.match(/<taskbody[\s\S]+?<\/taskbody>/)[0];
    taskBody = taskBody.replace(/<taskbody>/, ``);
    taskBody = taskBody.replace(/<\/taskbody>/, ``);
    let subTasks = [];
    if (!/<title>/g.test(taskBody)) {
        console.log(`%c[Info] No subtasks detected.`, `color:green`);
        return [];
    }
    if (/(<title>)([\s\S]*?)(?=<title>)/g.test(taskBody)) {
        subTasks = taskBody.match(/(<title>)([\s\S]*?)(?=<title>)/g);
        for (let element of subTasks)
            taskBody = taskBody.replace(element, ``);
    }
    subTasks.push(taskBody.match(/(<title>)[\s\S]*/)[0]);
    console.log(`%c[Info] Subtasks generated.`, `color:green`);
    return subTasks;
};
exports.generateSubTasks = generateSubTasks;
