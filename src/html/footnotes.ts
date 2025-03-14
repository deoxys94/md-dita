/**
 * Converts the footnotes section to a H2 markdown header
 * and removes any inline style attributes.
 * 
 * @param markdown - The input markdown text to be processed
 * @param eventLogger - A logging object used to record information and warnings
 * @returns The modified markdown with footnotes section reformatted
 */
export const fixFootnotes = (markdown: string, eventLogger: any) =>
{
    eventLogger.logInfo(`Converting footnotes`);
    try
    {
        // Regular expression to find the Footnotes section
        const findFootnotes = /(\*\*Footnotes:\*\*)([\s\S]*)/;

        // If no Footnotes section is found, log an info message and return original markdown
        if (!findFootnotes.test(markdown))
        {
            eventLogger.logInfo(`No footnotes detected.`);
            return markdown;
        }

        // Match and extract the entire Footnotes section
        let auxArray = [...markdown.match(findFootnotes)!];

        // Replace the Footnotes header from bold text to a markdown level 2 header
        markdown = markdown.replace(auxArray[0], auxArray[0].replace(/(\*\*Footnotes:\*\*)/, `## Footnotes: `));

        // Remove any inline style attributes (Which are not valid in DITA XML)
        markdown = markdown.replace(/{: style[\s\S]*?}/g, ``);

        // Log successful conversion
        eventLogger.logInfo(`Converted footnotes.`);
        return markdown;
    } catch (error)
    {
        // If an error occurs, log a warning and return the original markdown
        eventLogger.logWarning(`Unable to convert footnotes. Verify the resulting DITA file afterwards. (Error Code: 103)\n${error}`);
        return markdown;
    }
}