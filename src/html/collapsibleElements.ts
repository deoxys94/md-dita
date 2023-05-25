export const fixCollapsibleElements = (markdown: string, eventLogger: any) =>
{
    try {
        const findCollapsibleElements = /\?\?\?\s"[^\n]*/g;

        if (!findCollapsibleElements.test(markdown))
        {
            eventLogger.logInfo(`No collapsible elements detected.`);
            return markdown;
        }
    
        eventLogger.logWarning(`Collapsible elements detected. The script will remove whitespace and indentation from the file. If the file contains codeblocks, verify the indentation afterwards.`);
    
        let lines = markdown.split('\n');
        let tempReplacement: string = ``;
    
        for (let element of lines)
            tempReplacement = tempReplacement + `${element.trim()}\n`; // Removing whitespace
    
        markdown = tempReplacement;
    
        let auxArray = [...markdown.match(findCollapsibleElements)]
    
        for (let element of auxArray)
        {
    
            if (/\*\*/.test(element))
            {
                tempReplacement = element.replace(/\?\?\?\s"\*\*/, `## `);
                tempReplacement = tempReplacement.replace(/"/, ``);
                tempReplacement = tempReplacement.replace(/\*\*/, ``);
            } else
            {
                tempReplacement = element.replace(/\?\?\?\s"/, `## `);
                tempReplacement = tempReplacement.replace(/"/, ``);
            }
    
            markdown = markdown.replace(element, tempReplacement);
        }
    
        eventLogger.logInfo(`Changed collapsible elements to <title> elements.`);

        return markdown;
    } catch (error) {
        eventLogger.logWarning(`Unable to convert collapsible elements. Verify the resulting DITA file afterwards. (Error code: 101)\n${error}`)
        return markdown;
    }
}
