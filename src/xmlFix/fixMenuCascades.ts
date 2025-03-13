import { simpleLogger } from "../md-dita";
/**
 * Converts menu cascade elements in an XML string by processing checkMenu elements.
 * 
 * @param xml - The input XML string to be processed
 * @param eventLogger - A simple logger for recording information and errors during processing
 * @returns The modified XML string with menu paths converted
 * 
 * @remarks
 * This function performs the following operations:
 * - Checks if the XML contains any checkMenu elements
 * - Extracts and processes each checkMenu element
 * - Handles menu paths containing '>' or '→' symbols
 * - Wraps menu path elements 
 * 
 * @throws {Error} Catches and logs any errors during XML processing
 * 
 * @example
 * ```typescript
 * const inputXml = '<checkMenu>File > New > Project</checkMenu>';
 * const processedXml = fixMenuCascadeElements(inputXml, logger);
 * ```
 */

export const fixMenuCascadeElements = (xml: string, eventLogger: simpleLogger) =>
{
  try
  {
    let auxArray: string[] = [];
    let tempReplacement: string;

    // Check if the XML contains <checkMenu> elements.
    if (!/<checkMenu>(.|\n)*?<\/checkMenu>/g.test(xml))
    {
      eventLogger.logInfo(`No menu paths found.`);
      return xml; // Return the original XML if no menu paths are found.
    }

    // Extract all <checkMenu> elements into an array.
    auxArray = [...xml.match(/<checkMenu>(.|\n)*?<\/checkMenu>/g)];

    for (let element of auxArray)
    {
      // Remove temporary tags from the element.
      tempReplacement = element
        .replace(/<checkMenu>/, ``)
        .replace(/<\/checkMenu>/, ``)
        .replace(/<codeph>/, ``)
        .replace(/<\/codeph>/, ``);

      // Check if the element contains '>' or arrow symbols and process accordingly.
      if (element.includes(`&gt;`) || element.includes(`→`))
      {
        // Split the string by '>' or arrow symbol and wrap each part with <uicontrol>.
        let parts = element.includes(`&gt;`)
          ? tempReplacement.split("&gt;")
          : element.split(`→`);
        let wrappedParts = parts.map(
          (part) => `<uicontrol>${part}</uicontrol>`,
        );
        tempReplacement = wrappedParts.join("");
        tempReplacement = `<menucascade>${tempReplacement}</menucascade>`;
      } else
      {
        // If no symbols are found, wrap the entire element with <uicontrol>.
        tempReplacement = `<uicontrol>${tempReplacement}</uicontrol>`;
      }

      // Replace the original element in XML with the processed one.
      xml = xml.replace(element, tempReplacement);
    }

    // Log the successful conversion of menu paths.
    eventLogger.logInfo(`Converted menu paths to <menucascade> elements.`);
    return xml;
  } catch (error)
  {
    // Log an error if the conversion fails.
    eventLogger.logError(
      `Unable to convert menu paths to menu cascades. Verify the resulting file afterwards. (Error Code: 302)\n${error}`,
    );
    return xml;
  }
};
