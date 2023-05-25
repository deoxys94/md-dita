export const fixFootnotes = (markdown: string, eventLogger: any) =>
{
    try {
        const findFootnotes = /(\*\*Footnotes:\*\*)([\s\S]*)/;

        if (!findFootnotes.test(markdown))
        {
            eventLogger.logInfo(`No footnotes detected.`);
            return markdown;
        }
    
        let auxArray = [...markdown.match(findFootnotes)];
    
        markdown = markdown.replace(auxArray[0], auxArray[0].replace(/(\*\*Footnotes:\*\*)/, `## Footnotes: `));
    
        eventLogger.logInfo(`Converted footnotes.`);
        return markdown;
    } catch (error) {
        eventLogger.logWarning(`Unable to convert footnotes. Verify the resulting DITA file afterwards. (Error Code: 103)\n${error}`);
        return markdown;
    }
}
