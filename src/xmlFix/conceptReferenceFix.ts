import { fixSections } from "./sections";
import * as cheerio from 'cheerio';

export const fixConceptReference = (xml: string, type: number, eventLogger: any) =>
{
    eventLogger.logInfo(`Fixing concept/reference elements`);
    try
    {
        // Apply fixSections based on type (keeping this unchanged)
        xml = type === 1 ? fixSections(xml, 1, eventLogger) : fixSections(xml, 2, eventLogger);

        // Load the XML into Cheerio
        const $ = cheerio.load(xml, {
            xml: true,
        });

        // Step 3: Extract the first title element's content
        const titleContent = $('title').first().text();

        // Step 4: Modify and create ID from title
        const id = titleContent.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, "_").toLowerCase();

        // Update the ID attribute based on type
        if (type === 1)
        {
            // For concept elements that already have an id attribute
            $('concept[id]').first().attr('id', id);
        } else
        {
            // For reference elements that already have an id attribute
            $('reference[id]').first().attr('id', id);
        }

        eventLogger.logInfo(`Transformed markdown to DITA Concept/Reference.`);

        return $.html();
    } catch (error)
    {
        eventLogger.logError(`Unable to convert document to DITA XML. Please try again. (Error Code: 301)\n${error}`);
        return ``;
    }
}