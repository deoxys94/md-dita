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
        // Check if the markdown contains any content reuse directives
        if (!markdown.includes(`--8<--`))
        {
            eventLogger.logInfo(`No conrefs detected.`);
            return markdown;
        }

        let updatedString: string = "";
        let lines = markdown.split("\n");

        // Replace each conref with a draft comment
        for (let element of lines)
        {
            updatedString = element.includes("--8<--") ? updatedString + element.replace("--8<--", `<draft-comment>Import the contents of `).replace(`.md"`, `.md" here.</draft-comment>\n`) : updatedString + element + "\n";
        }

        eventLogger.logInfo(`Replaced all conrefs.`);
        return updatedString;
    } catch (error)
    {
        // Log a warning if an error occurs during the replacement process
        eventLogger.logWarning(`Unable to replace conrefs. Verify the resulting DITA file afterwards. (Error code: 102)\n${error}`);
        return markdown;
    }
}
