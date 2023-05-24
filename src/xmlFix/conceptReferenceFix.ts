import { fixSections } from "./sections";

export const fixConceptReference = (xml: string, type: number, eventLogger: any) =>
{
    try
    {
        xml = type === 1 ? fixSections(xml, 1, eventLogger) : fixSections(xml, 2, eventLogger);
        // Step 3: Extract id attribute value from concept tag
        let id = xml.match(/<title>(.*?)<\/title>/)[0];
        id = id.replace(`<title>`, ``).replace(`</title>`, ``);

        // Step 4: Modify and insert the id attribute value back into the concept tag
        id = id.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, "_");

        xml = type === 1 ? xml.replace(/<concept\s+.*?id=".*?"/, `<concept id="${id}"`) : xml.replace(/<reference\s+.*?id=".*?"/, `<reference id="${id}"`);

        eventLogger.logInfo(`Transformed markdown to DITA Concept/Reference.`);

        return xml;
    } catch (error)
    {
        eventLogger.logError(`Unable to convert document to DITA XML. Please try again. (Error Code: 301)\n${error}`);
        return ``;
    }
}