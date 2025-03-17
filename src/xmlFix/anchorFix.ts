import * as cheerio from 'cheerio';

export const fixAnchorIdForTitles = (xml: string, eventLogger: any): string =>
{
    eventLogger.logInfo(`Fixing anchor IDs for titles`);
    // Regular expression to match text enclosed by curly braces
    // and preceded by a hash symbol (e.g. {#anchor-id}).
    const anchorIdPattern: RegExp = /\{(#.*?)\}/;

    // Log a message to indicate that the function is starting.
    eventLogger.logInfo(`Adding IDs.`);

    // Load the XML into Cheerio.
    const $ = cheerio.load(xml, {
        // Enable XML mode.
        xml: true,
    });

    // Find all <title> elements in the XML.
    $('title').each((_, element) =>
    {
        // Get the text content of the current <title> element.
        const titleContent = $(element).text();

        // Use the regular expression to find the anchor ID in the title content.
        const anchorIdMatch = titleContent.match(anchorIdPattern);

        // If no anchor ID was found, skip to the next iteration of the loop.
        if (!anchorIdMatch) return;

        // Extract the anchor ID from the match result.
        const anchorID = anchorIdMatch[0].replace('{', '').replace('}', '');

        // Set the ID attribute on the current <title> element.
        // We remove the '#' symbol from the anchor ID because it's not valid in an XML ID attribute.
        $(element).attr('id', anchorID.replace('#', ''));

        // Remove the anchor ID from the title content.
        // We use the same regular expression to replace the anchor ID with an empty string.
        const newContent = titleContent.replace(anchorIdPattern, '');
        // Update the text content of the <title> element.
        $(element).text(newContent);
    });

    // Return the modified XML as a string.
    return $.html();
};
