export const generateSubTasks = (xml: string, eventLogger: any) => 
{
    let taskBody = xml.match(/<taskbody[\s\S]+?<\/taskbody>/)[0]; // Get all the content inside the taskbody element
    taskBody = taskBody.replace(/<taskbody>/, ``); // Delete the taskbody tags
    taskBody = taskBody.replace(/<\/taskbody>/, ``);
    let subTasks = [];

    if (!/<title>/g.test(taskBody)) 
    { // If there are no subtasks, return
        eventLogger.logInfo(`No subtasks detected.`);
        return [];
    }

    if (/(<title>)([\s\S]*?)(?=<title>)/g.test(taskBody)) 
    { // Verify if there are more than 1 subtasks
        subTasks = taskBody.match(/(<title>)([\s\S]*?)(?=<title>)/g); // Get all subtasks

        for (let element of subTasks)
            taskBody = taskBody.replace(element, ``); // Remove them from taskbody
    }

    subTasks.push(taskBody.match(/(<title>)[\s\S]*/)[0]); // Grab the "lonely" subtask

    eventLogger.logInfo(`Subtasks generated.`);
    return subTasks;
};