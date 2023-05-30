export const findConrefs = (markdown: string, eventLogger: any) =>
{
    try {
        const regexConref = /--8<--\s"(.*?)"/g;

        if (!regexConref.test(markdown))
        {
            eventLogger.logInfo(`No conrefs detected.`);
            return markdown;
        }
    
        let tempReplacement: string;
        let auxArray = [...markdown.match(regexConref)];
    
        for (let element of auxArray)
        {
            tempReplacement = element.replace(/--8<--\s/, ``);
            markdown = markdown.replace(element, `<draft-comment>Import the contents of ${tempReplacement} here.</draft-comment>\n`);
        }
    
        eventLogger.logInfo(`Replaced all conrefs.`);
        return markdown;
    } catch (error) {
        eventLogger.logWarning(`Unable to replace conrefs. Verify the resulting DITA file afterwards. (Error code: 102)\n${error}`);
        return markdown;
    }
}