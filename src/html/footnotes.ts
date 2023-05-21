export const fixFootnotes = (markdown: string, eventLogger: any) =>
{
    try {
        const findFootnotes = /(\*\*Footnotes:\*\*)([\s\S]*)/;

        if (!findFootnotes.test(markdown))
        {
            console.info(`[Info] No footnotes detected.`);
            return markdown;
        }
    
        let tempReplacement: string;
        let auxArray = [...markdown.match(findFootnotes)];
    
        markdown = markdown.replace(auxArray[0], `<!-- Fix footnotes manually \n ${tempReplacement} -->\n`);
    
        console.info(`[Info] Commented out footnotes.`);
        return markdown;
    } catch (error) {
        eventLogger.logWarning(`Unable to comment out footnotes. Verify the resulting DITA file afterwards. (Error Code: C3)\n${error}`);
    }
}