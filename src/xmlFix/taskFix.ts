import { generateSubTasks } from "./subtasks";

export const fixTask = (xml: string, eventLogger: any) =>
{
    try 
    {
        let id = xml.match(/<title>(.*?)<\/title>/)[0];

        id = id.replace(`<title>`, ``).replace(`</title>`, ``);
        id = id.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, "_"); // Step 4: Modify and insert the id attribute value back into the task tag
        xml = xml.replace(/<task\s+.*?id=".*?"/, `<task id="${id}"`);
    
        let auxArray = generateSubTasks(xml, eventLogger);
        let tempReplacement: string;
    
        if (auxArray.length > 0)
        {
            let i = 1;
            for (let element of auxArray)
            {
                xml = xml.replace(element, ``);
                tempReplacement = tempReplacement + `<task id="sub_task_${i}">\n${element.replace(/<\/title>/, `</title>\n<taskbody>`)}\n</taskbody>\n</task>\n`;
                i++;
            }
    
            xml = xml.replace(`</taskbody>`, `</taskbody>\n${tempReplacement}`);
        }
    
        // Add missing context and postreq elements to each taskbody
        auxArray = [...xml.match(/(<taskbody>)([\s\S]*?)(<\/taskbody>)/g)];
    
        for (let element of auxArray)
        {
            if (!/<steps>/.test(element))
            { // Verify if there are any <Steps> elements
                tempReplacement = element.replace(/<taskbody>/, `<taskbody>\n<context>`)
                    .replace(/<\/taskbody>/, `</context>\n</taskbody>`); // If not, only add <context> tags
                xml = xml.replace(element, tempReplacement);
                continue;
            }
    
            tempReplacement = element.replace(/<taskbody>/, `<taskbody>\n<context>`) // Add context
                .replace(/<steps>/, `</context>\n<steps>\n`)
                .replace(/<\/steps>/, `</steps>\n<postreq>\n`) // Add postreq
                .replace(/<\/taskbody>/, `</postreq>\n</taskbody>`);
            xml = xml.replace(element, tempReplacement);
        }
    
        if (/(<step>)([\s\S]*?)(<\/step>)/g.test(xml))
        {
            auxArray = [...xml.match(/(<step>)([\s\S]*?)(<\/step>)/g)];
    
            for (let element of auxArray)
            {
                if (/<p>/.test(element))
                {
                    tempReplacement = element.replace(/<p>/, `<cmd>`)
                        .replace(/<\/p>/, `</cmd>`);
                    tempReplacement = tempReplacement.replace(/<\/cmd>/, `</cmd>\n<info>\n`)
                        .replace(/<\/step>/, `\n</info>\n<\/step>\n`)
                } else
                {
                    tempReplacement = element.replace(/<step>/, `<step>\n<cmd>`)
                        .replace(/<\/step>/, `</cmd>\n</step>`);
                }
                xml = xml.replace(element, tempReplacement);
            }
        }
    
        return xml;    
    } catch (error) {
        eventLogger.logError(`Unable to convert document to DITA XML. Please try again. (Error Code: 303)\n${error}`);
        return ``;
    }
};