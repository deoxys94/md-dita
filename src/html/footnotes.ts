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
    
        markdown = markdown.replace(auxArray[0], `<!-- Fix footnotes manually \n ${auxArray[0].replace(/<!--/g, ``).replace(/-->/g, ``)} -->\n`);
    
        eventLogger.logInfo(`Commented out footnotes.`);
        return markdown;
    } catch (error) {
        eventLogger.logWarning(`Unable to comment out footnotes. Verify the resulting DITA file afterwards. (Error Code: 103)\n${error}`);
        return markdown;
    }
}