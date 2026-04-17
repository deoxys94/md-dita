const generateSubTasks = (xml: string, eventLogger: any): string[] => 
{
    const taskBodyPattern: RegExp = /<taskbody[\s\S]+?<\/taskbody>/;
    const subtaskPattern: RegExp = /(<title>)([\s\S]*?)(?=<title>)/g
    const finalSubtaskPattern: RegExp = /(<title>)[\s\S]*/;

    const taskBodyMatch = xml.match(taskBodyPattern);
    if (!taskBodyMatch)
    {
        eventLogger.logInfo(`No task body found.`);
        return [];
    }
    let taskBody = taskBodyMatch[0]; // Get all the content inside the taskbody element
    let subTasks: string[] = [];

    taskBody = taskBody.replace("<taskbody>", ``); // Delete the taskbody tags
    taskBody = taskBody.replace("<\/taskbody>", ``);

    if (!taskBody.includes("<title>")) 
    { // If there are no subtasks, return
        eventLogger.logInfo(`No subtasks detected.`);
        return [];
    }

    if (subtaskPattern.test(taskBody)) 
    { // Verify if there are more than 1 subtasks
        subTasks = taskBody.match(subtaskPattern)!; // Get all subtasks

        for (let element of subTasks)
            taskBody = taskBody.replace(element, ``); // Remove them from taskbody
    }

    subTasks.push(taskBody.match(finalSubtaskPattern)![0]); // Grab the "lonely" subtask

    eventLogger.logInfo(`Subtasks generated.`);
    return subTasks;
};

export const fixSubtasks = (xml: string, eventLogger: any): string => 
{
    try
    {
        eventLogger.logInfo(`Fixing subtasks`);
        let subtaskArray = generateSubTasks(xml, eventLogger);
        let tempReplacement: string = ``;
        let i = 1;

        if (subtaskArray.length === 0)
            return xml;

        for (let element of subtaskArray)
        {
            xml = xml.replace(element, ``); // Remove original element
            tempReplacement = tempReplacement + `
<task id="sub_task_${i}">
${element.replace("<\/title>", `</title>
<taskbody>`)}
</taskbody>
</task>`;
            i++;
        }

        xml = xml.replace(`</taskbody>`, `</taskbody>\n${tempReplacement}`);

        return xml;
    } catch (error)
    {
        eventLogger.logError(`Unable to fix subtasks. (Error code: 204)\n${error}`);
        return ``;
    }
}