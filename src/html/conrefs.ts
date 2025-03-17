import { simpleLogger } from "../md-dita";

/**
 * Finds content reuse directives in the given markdown and marks them with draft comments 
 * for further processing.
 *
 * @param markdown - The markdown text that may contain conrefs.
 * @param eventLogger - An object used for logging events and errors.
 * @returns - The modified markdown with conrefs replaced by draft comments.
 */
export const findConrefs = (markdown: string, eventLogger: simpleLogger): string =>
{
    eventLogger.logInfo(`Finding and replacing content re-use directives`);
    try
    {
        // Regular expression to find content reuse directives in the markdown
        const regexConref = /--8<--\s"(.*?)"/g;
        const styleConref = /\{\:\s*style=\"[^\"]*\"\s*\}/g
        // Check if the markdown contains any content reuse directives
        if (!regexConref.test(markdown))
        {
            eventLogger.logInfo(`No conrefs detected.`);
            return markdown;
        }

        let tempReplacement: string;
        // Extract all conrefs from the markdown
        let auxArray = [...markdown.match(regexConref)!];

        // Replace each conref with a draft comment
        for (let element of auxArray)
        {
            tempReplacement = element.replace(/--8<--\s/, ``);
            markdown = markdown.replace(element, `<draft-comment>Import the contents of ${tempReplacement} here.</draft-comment>\n`);
        }

        // Remove the style attribute from the markdown
        markdown = markdown.replace(styleConref, ``);

        eventLogger.logInfo(`Replaced all conrefs.`);
        return markdown;
    } catch (error)
    {
        // Log a warning if an error occurs during the replacement process
        eventLogger.logWarning(`Unable to replace conrefs. Verify the resulting DITA file afterwards. (Error code: 102)\n${error}`);
        return markdown;
    }
}
